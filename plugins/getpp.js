import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Profile Picture Plugin
  if (['getpp', 'pp', 'profilepic'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '👤', key: m.key } 
      });
      
      let targetUser = m.from;
      
      // Check if user mentioned someone or replied to a message
      if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
      } else if (m.quoted) {
        targetUser = m.quoted.sender;
      }
      
      const ppUrl = await gss.profilePictureUrl(targetUser, 'image').catch(() => null);
      
      if (ppUrl) {
        await gss.sendMessage(m.from, {
          image: { url: ppUrl },
          caption: `📸 Profile picture of @${targetUser.split('@')[0]}`,
          mentions: [targetUser],
          buttons: [
            { buttonId: `${prefix}menu`, buttonText: { displayText: '🌸 Menu' }, type: 1 },
            { buttonId: `${prefix}alive`, buttonText: { displayText: '♻️ Status' }, type: 1 }
          ],
          footer: "ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ"
        });
      } else {
        await gss.sendMessage(m.from, {
          text: `❌ @${targetUser.split('@')[0]} doesn't have a profile picture.`,
          mentions: [targetUser],
          buttons: [
            { buttonId: `${prefix}menu`, buttonText: { displayText: '🌸 Menu' }, type: 1 },
            { buttonId: `${prefix}alive`, buttonText: { displayText: '♻️ Status' }, type: 1 }
          ],
          footer: "ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴀɪ"
        });
      }
    } catch (error) {
      console.error('Profile picture error:', error);
      await gss.sendMessage(m.from, {
        text: "❌ Error fetching profile picture.",
        buttons: [
          { buttonId: `${prefix}menu`, buttonText: { displayText: '📋 Menu' }, type: 1 }
        ]
      });
    }
  }
};

export default plugins;
