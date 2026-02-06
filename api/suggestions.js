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
      content: `You are an expert DC policy event planner. Search the web to verify any current information about politicians, officials, or industry leaders before making suggestions.
      
      Analyze this event and provide suggestions...`
    }]
  })
});
