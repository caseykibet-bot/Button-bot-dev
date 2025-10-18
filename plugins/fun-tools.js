import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Helper function to send animated emoji messages
  const sendAnimatedEmojis = async (emojiList, initialEmoji) => {
    try {
      const loadingMessage = await gss.sendMessage(m.from, { text: initialEmoji });
      
      for (const emoji of emojiList) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
        await gss.relayMessage(
          m.from,
          {
            protocolMessage: {
              key: loadingMessage.key,
              type: 14,
              editedMessage: {
                conversation: emoji,
              },
            },
          },
          {}
        );
      }
    } catch (error) {
      console.error('Animation error:', error);
      throw error;
    }
  };

  // Happy Plugin
  if (cmd === 'happy') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '😂', key: m.key } 
      });
      
      const emojiMessages = [
        "😃", "😄", "😁", "😊", "😎", "🥳",
        "😸", "😹", "🌞", "🌈", "😃", "😄",
        "😁", "😊", "😎", "🥳", "😸", "😹",
        "🌞", "🌈", "😃", "😄", "😁", "😊"
      ];

      await sendAnimatedEmojis(emojiMessages, '😂');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`,
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

  // Heart Plugin
  if (cmd === 'heart') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '❤️', key: m.key } 
      });
      
      const emojiMessages = [
        "💖", "💗", "💕", "🩷", "💛", "💚",
        "🩵", "💙", "💜", "🖤", "🩶", "
