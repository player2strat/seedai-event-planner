import React, { useState, useEffect } from 'react';
import { Share2, Mail, Download, Users, MessageSquare, HelpCircle, Trophy, Volume2, VolumeX, Plus, X, Sparkles, Calculator, AlertTriangle, Save, RotateCcw, Zap, Loader, Calendar, TrendingUp, Clock, CheckCircle, Lightbulb } from 'lucide-react';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        BUDGET CONFIGURATION                                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const BUDGET_CONFIG = {
  locations: {
    "Washington DC": { multiplier: 1.0, label: "Washington DC", peakMonths: [3, 4, 5, 9, 10] },
    "New York City": { multiplier: 1.35, label: "New York City", peakMonths: [5, 6, 9, 10, 12] },
    "San Francisco": { multiplier: 1.4, label: "San Francisco / Bay Area", peakMonths: [5, 6, 9, 10] },
    "Los Angeles": { multiplier: 1.2, label: "Los Angeles", peakMonths: [1, 2, 3, 10, 11] },
    "Chicago": { multiplier: 0.95, label: "Chicago", peakMonths: [6, 7, 8, 9] },
    "Boston": { multiplier: 1.15, label: "Boston", peakMonths: [5, 6, 9, 10] },
    "Seattle": { multiplier: 1.1, label: "Seattle", peakMonths: [6, 7, 8, 9] },
    "Austin": { multiplier: 0.85, label: "Austin", peakMonths: [3, 10, 11] },
    "Denver": { multiplier: 0.9, label: "Denver", peakMonths: [6, 7, 8, 9] },
    "Atlanta": { multiplier: 0.85, label: "Atlanta", peakMonths: [3, 4, 9, 10] },
    "Miami": { multiplier: 1.0, label: "Miami", peakMonths: [1, 2, 3, 12] },
    "Philadelphia": { multiplier: 0.95, label: "Philadelphia", peakMonths: [5, 6, 9, 10] },
    "Phoenix": { multiplier: 0.8, label: "Phoenix", peakMonths: [1, 2, 3, 11, 12] },
    "Minneapolis": { multiplier: 0.85, label: "Minneapolis", peakMonths: [6, 7, 8] },
    "Other Major City": { multiplier: 0.9, label: "Other Major US City", peakMonths: [] },
    "Regional/Rural": { multiplier: 0.7, label: "Regional / Smaller City", peakMonths: [] },
  },
  venueTypes: {
    "Conference center": { perPerson: 75, minSpend: 2000, description: "Professional event space", leadTime: 12 },
    "Hotel": { perPerson: 85, minSpend: 3000, description: "Hotel ballroom/meeting rooms", leadTime: 8 },
    "University/campus": { perPerson: 35, minSpend: 500, description: "Academic venue", leadTime: 16 },
    "Government building": { perPerson: 0, minSpend: 0, description: "Often free for appropriate events", leadTime: 20 },
    "Corporate office": { perPerson: 25, minSpend: 0, description: "Partner-hosted", leadTime: 4 },
    "Museum/unique venue": { perPerson: 100, minSpend: 5000, description: "Premium unique spaces", leadTime: 16 },
    "Outdoor space": { perPerson: 40, minSpend: 1500, description: "Parks, plazas", leadTime: 12 },
    "Not sure yet": { perPerson: 75, minSpend: 2000, description: "Using conference center estimate", leadTime: 12 },
  },
  foodAndBeverage: {
    "Coffee/Light Snacks": 18, "Breakfast": 32, "Lunch": 45,
    "Reception/Appetizers": 55, "Dinner": 95, "Special dietary options": 12, "Alcohol service": 35,
  },
  avTechnical: {
    "Basic (mics, projector)": 2500, "Professional staging": 6000, "Multiple screens": 3500,
    "Livestream": 5000, "Recording": 2500, "Lighting design": 4000,
    "Teleprompter": 1200, "Interpretation/translation": 4000, "Audience polling/Q&A tech": 600,
  },
  production: {
    "Photographer": { cost: 2000, perDay: true }, "Videographer": { cost: 3500, perDay: true },
    "Live graphics/lower thirds": { cost: 2500, perDay: false }, "Post-event highlight video": { cost: 3500, perDay: false },
    "Social media coverage": { cost: 1200, perDay: true }, "Graphic recording": { cost: 2500, perDay: true },
  },
  collateral: {
    "Event website": { cost: 2000, perPerson: false }, "Registration system": { cost: 600, perPerson: false },
    "Event app": { cost: 4000, perPerson: false }, "Printed programs": { cost: 4, perPerson: true },
    "Name badges": { cost: 3, perPerson: true }, "Signage/banners": { cost: 2000, perPerson: false },
    "Swag/giveaways": { cost: 25, perPerson: true }, "Branded materials": { cost: 1200, perPerson: false },
    "Sponsor materials": { cost: 600, perPerson: false }, "Post-event report": { cost: 1500, perPerson: false },
  },
  marketing: {
    "Email campaigns": 600, "Social media (organic)": 600, "Social media (paid)": 2500,
    "Press/media outreach": 2000, "Partner networks": 600, "Website/SEO": 1200,
    "Direct outreach": 600, "Influencer engagement": 2000,
  },
  staffing: { perDay: 2500 },
  contingency: { percentage: 0.15 },
  scenarioMultipliers: { budget: 0.7, standard: 1.0, premium: 1.5 },
  durationMultipliers: { "2-3 hours": 0.5, "Half day (4-5 hours)": 0.5, "Full day": 1, "1.5 days": 1.5, "2 days": 2, "Multi-day (3+)": 3 },
  attendanceDefaults: { "Under 25 (intimate)": 20, "25-50 (small)": 40, "50-100 (medium)": 75, "100-250 (large)": 175, "250-500 (very large)": 375, "500+ (major)": 600 },
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        SMART DEFAULTS BY EVENT TYPE                         ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const SMART_DEFAULTS = {
  "Conference": {
    duration: "Full day",
    attendance: "100-250 (large)",
    venue_type: "Conference center",
    program_elements: ["Keynote speeches", "Panel discussions", "Networking time", "Q&A sessions", "Meals/receptions"],
    fnb_items: ["Coffee/Light Snacks", "Lunch", "Reception/Appetizers"],
    av_needs: ["Basic (mics, projector)", "Multiple screens", "Recording"],
    production_needs: ["Photographer", "Videographer"],
    collateral_needs: ["Event website", "Registration system", "Name badges", "Printed programs"],
  },
  "Workshop/Training": {
    duration: "Half day (4-5 hours)",
    attendance: "25-50 (small)",
    venue_type: "Conference center",
    program_elements: ["Workshops/trainings", "Breakout sessions", "Q&A sessions"],
    fnb_items: ["Coffee/Light Snacks", "Lunch"],
    av_needs: ["Basic (mics, projector)"],
    production_needs: [],
    collateral_needs: ["Registration system", "Name badges", "Printed programs"],
  },
  "Roundtable Discussion": {
    duration: "2-3 hours",
    attendance: "Under 25 (intimate)",
    venue_type: "Corporate office",
    program_elements: ["Panel discussions", "Networking time", "Q&A sessions"],
    fnb_items: ["Coffee/Light Snacks"],
    av_needs: ["Basic (mics, projector)"],
    production_needs: [],
    collateral_needs: ["Name badges"],
  },
  "Summit": {
    duration: "Full day",
    attendance: "100-250 (large)",
    venue_type: "Hotel",
    program_elements: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Networking time", "Meals/receptions"],
    fnb_items: ["Coffee/Light Snacks", "Breakfast", "Lunch", "Reception/Appetizers"],
    av_needs: ["Basic (mics, projector)", "Professional staging", "Multiple screens", "Recording"],
    production_needs: ["Photographer", "Videographer", "Social media coverage"],
    collateral_needs: ["Event website", "Registration system", "Name badges", "Signage/banners", "Swag/giveaways"],
  },
  "Reception/Networking": {
    duration: "2-3 hours",
    attendance: "50-100 (medium)",
    venue_type: "Museum/unique venue",
    program_elements: ["Networking time", "Entertainment", "Meals/receptions"],
    fnb_items: ["Reception/Appetizers", "Alcohol service"],
    av_needs: ["Basic (mics, projector)"],
    production_needs: ["Photographer"],
    collateral_needs: ["Name badges", "Signage/banners"],
  },
  "Briefing/Presentation": {
    duration: "2-3 hours",
    attendance: "25-50 (small)",
    venue_type: "Corporate office",
    program_elements: ["Keynote speeches", "Q&A sessions"],
    fnb_items: ["Coffee/Light Snacks"],
    av_needs: ["Basic (mics, projector)"],
    production_needs: [],
    collateral_needs: ["Printed programs"],
  },
  "Demo Day/Showcase": {
    duration: "Half day (4-5 hours)",
    attendance: "50-100 (medium)",
    venue_type: "Conference center",
    program_elements: ["Demos/showcases", "Networking time", "Q&A sessions"],
    fnb_items: ["Coffee/Light Snacks", "Lunch"],
    av_needs: ["Basic (mics, projector)", "Multiple screens"],
    production_needs: ["Photographer", "Videographer"],
    collateral_needs: ["Event website", "Registration system", "Name badges", "Signage/banners"],
  },
  "Multi-format": {
    duration: "Full day",
    attendance: "100-250 (large)",
    venue_type: "Conference center",
    program_elements: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Workshops/trainings", "Networking time"],
    fnb_items: ["Coffee/Light Snacks", "Lunch"],
    av_needs: ["Basic (mics, projector)", "Multiple screens"],
    production_needs: ["Photographer"],
    collateral_needs: ["Event website", "Registration system", "Name badges", "Printed programs"],
  },
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        TIMELINE GENERATOR                                   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const generateTimeline = (eventDate, responses) => {
  if (!eventDate) return [];
  
  const date = new Date(eventDate);
  if (isNaN(date.getTime())) return [];
  
  const today = new Date();
  const weeksOut = Math.floor((date - today) / (7 * 24 * 60 * 60 * 1000));
  const venueLeadTime = BUDGET_CONFIG.venueTypes[responses.venue_type]?.leadTime || 12;
  
  const milestones = [
    { weeks: Math.max(venueLeadTime, 16), task: "🏛️ Venue contract signed", category: "venue" },
    { weeks: 14, task: "🎤 Keynote speakers confirmed", category: "content" },
    { weeks: 12, task: "📋 Program outline finalized", category: "content" },
    { weeks: 10, task: "🎯 Marketing campaign launched", category: "marketing" },
    { weeks: 10, task: "🌐 Event website live", category: "marketing" },
    { weeks: 8, task: "📝 Registration opens", category: "registration" },
    { weeks: 8, task: "🍽️ Catering menu selected", category: "logistics" },
    { weeks: 6, task: "🎬 AV requirements confirmed", category: "production" },
    { weeks: 6, task: "👥 All speakers confirmed", category: "content" },
    { weeks: 4, task: "📦 Collateral to print", category: "logistics" },
    { weeks: 4, task: "📧 Reminder emails sent", category: "marketing" },
    { weeks: 2, task: "🔢 Final headcount to venue", category: "logistics" },
    { weeks: 2, task: "📑 Run of show drafted", category: "content" },
    { weeks: 1, task: "✅ Final walkthrough", category: "logistics" },
    { weeks: 1, task: "📋 Run of show finalized", category: "content" },
    { weeks: 0, task: "🎉 EVENT DAY", category: "event" },
  ];
  
  return milestones
    .filter(m => m.weeks <= weeksOut + 2)
    .map(m => {
      const milestoneDate = new Date(date);
      milestoneDate.setDate(milestoneDate.getDate() - (m.weeks * 7));
      const isPast = milestoneDate < today;
      const isUrgent = !isPast && milestoneDate < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      return { ...m, date: milestoneDate, isPast, isUrgent, weeksOut: m.weeks };
    })
    .sort((a, b) => a.date - b.date);
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        RISK FLAGS ANALYZER                                  ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const analyzeRisks = (responses) => {
  const risks = [];
  const attendance = BUDGET_CONFIG.attendanceDefaults[responses.attendance] || 75;
  const eventDate = responses.target_date ? new Date(responses.target_date) : null;
  const today = new Date();
  const weeksOut = eventDate ? Math.floor((eventDate - today) / (7 * 24 * 60 * 60 * 1000)) : null;
  const venueLeadTime = BUDGET_CONFIG.venueTypes[responses.venue_type]?.leadTime || 12;
  const location = BUDGET_CONFIG.locations[responses.location];
  
  // Timeline risks
  if (weeksOut !== null && weeksOut < venueLeadTime) {
    risks.push({ severity: "high", icon: "⏰", message: `${responses.venue_type || 'This venue type'} typically requires ${venueLeadTime}+ weeks lead time. You have ${weeksOut} weeks.`, category: "timeline" });
  } else if (weeksOut !== null && weeksOut < 8) {
    risks.push({ severity: "high", icon: "⏰", message: `Only ${weeksOut} weeks until event. Expedited planning may increase costs 15-25%.`, category: "timeline" });
  } else if (weeksOut !== null && weeksOut < 12) {
    risks.push({ severity: "medium", icon: "⏰", message: `${weeksOut} weeks is tight for an event of this size. Prioritize venue and speakers immediately.`, category: "timeline" });
  }
  
  // Location/date risks
  if (eventDate && location?.peakMonths?.includes(eventDate.getMonth() + 1)) {
    risks.push({ severity: "medium", icon: "📅", message: `${location.label} is in peak season in ${eventDate.toLocaleString('default', { month: 'long' })}. Expect 20-30% higher venue/hotel costs.`, category: "cost" });
  }
  
  // DC-specific risks
  if (responses.location === "Washington DC") {
    if (eventDate && [3, 4].includes(eventDate.getMonth() + 1)) {
      risks.push({ severity: "medium", icon: "🌸", message: "Cherry blossom season (late March-April) means premium hotel rates and limited availability.", category: "cost" });
    }
    if (attendance > 100 && responses.venue_type === "Government building") {
      risks.push({ severity: "medium", icon: "🏛️", message: "Government buildings have strict security protocols for 100+ attendees. Allow extra time for approvals.", category: "logistics" });
    }
  }
  
  // Format risks
  if (responses.format === "Hybrid (in-person + virtual)") {
    risks.push({ severity: "medium", icon: "🖥️", message: "Hybrid events typically cost 30-40% more than in-person only due to AV and production needs.", category: "cost" });
  }
  
  // Scale risks
  if (attendance > 250 && !responses.av_needs?.includes("Professional staging")) {
    risks.push({ severity: "low", icon: "🎤", message: "Events with 250+ attendees usually need professional staging for visibility and engagement.", category: "production" });
  }
  
  if (attendance > 100 && !responses.collateral_needs?.includes("Registration system")) {
    risks.push({ severity: "low", icon: "📝", message: "Consider a registration system to manage check-in and communications for 100+ attendees.", category: "logistics" });
  }
  
  // Catering risks
  if (responses.fnb_items?.includes("Alcohol service") && responses.venue_type === "Government building") {
    risks.push({ severity: "high", icon: "🍷", message: "Most government buildings prohibit alcohol. Verify venue policy or choose different location.", category: "logistics" });
  }
  
  if (attendance > 50 && !responses.fnb_items?.includes("Special dietary options")) {
    risks.push({ severity: "low", icon: "🥗", message: "For 50+ attendees, plan for dietary restrictions (typically 15-20% have requirements).", category: "logistics" });
  }
  
  // VIP risks
  if (responses.vips?.toLowerCase().includes("secretary") || responses.vips?.toLowerCase().includes("senator") || responses.vips?.toLowerCase().includes("ceo")) {
    risks.push({ severity: "medium", icon: "⭐", message: "High-profile speakers may require advance security coordination and green room space.", category: "logistics" });
  }
  
  // Budget risks
  if (responses.budget_known === "No, I need help estimating") {
    risks.push({ severity: "low", icon: "💰", message: "Finalize budget range early to avoid scope creep and enable vendor negotiations.", category: "planning" });
  }
  
  return risks.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                        BUDGET CALCULATOR (WITH SCENARIOS)                   ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const calculateBudget = (responses, scenario = 'standard') => {
  const attendanceKey = responses.attendance || "50-100 (medium)";
  const attendance = BUDGET_CONFIG.attendanceDefaults[attendanceKey] || 75;
  const durationKey = responses.duration || "Full day";
  const days = BUDGET_CONFIG.durationMultipliers[durationKey] || 1;
  const locationKey = responses.location || "Washington DC";
  const locationMultiplier = BUDGET_CONFIG.locations[locationKey]?.multiplier || 1.0;
  const venueType = responses.venue_type || "Not sure yet";
  const venueConfig = BUDGET_CONFIG.venueTypes[venueType] || BUDGET_CONFIG.venueTypes["Not sure yet"];
  const scenarioMultiplier = BUDGET_CONFIG.scenarioMultipliers[scenario] || 1.0;
  
  let costs = { venue: 0, foodBeverage: 0, avTechnical: 0, production: 0, collateral: 0, marketing: 0, staffing: 0 };
  
  const venueBase = Math.max(venueConfig.perPerson * attendance, venueConfig.minSpend);
  costs.venue = venueBase * days * locationMultiplier * scenarioMultiplier;
  
  (responses.fnb_items || []).forEach(item => { 
    costs.foodBeverage += (BUDGET_CONFIG.foodAndBeverage[item] || 0) * attendance * days * locationMultiplier * scenarioMultiplier; 
  });
  
  (responses.av_needs || []).forEach(item => { 
    costs.avTechnical += (BUDGET_CONFIG.avTechnical[item] || 0) * days * locationMultiplier * scenarioMultiplier; 
  });
  
  (responses.production_needs || []).forEach(item => { 
    const cfg = BUDGET_CONFIG.production[item]; 
    if (cfg) costs.production += (cfg.perDay ? cfg.cost * days : cfg.cost) * locationMultiplier * scenarioMultiplier; 
  });
  
  (responses.collateral_needs || []).forEach(item => { 
    const cfg = BUDGET_CONFIG.collateral[item]; 
    if (cfg) costs.collateral += (cfg.perPerson ? cfg.cost * attendance : cfg.cost) * scenarioMultiplier; 
  });
  
  (responses.marketing_channels || []).forEach(item => { 
    costs.marketing += (BUDGET_CONFIG.marketing[item] || 0) * scenarioMultiplier; 
  });
  
  costs.staffing = BUDGET_CONFIG.staffing.perDay * days * locationMultiplier * scenarioMultiplier;
  
  const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
  const contingency = subtotal * BUDGET_CONFIG.contingency.percentage;
  
  return { ...costs, subtotal, contingency, total: subtotal + contingency, attendance, days, location: locationKey, locationMultiplier, venueType, scenario };
};

const STORAGE_KEY = 'seedai-event-planner-save';

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
      ai: () => { osc.frequency.setValueAtTime(800, now); osc.frequency.setValueAtTime(1000, now + 0.1); osc.frequency.setValueAtTime(1200, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.3); },
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
    stuart: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="4" y="0" width="2" height="1" fill="#2d2d2d"/><rect x="7" y="0" width="1" height="1" fill="#2d2d2d"/><rect x="10" y="0" width="2" height="1" fill="#2d2d2d"/><rect x="3" y="1" width="10" height="3" fill="#3d3d3d"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="3" y="5" width="4" height="3" fill="#1a1a1a"/><rect x="9" y="5" width="4" height="3" fill="#1a1a1a"/><rect x="7" y="5" width="2" height="1" fill="#1a1a1a"/><rect x="4" y="6" width="2" height="1" fill="#87CEEB"/><rect x="10" y="6" width="2" height="1" fill="#87CEEB"/><rect x="5" y="8" width="6" height="2" fill="#9d8b7a"/><rect x="5" y="10" width="6" height="2" fill="#E8DCC8"/><rect x="3" y="12" width="10" height="4" fill="#1a1a1a"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>),
    austin: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="4" y="5" width="3" height="2" fill="#CD853F"/><rect x="9" y="5" width="3" height="2" fill="#CD853F"/><rect x="7" y="5" width="2" height="1" fill="#CD853F"/><rect x="5" y="5" width="1" height="1" fill="#DEB887"/><rect x="10" y="5" width="1" height="1" fill="#DEB887"/><rect x="3" y="7" width="10" height="3" fill="#4A3728"/><rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/><rect x="3" y="11" width="10" height="5" fill="#1e3a5f"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>),
    anna: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="6" y="0" width="4" height="3" fill="#6B4423"/><rect x="3" y="3" width="10" height="1" fill="#5C4033"/><rect x="3" y="4" width="2" height="3" fill="#6B4423"/><rect x="11" y="4" width="2" height="3" fill="#6B4423"/><rect x="5" y="4" width="6" height="6" fill="#F5D0B0"/><rect x="6" y="6" width="1" height="1" fill="#4A3728"/><rect x="9" y="6" width="1" height="1" fill="#4A3728"/><rect x="3" y="6" width="1" height="1" fill="#FFD700"/><rect x="12" y="6" width="1" height="1" fill="#FFD700"/><rect x="7" y="8" width="2" height="1" fill="#E8A090"/><rect x="3" y="11" width="10" height="5" fill="#E07B8B"/><rect x="6" y="11" width="4" height="1" fill="#F5D0B0"/><rect x="4" y="16" width="8" height="2" fill="#2d3748"/><rect x="4" y="18" width="3" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="3" height="2" fill="#1a1a1a"/></svg>),
    josh: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="5" y="1" width="2" height="1" fill="#6B4423"/><rect x="9" y="1" width="2" height="1" fill="#6B4423"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="4" y="5" width="3" height="2" fill="#8B7355"/><rect x="9" y="5" width="3" height="2" fill="#8B7355"/><rect x="7" y="5" width="2" height="1" fill="#8B7355"/><rect x="4" y="8" width="8" height="1" fill="#3d3d3d"/><rect x="7" y="9" width="2" height="1" fill="#D4A090"/><rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/><rect x="3" y="11" width="10" height="5" fill="#6B7280"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>)
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
    danger: "bg-red-600 hover:bg-red-500 border-red-400 text-white", ai: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white" };
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
    { id: "event_type", label: "What type of event?", type: "select", options: Object.keys(SMART_DEFAULTS), triggersDefaults: true },
    { id: "duration", label: "How long?", type: "select", options: Object.keys(BUDGET_CONFIG.durationMultipliers) },
    { id: "format", label: "Format?", type: "select", options: ["In-person only", "Virtual only", "Hybrid (in-person + virtual)"] },
    { id: "anchor_moments", label: "2-3 'anchor moments' that will define this event?", type: "textarea", placeholder: "The highlights people will talk about..." },
    { id: "program_elements", label: "What program elements do you need?", type: "checkbox", options: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Workshops/trainings", "Demos/showcases", "Networking time", "Fireside chats", "Q&A sessions", "Poster sessions", "Awards/recognition", "Entertainment", "Meals/receptions"] },
    { id: "takeaway", label: "What should attendees walk away with?", type: "textarea", placeholder: "Knowledge, connections, inspiration, action items..." }
  ]},
  { id: 4, name: "THE DETAILS", icon: "📍", subtitle: "Where, when, and how?", questions: [
    { id: "target_date", label: "Target date or timeframe?", type: "date", placeholder: "YYYY-MM-DD" },
    { id: "date_drivers", label: "What's driving the date?", type: "textarea", placeholder: "Legislative calendar, announcement timing, partner availability..." },
    { id: "location", label: "Where should this be held?", type: "select", options: Object.keys(BUDGET_CONFIG.locations) },
    { id: "venue_type", label: "What type of venue?", type: "select", options: Object.keys(BUDGET_CONFIG.venueTypes) },
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

// RISK FLAGS COMPONENT
const RiskFlags = ({ responses }) => {
  const risks = analyzeRisks(responses);
  if (risks.length === 0) return null;
  
  const severityColors = {
    high: "border-red-500 bg-red-900/30 text-red-400",
    medium: "border-yellow-500 bg-yellow-900/30 text-yellow-400",
    low: "border-blue-500 bg-blue-900/30 text-blue-400"
  };
  
  return (
    <div className="border-4 border-orange-500 bg-slate-800 p-3 mb-3">
      <div className="flex items-center gap-2 text-orange-400 text-sm mb-2">
        <AlertTriangle size={16}/> RISK FLAGS ({risks.length})
      </div>
      <div className="space-y-2">
        {risks.slice(0, 5).map((risk, i) => (
          <div key={i} className={`p-2 border-2 text-xs ${severityColors[risk.severity]}`}>
            <span className="mr-2">{risk.icon}</span>{risk.message}
          </div>
        ))}
        {risks.length > 5 && (
          <div className="text-xs text-slate-500">+{risks.length - 5} more warnings in export</div>
        )}
      </div>
    </div>
  );
};

// TIMELINE COMPONENT
const TimelineView = ({ responses }) => {
  const timeline = generateTimeline(responses.target_date, responses);
  if (timeline.length === 0) return null;
  
  return (
    <div className="border-4 border-blue-500 bg-slate-800 p-3 mb-3">
      <div className="flex items-center gap-2 text-blue-400 text-sm mb-2">
        <Calendar size={16}/> AUTO-GENERATED TIMELINE
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {timeline.map((m, i) => (
          <div key={i} className={`flex items-center gap-2 text-xs p-1 rounded ${
            m.isPast ? 'text-slate-600 line-through' : 
            m.isUrgent ? 'text-yellow-400 bg-yellow-900/20' : 
            m.weeksOut === 0 ? 'text-green-400 bg-green-900/20 font-bold' :
            'text-slate-400'
          }`}>
            <span className="w-20 text-right text-slate-500">
              {m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {m.isPast ? <CheckCircle size={12} className="text-green-600"/> : m.isUrgent ? <Clock size={12}/> : <span className="w-3"/>}
            <span>{m.task}</span>
            {m.weeksOut > 0 && !m.isPast && <span className="text-slate-600 ml-auto">{m.weeksOut}w</span>}
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-2 border-t border-slate-700 pt-2">
        💡 Timeline auto-adjusts based on venue type and event date
      </div>
    </div>
  );
};

// BUDGET ESTIMATOR WITH SCENARIOS
const BudgetEstimator = ({ responses, onAiRefine, aiEstimate, aiLoading }) => {
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const budgetScenarios = {
    budget: calculateBudget(responses, 'budget'),
    standard: calculateBudget(responses, 'standard'),
    premium: calculateBudget(responses, 'premium')
  };
  const budget = budgetScenarios[selectedScenario];
  const budgetMaxMap = { 'Under $10K': 10000, '$10-25K': 25000, '$25-50K': 50000, '$50-100K': 100000, '$100-250K': 250000, '$250K+': 500000 };
  const statedMax = budgetMaxMap[responses.budget_range];
  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();
  
  const categories = [
    { key: 'venue', label: '🏛️ Venue', budget: budgetScenarios.budget.venue, standard: budgetScenarios.standard.venue, premium: budgetScenarios.premium.venue },
    { key: 'foodBeverage', label: '🍽️ F&B', budget: budgetScenarios.budget.foodBeverage, standard: budgetScenarios.standard.foodBeverage, premium: budgetScenarios.premium.foodBeverage },
    { key: 'avTechnical', label: '🎤 AV', budget: budgetScenarios.budget.avTechnical, standard: budgetScenarios.standard.avTechnical, premium: budgetScenarios.premium.avTechnical },
    { key: 'production', label: '📸 Production', budget: budgetScenarios.budget.production, standard: budgetScenarios.standard.production, premium: budgetScenarios.premium.production },
    { key: 'collateral', label: '📦 Collateral', budget: budgetScenarios.budget.collateral, standard: budgetScenarios.standard.collateral, premium: budgetScenarios.premium.collateral },
    { key: 'marketing', label: '📣 Marketing', budget: budgetScenarios.budget.marketing, standard: budgetScenarios.standard.marketing, premium: budgetScenarios.premium.marketing },
    { key: 'staffing', label: '👥 Staffing', budget: budgetScenarios.budget.staffing, standard: budgetScenarios.standard.staffing, premium: budgetScenarios.premium.staffing },
  ].filter(c => c.standard > 0);
  
  const locationLabel = BUDGET_CONFIG.locations[budget.location]?.label || budget.location;
  const hasSelections = categories.length > 0;
  
  return (
    <div className="border-4 border-green-500 bg-slate-800 p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-green-400 text-sm"><Calculator size={16}/> BUDGET SCENARIOS</div>
        {budget.locationMultiplier !== 1.0 && (
          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">{locationLabel}</span>
        )}
      </div>
      
      <div className="text-xs text-slate-500 mb-3">{budget.attendance} attendees × {budget.days} day(s)</div>
      
      {/* Scenario Tabs */}
      <div className="flex gap-1 mb-3">
        {[
          { id: 'budget', label: '💰 Budget', desc: 'Cost-conscious' },
          { id: 'standard', label: '⭐ Standard', desc: 'Recommended' },
          { id: 'premium', label: '✨ Premium', desc: 'High-end' }
        ].map(s => (
          <button key={s.id} onClick={() => { sound.play('select'); setSelectedScenario(s.id); }}
            className={`flex-1 p-2 border-2 text-xs ${selectedScenario === s.id ? 'border-green-400 bg-green-900/30 text-green-400' : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
            <div className="font-bold">{s.label}</div>
            <div className="text-xs opacity-75">{s.desc}</div>
          </button>
        ))}
      </div>
      
      {hasSelections ? (
        <>
          {/* Comparison Table */}
          <div className="mb-3 text-xs">
            <div className="grid grid-cols-4 gap-1 mb-1 text-slate-500">
              <div>Category</div>
              <div className="text-center">Budget</div>
              <div className="text-center">Standard</div>
              <div className="text-center">Premium</div>
            </div>
            {categories.map(c => (
              <div key={c.key} className="grid grid-cols-4 gap-1 py-1 border-t border-slate-700">
                <div className="text-slate-400 truncate">{c.label}</div>
                <div className={`text-center ${selectedScenario === 'budget' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{formatMoney(c.budget)}</div>
                <div className={`text-center ${selectedScenario === 'standard' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{formatMoney(c.standard)}</div>
                <div className={`text-center ${selectedScenario === 'premium' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{formatMoney(c.premium)}</div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-1 py-2 border-t-2 border-green-500 font-bold">
              <div className="text-green-400">TOTAL</div>
              <div className={`text-center ${selectedScenario === 'budget' ? 'text-green-400' : 'text-slate-400'}`}>{formatMoney(budgetScenarios.budget.total)}</div>
              <div className={`text-center ${selectedScenario === 'standard' ? 'text-green-400' : 'text-slate-400'}`}>{formatMoney(budgetScenarios.standard.total)}</div>
              <div className={`text-center ${selectedScenario === 'premium' ? 'text-green-400' : 'text-slate-400'}`}>{formatMoney(budgetScenarios.premium.total)}</div>
            </div>
          </div>
          
          {/* Budget fit indicator */}
          {statedMax && (
            <div className={`p-2 mb-3 border-2 text-xs ${
              budgetScenarios.budget.total <= statedMax ? 'border-green-500 bg-green-900/30 text-green-400' :
              budgetScenarios.standard.total <= statedMax ? 'border-yellow-500 bg-yellow-900/30 text-yellow-400' :
              'border-red-500 bg-red-900/30 text-red-400'
            }`}>
              {budgetScenarios.budget.total <= statedMax && budgetScenarios.standard.total <= statedMax ? 
                `✅ All scenarios fit within your ${responses.budget_range} budget` :
                budgetScenarios.budget.total <= statedMax ?
                `⚠️ Only Budget scenario fits within ${responses.budget_range}` :
                `❌ All scenarios exceed ${responses.budget_range} — consider reducing scope`
              }
            </div>
          )}
          
          {/* AI Refinement */}
          <div className="border-t border-slate-700 pt-3">
            <button onClick={onAiRefine} disabled={aiLoading}
              className={`w-full p-2 border-2 text-xs flex items-center justify-center gap-2 transition-all ${aiLoading ? 'border-purple-500 bg-purple-900/30 text-purple-400' : 'border-purple-500 bg-slate-900 text-purple-400 hover:bg-purple-900/30'} disabled:opacity-50`}>
              {aiLoading ? (<><Loader size={14} className="animate-spin"/> Researching...</>) : (<><Zap size={14}/> Refine with AI</>)}
            </button>
            {aiEstimate && (
              <div className="mt-3 p-2 bg-purple-900/20 border-2 border-purple-500/50 text-xs">
                <div className="text-purple-400 font-bold mb-2"><Sparkles size={12} className="inline mr-1"/> AI ANALYSIS</div>
                <div className="text-slate-300 whitespace-pre-wrap">{aiEstimate}</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-slate-500 text-xs text-center py-4">Select options in earlier phases to see budget estimates</div>
      )}
      
      <div className="text-xs text-slate-500 border-t border-slate-700 pt-2 mt-3">
        💡 Budget=70%, Standard=100%, Premium=150% of base costs. Includes 15% contingency.
      </div>
    </div>
  );
};

// SMART DEFAULTS BANNER
const SmartDefaultsBanner = ({ eventType, onApply, onDismiss }) => {
  if (!eventType || !SMART_DEFAULTS[eventType]) return null;
  
  return (
    <div className="border-4 border-purple-500 bg-purple-900/20 p-3 mb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-purple-400 text-sm mb-2">
          <Lightbulb size={16}/> SMART DEFAULTS AVAILABLE
        </div>
        <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300"><X size={14}/></button>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        We have suggested settings for a typical <span className="text-purple-400 font-bold">{eventType}</span>. 
        Apply them to save time, then customize as needed.
      </p>
      <Btn onClick={onApply} variant="ai" className="w-full">
        <Sparkles size={12} className="inline mr-1"/> Apply {eventType} Defaults
      </Btn>
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
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSmartDefaults, setShowSmartDefaults] = useState(null);
  const [appliedDefaults, setAppliedDefaults] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.responses && Object.keys(data.responses).length > 0) { setHasSave(true); setLastSaved(data.savedAt ? new Date(data.savedAt) : null); }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (screen === 'play' || screen === 'export') {
      const timer = setTimeout(() => { saveProgress(true); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [responses, needsInput, notes, team, char, program, phase]);

  useEffect(() => { const i = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(i); }, []);

  // Trigger smart defaults when event type changes
  useEffect(() => {
    if (responses.event_type && SMART_DEFAULTS[responses.event_type] && !appliedDefaults) {
      setShowSmartDefaults(responses.event_type);
    }
  }, [responses.event_type]);

  const applySmartDefaults = () => {
    const defaults = SMART_DEFAULTS[responses.event_type];
    if (!defaults) return;
    
    sound.play('complete');
    setResponses(prev => ({
      ...prev,
      duration: defaults.duration,
      attendance: defaults.attendance,
      venue_type: defaults.venue_type,
      program_elements: defaults.program_elements,
      fnb_items: defaults.fnb_items,
      av_needs: defaults.av_needs,
      production_needs: defaults.production_needs,
      collateral_needs: defaults.collateral_needs,
    }));
    setAppliedDefaults(true);
    setShowSmartDefaults(null);
    setStatus('Smart defaults applied!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleAiRefine = async () => {
    setAiLoading(true); setAiEstimate(null); sound.play('ai');
    const budget = calculateBudget(responses, 'standard');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: `Research current event costs and provide a refined budget estimate:
EVENT: ${responses.event_name || 'Untitled'} (${responses.event_type || 'Conference'})
LOCATION: ${budget.location} | ATTENDANCE: ${budget.attendance} | DURATION: ${budget.days} day(s)
VENUE: ${budget.venueType} | Current estimate: $${Math.round(budget.total).toLocaleString()}
Provide: 1) Refined estimate with reasoning, 2) Specific venues to consider, 3) Cost-saving tips. Under 150 words.` }]
        })
      });
      const data = await response.json();
      setAiEstimate(data.content?.map(c => c.type === 'text' ? c.text : '').join('') || 'Unable to get estimate.');
      sound.play('complete');
    } catch (e) { setAiEstimate('⚠️ Could not connect. Using static estimates.'); }
    setAiLoading(false);
  };

  const saveProgress = (silent = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ char, program, phase, responses, needsInput, notes, team, appliedDefaults, savedAt: new Date().toISOString() }));
      setLastSaved(new Date());
      if (!silent) { sound.play('save'); setStatus('Saved!'); setTimeout(() => setStatus(''), 2000); }
    } catch (e) {}
  };

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setChar(data.char); setProgram(data.program); setPhase(data.phase || 0);
        setResponses(data.responses || {}); setNeedsInput(data.needsInput || {});
        setNotes(data.notes || {}); setTeam(data.team || []);
        setAppliedDefaults(data.appliedDefaults || false);
        sound.play('start'); setScreen('play');
      }
    } catch (e) {}
  };

  const clearSave = () => {
    localStorage.removeItem(STORAGE_KEY); setHasSave(false);
    setResponses({}); setNeedsInput({}); setNotes({}); setTeam([]);
    setChar(null); setProgram(null); setPhase(0); setAiEstimate(null);
    setAppliedDefaults(false); setShowSmartDefaults(null);
  };

  const update = (id, val) => { 
    setResponses(p => ({ ...p, [id]: val })); 
    setAiEstimate(null);
    if (id === 'event_type') setAppliedDefaults(false);
  };
  const toggleInput = (id) => { sound.play('select'); setNeedsInput(p => ({ ...p, [id]: !p[id] })); };
  const addMember = () => { if (newMember.name) { sound.play('select'); setTeam([...team, { ...newMember, id: Date.now() }]); setNewMember({ name: '', role: '' }); }};
  const removeMember = (id) => { sound.play('navigate'); setTeam(team.filter(m => m.id !== id)); };

  const getProgress = (idx) => {
    const p = phases[idx];
    return { done: p.questions.filter(q => q.type === 'checkbox' ? responses[q.id]?.length > 0 : responses[q.id]?.trim?.() || needsInput[q.id]).length, total: p.questions.length };
  };
  
  const totalProgress = () => {
    let t = 0, d = 0;
    phases.forEach(p => p.questions.forEach(q => { t++; if (q.type === 'checkbox' ? (responses[q.id]?.length > 0 || needsInput[q.id]) : (responses[q.id]?.trim?.() || needsInput[q.id])) d++; }));
    return { done: d, total: t };
  };

  const exportText = () => {
    const budgetStandard = calculateBudget(responses, 'standard');
    const budgetLow = calculateBudget(responses, 'budget');
    const budgetHigh = calculateBudget(responses, 'premium');
    const total = totalProgress();
    const isPartial = total.done < total.total;
    const locationLabel = BUDGET_CONFIG.locations[budgetStandard.location]?.label || budgetStandard.location;
    const timeline = generateTimeline(responses.target_date, responses);
    const risks = analyzeRisks(responses);
    
    let t = `# EVENT PROPOSAL: ${responses.event_name || 'Untitled'}\n\n`;
    if (isPartial) t += `**⚠️ DRAFT — ${total.done}/${total.total} questions completed**\n\n`;
    t += `**Program:** ${programs.find(p => p.id === program)?.name || 'Not selected'}\n**Event Owner:** ${charNames[char] || 'Not selected'}\n**Date Created:** ${new Date().toLocaleDateString()}\n**Location:** ${locationLabel}\n**Target Date:** ${responses.target_date || 'TBD'}\n`;
    t += `**Budget Range:** ${formatMoney(budgetLow.total)} - ${formatMoney(budgetHigh.total)}\n\n`;
    
    if (team.length) { t += `## Team\n`; team.forEach(m => t += `- **${m.name}** — ${m.role || 'TBD'}\n`); t += '\n'; }
    
    // Risk Flags
    if (risks.length) {
      t += `## ⚠️ RISK FLAGS\n`;
      risks.forEach(r => t += `- ${r.icon} **[${r.severity.toUpperCase()}]** ${r.message}\n`);
      t += '\n';
    }
    
    // Timeline
    if (timeline.length) {
      t += `## 📅 PLANNING TIMELINE\n`;
      timeline.filter(m => !m.isPast).forEach(m => {
        t += `- **${m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}** — ${m.task}${m.isUrgent ? ' ⚡' : ''}\n`;
      });
      t += '\n';
    }
    
    const needsList = [];
    phases.forEach(p => {
      const phaseProgress = getProgress(p.id - 1);
      t += `## ${p.icon} ${p.name}${phaseProgress.done < phaseProgress.total ? ` *(${phaseProgress.done}/${phaseProgress.total})*` : ''}\n`;
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
    
    // Budget with scenarios
    t += `## 💰 BUDGET ESTIMATE (3 SCENARIOS)\n`;
    t += `*${budgetStandard.attendance} attendees × ${budgetStandard.days} day(s) in ${locationLabel}*\n\n`;
    t += `| Category | Budget | Standard | Premium |\n|----------|--------|----------|--------|\n`;
    if (budgetStandard.venue > 0) t += `| Venue | ${formatMoney(budgetLow.venue)} | ${formatMoney(budgetStandard.venue)} | ${formatMoney(budgetHigh.venue)} |\n`;
    if (budgetStandard.foodBeverage > 0) t += `| F&B | ${formatMoney(budgetLow.foodBeverage)} | ${formatMoney(budgetStandard.foodBeverage)} | ${formatMoney(budgetHigh.foodBeverage)} |\n`;
    if (budgetStandard.avTechnical > 0) t += `| AV | ${formatMoney(budgetLow.avTechnical)} | ${formatMoney(budgetStandard.avTechnical)} | ${formatMoney(budgetHigh.avTechnical)} |\n`;
    if (budgetStandard.production > 0) t += `| Production | ${formatMoney(budgetLow.production)} | ${formatMoney(budgetStandard.production)} | ${formatMoney(budgetHigh.production)} |\n`;
    if (budgetStandard.collateral > 0) t += `| Collateral | ${formatMoney(budgetLow.collateral)} | ${formatMoney(budgetStandard.collateral)} | ${formatMoney(budgetHigh.collateral)} |\n`;
    if (budgetStandard.marketing > 0) t += `| Marketing | ${formatMoney(budgetLow.marketing)} | ${formatMoney(budgetStandard.marketing)} | ${formatMoney(budgetHigh.marketing)} |\n`;
    if (budgetStandard.staffing > 0) t += `| Staffing | ${formatMoney(budgetLow.staffing)} | ${formatMoney(budgetStandard.staffing)} | ${formatMoney(budgetHigh.staffing)} |\n`;
    t += `| **TOTAL** | **${formatMoney(budgetLow.total)}** | **${formatMoney(budgetStandard.total)}** | **${formatMoney(budgetHigh.total)}** |\n\n`;
    
    if (aiEstimate) t += `### AI Analysis\n${aiEstimate}\n\n`;
    
    if (needsList.length) { t += `---\n\n## ⚠️ NEEDS TEAM INPUT (${needsList.length} items)\n`; needsList.forEach(i => t += `- [${i.phase}] ${i.q}${i.note ? ` — *${i.note}*` : ''}\n`); }
    t += `\n---\n*Paste into Claude to generate: Event Planning Doc, Detailed Budget, Timeline*`;
    return t;
  };
  
  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();

  const copy = async () => { await navigator.clipboard.writeText(exportText()); sound.play('complete'); setStatus('Copied!'); setTimeout(() => setStatus(''), 2000); };
  const email = () => { window.open(`mailto:operations@seedai.org?subject=${encodeURIComponent(`${responses.event_name || 'New Event'} - Event Proposal`)}&body=${encodeURIComponent(exportText())}`); };
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/plain' })); a.download = `${responses.event_name || 'event'}-proposal.md`; a.click(); sound.play('complete'); };

  // SCREENS
  if (screen === 'title') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">{soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-400 mb-2" style={{ textShadow: '4px 4px 0 #1e3a8a' }}>SeedAI</h1>
        <h2 className="text-2xl text-yellow-400 mb-4" style={{ textShadow: '2px 2px 0 #92400e' }}>EVENT PLANNER</h2>
        <p className="text-slate-400 text-xs mb-6 max-w-xs mx-auto">From spark to comprehensive proposal—one phase at a time</p>
        <div className={`text-white text-sm mb-6 ${blink ? '' : 'opacity-0'}`}>PRESS START</div>
        <div className="flex flex-col gap-2 items-center">
          <Btn onClick={() => { sound.play('start'); clearSave(); setScreen('character'); }} variant="warning">NEW EVENT</Btn>
          {hasSave && (<Btn onClick={loadProgress} variant="success"><RotateCcw size={12} className="inline mr-1"/> CONTINUE</Btn>)}
        </div>
      </div>
    </div>
  );

  if (screen === 'character') return (
    <div className="min-h-screen bg-slate-900 p-4 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">{soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl text-yellow-400 mb-1">WHO'S LEADING THIS?</h2>
        <p className="text-slate-400 text-xs mb-4">Select yourself as Event Owner</p>
        <div className="flex justify-center gap-3 flex-wrap mb-6">{['stuart', 'austin', 'anna', 'josh'].map(c => (<PixelChar key={c} id={c} selected={char === c} onClick={() => { sound.play('select'); setChar(c); }}/>))}</div>
        <div className="flex justify-center gap-3">
          <Btn onClick={() => setScreen('title')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('program')} disabled={!char} variant="success">CONTINUE →</Btn>
        </div>
      </div>
    </div>
  );

  if (screen === 'program') return (
    <div className="min-h-screen bg-slate-900 p-4 font-mono">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl text-yellow-400 mb-4 text-center">SELECT PROGRAM</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {programs.map(p => (<button key={p.id} onClick={() => { sound.play('select'); setProgram(p.id); }} className={`p-3 border-4 text-left text-xs ${program === p.id ? 'border-yellow-400 bg-slate-700 text-yellow-400' : 'border-slate-600 bg-slate-800 text-slate-300'}`}><span className="text-lg mr-2">{p.icon}</span>{p.name}</button>))}
        </div>
        <div className="flex justify-center gap-3">
          <Btn onClick={() => setScreen('character')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('play')} disabled={!program} variant="success">START →</Btn>
        </div>
      </div>
    </div>
  );

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
          </div>
          
          <RiskFlags responses={responses} />
          <TimelineView responses={responses} />
          <BudgetEstimator responses={responses} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
          
          {needsCount > 0 && (<div className="border-4 border-yellow-500 bg-yellow-900/30 p-3 mb-3 text-yellow-400 text-xs"><Users size={14} className="inline mr-2"/>{needsCount} items need team input</div>)}
          
          <div className="border-4 border-blue-500 bg-slate-800 p-3 mb-3">
            <div className="text-blue-400 text-sm mb-2">SHARE PROPOSAL</div>
            <div className="grid grid-cols-3 gap-2">
              <Btn onClick={copy} variant="primary" className="w-full text-xs"><Share2 size={12} className="inline mr-1"/>COPY</Btn>
              <Btn onClick={email} variant="warning" className="w-full text-xs"><Mail size={12} className="inline mr-1"/>EMAIL</Btn>
              <Btn onClick={download} variant="success" className="w-full text-xs"><Download size={12} className="inline mr-1"/>SAVE</Btn>
            </div>
            {status && <div className="text-center text-green-400 text-xs mt-2">{status}</div>}
          </div>
          
          <div className="border-4 border-slate-600 bg-slate-800 mb-3 max-h-48 overflow-y-auto p-3"><pre className="text-xs text-slate-300 whitespace-pre-wrap">{exportText()}</pre></div>
          
          <div className="flex justify-center gap-3">
            <Btn onClick={() => setScreen('play')} variant="secondary">← EDIT</Btn>
            <Btn onClick={() => { clearSave(); setScreen('title'); }} variant="danger">NEW</Btn>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PLAY SCREEN
  const p = phases[phase];
  const prog = getProgress(phase);
  const total = totalProgress();

  return (
    <div className="min-h-screen bg-slate-900 font-mono">
      <div className="bg-slate-800 border-b-4 border-slate-700 p-2">
        <div className="max-w-lg mx-auto flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span>{programs.find(x => x.id === program)?.icon}</span>
            <div><div className="text-blue-400 text-xs">EVENT PLANNER</div><div className="text-slate-500 text-xs">{charNames[char]}</div></div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="text-slate-500 hover:text-slate-300 p-1">{soundOn ? <Volume2 size={14}/> : <VolumeX size={14}/>}</button>
            <Btn onClick={() => saveProgress()} variant="secondary" className="text-xs py-1"><Save size={10} className="inline mr-1"/>SAVE</Btn>
            <Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success" className="text-xs py-1"><Sparkles size={10} className="inline mr-1"/>EXPORT</Btn>
          </div>
        </div>
        <div className="max-w-lg mx-auto"><ProgressWithCharacter current={total.done} total={total.total} label="PROGRESS" characterId={char} /></div>
      </div>

      <div className="max-w-lg mx-auto p-3">
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {phases.map((x, i) => {
            const pr = getProgress(i);
            return (<button key={x.id} onClick={() => { sound.play('navigate'); setPhase(i); }} className={`px-2 py-1 border-4 text-xs whitespace-nowrap ${i === phase ? 'border-yellow-400 bg-slate-700 text-yellow-400' : pr.done === pr.total && pr.total > 0 ? 'border-green-500 bg-slate-800 text-green-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>{x.icon}</button>);
          })}
        </div>

        {/* Smart Defaults Banner */}
        {showSmartDefaults && phase === 2 && (
          <SmartDefaultsBanner eventType={showSmartDefaults} onApply={applySmartDefaults} onDismiss={() => setShowSmartDefaults(null)} />
        )}

        <div className="border-4 border-blue-500 bg-slate-800 mb-3">
          <div className="bg-blue-600 p-3 border-b-4 border-blue-500">
            <div className="text-xs text-blue-200">PHASE {p.id} OF {phases.length}</div>
            <h2 className="text-lg text-white">{p.icon} {p.name}</h2>
            <div className="text-xs text-blue-200">{p.subtitle}</div>
          </div>

          {phase === 0 && (
            <div className="p-3 border-b-4 border-slate-700">
              <div className="text-yellow-400 text-xs mb-2 flex items-center gap-2"><Users size={12}/> PLANNING TEAM</div>
              <div className="text-slate-500 text-xs mb-2">Owner: <span className="text-yellow-400">{charNames[char]}</span></div>
              {team.length > 0 && (<div className="space-y-1 mb-2">{team.map(m => (<div key={m.id} className="flex justify-between items-center bg-slate-900 p-2 border-2 border-slate-700 text-xs text-slate-300">{m.name} {m.role && `— ${m.role}`}<button onClick={() => removeMember(m.id)} className="text-red-400"><X size={12}/></button></div>))}</div>)}
              <div className="flex gap-2">
                <input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="flex-1 p-2 bg-slate-900 border-2 border-slate-600 text-slate-200 text-xs" placeholder="Name"/>
                <input value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="flex-1 p-2 bg-slate-900 border-2 border-slate-600 text-slate-200 text-xs" placeholder="Role"/>
                <button onClick={addMember} className="px-3 bg-green-600 border-2 border-green-400 text-white"><Plus size={12}/></button>
              </div>
            </div>
          )}

          {phase === phases.length - 1 && (
            <div className="p-3 border-b-4 border-slate-700">
              <RiskFlags responses={responses} />
              <TimelineView responses={responses} />
              <BudgetEstimator responses={responses} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
            </div>
          )}

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
                {showNote === q.id && (<input value={notes[q.id] || ''} onChange={e => setNotes({ ...notes, [q.id]: e.target.value })} className="w-full p-2 mb-1 bg-slate-700 border-2 border-slate-600 text-slate-300 text-xs" placeholder="Note for team..."/>)}
                {q.type === 'checkbox' ? (<Checkbox options={q.options} selected={responses[q.id] || []} onChange={(val) => update(q.id, val)} />)
                  : q.type === 'textarea' ? (<textarea value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} rows={2} className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none resize-none" placeholder={q.placeholder}/>)
                  : q.type === 'select' ? (<select value={responses[q.id] || ''} onChange={e => { sound.play('select'); update(q.id, e.target.value); }} className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none"><option value="">-- SELECT --</option>{q.options.map(o => <option key={o} value={o}>{o}</option>)}</select>)
                  : q.type === 'date' ? (<input type="date" value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none"/>)
                  : (<input type="text" value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} className="w-full p-2 bg-slate-900 border-4 border-slate-600 text-slate-200 text-xs focus:border-yellow-400 focus:outline-none" placeholder={q.placeholder}/>)}
                {needsInput[q.id] && !(q.type === 'checkbox' ? responses[q.id]?.length : responses[q.id]?.trim?.()) && (<div className="text-yellow-400 text-xs mt-1"><HelpCircle size={10} className="inline"/> Flagged</div>)}
              </div>
            ))}
          </div>

          <div className="border-t-4 border-slate-700 p-3 flex justify-between">
            <Btn onClick={() => setPhase(Math.max(0, phase - 1))} disabled={phase === 0} variant="secondary">← PREV</Btn>
            <span className="text-slate-500 text-xs self-center">{prog.done}/{prog.total}</span>
            {phase < phases.length - 1 ? (<Btn onClick={() => setPhase(phase + 1)} variant="primary">NEXT →</Btn>) : (<Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success"><Trophy size={14} className="inline mr-1"/>FINISH</Btn>)}
          </div>
        </div>
        {status && <div className="text-center text-green-400 text-xs mt-2">{status}</div>}
      </div>
    </div>
  );
}
