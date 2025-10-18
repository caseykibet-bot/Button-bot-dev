import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).trim().split(/ +/).slice(1) : [];

  // Lyrics Plugin
  if (cmd === 'lyrics') {
    try {
      // React to the command first
      await gss.sendMessage(m.from, {
        react: {
          text: "🎶",
          key: m.key
        }
      });

      const query = args.join(' ');

      if (!query) {
        return await gss.sendMessage(m.from, {
          text: '🎶 *Please provide a song name and artist...*\n\n' +
                'Example: *.lyrics not afraid Eminem*\n' +
                'Example: *.lyrics shape of you Ed Sheeran*',
          buttons: [ 
            { buttonId: `${prefix}lyrics shape of you`, buttonText: { displayText: '🎵 Example 1' }, type: 1 },
            { buttonId: `${prefix}lyrics not afraid`, buttonText: { displayText: '🎵 Example 2' }, type: 1 }
          ]
        }, { quoted: m });
      }

      const apiURL = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(query)}`;
      const res = await axios.get(apiURL);
      const data = res.data;

      if (!data.success || !data.result || !data.result.lyrics) {
        return await gss.sendMessage(m.from, {
          text: '❌ *Lyrics not found for the provided query.*\n\n' +
                'Please check the song name and artist spelling.',
          buttons: [
            { buttonId: `${prefix}help lyrics`, buttonText: { displayText: '❓ Help' }, type: 1 },
            { buttonId: `${prefix}lyrics`, buttonText: { displayText: '🔍 Try Again' }, type: 1 }
          ]
        }, { quoted: m });
      }

      const { title, artist, image, link, lyrics } = data.result;
      const shortLyrics = lyrics.length > 4096 ? lyrics.slice(0, 4093) + '...' : lyrics;

      const caption =
        `🎶 *🌸 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐋𝐘𝐑𝐈𝐂𝐒 🌸*\n\n` +
        `*🎵 Title:* ${title}\n` +
        `*👤 Artist:* ${artist}\n` +
        `*🔗 Link:* ${link}\n\n` +
        `📜 *Lyrics:*\n\n` +
        `${shortLyrics}\n\n` +
        `> _Powered by CaseyRhodes Tech_ 🌟`;

      await gss.sendMessage(m.from, {
        image: { url: image },
        caption: caption,
        buttons: [
          { buttonId: `${prefix}play ${query}`, buttonText: { displayText: '🎵 Play Song' }, type: 1 },
          { buttonId: `${prefix}song ${query}`, buttonText: { displayText: '📺 YouTube' }, type: 1 },
          { buttonId: `${prefix}lyrics`, buttonText: { displayText: '🔍 New Search' }, type: 1 }
        ],
        contextInfo: {
          forwardingScore: 1,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363402973786789@newsletter',
            newsletterName: 'CASEYRHODES-MINI🌸',
            serverMessageId: -1
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error('[LYRICS ERROR]', err);
      await gss.sendMessage(m.from, {
        text: '❌ *An error occurred while fetching lyrics!*\n\n' +
              'Please try again later or check your internet connection.',
        buttons: [
          { buttonId: `${prefix}lyrics`, buttonText: { displayText: '🔄 Retry' }, type: 1 },
          { buttonId: `${prefix}help`, buttonText: { displayText: '❓ Help' }, type: 1 }
        ]
      }, { quoted: m });
    }
  }
};

export default plugins;
