import axios from "axios";
import config from '../config.cjs';

const plugins = async (m, gss) => {
  const prefix = config.PREFIX;
  const bodyText = m.body || '';
  const cmd = bodyText.startsWith(prefix) ? bodyText.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  // Joke Plugin
  if (cmd === 'joke') {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const { data } = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 15000 });
      if (!data?.setup || !data?.punchline) {
        throw new Error('Failed to fetch joke');
      }

      const caption = `
╭━━〔 *ʀᴀɴᴅᴏᴍ ᴊᴏᴋᴇ* 〕━━┈⊷
├ *sᴇᴛᴜᴘ*: ${data.setup} 🤡
├ *ᴘᴜɴᴄʜʟɪɴᴇ*: ${data.punchline} 😂
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Joke error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch joke* 😞'
      }, { quoted: m });
    }
  }

  // Waifu Plugin
  if (cmd === 'waifu') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🥲', key: m.key } 
      });
      
      const res = await fetch('https://api.waifu.pics/sfw/waifu');
      const data = await res.json();
      
      if (!data || !data.url) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch waifu image.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, {
        image: { url: data.url },
        caption: '✨ Here\'s your random waifu!'
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to get waifu.' 
      }, { quoted: m });
    }
  }

  // Meme Plugin
  if (cmd === 'meme') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '😂', key: m.key } 
      });
      
      const res = await fetch('https://meme-api.com/gimme');
      const data = await res.json();
      
      if (!data || !data.url) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch meme.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, {
        image: { url: data.url },
        caption: `🤣 *${data.title}*`
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch meme.' 
      }, { quoted: m });
    }
  }

  // Readmore Plugin
  if (['readmore', 'rm', 'rmore', 'readm'].includes(cmd)) {
    try {
      const q = m.body || '';
      const args = q.split(' ').slice(1);
      const inputText = args.join(' ') || 'No text provided';

      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const readMore = String.fromCharCode(8206).repeat(4000);
      const message = `${inputText}${readMore} *Continue Reading...*`;

      const caption = `
╭───[ *ʀᴇᴀᴅ ᴍᴏʀᴇ* ]───
├ *ᴛᴇxᴛ*: ${message} 📝
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Readmore error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: `❌ *Error creating read more:* ${error.message || 'unknown error'}`
      }, { quoted: m });
    }
  }

  // Cat Plugin
  if (cmd === 'cat') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🐱', key: m.key } 
      });
      
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();
      
      if (!data || !data[0]?.url) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch cat image.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, {
        image: { url: data[0].url },
        caption: '🐱 Meow~ Here\'s a cute cat for you!',
        buttons: [
          { buttonId: `${prefix}cat`, buttonText: { displayText: '🐱 Another Cat' }, type: 1 }
        ]
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch cat image.',
        buttons: [
          { buttonId: `${prefix}cat`, buttonText: { displayText: '🔄 Try Again' }, type: 1 }
        ]
      }, { quoted: m });
    }
  }

  // Dog Plugin
  if (cmd === 'dog') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🦮', key: m.key } 
      });
      
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      
      if (!data || !data.message) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch dog image.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, {
        image: { url: data.message },
        caption: '🐶 Woof! Here\'s a cute dog!',
        buttons: [
          { buttonId: `${prefix}dog`, buttonText: { displayText: '🐶 Another Dog' }, type: 1 }
        ]
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch dog image.',
        buttons: [
          { buttonId: `${prefix}dog`, buttonText: { displayText: '🔄 Try Again' }, type: 1 }
        ]
      }, { quoted: m });
    }
  }

  // Fact Plugin
  if (cmd === 'fact') {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const { data } = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 15000 });
      if (!data?.text) throw new Error('Failed to fetch fact');

      const caption = `
╭───[ *ʀᴀɴᴅᴏᴍ ғᴀᴄᴛ* ]───
├ *ғᴀᴄᴛ*: ${data.text} 🧠
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Fact error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch fun fact* 😞'
      }, { quoted: m });
    }
  }

  // Flirt Plugin
  if (['flirt', 'masom', 'line'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const res = await fetch('https://shizoapi.onrender.com/api/texts/flirt?apikey=shizo', { timeout: 15000 });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { result } = await res.json();
      if (!result) throw new Error('Invalid API response');

      const caption = `
╭───[ *ғʟɪʀᴛ ʟɪɴᴇ* ]───
├ *ʟɪɴᴇ*: ${result} 💘
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Flirt error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch flirt line* 😞'
      }, { quoted: m });
    }
  }

  // Dark Joke Plugin
  if (['darkjoke', 'darkhumor'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '😬', key: m.key } 
      });
      
      const res = await fetch('https://v2.jokeapi.dev/joke/Dark?type=single');
      const data = await res.json();
      
      if (!data || !data.joke) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch a dark joke.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, { 
        text: `🌚 *Dark Humor:*\n\n${data.joke}` 
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch dark joke.' 
      }, { quoted: m });
    }
  }

  // Truth Plugin
  if (['truth', 'truthquestion'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const res = await fetch('https://shizoapi.onrender.com/api/texts/truth?apikey=shizo', { timeout: 15000 });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { result } = await res.json();
      if (!result) throw new Error('Invalid API response');

      const caption = `
╭───[ *ᴛʀᴜᴛʜ ǫᴜᴇsᴛɪᴏɴ* ]───
├ *ǫᴜᴇsᴛɪᴏɴ*: ${result} ❓
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Truth error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch truth question* 😞'
      }, { quoted: m });
    }
  }

  // Insult Plugin
  if (cmd === 'insult') {
    try {
      const insults = [
        "You're like a cloud. When you disappear, it's a beautiful day!",
        "You bring everyone so much joy when you leave the room!",
        "I'd agree with you, but then we'd both be wrong.",
        "You're not stupid; you just have bad luck thinking.",
        "Your secrets are always safe with me. I never even listen to them.",
        "You're proof that even evolution takes a break sometimes.",
        "You have something on your chin... no, the third one down.",
        "You're like a software update. Whenever I see you, I think, 'Do I really need this right now?'",
        "You bring everyone happiness... you know, when you leave.",
        "You're like a penny—two-faced and not worth much.",
        "You have something on your mind... oh wait, never mind.",
        "You're the reason they put directions on shampoo bottles.",
        "You're like a cloud. Always floating around with no real purpose.",
        "Your jokes are like expired milk—sour and hard to digest.",
        "You're like a candle in the wind... useless when things get tough.",
        "You have something unique—your ability to annoy everyone equally.",
        "You're like a Wi-Fi signal—always weak when needed most.",
        "You're proof that not everyone needs a filter to be unappealing.",
        "Your energy is like a black hole—it just sucks the life out of the room.",
        "You have the perfect face for radio.",
        "You're like a traffic jam—nobody wants you, but here you are.",
        "You're like a broken pencil—pointless.",
        "Your ideas are so original, I'm sure I've heard them all before.",
        "You're living proof that even mistakes can be productive.",
        "You're not lazy; you're just highly motivated to do nothing.",
        "Your brain's running Windows 95—slow and outdated.",
        "You're like a speed bump—nobody likes you, but everyone has to deal with you.",
        "You're like a cloud of mosquitoes—just irritating.",
        "You bring people together... to talk about how annoying you are."
      ];

      await gss.sendMessage(m.from, {
        react: {
          text: "💀",
          key: m.key
        }
      });

      let userToInsult;
      
      if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToInsult = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }
      else if (m.message?.extendedTextMessage?.contextInfo?.participant) {
        userToInsult = m.message.extendedTextMessage.contextInfo.participant;
      }
      
      if (!userToInsult) {
        return await gss.sendMessage(m.from, { 
          text: '*💀 Insult Command*\nPlease mention someone or reply to their message to insult them!\n\nExample: .insult @user*'
        }, { quoted: m });
      }

      if (userToInsult === m.from) {
        return await gss.sendMessage(m.from, { 
          text: "*🤨 Self-Insult Blocked*\nYou can't insult yourself! That's just sad...*"
        }, { quoted: m });
      }

      if (userToInsult.includes('bot') || userToInsult.includes('Bot')) {
        return await gss.sendMessage(m.from, { 
          text: "*🤖 Nice Try*\nYou can't insult me! I'm just a bunch of code.*"
        }, { quoted: m });
      }

      const insult = insults[Math.floor(Math.random() * insults.length)];
      const username = userToInsult.split('@')[0];

      console.log(`[INSULT] ${m.from} insulting ${userToInsult}`);

      await new Promise(resolve => setTimeout(resolve, 1500));

      await gss.sendMessage(m.from, { 
        text: `🎯 *Target:* @${username}\n💀 *Insult:* ${insult}\n\n*Disclaimer: This is all in good fun! 😄*`,
        mentions: [userToInsult]
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('[INSULT] Error:', error.message);
      
      if (error.message.includes('429') || error.data === 429) {
        await gss.sendMessage(m.from, { 
          text: '*⏰ Rate Limited*\nPlease try again in a few seconds.*'
        }, { quoted: m });
      } else {
        await gss.sendMessage(m.from, { 
          text: '*❌ Insult Failed*\nAn error occurred while sending the insult. Please try again later.*'
        }, { quoted: m });
      }
    }
  }

  // Pickup Line Plugin
  if (['pickupline', 'pickup'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const res = await fetch('https://api.popcat.xyz/pickuplines', { timeout: 15000 });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { pickupline } = await res.json();
      if (!pickupline) throw new Error('Invalid API response');

      const caption = `
╭───[ *ᴘɪᴄᴋᴜᴘ ʟɪɴᴇ* ]───
├ *ʟɪɴᴇ*: ${pickupline} 💬
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Pickupline error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch pickup line* 😞'
      }, { quoted: m });
    }
  }

  // Roast Plugin
  if (cmd === 'roast') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🤬', key: m.key } 
      });
      
      const res = await fetch('https://vinuxd.vercel.app/api/roast');
      const data = await res.json();
      
      if (!data || !data.data) {
        await gss.sendMessage(m.from, { 
          text: '❌ No roast available at the moment.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, { 
        text: `🔥 *Roast:* ${data.data}` 
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch roast.' 
      }, { quoted: m });
    }
  }

  // Love Quote Plugin
  if (cmd === 'lovequote') {
    try {
      await gss.sendMessage(m.from, { 
        react: { text: '🙈', key: m.key } 
      });
      
      const res = await fetch('https://api.popcat.xyz/lovequote');
      const data = await res.json();
      
      if (!data || !data.quote) {
        await gss.sendMessage(m.from, { 
          text: '❌ Couldn\'t fetch love quote.' 
        }, { quoted: m });
        return;
      }
      
      await gss.sendMessage(m.from, { 
        text: `❤️ *Love Quote:*\n\n"${data.quote}"` 
      }, { quoted: m });
      
    } catch (err) {
      console.error(err);
      await gss.sendMessage(m.from, { 
        text: '❌ Failed to fetch love quote.' 
      }, { quoted: m });
    }
  }

  // Dare Plugin
  if (['dare', 'truthordare'].includes(cmd)) {
    try {
      await gss.sendMessage(m.from, {
        react: {
          text: "⏳",
          key: m.key
        }
      });

      const res = await fetch('https://shizoapi.onrender.com/api/texts/dare?apikey=shizo', { timeout: 15000 });
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const { result } = await res.json();
      if (!result) throw new Error('Invalid API response');

      const caption = `
╭───[ *ᴅᴀʀᴇ ᴄʜᴀʟʟᴇɴɢᴇ* ]───
├ *ᴅᴀʀᴇ*: ${result} 🎯
╰──────────────┈⊷
> *ᴍᴀᴅᴇ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs xᴛᴇᴄʜ*`;

      await gss.sendMessage(m.from, { 
        text: caption
      }, { quoted: m });

      await gss.sendMessage(m.from, {
        react: {
          text: "✅",
          key: m.key
        }
      });

    } catch (error) {
      console.error('Dare error:', error);
      await gss.sendMessage(m.from, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      await gss.sendMessage(m.from, {
        text: error.message.includes('timeout') ? 
          '❌ *Request timed out* ⏰' : 
          '❌ *Failed to fetch dare* 😞'
      }, { quoted: m });
    }
  }
};

export default plugins;
