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
      return false;
    }
  };

  // Helper function to format messages
  const formatMessage = (title, content, footer) => {
    return `╭───[ *${title}* ]───\n├ ${content}\n╰──────────────┈⊷\n> *${footer}*`;
  };

  // Promote Plugin
  if (cmd === 'promote') {
    try {
      await gss.sendMessage(m.from, { react: { text: '👑', key: m.key } });
      
      if (!m.isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, darling!* 😘'
        }, { quoted: m });
        return;
      }
      
      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const isOwner = m.sender === config.OWNER_NUMBER + '@s.whatsapp.net';
      
      if (!isSenderGroupAdmin && !isOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can promote members, sweetie!* 😘'
        }, { quoted: m });
        return;
      }
      
      if (args.length === 0 && !m.quoted) {
        await gss.sendMessage(m.from, {
          text: `📌 *Usage:* ${prefix}promote +254740007567 or reply to a message with ${prefix}promote`
        }, { quoted: m });
        return;
      }
      
      let numberToPromote;
      if (m.quoted) {
        numberToPromote = m.quoted.sender;
      } else {
        numberToPromote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }
      
      await gss.groupParticipantsUpdate(m.from, [numberToPromote], 'promote');
      await gss.sendMessage(m.from, {
        text: formatMessage(
          '⬆️ MEMBER PROMOTED',
          `Successfully promoted ${numberToPromote.split('@')[0]} to group admin! 🌟`,
          config.BOT_FOOTER || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'
        )
      }, { quoted: m });
      
    } catch (error) {
      console.error('Promote command error:', error);
      await gss.sendMessage(m.from, {
        text: `❌ *Failed to promote member, love!* 😢\nError: ${error.message || 'Unknown error'}`
      }, { quoted: m });
    }
  }

  // Demote Plugin
  if (cmd === 'demote') {
    try {
      await gss.sendMessage(m.from, { react: { text: '🙆‍♀️', key: m.key } });
      
      if (!m.isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, sweetie!* 😘',
          buttons: [
            {buttonId: `${prefix}groups`, buttonText: {displayText: 'My Groups'}, type: 1}
          ]
        }, { quoted: m });
        return;
      }
      
      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const isOwner = m.sender === config.OWNER_NUMBER + '@s.whatsapp.net';
      
      if (!isSenderGroupAdmin && !isOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can demote admins, darling!* 😘'
        }, { quoted: m });
        return;
      }
      
      if (args.length === 0 && !m.quoted) {
        await gss.sendMessage(m.from, {
          text: `📌 *Usage:* ${prefix}demote +254740007567 or reply to a message with ${prefix}demote`,
          buttons: [
            {buttonId: `${prefix}help`, buttonText: {displayText: 'Usage Examples'}, type: 1}
          ]
        }, { quoted: m });
        return;
      }
      
      let numberToDemote;
      if (m.quoted) {
        numberToDemote = m.quoted.sender;
      } else {
        numberToDemote = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }
      
      await gss.groupParticipantsUpdate(m.from, [numberToDemote], 'demote');
      
      await gss.sendMessage(m.from, {
        text: formatMessage(
          '⬇️ ADMIN DEMOTED',
          `Successfully demoted ${numberToDemote.split('@')[0]} 📉`,
          config.BOT_FOOTER || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'
        ),
        buttons: [
          {buttonId: `${prefix}admins`, buttonText: {displayText: 'View Admins'}, type: 1}
        ]
      }, { quoted: m });
      
    } catch (error) {
      console.error('Demote command error:', error);
      await gss.sendMessage(m.from, {
        text: `❌ *Failed to demote admin, love!* 😢\nError: ${error.message || 'Unknown error'}`,
        buttons: [
          {buttonId: `${prefix}demote`, buttonText: {displayText: 'Try Again'}, type: 1}
        ]
      }, { quoted: m });
    }
  }

  // Open Group Plugin
  if (cmd === 'open') {
    try {
      await gss.sendMessage(m.from, { react: { text: '🔓', key: m.key } });
      
      if (!m.isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, darling!* 😘'
        }, { quoted: m });
        return;
      }
      
      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const isOwner = m.sender === config.OWNER_NUMBER + '@s.whatsapp.net';
      
      if (!isSenderGroupAdmin && !isOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can open the group, sweetie!* 😘'
        }, { quoted: m });
        return;
      }
      
      await gss.groupSettingUpdate(m.from, 'not_announcement');
      
      await gss.sendMessage(m.from, {
        text: formatMessage(
          '🔓 GROUP OPENED',
          'Group is now open! 🗣️\nAll members can send messages.',
          config.BOT_FOOTER || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'
        ),
        buttons: [
          {
            buttonId: `${prefix}close`,
            buttonText: { displayText: '🔒 Close Group' },
            type: 1
          },
          {
            buttonId: `${prefix}settings`,
            buttonText: { displayText: '⚙️ Group Settings' },
            type: 1
          }
        ]
      }, { quoted: m });
      
    } catch (error) {
      console.error('Open command error:', error);
      await gss.sendMessage(m.from, {
        text: `❌ *Failed to open group, love!* 😢\nError: ${error.message || 'Unknown error'}`
      }, { quoted: m });
    }
  }

  // Close Group Plugin
  if (cmd === 'close') {
    try {
      await gss.sendMessage(m.from, { react: { text: '🔒', key: m.key } });
      
      if (!m.isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, sweetie!* 😘'
        }, { quoted: m });
        return;
      }
      
      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const isOwner = m.sender === config.OWNER_NUMBER + '@s.whatsapp.net';
      
      if (!isSenderGroupAdmin && !isOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can close the group, darling!* 😘'
        }, { quoted: m });
        return;
      }
      
      await gss.groupSettingUpdate(m.from, 'announcement');
      
      await gss.sendMessage(m.from, {
        text: formatMessage(
          '🔒 GROUP CLOSED',
          'Group is now closed! 🔒\nOnly admins can send messages.',
          config.BOT_FOOTER || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'
        ),
        buttons: [
          { buttonId: `${prefix}open`, buttonText: { displayText: '🔓 Open Group' }, type: 1 },
          { buttonId: `${prefix}settings`, buttonText: { displayText: '⚙️ Settings' }, type: 1 }
        ]
      }, { quoted: m });
      
    } catch (error) {
      console.error('Close command error:', error);
      await gss.sendMessage(m.from, {
        text: `❌ *Failed to close group, love!* 😢\nError: ${error.message || 'Unknown error'}`
      }, { quoted: m });
    }
  }

  // Tagall Plugin
  if (cmd === 'tagall') {
    try {
      await gss.sendMessage(m.from, { react: { text: '🫂', key: m.key } });
      
      if (!m.isGroup) {
        await gss.sendMessage(m.from, {
          text: '❌ *This command can only be used in groups, darling!* 😘'
        }, { quoted: m });
        return;
      }
      
      const isSenderGroupAdmin = await isGroupAdmin(m.from, m.sender);
      const isOwner = m.sender === config.OWNER_NUMBER + '@s.whatsapp.net';
      
      if (!isSenderGroupAdmin && !isOwner) {
        await gss.sendMessage(m.from, {
          text: '❌ *Only group admins or bot owner can tag all members, sweetie!* 😘'
        }, { quoted: m });
        return;
      }
      
      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants.map(p => p.id);
      let message = args.join(' ') || '📢 *Attention everyone!*';
      
      await gss.sendMessage(m.from, {
        text: formatMessage(
          '👥 TAG ALL',
          `${message}\n\nTagged ${participants.length} members!`,
          config.BOT_FOOTER || 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ'
        ),
        mentions: participants
      }, { quoted: m });
      
    } catch (error) {
      console.error('Tagall command error:', error);
      await gss.sendMessage(m.from, {
        text: `❌ *Failed to tag all members, love!* 😢\nError: ${error.message || 'Unknown error'}`
      }, { quoted: m });
    }
  }
};

export default plugins;
