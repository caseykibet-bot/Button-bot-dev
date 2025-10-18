import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Tag Admins Plugin
  if (['tagadmins', 'gc_tagadmins'].includes(cmd)) {
    try {
      // Check if it's a group
      if (!m.isGroup) {
        return await gss.sendMessage(m.from, {
          text: '❌ *This command only works in group chats.*',
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
              serverMessageId: -1
            }
          }
        }, { quoted: m });
      }

      // Send processing reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      // Get group metadata
      const groupMetadata = await gss.groupMetadata(m.from);
      const groupName = groupMetadata.subject || "Unnamed Group";
      
      // Get admins from participants
      const admins = groupMetadata.participants
        .filter(participant => participant.admin)
        .map(admin => admin.id);

      if (!admins || admins.length === 0) {
        return await gss.sendMessage(m.from, {
          text: '❌ *No admins found in this group.*',
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
              serverMessageId: -1
            }
          }
        }, { quoted: m });
      }

      // Extract message text from command
      const messageText = args.join(' ') || "Attention Admins ⚠️";

      // Admin emojis
      const emojis = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
      const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      // Build message
      let teks = `📢 *Admin Tag Alert*\n`;
      teks += `🏷️ *Group:* ${groupName}\n`;
      teks += `👥 *Admins:* ${admins.length}\n`;
      teks += `💬 *Message:* ${messageText}\n\n`;
      teks += `╭━━〔 *Admin Mentions* 〕━━┈⊷\n`;
      
      for (let admin of admins) {
        teks += `${chosenEmoji} @${admin.split("@")[0]}\n`;
      }

      teks += `╰──────────────┈⊷\n\n`;
      teks += `> ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ`;

      // Send message with mentions and newsletter context
      await gss.sendMessage(m.from, {
        text: teks,
        mentions: admins,
        contextInfo: {
          mentionedJid: admins,
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
            serverMessageId: -1
          },
          externalAdReply: {
            title: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs',
            body: `${admins.length} ᴀᴅᴍɪɴs`,
            mediaType: 1,
            sourceUrl: 'https://wa.me/254101022551',
            thumbnailUrl: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg'
          }
        }
      }, { quoted: m });

      // Send success reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error("TagAdmins Error:", error);
      
      // Send error reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });

      await gss.sendMessage(m.from, {
        text: `❌ *Error occurred:*\n${error.message || 'Failed to tag admins'}`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
            serverMessageId: -1
          }
        }
      }, { quoted: m });
    }
  }
};

export default plugins;
