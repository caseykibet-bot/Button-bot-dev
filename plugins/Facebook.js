import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Facebook Downloader Plugin
  if (['fbdl', 'facebook', 'fbvideo', 'fb'].includes(cmd)) {
    try {
      // Extract query from message
      const q = m.body || '';
      const args = q.split(' ').slice(1);
      const fbUrl = args[0];

      if (!fbUrl || !fbUrl.includes("facebook.com")) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Please provide a valid Facebook video URL.*\nExample: .fbdl https://facebook.com/video/123'
        }, { quoted: m });
      }

      // Send processing reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      // Prepare the primary API URL
      const primaryApiUrl = `https://apis.davidcyriltech.my.id/facebook2?url=${encodeURIComponent(fbUrl)}`;
      
      // Prepare fallback APIs
      const fallbackApis = [
        `https://kaiz-apis.gleeze.com/api/fbdl?url=${encodeURIComponent(fbUrl)}&apikey=cf2ca612-296f-45ba-abbc-473f18f991eb`,
        `https://api.giftedtech.web.id/api/download/facebook?apikey=gifted&url=${encodeURIComponent(fbUrl)}`
      ];

      let videoData = null;
      let apiIndex = 0;
      const apis = [primaryApiUrl, ...fallbackApis];

      // Try each API until we get a successful response
      while (apiIndex < apis.length && !videoData) {
        try {
          const response = await axios.get(apis[apiIndex], { timeout: 15000 });
          
          // Parse response based on which API responded
          if (apiIndex === 0) {
            // Primary API response format
            if (response.data && response.data.status && response.data.video) {
              const { title, thumbnail, downloads } = response.data.video;
              videoData = {
                title: title || "Facebook Video",
                thumbnail,
                downloadUrl: downloads.find(d => d.quality === "HD")?.downloadUrl || downloads[0]?.downloadUrl,
                quality: downloads.find(d => d.quality === "HD") ? "HD" : "SD"
              };
            }
          } else if (apiIndex === 1) {
            // Kaiz API response format
            if (response.data && response.data.videoUrl) {
              videoData = {
                title: response.data.title || "Facebook Video",
                thumbnail: response.data.thumbnail,
                downloadUrl: response.data.videoUrl,
                quality: response.data.quality || "HD"
              };
            }
          } else if (apiIndex === 2) {
            // GiftedTech API response format
            if (response.data && response.data.success && response.data.result) {
              const result = response.data.result;
              videoData = {
                title: result.title || "Facebook Video",
                thumbnail: result.thumbnail,
                downloadUrl: result.hd_video || result.sd_video,
                quality: result.hd_video ? "HD" : "SD"
              };
            }
          }
        } catch (error) {
          console.error(`Error with API ${apiIndex}:`, error.message);
        }
        apiIndex++;
      }

      if (!videoData) {
        await gss.sendMessage(m.from, {
          react: {
            text: "❌",
            key: m.key
          }
        });
        return await gss.sendMessage(m.from, {
          text: '❌ *All download services failed.*\nPlease try again later or use a different Facebook URL.'
        }, { quoted: m });
      }

      // Send downloading message
      const loadingMsg = await gss.sendMessage(m.from, {
        text: '⏳ *Downloading Facebook video... Please wait* 📥'
      }, { quoted: m });

      try {
        // Download the video with timeout
        const videoResponse = await axios.get(videoData.downloadUrl, { 
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!videoResponse.data) {
          throw new Error('Empty video response');
        }

        // Prepare the video buffer
        const videoBuffer = Buffer.from(videoResponse.data, 'binary');

        // Send the video with details
        await gss.sendMessage(m.from, {
          video: videoBuffer,
          caption: `📥 *Facebook Video Download*\n\n` +
              `🔖 *Title:* ${videoData.title}\n` +
              `📏 *Quality:* ${videoData.quality}\n\n` +
              `> ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ`,
          contextInfo: {
            mentionedJid: [m.key.participant || m.key.remoteJid],
            externalAdReply: {
              title: 'Facebook Video Download',
              body: `Quality: ${videoData.quality}`,
              mediaType: 2,
              sourceUrl: fbUrl,
              thumbnailUrl: videoData.thumbnail
            }
          }
        }, { quoted: m });

        // Delete the loading message
        await gss.sendMessage(m.from, {
          delete: loadingMsg.key
        });

        // Send success reaction
        await gss.sendMessage(m.from, {
          react: {
            text: "✅",
            key: m.key
          }
        });

      } catch (downloadError) {
        console.error('Video download failed:', downloadError);
        await gss.sendMessage(m.from, {
          text: '❌ *Failed to download video.*\nThe video might be too large or restricted.'
        }, { quoted: m });
      }

    } catch (error) {
      console.error('Facebook download error:', error);
      
      // Send error reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });

      await gss.sendMessage(m.from, {
        text: '❌ *Unable to process Facebook video.*\nPlease check the URL and try again later.'
      }, { quoted: m });
    }
  }
};

export default plugins;
