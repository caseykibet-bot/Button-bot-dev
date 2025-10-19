import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];
  const text = args.join(' ');

  // Define BASE_URL (you may need to adjust this)
  const BASE_URL = config.BASE_URL || 'https://noobs-api.top';

  // Video Download Plugin
  if (cmd === 'video') {
    if (!text) {
      return await gss.sendMessage(m.from, {
        text: '🎬 *Video Downloader*\nPlease provide a video name to download.'
      }, { quoted: m });
    }

    try {
      const search = await yts(text);
      const video = search.videos[0];

      if (!video) {
        return await gss.sendMessage(m.from, {
          text: '❌ *No Results Found*\nNo videos found for your query. Please try different keywords.'
        }, { quoted: m });
      }

      // Create fancy video description with emojis and formatting
      const videoInfo = `
🎬 *NOW DOWNLOADING* 🎬

📹 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube ID:* ${video.videoId}

⬇️ *Downloading your video... Please wait* ⬇️
      `.trim();

      // Send video info with thumbnail first with newsletter
      await gss.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption: videoInfo,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES AI🧑‍💻',
            serverMessageId: -1
          }
        }
      }, { quoted: m });

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp4`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

      const response = await axios.get(apiURL, { timeout: 30000 });
      const data = response.data;

      if (!data || !data.downloadLink) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Download Failed*\nFailed to retrieve the MP4 download link. Please try again later.',
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'CASEYRHODES AI🧑‍💻',
              serverMessageId: -1
            }
          }
        }, { quoted: m });
      }

      // Download video buffer first to ensure it works
      try {
        const videoResponse = await axios.get(data.downloadLink, { 
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');
        
        // Send video with buffer instead of URL
        await gss.sendMessage(m.from, {
          video: videoBuffer,
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n> 📥 Downloaded by CASEYRHODES AI🧑‍💻`,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'CASEYRHODES AI🧑‍💻',
              serverMessageId: -1
            }
          }
        }, { quoted: m });

      } catch (downloadError) {
        console.error('Video download error:', downloadError);
        // Fallback: try sending with URL if buffer fails
        await gss.sendMessage(m.from, {
          video: { url: data.downloadLink },
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n> 📥 Downloaded by CASEYRHODES AI🧑‍💻`,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'CASEYRHODES AI🧑‍💻',
              serverMessageId: -1
            }
          }
        }, { quoted: m });
      }

    } catch (err) {
      console.error('[VIDEO] Error:', err);
      await gss.sendMessage(m.from, {
        text: `❌ *Error Occurred*\nFailed to process your video request: ${err.message}\n\nPlease try again later.`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES AI🧑‍💻',
            serverMessageId: -1
          }
        }
      }, { quoted: m });
    }
  }

  // Play Audio Plugin
  if (cmd === 'song') {
    if (!text) {
      return await gss.sendMessage(m.from, {
        text: '🎵 *Music Player*\nPlease provide a song name to play.'
      }, { quoted: m });
    }

    try {
      const search = await yts(text);
      const video = search.videos[0];

      if (!video) {
        return await gss.sendMessage(m.from, {
          text: '❌ *No Results Found*\nNo songs found for your query. Please try different keywords.'
        }, { quoted: m });
      }

      // Create fancy song description with emojis and formatting
      const songInfo = `
🎧 *NOW PLAYING* 🎧

📀 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}
🔗 *YouTube ID:* ${video.videoId}

⬇️ *Downloading your audio...*
      `.trim();

      // Send song info with thumbnail first with newsletter
      await gss.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption: songInfo,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES AI🧑‍💻',
            serverMessageId: -1
          }
        }
      }, { quoted: m });

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.mp3`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

      const response = await axios.get(apiURL, { timeout: 30000 });
      const data = response.data;

      if (!data || !data.downloadLink) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Download Failed*\nFailed to retrieve the MP3 download link. Please try again later.',
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420261263259@newsletter',
              newsletterName: 'CASEYRHODES AI🧑‍💻',
              serverMessageId: -1
            }
          }
        }, { quoted: m });
      }

      // Download audio buffer first
      try {
        const audioResponse = await axios.get(data.downloadLink, { 
          responseType: 'arraybuffer',
          timeout: 60000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const audioBuffer = Buffer.from(audioResponse.data, 'binary');
        
        // Send audio with buffer
        await gss.sendMessage(m.from, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: fileName,
          ptt: false
        }, { quoted: m });

      } catch (downloadError) {
        console.error('Audio download error:', downloadError);
        // Fallback: try sending with URL
        await gss.sendMessage(m.from, {
          audio: { url: data.downloadLink },
          mimetype: 'audio/mpeg',
          fileName: fileName,
          ptt: false
        }, { quoted: m });
      }

    } catch (err) {
      console.error('[SONG] Error:', err);
      await gss.sendMessage(m.from, {
        text: `❌ *Error Occurred*\nFailed to process your song request: ${err.message}\n\nPlease try again later.`,
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES AI🧑‍💻',
            serverMessageId: -1
          }
        }
      }, { quoted: m });
    }
  }
};

export default plugins;
