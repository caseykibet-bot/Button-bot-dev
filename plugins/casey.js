import config from '../config.cjs';
import axios from 'axios';

const casey = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body || '';
    const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    
    // Process multiple commands: casey, ai, gemini
    const validCommands = ['casey', 'ai', 'gemini','gpt'];
    if (!validCommands.includes(cmd)) return;

    // Add reaction to show command is being processed
    await Matrix.sendMessage(m.from, { 
      react: { 
        text: "⏳", 
        key: m.key 
      } 
    });

    const text = body.slice(prefix.length + cmd.length).trim();

    // Newsletter context info
    const newsletterContext = {
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420261263259@newsletter',
          newsletterName: 'CASEYRHODES AI🧑‍💻',
          serverMessageId: -1
        }
      }
    };

    // Check if user provided a question/message
    if (!text) {
      const buttonMessage = {
        image: { url: "https://files.catbox.moe/dqut9p.jpg" },
        caption: `*🤖 AI ASSISTANT*\n\nPlease provide a message or question for me to respond to.\n\nUsage: ${prefix}${cmd} [your question]\n\nAvailable Commands:\n• ${prefix}casey - Casey AI Assistant\n• ${prefix}ai - General AI Assistant\n• ${prefix}gemini - Gemini AI Assistant`,
        footer: `Powered by CASEYRHODES TECH | Using: ${cmd.toUpperCase()}`,
        buttons: [
          { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
          { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 }
        ],
        headerType: 4,
        ...newsletterContext
      };
      return await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
    }

    // Check for custom responses before calling API
    const customResponse = getCustomResponse(text, prefix, cmd);
    if (customResponse) {
      // Add success reaction for custom response
      await Matrix.sendMessage(m.from, { 
        react: { 
          text: "✅", 
          key: m.key 
        } 
      });
      return await Matrix.sendMessage(m.from, { ...customResponse, ...newsletterContext }, { quoted: m });
    }

    // Continue with API calls for other queries
    let response;
    let apiUsed = 'primary';

    try {
      // Try primary API first
      const primaryResponse = await axios.get(`https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(text)}`, {
        timeout: 30000
      });

      if (primaryResponse.data && primaryResponse.data.success && primaryResponse.data.result) {
        response = primaryResponse.data.result;
      } else {
        throw new Error('Primary API response invalid');
      }
    } catch (primaryError) {
      console.log('Primary API failed, trying fallback...', primaryError.message);
      
      try {
        // Try fallback API
        const fallbackResponse = await axios.get(`https://izumiiiiiiii.dpdns.org/ai/geminiai?messages=${encodeURIComponent(text)}`, {
          timeout: 30000
        });

        if (fallbackResponse.data && fallbackResponse.data.status && fallbackResponse.data.result) {
          response = fallbackResponse.data.result;
          apiUsed = 'fallback';
        } else {
          throw new Error('Fallback API response invalid');
        }
      } catch (fallbackError) {
        console.error('Both APIs failed:', fallbackError.message);
        
        // Add error reaction
        await Matrix.sendMessage(m.from, { 
          react: { 
            text: "❌", 
            key: m.key 
          } 
        });
        
        const errorButtons = {
          image: { url: "https://files.catbox.moe/dqut9p.jpg" },
          caption: `❌ *${cmd.toUpperCase()} AI is currently unavailable*\n\nBoth AI services are experiencing issues. Please try again later.`,
          footer: `${cmd.toUpperCase()} AI - Technical Issues`,
          buttons: [
            { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
            { buttonId: `${prefix}bowner`, buttonText: { displayText: "CONTACT OWNER" }, type: 1 }
          ],
          headerType: 4,
          ...newsletterContext
        };
        
        return await Matrix.sendMessage(m.from, errorButtons, { quoted: m });
      }
    }

    // Clean up the response
    response = response.trim();

    // Add success reaction for API response
    await Matrix.sendMessage(m.from, { 
      react: { 
        text: "🤖", 
        key: m.key 
      } 
    });

    // Determine which AI name to display based on command
    let aiName = 'Casey AI';
    if (cmd === 'ai') aiName = 'General AI';
    if (cmd === 'gemini') aiName = 'Gemini AI';
    if (cmd === 'gpt') aiName = 'Chat GPT';

    // Send the AI response with buttons
    const aiResponse = {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `${response}`,
      footer: `${aiName} - Powered by ${apiUsed === 'primary' ? 'CASEYRHODES TECH' : 'CASPER TECH'}`,
      buttons: [
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 },
        { buttonId: `${prefix}owner`, buttonText: { displayText: "INFO" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };

    await Matrix.sendMessage(m.from, aiResponse, { quoted: m });
      
  } catch (error) {
    console.error('Error in AI command:', error);
    
    // Add error reaction
    await Matrix.sendMessage(m.from, { 
      react: { 
        text: "❌", 
        key: m.key 
      } 
    });
    
    const errorButtons = {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: '❌ *An error occurred with the AI service*\n\nPlease try again later or contact the owner for support.',
      footer: "AI Service - Error",
      buttons: [
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}owner`, buttonText: { displayText: "CONTACT OWNER" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
    
    await Matrix.sendMessage(m.from, errorButtons, { quoted: m });
  }
};

// Function to handle custom responses
const getCustomResponse = (text, prefix, cmd) => {
  const lowerText = text.toLowerCase();
  
  // Determine which AI name to use based on command
  let aiName = 'Casey AI';
  let developer = 'CaseyRhodes Tech';
  if (cmd === 'ai') {
    aiName = 'General AI';
    developer = 'CaseyRhodes Tech';
  } else if (cmd === 'gemini') {
    aiName = 'Gemini AI';
    developer = 'Google & CaseyRhodes Tech';
  } else if (cmd === 'gpt') {
    aiName = 'Chat GPT';
    developer = 'OpenAI & CaseyRhodes Tech';
  }

  // Newsletter context info
  const newsletterContext = {
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363420261263259@newsletter',
        newsletterName: 'CASEYRHODES AI🧑‍💻',
        serverMessageId: -1
      }
    }
  };

  // Check for owner/developer related queries
  if (lowerText.includes('owner') || lowerText.includes('developer') || lowerText.includes('creator') || 
      lowerText.includes('who made you') || lowerText.includes('who created you') || 
      lowerText.includes('who developed you') || lowerText.includes('who built you')) {
    
    return {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `*👨‍💻 MEET THE DEVELOPERS*\n\n🇰🇪 *Primary Developer:* CaseyRhodes Tech\n• Location: Kenya\n• Specialization: AI Integration & Bot Development\n• Role: Lead Developer & Project Owner\n\n🤖 *Technical Partner:* CASPER TECH\n• Specialization: Backend Systems & API Management\n• Role: Technical Support & Infrastructure\n\n*About ${aiName}:*\n${aiName} is the result of a collaborative effort between CaseyRhodes Tech and CASPER TECH. Together, we bring you cutting-edge AI technology with reliable bot functionality, ensuring you get the best AI experience possible.\n\n*Proudly Made in Kenya* 🇰🇪`,
      footer: `CaseyRhodes Tech x CASPER TECH - ${aiName}`,
      buttons: [
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 },
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}owner`, buttonText: { displayText: "GET SUPPORT" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
  }
  
  // Check for creation date/when made queries
  if (lowerText.includes('when were you made') || lowerText.includes('when were you created') || 
      lowerText.includes('when were you developed') || lowerText.includes('creation date') || 
      lowerText.includes('when did you start') || lowerText.includes('how old are you') ||
      lowerText.includes('when were you built') || lowerText.includes('release date')) {
    
    return {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `*📅 ${aiName.toUpperCase()} TIMELINE*\n\n🚀 *Development Started:* December 2024\n🎯 *First Release:* January 2025\n🔄 *Current Version:* 2.0 (February 2025)\n\n*Development Journey:*\n• *Phase 1:* Core AI integration and basic functionality\n• *Phase 2:* Enhanced response system and multi-API support\n• *Phase 3:* Advanced customization and user experience improvements\n\n*What's Next:*\nWe're constantly working on updates to make ${aiName} smarter, faster, and more helpful. Stay tuned for exciting new features!\n\n*Age:* Just a few months old, but getting smarter every day! 🧠✨`,
      footer: `${aiName} - Born in Kenya, Growing Worldwide`,
      buttons: [
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 },
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}bowner`, buttonText: { displayText: "MEET DEVELOPERS" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
  }

  // Check for AI name queries
  if (lowerText.includes('what is your name') || lowerText.includes('what\'s your name') || 
      lowerText.includes('tell me your name') || lowerText.includes('your name') || 
      lowerText.includes('name?') || lowerText.includes('called?')) {
    
    return {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `*🏷️ MY NAME*\n\n👋 Hello! My name is *${aiName.toUpperCase()}*\n\n*About My Name:*\n• Full Name: ${aiName}\n• Short Name: ${aiName.split(' ')[0]}\n• You can call me: ${aiName.split(' ')[0]}, ${aiName}, or just AI\n\n*Name Origin:*\nI'm powered by advanced AI technology developed by *${developer}*, combining cutting-edge artificial intelligence with reliable bot functionality.\n\n*What I Stand For:*\n🔹 *I* - Intelligent Assistance\n🔹 *A* - Advanced Technology\n🔹 *I* - Innovative Solutions\n\n*Made in Kenya* 🇰🇪 *by CaseyRhodes Tech*`,
      footer: `${aiName} - That's Me! 😊`,
      buttons: [
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}bowner`, buttonText: { displayText: "MEET DEVELOPERS" }, type: 1 },
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
  }

  // Check for general info about the AI
  if (lowerText.includes('what are you') || lowerText.includes('tell me about yourself') || 
      lowerText.includes('who are you') || lowerText.includes('about') || lowerText.includes('info')) {
    
    return {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `👋 Hi! I'm *${aiName}*, your intelligent WhatsApp assistant developed by CaseyRhodes Tech.\n\n*What I Can Do:*\n• Answer questions on any topic\n• Help with problem-solving\n• Provide information and explanations\n• Assist with creative tasks\n• Engage in meaningful conversations\n\n*My Features:*\n✅ Advanced AI technology\n✅ Multi-language support\n✅ Fast response times\n✅ Reliable dual-API system\n✅ User-friendly interface\n\n*My Identity:*\n• Name: ${aiName}\n• Origin: Kenya 🇰🇪\n• Purpose: Making AI accessible and helpful\n\n*Proudly Kenyan:* 🇰🇪\nBuilt with passion in Kenya, serving users worldwide with cutting-edge AI technology.\n\nHow can I assist you today?`,
      footer: `${aiName} - Your Intelligent WhatsApp Companion`,
      buttons: [
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI MENU" }, type: 1 },
        { buttonId: `${prefix}bowner`, buttonText: { displayText: "MEET DEVELOPERS" }, type: 1 },
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
  }

  // Return null if no custom response matches
  return null;
};

// Handle owner command response
const handleOwnerResponse = (m, Matrix) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  
  if (cmd === 'bowner') {
    // Add reaction for owner command
    Matrix.sendMessage(m.from, { 
      react: { 
        text: "👨‍💻", 
        key: m.key 
      } 
    });
    
    // Newsletter context info
    const newsletterContext = {
      contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363420261263259@newsletter',
          newsletterName: 'CASEYRHODES AI🧑‍💻',
          serverMessageId: -1
        }
      }
    };

    const ownerInfo = {
      image: { url: "https://files.catbox.moe/dqut9p.jpg" },
      caption: `*👨‍💻 DEVELOPMENT TEAM*\n\n🇰🇪 *Lead Developer:* CaseyRhodes Tech\n• Primary Owner & Creator\n• Location: Kenya\n• Expertise: AI Integration, Bot Development\n• Vision: Making AI accessible to everyone\n\n🤖 *Technical Partner:* FROST XMD\n• Backend Systems Specialist\n• API Management & Infrastructure\n• Ensures reliable service delivery\n\n*Our Collaboration:*\nCaseyRhodes Tech's innovative vision combined with technical expertise, delivering you a world-class AI experience right here from Kenya.\n\n*Contact & Support:*\nFor technical support, feature requests, or collaboration inquiries, reach out through the support channels.\n\n*Made with ❤️ in Kenya* 🇰🇪`,
      footer: "CaseyRhodes Tech - Kenyan Innovation",
      buttons: [
        { buttonId: `${prefix}menu`, buttonText: { displayText: "MAIN MENU" }, type: 1 },
        { buttonId: `${prefix}owner`, buttonText: { displayText: "SUPPORT" }, type: 1 },
        { buttonId: `${prefix}aimenu`, buttonText: { displayText: "AI COMMANDS" }, type: 1 }
      ],
      headerType: 4,
      ...newsletterContext
    };
    
    return Matrix.sendMessage(m.from, ownerInfo, { quoted: m });
  }
};

// Export both functions
export default casey;
export { handleOwnerResponse };
