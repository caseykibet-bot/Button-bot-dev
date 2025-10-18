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

// Helper function to send reactions
async function sendReaction(sock, m, emoji) {
    try {
        await sock.sendMessage(m.key.remoteJid, {
            react: {
                text: emoji,
                key: m.key
            }
        });
    } catch (error) {
        // Silent error handling for reactions
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

        // Simplified messages.upsert handler with autoreact
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
                                text: `📋 *JINX-XMD HELP MENU*\n\nUse ${prefix}menu to see all available commands.\nUse ${prefix}list to see command categories.\n\n*Features:*\n- Auto React: ${config.AUTO_REACT === 'true' ? 'ON' : 'OFF'}\n- Fast response times\n- Better group performance` 
                            });
                        } catch (error) {
                            // Silent error handling
                        }
                        return;
                    } else if (selected === 'menu') {
                        try {
                            await Matrix.sendMessage(m.key.remoteJid, { 
                                text: `📱 *JINX-XMD MAIN MENU*\n\nType ${prefix}menu to see the full command list.\nType ${prefix}all to see all features.\n\n*Auto React:* ${config.AUTO_REACT === 'true' ? '✅ Enabled' : '❌ Disabled'}` 
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

                //========== Auto React ============//
                // Auto React for all messages (controlled by config)
                if (config.AUTO_REACT === 'true' && !m.key.fromMe) {
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
                    await sendReaction(Matrix, m, randomReaction);
                }

                // Fast auto-read messages (lightweight)
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
                    caption: `*𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 🎉✅*\n\n*Features Status:*\n• Auto React: ${config.AUTO_REACT === 'true' ? '✅ ON' : '❌ OFF'}\n• Read Messages: ${config.READ_MESSAGE === 'true' ? '✅ ON' : '❌ OFF'}\n• Mode: ${config.MODE || 'public'}`,
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
    res.send('╭──[ hello user ]─\n│🤗 hi your bot is live \n│⚡ Performance Optimized Version\n│🤖 Auto React: ' + (config.AUTO_REACT === 'true' ? 'ON' : 'OFF') + '\n│📖 Read Messages: ' + (config.READ_MESSAGE === 'true' ? 'ON' : 'OFF') + '\n╰──────────────!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
