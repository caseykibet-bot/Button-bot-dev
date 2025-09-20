import axios from 'axios';
import config from '../config.cjs';

const imageCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  let query = m.body.slice(prefix.length + cmd.length).trim();

  const validCommands = ['image', 'img', 'gimage'];

  if (validCommands.includes(cmd)) {
    if (!query && !(m.quoted && m.quoted.text)) {
      return sock.sendMessage(m.from, { text: `❌ Please provide a search query\nExample: ${prefix + cmd} cute cats` });
    }

    if (!query && m.quoted && m.quoted.text) {
      query = m.quoted.text;
    }

    try {
      await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });
      await sock.sendMessage(m.from, { text: `🔍 Searching for *${query}*...` });

      // Primary API - David Cyril API
      const apiUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
      
      console.log(`Using David Cyril API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      let images = [];
      
      // Parse response from David Cyril API
      if (response.data && Array.isArray(response.data)) {
        images = response.data;
      } else if (response.data && response.data.images && Array.isArray(response.data.images)) {
        images = response.data.images;
      } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
        images = response.data.results;
      } else {
        throw new Error('Unexpected API response format');
      }

      // If no images found
      if (images.length === 0) {
        throw new Error('No images found for your query');
      }

      const maxImages = Math.min(images.length, 5);
      await sock.sendMessage(m.from, { text: `✅ Found ${images.length} images for *${query}*\nSending top ${maxImages}...` });

      let sentCount = 0;
      for (const [index, image] of images.slice(0, maxImages).entries()) {
        try {
          // Extract image URL from different possible response formats
          const imageUrl = image.url || image.imageUrl || image.link || image.src || 
                          image.largeImageURL || image.webformatURL || image.original;
          
          if (!imageUrl) {
            console.warn(`Image missing URL:`, image);
            continue;
          }

          const caption = `
╭───[ *ɪᴍᴀɢᴇ sᴇᴀʀᴄʜ* ]───
├ *ǫᴜᴇʀʏ*: ${query} 🔍
├ *ʀᴇsᴜʟᴛ*: ${index + 1} of ${maxImages} 🖼️
╰───[ *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴅᴀᴠɪᴅ ᴄʏʀɪʟ ᴀᴘɪ* ]───`.trim();

          await sock.sendMessage(
            m.from,
            {
              image: { url: imageUrl },
              caption: caption,
              contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1,
                isForwarded: true
              }
            },
            { quoted: m }
          );
          
          sentCount++;
          
          // Add delay between sending images
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.warn(`Failed to send image ${index + 1}:`, err.message);
          continue;
        }
      }

      if (sentCount > 0) {
        await sock.sendMessage(m.from, { react: { text: '✅', key: m.key } });
      } else {
        throw new Error('All image sending attempts failed');
      }

    } catch (error) {
      console.error('Image search error:', error);
      let errorMsg = '❌ Failed to fetch images 😞';
      
      if (error.message.includes('timeout')) {
        errorMsg = '❌ Request timed out ⏰';
      } else if (error.message.includes('No images found')) {
        errorMsg = '❌ No images found for your search query';
      } else if (error.message.includes('Unexpected API response')) {
        errorMsg = '❌ Image API returned unexpected format';
      } else if (error.response && error.response.status === 404) {
        errorMsg = '❌ Image search service unavailable';
      } else if (error.response && error.response.status) {
        errorMsg = `❌ API error: ${error.response.status}`;
      }
      
      await sock.sendMessage(m.from, { text: errorMsg });
      await sock.sendMessage(m.from, { react: { text: '❌', key: m.key } });
    }
  }
};

export default imageCommand;
