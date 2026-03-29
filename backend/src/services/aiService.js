
const generateEcoSuggestion = (user) => {
  const { name, current_points, total_co2_saved, neighborhood_tag } = user;
  
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

module.exports = {
  generateEcoSuggestion
};
