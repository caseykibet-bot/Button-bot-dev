import fs from 'fs';
import path from 'path';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

const plugins = async (m, gss) => {
  const prefix = '.';
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Set Profile Picture Plugin
  if (cmd === 'setpp') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🖼️', key: m.key } 
      });
      
      // Check if user is owner
      const isOwner = m.key.fromMe || m.sender === (config?.OWNER_NUMBER || '') + '@s.whatsapp.net';
      if (!isOwner) {
        await gss.sendMessage(m.from, { 
          text: '❌ *Owner Only Command*\n\nThis command is only available for the bot owner!' 
        }, { quoted: m });
        await gss.sendMessage(m.from, { react: { text: '🚫', key: m.key } });
        return;
      }

      // Check if message is a reply
      const quotedMessage = m.quoted?.message;
      if (!quotedMessage) {
        await gss.sendMessage(m.from, { 
          text: '📸 *How to Use*\n\nPlease reply to an image with the `.setpp` command!\n\nExample: Reply to an image and type `.setpp`'
        }, { quoted: m });
        await gss.sendMessage(m.from, { react: { text: 'ℹ️', key: m.key } });
        return;
      }

      // Check if quoted message contains an image
      const imageMessage = quotedMessage.imageMessage || quotedMessage.stickerMessage;
      if (!imageMessage) {
        await gss.sendMessage(m.from, { 
          text: '❌ *Invalid Media*\n\nThe replied message must contain an image or sticker!\n\nSupported formats: JPG, PNG, WebP'
        }, { quoted: m });
        await gss.sendMessage(m.from, { react: { text: '❌', key: m.key } });
        return;
      }

      // Create tmp directory if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Download the image
      await gss.sendMessage(m.from, { 
        text: '⏳ Downloading image...' 
      }, { quoted: m });

      const stream = await downloadContentFromMessage(imageMessage, 'image');
      let buffer = Buffer.from([]);
      
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      const imagePath = path.join(tmpDir, `profile_${Date.now()}.jpg`);
      
      // Save the image
      fs.writeFileSync(imagePath, buffer);

      await gss.sendMessage(m.from, { 
        text: '🔄 Setting profile picture...' 
      }, { quoted: m });

      // Set the profile picture
      await gss.updateProfilePicture(gss.user.id, { url: imagePath });

      // Clean up the temporary file
      fs.unlinkSync(imagePath);

      await gss.sendMessage(m.from, { 
        text: '✅ *Profile Picture Updated!*\n\nBot profile picture has been successfully updated!' 
      }, { quoted: m });
      
      await gss.sendMessage(m.from, { react: { text: '✅', key: m.key } });

    } catch (error) {
      console.error('Error in setpp command:', error);
      
      let errorMessage = '❌ *Update Failed*\n\nFailed to update profile picture!';
      
      if (error.message.includes('rate')) {
        errorMessage = '❌ *Rate Limited*\n\nPlease wait a few minutes before changing profile picture again.';
      } else if (error.message.includes('size')) {
        errorMessage = '❌ *File Too Large*\n\nPlease use a smaller image file.';
      } else if (error.message.includes('format')) {
        errorMessage = '❌ *Invalid Format*\n\nPlease use a valid image format (JPG, PNG).';
      }
      
      await gss.sendMessage(m.from, { 
        text: errorMessage 
      }, { quoted: m });
      
      await gss.sendMessage(m.from, { react: { text: '❌', key: m.key } });
    }
  }
};

export default plugins;
