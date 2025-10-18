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
        await new Promise(resolve => setTimeout(resolve, 1000));
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
        text: `❌ *Error!* ${e.message}`
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
        "🩵", "💙", "💜", "🖤", "🩶", "🤍",
        "🤎", "❤️‍🔥", "💞", "💓", "💘", "💝",
        "♥️", "💟", "❤️‍🩹", "❤️"
      ];

      await sendAnimatedEmojis(emojiMessages, '🖤');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Angry Plugin
  if (cmd === 'angry') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🤡', key: m.key } 
      });
      
      const emojiMessages = [
        "😡", "😠", "🤬", "😤", "😾", "😡",
        "😠", "🤬", "😤", "😾"
      ];

      await sendAnimatedEmojis(emojiMessages, '👽');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Sad Plugin
  if (cmd === 'sad') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '😶', key: m.key } 
      });
      
      const emojiMessages = [
        "🥺", "😟", "😕", "😖", "😫", "🙁",
        "😩", "😥", "😓", "😪", "😢", "😔",
        "😞", "😭", "💔", "😭", "😿"
      ];

      await sendAnimatedEmojis(emojiMessages, '😔');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Shy Plugin
  if (cmd === 'shy') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🧐', key: m.key } 
      });
      
      const emojiMessages = [
        "😳", "😊", "😶", "🙈", "🙊",
        "😳", "😊", "😶", "🙈", "🙊"
      ];

      await sendAnimatedEmojis(emojiMessages, '🧐');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Moon Plugin
  if (cmd === 'moon') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🌚', key: m.key } 
      });
      
      const emojiMessages = [
        "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
        "🌕", "🌖", "🌗", "🌘", "🌑", "🌒",
        "🌓", "🌔", "🌕", "🌖", "🌗", "🌘",
        "🌑", "🌒", "🌓", "🌔", "🌕", "🌖",
        "🌗", "🌘", "🌑", "🌒", "🌓", "🌔",
        "🌕", "🌖", "🌝🌚"
      ];

      await sendAnimatedEmojis(emojiMessages, '🌝');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Confused Plugin
  if (cmd === 'confused') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🤔', key: m.key } 
      });
      
      const emojiMessages = [
        "😕", "😟", "😵", "🤔", "😖", 
        "😲", "😦", "🤷", "🤷‍♂️", "🤷‍♀️"
      ];

      await sendAnimatedEmojis(emojiMessages, '🤔');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Hot Plugin
  if (cmd === 'hot') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '💋', key: m.key } 
      });
      
      const emojiMessages = [
        "🥵", "❤️", "💋", "😫", "🤤", 
        "😋", "🥵", "🥶", "🙊", "😻", 
        "🙈", "💋", "🫂", "🫀", "👅", 
        "👄", "💋"
      ];

      await sendAnimatedEmojis(emojiMessages, '💋');
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }

  // Nikal Plugin
  if (cmd === 'nikal') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🗿', key: m.key } 
      });
      
      const loadingMessage = await gss.sendMessage(m.from, { text: 'ALI-XMD☠️' });
      
      const asciiMessages = [
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀     ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀  ⠀    ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀__⠀   ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀",
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀  ⠀  ⢳⡀⠀⡏⠀⠀⠀   ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀      ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__|⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀",
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀⠀⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀     ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀(P)⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀",
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀     ⠀   ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀   ⠀     ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀        ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__ ⠀  ⠀   ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀",
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀      ⢳⡀⠀⡏⠀⠀    ⠀  ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀⠀ ⠀      ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀⠀       ⣿  ⢹⠀          ⡇\n  ⠙⢿⣯⠄⠀⠀|__| ⠀    ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀⠀⠀⠀⠀⠀",
        "⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀   ⠀  ⠀⢳⡀⠀⡏⠀⠀       ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀   ⣧⠀⢸⠀  ⠀       ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱⠀       ⣿  ⢹⠀           ⡇\n  ⠙⢿⣯⠄⠀⠀lodu⠀⠀   ⡿ ⠀⡇⠀⠀⠀⠀   ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀  ⡴⠃⠀   ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀ ⠀⣄⢸⠀"
      ];

      for (const asciiMessage of asciiMessages) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await gss.relayMessage(
          m.from,
          {
            protocolMessage: {
              key: loadingMessage.key,
              type: 14,
              editedMessage: {
                conversation: asciiMessage,
              },
            },
          },
          {}
        );
      }
      
    } catch (e) {
      console.log(e);
      await gss.sendMessage(m.from, {
        text: `❌ *Error!* ${e.message}`
      }, { quoted: m });
    }
  }
};

export default plugins;
