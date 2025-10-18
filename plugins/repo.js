import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Repo Plugin
  if (['repo', 'sc', 'script'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🪄', key: m.key } 
      });
      
      const githubRepoURL = 'https://github.com/caseyweb/CASEYRHODES-XMD';
      
      const response = await fetch(`https://api.github.com/repos/caseyweb/CASEYRHODES-XMD`);
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      
      const repoData = await response.json();

      const formattedInfo = `
*🎀 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐌𝐈𝐍𝐈 🎀*
*╭──────────────⊷*
*┃* *ɴᴀᴍᴇ*   : ${repoData.name}
*┃* *sᴛᴀʀs*    : ${repoData.stargazers_count}
*┃* *ғᴏʀᴋs*    : ${repoData.forks_count}
*┃* *ᴏᴡɴᴇʀ*   : ᴄᴀsᴇʏʀʜᴏᴅᴇs
*┃* *ᴅᴇsᴄ* : ${repoData.description || 'ɴ/ᴀ'}
*╰──────────────⊷*
`;

      const imageContextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420261263259@newsletter',
          newsletterName: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs 🎀',
          serverMessageId: -1
        }
      };

      const repoMessage = {
        image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
        caption: formattedInfo,
        contextInfo: imageContextInfo,
        buttons: [
          {
            buttonId: `${prefix}repo-visit`,
            buttonText: { displayText: '🌐 Visit Repo' },
            type: 1
          },
          {
            buttonId: `${prefix}repo-owner`,
            buttonText: { displayText: '👑 Owner Profile' },
            type: 1
          },
          {
            buttonId: `${prefix}repo-audio`,
            buttonText: { displayText: '🎵 Play Intro' },
            type: 1
          }
        ]
      };

      await gss.sendMessage(m.from, repoMessage, { quoted: m });

    } catch (error) {
      console.error("❌ Error in repo command:", error);
      await gss.sendMessage(m.from, { 
        text: "⚠️ Failed to fetch repo info. Please try again later." 
      }, { quoted: m });
    }
  }

  // Repo Visit Plugin
  if (cmd === 'repo-visit') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🌐', key: m.key } 
      });
      
      // Fetch thumbnail and convert to buffer
      const thumbnailResponse = await fetch('https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png');
      const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
      
      await gss.sendMessage(m.from, {
        text: `🌐 *Click to visit the repo:*\nhttps://github.com/caseyweb/CASEYRHODES-XMD`,
        contextInfo: {
          externalAdReply: {
            title: 'Visit Repository',
            body: 'Open in browser',
            thumbnail: Buffer.from(thumbnailBuffer),
            mediaType: 1,
            mediaUrl: 'https://github.com/caseyweb/CASEYRHODES-XMD',
            sourceUrl: 'https://github.com/caseyweb/CASEYRHODES-XMD',
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });
    } catch (error) {
      console.error("❌ Error in repo-visit:", error);
      await gss.sendMessage(m.from, {
        text: "🌐 *Repository Link:*\nhttps://github.com/caseyweb/CASEYRHODES-XMD"
      }, { quoted: m });
    }
  }

  // Repo Owner Plugin
  if (cmd === 'repo-owner') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '👑', key: m.key } 
      });
      
      // Fetch thumbnail and convert to buffer
      const thumbnailResponse = await fetch('https://i.ibb.co/fGSVG8vJ/caseyweb.jpg');
      const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
      
      await gss.sendMessage(m.from, {
        text: `👑 *Click to visit the owner profile:*\nhttps://github.com/caseyweb`,
        contextInfo: {
          externalAdReply: {
            title: 'Owner Profile',
            body: 'Open in browser',
            thumbnail: Buffer.from(thumbnailBuffer),
            mediaType: 1,
            mediaUrl: 'https://github.com/caseyweb',
            sourceUrl: 'https://github.com/caseyweb',
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });
    } catch (error) {
      console.error("❌ Error in repo-owner:", error);
      await gss.sendMessage(m.from, {
        text: "👑 *Owner Profile:*\nhttps://github.com/caseyweb"
      }, { quoted: m });
    }
  }

  // Repo Audio Plugin
  if (cmd === 'repo-audio') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🎵', key: m.key } 
      });
      
      // Send audio file instead of video to avoid errors
      try {
        await gss.sendMessage(m.from, {
          audio: { url: 'https://files.catbox.moe/0aoqzx.mp3' },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: m });
      } catch (audioError) {
        console.error("Audio error:", audioError);
        // Fallback to text if audio fails
        await gss.sendMessage(m.from, {
          text: "🎵 *Audio Introduction*\n\nSorry, the audio is currently unavailable. Please try again later."
        }, { quoted: m });
      }
    } catch (error) {
      console.error("❌ Error in repo-audio:", error);
      await gss.sendMessage(m.from, {
        text: "❌ Failed to play audio. Please try again later."
      }, { quoted: m });
    }
  }
};

export default plugins;
