// api/market-data.js
// Vercel Serverless Function for live market pricing estimates

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { region, venueType, size, eventType, duration, fnb, av } = req.body;

    if (!region || !size) {
      return res.status(400).json({ error: 'region and size are required' });
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
          content: `You are an expert event planner with deep knowledge of venue and vendor pricing across US markets. 

IMPORTANT: Use web search to find current pricing information, recent venue rates, and up-to-date market conditions for ${region}. Do not rely solely on training data.

Provide realistic 2025-2026 pricing estimates for this event:

LOCATION: ${region}
VENUE TYPE: ${venueType || 'Conference venue'}
EVENT SIZE: ${size}
EVENT TYPE: ${eventType || 'Corporate event'}
DURATION: ${duration || '1 day'}
${fnb ? `F&B SELECTIONS: ${fnb.join(', ')}` : ''}
${av ? `AV NEEDS: ${av.join(', ')}` : ''}

Based on current market rates in ${region}, provide pricing estimates. Consider:
- Local cost of living and event market premiums
- Typical venue pricing for this type/size
- Regional catering costs
- Any seasonal factors

Return ONLY a valid JSON object with no additional text:
{
  "venue": {
    "min": <number>,
    "max": <number>,
    "notes": "<brief note on venue pricing in this market>"
  },
  "fnbPerPerson": {
    "min": <number>,
    "max": <number>,
    "notes": "<brief note on catering costs>"
  },
  "avDaily": {
    "min": <number>,
    "max": <number>,
    "notes": "<brief note on AV costs>"
  },
  "marketInsights": "<2-3 sentences about this market's event pricing trends, best value tips, or things to watch out for>",
  "confidence": "<high|medium|low - how confident you are in these estimates>"
}`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to get market data',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    // Handle multiple content blocks when web search is used
    const textContent = data.content
      ?.filter(c => c.type === 'text')
      ?.map(c => c.text)
      ?.join('\n') || '{}';
    
    let marketData;
    try {
      const cleanedContent = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      marketData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse market data response:', textContent);
      return res.status(500).json({ error: 'Failed to parse market data' });
    }

    return res.status(200).json(marketData);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
