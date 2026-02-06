// api/suggestions.js
// Vercel Serverless Function for Claude AI suggestions

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the API key from environment variables (secure, never exposed to browser)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not found in environment variables');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { eventData } = req.body;

    if (!eventData) {
      return res.status(400).json({ error: 'eventData is required' });
    }

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
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search'
          }
        ],
        messages: [{
          role: 'user',
          content: `You are an expert DC policy event planner with deep knowledge of Washington DC venues, congressional schedules, federal ethics rules, and policy event best practices.

IMPORTANT: Use web search to verify any current information about politicians, government officials, industry leaders, or recent events before making suggestions. Do not rely on potentially outdated information.

Analyze this event and provide 3-5 specific, actionable suggestions for things the planner may have overlooked or could improve.

Event Details:
${JSON.stringify(eventData, null, 2)}

Focus on:
- DC-specific considerations (congressional calendar, Hill logistics, Metro accessibility)
- Federal ethics compliance if government attendees are involved
- Risk mitigation and contingency planning
- Budget optimization opportunities
- Audience engagement and networking facilitation
- Practical gaps in their current plan
- Timing and scheduling considerations
- Current political landscape and relevant officials (search to verify)

Return ONLY a valid JSON array with no additional text, markdown, or explanation. Use this exact format:
[
  {"category": "logistics", "priority": "high", "message": "Your specific suggestion here"},
  {"category": "compliance", "priority": "medium", "message": "Another suggestion"}
]

Valid categories: logistics, av, fnb, budget, compliance, program, marketing, insurance, staffing, accessibility
Valid priorities: high, medium, low`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to get suggestions from AI',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    
    // Extract text content from Claude's response (may have multiple blocks when web search is used)
    const textContent = data.content
      ?.filter(c => c.type === 'text')
      ?.map(c => c.text)
      ?.join('\n') || '[]';
    
    // Parse the JSON array from the response
    let suggestions;
    try {
      // Clean up the response in case Claude added markdown code blocks
      const cleanedContent = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      suggestions = JSON.parse(cleanedContent);
      
      // Validate the structure
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', textContent);
      console.error('Parse error:', parseError);
      // Return empty array rather than failing
      suggestions = [];
    }

    return res.status(200).json({ suggestions });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
