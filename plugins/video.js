import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const BASE_URL = 'https://noobs-api.top';
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Video Downloader Plugin
  if (cmd === 'video') {
    try {
      // React to the command first
      await gss.sendMessage(m.from, {
        react: {
          text: "🎬",
          key: m.key
        }
      });

      const query = args.join(' ').trim();

      if (!query) {
        return await gss.sendMessage(m.from, {
          text: '*🎬 Video Downloader*\nPlease provide a video name to download.*'
        }, { quoted: m });
      }

      console.log('[VIDEO] Searching YT for:', query);
      const search = await yts(query);
      const video = search.videos[0];

      if (!video) {
        return await gss.sendMessage(m.from, {
          text: '*❌ No Results Found*\nNo videos found for your query. Please try different keywords.*'
        }, { quoted: m });
      }

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp4`;
      const BASE_URL = 'https://youtube-dl.dipto-tech.repl.co'; // Added BASE_URL
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

      // Create fancy video description with emojis and formatting
      const videoInfo = `
🎬 *NOW DOWNLOADING* 🎬

📹 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube ID:* ${video.videoId}

⬇️ *Downloading your video...* ⬇️
      `.trim();

      // Send video info with thumbnail first
      await gss.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption: videoInfo
      }, { quoted: m });

      // Get download link
      const response = await axios.get(apiURL, { timeout: 30000 });
      const data = response.data;

      if (!data.downloadLink) {
        return await gss.sendMessage(m.from, {
          text: '*❌ Download Failed*\nFailed to retrieve the MP4 download link. Please try again later.*'
        }, { quoted: m });
      }

      // Fetch thumbnail for the context info
      let thumbnailBuffer;
      try {
        const thumbnailResponse = await axios.get(video.thumbnail, { 
          responseType: 'arraybuffer',
          timeout: 8000
        });
        thumbnailBuffer = Buffer.from(thumbnailResponse.data);
      } catch (err) {
        console.error('[VIDEO] Error fetching thumbnail:', err.message);
        thumbnailBuffer = undefined;
      }

      // Send video with context info after a short delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const videoMessage = {
        video: { url: data.downloadLink },
        mimetype: 'video/mp4',
        fileName: fileName,
        caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n📥 Downloaded by CaseyRhodes Mini`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
            serverMessageId: -1
          }
        }
      };

      // Add externalAdReply only if we have a thumbnail
      if (thumbnailBuffer) {
        videoMessage.contextInfo.externalAdReply = {
          title: video.title.substring(0, 40),
          body: `Duration: ${video.timestamp} | Views: ${video.views}`,
          mediaType: 2, // 2 for video
          thumbnail: thumbnailBuffer,
          sourceUrl: `https://youtu.be/${video.videoId}`,
          renderLargerThumbnail: false
        };
      }

      await gss.sendMessage(m.from, videoMessage);

    } catch (err) {
      console.error('[VIDEO] Error:', err.message);
      await gss.sendMessage(m.from, {
        text: '*❌ Error Occurred*\nFailed to process your video request. Please try again later.*',
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
