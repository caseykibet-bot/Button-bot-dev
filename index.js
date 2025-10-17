import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import { File } from 'megajs';
import NodeCache from 'node-cache';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const prefix = process.env.PREFIX || config.PREFIX;
const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({ level: 'silent' });
const logger = MAIN_LOGGER.child({});
logger.level = "silent";

const msgRetryCounterCache = new NodeCache();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Antilink and Antidelete storage
const antilinkSettings = {};
const antideleteSettings = {};
const messageStore = new Map();

// Helper functions to check admin status
async function checkBotAdmin(sock, chatJid) {
    try {
        if (!chatJid.endsWith('@g.us')) return false;
        const groupMetadata = await sock.groupMetadata(chatJid);
        const botJid = sock.authState.creds.me?.id;
        return groupMetadata.participants.find(p => p.id === botJid)?.admin !== undefined;
    } catch (error) {
        return false;
    }
}

async function checkIsAdmin(sock, chatJid, participant) {
    try {
        if (!chatJid.endsWith('@g.us')) return false;
        const groupMetadata = await sock.groupMetadata(chatJid);
        return groupMetadata.participants.find(p => p.id === participant)?.admin !== undefined;
    } catch (error) {
        return false;
    }
}

// Antilink Handler
async function handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator) {
    try {
        const PREFIX = /^[\\/!#.]/;
        const isCOMMAND = (body) => PREFIX.test(body);
        const prefixMatch = isCOMMAND(m.message?.conversation || '') ? (m.message?.conversation || '').match(PREFIX) : null;
        const prefix = prefixMatch ? prefixMatch[0] : '/';
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

        // Handle antilink command
        if (cmd === 'antilink') {
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
                    text: 'The bot needs to be an admin to manage the antilink feature.' 
                }, { quoted: m });
                return;
            }

            if (action === 'on') {
                if (isAdmins) {
                    antilinkSettings[m.key.remoteJid] = true;
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Antilink feature has been enabled for this chat.' 
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Only admins can enable the antilink feature.' 
                    }, { quoted: m });
                }
                return;
            }

            if (action === 'off') {
                if (isAdmins) {
                    antilinkSettings[m.key.remoteJid] = false;
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Antilink feature has been disabled for this chat.' 
                    }, { quoted: m });
                } else {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: 'Only admins can disable the antilink feature.' 
                    }, { quoted: m });
                }
                return;
            }

            await sock.sendMessage(m.key.remoteJid, { 
                text: `Usage: ${prefix + cmd} on\n ${prefix + cmd} off` 
            }, { quoted: m });
            return;
        }

        // Handle link detection
        if (antilinkSettings[m.key.remoteJid] && m.key.remoteJid.endsWith('@g.us')) {
            const messageText = body;
            
            if (messageText && messageText.match(/(chat\.whatsapp\.com\/|https?:\/\/)/gi)) {
                if (!isBotAdmins) {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: `The bot needs to be an admin to remove links.` 
                    });
                    return;
                }

                // Get group invite code
                let groupInviteCode;
                try {
                    groupInviteCode = await sock.groupInviteCode(m.key.remoteJid);
                    const gclink = `https://chat.whatsapp.com/${groupInviteCode}`;
                    const isLinkThisGc = new RegExp(gclink, 'i');
                    const isgclink = isLinkThisGc.test(messageText);

                    if (isgclink) {
                        await sock.sendMessage(m.key.remoteJid, { 
                            text: `The link you shared is for this group, so you won't be removed.` 
                        });
                        return;
                    }
                } catch (error) {
                    logger.error('Error getting group invite code:', error);
                    // Continue with link removal even if we can't get invite code
                }

                if (isAdmins) {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: `Admins are allowed to share links.` 
                    });
                    return;
                }

                if (isCreator) {
                    await sock.sendMessage(m.key.remoteJid, { 
                        text: `The owner is allowed to share links.` 
                    });
                    return;
                }

                // Get participant ID
                const participant = m.key.participant || m.participant;
                if (!participant) {
                    logger.error('No participant found in message');
                    return;
                }

                // Send warning message first
                await sock.sendMessage(m.key.remoteJid, {
                    text: `\`\`\`「 Group Link Detected 」\`\`\`\n\n@${participant.split("@")[0]}, please do not share group links in this group.`,
                    mentions: [participant]
                }, { quoted: m });

                // Delete the link message
                try {
                    await sock.sendMessage(m.key.remoteJid, {
                        delete: {
                            id: m.key.id,
                            remoteJid: m.key.remoteJid,
                            fromMe: false,
                            participant: participant
                        }
                    });
                } catch (deleteError) {
                    logger.error('Error deleting message:', deleteError);
                }

                // Wait for a short duration before kicking
                setTimeout(async () => {
                    try {
                        await sock.groupParticipantsUpdate(
                            m.key.remoteJid, 
                            [participant], 
                            'remove'
                        );
                    } catch (kickError) {
                        logger.error('Error removing participant:', kickError);
                        await sock.sendMessage(m.key.remoteJid, { 
                            text: `Failed to remove user: ${kickError.message}` 
                        });
                    }
                }, 5000); // 5 seconds delay before kick
            }
        }
    } catch (error) {
        logger.error('Error in antilink handler:', error);
        
        // Send error message if it's a command
        const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
        if (body && body.startsWith(prefix)) {
            await sock.sendMessage(m.key.remoteJid, { 
                text: `An error occurred: ${error.message}` 
            }, { quoted: m });
        }
    }
}

// Antidelete Handler
async function handleAntidelete(m, sock, logger, isBotAdmins, isAdmins, isCreator) {
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
}

// Store messages for antidelete
function storeMessage(m) {
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
}

// Clean up old messages
function cleanupOldMessages() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, data] of messageStore.entries()) {
        if (now - data.timestamp > oneHour) {
            messageStore.delete(key);
        }
    }
}

// Handle message deletions for antidelete
async function handleMessageDelete(events, sock, logger) {
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
}

// Recover deleted message
async function recoverDeletedMessage(originalMessage, sock, logger) {
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
}

async function downloadSessionData() {
    try {
        if (!config.SESSION_ID) {
            return false;
        }

        const sessdata = config.SESSION_ID.split("IK~")[1];

        if (!sessdata || !sessdata.includes("#")) {
            return false;
        }

        const [fileID, decryptKey] = sessdata.split("#");

        try {
            const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);

            const data = await new Promise((resolve, reject) => {
                file.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });

            await fs.promises.writeFile(credsPath, data);
            return true;
        } catch (error) {
            return false;
        }
    } catch (error) {
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["JINX-MD", "safari", "3.3"],
            auth: state,
            msgRetryCounterCache,
            getMessage: async (key) => {
                return {};
            }
        });

        Matrix.ev.on('connection.update', async (update) => {
            try {
                const { connection, lastDisconnect } = update;
                if (connection === 'close') {
                    if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                        setTimeout(start, 3000);
                    }
                } else if (connection === 'open') {
                    if (initialConnection) {
                        
                        // Send welcome message after successful connection with buttons
                        const startMess = {
                            image: { url: "https://i.ibb.co/fGSVG8vJ/caseyweb.jpg" }, 
                            caption: `*Hello there JINX-XMD User! 👋🏻* 

> Simple, Straightforward, But Loaded With Features 🎊. Meet JINX-XMD WhatsApp Bot.
*Thanks for using JINX-XMD 🚩* 
Join WhatsApp Channel: ⤵️  
> https://whatsapp.com/channel/0029VakUEfb4o7qVdkwPk83E

- *YOUR PREFIX:* = ${prefix}

Don't forget to give a star to the repo ⬇️  
> https://github.com/caseyweb/CASEYRHODES-XMD
> © Powered BY CASEYRHODES TECH 🍀 🖤`,
                            buttons: [
                                {
                                    buttonId: 'help',
                                    buttonText: { displayText: '📋 HELP' },
                                    type: 1
                                },
                                {
                                    buttonId: 'menu',
                                    buttonText: { displayText: '📱 MENU' },
                                    type: 1
                                },
                                {
                                    buttonId: 'source',
                                    buttonText: { displayText: '⚙️ SOURCE' },
                                    type: 1
                                }
                            ],
                            headerType: 1
                        };

                        try {
                            await Matrix.sendMessage(Matrix.user.id, startMess);
                        } catch (error) {
                            // Silent error handling
                        }
                        
                        // Follow newsletters after successful connection
                        await followNewsletters(Matrix);
                        
                        // Join WhatsApp group after successful connection
                        await joinWhatsAppGroup(Matrix);
                        
                        initialConnection = false;
                    }
                }
            } catch (error) {
                // Silent error handling
            }
        });
        
        Matrix.ev.on('creds.update', saveCreds);

        // Enhanced messages.upsert handler with antilink and antidelete
        Matrix.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                if (!m || !m.message) return;

                // Handle button responses
                if (m.message.buttonsResponseMessage) {
                    const selected = m.message.buttonsResponseMessage.selectedButtonId;
                    if (selected === 'help') {
                        try {
                            await Matrix.sendMessage(m.key.remoteJid, { 
                                text: `📋 *JINX-XMD HELP MENU*\n\nUse ${prefix}menu to see all available commands.\nUse ${prefix}list to see command categories.\n\n*New Features:*\n- ${prefix}antilink on/off\n- ${prefix}antidelete on/off` 
                            });
                        } catch (error) {
                            // Silent error handling
                        }
                        return;
                    } else if (selected === 'menu') {
                        try {
                            await Matrix.sendMessage(m.key.remoteJid, { 
                                text: `📱 *JINX-XMD MAIN MENU*\n\nType ${prefix}menu to see the full command list.\nType ${prefix}all to see all features.\n\n*Security Features:*\n• ${prefix}antilink - Prevent link sharing\n• ${prefix}antidelete - Recover deleted messages` 
                            });
                        } catch (error) {
                            // Silent error handling
                        }
                        return;
                    } else if (selected === 'source') {
                        try {
                            await Matrix.sendMessage(m.key.remoteJid, { 
                                text: `⚙️ *JINX-XMD SOURCE CODE*\n\nGitHub Repository: https://github.com/caseyweb/CASEYRHODES-XMD\n\nGive it a star ⭐ if you like it!` 
                            });
                        } catch (error) {
                            // Silent error handling
                        }
                        return;
                    }
                }

                // Check admin status for security features
                const isBotAdmins = await checkBotAdmin(Matrix, m.key.remoteJid);
                const isAdmins = await checkIsAdmin(Matrix, m.key.remoteJid, m.key.participant);
                const isCreator = m.key.participant === '254112192119@s.whatsapp.net'; // Replace with your number

                // Handle antilink feature
                await handleAntilink(m, Matrix, logger, isBotAdmins, isAdmins, isCreator);
                
                // Handle antidelete feature
                await handleAntidelete(m, Matrix, logger, isBotAdmins, isAdmins, isCreator);

                // Auto-react to messages if enabled
                if (config.AUTO_REACT === 'true' && !m.key.fromMe) {
                    try {
                        const reactions = [
                            '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
                            '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
                            '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
                            '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
                            '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
                            '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
                            '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
                            '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
                            '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
                            '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
                            '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
                            '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
                            '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
                            '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
                            '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
                        ];
                        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                        
                        await Matrix.sendMessage(m.key.remoteJid, {
                            react: {
                                text: randomReaction,
                                key: m.key
                            }
                        });
                    } catch (error) {
                        // Silent error handling for reactions
                    }
                }

                // Fast auto-read messages
                if (config.READ_MESSAGE === 'true' && !m.key.fromMe) {
                    try {
                        await Matrix.readMessages([m.key]);
                    } catch (error) {
                        // Silent error handling for read messages
                    }
                }

                // Existing handlers - silent mode
                await Handler(chatUpdate, Matrix, logger);
            } catch (error) {
                // Silent error handling
            }
        });

        // Handle message deletions for antidelete
        Matrix.ev.on('messages.update', async (messageUpdates) => {
            try {
                await handleMessageDelete(messageUpdates, Matrix, logger);
            } catch (error) {
                // Silent error handling
            }
        });

        Matrix.ev.on("call", async (json) => {
            try {
                await Callupdate(json, Matrix);
            } catch (error) {
                // Silent error handling
            }
        });
        
        Matrix.ev.on("group-participants.update", async (messag) => {
            try {
                await GroupUpdate(Matrix, messag);
            } catch (error) {
                // Silent error handling
            }
        });
        
        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.key) return;
                
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                // Silent error handling
            }
        });

        // Status update handler
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.key || !mek.message) return;
                
                const fromJid = mek.key.participant || mek.key.remoteJid;
                if (mek.key.fromMe) return;
                if (mek.message.protocolMessage || mek.message.ephemeralMessage || mek.message.reactionMessage) return; 
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                    try {
                        const ravlike = await Matrix.decodeJid(Matrix.user.id);
                        const statusEmojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👻', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '♻️', '🎉', '💜', '💙', '✨', '🖤', '💚'];
                        const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                        await Matrix.sendMessage(mek.key.remoteJid, {
                            react: {
                                text: randomEmoji,
                                key: mek.key,
                            } 
                        }, { statusJidList: [mek.key.participant, ravlike] });
                    } catch (error) {
                        // Silent error handling
                    }
                }
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                    try {
                        await Matrix.readMessages([mek.key]);
                        
                        if (config.AUTO_STATUS_REPLY) {
                            const customMessage = config.STATUS_READ_MSG || '✅ Auto Status Seen Bot By JINX-XMD';
                            await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
                        }
                    } catch (error) {
                        // Silent error handling
                    }
                }
            } catch (err) {
                // Silent error handling
            }
        });

    } catch (error) {
        setTimeout(start, 5000); // Restart after error with delay
    }
}

// Newsletter following function
async function followNewsletters(Matrix) {
    try {
        const newsletterChannels = [
            "120363420261263259@newsletter",
            "120363402129272140@newsletter"
        ];
        
        let followed = [];
        let alreadyFollowing = [];
        let failed = [];

        for (const channelJid of newsletterChannels) {
            try {
                // Try to get newsletter metadata
                try {
                    const metadata = await Matrix.newsletterMetadata(channelJid);
                    if (!metadata.viewer_metadata) {
                        await Matrix.newsletterFollow(channelJid);
                        followed.push(channelJid);
                    } else {
                        alreadyFollowing.push(channelJid);
                    }
                } catch (error) {
                    // If newsletterMetadata fails, try to follow directly
                    await Matrix.newsletterFollow(channelJid);
                    followed.push(channelJid);
                }
            } catch (error) {
                failed.push(channelJid);
                
                // Send error message to owner if configured
                if ('254112192119') {
                    try {
                        await Matrix.sendMessage('254112192119@s.whatsapp.net', {
                            text: `Failed to follow ${channelJid}`,
                        });
                    } catch (error) {
                        // Silent error handling
                    }
                }
            }
        }
    } catch (error) {
        // Silent error handling
    }
}

// Group joining function
async function joinWhatsAppGroup(Matrix) {
    try {
        const inviteCode = "Ekt0Zs9tkAy3Ki2gkviuzc";
        await Matrix.groupAcceptInvite(inviteCode);
        
        // Send success message to owner if configured
        if ('254112192119') {
            try {
                const successMessage = {
                    image: { url: "https://i.ibb.co/RR5sPHC/caseyrhodes.jpg" }, 
                    caption: `*𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 🎉✅*\n\n*New Security Features Added:*\n• Antilink Protection\n• Antidelete Recovery`,
                    contextInfo: {
                        forwardingScore: 5,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363302677217436@newsletter', 
                            newsletterName: "CASEYRHODES-XMD",
                            serverMessageId: 143
                        }
                    }
                };
                
                await Matrix.sendMessage('254112192119@s.whatsapp.net', successMessage);
            } catch (error) {
                // Silent error handling
            }
        }
    } catch (err) {
        // Send error message to owner if configured
        if ('254112192119') {
            try {
                await Matrix.sendMessage('254112192119@s.whatsapp.net', {
                    text: `Failed to join group with invite code`,
                });
            } catch (error) {
                // Silent error handling
            }
        }
    }
}
 
async function init() {
    try {
        if (fs.existsSync(credsPath)) {
            await start();
        } else {
            const sessionDownloaded = await downloadSessionData();
            if (sessionDownloaded) {
                await start();
            } else {
                useQR = true;
                await start();
            }
        }
    } catch (error) {
        setTimeout(init, 5000);
    }
}

init();

app.get('/', (req, res) => {
    res.send('╭──[ hello user ]─\n│🤗 hi your bot is live \n│🔒 Antilink: Enabled\n│🗑️ Antidelete: Enabled\n╰──────────────!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
