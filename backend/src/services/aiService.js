
const { generateDynamicChallenge } = require('./geminiService');

const generateEcoSuggestion = async (user) => {
  const { name, current_points, total_co2_saved, neighborhood_tag } = user;     

  if (process.env.GEMINI_API_KEY) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    try {
      const prompt = `You are a background curation and suggestion engine for an eco-friendly application.
Given the user:
- Name: ${name}
- Points: ${current_points}
- Total CO2 saved: ${total_co2_saved} kg
- County: ${neighborhood_tag}

Provide a short, motivating, single-sentence suggestion for an eco-action they could take today in ${neighborhood_tag}. Do not mention you are an AI.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return {
        text: response.text().trim(),
        voice_id: 'green-sentinel-v1',
        model_id: 'eleven_multilingual_v2',
        user_context: {
          points: current_points,
          co2: total_co2_saved,
          location: neighborhood_tag
        }
      };
    } catch (error) {
      console.error('Error generating eco suggestion from Gemini:', error);
    }
  }
  
  // Real logic for mock suggestions
  let suggestion = `Hey ${name}! `;
  
  if (current_points < 10) {
    suggestion += `I see you're just starting your Eco-Pulse journey. How about trying an educational module today to earn your first points?`;
  } else if (total_co2_saved > 10) {
    suggestion += `You've saved over 10kg of CO2! You're a true green champion. Your neighborhood, ${neighborhood_tag}, is lucky to have you.`;
  } else {
    suggestion += `Great progress this week! Why not check out the grid verified actions? They're giving extra points right now!`;
  }

  // Simulating ElevenLabs Realtime API structure
  return {
    text: suggestion,
    voice_id: 'green-sentinel-v1', // Mock voice ID
    model_id: 'eleven_multilingual_v2',
    user_context: {
      points: current_points,
      co2: total_co2_saved,
      location: neighborhood_tag
    }
  };
};

const DAILY_CHALLENGES = [
  {
    id: 'stealth-walk',
    title: 'Ninja Stealth Walk',
    description: 'Walk 5,000 steps today to reduce urban noise and carbon emissions.',
    action_type: 'VERIFIED'
  },
  {
    id: 'power-down',
    title: 'Power Down',
    description: 'Switch off all non-essential electronics for 1 hour.',
    action_type: 'GRID'
  },
  {
    id: 'scroll-learn',
    title: 'Scroll & Learn',
    description: 'Read a 2-minute scroll on sustainable textiles.',
    action_type: 'EDUCATIONAL'
  },
  {
    id: 'sort-waste',
    title: 'Sort Waste',
    description: 'Sort through household waste into recycling, compost, and landfill.',
    action_type: 'VERIFIED'
  },
  {
    id: 'reduce-water',
    title: 'Reduce Water',
    description: 'Reduce your water usage by 50 percent today.',
    action_type: 'VERIFIED'
  }
];

const getDailyChallenge = (date = new Date()) => {
  const dayOfYear = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 86400000);
  const index = dayOfYear % DAILY_CHALLENGES.length;
  return {
    ...DAILY_CHALLENGES[index],
    id: `${DAILY_CHALLENGES[index].id}-${date.toISOString().slice(0, 10)}`,
    date: date.toISOString().slice(0, 10)
  };
};

const expandDailyChallenge = async (challenge, user) => {
  const bonusByType = {
    VERIFIED: { min: 15, max: 45 },
    GRID: { min: 10, max: 30 },
    EDUCATIONAL: { min: 5, max: 20 }
  };
  const bonusConfig = bonusByType[challenge.action_type] || bonusByType.EDUCATIONAL;
  const bonusPoints = Math.floor(Math.random() * (bonusConfig.max - bonusConfig.min + 1)) + bonusConfig.min;

  if (user && process.env.GEMINI_API_KEY) {
    const aiTwist = await generateDynamicChallenge(challenge, user);
    if (aiTwist) {
      return {
        expanded_title: `Bonus Challenge: ${challenge.title}`,
        expanded_description: aiTwist,
        bonus_points: bonusPoints
      };
    }
  }

  return {
    expanded_title: `Bonus Challenge: ${challenge.title}`,
    expanded_description: `${challenge.description} Add a photo or short note describing your impact for bonus points.`,
    bonus_points: bonusPoints
  };
};

module.exports = {
  generateEcoSuggestion,
  getDailyChallenge,
  expandDailyChallenge
};
