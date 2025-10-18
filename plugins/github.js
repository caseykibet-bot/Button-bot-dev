import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // GitHub User Info Plugin
  if (['github', 'gh'].includes(cmd)) {
    try {
      const username = args[0];

      if (!username) {
        await gss.sendMessage(m.from, {
          text: '📦 *Please provide a GitHub username.*\nExample: .github caseyrhodes'
        }, { quoted: m });
        return;
      }

      await gss.sendMessage(m.from, { 
        react: { text: '⏳', key: m.key } 
      });

      try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        const data = response.data;

        if (data.message === 'Not Found') {
          await gss.sendMessage(m.from, {
            text: '❌ *GitHub user not found.*\nPlease check the username and try again.'
          }, { quoted: m });
          await gss.sendMessage(m.from, { 
            react: { text: '❌', key: m.key } 
          });
          return;
        }

        const profilePic = `https://github.com/${data.login}.png`;

        const userInfo = `
🌐 *GitHub User Info*

👤 *Name:* ${data.name || 'N/A'}
🔖 *Username:* ${data.login}
📝 *Bio:* ${data.bio || 'N/A'}
🏢 *Company:* ${data.company || 'N/A'}
📍 *Location:* ${data.location || 'N/A'}
📧 *Email:* ${data.email || 'N/A'}
🔗 *Blog:* ${data.blog || 'N/A'}
📂 *Public Repos:* ${data.public_repos}
👥 *Followers:* ${data.followers}
🤝 *Following:* ${data.following}
📅 *Created:* ${new Date(data.created_at).toLocaleDateString()}
🔄 *Updated:* ${new Date(data.updated_at).toLocaleDateString()}
        `.trim();

        // Create a button to download the profile info
        const buttonMessage = {
          image: { url: profilePic },
          caption: userInfo,
          footer: 'Click the button below to download this profile info',
          buttons: [
            {
              buttonId: `${prefix}allmenu`,
              buttonText: { displayText: '🎀 ᴀʟʟ ᴍᴇɴᴜ' },
              type: 1
            }
          ],
          headerType: 4
        };

        await gss.sendMessage(m.from, buttonMessage, { quoted: m });
        await gss.sendMessage(m.from, { 
          react: { text: '✅', key: m.key } 
        });

      } catch (err) {
        console.error('GitHub API error:', err);
        await gss.sendMessage(m.from, {
          text: '⚠️ Error fetching GitHub user. Please try again later.'
        }, { quoted: m });
        await gss.sendMessage(m.from, { 
          react: { text: '❌', key: m.key } 
        });
      }
    } catch (error) {
      console.error('GitHub command error:', error);
      await gss.sendMessage(m.from, {
        text: '❌ An unexpected error occurred. Please try again.'
      }, { quoted: m });
      await gss.sendMessage(m.from, { 
        react: { text: '❌', key: m.key } 
      });
    }
  }
};

export default plugins;
