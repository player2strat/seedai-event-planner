import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// SEEDAI EVENT PLANNER V7
// Added: Congressional calendar, .ics export, smart sharing, rule-based hints
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const REGIONS = {
  'dc-metro': { name: 'Washington, DC Metro', multiplier: 1.0 },
  'nyc': { name: 'New York City', multiplier: 1.35 },
  'sf-bay': { name: 'San Francisco Bay Area', multiplier: 1.30 },
  'la': { name: 'Los Angeles', multiplier: 1.15 },
  'boston': { name: 'Boston', multiplier: 1.10 },
  'seattle': { name: 'Seattle', multiplier: 1.05 },
  'chicago': { name: 'Chicago', multiplier: 0.95 },
  'miami': { name: 'Miami', multiplier: 0.95 },
  'denver': { name: 'Denver', multiplier: 0.90 },
  'austin': { name: 'Austin', multiplier: 0.85 },
  'atlanta': { name: 'Atlanta', multiplier: 0.85 },
  'other': { name: 'Other / Smaller Market', multiplier: 0.75 }
};

const EVENT_TYPES = [
  'Policy Conference',
  'Congressional Briefing',
  'Stakeholder Summit',
  'Press Event / Media Briefing',
  'Fundraising Gala',
  'Board Meeting',
  'Training / Workshop',
  'Networking Reception',
  'Panel Discussion',
  'Award Ceremony',
  'Product Launch',
  'Other'
];

const SIZE_CONFIG = {
  'intimate': { label: 'Intimate (10-25)', min: 10, max: 25 },
  'small': { label: 'Small (25-50)', min: 25, max: 50 },
  'medium': { label: 'Medium (50-100)', min: 50, max: 100 },
  'large': { label: 'Large (100-200)', min: 100, max: 200 },
  'major': { label: 'Major (200-500)', min: 200, max: 500 },
  'flagship': { label: 'Flagship (500+)', min: 500, max: 1000 }
};

const DURATION_OPTIONS = [
  { value: 'half', label: 'Half day (3-4 hours)', days: 0.5 },
  { value: 'full', label: 'Full day (6-8 hours)', days: 1 },
  { value: 'two', label: '2 days', days: 2 },
  { value: 'three', label: '3 days', days: 3 }
];

const OPTIONS = {
  format: ['In-Person', 'Virtual', 'Hybrid'],
  venue: ['Hotel Ballroom', 'Conference Center', 'Historic Venue', 'Government Building', 'University/Academic', 'Museum/Cultural', 'Rooftop/Outdoor', 'Restaurant/Private Dining', 'Corporate Office', 'Other'],
  audience: ['Congressional Staff', 'Federal Agency Officials', 'State/Local Officials', 'Industry Executives', 'Nonprofit Leaders', 'Academics/Researchers', 'Journalists/Media', 'General Public', 'International Delegates', 'Students/Young Professionals'],
  program: ['Keynote Address', 'Panel Discussion', 'Fireside Chat', 'Breakout Sessions', 'Workshops', 'Networking Breaks', 'Awards/Recognition', 'Press Conference', 'VIP Reception', 'Group Photo'],
  spaces: ['Main Plenary Hall', 'Breakout Rooms', 'VIP Green Room', 'Press/Media Room', 'Registration Area', 'Networking Lounge', 'Outdoor Terrace', 'Executive Boardroom'],
  fnb: ['Continental Breakfast', 'Hot Breakfast', 'Morning Coffee/Tea', 'Working Lunch (Boxed)', 'Plated Lunch', 'Afternoon Break', 'Cocktail Reception', 'Happy Hour / Reception', 'Plated Dinner', 'Dessert Reception'],
  av: ['Projector/Screen', 'Confidence Monitor', 'Wireless Microphones', 'Podium with Mic', 'Livestream Setup', 'Recording Equipment', 'Video Playback', 'LED Wall/Display', 'Interpretation Equipment'],
  production: ['Stage Design', 'Custom Backdrop', 'Step & Repeat', 'Branded Signage', 'Floral Arrangements', 'Lighting Design', 'Event Photographer', 'Videographer'],
  collateral: ['Name Badges', 'Printed Agenda', 'Branded Folders', 'Note Pads/Pens', 'Gift Bags', 'Promotional Items', 'Policy Briefs/Reports', 'Speaker Bios'],
  marketing: ['Save the Date', 'Email Invitations', 'Event Website', 'Social Media Campaign', 'Press Release', 'Media Advisory', 'Paid Advertising', 'Partner Outreach'],
  postEvent: ['Thank You Emails', 'Event Recording', 'Photo Gallery', 'Summary Report', 'Survey/Feedback', 'Social Media Recap', 'Media Clips Package']
};

const DEFAULT_COSTS = {
  venue: { 'intimate': [2000, 5000], 'small': [3000, 8000], 'medium': [5000, 15000], 'large': [10000, 30000], 'major': [20000, 50000], 'flagship': [35000, 100000] },
  fnb: { 'Continental Breakfast': 25, 'Hot Breakfast': 45, 'Morning Coffee/Tea': 12, 'Working Lunch (Boxed)': 35, 'Plated Lunch': 55, 'Afternoon Break': 18, 'Cocktail Reception': 65, 'Happy Hour / Reception': 55, 'Plated Dinner': 95, 'Dessert Reception': 30 },
  av: { 'Projector/Screen': 500, 'Confidence Monitor': 400, 'Wireless Microphones': 300, 'Podium with Mic': 250, 'Livestream Setup': 2500, 'Recording Equipment': 1500, 'Video Playback': 400, 'LED Wall/Display': 5000, 'Interpretation Equipment': 2000 },
  production: { 'Stage Design': 5000, 'Custom Backdrop': 3000, 'Step & Repeat': 1500, 'Branded Signage': 2000, 'Floral Arrangements': 1500, 'Lighting Design': 4000, 'Event Photographer': 2500, 'Videographer': 4000 },
  collateral: { 'Name Badges': 5, 'Printed Agenda': 3, 'Branded Folders': 8, 'Note Pads/Pens': 6, 'Gift Bags': 25, 'Promotional Items': 15, 'Policy Briefs/Reports': 12, 'Speaker Bios': 2 },
  marketing: { 'Save the Date': 500, 'Email Invitations': 300, 'Event Website': 2500, 'Social Media Campaign': 1500, 'Press Release': 800, 'Media Advisory': 500, 'Paid Advertising': 5000, 'Partner Outreach': 1000 }
};

// ============================================================================
// EVENT TEMPLATES
// ============================================================================

const EVENT_TEMPLATES = {
  congressionalBriefing: {
    name: 'Congressional Briefing',
    icon: '🏛️',
    description: 'Targeted briefing for Hill staff on policy issues',
    preview: '30-50 guests • 2-3 hours • Government Building',
    data: {
      type: 'Congressional Briefing',
      size: 'small',
      duration: 'half',
      format: 'In-Person',
      venue: 'Government Building',
      audience: ['Congressional Staff', 'Federal Agency Officials'],
      program: ['Panel Discussion', 'Networking Breaks'],
      spaces: ['Main Plenary Hall', 'Registration Area'],
      fnb: ['Morning Coffee/Tea', 'Afternoon Break'],
      av: ['Projector/Screen', 'Wireless Microphones', 'Podium with Mic'],
      production: ['Branded Signage'],
      collateral: ['Name Badges', 'Printed Agenda', 'Policy Briefs/Reports'],
      marketing: ['Email Invitations', 'Partner Outreach'],
      postEvent: ['Thank You Emails', 'Summary Report']
    }
  },
  policyConference: {
    name: 'Policy Conference',
    icon: '📊',
    description: 'Full-day conference with multiple sessions and networking',
    preview: '100-200 guests • Full day • Conference Center',
    data: {
      type: 'Policy Conference',
      size: 'large',
      duration: 'full',
      format: 'In-Person',
      venue: 'Conference Center',
      audience: ['Congressional Staff', 'Federal Agency Officials', 'Industry Executives', 'Nonprofit Leaders', 'Academics/Researchers'],
      program: ['Keynote Address', 'Panel Discussion', 'Breakout Sessions', 'Networking Breaks'],
      spaces: ['Main Plenary Hall', 'Breakout Rooms', 'Registration Area', 'Networking Lounge'],
      fnb: ['Continental Breakfast', 'Morning Coffee/Tea', 'Plated Lunch', 'Afternoon Break'],
      av: ['Projector/Screen', 'Confidence Monitor', 'Wireless Microphones', 'Podium with Mic', 'Recording Equipment'],
      production: ['Branded Signage', 'Event Photographer'],
      collateral: ['Name Badges', 'Printed Agenda', 'Branded Folders', 'Policy Briefs/Reports', 'Speaker Bios'],
      marketing: ['Save the Date', 'Email Invitations', 'Event Website', 'Social Media Campaign', 'Press Release'],
      postEvent: ['Thank You Emails', 'Event Recording', 'Photo Gallery', 'Summary Report', 'Survey/Feedback']
    }
  },
  fundraisingGala: {
    name: 'Fundraising Gala',
    icon: '✨',
    description: 'Evening reception with dinner and program',
    preview: '150-300 guests • Evening • Hotel Ballroom',
    data: {
      type: 'Fundraising Gala',
      size: 'major',
      duration: 'half',
      format: 'In-Person',
      venue: 'Hotel Ballroom',
      audience: ['Industry Executives', 'Nonprofit Leaders'],
      program: ['Keynote Address', 'Awards/Recognition', 'VIP Reception', 'Group Photo'],
      spaces: ['Main Plenary Hall', 'VIP Green Room', 'Registration Area'],
      fnb: ['Cocktail Reception', 'Plated Dinner', 'Dessert Reception'],
      av: ['Projector/Screen', 'Wireless Microphones', 'Podium with Mic', 'Video Playback'],
      production: ['Stage Design', 'Custom Backdrop', 'Step & Repeat', 'Floral Arrangements', 'Lighting Design', 'Event Photographer', 'Videographer'],
      collateral: ['Name Badges', 'Printed Agenda', 'Gift Bags'],
      marketing: ['Save the Date', 'Email Invitations', 'Event Website', 'Social Media Campaign'],
      postEvent: ['Thank You Emails', 'Photo Gallery', 'Social Media Recap']
    }
  },
  networkingReception: {
    name: 'Networking Reception',
    icon: '🤝',
    description: 'Casual evening mixer for relationship building',
    preview: '50-100 guests • 2-3 hours • Restaurant/Rooftop',
    data: {
      type: 'Networking Reception',
      size: 'medium',
      duration: 'half',
      format: 'In-Person',
      venue: 'Restaurant/Private Dining',
      audience: ['Industry Executives', 'Nonprofit Leaders', 'Students/Young Professionals'],
      program: ['Networking Breaks', 'VIP Reception'],
      spaces: ['Main Plenary Hall', 'Outdoor Terrace'],
      fnb: ['Happy Hour / Reception', 'Cocktail Reception'],
      av: ['Wireless Microphones'],
      production: ['Branded Signage', 'Event Photographer'],
      collateral: ['Name Badges'],
      marketing: ['Email Invitations', 'Social Media Campaign'],
      postEvent: ['Thank You Emails', 'Photo Gallery', 'Social Media Recap']
    }
  },
  pressConference: {
    name: 'Press Event',
    icon: '📰',
    description: 'Media briefing with announcement and Q&A',
    preview: '25-50 guests • 1-2 hours • Press-friendly venue',
    data: {
      type: 'Press Event / Media Briefing',
      size: 'small',
      duration: 'half',
      format: 'Hybrid',
      venue: 'Corporate Office',
      audience: ['Journalists/Media', 'Industry Executives'],
      program: ['Press Conference', 'Networking Breaks'],
      spaces: ['Main Plenary Hall', 'Press/Media Room', 'VIP Green Room'],
      fnb: ['Morning Coffee/Tea'],
      av: ['Projector/Screen', 'Wireless Microphones', 'Podium with Mic', 'Livestream Setup', 'Recording Equipment'],
      production: ['Custom Backdrop', 'Step & Repeat', 'Event Photographer', 'Videographer'],
      collateral: ['Printed Agenda', 'Policy Briefs/Reports', 'Speaker Bios'],
      marketing: ['Press Release', 'Media Advisory'],
      postEvent: ['Event Recording', 'Media Clips Package', 'Social Media Recap']
    }
  },
  workshopTraining: {
    name: 'Workshop / Training',
    icon: '📚',
    description: 'Interactive learning session with hands-on activities',
    preview: '25-50 guests • Full day • Conference room',
    data: {
      type: 'Training / Workshop',
      size: 'small',
      duration: 'full',
      format: 'In-Person',
      venue: 'Conference Center',
      audience: ['Federal Agency Officials', 'Nonprofit Leaders', 'Students/Young Professionals'],
      program: ['Workshops', 'Breakout Sessions', 'Networking Breaks'],
      spaces: ['Main Plenary Hall', 'Breakout Rooms'],
      fnb: ['Continental Breakfast', 'Morning Coffee/Tea', 'Working Lunch (Boxed)', 'Afternoon Break'],
      av: ['Projector/Screen', 'Wireless Microphones'],
      production: ['Branded Signage'],
      collateral: ['Name Badges', 'Printed Agenda', 'Branded Folders', 'Note Pads/Pens'],
      marketing: ['Email Invitations', 'Partner Outreach'],
      postEvent: ['Thank You Emails', 'Survey/Feedback', 'Summary Report']
    }
  },
  multiDaySummit: {
    name: 'Multi-Day Summit',
    icon: '🌐',
    description: 'Major 2-3 day convening with diverse programming',
    preview: '200-500 guests • 2-3 days • Hotel/Conference Center',
    data: {
      type: 'Stakeholder Summit',
      size: 'major',
      duration: 'three',
      format: 'Hybrid',
      venue: 'Hotel Ballroom',
      audience: ['Congressional Staff', 'Federal Agency Officials', 'Industry Executives', 'Nonprofit Leaders', 'Academics/Researchers', 'International Delegates'],
      program: ['Keynote Address', 'Panel Discussion', 'Fireside Chat', 'Breakout Sessions', 'Workshops', 'Networking Breaks', 'VIP Reception', 'Group Photo'],
      spaces: ['Main Plenary Hall', 'Breakout Rooms', 'VIP Green Room', 'Press/Media Room', 'Registration Area', 'Networking Lounge'],
      fnb: ['Hot Breakfast', 'Morning Coffee/Tea', 'Plated Lunch', 'Afternoon Break', 'Cocktail Reception', 'Plated Dinner'],
      av: ['Projector/Screen', 'Confidence Monitor', 'Wireless Microphones', 'Podium with Mic', 'Livestream Setup', 'Recording Equipment', 'Interpretation Equipment'],
      production: ['Stage Design', 'Custom Backdrop', 'Branded Signage', 'Lighting Design', 'Event Photographer', 'Videographer'],
      collateral: ['Name Badges', 'Printed Agenda', 'Branded Folders', 'Note Pads/Pens', 'Policy Briefs/Reports', 'Speaker Bios'],
      marketing: ['Save the Date', 'Email Invitations', 'Event Website', 'Social Media Campaign', 'Press Release', 'Media Advisory', 'Partner Outreach'],
      postEvent: ['Thank You Emails', 'Event Recording', 'Photo Gallery', 'Summary Report', 'Survey/Feedback', 'Social Media Recap', 'Media Clips Package']
    }
  }
};

// ============================================================================
// CONGRESSIONAL CALENDAR (2026)
// ============================================================================

const CONGRESSIONAL_CALENDAR_2026 = {
  recesses: [
    { start: '2026-01-01', end: '2026-01-05', name: 'New Year' },
    { start: '2026-02-14', end: '2026-02-22', name: 'Presidents Day Recess' },
    { start: '2026-03-28', end: '2026-04-12', name: 'Spring Recess' },
    { start: '2026-05-23', end: '2026-05-31', name: 'Memorial Day Recess' },
    { start: '2026-06-27', end: '2026-07-12', name: 'Independence Day Recess' },
    { start: '2026-08-01', end: '2026-09-07', name: 'August Recess' },
    { start: '2026-10-10', end: '2026-10-18', name: 'Columbus Day Recess' },
    { start: '2026-11-21', end: '2026-11-29', name: 'Thanksgiving Recess' },
    { start: '2026-12-12', end: '2026-12-31', name: 'Holiday Recess' }
  ],
  // Election day 2026
  electionDay: '2026-11-03',
  // Budget cycle key dates
  budgetDates: [
    { date: '2026-02-01', event: 'President\'s Budget typically released' },
    { date: '2026-04-15', event: 'Tax Day' },
    { date: '2026-09-30', event: 'End of Fiscal Year' },
    { date: '2026-10-01', event: 'New Fiscal Year begins' }
  ]
};

function checkCongressionalCalendar(dateStr) {
  if (!dateStr) return [];
  
  const date = new Date(dateStr);
  const warnings = [];
  
  // Check recesses
  for (const recess of CONGRESSIONAL_CALENDAR_2026.recesses) {
    const start = new Date(recess.start);
    const end = new Date(recess.end);
    if (date >= start && date <= end) {
      warnings.push({
        type: 'recess',
        severity: 'high',
        message: `During ${recess.name} — Congress not in session, Hill staff may be traveling`
      });
    }
  }
  
  // Check if during August (general warning)
  if (date.getMonth() === 7) {
    if (!warnings.some(w => w.type === 'recess')) {
      warnings.push({
        type: 'august',
        severity: 'medium',
        message: 'August is traditionally slow in DC — many contacts may be away'
      });
    }
  }
  
  // Thursday/Friday warning for Hill events
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 4 || dayOfWeek === 5) {
    warnings.push({
      type: 'endOfWeek',
      severity: 'low',
      message: 'Thu/Fri can be tricky — Members often travel to districts'
    });
  }
  
  // Monday morning warning
  if (dayOfWeek === 1) {
    warnings.push({
      type: 'monday',
      severity: 'low',
      message: 'Monday mornings can have lower Hill attendance — afternoon may work better'
    });
  }
  
  // Check proximity to election (within 4 weeks)
  const election = new Date(CONGRESSIONAL_CALENDAR_2026.electionDay);
  const daysToElection = Math.ceil((election - date) / (1000 * 60 * 60 * 24));
  if (daysToElection > 0 && daysToElection <= 28) {
    warnings.push({
      type: 'election',
      severity: 'high',
      message: `${daysToElection} days before Election Day — political figures will be campaigning`
    });
  }
  
  // Check budget cycle dates
  for (const bd of CONGRESSIONAL_CALENDAR_2026.budgetDates) {
    const budgetDate = new Date(bd.date);
    const daysDiff = Math.abs(Math.ceil((date - budgetDate) / (1000 * 60 * 60 * 24)));
    if (daysDiff <= 7) {
      warnings.push({
        type: 'budget',
        severity: 'medium',
        message: `Near ${bd.event} — budget-related events may compete for attention`
      });
    }
  }
  
  return warnings;
}

// ============================================================================
// SMART SUGGESTIONS (Rule-Based)
// ============================================================================

function generateSuggestions(data, budget) {
  const suggestions = [];
  const size = SIZE_CONFIG[data.size];
  const guestCount = size ? Math.round((size.min + size.max) / 2) : 50;
  
  // Event insurance recommendations
  const budgetMax = budget?.total?.max || 0;
  const hasAlcohol = (data.fnb || []).some(f => f.includes('Cocktail') || f.includes('Happy Hour') || f.includes('Reception'));
  const isOutdoor = data.venue === 'Rooftop/Outdoor';
  const isLargeEvent = ['major', 'flagship'].includes(data.size);
  const hasVIPs = data.vips && data.vips.trim().length > 20;
  
  if (budgetMax >= 50000) {
    suggestions.push({
      category: 'insurance',
      priority: 'high',
      message: `Budget exceeds $50k — event insurance is strongly recommended. Consider general liability, cancellation, and property coverage.`
    });
  } else if (budgetMax >= 25000 || (isLargeEvent && hasAlcohol)) {
    suggestions.push({
      category: 'insurance',
      priority: 'medium',
      message: `Consider event insurance for liability protection, especially with ${hasAlcohol ? 'alcohol service' : 'this budget level'}.`
    });
  }
  
  if (isOutdoor && budgetMax >= 15000) {
    suggestions.push({
      category: 'insurance',
      priority: 'medium',
      message: 'Outdoor events should consider weather-related cancellation coverage.'
    });
  }
  
  if (hasVIPs && isLargeEvent) {
    suggestions.push({
      category: 'insurance',
      priority: 'low',
      message: 'High-profile attendees may warrant additional security and liability coverage.'
    });
  }
  
  // AV suggestions based on size
  if (['large', 'major', 'flagship'].includes(data.size)) {
    if (!(data.av || []).includes('Wireless Microphones')) {
      suggestions.push({
        category: 'av',
        message: 'Events over 100 guests typically need wireless mics for Q&A and speaker mobility'
      });
    }
    if (!(data.av || []).includes('Recording Equipment') && !(data.av || []).includes('Livestream Setup')) {
      suggestions.push({
        category: 'av',
        message: 'Consider recording larger events — useful for absent stakeholders and content repurposing'
      });
    }
  }
  
  // Hybrid format requirements
  if (data.format === 'Hybrid') {
    if (!(data.av || []).includes('Livestream Setup')) {
      suggestions.push({
        category: 'av',
        message: 'Hybrid events require livestream capability for remote attendees'
      });
    }
    if (!(data.production || []).includes('Videographer')) {
      suggestions.push({
        category: 'production',
        message: 'A videographer helps ensure professional quality for your virtual audience'
      });
    }
  }
  
  // Government audience considerations
  if ((data.audience || []).some(a => ['Congressional Staff', 'Federal Agency Officials'].includes(a))) {
    if ((data.fnb || []).includes('Plated Dinner') || (data.fnb || []).includes('Cocktail Reception')) {
      suggestions.push({
        category: 'compliance',
        message: 'Note: Federal ethics rules limit gifts to $20/item, $50/year from single source — verify meal costs comply'
      });
    }
    if (!(data.spaces || []).includes('Registration Area')) {
      suggestions.push({
        category: 'logistics',
        message: 'Government attendees often need sign-in for ethics compliance — consider a registration area'
      });
    }
  }
  
  // Press event needs
  if (data.type === 'Press Event / Media Briefing' || (data.audience || []).includes('Journalists/Media')) {
    if (!(data.spaces || []).includes('Press/Media Room')) {
      suggestions.push({
        category: 'logistics',
        message: 'Press events benefit from a dedicated media room for interviews and filing'
      });
    }
    if (!(data.production || []).includes('Step & Repeat')) {
      suggestions.push({
        category: 'production',
        message: 'A branded step & repeat creates professional photo opportunities for media'
      });
    }
  }
  
  // VIP considerations
  if (data.vips && data.vips.trim().length > 0) {
    if (!(data.spaces || []).includes('VIP Green Room')) {
      suggestions.push({
        category: 'logistics',
        message: 'VIP speakers often need a green room for prep and private conversations'
      });
    }
  }
  
  // Multi-day event suggestions
  if (['two', 'three'].includes(data.duration)) {
    if (!(data.program || []).includes('Networking Breaks')) {
      suggestions.push({
        category: 'program',
        message: 'Multi-day events need dedicated networking time to prevent fatigue'
      });
    }
  }
  
  // Gala specifics
  if (data.type === 'Fundraising Gala') {
    if (!(data.fnb || []).includes('Cocktail Reception')) {
      suggestions.push({
        category: 'fnb',
        message: 'Galas typically open with a cocktail reception for arrival and mingling'
      });
    }
    if (!(data.production || []).includes('Lighting Design')) {
      suggestions.push({
        category: 'production',
        message: 'Lighting design transforms a space for gala atmosphere'
      });
    }
  }
  
  // Outdoor venue backup
  if (data.venue === 'Rooftop/Outdoor') {
    suggestions.push({
      category: 'logistics',
      message: 'Outdoor venues need a weather backup plan — confirm indoor alternative with venue'
    });
  }
  
  // International delegates
  if ((data.audience || []).includes('International Delegates')) {
    if (!(data.av || []).includes('Interpretation Equipment')) {
      suggestions.push({
        category: 'av',
        message: 'International attendees may need interpretation services'
      });
    }
  }
  
  // Post-event gaps
  if ((data.postEvent || []).length === 0 && data.type) {
    suggestions.push({
      category: 'postEvent',
      message: 'Don\'t forget post-event follow-up — thank you notes and surveys extend your impact'
    });
  }
  
  return suggestions;
}

// ============================================================================
// BUDGET CALCULATION
// ============================================================================

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

function calculateBudget(data, vendorData) {
  const size = SIZE_CONFIG[data.size] || SIZE_CONFIG.medium;
  const guests = Math.round((size.min + size.max) / 2);
  const duration = DURATION_OPTIONS.find(d => d.value === data.duration) || DURATION_OPTIONS[1];
  const days = duration.days;
  const region = REGIONS[data.region] || REGIONS['dc-metro'];
  const multiplier = region.multiplier;

  const costs = { venue: { min: 0, max: 0 }, fnb: 0, av: 0, production: 0, collateral: 0, marketing: 0 };

  const venueRange = DEFAULT_COSTS.venue[data.size] || [5000, 15000];
  costs.venue.min = Math.round(venueRange[0] * days * multiplier);
  costs.venue.max = Math.round(venueRange[1] * days * multiplier);

  (data.fnb || []).forEach(item => {
    const cost = DEFAULT_COSTS.fnb[item] || 30;
    costs.fnb += Math.round(cost * guests * multiplier);
  });

  (data.av || []).forEach(item => {
    const cost = DEFAULT_COSTS.av[item] || 500;
    costs.av += Math.round(cost * days * multiplier);
  });

  (data.production || []).forEach(item => {
    const cost = DEFAULT_COSTS.production[item] || 2000;
    costs.production += Math.round(cost * multiplier);
  });

  (data.collateral || []).forEach(item => {
    const cost = DEFAULT_COSTS.collateral[item] || 5;
    costs.collateral += Math.round(cost * guests);
  });

  (data.marketing || []).forEach(item => {
    costs.marketing += DEFAULT_COSTS.marketing[item] || 500;
  });

  const subtotalMin = costs.venue.min + costs.fnb + costs.av + costs.production + costs.collateral + costs.marketing;
  const subtotalMax = costs.venue.max + costs.fnb + costs.av + costs.production + costs.collateral + costs.marketing;
  
  const staffingMin = Math.round(subtotalMin * 0.10);
  const staffingMax = Math.round(subtotalMax * 0.10);
  const contingencyMin = Math.round(subtotalMin * 0.15);
  const contingencyMax = Math.round(subtotalMax * 0.15);

  return {
    costs,
    subtotal: { min: subtotalMin, max: subtotalMax },
    staffing: { min: staffingMin, max: staffingMax },
    contingency: { min: contingencyMin, max: contingencyMax },
    total: { min: subtotalMin + staffingMin + contingencyMin, max: subtotalMax + staffingMax + contingencyMax },
    guests,
    days,
    region: region.name
  };
}

// ============================================================================
// TIMELINE GENERATION
// ============================================================================

function generateTimeline(data) {
  const eventDate = data.date ? new Date(data.date) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const today = new Date();
  
  const milestones = [
    { weeks: -16, task: 'Define goals, budget, and initial planning', label: '16 weeks out' },
    { weeks: -14, task: 'Secure venue and set date', label: '14 weeks out' },
    { weeks: -12, task: 'Confirm speakers and program outline', label: '12 weeks out' },
    { weeks: -10, task: 'Launch invitations and registration', label: '10 weeks out' },
    { weeks: -8, task: 'Finalize catering and AV requirements', label: '8 weeks out' },
    { weeks: -6, task: 'Confirm all vendors and logistics', label: '6 weeks out' },
    { weeks: -4, task: 'Send reminders, finalize materials', label: '4 weeks out' },
    { weeks: -2, task: 'Final walkthrough and briefings', label: '2 weeks out' },
    { weeks: -1, task: 'Confirm final headcount, last details', label: '1 week out' },
    { weeks: 0, task: 'Event day - execute plan', label: 'Event Day' }
  ];

  return milestones.map(m => {
    const milestoneDate = new Date(eventDate);
    milestoneDate.setDate(eventDate.getDate() + (m.weeks * 7));
    const isPast = milestoneDate < today;
    const isCurrent = !isPast && milestoneDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { ...m, date: milestoneDate, isPast, isCurrent };
  });
}

// ============================================================================
// RISK ANALYSIS
// ============================================================================

function analyzeRisks(data) {
  const risks = [];
  const eventDate = data.date ? new Date(data.date) : null;
  const daysOut = eventDate ? Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24)) : 999;

  if (daysOut < 42) risks.push({ level: 'high', message: 'Less than 6 weeks out — timeline is tight for vendor booking' });
  if (daysOut < 84 && !data.venue) risks.push({ level: 'high', message: 'Less than 12 weeks out without venue type selected' });
  if (['large', 'major', 'flagship'].includes(data.size) && !(data.av || []).includes('Wireless Microphones')) {
    risks.push({ level: 'medium', message: 'Large event may need microphones for speakers' });
  }
  if (data.format === 'Hybrid' && !(data.av || []).includes('Livestream Setup')) {
    risks.push({ level: 'medium', message: 'Hybrid event needs livestream capability' });
  }
  if (['major', 'flagship'].includes(data.size) && !(data.funding || '').trim()) {
    risks.push({ level: 'medium', message: 'Large budget without confirmed funding sources' });
  }

  return risks;
}

// ============================================================================
// CALENDAR EXPORT (.ics)
// ============================================================================

function generateICS(data, timeline) {
  const eventDate = data.date ? new Date(data.date) : new Date();
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SeedAI//Event Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

  // Main event
  const eventEnd = new Date(eventDate);
  const duration = DURATION_OPTIONS.find(d => d.value === data.duration);
  if (duration && duration.days >= 1) {
    eventEnd.setDate(eventEnd.getDate() + Math.ceil(duration.days));
  } else {
    eventEnd.setHours(eventEnd.getHours() + 4);
  }
  
  icsContent += `BEGIN:VEVENT
DTSTART:${formatICSDate(eventDate)}
DTEND:${formatICSDate(eventEnd)}
SUMMARY:${data.name || 'Event'}
DESCRIPTION:${data.description || ''}
LOCATION:${REGIONS[data.region]?.name || 'TBD'}
STATUS:CONFIRMED
UID:${Date.now()}-event@seedai.org
END:VEVENT
`;

  // Add milestone reminders
  timeline.forEach((milestone, index) => {
    if (milestone.weeks < 0) {
      const reminderDate = new Date(milestone.date);
      reminderDate.setHours(9, 0, 0, 0);
      const reminderEnd = new Date(reminderDate);
      reminderEnd.setHours(10, 0, 0, 0);
      
      icsContent += `BEGIN:VEVENT
DTSTART:${formatICSDate(reminderDate)}
DTEND:${formatICSDate(reminderEnd)}
SUMMARY:[${data.name || 'Event'}] ${milestone.label}: ${milestone.task}
DESCRIPTION:Planning milestone for ${data.name || 'your event'}
STATUS:TENTATIVE
UID:${Date.now()}-milestone-${index}@seedai.org
END:VEVENT
`;
    }
  });

  icsContent += 'END:VCALENDAR';
  return icsContent;
}

// ============================================================================
// DOCUMENT GENERATORS
// ============================================================================

const generateBriefing = (data, budget) => {
  const size = SIZE_CONFIG[data.size] || SIZE_CONFIG.medium;
  return `EVENT BRIEFING
${'='.repeat(60)}

${data.name || 'Untitled Event'}
${data.type || 'Event'} | ${data.date || 'Date TBD'}

OVERVIEW
${'-'.repeat(40)}
${data.description || 'No description provided.'}

KEY OBJECTIVES
${'-'.repeat(40)}
${data.objectives || 'Objectives not yet defined.'}

EVENT DETAILS
${'-'.repeat(40)}
Format: ${data.format || 'TBD'}
Expected Attendance: ${size.min}-${size.max} guests
Duration: ${DURATION_OPTIONS.find(d => d.value === data.duration)?.label || 'TBD'}
Location: ${budget.region}
Venue Type: ${data.venue || 'TBD'}

BUDGET SUMMARY
${'-'.repeat(40)}
Estimated Range: ${fmt(budget.total.min)} - ${fmt(budget.total.max)}

TARGET AUDIENCE
${'-'.repeat(40)}
${(data.audience || []).join(', ') || 'Not specified'}

VIP ATTENDEES
${'-'.repeat(40)}
${data.vips || 'None identified yet'}

SPEAKERS/PRESENTERS
${'-'.repeat(40)}
${data.speakers || 'Not confirmed'}

PROGRAM HIGHLIGHTS
${'-'.repeat(40)}
${(data.program || []).join(', ') || 'Program not finalized'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateRunOfShow = (data, budget) => {
  const duration = DURATION_OPTIONS.find(d => d.value === data.duration) || DURATION_OPTIONS[1];
  let schedule = '';
  
  if (duration.days <= 1) {
    schedule = `
08:00 AM  Staff arrival and setup
08:30 AM  Vendor check-in, AV testing
09:00 AM  Registration opens
09:30 AM  Welcome and opening remarks
10:00 AM  ${(data.program || []).includes('Keynote Address') ? 'Keynote Address' : 'Opening Session'}
10:45 AM  Networking break
11:00 AM  ${(data.program || []).includes('Panel Discussion') ? 'Panel Discussion' : 'Main Program'}
12:00 PM  ${(data.fnb || []).some(f => f.includes('Lunch')) ? 'Lunch Service' : 'Midday Break'}
01:00 PM  Afternoon programming
02:30 PM  Break
02:45 PM  ${(data.program || []).includes('Breakout Sessions') ? 'Breakout Sessions' : 'Continued Programming'}
04:00 PM  Closing remarks
04:30 PM  ${(data.fnb || []).includes('Cocktail Reception') ? 'Networking Reception' : 'Event Concludes'}
06:00 PM  Venue breakdown`;
  } else {
    schedule = `
DAY 1
------
08:00 AM  Staff arrival and setup
09:00 AM  Registration opens
09:30 AM  Welcome and opening remarks
10:00 AM  Morning sessions
12:00 PM  Lunch
01:30 PM  Afternoon programming
05:00 PM  Day 1 concludes
06:00 PM  Evening reception (if applicable)

DAY 2
------
08:30 AM  Registration/coffee
09:00 AM  Day 2 opening
09:30 AM  Morning sessions
12:00 PM  Lunch
01:30 PM  Afternoon programming
04:00 PM  Closing session
04:30 PM  Event concludes`;
    
    if (duration.days >= 3) {
      schedule += `

DAY 3
------
08:30 AM  Registration/coffee
09:00 AM  Day 3 sessions
12:00 PM  Lunch
01:30 PM  Final sessions
03:30 PM  Closing ceremony
04:00 PM  Event concludes
04:30 PM  Breakdown begins`;
    }
  }

  return `RUN OF SHOW
${'='.repeat(60)}

${data.name || 'Untitled Event'}
${data.date || 'Date TBD'} | ${budget.region}
${schedule}

KEY CONTACTS
${'-'.repeat(40)}
${(data.team || []).map(t => `${t.role}: ${t.name}`).join('\n') || 'Team not assigned'}

NOTES
${'-'.repeat(40)}
${data.notes || 'No additional notes'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateBudgetDoc = (data, budget) => {
  return `BUDGET BREAKDOWN
${'='.repeat(60)}

${data.name || 'Untitled Event'}
${data.date || 'Date TBD'} | ${budget.guests} guests | ${budget.days} day(s)
Location: ${budget.region}

COST ESTIMATES
${'-'.repeat(40)}

VENUE
  Estimate: ${fmt(budget.costs.venue.min)} - ${fmt(budget.costs.venue.max)}
  Type: ${data.venue || 'TBD'}

FOOD & BEVERAGE
  Estimate: ${fmt(budget.costs.fnb)}
  Items: ${(data.fnb || []).join(', ') || 'None selected'}

AUDIO/VISUAL
  Estimate: ${fmt(budget.costs.av)}
  Items: ${(data.av || []).join(', ') || 'None selected'}

PRODUCTION & DESIGN
  Estimate: ${fmt(budget.costs.production)}
  Items: ${(data.production || []).join(', ') || 'None selected'}

COLLATERAL & MATERIALS
  Estimate: ${fmt(budget.costs.collateral)}
  Items: ${(data.collateral || []).join(', ') || 'None selected'}

MARKETING & COMMUNICATIONS
  Estimate: ${fmt(budget.costs.marketing)}
  Items: ${(data.marketing || []).join(', ') || 'None selected'}

${'-'.repeat(40)}
SUBTOTAL: ${fmt(budget.subtotal.min)} - ${fmt(budget.subtotal.max)}

Staffing (10%): ${fmt(budget.staffing.min)} - ${fmt(budget.staffing.max)}
Contingency (15%): ${fmt(budget.contingency.min)} - ${fmt(budget.contingency.max)}

${'='.repeat(40)}
TOTAL ESTIMATE: ${fmt(budget.total.min)} - ${fmt(budget.total.max)}

FUNDING SOURCES
${'-'.repeat(40)}
${data.funding || 'Not specified'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateChecklist = (data) => {
  return `PLANNING CHECKLIST
${'='.repeat(60)}

${data.name || 'Untitled Event'}
${data.date || 'Date TBD'}

16+ WEEKS OUT
${'-'.repeat(40)}
[ ] Define event goals and success metrics
[ ] Establish preliminary budget
[ ] Identify key stakeholders
[ ] Begin venue research

14 WEEKS OUT
${'-'.repeat(40)}
[ ] Secure venue contract
[ ] Confirm event date
[ ] Draft speaker wish list
[ ] Create project timeline

12 WEEKS OUT
${'-'.repeat(40)}
[ ] Confirm keynote speakers
[ ] Finalize program outline
[ ] Select catering vendor
[ ] Book AV provider

10 WEEKS OUT
${'-'.repeat(40)}
[ ] Launch save-the-date
[ ] Open registration
[ ] Finalize marketing plan
[ ] Order collateral materials

8 WEEKS OUT
${'-'.repeat(40)}
[ ] Send formal invitations
[ ] Confirm all vendors
[ ] Finalize menu selections
[ ] Review AV requirements

6 WEEKS OUT
${'-'.repeat(40)}
[ ] Track RSVPs
[ ] Brief speakers on logistics
[ ] Finalize printed materials
[ ] Confirm staffing plan

4 WEEKS OUT
${'-'.repeat(40)}
[ ] Send reminder emails
[ ] Finalize seating/layout
[ ] Create run of show
[ ] Prepare name badges

2 WEEKS OUT
${'-'.repeat(40)}
[ ] Final venue walkthrough
[ ] Confirm final headcount
[ ] Brief all staff/volunteers
[ ] Test all technology

1 WEEK OUT
${'-'.repeat(40)}
[ ] Final vendor confirmations
[ ] Print final materials
[ ] Prepare emergency kit
[ ] Send final attendee communications

EVENT DAY
${'-'.repeat(40)}
[ ] Early arrival for setup
[ ] Staff briefing
[ ] Vendor check-ins
[ ] Execute run of show
[ ] Capture photos/video
[ ] Monitor and adjust as needed

POST-EVENT
${'-'.repeat(40)}
[ ] Send thank you notes
[ ] Distribute survey
[ ] Compile event report
[ ] Process vendor payments
[ ] Archive materials
[ ] Debrief with team

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateVenueRFP = (data, budget) => {
  const size = SIZE_CONFIG[data.size] || SIZE_CONFIG.medium;
  const duration = DURATION_OPTIONS.find(d => d.value === data.duration) || DURATION_OPTIONS[1];
  return `VENUE INQUIRY
${'='.repeat(60)}

Subject: Venue Inquiry - ${data.name || 'Event'} | ${data.date || 'Date TBD'}

Dear Events Team,

We are seeking venue availability for an upcoming ${data.type || 'event'}.

EVENT DETAILS
${'-'.repeat(40)}
Event Name: ${data.name || 'TBD'}
Date: ${data.date || 'Flexible'}
Duration: ${duration.label}
Expected Attendance: ${size.min}-${size.max} guests
Format: ${data.format || 'In-Person'}

SPACE REQUIREMENTS
${'-'.repeat(40)}
${(data.spaces || []).map(s => `• ${s}`).join('\n') || '• Main event space\n• Registration area'}

CATERING NEEDS
${'-'.repeat(40)}
${(data.fnb || []).map(f => `• ${f}`).join('\n') || '• To be determined'}

AV REQUIREMENTS
${'-'.repeat(40)}
${(data.av || []).map(a => `• ${a}`).join('\n') || '• Basic AV setup'}

BUDGET RANGE
${'-'.repeat(40)}
Venue Budget: ${fmt(budget.costs.venue.min)} - ${fmt(budget.costs.venue.max)}

Please provide:
1. Availability for requested date(s)
2. Rental pricing and what's included
3. Catering options and pricing
4. AV capabilities and costs
5. Floor plans for proposed spaces
6. Any date flexibility or package options

We look forward to hearing from you.

Best regards,
${(data.team || []).find(t => t.role?.toLowerCase().includes('lead'))?.name || '[Your Name]'}
${data.name ? `${data.name} Planning Team` : '[Organization]'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateCateringRFP = (data, budget) => {
  const size = SIZE_CONFIG[data.size] || SIZE_CONFIG.medium;
  return `CATERING INQUIRY
${'='.repeat(60)}

Subject: Catering Request - ${data.name || 'Event'} | ${data.date || 'Date TBD'}

Dear Catering Team,

We are requesting a proposal for catering services for our upcoming event.

EVENT OVERVIEW
${'-'.repeat(40)}
Event: ${data.name || 'TBD'}
Date: ${data.date || 'TBD'}
Location: ${data.venue || 'TBD'} (${budget.region})
Guest Count: ${size.min}-${size.max}

SERVICE REQUIREMENTS
${'-'.repeat(40)}
${(data.fnb || []).map(f => `• ${f}`).join('\n') || '• To be determined'}

DIETARY CONSIDERATIONS
${'-'.repeat(40)}
Please include options for:
• Vegetarian/Vegan
• Gluten-free
• Common allergies

BUDGET
${'-'.repeat(40)}
F&B Budget: Approximately ${fmt(budget.costs.fnb)}

Please provide:
1. Proposed menus for each service
2. Per-person pricing
3. Minimum guest requirements
4. Staff and equipment included
5. Setup and breakdown timing

Thank you for your consideration.

Best regards,
${(data.team || []).find(t => t.role?.toLowerCase().includes('lead'))?.name || '[Your Name]'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateSpeakerInvite = (data) => {
  return `SPEAKER INVITATION
${'='.repeat(60)}

Subject: Speaking Invitation - ${data.name || 'Event'}

Dear [Speaker Name],

On behalf of [Organization], I am pleased to invite you to participate as a speaker at ${data.name || 'our upcoming event'}.

EVENT DETAILS
${'-'.repeat(40)}
Event: ${data.name || 'TBD'}
Date: ${data.date || 'TBD'}
Location: ${REGIONS[data.region]?.name || 'TBD'}
Format: ${data.format || 'In-Person'}

ABOUT THE EVENT
${'-'.repeat(40)}
${data.description || 'Event description to be provided.'}

TARGET AUDIENCE
${'-'.repeat(40)}
${(data.audience || []).join(', ') || 'Policy professionals and stakeholders'}

Expected attendance: ${SIZE_CONFIG[data.size]?.label || '50-100 guests'}

SPEAKING OPPORTUNITY
${'-'.repeat(40)}
We would be honored to have you [participate in a panel discussion / deliver a keynote address / lead a workshop session].

Topic area: [Proposed topic]
Time slot: [Proposed time]
Duration: [XX minutes]

WHAT WE PROVIDE
${'-'.repeat(40)}
• Travel and accommodation (if applicable)
• Speaker preparation support
• Professional AV and production
• Promotion to our network

Please let us know your availability and interest by [date]. We're happy to discuss the opportunity further at your convenience.

Warm regards,
${(data.team || []).find(t => t.role?.toLowerCase().includes('lead'))?.name || '[Your Name]'}
[Title]
[Organization]
[Contact Information]

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const generateContacts = (data) => {
  return `DAY-OF CONTACTS
${'='.repeat(60)}

${data.name || 'Event'}
${data.date || 'Date TBD'}

INTERNAL TEAM
${'-'.repeat(40)}
${(data.team || []).map(t => `${t.role || 'Team Member'}: ${t.name || 'TBD'}
  Phone: [Add phone]
  Email: [Add email]`).join('\n\n') || 'Team not assigned'}

VENUE CONTACT
${'-'.repeat(40)}
Venue: ${data.venue || 'TBD'}
Contact: [Name]
Phone: [Phone]
Email: [Email]

CATERING CONTACT
${'-'.repeat(40)}
Company: [Caterer Name]
Contact: [Name]
Phone: [Phone]
Day-of Lead: [Name]

AV/PRODUCTION CONTACT
${'-'.repeat(40)}
Company: [AV Company]
Contact: [Name]
Phone: [Phone]
Day-of Tech: [Name]

EMERGENCY CONTACTS
${'-'.repeat(40)}
Venue Security: [Phone]
Building Management: [Phone]
Local Emergency: 911

NOTES
${'-'.repeat(40)}
${data.notes || 'No additional notes'}

---
Generated by SeedAI Event Planner | ${new Date().toLocaleDateString()}`;
};

const DOCUMENTS = {
  briefing: { name: 'Event Briefing', icon: '📋', generate: generateBriefing },
  runofshow: { name: 'Run of Show', icon: '⏱️', generate: generateRunOfShow },
  budget: { name: 'Budget Breakdown', icon: '💰', generate: generateBudgetDoc },
  checklist: { name: 'Planning Checklist', icon: '✅', generate: generateChecklist },
  venueRfp: { name: 'Venue RFP', icon: '🏛️', generate: generateVenueRFP },
  cateringRfp: { name: 'Catering RFP', icon: '🍽️', generate: generateCateringRFP },
  speakerInvite: { name: 'Speaker Invitation', icon: '🎤', generate: generateSpeakerInvite },
  contacts: { name: 'Day-Of Contacts', icon: '📞', generate: generateContacts }
};

// ============================================================================
// AI PROMPT GENERATOR (for Copy for AI)
// ============================================================================

function generateAIPrompt(data, budget) {
  const size = SIZE_CONFIG[data.size] || SIZE_CONFIG.medium;
  
  return `I'm planning a policy event and need help refining my plan. Here are the details:

## Event Overview
- **Name:** ${data.name || '[Not yet named]'}
- **Type:** ${data.type || '[Not specified]'}
- **Date:** ${data.date || '[TBD]'}
- **Location:** ${REGIONS[data.region]?.name || 'Washington, DC'}
- **Format:** ${data.format || '[Not specified]'}
- **Expected Size:** ${size ? `${size.min}-${size.max} guests` : '[Not specified]'}
- **Duration:** ${DURATION_OPTIONS.find(d => d.value === data.duration)?.label || '[Not specified]'}
- **Venue Type:** ${data.venue || '[Not specified]'}

## Purpose & Goals
**Description:** ${data.description || '[No description yet]'}

**Objectives:** ${data.objectives || '[No objectives defined]'}

## Audience
**Target Audience:** ${(data.audience || []).join(', ') || '[Not specified]'}

**VIPs:** ${data.vips || '[None identified]'}

**Speakers:** ${data.speakers || '[Not confirmed]'}

## Program & Logistics
**Program Elements:** ${(data.program || []).join(', ') || '[None selected]'}

**Spaces Needed:** ${(data.spaces || []).join(', ') || '[None selected]'}

**Food & Beverage:** ${(data.fnb || []).join(', ') || '[None selected]'}

**AV Requirements:** ${(data.av || []).join(', ') || '[None selected]'}

**Production:** ${(data.production || []).join(', ') || '[None selected]'}

## Budget
**Estimated Range:** ${fmt(budget.total.min)} - ${fmt(budget.total.max)}

**Funding Sources:** ${data.funding || '[Not specified]'}

## Team
${(data.team || []).filter(t => t.name).map(t => `- ${t.name}${t.role ? ` (${t.role})` : ''}`).join('\n') || '[No team assigned]'}

## Additional Notes
${data.notes || '[None]'}

---

Please help me with:
1. Review this plan for any gaps or risks I might have missed
2. Suggest improvements based on DC policy event best practices
3. [Add your specific question here]`;
}

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

const PHASES = [
  {
    id: 'vision',
    name: 'Vision',
    title: 'Define Your Vision',
    description: 'Start with the big picture — what are you trying to achieve?',
    icon: '💡'
  },
  {
    id: 'audience',
    name: 'Audience',
    title: 'Know Your Audience',
    description: 'Who are you bringing together and why does it matter to them?',
    icon: '👥'
  },
  {
    id: 'logistics',
    name: 'Logistics',
    title: 'Set the Stage',
    description: 'Where and when will this happen?',
    icon: '📍'
  },
  {
    id: 'program',
    name: 'Program',
    title: 'Design the Experience',
    description: 'What will attendees do and experience?',
    icon: '📝'
  },
  {
    id: 'services',
    name: 'Services',
    title: 'Plan the Details',
    description: 'Food, AV, materials — the practical elements that make it work.',
    icon: '🔧'
  },
  {
    id: 'review',
    name: 'Review',
    title: 'Review & Generate',
    description: 'See your complete plan and generate documents.',
    icon: '✨'
  }
];

// ============================================================================
// GUIDING PROMPTS
// ============================================================================

const PROMPTS = {
  name: "What's the working title for your event? This can evolve as planning progresses.",
  type: "What type of event best describes what you're planning?",
  description: "In 2-3 sentences, describe what this event is about. What's the core theme or focus?",
  objectives: "What does success look like? What should attendees walk away with? What impact do you want to create?",
  size: "How many people do you realistically expect to attend?",
  audience: "Who specifically are you trying to reach? Think about job titles, sectors, and why they'd want to attend.",
  vips: "Are there specific high-profile individuals you're hoping to attract? Members of Congress, executives, thought leaders?",
  speakers: "Who would be ideal to present, moderate, or lead discussions? Dream big, but also consider realistic options.",
  date: "When are you planning to hold this event? Consider seasonality and competing events.",
  duration: "How long do you need to accomplish your goals?",
  format: "Will attendees gather in person, join virtually, or both?",
  venue: "What type of space fits your event's tone and needs?",
  region: "Where will this event take place? This helps us estimate local market costs.",
  spaces: "Beyond the main room, what other spaces might you need?",
  program: "What elements will make up your agenda? Think about variety and pacing.",
  fnb: "Food and beverage sets the tone. What level of hospitality fits your event?",
  av: "What technology do you need to deliver your content effectively?",
  production: "What visual and design elements will enhance the experience?",
  collateral: "What materials will attendees receive or take home?",
  marketing: "How will you spread the word and drive registration?",
  postEvent: "What happens after the event to extend its impact?",
  team: "Who are the key people responsible for making this happen?",
  funding: "Where is the budget coming from? Sponsors, organizational budget, grants?",
  notes: "Anything else important to remember as planning progresses?"
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EventPlannerV7() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [data, setData] = useState({
    name: '', type: '', size: '', duration: '', date: '', format: '', venue: '', region: 'dc-metro',
    description: '', objectives: '', audience: [], vips: '', speakers: '',
    program: [], spaces: [], fnb: [], av: [], production: [], collateral: [], marketing: [], postEvent: [],
    team: [{ name: '', role: '' }], notes: '', funding: ''
  });
  const [vendorData, setVendorData] = useState(null);
  const [activeDoc, setActiveDoc] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const fileInputRef = useRef(null);

  // Load saved data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('seedai-planner-v7');
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('seedai-planner-v7', JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const update = (field, value) => setData(prev => ({ ...prev, [field]: value }));
  const toggle = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const budget = calculateBudget(data, vendorData);
  const timeline = generateTimeline(data);
  const risks = analyzeRisks(data);
  const suggestions = generateSuggestions(data, budget);
  const calendarWarnings = checkCongressionalCalendar(data.date);

  // Phase completion checks
  const phaseComplete = {
    vision: !!(data.name && data.type && data.description && data.objectives),
    audience: !!(data.size && data.audience.length > 0),
    logistics: !!(data.date && data.duration && data.format && data.venue && data.region),
    program: !!(data.program.length > 0),
    services: !!(data.fnb.length > 0 || data.av.length > 0),
    review: true
  };

  const completedPhases = Object.values(phaseComplete).filter(Boolean).length;

  // Handlers
  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }, []);

  const handleDownload = useCallback((text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportJSON = useCallback(() => {
    const exportData = {
      version: 'v7',
      exportedAt: new Date().toISOString(),
      data
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'event'}-plan.json`.toLowerCase().replace(/\s+/g, '-');
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const handleImportJSON = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result);
        if (imported.data) {
          setData(prev => ({ ...prev, ...imported.data }));
          alert('Plan imported successfully!');
        }
      } catch (err) {
        alert('Failed to import plan. Invalid file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleExportCalendar = useCallback(() => {
    const icsContent = generateICS(data, timeline);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'event'}-calendar.ics`.toLowerCase().replace(/\s+/g, '-');
    a.click();
    URL.revokeObjectURL(url);
  }, [data, timeline]);

  const handleCopyForAI = useCallback(() => {
    const prompt = generateAIPrompt(data, budget);
    handleCopy(prompt);
  }, [data, budget, handleCopy]);

  const applyTemplate = useCallback((templateKey) => {
    const template = EVENT_TEMPLATES[templateKey];
    if (template) {
      setData(prev => ({
        ...prev,
        ...template.data,
        name: '', // Keep name blank for user to fill
        description: '', // Keep description blank
        objectives: '', // Keep objectives blank
        date: '', // Keep date blank
        region: prev.region || 'dc-metro', // Keep their region or default
        vips: '',
        speakers: '',
        team: [{ name: '', role: '' }],
        notes: '',
        funding: ''
      }));
      setShowTemplates(false);
      setCurrentPhase(0); // Go to first phase
    }
  }, []);

  // Components
  const Prompt = ({ text }) => (
    <p className="text-zinc-400 text-sm mb-3 italic">{text}</p>
  );

  const Input = ({ label, field, type = 'text', options, required, placeholder }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-zinc-300 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {PROMPTS[field] && <Prompt text={PROMPTS[field]} />}
      {type === 'select' ? (
        <select
          value={data[field]}
          onChange={(e) => update(field, e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
        >
          <option value="">{placeholder || 'Select...'}</option>
          {options.map(opt => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={data[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
        />
      ) : type === 'date' ? (
        <div className="flex gap-2">
          <input
            type="date"
            value={data[field]}
            onChange={(e) => update(field, e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:invert"
          />
          <input
            type="text"
            value={data[field] ? new Date(data[field] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            onChange={(e) => {
              // Try to parse common date formats
              const input = e.target.value;
              const parsed = new Date(input);
              if (!isNaN(parsed.getTime())) {
                const yyyy = parsed.getFullYear();
                const mm = String(parsed.getMonth() + 1).padStart(2, '0');
                const dd = String(parsed.getDate()).padStart(2, '0');
                update(field, `${yyyy}-${mm}-${dd}`);
              }
            }}
            placeholder="or type: Mar 15, 2026"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      ) : (
        <input
          type={type}
          value={data[field]}
          onChange={(e) => update(field, e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
        />
      )}
    </div>
  );

  const CheckboxGroup = ({ label, field, options }) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-zinc-300 mb-1">{label}</label>
      {PROMPTS[field] && <Prompt text={PROMPTS[field]} />}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => toggle(field, opt)}
            className={`px-3 py-2 rounded-lg text-sm transition-all ${
              data[field].includes(opt)
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const TeamMembers = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-zinc-300 mb-1">Planning Team</label>
      {PROMPTS.team && <Prompt text={PROMPTS.team} />}
      {data.team.map((member, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <input
            placeholder="Name"
            value={member.name}
            onChange={(e) => {
              const newTeam = [...data.team];
              newTeam[i].name = e.target.value;
              update('team', newTeam);
            }}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
          <input
            placeholder="Role"
            value={member.role}
            onChange={(e) => {
              const newTeam = [...data.team];
              newTeam[i].role = e.target.value;
              update('team', newTeam);
            }}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
          {data.team.length > 1 && (
            <button
              onClick={() => update('team', data.team.filter((_, j) => j !== i))}
              className="px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => update('team', [...data.team, { name: '', role: '' }])}
        className="text-emerald-400 text-sm hover:text-emerald-300"
      >
        + Add team member
      </button>
    </div>
  );

  // Suggestions Component
  const SuggestionsPanel = () => {
    const currentPhaseSuggestions = suggestions.filter(s => {
      const phase = PHASES[currentPhase].id;
      if (phase === 'services') return ['av', 'fnb', 'production', 'collateral'].includes(s.category);
      if (phase === 'logistics') return ['logistics', 'compliance'].includes(s.category);
      if (phase === 'program') return ['program', 'postEvent'].includes(s.category);
      return false;
    });

    if (currentPhaseSuggestions.length === 0) return null;

    return (
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
          <span>💡</span> Suggestions
        </h4>
        <ul className="space-y-2">
          {currentPhaseSuggestions.map((s, i) => (
            <li key={i} className="text-amber-200/80 text-sm">{s.message}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Calendar Warnings Component
  const CalendarWarnings = () => {
    if (calendarWarnings.length === 0) return null;

    return (
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mt-4">
        <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
          <span>📅</span> DC Calendar Notes
        </h4>
        <ul className="space-y-2">
          {calendarWarnings.map((w, i) => (
            <li key={i} className={`text-sm ${
              w.severity === 'high' ? 'text-red-300' : 
              w.severity === 'medium' ? 'text-yellow-300' : 'text-blue-200/80'
            }`}>
              {w.message}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Document Modal
  const DocumentModal = () => {
    if (!activeDoc) return null;
    const doc = DOCUMENTS[activeDoc];
    const content = doc.generate(data, budget);
    const filename = `${data.name || 'event'}-${activeDoc}.txt`.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setActiveDoc(null)}>
        <div className="bg-zinc-900 rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h3 className="text-lg font-semibold text-white">{doc.icon} {doc.name}</h3>
            <button onClick={() => setActiveDoc(null)} className="text-zinc-400 hover:text-white text-2xl">×</button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-950 p-4 rounded-lg">{content}</pre>
          </div>
          <div className="flex gap-2 p-4 border-t border-zinc-700">
            <button
              onClick={() => handleCopy(content)}
              className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500"
            >
              {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => handleDownload(content, filename)}
              className="flex-1 bg-zinc-700 text-white py-2 rounded-lg hover:bg-zinc-600"
            >
              Download .txt
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Share Menu
  const ShareMenu = () => {
    if (!showShareMenu) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowShareMenu(false)}>
        <div className="bg-zinc-900 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
          <h3 className="text-xl font-semibold text-white mb-6">Share & Export</h3>
          
          <div className="space-y-4">
            <button
              onClick={() => { handleCopyForAI(); setShowShareMenu(false); }}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-lg text-left"
            >
              <div className="font-medium">🤖 Copy for AI Refinement</div>
              <div className="text-sm text-purple-200 mt-1">Pre-formatted prompt to paste into Claude for feedback</div>
            </button>
            
            <button
              onClick={() => { handleExportJSON(); setShowShareMenu(false); }}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg text-left"
            >
              <div className="font-medium">📦 Export Plan (JSON)</div>
              <div className="text-sm text-zinc-400 mt-1">Share with team members or backup your plan</div>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg text-left"
            >
              <div className="font-medium">📥 Import Plan (JSON)</div>
              <div className="text-sm text-zinc-400 mt-1">Load a shared plan from a teammate</div>
            </button>
            
            <button
              onClick={() => { handleExportCalendar(); setShowShareMenu(false); }}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg text-left"
            >
              <div className="font-medium">📅 Export to Calendar (.ics)</div>
              <div className="text-sm text-zinc-400 mt-1">Add event + milestones to Outlook/Google Calendar</div>
            </button>
          </div>
          
          <button
            onClick={() => setShowShareMenu(false)}
            className="w-full mt-6 text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // Template Modal
  const TemplateModal = () => {
    if (!showTemplates) return null;

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplates(false)}>
        <div className="bg-zinc-900 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-zinc-700">
            <h3 className="text-xl font-semibold text-white">Start from a Template</h3>
            <p className="text-zinc-400 mt-1">Choose a template to pre-fill common settings. You'll still customize the details.</p>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(EVENT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-emerald-500 rounded-xl p-5 text-left transition-all group"
                >
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{template.name}</div>
                  <div className="text-sm text-zinc-400 mt-1">{template.description}</div>
                  <div className="text-xs text-zinc-500 mt-3 font-mono">{template.preview}</div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-zinc-700 flex justify-between items-center">
            <span className="text-zinc-500 text-sm">Templates pre-fill logistics — you'll still add your unique details</span>
            <button
              onClick={() => setShowTemplates(false)}
              className="px-4 py-2 text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Phase Content
  const renderPhaseContent = () => {
    const phase = PHASES[currentPhase];

    switch (phase.id) {
      case 'vision':
        return (
          <div className="space-y-6">
            <Input label="Event Name" field="name" required placeholder="e.g., 2026 Climate Policy Summit" />
            <Input label="Event Type" field="type" type="select" options={EVENT_TYPES} required />
            <Input label="Description" field="description" type="textarea" required placeholder="Describe the event's purpose and focus..." />
            <Input label="Objectives" field="objectives" type="textarea" required placeholder="What outcomes are you working toward?" />
          </div>
        );

      case 'audience':
        return (
          <div className="space-y-6">
            <Input label="Expected Size" field="size" type="select" required options={Object.entries(SIZE_CONFIG).map(([k, v]) => ({ value: k, label: v.label }))} />
            <CheckboxGroup label="Target Audience" field="audience" options={OPTIONS.audience} />
            <SuggestionsPanel />
            <Input label="VIP Attendees" field="vips" type="textarea" placeholder="List specific high-profile individuals you're targeting..." />
            <Input label="Speakers / Presenters" field="speakers" type="textarea" placeholder="Who do you want to present or lead sessions?" />
          </div>
        );

      case 'logistics':
        return (
          <div className="space-y-6">
            <Input label="Event Date" field="date" type="date" required />
            {data.date && <CalendarWarnings />}
            <Input label="Duration" field="duration" type="select" required options={DURATION_OPTIONS} />
            <Input label="Format" field="format" type="select" required options={OPTIONS.format} />
            <Input label="Venue Type" field="venue" type="select" required options={OPTIONS.venue} />
            <Input 
              label="Location" 
              field="region" 
              type="select" 
              required 
              options={Object.entries(REGIONS).map(([k, v]) => ({ value: k, label: v.name }))} 
            />
            <CheckboxGroup label="Spaces Needed" field="spaces" options={OPTIONS.spaces} />
            <SuggestionsPanel />
          </div>
        );

      case 'program':
        return (
          <div className="space-y-6">
            <CheckboxGroup label="Program Elements" field="program" options={OPTIONS.program} />
            <CheckboxGroup label="Post-Event Activities" field="postEvent" options={OPTIONS.postEvent} />
            <SuggestionsPanel />
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <CheckboxGroup label="Food & Beverage" field="fnb" options={OPTIONS.fnb} />
            <CheckboxGroup label="Audio/Visual" field="av" options={OPTIONS.av} />
            <CheckboxGroup label="Production & Design" field="production" options={OPTIONS.production} />
            <CheckboxGroup label="Collateral & Materials" field="collateral" options={OPTIONS.collateral} />
            <CheckboxGroup label="Marketing & Promotion" field="marketing" options={OPTIONS.marketing} />
            <SuggestionsPanel />
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <TeamMembers />
            <Input label="Funding Sources" field="funding" type="textarea" placeholder="Where is the budget coming from?" />
            <Input label="Additional Notes" field="notes" type="textarea" placeholder="Anything else to remember?" />

            {/* All Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-400 mb-4">💡 Suggestions to Consider</h3>
                <ul className="space-y-3">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-amber-200/80 text-sm flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      {s.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget Summary */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💰 Budget Estimate</h3>
              <div className="text-3xl font-bold text-emerald-400 mb-4">
                {fmt(budget.total.min)} – {fmt(budget.total.max)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-zinc-400">Venue: <span className="text-white">{fmt(budget.costs.venue.min)}-{fmt(budget.costs.venue.max)}</span></div>
                <div className="text-zinc-400">F&B: <span className="text-white">{fmt(budget.costs.fnb)}</span></div>
                <div className="text-zinc-400">AV: <span className="text-white">{fmt(budget.costs.av)}</span></div>
                <div className="text-zinc-400">Production: <span className="text-white">{fmt(budget.costs.production)}</span></div>
                <div className="text-zinc-400">Collateral: <span className="text-white">{fmt(budget.costs.collateral)}</span></div>
                <div className="text-zinc-400">Marketing: <span className="text-white">{fmt(budget.costs.marketing)}</span></div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-700 text-sm text-zinc-400">
                + 10% staffing + 15% contingency included
              </div>
            </div>

            {/* Risks */}
            {risks.length > 0 && (
              <div className="bg-zinc-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">⚠️ Risk Alerts</h3>
                {risks.map((risk, i) => (
                  <div key={i} className={`p-3 rounded-lg mb-2 ${risk.level === 'high' ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
                    {risk.message}
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Preview */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">📅 Planning Timeline</h3>
                <button
                  onClick={handleExportCalendar}
                  className="text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Export to Calendar →
                </button>
              </div>
              <div className="space-y-2">
                {timeline.slice(0, 5).map((m, i) => (
                  <div key={i} className={`flex items-center gap-3 ${m.isCurrent ? 'text-emerald-400' : m.isPast ? 'text-zinc-500' : 'text-zinc-300'}`}>
                    <span className="text-sm w-24">{m.label}</span>
                    <span className={`w-2 h-2 rounded-full ${m.isCurrent ? 'bg-emerald-400' : m.isPast ? 'bg-zinc-600' : 'bg-zinc-500'}`} />
                    <span className="text-sm">{m.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-zinc-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📄 Generate Documents</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(DOCUMENTS).map(([key, doc]) => (
                  <button
                    key={key}
                    onClick={() => setActiveDoc(key)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white p-4 rounded-lg text-center transition-all"
                  >
                    <div className="text-2xl mb-2">{doc.icon}</div>
                    <div className="text-sm">{doc.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hidden file input for import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">🌱 SeedAI Event Planner</h1>
              <p className="text-zinc-400 text-sm">Professional event planning for policy professionals</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium"
              >
                Templates
              </button>
              <button
                onClick={() => setShowShareMenu(true)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
              >
                Share / Export
              </button>
              <button
                onClick={() => {
                  if (confirm('Clear all data and start over?')) {
                    localStorage.removeItem('seedai-planner-v7');
                    setData({
                      name: '', type: '', size: '', duration: '', date: '', format: '', venue: '', region: 'dc-metro',
                      description: '', objectives: '', audience: [], vips: '', speakers: '',
                      program: [], spaces: [], fnb: [], av: [], production: [], collateral: [], marketing: [], postEvent: [],
                      team: [{ name: '', role: '' }], notes: '', funding: ''
                    });
                    setCurrentPhase(0);
                  }
                }}
                className="text-zinc-500 hover:text-white text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <div className="bg-zinc-900/50 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {PHASES.map((phase, i) => (
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  i === currentPhase
                    ? 'bg-emerald-600 text-white'
                    : phaseComplete[phase.id]
                    ? 'bg-zinc-700 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                <span>{phase.icon}</span>
                <span className="text-sm font-medium">{phase.name}</span>
                {phaseComplete[phase.id] && i !== currentPhase && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(completedPhases / PHASES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Phase Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{PHASES[currentPhase].icon}</span>
            <div>
              <p className="text-zinc-500 text-sm">Phase {currentPhase + 1} of {PHASES.length}</p>
              <h2 className="text-2xl font-bold text-white">{PHASES[currentPhase].title}</h2>
            </div>
          </div>
          <p className="text-zinc-400 ml-12">{PHASES[currentPhase].description}</p>
        </div>

        {/* Phase Content */}
        <div className="bg-zinc-900/50 rounded-xl p-6 mb-8">
          {renderPhaseContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
            disabled={currentPhase === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentPhase === 0
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-700 text-white hover:bg-zinc-600'
            }`}
          >
            ← Previous
          </button>

          {currentPhase < PHASES.length - 1 ? (
            <button
              onClick={() => setCurrentPhase(currentPhase + 1)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition-all"
            >
              Continue →
            </button>
          ) : (
            <div className="text-emerald-400 flex items-center gap-2">
              ✓ Plan Complete — Generate your documents above
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <DocumentModal />
      <ShareMenu />
      <TemplateModal />
    </div>
  );
}
