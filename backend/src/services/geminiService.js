const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getModel = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Gemini integration is disabled.');
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // or gemini-1.5-flash
};

/**
 * Ranks an array of posts based on a user's recent actions and their county.
 * The AI evaluates how relevant each post is to the user's focus on sustainability.
 */
const curateFeedWithGemini = async (user, recentActions, posts) => {
  const model = getModel();
  if (!model || posts.length === 0) {
    return posts;
  }

  try {
    const actionList = recentActions.map(a => a.action_label || a.action_type).join(', ');
    const postData = posts.map((p, index) => ({
      index,
      content: p.content,
      type: p.type || 'Eco-Win'
    }));

    const prompt = `You are a background curation algorithm for an eco-friendly community application. 
Your goal is to rank posts to maximize inspiration based on the user's recent activities.
Do not respond with anything other than a JSON array of indices.

User Profile:
- Name: ${user.name}
- County: ${user.neighborhood_tag}
- Recent Actions: ${actionList || 'New user, exploring options'}

Posts to Rank (in JSON):
${JSON.stringify(postData)}

Return ONLY a valid JSON array of numbers representing the ordered indices of the posts, from most relevant/inspiring to least relevant.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON array
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const rankedIndices = JSON.parse(jsonStr);

    if (Array.isArray(rankedIndices) && rankedIndices.length === posts.length) {
      const rankedPosts = [];
      for (const idx of rankedIndices) {
         if (posts[idx]) {
           rankedPosts.push(posts[idx]);
         }
      }
      return rankedPosts;
    }

    return posts;
  } catch (error) {
    console.error('Error curating feed with Gemini:', error);
    return posts; // Fallback to original order
  }
};

/**
 * Dynamically generates an AI suggestion or challenge expansion.
 */
const generateDynamicChallenge = async (baseChallenge, user) => {
  const model = getModel();
  if (!model) return null;

  try {
    const prompt = `Generate a personalized twist on this eco-challenge for ${user.name}, who lives in ${user.neighborhood_tag}.
    
Base Challenge: ${baseChallenge.title} - ${baseChallenge.description}

Keep the response brief, friendly, and actionable. Add a small 'pro-tip' specifically tailored for their county context if possible, but do not mention that you are an AI. Formulate it as a system tip.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating dynamic challenge:', error);
    return null;
  }
};

module.exports = {
  curateFeedWithGemini,
  generateDynamicChallenge
};