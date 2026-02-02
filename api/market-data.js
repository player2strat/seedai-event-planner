// api/market-data.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { region, venueType, size, eventType } = req.body;

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
          content: `You are an expert on DC event venue pricing. Provide realistic 2025-2026 pricing estimates for:

Region: ${region}
Venue Type: ${venueType}
Event Size: ${size}
Event Type: ${eventType}

Return ONLY a JSON object with no other text:
{
  "venue": {"min": number, "max": number, "notes": "string"},
  "catering_per_person": {"min": number, "max": number},
  "av_daily": {"min": number, "max": number},
  "market_notes": "Any relevant pricing trends or tips"
}`
        }]
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to get market data' });
    }

    const data = await response.json();
    const textContent = data.content.find(c => c.type === 'text')?.text || '{}';
    
    let marketData;
    try {
      marketData = JSON.parse(textContent);
    } catch {
      marketData = null;
    }

    return res.status(200).json(marketData);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
