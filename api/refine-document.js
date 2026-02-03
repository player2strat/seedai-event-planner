// api/refine-document.js
// Vercel Serverless Function for AI-powered document refinement

const REFINEMENT_PROMPTS = {
  runofshow: `You are an expert event producer. Refine this Run of Show into a professional, actionable document.

IMPROVEMENTS TO MAKE:
- Assign specific team members to each time block (use the team list provided, or mark "TBA" if unassigned)
- Add setup/teardown tasks before and after the event
- Add buffer time between sessions (5-15 min)
- Add cue notes (e.g., "Cue: lights dim", "Cue: start music")
- Flag any timing conflicts or tight transitions
- Add a "Status" column with values: Confirmed / Pending / TBA
- Include an AV/tech checklist per session where relevant
- Add a "Notes" column for special instructions

Return the refined document as clean, structured plain text using this format for each entry:
TIME | ACTIVITY | OWNER | SETUP NOTES | STATUS`,

  budget: `You are an expert event budget analyst. Refine this budget document.

IMPROVEMENTS TO MAKE:
- Flag any line items that seem over or under-estimated for this type/size of event
- Suggest specific cost-saving alternatives where applicable
- Flag any commonly forgotten budget categories that are missing
- Add an "Actual" column (leave blank — for filling in later)
- Add subtotals by category
- Add notes on what's typically negotiable
- If this is a DC event, note any GSA per diem considerations

Return as structured plain text with clear category headers and line items.`,

  checklist: `You are an expert event project manager. Refine this planning checklist.

IMPROVEMENTS TO MAKE:
- Assign each task to a specific team member (use the team list, or mark "TBA")
- Calculate specific due dates working backward from the event date
- Add priority levels: 🔴 Critical / 🟡 Important / 🟢 Nice-to-have
- Group by phase: Immediate (this week), Short-term (2-4 weeks), Pre-event (1 week before), Day-of, Post-event
- Add dependencies (e.g., "Blocked by: Venue contract signed")
- Add estimated time per task where helpful

Return as structured plain text grouped by phase with: TASK | OWNER | DUE DATE | PRIORITY | STATUS`,

  venueRfp: `You are an expert event planner who writes professional RFPs. Refine this Venue RFP.

IMPROVEMENTS TO MAKE:
- Format as a professional letter/email ready to send
- Add standard contract terms to request (cancellation policy, force majeure, insurance requirements)
- Add accessibility requirements (ADA compliance, wheelchair access, hearing loops)
- Add specific questions about included services vs. add-ons
- Add a response deadline (suggest 2 weeks from today)
- Include a brief "About our organization" section using the event context
- If DC area, mention proximity to Metro and parking options

Return as a professional, ready-to-send email/letter format.`,

  cateringRfp: `You are an expert event planner who writes professional catering RFPs. Refine this Catering RFP.

IMPROVEMENTS TO MAKE:
- Format as a professional letter/email ready to send
- Add comprehensive dietary accommodation requests (vegetarian, vegan, gluten-free, kosher, halal, nut allergies)
- Add service style details and timing for each meal/break
- Add questions about staffing ratios, china vs. disposable, linens
- Add a response deadline
- Include sustainability/waste reduction preferences
- If applicable, note any alcohol service and licensing requirements

Return as a professional, ready-to-send email/letter format.`,

  speakerInvite: `You are an expert at professional communications for policy events. Refine this Speaker Invitation.

IMPROVEMENTS TO MAKE:
- Professional, warm tone appropriate for DC policy circles
- Include specific logistics: format, duration of their session, audience size and composition
- Include what you're asking of them (keynote, panel, fireside chat, etc.)
- Add a clear response deadline
- Mention any honorarium, travel reimbursement, or "this is a voluntary/pro-bono engagement"
- Include next steps if they accept
- Add a brief "About [Organization]" section
- If relevant, mention other confirmed speakers to build credibility

Return as a professional, ready-to-send email format with subject line.`,

  contacts: `You are an expert event operations manager. Refine this Contact Sheet.

IMPROVEMENTS TO MAKE:
- Add role descriptions (what each person is responsible for day-of)
- Designate each contact as "On-site" or "Remote/On-call"
- Add an emergency contacts section
- Group by category: Core Team, Venue, Vendors, Speakers/VIPs, Emergency
- Add a "Backup" column for critical roles
- Include communication protocol (who to call first for what type of issue)

Return as structured plain text grouped by category with: NAME | ROLE | PHONE | EMAIL | ON-SITE/REMOTE | NOTES`,

  briefing: `You are an expert at writing executive briefing documents for policy events. Refine this Event Briefing.

IMPROVEMENTS TO MAKE:
- Format as a professional executive summary (1-2 pages max)
- Lead with a clear "Purpose & Expected Outcomes" section
- Add "Key Decisions Needed" section with specific decision points and deadlines
- Add "Risk Flags" section highlighting top 3-5 risks with mitigation plans
- Add "Budget Summary" as a quick-reference table
- Add "Stakeholder Map" — who are the key internal and external stakeholders
- Include "Success Metrics" — how will we measure if this event achieved its goals
- End with "Immediate Next Steps" with owners and dates

Return as a professional executive briefing document.`
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { documentType, draft, teamMembers, eventData } = req.body;

    if (!documentType || !draft) {
      return res.status(400).json({ error: 'documentType and draft are required' });
    }

    const refinementPrompt = REFINEMENT_PROMPTS[documentType];
    if (!refinementPrompt) {
      return res.status(400).json({ error: `Unknown document type: ${documentType}` });
    }

    const teamContext = teamMembers?.filter(t => t.name)?.length > 0
      ? `\n\nTEAM MEMBERS:\n${teamMembers.filter(t => t.name).map(t => `- ${t.name}${t.role ? ` (${t.role})` : ''}`).join('\n')}`
      : '\n\nTEAM MEMBERS: No team members specified yet. Use "TBA" for assignments.';

    const eventContext = eventData
      ? `\n\nEVENT CONTEXT:\n- Event: ${eventData.name || 'Unnamed'}\n- Type: ${eventData.type || 'TBD'}\n- Date: ${eventData.date || 'TBD'}\n- Location: ${eventData.region || 'TBD'}\n- Size: ${eventData.size || 'TBD'}\n- Duration: ${eventData.duration || 'TBD'}`
      : '';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: `${refinementPrompt}${teamContext}${eventContext}

HERE IS THE DRAFT DOCUMENT TO REFINE:

${draft}

Please return ONLY the refined document with no additional commentary or explanation. Do not wrap in markdown code blocks.`
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return res.status(500).json({ 
        error: 'Failed to refine document',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const result = await response.json();
    const refinedContent = result.content?.find(c => c.type === 'text')?.text || draft;

    return res.status(200).json({ 
      refined: refinedContent,
      documentType 
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
