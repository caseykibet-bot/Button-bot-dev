import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Screenshot Plugin
  if (['screenshot', 'ss', 'ssweb'].includes(cmd)) {
    try {
      const url = args[0];

      if (!url) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Please provide a valid URL.*\nExample: `.screenshot https://github.com`'
        }, { quoted: m });
      }

      // Validate the URL
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Invalid URL.* Please include "http://" or "https://".'
        }, { quoted: m });
      }

      // Send processing reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      // Generate the screenshot URL using Thum.io API
      const screenshotUrl = `https://image.thum.io/get/fullpage/${url}`;

      // Send the screenshot as an image message
      await gss.sendMessage(m.from, {
        image: { url: screenshotUrl },
        caption: `🌐 *Website Screenshot*\n\n🔗 *URL:* ${url}\n\n> ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ`,
        contextInfo: {
          mentionedJid: [m.key.participant || m.key.remoteJid],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ🎀',
            serverMessageId: -1
          },
          externalAdReply: {
            title: 'Website Screenshot',
            body: 'Powered by Thum.io API',
            mediaType: 1,
            sourceUrl: url,
            thumbnailUrl: screenshotUrl
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

    } catch (error) {
      console.error("Screenshot Error:", error);
      
      // Send error reaction
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      
      await gss.sendMessage(m.from, {
        text: '❌ *Failed to capture the screenshot.*\nThe website may be blocking screenshots or the URL might be invalid.',
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
