import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // URL Shortener Plugin
  if (['tiny', 'short', 'shorturl'].includes(cmd)) {
    console.log("Command tiny triggered");
    
    if (!args[0]) {
      console.log("No URL provided");
      return await gss.sendMessage(m.from, {
        text: "*🏷️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴍᴇ ᴀ ʟɪɴᴋ.*",
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

    try {
      const link = args[0];
      console.log("URL to shorten:", link);
      const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
      const shortenedUrl = response.data;

      console.log("Shortened URL:", shortenedUrl);
      
      // Fetch an image for thumbnail (using a generic URL shortener icon)
      const thumbnailResponse = await axios.get('https://cdn-icons-png.flaticon.com/512/1006/1006771.png', { 
        responseType: 'arraybuffer' 
      });
      const thumbnailBuffer = Buffer.from(thumbnailResponse.data);
      
      const messageOptions = {
        text: `*🧑‍💻 YOUR SHORTENED URL*\n\n${shortenedUrl}`,
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
            title: 'powered by caseyrhodes tech 👻',
            body: 'Link shortened successfully',
            mediaType: 1,
            sourceUrl: link,
            thumbnail: thumbnailBuffer
          }
        }
      };
      
      return await gss.sendMessage(m.from, messageOptions, { quoted: m });
    } catch (e) {
      console.error("Error shortening URL:", e);
      return await gss.sendMessage(m.from, {
        text: "❌ An error occurred while shortening the URL. Please try again.",
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
