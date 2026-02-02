// api/suggestions.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from environment variables (secure, never exposed to browser)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { eventData } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `You are an expert DC policy event planner. Analyze this event and provide 3-5 specific, actionable suggestions for things the planner may have overlooked.

Event Details:
${JSON.stringify(eventData, null, 2)}

Focus on:
- DC-specific considerations (congressional calendar, ethics rules, logistics)
- Risk mitigation
- Budget optimization
- Audience engagement
- Practical gaps in their plan

Return ONLY a JSON array with no other text, in this exact format:
[
  {"category": "logistics|av|fnb|budget|compliance|program|marketing", "priority": "high|medium|low", "message": "Your specific suggestion here"}
]`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Anthropic API error:', errorData);
      return res.status(500).json({ error: 'Failed to get suggestions from AI' });
    }

    const data = await response.json();
    
    // Extract the text content from Claude's response
    const textContent = data.content.find(c => c.type === 'text')?.text || '[]';
    
    // Parse the JSON array from the response
    let suggestions;
    try {
      suggestions = JSON.parse(textContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent);
      suggestions = [];
    }

    return res.status(200).json({ suggestions });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
