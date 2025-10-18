import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // TikTok Downloader Plugin
  if (['tiktok', 'tt', 'tiktokdl'].includes(cmd)) {
    try {
      const tiktokUrl = args[0];

      if (!tiktokUrl || !tiktokUrl.includes("tiktok.com")) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Please provide a valid TikTok URL.*\nExample: .tiktok https://vm.tiktok.com/abc123'
        }, { quoted: m });
      }

      // Send processing reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      let data;
      
      // Try primary API
      try {
        const res = await axios.get(`https://api.nexoracle.com/downloader/tiktok-nowm?apikey=free_key@maher_apis&url=${encodeURIComponent(tiktokUrl)}`, {
          timeout: 15000
        });
        if (res.data?.status === 200) data = res.data.result;
      } catch (primaryError) {
        console.log('Primary API failed, trying fallback...');
      }

      // Fallback API if primary fails
      if (!data) {
        try {
          const fallback = await axios.get(`https://api.tikwm.com/?url=${encodeURIComponent(tiktokUrl)}&hd=1`, {
            timeout: 15000
          });
          if (fallback.data?.data) {
            const r = fallback.data.data;
            data = {
              title: r.title,
              author: {
                username: r.author.unique_id,
                nickname: r.author.nickname
              },
              metrics: {
                digg_count: r.digg_count,
                comment_count: r.comment_count,
                share_count: r.share_count,
                download_count: r.download_count
              },
              url: r.play,
              thumbnail: r.cover
            };
          }
        } catch (fallbackError) {
          console.error('Fallback API also failed');
        }
      }

      if (!data) {
        return await gss.sendMessage(m.from, {
          text: '❌ *TikTok video not found or API services are down.*\nPlease try again later.'
        }, { quoted: m });
      }

      const { title, author, url, metrics, thumbnail } = data;

      // Download video first
      const videoResponse = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const videoBuffer = Buffer.from(videoResponse.data, 'binary');

      const caption = `🎬 *TikTok Downloader*\n
╭─❍ ᴄᴀsᴇʏʀʜᴏᴅᴇs-ᴡᴏʀʟᴅ ❍
┊🎵 *Title:* ${title || 'No title'}
┊👤 *Author:* @${author.username} (${author.nickname})
┊❤️ *Likes:* ${metrics.digg_count || 0}
┊💬 *Comments:* ${metrics.comment_count || 0}
┊🔁 *Shares:* ${metrics.share_count || 0}
┊📥 *Downloads:* ${metrics.download_count || 0}
╰─❍
> ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ`;

      // Send video with description in a single message
      await gss.sendMessage(m.from, {
        video: videoBuffer,
        caption: caption,
        contextInfo: {
          mentionedJid: [m.key.participant || m.key.remoteJid],
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
            serverMessageId: -1
          },
          externalAdReply: {
            title: 'TikTok Download',
            body: `By @${author.username}`,
            mediaType: 2,
            sourceUrl: tiktokUrl,
            thumbnailUrl: thumbnail
          }
        }
      }, { quoted: m });

      // Send success reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (err) {
      console.error("TikTok download error:", err);
      
      // Send error reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });

      await gss.sendMessage(m.from, {
        text: '❌ *Failed to process TikTok video.*\nPlease check the URL and try again.',
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
