const antideleteSettings = {}; // In-memory database to store antidelete settings for each chat
const messageStore = new Map(); // Store recent messages to recover deleted ones

export const handleAntidelete = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
    try {
        const PREFIX = /^[\\/!#.]/;
        const isCOMMAND = (body) => PREFIX.test(body);
        const prefixMatch = isCOMMAND(m.message?.conversation || '') ? (m.message?.conversation || '').match(PREFIX) : null;
        const prefix = prefixMatch ? prefixMatch[0] : '/';
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

        // Handle antidelete command
        if (cmd === 'antidelete') {
            const args = body.slice(prefix.length + cmd.length).trim().split(/\s+/);
            const action = args[0] ? args[0].toLowerCase() : '';

            if (!m.key.remoteJid.endsWith('@g.us')) {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: 'This command can only be used in groups.' 
                }, { quoted: m });
                return;
            }

            if (!isBotAdmins) {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: 'The bot needs to be an admin to manage the antidelete feature.' 
                }, { quoted: m });
                return;
            }

            if (action === 'on') {
                if (isAdmins) {
                    antideleteSettings[m.key.remoteJid] = true;
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Antidelete feature has been enabled for this chat. Deleted messages will be recovered.' 
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Only admins can enable the antidelete feature.' 
                    }, { quoted: m });
                }
                return;
            }

            if (action === 'off') {
                if (isAdmins) {
                    antideleteSettings[m.key.remoteJid] = false;
                    // Clear stored messages for this chat when turning off
                    for (const [key] of messageStore.entries()) {
                        if (key.startsWith(m.key.remoteJid)) {
                            messageStore.delete(key);
                        }
                    }
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Antidelete feature has been disabled for this chat.' 
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Only admins can disable the antidelete feature.' 
                    }, { quoted: m });
                }
                return;
            }

            await sock.sendMessage(m.key.remoteJid, { 
                text: `Usage: ${prefix + cmd} on\n${prefix + cmd} off` 
            }, { quoted: m });
            return;
        }

        // Store messages for potential recovery
        if (antideleteSettings[m.key.remoteJid] && m.key.remoteJid.endsWith('@g.us')) {
            storeMessage(m);
        }
    } catch (error) {
        logger.error('Error in antidelete handler:', error);
        
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        if (body && body.startsWith(prefix)) {
            await sock.sendMessage(m.key.remoteJid, { 
                text: `An error occurred: ${error.message}` 
            }, { quoted: m });
        }
    }
};

// Function to store messages
const storeMessage = (m) => {
    try {
        if (!m.key?.id || !m.key.remoteJid) return;
        
        const messageKey = `${m.key.remoteJid}_${m.key.id}`;
        const messageData = {
            key: { ...m.key },
            message: { ...m.message },
            timestamp: Date.now(),
            participant: m.key.participant || m.participant,
            pushName: m.pushName || 'Unknown'
        };

        // Store message with timestamp
        messageStore.set(messageKey, messageData);

        // Clean up old messages (older than 1 hour)
        cleanupOldMessages();
    } catch (error) {
        console.error('Error storing message:', error);
    }
};

// Clean up messages older than 1 hour
const cleanupOldMessages = () => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, data] of messageStore.entries()) {
        if (now - data.timestamp > oneHour) {
            messageStore.delete(key);
        }
    }
};

// Handle message deletions
export const handleMessageDelete = async (events, sock, logger) => {
    try {
        for (const event of events) {
            if (event.type === 'message' && event.operation === 'delete') {
                const deletedKey = event.key;
                
                if (!deletedKey.remoteJid.endsWith('@g.us')) return; // Only groups
                
                // Check if antidelete is enabled for this chat
                if (!antideleteSettings[deletedKey.remoteJid]) return;

                const messageKey = `${deletedKey.remoteJid}_${deletedKey.id}`;
                const originalMessage = messageStore.get(messageKey);

                if (originalMessage) {
                    await recoverDeletedMessage(originalMessage, sock, logger);
                    // Remove from store after recovery
                    messageStore.delete(messageKey);
                }
            }
        }
    } catch (error) {
        logger.error('Error handling message delete:', error);
    }
};

// Recover deleted message
const recoverDeletedMessage = async (originalMessage, sock, logger) => {
    try {
        const { key, message, pushName, participant } = originalMessage;
        const senderName = pushName || participant?.split('@')[0] || 'Unknown';
        
        let recoveryText = `🗑️ *Message Deleted Recovery*\n\n`;
        recoveryText += `👤 *Sender:* ${senderName}\n`;
        recoveryText += `⏰ *Time:* ${new Date(originalMessage.timestamp).toLocaleString()}\n\n`;

        // Handle different message types
        if (message.conversation) {
            // Text message
            recoveryText += `💬 *Message:* ${message.conversation}`;
        } else if (message.extendedTextMessage) {
            // Extended text message
            const extendedText = message.extendedTextMessage.text;
            recoveryText += `💬 *Message:* ${extendedText}`;
            
            // Check if it's a quoted message
            if (message.extendedTextMessage.contextInfo?.quotedMessage) {
                recoveryText += `\n\n🔁 *Quoted a message*`;
            }
        } else if (message.imageMessage) {
            // Image message
            recoveryText += `🖼️ *Image Message*`;
            if (message.imageMessage.caption) {
                recoveryText += `\n📝 *Caption:* ${message.imageMessage.caption}`;
            }
        } else if (message.videoMessage) {
            // Video message
            recoveryText += `🎥 *Video Message*`;
            if (message.videoMessage.caption) {
                recoveryText += `\n📝 *Caption:* ${message.videoMessage.caption}`;
            }
        } else if (message.audioMessage) {
            // Audio message
            recoveryText += `🎵 *Audio Message*`;
        } else if (message.documentMessage) {
            // Document message
            recoveryText += `📄 *Document:* ${message.documentMessage.fileName || 'Unknown file'}`;
        } else if (message.stickerMessage) {
            // Sticker message
            recoveryText += `😊 *Sticker Message*`;
        } else {
            // Other message types
            recoveryText += `📦 *Unsupported Message Type*`;
        }

        // Send recovery message
        await sock.sendMessage(key.remoteJid, {
            text: recoveryText,
            mentions: participant ? [participant] : []
        });

        logger.info(`Recovered deleted message from ${senderName} in ${key.remoteJid}`);

    } catch (error) {
        logger.error('Error recovering deleted message:', error);
    }
};

// Get stored messages count for a chat (for debugging)
export const getStoredMessagesCount = (chatJid) => {
    let count = 0;
    for (const key of messageStore.keys()) {
        if (key.startsWith(chatJid)) {
            count++;
        }
    }
    return count;
};
