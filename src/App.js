import React, { useState, useEffect } from 'react';
import { Share2, Mail, Download, Users, MessageSquare, HelpCircle, Trophy, Volume2, VolumeX, Plus, X, Sparkles, Calculator, AlertTriangle, Save, RotateCcw } from 'lucide-react';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        BUDGET CONFIGURATION                                 ║
// ║  Edit these values to update cost assumptions throughout the app.           ║
// ║  All costs are in USD.                                                      ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const BUDGET_CONFIG = {
  venue: {
    "Under 25 (intimate)": 1500, "25-50 (small)": 3000, "50-100 (medium)": 6000,
    "100-250 (large)": 12000, "250-500 (very large)": 25000, "500+ (major)": 50000,
  },
  foodAndBeverage: {
    "Coffee/Light Snacks": 15, "Breakfast": 25, "Lunch": 35,
    "Reception/Appetizers": 40, "Dinner": 75, "Special dietary options": 10, "Alcohol service": 25,
  },
  avTechnical: {
    "Basic (mics, projector)": 2000, "Professional staging": 5000, "Multiple screens": 3000,
    "Livestream": 4000, "Recording": 2000, "Lighting design": 3000,
    "Teleprompter": 1000, "Interpretation/translation": 3000, "Audience polling/Q&A tech": 500,
  },
  production: {
    "Photographer": { cost: 1500, perDay: true }, "Videographer": { cost: 3000, perDay: true },
    "Live graphics/lower thirds": { cost: 2000, perDay: false }, "Post-event highlight video": { cost: 2500, perDay: false },
    "Social media coverage": { cost: 1000, perDay: true }, "Graphic recording": { cost: 2000, perDay: true },
  },
  collateral: {
    "Event website": { cost: 1500, perPerson: false }, "Registration system": { cost: 500, perPerson: false },
    "Event app": { cost: 3000, perPerson: false }, "Printed programs": { cost: 3, perPerson: true },
    "Name badges": { cost: 2, perPerson: true }, "Signage/banners": { cost: 1500, perPerson: false },
    "Swag/giveaways": { cost: 20, perPerson: true }, "Branded materials": { cost: 1000, perPerson: false },
    "Sponsor materials": { cost: 500, perPerson: false }, "Post-event report": { cost: 1000, perPerson: false },
  },
  marketing: {
    "Email campaigns": 500, "Social media (organic)": 500, "Social media (paid)": 2000,
    "Press/media outreach": 1500, "Partner networks": 500, "Website/SEO": 1000,
    "Direct outreach": 500, "Influencer engagement": 1500,
  },
  staffing: { perDay: 2000 },
  contingency: { percentage: 0.15 },
  durationMultipliers: {
    "2-3 hours": 0.5, "Half day (4-5 hours)": 0.5, "Full day": 1,
    "1.5 days": 1.5, "2 days": 2, "Multi-day (3+)": 3,
  },
  attendanceDefaults: {
    "Under 25 (intimate)": 20, "25-50 (small)": 40, "50-100 (medium)": 75,
    "100-250 (large)": 175, "250-500 (very large)": 375, "500+ (major)": 600,
  },
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                     END BUDGET CONFIGURATION                                ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// STORAGE KEY
const STORAGE_KEY = 'seedai-event-planner-save';

// BUDGET CALCULATOR
const calculateBudget = (responses) => {
  const attendanceKey = responses.attendance || "50-100 (medium)";
  const attendance = BUDGET_CONFIG.attendanceDefaults[attendanceKey] || 75;
  const durationKey = responses.duration || "Full day";
  const days = BUDGET_CONFIG.durationMultipliers[durationKey] || 1;
  
  let costs = { venue: 0, foodBeverage: 0, avTechnical: 0, production: 0, collateral: 0, marketing: 0, staffing: 0 };
  
  costs.venue = (BUDGET_CONFIG.venue[attendanceKey] || 6000) * days;
  (responses.fnb_items || []).forEach(item => { costs.foodBeverage += (BUDGET_CONFIG.foodAndBeverage[item] || 0) * attendance * days; });
  (responses.av_needs || []).forEach(item => { costs.avTechnical += (BUDGET_CONFIG.avTechnical[item] || 0) * days; });
  (responses.production_needs || []).forEach(item => { const cfg = BUDGET_CONFIG.production[item]; if (cfg) costs.production += cfg.perDay ? cfg.cost * days : cfg.cost; });
  (responses.collateral_needs || []).forEach(item => { const cfg = BUDGET_CONFIG.collateral[item]; if (cfg) costs.collateral += cfg.perPerson ? cfg.cost * attendance : cfg.cost; });
  (responses.marketing_channels || []).forEach(item => { costs.marketing += BUDGET_CONFIG.marketing[item] || 0; });
  costs.staffing = BUDGET_CONFIG.staffing.perDay * days;
  
  const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
  const contingency = subtotal * BUDGET_CONFIG.contingency.percentage;
  return { ...costs, subtotal, contingency, total: subtotal + contingency, attendance, days };
};

// SOUND SYSTEM
class SoundSystem {
  constructor() { this.enabled = true; this.ctx = null; }
  init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
  play(type) {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    osc.type = 'square';
    const sounds = {
      select: () => { osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(880, now + 0.05); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.1); },
      navigate: () => { osc.frequency.setValueAtTime(330, now); gain.gain.setValueAtTime(0.08, now); osc.start(now); osc.stop(now + 0.05); },
      complete: () => { osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1); osc.frequency.setValueAtTime(784, now + 0.2); osc.frequency.setValueAtTime(1047, now + 0.3); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.4); },
      start: () => { osc.frequency.setValueAtTime(262, now); osc.frequency.setValueAtTime(330, now + 0.1); osc.frequency.setValueAtTime(392, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.3); },
      save: () => { osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.15); },
    };
    sounds[type]?.();
  }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}
const sound = new SoundSystem();

// PIXEL CHARACTERS
const getCharacterSvg = (id, size = 48) => {
  const scale = size / 48;
  const chars = {
    stuart: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="0" width="2" height="1" fill="#2d2d2d"/><rect x="7" y="0" width="1" height="1" fill="#2d2d2d"/><rect x="10" y="0" width="2" height="1" fill="#2d2d2d"/>
      <rect x="3" y="1" width="10" height="3" fill="#3d3d3d"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/>
      <rect x="3" y="5" width="4" height="3" fill="#1a1a1a"/><rect x="9" y="5" width="4" height="3" fill="#1a1a1a"/>
      <rect x="7" y="5" width="2" height="1" fill="#1a1a1a"/><rect x="4" y="6" width="2" height="1" fill="#87CEEB"/><rect x="10" y="6" width="2" height="1" fill="#87CEEB"/>
      <rect x="5" y="8" width="6" height="2" fill="#9d8b7a"/><rect x="5" y="10" width="6" height="2" fill="#E8DCC8"/>
      <rect x="3" y="12" width="10" height="4" fill="#1a1a1a"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/>
      <rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/>
    </svg>),
    austin: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/>
      <rect x="4" y="5" width="3" height="2" fill="#CD853F"/><rect x="9" y="5" width="3" height="2" fill="#CD853F"/><rect x="7" y="5" width="2" height="1" fill="#CD853F"/>
      <rect x="5" y="5" width="1" height="1" fill="#DEB887"/><rect x="10" y="5" width="1" height="1" fill="#DEB887"/>
      <rect x="3" y="7" width="10" height="3" fill="#4A3728"/><rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/>
      <rect x="3" y="11" width="10" height="5" fill="#1e3a5f"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/>
      <rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/>
    </svg>),
    anna: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="0" width="4" height="3" fill="#6B4423"/><rect x="3" y="3" width="10" height="1" fill="#5C4033"/>
      <rect x="3" y="4" width="2" height="3" fill="#6B4423"/><rect x="11" y="4" width="2" height="3" fill="#6B4423"/>
      <rect x="5" y="4" width="6" height="6" fill="#F5D0B0"/><rect x="6" y="6" width="1" height="1" fill="#4A3728"/><rect x="9" y="6" width="1" height="1" fill="#4A3728"/>
      <rect x="3" y="6" width="1" height="1" fill="#FFD700"/><rect x="12" y="6" width="1" height="1" fill="#FFD700"/>
      <rect x="7" y="8" width="2" height="1" fill="#E8A090"/><rect x="3" y="11" width="10" height="5" fill="#E07B8B"/>
      <rect x="6" y="11" width="4" height="1" fill="#F5D0B0"/><rect x="4" y="16" width="8" height="2" fill="#2d3748"/>
      <rect x="4" y="18" width="3" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="3" height="2" fill="#1a1a1a"/>
    </svg>),
    josh: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="5" y="1" width="2" height="1" fill="#6B4423"/><rect x="9" y="1" width="2" height="1" fill="#6B4423"/>
      <rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/>
      <rect x="4" y="5" width="3" height="2" fill="#8B7355"/><rect x="9" y="5" width="3" height="2" fill="#8B7355"/><rect x="7" y="5" width="2" height="1" fill="#8B7355"/>
      <rect x="4" y="8" width="8" height="1" fill="#3d3d3d"/><rect x="7" y="9" width="2" height="1" fill="#D4A090"/>
      <rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/><rect x="3" y="11" width="10" height="5" fill="#6B7280"/>
      <rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/>
      <rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/>
    </svg>)
  };
  return chars[id] || null;
};

const PixelChar = ({ selected, onClick, id }) => {
  const names = { stuart: "Stuart", austin: "Austin", anna: "Anna", josh: "Josh" };
  const titles = { stuart: "The Visionary", austin: "The Strategist", anna: "The Coordinator", josh: "The Analyst" };
  return (
    <div onClick={onClick} className={`cursor-pointer transition-all ${selected ? 'scale-110' : 'hover:scale-105'}`}>
      <div className={`p-2 border-4 ${selected ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 bg-slate-800'}`}>{getCharacterSvg(id, 48)}</div>
      <div className={`text-center mt-1 ${selected ? 'text-yellow-400' : 'text-slate-400'}`}>
        <div className="text-xs font-bold">{names[id]}</div>
        <div className="text-xs opacity-75">{titles[id]}</div>
      </div>
    </div>
  );
};

const charNames = { stuart: "Stuart", austin: "Austin", anna: "Anna", josh: "Josh" };

// UI COMPONENTS
const Btn = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const v = { primary: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white", secondary: "bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200",
    success: "bg-green-600 hover:bg-green-500 border-green-400 text-white", warning: "bg-yellow-500 hover:bg-yellow-400 border-yellow-300 text-slate-900",
    danger: "bg-red-600 hover:bg-red-500 border-red-400 text-white" };
  return (<button onClick={(e) => { sound.play('navigate'); onClick?.(e); }} disabled={disabled}
    className={`px-3 py-2 font-mono font-bold uppercase text-xs border-4 transition-all disabled:opacity-50 active:translate-y-1 ${v[variant]} ${className}`}
    style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>{children}</button>);
};

const ProgressWithCharacter = ({ current, total, label, characterId }) => {
  const percentage = Math.round((current / total) * 100);
  const position = Math.min(percentage, 95);
  return (
    <div className="font-mono">
      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span>{percentage}%</span></div>
      <div className="relative">
        <div className="flex gap-1 h-6">{[...Array(10)].map((_, i) => (<div key={i} className={`flex-1 border-2 ${i < Math.round((current / total) * 10) ? 'bg-green-400 border-green-300' : 'bg-slate-800 border-slate-600'}`}/>))}</div>
        <div className="absolute top-1/2 transition-all duration-300 ease-out" style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}>{getCharacterSvg(characterId, 28)}</div>
      </div>
    </div>
  );
};

const Checkbox = ({ options, selected = [], onChange }) => (
  <div className="grid grid-cols-2 gap-1">
    {options.map(o => (
      <button key={o} onClick={() => { sound.play('select'); onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]); }}
        className={`p-2 text-xs text-left border-2 h-10 flex items-center ${selected.includes(o) ? 'border-yellow-400 bg-slate-700 text-yellow-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
        <span className="truncate">{selected.includes(o) ? '☑' : '☐'} {o}</span>
      </button>
    ))}
  </div>
);

// DATA
const programs = [
  { id: 'ai-across-america', name: 'AI Across America', icon: '🇺🇸' },
  { id: 'accelerate-science', name: 'Accelerate Science Now', icon: '🔬' },
  { id: 'ai-primers', name: 'AI Primers', icon: '📚' },
  { id: 'fysa', name: 'FYSA', icon: '📋' },
  { id: 'policy', name: 'Policy Engagement', icon: '🏛️' },
  { id: 'other', name: 'Other Initiative', icon: '✨' }
];

const phases = [
  { id: 1, name: "THE SPARK", icon: "💡", subtitle: "What's the big idea?", questions: [
    { id: "event_name", label: "What would you call this event?", type: "text", placeholder: "Working title..." },
    { id: "spark", label: "What's the spark? The problem or opportunity driving this?", type: "textarea", placeholder: "What made you think 'we need to do an event'?" },
    { id: "success_headline", label: "Imagine wild success. What's the headline the day after?", type: "textarea", placeholder: "Dream big!" },
    { id: "why_event", label: "Why is an event the right format?", type: "textarea", placeholder: "vs. a report, webinar, blog post, etc." },
    { id: "seedai_alignment", label: "How does this connect to SeedAI's mission?", type: "textarea", placeholder: "Try It, Prove It, Scale It..." }
  ]},
  { id: 2, name: "THE PEOPLE", icon: "👥", subtitle: "Who needs to be there?", questions: [
    { id: "target_audience", label: "Who is your target audience?", type: "checkbox", options: ["Policymakers", "Congressional Staffers", "Federal Agency Staff", "State/Local Officials", "Private Sector Executives", "SMB Owners/Leaders", "Researchers/Academics", "Students", "Nonprofit Leaders", "Media/Press", "General Public", "International Delegates"] },
    { id: "audience_detail", label: "Be more specific: Who MUST be there for success?", type: "textarea", placeholder: "e.g., 'Senate Commerce staffers working on AI legislation'" },
    { id: "attendance", label: "Expected attendance?", type: "select", options: Object.keys(BUDGET_CONFIG.attendanceDefaults) },
    { id: "partners", label: "Target partners or co-hosts?", type: "textarea", placeholder: "Organizations to collaborate with..." },
    { id: "vips", label: "Dream speakers or VIPs?", type: "textarea", placeholder: "Who would make this event amazing?" },
    { id: "registration_type", label: "How will people get access?", type: "select", options: ["Open registration", "Invitation only", "Application/curated", "Ticketed (paid)", "Hybrid approach"] }
  ]},
  { id: 3, name: "THE EXPERIENCE", icon: "🎯", subtitle: "What will people do?", questions: [
    { id: "event_type", label: "What type of event?", type: "select", options: ["Conference", "Workshop/Training", "Roundtable Discussion", "Summit", "Reception/Networking", "Briefing/Presentation", "Demo Day/Showcase", "Multi-format"] },
    { id: "duration", label: "How long?", type: "select", options: Object.keys(BUDGET_CONFIG.durationMultipliers) },
    { id: "format", label: "Format?", type: "select", options: ["In-person only", "Virtual only", "Hybrid (in-person + virtual)"] },
    { id: "anchor_moments", label: "2-3 'anchor moments' that will define this event?", type: "textarea", placeholder: "The highlights people will talk about..." },
    { id: "program_elements", label: "What program elements do you need?", type: "checkbox", options: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Workshops/trainings", "Demos/showcases", "Networking time", "Fireside chats", "Q&A sessions", "Poster sessions", "Awards/recognition", "Entertainment", "Meals/receptions"] },
    { id: "takeaway", label: "What should attendees walk away with?", type: "textarea", placeholder: "Knowledge, connections, inspiration, action items..." }
  ]},
  { id: 4, name: "THE DETAILS", icon: "📍", subtitle: "Where, when, and how?", questions: [
    { id: "target_date", label: "Target date or timeframe?", type: "text", placeholder: "Specific date or range..." },
    { id: "date_drivers", label: "What's driving the date?", type: "textarea", placeholder: "Legislative calendar, announcement timing, partner availability..." },
    { id: "location", label: "Where should this be held? (City/Region)", type: "text", placeholder: "Washington DC, Regional, etc..." },
    { id: "venue_type", label: "What type of venue?", type: "select", options: ["Conference center", "Hotel", "University/campus", "Government building", "Corporate office", "Museum/unique venue", "Outdoor space", "Not sure yet"] },
    { id: "space_needs", label: "What spaces do you need?", type: "checkbox", options: ["Main plenary room", "Breakout rooms", "Demo/exhibit area", "VIP/green room", "Registration area", "Networking lounge", "Press room", "Dining space", "Outdoor area", "Storage/staging"] },
    { id: "fnb_items", label: "Food & beverage needed?", type: "checkbox", options: Object.keys(BUDGET_CONFIG.foodAndBeverage) },
    { id: "logistics_needs", label: "Other logistics?", type: "checkbox", options: ["Parking coordination", "Transportation/shuttles", "Hotel room block", "Security/access control", "Coat check", "Accessibility accommodations", "WiFi (dedicated)", "Charging stations", "Childcare", "Translation services"] }
  ]},
  { id: 5, name: "PRODUCTION", icon: "🎬", subtitle: "Tech, content & collateral", questions: [
    { id: "av_needs", label: "AV & technical needs?", type: "checkbox", options: Object.keys(BUDGET_CONFIG.avTechnical) },
    { id: "production_needs", label: "Production services?", type: "checkbox", options: Object.keys(BUDGET_CONFIG.production) },
    { id: "collateral_needs", label: "Event collateral needed?", type: "checkbox", options: Object.keys(BUDGET_CONFIG.collateral) },
    { id: "marketing_channels", label: "Marketing channels?", type: "checkbox", options: Object.keys(BUDGET_CONFIG.marketing) },
    { id: "post_event", label: "Post-event plans?", type: "checkbox", options: ["Thank you emails", "Attendee survey", "Content repurposing", "Report/summary", "Follow-up convenings", "Media coverage tracking", "Impact assessment", "Lead nurturing"] }
  ]},
  { id: 6, name: "THE PLAN", icon: "🚀", subtitle: "Budget, team & timeline", questions: [
    { id: "budget_known", label: "Do you have a budget in mind?", type: "select", options: ["Yes, I have a specific budget", "I have a rough range", "No, I need help estimating"] },
    { id: "budget_range", label: "If known, what's your budget range?", type: "select", options: ["Under $10K", "$10-25K", "$25-50K", "$50-100K", "$100-250K", "$250K+", "TBD"] },
    { id: "funding_sources", label: "Funding sources?", type: "checkbox", options: ["Organizational budget", "Sponsorships", "Grants", "Registration fees", "Partner contributions", "In-kind support", "TBD", "Other"] },
    { id: "sponsor_targets", label: "Any target sponsors?", type: "textarea", placeholder: "Organizations that might fund or sponsor..." },
    { id: "milestones", label: "Key milestones?", type: "textarea", placeholder: "Venue confirmed, speakers locked, registration opens..." },
    { id: "risks", label: "What could go wrong? What are you worried about?", type: "textarea", placeholder: "Be honest! Early risk ID helps planning..." },
    { id: "success_metrics", label: "How will you measure success?", type: "textarea", placeholder: "Attendance goals, feedback scores, follow-up actions..." }
  ]}
];

// BUDGET DISPLAY
const BudgetEstimator = ({ responses }) => {
  const budget = calculateBudget(responses);
  const budgetMaxMap = { 'Under $10K': 10000, '$10-25K': 25000, '$25-50K': 50000, '$50-100K': 100000, '$100-250K': 250000, '$250K+': 500000 };
  const statedMax = budgetMaxMap[responses.budget_range];
  const overBudget = statedMax && budget.total > statedMax;
  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();
  const categories = [
    { key: 'venue', label: '🏛️ Venue', value: budget.venue },
    { key: 'foodBeverage', label: '🍽️ Food & Beverage', value: budget.foodBeverage },
    { key: 'avTechnical', label: '🎤 AV & Technical', value: budget.avTechnical },
    { key: 'production', label: '📸 Production', value: budget.production },
    { key: 'collateral', label: '📦 Collateral & Swag', value: budget.collateral },
    { key: 'marketing', label: '📣 Marketing', value: budget.marketing },
    { key: 'staffing', label: '👥 Staffing', value: budget.staffing },
  ].filter(c => c.value > 0);
  
  return (
    <div className="border-4 border-green-500 bg-slate-800 p-3 mb-3">
      <div className="flex items-center gap-2 text-green-400 text-sm mb-2"><Calculator size={16}/> BUDGET ESTIMATOR</div>
      <div className="text-xs text-slate-500 mb-3">Based on {budget.attendance} attendees × {budget.days} day(s)</div>
      {overBudget && (<div className="bg-red-900/50 border-2 border-red-500 p-2 mb-3 text-red-400 text-xs flex items-center gap-2"><AlertTriangle size={14}/> Estimate exceeds stated budget</div>)}
      <div className="space-y-2 mb-3">
        {categories.map(c => (<div key={c.key} className="flex justify-between text-xs"><span className="text-slate-400">{c.label}</span><span className="text-slate-200">{formatMoney(c.value)}</span></div>))}
        {categories.length > 0 && (<>
          <div className="border-t border-slate-600 pt-2 flex justify-between text-xs"><span className="text-slate-400">Subtotal</span><span className="text-slate-200">{formatMoney(budget.subtotal)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-400">Contingency ({BUDGET_CONFIG.contingency.percentage * 100}%)</span><span className="text-slate-200">{formatMoney(budget.contingency)}</span></div>
          <div className="border-t-2 border-green-500 pt-2 flex justify-between text-sm font-bold"><span className="text-green-400">ESTIMATED TOTAL</span><span className={overBudget ? 'text-red-400' : 'text-green-400'}>{formatMoney(budget.total)}</span></div>
        </>)}
        {categories.length === 0 && (<div className="text-slate-500 text-xs text-center py-2">Select options to see estimates</div>)}
      </div>
      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2">💡 Rough estimate. Actual costs vary.</div>
    </div>
  );
};

// MAIN APP
export default function App() {
  const [screen, setScreen] = useState('title');
  const [char, setChar] = useState(null);
  const [program, setProgram] = useState(null);
  const [phase, setPhase] = useState(0);
  const [responses, setResponses] = useState({});
  const [needsInput, setNeedsInput] = useState({});
  const [notes, setNotes] = useState({});
  const [team, setTeam] = useState([]);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [blink, setBlink] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [showNote, setShowNote] = useState(null);
  const [status, setStatus] = useState('');
  const [hasSave, setHasSave] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Check for saved data on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.responses && Object.keys(data.responses).length > 0) {
          setHasSave(true);
          setLastSaved(data.savedAt ? new Date(data.savedAt) : null);
        }
      }
    } catch (e) { console.log('No saved data'); }
  }, []);

  // Auto-save whenever state changes (debounced)
  useEffect(() => {
    if (screen === 'play' || screen === 'export') {
      const timer = setTimeout(() => {
        saveProgress(true); // silent save
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [responses, needsInput, notes, team, char, program, phase]);

  useEffect(() => { const i = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(i); }, []);

  const saveProgress = (silent = false) => {
    try {
      const data = { char, program, phase, responses, needsInput, notes, team, savedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date());
      if (!silent) {
        sound.play('save');
        setStatus('Progress saved!');
        setTimeout(() => setStatus(''), 2000);
      }
    } catch (e) { if (!silent) setStatus('Save failed'); }
  };

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setChar(data.char);
        setProgram(data.program);
        setPhase(data.phase || 0);
        setResponses(data.responses || {});
        setNeedsInput(data.needsInput || {});
        setNotes(data.notes || {});
        setTeam(data.team || []);
        sound.play('start');
        setScreen('play');
      }
    } catch (e) { console.log('Load failed'); }
  };

  const clearSave = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSave(false);
    setResponses({}); setNeedsInput({}); setNotes({}); setTeam([]);
    setChar(null); setProgram(null); setPhase(0);
  };

  const update = (id, val) => setResponses(p => ({ ...p, [id]: val }));
  const toggleInput = (id) => { sound.play('select'); setNeedsInput(p => ({ ...p, [id]: !p[id] })); };
  const addMember = () => { if (newMember.name) { sound.play('select'); setTeam([...team, { ...newMember, id: Date.now() }]); setNewMember({ name: '', role: '' }); }};
  const removeMember = (id) => { sound.play('navigate'); setTeam(team.filter(m => m.id !== id)); };

  const getProgress = (idx) => {
    const p = phases[idx];
    const done = p.questions.filter(q => {
      if (q.type === 'checkbox') return responses[q.id]?.length > 0;
      return responses[q.id]?.trim?.() || needsInput[q.id];
    }).length;
    return { done, total: p.questions.length };
  };
  
  const totalProgress = () => {
    let t = 0, d = 0;
    phases.forEach(p => p.questions.forEach(q => { 
      t++; 
      if (q.type === 'checkbox') { if (responses[q.id]?.length > 0 || needsInput[q.id]) d++; }
      else { if (responses[q.id]?.trim?.() || needsInput[q.id]) d++; }
    }));
    return { done: d, total: t };
  };

  const exportText = () => {
    const budget = calculateBudget(responses);
    const total = totalProgress();
    const isPartial = total.done < total.total;
    
    let t = `# EVENT PROPOSAL: ${responses.event_name || 'Untitled'}\n\n`;
    if (isPartial) t += `**⚠️ DRAFT — ${total.done}/${total.total} questions completed (${Math.round(total.done/total.total*100)}%)**\n\n`;
    t += `**Program:** ${programs.find(p => p.id === program)?.name || 'Not selected'}\n`;
    t += `**Event Owner:** ${charNames[char] || 'Not selected'}\n`;
    t += `**Date Created:** ${new Date().toLocaleDateString()}\n`;
    if (budget.total > 0) t += `**Estimated Budget:** $${Math.round(budget.total).toLocaleString()}\n`;
    t += '\n';
    
    if (team.length) { t += `## Team\n`; team.forEach(m => t += `- **${m.name}** — ${m.role || 'TBD'}\n`); t += '\n'; }
    
    const needsList = [];
    phases.forEach(p => {
      const phaseProgress = getProgress(p.id - 1);
      t += `## ${p.icon} ${p.name}`;
      if (phaseProgress.done < phaseProgress.total) t += ` *(${phaseProgress.done}/${phaseProgress.total})*`;
      t += '\n';
      
      p.questions.forEach(q => {
        const r = q.type === 'checkbox' ? responses[q.id]?.join(', ') : responses[q.id];
        if (r?.trim?.() || (q.type === 'checkbox' && r?.length)) { 
          t += `**${q.label}**\n${r}\n${notes[q.id] ? `> Note: ${notes[q.id]}\n` : ''}\n`; 
        } else if (needsInput[q.id]) { 
          t += `**${q.label}**\n⚠️ NEEDS TEAM INPUT\n${notes[q.id] ? `> Note: ${notes[q.id]}\n` : ''}\n`; 
          needsList.push({ phase: p.name, q: q.label, note: notes[q.id] }); 
        }
      });
    });
    
    if (budget.total > 0) {
      t += `## 💰 BUDGET ESTIMATE\n*Based on ${budget.attendance} attendees × ${budget.days} day(s)*\n\n`;
      t += `| Category | Estimate |\n|----------|----------|\n`;
      if (budget.venue > 0) t += `| Venue | $${Math.round(budget.venue).toLocaleString()} |\n`;
      if (budget.foodBeverage > 0) t += `| Food & Beverage | $${Math.round(budget.foodBeverage).toLocaleString()} |\n`;
      if (budget.avTechnical > 0) t += `| AV & Technical | $${Math.round(budget.avTechnical).toLocaleString()} |\n`;
      if (budget.production > 0) t += `| Production | $${Math.round(budget.production).toLocaleString()} |\n`;
      if (budget.collateral > 0) t += `| Collateral | $${Math.round(budget.collateral).toLocaleString()} |\n`;
      if (budget.marketing > 0) t += `| Marketing | $${Math.round(budget.marketing).toLocaleString()} |\n`;
      if (budget.staffing > 0) t += `| Staffing | $${Math.round(budget.staffing).toLocaleString()} |\n`;
      t += `| Contingency (${BUDGET_CONFIG.contingency.percentage * 100}%) | $${Math.round(budget.contingency).toLocaleString()} |\n`;
      t += `| **TOTAL** | **$${Math.round(budget.total).toLocaleString()}** |\n\n`;
    }
    
    if (needsList.length) { 
      t += `---\n\n## ⚠️ NEEDS TEAM INPUT (${needsList.length} items)\n`; 
      needsList.forEach(i => t += `- [${i.phase}] ${i.q}${i.note ? ` — *${i.note}*` : ''}\n`); 
    }
    t += `\n---\n\n*Paste into Claude to generate: Event Planning Doc (Word), Detailed Budget (Excel), Timeline*`;
    return t;
  };

  const copy = async () => { await navigator.clipboard.writeText(exportText()); sound.play('complete'); setStatus('Copied!'); setTimeout(() => setStatus(''), 2000); };
  const email = () => { window.open(`mailto:operations@seedai.org?subject=${encodeURIComponent(`${responses.event_name || 'New Event'} - Event Proposal`)}&body=${encodeURIComponent(exportText())}`); };
  const download = () => {
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/plain' }));
    a.download = `${responses.event_name || 'event'}-proposal.md`; 
    a.click(); sound.play('complete');
  };

  // TITLE SCREEN
  if (screen === 'title') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
        {soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}
      </button>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-400 mb-2" style={{ textShadow: '4px 4px 0 #1e3a8a' }}>SeedAI</h1>
        <h2 className="text-2xl text-yellow-400 mb-4" style={{ textShadow: '2px 2px 0 #92400e' }}>EVENT PLANNER</h2>
        <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto">From spark to comprehensive proposal—one phase at a time</p>
        <div className={`text-white text-sm mb-6 ${blink ? '' : 'opacity-0'}`}>PRESS NEW EVENT TO START</div>
        <div className="flex flex-col gap-2 items-center">
          <Btn onClick={() => { sound.play('start'); clearSave(); setScreen('character'); }} variant="warning">NEW EVENT</Btn>
          {hasSave && (
            <Btn onClick={loadProgress} variant="success">
              <RotateCcw size={12} className="inline mr-1"/> CONTINUE
              {lastSaved && <span className="opacity-75 ml-1 text-xs normal-case">({lastSaved.toLocaleDateString()})</span>}
            </Btn>
          )}
        </div>
      </div>
    </div>
  );

  // CHARACTER SELECT
  if (screen === 'character') return (
    <div className="min-h-screen bg-slate-900 p-4 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">
        {soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}
      </button>
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl text-yellow-400 mb-1">WHO'S LEADING THIS?</h2>
        <p className="text-slate-400 text-xs mb-4">Select yourself as Event Owner</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">
          {['stuart', 'austin', 'anna', 'josh'].map(c => (<PixelChar key={c} id={c} selected={char === c} onClick={() => { sound.play('select'); setChar(c); }}/>))}
        </div>
        <div className="flex justify-center gap-3">
          <Btn onClick={() => setScreen('title')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('program')} disabled={!char} variant="success">CONTINUE →</Btn>
        </div>
      </div>
    </div>
  );

  // PROGRAM SELECT
  if (screen === 'program') return (
    <div className="min-h-screen bg-slate-900 p-4 font-mono">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl text-yellow-400 mb-4 text-center">SELECT PROGRAM</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {programs.map(p => (
            <button key={p.id} onClick={() => { sound.play('select'); setProgram(p.id); }}
              className={`p-3 border-4 text-left text-xs ${program === p.id ? 'border-yellow-400 bg-slate-700 text-yellow-400' : 'border-slate-600 bg-slate-800 text-slate-300'}`}>
              <span className="text-lg mr-2">{p.icon}</span>{p.name}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-3">
          <Btn onClick={() => setScreen('character')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('play')} disabled={!program} variant="success">START →</Btn>
        </div>
      </div>
    </div>
  );

  // EXPORT SCREEN
  if (screen === 'export') {
    const total = totalProgress();
    const needsCount = Object.keys(needsInput).filter(k => needsInput[k] && !responses[k]?.length && !responses[k]?.trim?.()).length;
    const isPartial = total.done < total.total;
    
    return (
      <div className="min-h-screen bg-slate-900 p-4 font-mono overflow-auto">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{isPartial ? '📝' : '🎉'}</div>
            <h2 className="text-xl text-yellow-400">{isPartial ? 'DRAFT PROPOSAL' : 'PROPOSAL READY!'}</h2>
            {isPartial && <p className="text-slate-400 text-xs mt-1">{total.done}/{total.total} questions completed</p>}
          </div>
          
          <BudgetEstimator responses={responses} />
          
          {needsCount > 0 && (
            <div className="border-4 border-yellow-500 bg-yellow-900/30 p-3 mb-3 text-yellow-400 text-xs">
              <Users size={14} className="inline mr-2"/>{needsCount} items flagged for team input
            </div>
          )}
          
          <div className="border-4 border-blue-500 bg-slate-800 p-3 mb-3">
            <div className="text-blue-400 text-sm mb-2">SHARE YOUR PROPOSAL</div>
            <div className="grid grid-cols-3 gap-2">
              <Btn onClick={copy} variant="primary" className="w-full text-xs"><Share2 size={12} className="inline mr-1"/>COPY</Btn>
              <Btn onClick={email} variant="warning" className="w-full text-xs"><Mail size={12} className="inline mr-1"/>EMAIL</Btn>
              <Btn onClick={download} variant="success" className="w-full text-xs"><Download size={12} className="inline mr-1"/>SAVE</Btn>
            </div>
            {status && <div className="text-center text-green-400 text-xs mt-2">{status}</div>}
          </div>
          
          <div className="border-4 border-slate-600 bg-slate-800 mb-3 max-h-48 overflow-y-auto p-3">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">{exportText()}</pre>
          </div>
          
          <div className="flex justify-center gap-3">
            <Btn onClick={() => setScreen('play')} variant="secondary">← EDIT</Btn>
            <Btn onClick={() => { clearSave(); setScreen('title'); }} variant="danger">NEW</Btn>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PLANNING SCREEN
  const p = phases[phase];
  const prog = getProgress(phase);
  const total = totalProgress();

  return (
    <div className="min-h-screen bg-slate-900 font-mono">
      <div className="bg-slate-800 border-b-4 border-slate-700 p-2">
        <div className="max-w-lg mx-auto flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span>{programs.find(x => x.id === program)?.icon}</span>
            <div>
              <div className="text-blue-400 text-xs">EVENT PLANNER</div>
              <div className="text-slate-500 text-xs">{charNames[char]}</div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {lastSaved && <span className="text-slate-600 text-xs">Auto-saved</span>}
            <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="text-slate-500 hover:text-slate-300 p-1">
              {soundOn ? <Volume2 size={14}/> : <VolumeX size={14}/>}
            </button>
            <Btn onClick={() => saveProgress()} variant="secondary" className="text-xs py-1"><Save size={10} className="inline mr-1"/>SAVE</Btn>
            <Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success" className="text-xs py-1">
              <Sparkles size={10} className="inline mr-1"/>EXPORT
            </Btn>
          </div>
        </div>
        <div className="max-w-lg mx-auto">
          <ProgressWithCharacter current={total.done} total={total.total} label="PROGRESS" characterId={char} />
        </div>
      </div>

      <div className="max-w-lg mx-auto p-3">
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {phases.map((x, i) => {
            const pr = getProgress(i);
            return (
              <button key={x.id} onClick={() => { sound.play('navigate'); setPhase(i); }}
                className={`px-2 py-1 border-4 text-xs whitespace-nowrap ${
                  i === phase ? 'border-yellow-400 bg-slate-700 text-yellow-400' 
                  : pr.done === pr.total && pr.total > 0 ? 'border-green-500 bg-slate-800 text-green-400' 
                  : 'border-slate-600 bg-slate-800 text-slate-400'}`}>
                {x.icon}
              </button>
            );
          })}
        </div>

        <div className="border-4 border-blue-500 bg-slate-800 mb-3">
          <div className="bg-blue-600 p-3 border-b-4 border-blue-500">
            <div className="text-xs text-blue-200">PHASE {p.id} OF {phases.length}</div>
            <h2 className="text-lg text-white">{p.icon} {p.name}</h2>
            <div className="text-xs text-blue-200">{p.subtitle}</div>
          </div>

          {phase === 0 && (
            <div className="p-3 border-b-4 border-slate-700">
              <div className="text-yellow-400 text-xs mb-2 flex items-center gap-2"><Users size={12}/> EVENT TEAM</div>
              <div className="text-slate-500 text-xs mb-2">Owner: <span className="text-yellow-400">{charNames[char]}</span></div>
              {team.length > 0 && (
                <div className="space-y-1 mb-2">
                  {team.map(m => (
                    <div key={m.id} className="flex justify-between items-center bg-slate-900 p-2 border-2 border-slate-700 text-xs text-slate-300">
                      {m.name} {m.role && `— ${m.role}`}
                      <button onClick={() => removeMember(m.id)} className="text-red-400"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="flex-1 p-2 bg-slate-900 border-2 border-slate-600 text-slate-200 text-xs" placeholder="Name"/>
                <input value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })}
                  className="flex-1 p-2 bg-slate-900 border-2 border-slate-600 text-slate-200 text-xs" placeholder="Role"/>
                <button onClick={addMember} className="px-3 bg-green-600 border-2 border-green-400 text-white"><Plus size={12}/></button>
              </div>
            </div>
          )}

          {phase === phases.length - 1 && (<div className="p-3 border-b-4 border-slate-700"><BudgetEstimator responses={responses} /></div>)}

          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {p.questions.map((q, i) => (
              <div key={q.id} className={needsInput[q.id] && !(q.type === 'checkbox' ? responses[q.id]?.length : responses[q.id]?.trim?.()) ? 'border-l-4 border-yellow-400 pl-2' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <label className="text-yellow-400 text-xs flex-1">{i+1}. {q.label}</label>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => setShowNote(showNote === q.id ? null : q.id)} className={notes[q.id] ? 'text-blue-400' : 'text-slate-600'} title="Add note"><MessageSquare size={12}/></button>
                    <button onClick={() => toggleInput(q.id)} className={needsInput[q.id] ? 'text-yellow-400' : 'text-slate-600'} title="I don't know yet"><HelpCircle size={12}/></button>
                  </div>
                </div>
                {showNote === q.id && (<input value={notes[q.id] || ''} onChange={e => setNotes({ ...notes, [q.id]: e.target.value })}
                  className="w-full p-2 mb-1 bg-slate-700 border-2 border-slate-600 text-slate-300 text-xs" placeholder="Note for team..."/>)}
                {q.type === 'checkbox' ? (<Checkbox options={q.options} selected={responses[q.id] || []} onChange={(val) => update(q.id, val)} />)
                  : q.type === 'textarea' ? (<textarea value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} rows={2}
                    className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none resize-none" placeholder={q.placeholder}/>)
                  : q.type === 'select' ? (<select value={responses[q.id] || ''} onChange={e => { sound.play('select'); update(q.id, e.target.value); }}
                    className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none">
                    <option value="">-- SELECT --</option>{q.options.map(o => <option key={o} value={o}>{o}</option>)}</select>)
                  : (<input type="text" value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)}
                    className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none" placeholder={q.placeholder}/>)}
                {needsInput[q.id] && !(q.type === 'checkbox' ? responses[q.id]?.length : responses[q.id]?.trim?.()) && (
                  <div className="text-yellow-400 text-xs mt-1"><HelpCircle size={10} className="inline"/> Flagged for team input</div>
                )}
              </div>
            ))}
          </div>

          <div className="border-t-4 border-slate-700 p-3 flex justify-between">
            <Btn onClick={() => setPhase(Math.max(0, phase - 1))} disabled={phase === 0} variant="secondary">← PREV</Btn>
            <span className="text-slate-500 text-xs self-center">{prog.done}/{prog.total}</span>
            {phase < phases.length - 1 
              ? (<Btn onClick={() => setPhase(phase + 1)} variant="primary">NEXT →</Btn>)
              : (<Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success"><Trophy size={14} className="inline mr-1"/>FINISH</Btn>)}
          </div>
        </div>
      </div>
    </div>
  );
}
