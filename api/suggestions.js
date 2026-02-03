// api/suggestions.js
// Vercel Serverless Function for AI-powered event suggestions
// Updated with SeedAI institutional knowledge

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
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
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: `You are an expert event strategist advising SeedAI, a DC-based nonprofit at the intersection of AI policy and practical application. Your suggestions should reflect deep knowledge of SeedAI's mission, programs, and the DC policy ecosystem.

ABOUT SEEDAI:
- Mission: "AI the American Way — Try It, Prove It, Scale It." Helps American innovators and policymakers explore AI opportunities, experiment in practice, and expand what's proven.
- Core strategy: Create "big-tent" environments where safety-focused organizations (like Anthropic, MIRI, IAPS, FAS, IFP) participate alongside mainstream policy community and frontier labs.
- Key programs:
  * Accelerate Science Now (ASN): 70+ member coalition including frontier AI labs (Anthropic, Google DeepMind, Meta), major research universities, and advocacy groups. Coordinates coalition-validated RFI responses on safety standards, interpretability, NAIRR, research security.
  * FYSA (For Your Situational Awareness): Monthly off-the-record breakfast briefings connecting policymakers with practitioners. 125+ senior attendees since Q1 2025. Speakers include senators, representatives, NSF directors. These are intimate, high-trust conversations.
  * AI Primers: Congressional briefings providing technical AI education on the Hill. Standing-room-only attendance. Partnership with organizations like American Robotics.
  * AI Across America: State-level AI adoption summits (started with Utah Governor's office). Focus on low-risk application with safety-conscious framing.
  * American AI Festival / SXSW SeedAI House: Large-scale convening (1,600+ guests). Features private dinners for intimate safety-relevant conversations with elected officials.
  * Tech Labs: NSF program SeedAI supports with safety-conscious design.
- Key relationships: Senators Rounds, Blackburn, Ernst. Reps Lieu, Beyer, Obernolte, Jacobs, Liccardo. NSF TIP, DOE Genesis Mission, NIST/CAISI.
- Funders include organizations focused on AI safety; grant reporting tracks coalition growth, policy influence instances, and event impact.

DC POLICY EVENT EXPERTISE:
- Congressional calendar awareness: Recesses, budget deadlines, election proximity all affect Hill attendance
- Federal ethics rules: $20/item gift limit, $50/year from single source. Meals for federal employees and Hill staff must comply.
- Hill logistics: Building access requires pre-registration, security screening. Longworth/Rayburn/Dirksen each have different rules.
- Off-the-record norms: FYSA-style events succeed because of Chatham House rules. This creates trust.
- Bipartisan framing: SeedAI deliberately avoids partisan positioning. Events should appeal across the aisle.
- Coalition dynamics: When ASN members participate, their logos/names add credibility. But coordinating 70+ orgs requires lead time.
- Sponsor relationships: Some events are sponsor-funded (AI Primers, happy hours), others use grant funding. This affects messaging constraints.
- Media considerations: Some events benefit from press; others (like FYSA) are explicitly off-record.
- Venue knowledge: DC has specific venue types that signal different things — government buildings for credibility, hotels for neutrality, embassies for prestige, universities for academic rigor.

HERE IS THE EVENT BEING PLANNED:

Event Name: ${eventData.name || '[Unnamed]'}
Event Type: ${eventData.type || '[Not specified]'}
Date: ${eventData.date || '[TBD]'}
Location/Region: ${eventData.region || 'dc-metro'}
${eventData.customCity ? `Custom City: ${eventData.customCity}` : ''}
Format: ${eventData.format || '[Not specified]'}
Size: ${eventData.size || '[Not specified]'}
Duration: ${eventData.duration || '[Not specified]'}
Venue Type: ${eventData.venue || '[Not specified]'}
Description: ${eventData.description || '[None]'}
Objectives: ${eventData.objectives || '[None]'}
Target Audience: ${(eventData.audience || []).join(', ') || '[Not specified]'}
VIPs: ${eventData.vips || '[None]'}
Speakers: ${eventData.speakers || '[None]'}
Program Elements: ${(eventData.program || []).join(', ') || '[None]'}
Spaces: ${(eventData.spaces || []).join(', ') || '[None]'}
F&B: ${(eventData.fnb || []).join(', ') || '[None]'}
AV: ${(eventData.av || []).join(', ') || '[None]'}
Production: ${(eventData.production || []).join(', ') || '[None]'}
Collateral: ${(eventData.collateral || []).join(', ') || '[None]'}
Marketing: ${(eventData.marketing || []).join(', ') || '[None]'}
Post-Event: ${(eventData.postEvent || []).join(', ') || '[None]'}
Team: ${(eventData.team || []).filter(t => t.name).map(t => t.name + (t.role ? ` (${t.role})` : '')).join(', ') || '[No team listed]'}
Notes: ${eventData.notes || '[None]'}
Funding: ${eventData.funding || '[None]'}

Analyze this event plan and provide 6-10 actionable suggestions. For each suggestion, consider:

1. STRATEGIC ALIGNMENT: Does this event advance SeedAI's mission? Are there opportunities to strengthen the big-tent approach, highlight coalition members, or create safety-relevant conversations?

2. AUDIENCE & STAKEHOLDER: Who's missing from the invite list? Would this event benefit from ASN member participation? Should specific Hill offices or agency contacts be invited? Are there bipartisan considerations?

3. PROGRAM & CONTENT: Does the program create the right moments? Are there opportunities for off-the-record discussions, matchmaking between safety orgs and mainstream policymakers, or hands-on demonstrations?

4. LOGISTICS & COMPLIANCE: Federal ethics compliance, building access, security considerations, Chatham House rules if needed, accessibility.

5. TIMING & CALENDAR: Congressional calendar conflicts, competing DC events, optimal scheduling for Hill attendance, lead time needed for coalition coordination.

6. IMPACT & FOLLOW-UP: How can this event generate lasting value — RFI sign-ons, new ASN members, documented policy influence, content for the podcast, material for grant reporting? What follow-up actions should be planned?

7. RISK & CONTINGENCY: What could go wrong? Attendance risks, speaker cancellations, political sensitivity, weather (for outdoor), tech failures.

Return ONLY a valid JSON object:
{
  "suggestions": [
    {
      "category": "strategic|audience|program|logistics|compliance|timing|impact|risk|budget",
      "priority": "high|medium|low",
      "message": "Specific, actionable suggestion grounded in SeedAI's context"
    }
  ]
}

Be specific and practical. Reference SeedAI programs, DC norms, and policy ecosystem knowledge where relevant. Avoid generic event planning advice — every suggestion should feel like it came from someone who knows SeedAI and DC.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to get suggestions',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await response.json();
    const textContent = data.content?.find(c => c.type === 'text')?.text || '{}';
    
    let parsed;
    try {
      const cleaned = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse suggestions:', textContent);
      return res.status(500).json({ error: 'Failed to parse suggestions' });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
