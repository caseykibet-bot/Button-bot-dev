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

      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink) {
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

      // Send video with enhanced metadata and newsletter
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
          },
          externalAdReply: {
            title: video.title.substring(0, 40),
            body: `Duration: ${video.timestamp} | Views: ${video.views}`,
            mediaType: 2, // 2 for video
            thumbnailUrl: video.thumbnail,
            sourceUrl: `https://youtu.be/${video.videoId}`,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error('[VIDEO] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Error Occurred*\nFailed to process your video request. Please try again later.',
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

      const response = await axios.get(apiURL);
      const data = response.data;

      if (!data.downloadLink) {
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

      // Send audio with small thumbnail (NO NEWSLETTER on audio)
      await gss.sendMessage(m.from, {
        audio: { url: data.downloadLink },
        mimetype: 'audio/mpeg',
        fileName: fileName,
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: video.title.substring(0, 40),
            body: `Duration: ${video.timestamp}`,
            mediaType: 1,
            thumbnailUrl: video.thumbnail,
            sourceUrl: `https://youtu.be/${video.videoId}`,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error('[SONG] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Error Occurred*\nFailed to process your song request. Please try again later.',
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
