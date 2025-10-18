import axios from 'axios';
import fs from 'fs';
import path from "path";
import AdmZip from "adm-zip";
import config from '../config.cjs';

// You'll need to import these from your main file or define them
let setCommitHash, getCommitHash;

const plugins = async (m, gss, { isOwner = false, commitDB = null } = {}) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Set the commit hash functions if provided
  if (commitDB) {
    setCommitHash = commitDB.setCommitHash;
    getCommitHash = commitDB.getCommitHash;
  }

  // Update Plugin
  if (['update', 'upgrade', 'sync'].includes(cmd)) {
    if (!isOwner) {
      return await gss.sendMessage(m.from, {
        text: "❌ This command is only for the bot owner."
      }, { quoted: m });
    }

    // Newsletter configuration (only for success message)
    const newsletterConfig = {
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐔𝐏𝐃𝐀𝐓𝐄𝐒',
          serverMessageId: 143
        }
      }
    };

    let updateMessage = null;

    try {
      // Send initial message and store it for editing
      updateMessage = await gss.sendMessage(m.from, {
        text: "🔍 *Checking for CASEYRHODES-XMD updates...*"
      }, { quoted: m });

      // Fetch the latest commit hash from GitHub
      const { data: commitData } = await axios.get("https://api.github.com/repos/caseykibet-bot/Button-bot-dev/commits/main");
      const latestCommitHash = commitData.sha;
      const currentHash = getCommitHash ? await getCommitHash() : null;

      if (latestCommitHash === currentHash) {
        await gss.relayMessage(m.from, {
          protocolMessage: {
            key: updateMessage.key,
            type: 14,
            editedMessage: {
              conversation: "✅ *Your CASEYRHODES-XMD bot is already up-to-date!*"
            }
          }
        }, {});
        return;
      }

      // Update the message with progress
      await gss.relayMessage(m.from, {
        protocolMessage: {
          key: updateMessage.key,
          type: 14,
          editedMessage: {
            conversation: "🚀 *Updating CASEYRHODES-XMD Bot...*\n\n_This may take a few moments..._"
          }
        }
      }, {});

      // Download the latest code
      const zipPath = path.join(process.cwd(), "latest.zip");
      const { data: zipData } = await axios.get("https://github.com/caseykibet-bot/Button-bot-dev/archive/main.zip", { 
        responseType: "arraybuffer",
        headers: {
          'User-Agent': 'CASEYRHODES-XMD-Bot'
        }
      });
      fs.writeFileSync(zipPath, zipData);

      // Update message for extraction
      await gss.relayMessage(m.from, {
        protocolMessage: {
          key: updateMessage.key,
          type: 14,
          editedMessage: {
            conversation: "📦 *Extracting the latest code...*"
          }
        }
      }, {});

      // Extract ZIP file
      const extractPath = path.join(process.cwd(), 'latest');
      const zip = new AdmZip(zipPath);
      zip.extractAllTo(extractPath, true);

      // Update message for file replacement
      await gss.relayMessage(m.from, {
        protocolMessage: {
          key: updateMessage.key,
          type: 14,
          editedMessage: {
            conversation: "🔄 *Replacing files while preserving your config...*"
          }
        }
      }, {});

      // Copy updated files
      const sourcePath = path.join(extractPath, "CASEYRHODES-XMD-main");
      const destinationPath = process.cwd();
      copyFolderSync(sourcePath, destinationPath);

      // Save the latest commit hash
      if (setCommitHash) {
        await setCommitHash(latestCommitHash);
      }

      // Cleanup
      fs.unlinkSync(zipPath);
      fs.rmSync(extractPath, { recursive: true, force: true });

      // Final success message with newsletter (only here)
      await gss.relayMessage(m.from, {
        protocolMessage: {
          key: updateMessage.key,
          type: 14,
          editedMessage: {
            conversation: "✅ *Update complete!*\n\n_Restarting the bot to apply changes..._\n\n⚡ Powered by CASEYRHODES-TECH"
          }
        }
      }, {});

      // Send image with newsletter configuration
      await gss.sendMessage(m.from, {
        image: { 
          url: "https://i.ibb.co/wN6Gw0ZF/lordcasey.jpg",
          mimetype: "image/jpeg"
        },
        caption: "✅ *Update Complete!*",
        ...newsletterConfig
      }, { quoted: m });

      // Restart the bot after a short delay
      setTimeout(() => {
        process.exit(0);
      }, 2000);

    } catch (error) {
      console.error("Update error:", error);
      
      // Edit the message to show error if it exists
      if (updateMessage) {
        await gss.relayMessage(m.from, {
          protocolMessage: {
            key: updateMessage.key,
            type: 14,
            editedMessage: {
              conversation: `❌ *Update failed!*\n\nError: ${error.message}\n\nPlease try manually or contact support.`
            }
          }
        }, {});
      } else {
        // Fallback to sending a new message
        await gss.sendMessage(m.from, {
          text: `❌ *Update failed!*\n\nError: ${error.message}\n\nPlease try manually or contact support.`
        }, { quoted: m });
      }
    }
  }
};

// Improved directory copy function
function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const destPath = path.join(target, item);

    // Skip sensitive files
    const preservedFiles = ["config.js", "config.cjs", "app.json", "credentials.json", "data", "node_modules", ".git"];
    if (preservedFiles.includes(item)) {
      console.log(`⚠️ Preserving existing file: ${item}`);
      continue;
    }

    try {
      const stat = fs.lstatSync(srcPath);
      if (stat.isDirectory()) {
        copyFolderSync(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (copyError) {
      console.error(`Failed to copy ${item}:`, copyError);
    }
  }
}

export default plugins;
