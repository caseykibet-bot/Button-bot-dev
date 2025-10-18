import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Blocklist Plugin
  if (['blocklist', 'blocked'].includes(cmd)) {
    try {
      // React to the command first
      await gss.sendMessage(m.from, {
        react: {
          text: "🚫",
          key: m.key
        }
      });

      const blockedJids = await gss.fetchBlocklist();
      
      if (!blockedJids || blockedJids.length === 0) {
        return await gss.sendMessage(m.from, {
          text: '✅ *Your block list is empty!* 🌟\n\n' +
                'No users are currently blocked.',
          buttons: [
            { buttonId: `${prefix}block`, buttonText: { displayText: '🚫 Block User' }, type: 1 },
            { buttonId: `${prefix}allmenu`, buttonText: { displayText: '📋 Menu' }, type: 1 }
          ]
        }, { quoted: m });
      }

      // Array of random emojis for numbers
      const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
                           '➡️', '▶️', '⏩', '🔜', '🔄', '⚡', '🌟', '✨', '💫', '🎯',
                           '🎮', '🎲', '🎪', '🎭', '🎨', '🧩', '🔮', '💎', '🎖️', '🏆',
                           '🥇', '🥈', '🥉', '🎗️', '🏅', '🎫', '🎟️', '🎪', '🤹', '🎭'];

      const formattedList = blockedJids.map((b, i) => {
        const randomEmoji = numberEmojis[Math.floor(Math.random() * numberEmojis.length)];
        return `${randomEmoji} ${b.replace('@s.whatsapp.net', '')}`;
      }).join('\n');

      await gss.sendMessage(m.from, {
        text: `🚫 *Blocked Contacts:*\n\n${formattedList}\n\n` +
              `*Total blocked:* ${blockedJids.length}\n\n` +
              `> _Powered by CaseyRhodes Tech_ 🌟`,
        buttons: [
          { buttonId: `${prefix}unblock`, buttonText: { displayText: '🔓 Unblock All' }, type: 1 },
          { buttonId: `${prefix}block`, buttonText: { displayText: '🚫 Block More' }, type: 1 },
          { buttonId: `${prefix}allmenu`, buttonText: { displayText: '📋 Main Menu' }, type: 1 }
        ]
      }, { quoted: m });

    } catch (error) {
      console.error('Error fetching block list:', error);
      await gss.sendMessage(m.from, {
        text: '❌ *An error occurred while retrieving the block list!*\n\n' +
              'This command may require admin privileges.',
        buttons: [
          { buttonId: `${prefix}help`, buttonText: { displayText: '❓ Help' }, type: 1 },
          { buttonId: `${prefix}allmenu`, buttonText: { displayText: '📋 Menu' }, type: 1 }
        ]
      }, { quoted: m });
    }
  }
};

export default plugins;
