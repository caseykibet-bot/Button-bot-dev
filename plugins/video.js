import axios from "axios";
import yts from "yt-search";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];
  const text = args.join(' ');

  // Define BASE_URL
  const BASE_URL = config.BASE_URL || 'https://noobs-api.top';

  // Store video data temporarily for format selection
  let videoData = {};

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

      // Store video data for later use
      videoData[m.sender] = {
        video: video,
        type: 'video'
      };

      // Create video description with format selection buttons
      const videoInfo = `
🎬 *VIDEO FOUND* 🎬

📹 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}

⬇️ *Choose download format:* ⬇️
      `.trim();

      // Send video info with format selection buttons
      await gss.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption: videoInfo,
        buttons: [
          { buttonId: `${prefix}videoformat mp4`, buttonText: { displayText: '🎥 Video (MP4)' }, type: 1 },
          { buttonId: `${prefix}videoformat document`, buttonText: { displayText: '📄 Document (MP4)' }, type: 1 },
          { buttonId: `${prefix}cancel`, buttonText: { displayText: '❌ Cancel' }, type: 1 }
        ]
      }, { quoted: m });

    } catch (err) {
      console.error('[VIDEO] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Error Occurred*\nFailed to process your video request. Please try again later.'
      }, { quoted: m });
    }
  }

  // Song Download Plugin
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

      // Store video data for later use
      videoData[m.sender] = {
        video: video,
        type: 'audio'
      };

      // Create song description with format selection buttons
      const songInfo = `
🎧 *SONG FOUND* 🎧

📀 *Title:* ${video.title}
⏱️ *Duration:* ${video.timestamp}
👁️ *Views:* ${video.views}
📅 *Uploaded:* ${video.ago}

⬇️ *Choose download format:* ⬇️
      `.trim();

      // Send song info with format selection buttons
      await gss.sendMessage(m.from, {
        image: { url: video.thumbnail },
        caption: songInfo,
        buttons: [
          { buttonId: `${prefix}audioformat audio`, buttonText: { displayText: '🎵 Audio (MP3)' }, type: 1 },
          { buttonId: `${prefix}audioformat document`, buttonText: { displayText: '📄 Document (MP3)' }, type: 1 },
          { buttonId: `${prefix}cancel`, buttonText: { displayText: '❌ Cancel' }, type: 1 }
        ]
      }, { quoted: m });

    } catch (err) {
      console.error('[SONG] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Error Occurred*\nFailed to process your song request. Please try again later.'
      }, { quoted: m });
    }
  }

  // Video Format Selection Handler
  if (cmd === 'videoformat') {
    const format = args[0];
    const userVideoData = videoData[m.sender];

    if (!userVideoData || userVideoData.type !== 'video') {
      return await gss.sendMessage(m.from, {
        text: '❌ *No video selected*\nPlease search for a video first using .video command.'
      }, { quoted: m });
    }

    if (!['mp4', 'document'].includes(format)) {
      return await gss.sendMessage(m.from, {
        text: '❌ *Invalid format*\nPlease choose either MP4 or Document format.'
      }, { quoted: m });
    }

    try {
      const video = userVideoData.video;
      
      // Send downloading message
      await gss.sendMessage(m.from, {
        text: `⏳ *Downloading ${format === 'document' ? 'document' : 'video'}...*`
      }, { quoted: m });

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.${format === 'document' ? 'mp4' : 'mp4'}`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp4`;

      const response = await axios.get(apiURL, { timeout: 30000 });
      const data = response.data;

      if (!data.downloadLink) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Download Failed*\nFailed to retrieve the download link. Please try again later.'
        }, { quoted: m });
      }

      // Send video based on format selection
      if (format === 'document') {
        // Send as document
        await gss.sendMessage(m.from, {
          document: { url: data.downloadLink },
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n📥 Downloaded by CaseyRhodes-XMD (Document)`
        }, { quoted: m });
      } else {
        // Send as video
        await gss.sendMessage(m.from, {
          video: { url: data.downloadLink },
          mimetype: 'video/mp4',
          fileName: fileName,
          caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp} | 👁️ ${video.views}\n\n📥 Downloaded by CaseyRhodes-XMD`,
          contextInfo: {
            externalAdReply: {
              title: video.title.substring(0, 40),
              body: `Duration: ${video.timestamp} | Views: ${video.views}`,
              mediaType: 2,
              thumbnailUrl: video.thumbnail,
              sourceUrl: `https://youtu.be/${video.videoId}`,
              renderLargerThumbnail: false
            }
          }
        }, { quoted: m });
      }

      // Clean up stored data
      delete videoData[m.sender];

    } catch (err) {
      console.error('[VIDEO FORMAT] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Download Failed*\nFailed to download the video. Please try again later.'
      }, { quoted: m });
      delete videoData[m.sender];
    }
  }

  // Audio Format Selection Handler
  if (cmd === 'audioformat') {
    const format = args[0];
    const userVideoData = videoData[m.sender];

    if (!userVideoData || userVideoData.type !== 'audio') {
      return await gss.sendMessage(m.from, {
        text: '❌ *No song selected*\nPlease search for a song first using .song command.'
      }, { quoted: m });
    }

    if (!['audio', 'document'].includes(format)) {
      return await gss.sendMessage(m.from, {
        text: '❌ *Invalid format*\nPlease choose either Audio or Document format.'
      }, { quoted: m });
    }

    try {
      const video = userVideoData.video;
      
      // Send downloading message
      await gss.sendMessage(m.from, {
        text: `⏳ *Downloading ${format === 'document' ? 'document' : 'audio'}...*`
      }, { quoted: m });

      const safeTitle = video.title.replace(/[\\/:*?"<>|]/g, '');
      const fileName = `${safeTitle}.${format === 'document' ? 'mp3' : 'mp3'}`;
      const apiURL = `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(video.videoId)}&format=mp3`;

      const response = await axios.get(apiURL, { timeout: 30000 });
      const data = response.data;

      if (!data.downloadLink) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Download Failed*\nFailed to retrieve the download link. Please try again later.'
        }, { quoted: m });
      }

      // Send audio based on format selection
      if (format === 'document') {
        // Send as document
        await gss.sendMessage(m.from, {
          document: { url: data.downloadLink },
          mimetype: 'audio/mpeg',
          fileName: fileName,
          caption: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n\n📥 Downloaded by CaseyRhodes-XMD (Document)`
        }, { quoted: m });
      } else {
        // Send as audio
        await gss.sendMessage(m.from, {
          audio: { url: data.downloadLink },
          mimetype: 'audio/mpeg',
          fileName: fileName,
          ptt: false,
          caption: `🎵 *${video.title}*\n⏱️ ${video.timestamp}\n\n📥 Downloaded by CaseyRhodes-XMD`,
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
      }

      // Clean up stored data
      delete videoData[m.sender];

    } catch (err) {
      console.error('[AUDIO FORMAT] Error:', err);
      await gss.sendMessage(m.from, {
        text: '❌ *Download Failed*\nFailed to download the audio. Please try again later.'
      }, { quoted: m });
      delete videoData[m.sender];
    }
  }

  // Cancel Handler
  if (cmd === 'cancel') {
    if (videoData[m.sender]) {
      delete videoData[m.sender];
      await gss.sendMessage(m.from, {
        text: '✅ *Download cancelled*'
      }, { quoted: m });
    }
  }
};

export default plugins;
