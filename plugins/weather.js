import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Helper function to format messages
  const formatMessage = (title, content, footer) => {
    return `╭───[ *${title}* ]───\n├ ${content}\n╰──────────────┈⊷\n> *${footer}*`;
  };

  // Weather Plugin
  if (['weather', 'climate'].includes(cmd)) {
    try {
      // React to the command first
      await gss.sendMessage(m.from, {
        react: {
          text: "❄️",
          key: m.key
        }
      });

      const location = args.join(' ');

      if (!location) {
        return await gss.sendMessage(m.from, {
          text: '❄️ *Please provide a location to check the weather!*\n\n' +
                'Example: *.weather London*\n' +
                'Example: *.weather New York*\n' +
                'Example: *.weather Tokyo, Japan*'
        }, { quoted: m });
      }

      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: location,
          units: 'metric',
          appid: '060a6bcfa19809c2cd4d97a212b19273',
          language: 'en'
        }
      });

      const data = res.data;
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      const rain = data.rain ? data.rain['1h'] : 0;

      const text = `❄️ *🌸 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐖𝐄𝐀𝐓𝐇𝐄𝐑 🌸*\n\n` +
                   `*📍 Location:* ${data.name}, ${data.sys.country}\n\n` +
                   `🌡️ *Temperature:* ${data.main.temp}°C\n` +
                   `🤔 *Feels like:* ${data.main.feels_like}°C\n` +
                   `📉 *Min:* ${data.main.temp_min}°C  📈 *Max:* ${data.main.temp_max}°C\n` +
                   `📝 *Condition:* ${data.weather[0].description}\n` +
                   `💧 *Humidity:* ${data.main.humidity}%\n` +
                   `🌬️ *Wind:* ${data.wind.speed} m/s\n` +
                   `☁️ *Cloudiness:* ${data.clouds.all}%\n` +
                   `🌧️ *Rain (last hour):* ${rain} mm\n` +
                   `🌄 *Sunrise:* ${sunrise}\n` +
                   `🌅 *Sunset:* ${sunset}\n` +
                   `🧭 *Coordinates:* ${data.coord.lat}, ${data.coord.lon}\n\n` +
                   `_Powered by CaseyRhodes Tech_ 🌟`;

      await gss.sendMessage(m.from, {
        text: text,
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

    } catch (error) {
      console.error('[WEATHER ERROR]', error);
      await gss.sendMessage(m.from, {
        text: '❌ *Failed to fetch weather data!*\n\n' +
              'Please check:\n' +
              '• Location spelling\n' +
              '• Internet connection\n' +
              '• Try a different location\n\n' +
              'Example: *.weather Paris* or *.weather Mumbai*'
      }, { quoted: m });
    }
  }

  // Whois Plugin
  if (cmd === 'whois') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '👤', key: m.key } 
      });
      
      const domain = args[0];
      if (!domain) {
        await gss.sendMessage(m.from, { 
          text: '📌 Usage: .whois <domain>' 
        }, { quoted: m });
        return;
      }
      
      const response = await fetch(`http://api.whois.vu/?whois=${encodeURIComponent(domain)}`);
      const data = await response.json();
      
      if (!data.domain) {
        throw new Error('Domain not found');
      }
      
      const whoisMessage = formatMessage(
        '🔍 WHOIS LOOKUP',
        `🌐 Domain: ${data.domain}\n` +
        `📅 Registered: ${data.created_date || 'N/A'}\n` +
        `⏰ Expires: ${data.expiry_date || 'N/A'}\n` +
        `📋 Registrar: ${data.registrar || 'N/A'}\n` +
        `📍 Status: ${data.status?.join(', ') || 'N/A'}`,
        'ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴍɪɴɪ ʙᴏᴛ'
      );
      
      await gss.sendMessage(m.from, { 
        text: whoisMessage,
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
      
    } catch (error) {
      console.error('Whois command error:', error);
      await gss.sendMessage(m.from, { 
        text: '❌ Oh, darling, couldn\'t find that domain! 😢 Try again?',
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
