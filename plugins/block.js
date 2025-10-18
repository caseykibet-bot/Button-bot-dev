import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Helper function to check if user is bot owner
  const isBotOwner = (userId) => {
    const botOwner = gss.user.id.split(":")[0] + "@s.whatsapp.net";
    return userId === botOwner || userId === (config.OWNER_NUMBER || '') + '@s.whatsapp.net';
  };

  // Block Plugin
  if (cmd === 'block') {
    try {
      if (!isBotOwner(m.sender)) {
        await gss.sendMessage(m.from, { 
          react: { text: "❌", key: m.key } 
        });
        return await gss.sendMessage(m.from, {
          text: "_Only the bot owner can use this command._"
        }, { quoted: m });
      }

      await gss.sendMessage(m.from, { 
        react: { text: "✅", key: m.key } 
      });
      
      await gss.sendMessage(m.from, { 
        image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
        caption: "*🚫 CHAT BLOCKED*\n\nThis chat has been blocked by the owner.",
        buttons: [
          { buttonId: `${prefix}unblock`, buttonText: { displayText: '🔓 Unblock Chat' }, type: 1 },
          { buttonId: `${prefix}owner`, buttonText: { displayText: '👑 Owner Info' }, type: 1 }
        ],
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }, { quoted: m });
      
      // Actually block the chat after sending the message
      await gss.updateBlockStatus(m.from, "block");
      
    } catch (error) {
      console.error("Block command error:", error);
      await gss.sendMessage(m.from, { 
        react: { text: "❌", key: m.key } 
      });
      await gss.sendMessage(m.from, {
        text: `_Failed to block this chat._\nError: ${error.message}_`
      }, { quoted: m });
    }
  }

  // Unblock Plugin
  if (cmd === 'unblock') {
    try {
      if (!isBotOwner(m.sender)) {
        await gss.sendMessage(m.from, { 
          react: { text: "❌", key: m.key } 
        });
        return await gss.sendMessage(m.from, {
          text: "_Only the bot owner can use this command._"
        }, { quoted: m });
      }

      await gss.sendMessage(m.from, { 
        react: { text: "✅", key: m.key } 
      });
      
      await gss.sendMessage(m.from, { 
        image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
        caption: "*🔓 CHAT UNBLOCKED*\n\nThis chat has been unblocked by the owner.",
        buttons: [
          { buttonId: `${prefix}block`, buttonText: { displayText: '🚫 Block Chat' }, type: 1 },
          { buttonId: `${prefix}owner`, buttonText: { displayText: '👑 Owner Info' }, type: 1 }
        ],
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }, { quoted: m });
      
      // Actually unblock the chat after sending the message
      await gss.updateBlockStatus(m.from, "unblock");
      
    } catch (error) {
      console.error("Unblock command error:", error);
      await gss.sendMessage(m.from, { 
        react: { text: "❌", key: m.key } 
      });
      await gss.sendMessage(m.from, {
        text: `_Failed to unblock this chat._\nError: ${error.message}_`
      }, { quoted: m });
    }
  }
};

export default plugins;
