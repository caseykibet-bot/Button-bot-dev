import config from '../config.cjs';

// You'll need to pass these from your main file
let socketCreationTime = new Map();
let activeSockets = new Set();

const plugins = async (m, gss, { number = m.sender, socketCreationTime: creationTime, activeSockets: sockets } = {}) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Alive Plugin
  if (cmd === 'alive') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🔮', key: m.key } 
      });
      
      const startTime = creationTime?.get(number) || Date.now();
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const captionText = `
*🎀 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐁𝐎𝐓 🎀*
*╭─────────────────⊷*
*┃* ʙᴏᴛ ᴜᴘᴛɪᴍᴇ: ${hours}h ${minutes}m ${seconds}s
*┃* ᴀᴄᴛɪᴠᴇ ʙᴏᴛs: ${sockets?.size || 1}
*┃* ʏᴏᴜʀ ɴᴜᴍʙᴇʀ: ${number.split('@')[0]}
*┃* ᴠᴇʀsɪᴏɴ: ${config.version || '1.0.0'}
*┃* ᴍᴇᴍᴏʀʏ ᴜsᴀɢᴇ: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB
*╰───────────────┈⊷*

> *▫️ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍᴀɪɴ*
> sᴛᴀᴛᴜs: ONLINE ✅
> ʀᴇsᴘᴏɴᴅ ᴛɪᴍᴇ: ${Date.now() - m.messageTimestamp * 1000}ms`;

      const aliveMessage = {
        image: { url: "https://i.ibb.co/fGSVG8vJ/caseyweb.jpg" },
        caption: `> ᴀᴍ ᴀʟɪᴠᴇ ɴ ᴋɪᴄᴋɪɴɢ 🥳\n\n${captionText}`,
        buttons: [
          {
            buttonId: `${prefix}menu_action`,
            buttonText: { displayText: '📂 ᴍᴇɴᴜ ᴏᴘᴛɪᴏɴ' },
            type: 4,
            nativeFlowInfo: {
              name: 'single_select',
              paramsJson: JSON.stringify({
                title: 'ᴄʟɪᴄᴋ ʜᴇʀᴇ ❏',
                sections: [
                  {
                    title: `ᴄᴀsᴇʏʀʜᴏᴅᴇs  ʙᴏᴛ`,
                    highlight_label: 'Quick Actions',
                    rows: [
                      { title: '📋 ғᴜʟʟ ᴍᴇɴᴜ', description: 'ᴠɪᴇᴡ ᴀʟʟ ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴍᴅs', id: `${prefix}menu` },
                      { title: '💓 ᴀʟɪᴠᴇ ᴄʜᴇᴄᴋ', description: 'ʀᴇғʀᴇs ʙᴏᴛ sᴛᴀᴛᴜs', id: `${prefix}alive` },
                      { title: '💫 ᴘɪɴɢ ᴛᴇsᴛ', description: 'ᴄʜᴇᴄᴋ ʀᴇsᴘᴏɴᴅ sᴘᴇᴇᴅ', id: `${prefix}ping` }
                    ]
                  },
                  {
                    title: "ϙᴜɪᴄᴋ ᴄᴍᴅs",
                    highlight_label: 'Popular',
                    rows: [
                      { title: '🤖 ᴀɪ ᴄʜᴀᴛ', description: 'Start AI conversation', id: `${prefix}ai Hello!` },
                      { title: '🎵 ᴍᴜsɪᴄ sᴇᴀʀᴄʜ', description: 'Download your favorite songs', id: `${prefix}song` },
                      { title: '📰 ʟᴀᴛᴇsᴛ ɴᴇᴡs', description: 'Get current news updates', id: `${prefix}news` }
                    ]
                  }
                ]
              })
            }
          },
          { buttonId: `${prefix}session`, buttonText: { displayText: '🌟 ʙᴏᴛ ɪɴғᴏ' }, type: 1 },
          { buttonId: `${prefix}active`, buttonText: { displayText: '📈 ʙᴏᴛ sᴛᴀᴛs' }, type: 1 }
        ],
        headerType: 1,
        viewOnce: true,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ʙᴏᴛ🌟',
            serverMessageId: -1
          }
        }
      };

      await gss.sendMessage(m.from, aliveMessage, { quoted: m });
    } catch (error) {
      console.error('Alive command error:', error);
      
      const startTime = creationTime?.get(number) || Date.now();
      const uptime = Math.floor((Date.now() - startTime) / 1000);
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const errorMessage = {
        image: { url: "https://i.ibb.co/fGSVG8vJ/caseyweb.jpg" },
        caption: `*🤖 ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ ᴀʟɪᴠᴇ*\n\n` +
                `*╭─────〘 ᴄᴀsᴇʏʀʜᴏᴅᴇs 〙───⊷*\n` +
                `*┃* ᴜᴘᴛɪᴍᴇ: ${hours}h ${minutes}m ${seconds}s\n` +
                `*┃* sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ\n` +
                `*┃* ɴᴜᴍʙᴇʀ: ${number.split('@')[0]}\n` +
                `*╰──────────────⊷*\n\n` +
                `Type *${prefix}menu* for commands`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ʙᴏᴛ🌟',
            serverMessageId: -1
          }
        }
      };

      await gss.sendMessage(m.from, errorMessage, { quoted: m });
    }
  }
};

export default plugins;
