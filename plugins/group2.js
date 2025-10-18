import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Helper function to check if user is group admin
  const isGroupAdmin = async (groupId, userId) => {
    try {
      const metadata = await gss.groupMetadata(groupId);
      const participant = metadata.participants.find(p => p.id === userId);
      return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
      console.error('Error checking group admin:', error);
      return false;
    }
  };

  // Helper function to check if user is bot owner
  const isOwner = (userId) => {
    const ownerNumber = config.OWNER_NUMBER || config.ownerNumber;
    return userId === ownerNumber + '@s.whatsapp.net';
  };

  // Helper function to format messages
  const formatMessage = (title, content, footer) => {
    return `╭───[ *${title}* ]───\n├ ${content}\n╰──────────────┈⊷\n> *${footer || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'}*`;
  };

  // Helper function to check if message is from a group
  const isGroup = m.isGroup || false;

  // Add Member Plugin
  if (cmd === 'add') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '➕️', key: m.key } 
      });

      if (!isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, love!* 😘',
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
        return;
      }

      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const userIsOwner = isOwner(m.sender);

      if (!isSenderGroupAdmin && !userIsOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can add members, darling!* 😘',
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
        return;
      }

      if (args.length === 0) {
        await gss.sendMessage(m.from, {
          text: `📌 *Usage:* ${prefix}add +254740007567\n\nExample: ${prefix}add +254740007567`,
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
        return;
      }

      try {
        const numberToAdd = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await gss.groupParticipantsUpdate(m.from, [numberToAdd], 'add');
        
        await gss.sendMessage(m.from, {
          text: formatMessage(
            '✅ MEMBER ADDED',
            `Successfully added ${args[0]} to the group! 🎉`,
            config.BOT_FOOTER
          ),
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

      } catch (error) {
        console.error('Add command error:', error);
        await gss.sendMessage(m.from, {
          text: `❌ *Failed to add member, love!* 😢\nError: ${error.message || 'Unknown error'}`,
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

    } catch (error) {
      console.error('Add plugin error:', error);
      await gss.sendMessage(m.from, {
        text: '❌ *An unexpected error occurred while processing the add command.*',
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

  // Kick Member Plugin
  if (cmd === 'kick') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🦶', key: m.key } 
      });

      if (!isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, sweetie!* 😘',
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
        return;
      }

      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const userIsOwner = isOwner(m.sender);

      if (!isSenderGroupAdmin && !userIsOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can kick members, darling!* 😘',
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
        return;
      }

      if (args.length === 0 && !m.quoted) {
        await gss.sendMessage(m.from, {
          text: `📌 *Usage:* ${prefix}kick +254740007567 or reply to a message with ${prefix}kick`,
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
        return;
      }

      try {
        let numberToKick;
        if (m.quoted) {
          numberToKick = m.quoted.sender;
        } else {
          numberToKick = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }
        
        await gss.groupParticipantsUpdate(m.from, [numberToKick], 'remove');
        
        await gss.sendMessage(m.from, {
          text: formatMessage(
            '🗑️ MEMBER KICKED',
            `Successfully removed ${numberToKick.split('@')[0]} from the group! 🚪`,
            config.BOT_FOOTER
          ),
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

      } catch (error) {
        console.error('Kick command error:', error);
        await gss.sendMessage(m.from, {
          text: `❌ *Failed to kick member, love!* 😢\nError: ${error.message || 'Unknown error'}`,
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

    } catch (error) {
      console.error('Kick plugin error:', error);
      await gss.sendMessage(m.from, {
        text: '❌ *An unexpected error occurred while processing the kick command.*',
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
