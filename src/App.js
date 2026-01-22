import React, { useState, useEffect } from 'react';
import { Share2, Mail, Download, Users, MessageSquare, HelpCircle, Trophy, Volume2, VolumeX, Plus, X, Sparkles, Calculator, AlertTriangle, Save, RotateCcw, Zap, Loader, Calendar, Clock, CheckCircle, Lightbulb, ExternalLink, MapPin } from 'lucide-react';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    GOOGLE SHEETS CONFIGURATION                              ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const SHEET_ID = process.env.REACT_APP_SHEET_ID || '16-es1Gxv-oaG7MgtH6-ZqrGwgPl-Ly3Q_fXaYFc3AAs';

const fetchSheetData = async (sheetName) => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const headers = json.table.cols.map(col => col.label);
    return json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => { obj[headers[i]] = cell ? cell.v : ''; });
      return obj;
    });
  } catch (error) {
    console.log(`Could not fetch ${sheetName}, using defaults`);
    return null;
  }
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                         DEFAULT CONFIGURATION                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const DEFAULT_BUDGET_CONFIG = {
  locations: {
    "Washington DC": { multiplier: 1.0, label: "Washington DC", peakMonths: [3, 4, 5, 9, 10] },
    "New York City": { multiplier: 1.35, label: "New York City", peakMonths: [5, 6, 9, 10, 12] },
    "San Francisco": { multiplier: 1.4, label: "San Francisco", peakMonths: [5, 6, 9, 10] },
    "Los Angeles": { multiplier: 1.2, label: "Los Angeles", peakMonths: [1, 2, 3, 10, 11] },
    "Chicago": { multiplier: 0.95, label: "Chicago", peakMonths: [6, 7, 8, 9] },
    "Boston": { multiplier: 1.15, label: "Boston", peakMonths: [5, 6, 9, 10] },
    "Seattle": { multiplier: 1.1, label: "Seattle", peakMonths: [6, 7, 8, 9] },
    "Austin": { multiplier: 0.85, label: "Austin", peakMonths: [3, 10, 11] },
    "Denver": { multiplier: 0.9, label: "Denver", peakMonths: [6, 7, 8, 9] },
    "Atlanta": { multiplier: 0.85, label: "Atlanta", peakMonths: [3, 4, 9, 10] },
    "Miami": { multiplier: 1.0, label: "Miami", peakMonths: [1, 2, 3, 12] },
    "Regional/Rural": { multiplier: 0.7, label: "Regional / Smaller City", peakMonths: [] },
  },
  venueTypes: {
    "Conference center": { perPerson: { budget: 50, standard: 75, premium: 110 }, minSpend: 2000, leadTime: 12 },
    "Hotel": { perPerson: { budget: 60, standard: 85, premium: 130 }, minSpend: 3000, leadTime: 8 },
    "University/campus": { perPerson: { budget: 25, standard: 35, premium: 55 }, minSpend: 500, leadTime: 16 },
    "Government building": { perPerson: { budget: 0, standard: 0, premium: 0 }, minSpend: 0, leadTime: 20 },
    "Museum/unique venue": { perPerson: { budget: 70, standard: 100, premium: 160 }, minSpend: 5000, leadTime: 16 },
    "Corporate office": { perPerson: { budget: 15, standard: 25, premium: 40 }, minSpend: 0, leadTime: 4 },
    "Not sure yet": { perPerson: { budget: 50, standard: 75, premium: 110 }, minSpend: 2000, leadTime: 12 },
  },
  foodAndBeverage: {
    "Coffee/Light Snacks": { budget: 12, standard: 18, premium: 28 },
    "Breakfast": { budget: 22, standard: 32, premium: 50 },
    "Lunch": { budget: 32, standard: 45, premium: 70 },
    "Reception/Appetizers": { budget: 40, standard: 55, premium: 85 },
    "Dinner": { budget: 65, standard: 95, premium: 150 },
    "Special dietary options": { budget: 8, standard: 12, premium: 18 },
    "Alcohol service": { budget: 25, standard: 35, premium: 55 },
  },
  avTechnical: {
    "Basic (mics, projector)": { budget: 1500, standard: 2500, premium: 4000 },
    "Professional staging": { budget: 4000, standard: 6000, premium: 12000 },
    "Multiple screens": { budget: 2500, standard: 3500, premium: 6000 },
    "Livestream": { budget: 3500, standard: 5000, premium: 10000 },
    "Recording": { budget: 1800, standard: 2500, premium: 5000 },
    "Lighting design": { budget: 2500, standard: 4000, premium: 8000 },
  },
  production: {
    "Photographer": { budget: 1400, standard: 2000, premium: 3500, perDay: true },
    "Videographer": { budget: 2500, standard: 3500, premium: 6000, perDay: true },
    "Post-event highlight video": { budget: 2500, standard: 3500, premium: 6000, perDay: false },
    "Social media coverage": { budget: 800, standard: 1200, premium: 2000, perDay: true },
    "Graphic recording": { budget: 1800, standard: 2500, premium: 4000, perDay: true },
  },
  collateral: {
    "Event website": { budget: 1400, standard: 2000, premium: 4000, perPerson: false },
    "Registration system": { budget: 400, standard: 600, premium: 1200, perPerson: false },
    "Event app": { budget: 2800, standard: 4000, premium: 8000, perPerson: false },
    "Printed programs": { budget: 2.5, standard: 4, premium: 8, perPerson: true },
    "Name badges": { budget: 2, standard: 3, premium: 6, perPerson: true },
    "Signage/banners": { budget: 1400, standard: 2000, premium: 4000, perPerson: false },
    "Swag/giveaways": { budget: 15, standard: 25, premium: 50, perPerson: true },
  },
  marketing: {
    "Email campaigns": { budget: 400, standard: 600, premium: 1200 },
    "Social media (organic)": { budget: 400, standard: 600, premium: 1000 },
    "Social media (paid)": { budget: 1500, standard: 2500, premium: 5000 },
    "Press/media outreach": { budget: 1400, standard: 2000, premium: 4000 },
  },
  staffing: { budget: 1800, standard: 2500, premium: 4000 },
  contingency: { budget: 0.12, standard: 0.15, premium: 0.18 },
  durationMultipliers: { "2-3 hours": 0.5, "Half day (4-5 hours)": 0.5, "Full day": 1, "1.5 days": 1.5, "2 days": 2, "Multi-day (3+)": 3 },
  attendanceDefaults: { "Under 25 (intimate)": 20, "25-50 (small)": 40, "50-100 (medium)": 75, "100-250 (large)": 175, "250-500 (very large)": 375, "500+ (major)": 600 },
};

const DEFAULT_VENDORS = {
  venues: [
    { city: "Washington DC", name: "Ronald Reagan Building", type: "Conference center", tier: "Premium", min_capacity: 50, max_capacity: 5000, min_price: 15000, max_price: 50000, url: "https://rrbitc.com", notes: "65000 sq ft. Iconic DC venue." },
    { city: "Washington DC", name: "National Building Museum", type: "Museum/unique venue", tier: "Premium", min_capacity: 100, max_capacity: 1000, min_price: 18000, max_price: 35000, url: "https://nbm.org", notes: "Historic Great Hall." },
    { city: "Washington DC", name: "Partnership for Public Service", type: "Conference center", tier: "Standard", min_capacity: 15, max_capacity: 200, min_price: 5000, max_price: 12000, url: "https://ourpublicservice.org/about/conference-center-rental/", notes: "Modern. Mon/Fri discounts." },
    { city: "Washington DC", name: "National Press Club", type: "Conference center", tier: "Standard", min_capacity: 25, max_capacity: 500, min_price: 4000, max_price: 15000, url: "https://press.org", notes: "Great for policy events." },
    { city: "Washington DC", name: "Marriott Marquis DC", type: "Hotel", tier: "Standard", min_capacity: 50, max_capacity: 2500, min_price: 8000, max_price: 30000, url: "https://marriott.com", notes: "Convention center adjacent." },
    { city: "Washington DC", name: "Georgetown Conference Center", type: "University/campus", tier: "Budget", min_capacity: 25, max_capacity: 300, min_price: 2500, max_price: 8000, url: "https://conference.georgetown.edu", notes: "Academic discounts possible." },
    { city: "Washington DC", name: "GWU Marvin Center", type: "University/campus", tier: "Budget", min_capacity: 50, max_capacity: 400, min_price: 2000, max_price: 6000, url: "https://gwu.edu", notes: "Central location." },
    { city: "Washington DC", name: "MLK Library", type: "Government building", tier: "Budget", min_capacity: 25, max_capacity: 200, min_price: 1500, max_price: 4000, url: "https://dclibrary.org/mlk", notes: "Renovated 2020." },
  ],
  caterers: [
    { city: "Washington DC", name: "Ridgewells Catering", tier: "Premium", budget_pp: 85, standard_pp: 135, premium_pp: 200, url: "https://ridgewells.com", notes: "95+ years. Award-winning." },
    { city: "Washington DC", name: "Occasions Caterers", tier: "Premium", budget_pp: 75, standard_pp: 120, premium_pp: 180, url: "https://occasionscaterers.com", notes: "Custom menus." },
    { city: "Washington DC", name: "RSVP Catering", tier: "Standard", budget_pp: 50, standard_pp: 80, premium_pp: 120, url: "https://rsvpcatering.com", notes: "Corporate focus." },
    { city: "Washington DC", name: "CNF Catering", tier: "Budget", budget_pp: 35, standard_pp: 55, premium_pp: 85, url: "https://cnfcatering.com", notes: "Since 1986. Good value." },
  ],
  av_companies: [
    { city: "Washington DC", name: "Media Support Services", tier: "Standard", basic_day: 1800, standard_day: 4000, premium_day: 10000, url: "https://mssav.com", notes: "Since 1996." },
    { city: "Washington DC", name: "Electric Events DC", tier: "Standard", basic_day: 2000, standard_day: 5000, premium_day: 15000, url: "https://electriceventsdc.com", notes: "Full service." },
    { city: "Washington DC", name: "AV Universal", tier: "Budget", basic_day: 1000, standard_day: 2500, premium_day: 6000, url: "https://avuniversal.com", notes: "Good value." },
  ],
};

const SMART_DEFAULTS = {
  "Conference": { duration: "Full day", attendance: "100-250 (large)", venue_type: "Conference center", program_elements: ["Keynote speeches", "Panel discussions", "Networking time", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks", "Lunch", "Reception/Appetizers"], av_needs: ["Basic (mics, projector)", "Multiple screens", "Recording"], production_needs: ["Photographer", "Videographer"], collateral_needs: ["Event website", "Registration system", "Name badges", "Printed programs"] },
  "Workshop/Training": { duration: "Half day (4-5 hours)", attendance: "25-50 (small)", venue_type: "Conference center", program_elements: ["Workshops/trainings", "Breakout sessions", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks", "Lunch"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: ["Registration system", "Name badges"] },
  "Roundtable Discussion": { duration: "2-3 hours", attendance: "Under 25 (intimate)", venue_type: "Corporate office", program_elements: ["Panel discussions", "Networking time"], fnb_items: ["Coffee/Light Snacks"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: ["Name badges"] },
  "Summit": { duration: "Full day", attendance: "100-250 (large)", venue_type: "Hotel", program_elements: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Networking time"], fnb_items: ["Coffee/Light Snacks", "Breakfast", "Lunch", "Reception/Appetizers"], av_needs: ["Basic (mics, projector)", "Professional staging", "Recording"], production_needs: ["Photographer", "Videographer"], collateral_needs: ["Event website", "Registration system", "Name badges", "Swag/giveaways"] },
  "Reception/Networking": { duration: "2-3 hours", attendance: "50-100 (medium)", venue_type: "Museum/unique venue", program_elements: ["Networking time", "Entertainment"], fnb_items: ["Reception/Appetizers", "Alcohol service"], av_needs: ["Basic (mics, projector)"], production_needs: ["Photographer"], collateral_needs: ["Name badges"] },
  "Briefing/Presentation": { duration: "2-3 hours", attendance: "25-50 (small)", venue_type: "Corporate office", program_elements: ["Keynote speeches", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: [] },
  "Demo Day/Showcase": { duration: "Half day (4-5 hours)", attendance: "50-100 (medium)", venue_type: "Conference center", program_elements: ["Demos/showcases", "Networking time"], fnb_items: ["Coffee/Light Snacks", "Lunch"], av_needs: ["Basic (mics, projector)", "Multiple screens"], production_needs: ["Photographer", "Videographer"], collateral_needs: ["Event website", "Registration system", "Name badges"] },
};

const STORAGE_KEY = 'seedai-event-planner-save';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              HELPER FUNCTIONS                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const getSetupMultiplier = (duration) => {
  const m = { "2-3 hours": 1.5, "Half day (4-5 hours)": 1.5, "Full day": 1.5, "1.5 days": 1.33, "2 days": 1.25, "Multi-day (3+)": 1.2 };
  return m[duration] || 1.5;
};

const getVenueCostFromData = (vendors, location, venueType, attendance, scenario) => {
  const matching = (vendors.venues || [])
    .filter(v => v.city === location)
    .filter(v => !venueType || venueType === "Not sure yet" || v.type === venueType)
    .filter(v => attendance >= (v.min_capacity || 0) && attendance <= (v.max_capacity || 9999));
  
  if (matching.length === 0) return null;
  
  const byTier = { Budget: [], Standard: [], Premium: [] };
  matching.forEach(v => { if (byTier[v.tier]) byTier[v.tier].push(v); });
  
  let target = scenario === 'budget' ? (byTier.Budget.length ? byTier.Budget : byTier.Standard) :
               scenario === 'premium' ? (byTier.Premium.length ? byTier.Premium : byTier.Standard) :
               (byTier.Standard.length ? byTier.Standard : matching);
  
  if (target.length === 0) target = matching;
  
  const avgMin = target.reduce((s, v) => s + (v.min_price || 0), 0) / target.length;
  const avgMax = target.reduce((s, v) => s + (v.max_price || 0), 0) / target.length;
  
  return scenario === 'budget' ? avgMin : scenario === 'premium' ? avgMax : (avgMin + avgMax) / 2;
};

const calculateBudget = (responses, scenario, config, vendors = {}) => {
  const attendance = config.attendanceDefaults[responses.attendance] || 75;
  const baseDays = config.durationMultipliers[responses.duration] || 1;
  const venueDays = baseDays * getSetupMultiplier(responses.duration);
  const locationMult = config.locations[responses.location]?.multiplier || 1.0;
  const venueType = responses.venue_type || "Not sure yet";
  
  let costs = { venue: 0, foodBeverage: 0, avTechnical: 0, production: 0, collateral: 0, marketing: 0, staffing: 0 };
  
  const venueFromData = getVenueCostFromData(vendors, responses.location || "Washington DC", venueType, attendance, scenario);
  if (venueFromData) {
    costs.venue = venueFromData * venueDays * locationMult;
  } else {
    const vc = config.venueTypes[venueType] || config.venueTypes["Not sure yet"];
    costs.venue = Math.max((vc.perPerson[scenario] || 75) * attendance, vc.minSpend || 0) * venueDays * locationMult;
  }
  
  (responses.fnb_items || []).forEach(item => {
    const c = config.foodAndBeverage[item];
    if (c) costs.foodBeverage += (c[scenario] || c.standard) * attendance * baseDays * locationMult;
  });
  
  (responses.av_needs || []).forEach(item => {
    const c = config.avTechnical[item];
    if (c) costs.avTechnical += (c[scenario] || c.standard) * Math.ceil(baseDays * 1.25) * locationMult;
  });
  
  (responses.production_needs || []).forEach(item => {
    const c = config.production[item];
    if (c) costs.production += (c.perDay ? (c[scenario] || c.standard) * baseDays : (c[scenario] || c.standard)) * locationMult;
  });
  
  (responses.collateral_needs || []).forEach(item => {
    const c = config.collateral[item];
    if (c) costs.collateral += c.perPerson ? (c[scenario] || c.standard) * attendance : (c[scenario] || c.standard);
  });
  
  (responses.marketing_channels || []).forEach(item => {
    const c = config.marketing[item];
    if (c) costs.marketing += c[scenario] || c.standard;
  });
  
  costs.staffing = (config.staffing[scenario] || 2500) * venueDays * locationMult;
  
  const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
  const contingency = subtotal * (config.contingency[scenario] || 0.15);
  
  return { ...costs, subtotal, contingency, total: subtotal + contingency, attendance, baseDays, venueDays, location: responses.location || "Washington DC", locationMult, venueType, scenario, usedVenueData: !!venueFromData };
};

const generateTimeline = (eventDate, responses, config) => {
  if (!eventDate) return [];
  const date = new Date(eventDate);
  if (isNaN(date.getTime())) return [];
  const today = new Date();
  const weeksOut = Math.floor((date - today) / (7 * 24 * 60 * 60 * 1000));
  const leadTime = config.venueTypes[responses.venue_type]?.leadTime || 12;
  
  const milestones = [
    { weeks: Math.max(leadTime, 16), task: "Venue contract signed", icon: "🏛️" },
    { weeks: 14, task: "Keynote speakers confirmed", icon: "🎤" },
    { weeks: 12, task: "Program outline finalized", icon: "📋" },
    { weeks: 10, task: "Marketing campaign launched", icon: "📣" },
    { weeks: 8, task: "Registration opens", icon: "📝" },
    { weeks: 8, task: "Catering menu selected", icon: "🍽️" },
    { weeks: 6, task: "AV requirements confirmed", icon: "🎬" },
    { weeks: 4, task: "Collateral to print", icon: "📦" },
    { weeks: 2, task: "Final headcount to venue", icon: "🔢" },
    { weeks: 1, task: "Final walkthrough", icon: "✅" },
    { weeks: 0, task: "EVENT DAY!", icon: "🎉" },
  ];
  
  return milestones.filter(m => m.weeks <= weeksOut + 2).map(m => {
    const d = new Date(date);
    d.setDate(d.getDate() - (m.weeks * 7));
    const isPast = d < today;
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isUrgent = !isPast && d <= twoWeeksFromNow;
    return { ...m, date: d, isPast, isUrgent, weeksOut: m.weeks };
  }).sort((a, b) => a.date - b.date);
};

const analyzeRisks = (responses, config) => {
  const risks = [];
  const attendance = config.attendanceDefaults[responses.attendance] || 75;
  const eventDate = responses.target_date ? new Date(responses.target_date) : null;
  const weeksOut = eventDate ? Math.floor((eventDate - new Date()) / (7 * 24 * 60 * 60 * 1000)) : null;
  const leadTime = config.venueTypes[responses.venue_type]?.leadTime || 12;
  const location = config.locations[responses.location];
  
  if (weeksOut !== null && weeksOut < leadTime) {
    risks.push({ severity: "high", icon: "⏰", message: `${responses.venue_type || 'This venue type'} typically needs ${leadTime}+ weeks. You have ${weeksOut}.` });
  } else if (weeksOut !== null && weeksOut < 8) {
    risks.push({ severity: "high", icon: "⏰", message: `Only ${weeksOut} weeks out. Rush planning may add 15-25% to costs.` });
  }
  
  if (eventDate && location?.peakMonths?.includes(eventDate.getMonth() + 1)) {
    risks.push({ severity: "medium", icon: "📅", message: `Peak season in ${location.label}. Expect 20-30% higher costs.` });
  }
  
  if (responses.location === "Washington DC" && eventDate && [3, 4].includes(eventDate.getMonth() + 1)) {
    risks.push({ severity: "medium", icon: "🌸", message: "Cherry blossom season = premium hotel rates." });
  }
  
  if (responses.format === "Hybrid (in-person + virtual)") {
    risks.push({ severity: "medium", icon: "🖥️", message: "Hybrid events typically cost 30-40% more." });
  }
  
  if (responses.fnb_items?.includes("Alcohol service") && responses.venue_type === "Government building") {
    risks.push({ severity: "high", icon: "🍷", message: "Most government venues prohibit alcohol." });
  }
  
  return risks.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
};

// Sound system
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
    if (type === 'select') { osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(880, now + 0.05); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.1); }
    else if (type === 'navigate') { osc.frequency.setValueAtTime(330, now); gain.gain.setValueAtTime(0.08, now); osc.start(now); osc.stop(now + 0.05); }
    else if (type === 'complete') { osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1); osc.frequency.setValueAtTime(784, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.4); }
    else if (type === 'start') { osc.frequency.setValueAtTime(262, now); osc.frequency.setValueAtTime(330, now + 0.1); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.2); }
  }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}
const sound = new SoundSystem();

// Pixel Characters
const getCharacterSvg = (id, size = 48) => {
  const scale = size / 48;
  const chars = {
    stuart: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="4" y="0" width="2" height="1" fill="#2d2d2d"/><rect x="7" y="0" width="1" height="1" fill="#2d2d2d"/><rect x="10" y="0" width="2" height="1" fill="#2d2d2d"/><rect x="3" y="1" width="10" height="3" fill="#3d3d3d"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="3" y="5" width="4" height="3" fill="#1a1a1a"/><rect x="9" y="5" width="4" height="3" fill="#1a1a1a"/><rect x="4" y="6" width="2" height="1" fill="#87CEEB"/><rect x="10" y="6" width="2" height="1" fill="#87CEEB"/><rect x="5" y="8" width="6" height="2" fill="#9d8b7a"/><rect x="5" y="10" width="6" height="2" fill="#E8DCC8"/><rect x="3" y="12" width="10" height="4" fill="#1a1a1a"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>),
    austin: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="4" y="5" width="3" height="2" fill="#CD853F"/><rect x="9" y="5" width="3" height="2" fill="#CD853F"/><rect x="5" y="5" width="1" height="1" fill="#DEB887"/><rect x="10" y="5" width="1" height="1" fill="#DEB887"/><rect x="3" y="7" width="10" height="3" fill="#4A3728"/><rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/><rect x="3" y="11" width="10" height="5" fill="#1e3a5f"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>),
    anna: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="6" y="0" width="4" height="3" fill="#6B4423"/><rect x="3" y="3" width="10" height="1" fill="#5C4033"/><rect x="3" y="4" width="2" height="3" fill="#6B4423"/><rect x="11" y="4" width="2" height="3" fill="#6B4423"/><rect x="5" y="4" width="6" height="6" fill="#F5D0B0"/><rect x="6" y="6" width="1" height="1" fill="#4A3728"/><rect x="9" y="6" width="1" height="1" fill="#4A3728"/><rect x="3" y="6" width="1" height="1" fill="#FFD700"/><rect x="12" y="6" width="1" height="1" fill="#FFD700"/><rect x="7" y="8" width="2" height="1" fill="#E8A090"/><rect x="3" y="11" width="10" height="5" fill="#E07B8B"/><rect x="6" y="11" width="4" height="1" fill="#F5D0B0"/><rect x="4" y="16" width="8" height="2" fill="#2d3748"/><rect x="4" y="18" width="3" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="3" height="2" fill="#1a1a1a"/></svg>),
    josh: (<svg viewBox="0 0 16 20" width={48 * scale} height={60 * scale} style={{ imageRendering: 'pixelated' }}><rect x="3" y="0" width="10" height="4" fill="#5C4033"/><rect x="5" y="1" width="2" height="1" fill="#6B4423"/><rect x="9" y="1" width="2" height="1" fill="#6B4423"/><rect x="4" y="4" width="8" height="6" fill="#E8C4A0"/><rect x="4" y="5" width="3" height="2" fill="#8B7355"/><rect x="9" y="5" width="3" height="2" fill="#8B7355"/><rect x="4" y="8" width="8" height="1" fill="#3d3d3d"/><rect x="7" y="9" width="2" height="1" fill="#D4A090"/><rect x="5" y="10" width="6" height="1" fill="#FFFFFF"/><rect x="3" y="11" width="10" height="5" fill="#6B7280"/><rect x="4" y="16" width="3" height="2" fill="#2d3748"/><rect x="9" y="16" width="3" height="2" fill="#2d3748"/><rect x="3" y="18" width="4" height="2" fill="#1a1a1a"/><rect x="9" y="18" width="4" height="2" fill="#1a1a1a"/></svg>)
  };
  return chars[id] || null;
};

const PixelChar = ({ selected, onClick, id }) => {
  const names = { stuart: "Stuart", austin: "Austin", anna: "Anna", josh: "Josh" };
  const titles = { stuart: "The Visionary", austin: "The Strategist", anna: "The Coordinator", josh: "The Analyst" };
  return (
    <div onClick={onClick} className={`cursor-pointer transition-all ${selected ? 'scale-110' : 'hover:scale-105'}`}>
      <div className={`p-3 border-4 ${selected ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 bg-slate-800'}`}>{getCharacterSvg(id, 56)}</div>
      <div className={`text-center mt-2 ${selected ? 'text-yellow-400' : 'text-slate-400'}`}>
        <div className="text-sm font-bold">{names[id]}</div>
        <div className="text-xs opacity-75">{titles[id]}</div>
      </div>
    </div>
  );
};

const charNames = { stuart: "Stuart", austin: "Austin", anna: "Anna", josh: "Josh" };

// UI Components
const Btn = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const v = { 
    primary: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white", 
    secondary: "bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200", 
    success: "bg-green-600 hover:bg-green-500 border-green-400 text-white", 
    warning: "bg-yellow-500 hover:bg-yellow-400 border-yellow-300 text-slate-900",
    purple: "bg-purple-600 hover:bg-purple-500 border-purple-400 text-white"
  };
  return (
    <button onClick={(e) => { sound.play('navigate'); onClick?.(e); }} disabled={disabled} 
      className={`px-4 py-3 font-mono font-bold uppercase text-sm border-4 transition-all disabled:opacity-50 active:translate-y-1 ${v[variant]} ${className}`} 
      style={{ boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
      {children}
    </button>
  );
};

const ProgressBar = ({ current, total, label, characterId }) => {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="font-mono">
      <div className="flex justify-between text-sm text-slate-400 mb-2"><span>{label}</span><span>{pct}%</span></div>
      <div className="relative">
        <div className="flex gap-1 h-8">{[...Array(10)].map((_, i) => (<div key={i} className={`flex-1 border-2 ${i < Math.round((current / total) * 10) ? 'bg-green-400 border-green-300' : 'bg-slate-800 border-slate-600'}`}/>))}</div>
        <div className="absolute top-1/2 transition-all duration-300" style={{ left: `${Math.min(pct, 95)}%`, transform: 'translate(-50%, -50%)' }}>{getCharacterSvg(characterId, 32)}</div>
      </div>
    </div>
  );
};

const Checkbox = ({ options, selected = [], onChange }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {options.map(o => (
      <button key={o} onClick={() => { sound.play('select'); onChange(selected.includes(o) ? selected.filter(x => x !== o) : [...selected, o]); }}
        className={`p-3 sm:p-4 text-left border-4 flex items-center gap-2 transition-all ${selected.includes(o) ? 'border-yellow-400 bg-slate-700 text-yellow-400' : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-slate-500'}`}>
        <span className="text-lg">{selected.includes(o) ? '☑' : '☐'}</span>
        <span className="flex-1">{o}</span>
      </button>
    ))}
  </div>
);

const programs = [
  { id: 'ai-across-america', name: 'AI Across America', icon: '🇺🇸' },
  { id: 'accelerate-science', name: 'Accelerate Science Now', icon: '🔬' },
  { id: 'ai-primers', name: 'AI Primers', icon: '📚' },
  { id: 'fysa', name: 'FYSA', icon: '📋' },
  { id: 'policy', name: 'Policy Engagement', icon: '🏛️' },
  { id: 'other', name: 'Other Initiative', icon: '✨' }
];

// Timeline Component - More prominent display
const TimelineView = ({ responses, budgetConfig }) => {
  const timeline = generateTimeline(responses.target_date, responses, budgetConfig);
  
  if (timeline.length === 0) {
    return (
      <div className="border-4 border-slate-600 bg-slate-800 p-5 mb-5 rounded">
        <div className="flex items-center gap-3 text-slate-400 mb-3">
          <Calendar size={24}/> <span className="text-lg font-bold">PLANNING TIMELINE</span>
        </div>
        <p className="text-slate-500">Set a target date in Phase 4 to generate your planning timeline with key milestones.</p>
      </div>
    );
  }
  
  const eventDate = new Date(responses.target_date);
  const today = new Date();
  const daysUntil = Math.ceil((eventDate - today) / (24 * 60 * 60 * 1000));
  
  return (
    <div className="border-4 border-cyan-500 bg-slate-800 p-5 mb-5 rounded">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 text-cyan-400">
          <Calendar size={24}/> <span className="text-lg font-bold">PLANNING TIMELINE</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-sm text-cyan-300">{daysUntil > 0 ? `${daysUntil} days away` : daysUntil === 0 ? "TODAY!" : `${Math.abs(daysUntil)} days ago`}</div>
        </div>
      </div>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {timeline.map((m, i) => (
          <div key={i} className={`flex items-center gap-4 p-3 rounded border-l-4 ${
            m.isPast ? 'bg-green-900/30 border-green-500 text-green-400' : 
            m.weeksOut === 0 ? 'bg-yellow-900/40 border-yellow-400 text-yellow-300 font-bold text-lg' :
            m.isUrgent ? 'bg-orange-900/30 border-orange-500 text-orange-300' : 
            'bg-slate-700/50 border-slate-500 text-slate-200'
          }`}>
            <span className="text-xl w-8">{m.icon}</span>
            <span className="flex-1">{m.task}</span>
            <span className={`text-sm w-24 text-right ${m.isPast ? 'text-green-500' : 'text-slate-400'}`}>
              {m.isPast ? (
                <span className="flex items-center justify-end gap-1"><CheckCircle size={16}/> Done</span>
              ) : (
                m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Risk Flags Component
const RiskFlags = ({ responses, budgetConfig }) => {
  const risks = analyzeRisks(responses, budgetConfig);
  if (risks.length === 0) return null;
  
  const colors = { 
    high: "border-red-500 bg-red-900/30 text-red-300", 
    medium: "border-yellow-500 bg-yellow-900/30 text-yellow-300", 
    low: "border-blue-500 bg-blue-900/30 text-blue-300" 
  };
  
  return (
    <div className="border-4 border-orange-500 bg-slate-800 p-5 mb-5 rounded">
      <div className="flex items-center gap-3 text-orange-400 mb-4">
        <AlertTriangle size={24}/> <span className="text-lg font-bold">RISK FLAGS</span>
        <span className="text-sm bg-orange-600 px-2 py-1 rounded text-white">{risks.length}</span>
      </div>
      <div className="space-y-3">
        {risks.map((r, i) => (
          <div key={i} className={`p-4 border-l-4 rounded ${colors[r.severity]}`}>
            <span className="mr-3 text-lg">{r.icon}</span>{r.message}
          </div>
        ))}
      </div>
    </div>
  );
};

// Venue Recommendations (Inline, prominent)
const VenueRecommendations = ({ vendors, responses, budgetConfig }) => {
  const location = responses.location || "Washington DC";
  const attendance = budgetConfig.attendanceDefaults[responses.attendance] || 75;
  const venueType = responses.venue_type;
  
  const venues = (vendors.venues || [])
    .filter(v => v.city === location)
    .filter(v => !venueType || venueType === "Not sure yet" || v.type === venueType)
    .filter(v => attendance >= (v.min_capacity || 0) && attendance <= (v.max_capacity || 9999))
    .slice(0, 4);
  
  if (venues.length === 0) return null;
  
  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();
  const tierColors = { Budget: 'bg-green-600', Standard: 'bg-blue-600', Premium: 'bg-purple-600' };
  
  return (
    <div className="mb-5">
      <div className="text-slate-300 mb-3 font-bold flex items-center gap-2">
        🏛️ RECOMMENDED VENUES
        <span className="text-sm text-slate-500 font-normal">({venues.length} matches)</span>
      </div>
      <div className="space-y-3">
        {venues.map((v, i) => (
          <div key={i} className="border-2 border-slate-600 bg-slate-900 p-4 rounded flex justify-between items-start hover:border-slate-500 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-200">{v.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${tierColors[v.tier]} text-white`}>{v.tier}</span>
              </div>
              <div className="text-sm text-slate-400">{formatMoney(v.min_price)} - {formatMoney(v.max_price)}/day</div>
              {v.notes && <div className="text-sm text-slate-500 mt-1">{v.notes}</div>}
            </div>
            {v.url && (
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 p-2 ml-2">
                <ExternalLink size={20}/>
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="text-sm text-slate-600 mt-3">💡 Prices are daily rates. Always verify directly with venues.</div>
    </div>
  );
};

// Budget Scenarios Component
const BudgetScenarios = ({ responses, budgetConfig, vendors, onAiRefine, aiEstimate, aiLoading }) => {
  const [selected, setSelected] = useState('standard');
  const scenarios = {
    budget: calculateBudget(responses, 'budget', budgetConfig, vendors),
    standard: calculateBudget(responses, 'standard', budgetConfig, vendors),
    premium: calculateBudget(responses, 'premium', budgetConfig, vendors)
  };
  const b = scenarios[selected];
  const fmt = (n) => '$' + Math.round(n).toLocaleString();
  
  const cats = [
    { key: 'venue', label: 'Venue', icon: '🏛️' },
    { key: 'foodBeverage', label: 'Food & Bev', icon: '🍽️' },
    { key: 'avTechnical', label: 'AV/Tech', icon: '🎤' },
    { key: 'production', label: 'Production', icon: '📸' },
    { key: 'collateral', label: 'Collateral', icon: '📦' },
    { key: 'marketing', label: 'Marketing', icon: '📣' },
    { key: 'staffing', label: 'Staffing', icon: '👥' },
  ].filter(c => scenarios.standard[c.key] > 0);
  
  const hasData = cats.length > 0;
  
  return (
    <div className="border-4 border-green-500 bg-slate-800 p-5 mb-5 rounded">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 text-green-400">
          <Calculator size={24}/> <span className="text-lg font-bold">BUDGET ESTIMATE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin size={16}/> {budgetConfig.locations[b.location]?.label || b.location}
        </div>
      </div>
      
      <div className="text-slate-300 mb-2">{b.attendance} attendees • {b.baseDays} event day(s)</div>
      <div className="text-sm text-slate-500 mb-4">⏱️ Includes {(b.venueDays - b.baseDays).toFixed(1)} day(s) for setup/breakdown</div>
      
      {b.usedVenueData && (
        <div className="text-sm text-green-400 bg-green-900/30 p-3 rounded mb-4 flex items-center gap-2">
          <CheckCircle size={16}/> Using real venue pricing data
        </div>
      )}
      
      {/* Scenario Tabs - Larger tap targets */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { id: 'budget', label: '💰 Budget', desc: 'Value tier' }, 
          { id: 'standard', label: '⭐ Standard', desc: 'Mid-tier' }, 
          { id: 'premium', label: '✨ Premium', desc: 'Top-tier' }
        ].map(s => (
          <button key={s.id} onClick={() => { sound.play('select'); setSelected(s.id); }}
            className={`p-4 border-4 text-center transition-all ${selected === s.id ? 'border-green-400 bg-green-900/40 text-green-300 scale-105' : 'border-slate-600 bg-slate-900 text-slate-400 hover:border-slate-500'}`}>
            <div className="text-base font-bold">{s.label}</div>
            <div className="text-xs opacity-70 mt-1">{s.desc}</div>
          </button>
        ))}
      </div>
      
      {hasData ? (
        <>
          {/* Budget Table - Improved readability */}
          <div className="mb-5 bg-slate-900 rounded p-4">
            <div className="grid grid-cols-4 gap-3 mb-3 text-slate-500 text-sm font-bold">
              <div>Category</div><div className="text-right">Budget</div><div className="text-right">Standard</div><div className="text-right">Premium</div>
            </div>
            {cats.map(c => (
              <div key={c.key} className="grid grid-cols-4 gap-3 py-3 border-t border-slate-700">
                <div className="text-slate-200 flex items-center gap-2"><span>{c.icon}</span> {c.label}</div>
                <div className={`text-right ${selected === 'budget' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{fmt(scenarios.budget[c.key])}</div>
                <div className={`text-right ${selected === 'standard' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{fmt(scenarios.standard[c.key])}</div>
                <div className={`text-right ${selected === 'premium' ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{fmt(scenarios.premium[c.key])}</div>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-3 py-4 border-t-2 border-green-500 mt-2">
              <div className="text-green-400 font-bold text-lg">TOTAL</div>
              <div className={`text-right text-lg ${selected === 'budget' ? 'text-green-400 font-bold' : 'text-slate-400'}`}>{fmt(scenarios.budget.total)}</div>
              <div className={`text-right text-lg ${selected === 'standard' ? 'text-green-400 font-bold' : 'text-slate-400'}`}>{fmt(scenarios.standard.total)}</div>
              <div className={`text-right text-lg ${selected === 'premium' ? 'text-green-400 font-bold' : 'text-slate-400'}`}>{fmt(scenarios.premium.total)}</div>
            </div>
          </div>
          
          {/* Venue Recommendations */}
          <VenueRecommendations vendors={vendors} responses={responses} budgetConfig={budgetConfig} />
          
          {/* AI Refinement */}
          <div className="border-t-2 border-slate-700 pt-5 mt-5">
            <button onClick={onAiRefine} disabled={aiLoading}
              className={`w-full p-4 border-4 flex items-center justify-center gap-3 transition-all ${aiLoading ? 'border-purple-500 bg-purple-900/40 text-purple-300' : 'border-purple-500 bg-slate-900 text-purple-400 hover:bg-purple-900/30'} disabled:opacity-50`}>
              {aiLoading ? (<><Loader size={20} className="animate-spin"/> Searching live market data...</>) : (<><Zap size={20}/> Refine with AI (live web search)</>)}
            </button>
            {aiEstimate && (
              <div className="mt-4 p-4 bg-purple-900/30 border-2 border-purple-500/50 rounded">
                <div className="text-purple-400 font-bold mb-3 flex items-center gap-2"><Sparkles size={18}/> AI INSIGHTS</div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">{aiEstimate}</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-center py-8">Complete earlier phases to see budget estimates</div>
      )}
    </div>
  );
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              MAIN APP                                       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

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
  const [aiEstimate, setAiEstimate] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSmartDefaults, setShowSmartDefaults] = useState(null);
  const [appliedDefaults, setAppliedDefaults] = useState(false);
  const [budgetConfig] = useState(DEFAULT_BUDGET_CONFIG);
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [dataSource, setDataSource] = useState('default');

  // Load from Google Sheets
  useEffect(() => {
    const loadData = async () => {
      if (SHEET_ID === 'YOUR_SHEET_ID_HERE') return;
      try {
        const [v, c, a] = await Promise.all([fetchSheetData('venues'), fetchSheetData('caterers'), fetchSheetData('av_companies')]);
        if (v || c || a) {
          setVendors({ venues: v || DEFAULT_VENDORS.venues, caterers: c || DEFAULT_VENDORS.caterers, av_companies: a || DEFAULT_VENDORS.av_companies });
          setDataSource('sheets');
        }
      } catch (e) { console.log('Using defaults'); }
    };
    loadData();
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.responses && Object.keys(data.responses).length > 0) setHasSave(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (screen === 'play' || screen === 'export') {
      const timer = setTimeout(() => saveProgress(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [responses, needsInput, notes, team, char, program, phase, screen]);

  useEffect(() => { const i = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(i); }, []);

  useEffect(() => {
    if (responses.event_type && SMART_DEFAULTS[responses.event_type] && !appliedDefaults) setShowSmartDefaults(responses.event_type);
  }, [responses.event_type, appliedDefaults]);

  const phases = [
    { id: 1, name: "THE SPARK", icon: "💡", subtitle: "What's the big idea?", questions: [
      { id: "event_name", label: "What would you call this event?", type: "text", placeholder: "Working title..." },
      { id: "spark", label: "What's the spark? The problem or opportunity?", type: "textarea", placeholder: "What made you think 'we need an event'?" },
      { id: "success_headline", label: "Imagine success. What's the headline?", type: "textarea", placeholder: "Dream big!" },
      { id: "why_event", label: "Why is an event the right format?", type: "textarea", placeholder: "vs. report, webinar, etc." },
      { id: "seedai_alignment", label: "How does this connect to SeedAI's mission?", type: "textarea", placeholder: "Try It, Prove It, Scale It..." },
      { id: "success_metrics", label: "How will you measure success?", type: "textarea", placeholder: "Goals, metrics..." },
      { id: "funding_sources", label: "Potential funding sources?", type: "checkbox", options: ["Organizational budget", "Sponsorships", "Grants", "Registration fees", "Partner contributions", "In-kind support", "TBD"] },
    ]},
    { id: 2, name: "THE PEOPLE", icon: "👥", subtitle: "Who needs to be there?", questions: [
      { id: "target_audience", label: "Who is your target audience?", type: "checkbox", options: ["Policymakers", "Congressional Staffers", "Federal Agency Staff", "State/Local Officials", "Private Sector Executives", "Researchers/Academics", "Students", "Nonprofit Leaders", "Media/Press", "General Public"] },
      { id: "audience_detail", label: "Who MUST be there for success?", type: "textarea", placeholder: "Be specific..." },
      { id: "attendance", label: "Expected attendance?", type: "select", options: Object.keys(budgetConfig.attendanceDefaults) },
      { id: "partners", label: "Target partners or co-hosts?", type: "textarea", placeholder: "Organizations..." },
      { id: "vips", label: "Dream speakers or VIPs?", type: "textarea", placeholder: "Who would make this amazing?" },
      { id: "registration_type", label: "How will people get access?", type: "select", options: ["Open registration", "Invitation only", "Application/curated", "Ticketed (paid)", "Hybrid approach"] }
    ]},
    { id: 3, name: "THE EXPERIENCE", icon: "🎯", subtitle: "What will people do?", questions: [
      { id: "event_type", label: "What type of event?", type: "select", options: Object.keys(SMART_DEFAULTS) },
      { id: "duration", label: "How long?", type: "select", options: Object.keys(budgetConfig.durationMultipliers) },
      { id: "format", label: "Format?", type: "select", options: ["In-person only", "Virtual only", "Hybrid (in-person + virtual)"] },
      { id: "anchor_moments", label: "2-3 'anchor moments' that define this event?", type: "textarea", placeholder: "The highlights..." },
      { id: "program_elements", label: "What program elements?", type: "checkbox", options: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Workshops/trainings", "Demos/showcases", "Networking time", "Fireside chats", "Q&A sessions", "Awards/recognition", "Entertainment"] },
      { id: "takeaway", label: "What should attendees walk away with?", type: "textarea", placeholder: "Knowledge, connections..." }
    ]},
    { id: 4, name: "THE DETAILS", icon: "📍", subtitle: "Where, when, how?", questions: [
      { id: "target_date", label: "Target date?", type: "date", placeholder: "YYYY-MM-DD" },
      { id: "date_drivers", label: "What's driving the date?", type: "textarea", placeholder: "Calendar, timing..." },
      { id: "location", label: "Where should this be held?", type: "select", options: Object.keys(budgetConfig.locations) },
      { id: "venue_type", label: "What type of venue?", type: "select", options: Object.keys(budgetConfig.venueTypes) },
      { id: "space_needs", label: "What spaces do you need?", type: "checkbox", options: ["Main plenary room", "Breakout rooms", "Demo/exhibit area", "VIP/green room", "Registration area", "Networking lounge", "Press room", "Dining space"] },
      { id: "fnb_items", label: "Food & beverage needed?", type: "checkbox", options: Object.keys(budgetConfig.foodAndBeverage) },
    ]},
    { id: 5, name: "PRODUCTION", icon: "🎬", subtitle: "Tech & content", questions: [
      { id: "av_needs", label: "AV & technical needs?", type: "checkbox", options: Object.keys(budgetConfig.avTechnical) },
      { id: "production_needs", label: "Production services?", type: "checkbox", options: Object.keys(budgetConfig.production) },
      { id: "collateral_needs", label: "Event collateral?", type: "checkbox", options: Object.keys(budgetConfig.collateral) },
      { id: "marketing_channels", label: "Marketing channels?", type: "checkbox", options: Object.keys(budgetConfig.marketing) },
    ]},
    { id: 6, name: "THE PLAN", icon: "🚀", subtitle: "Budget & timeline", questions: [], isOutputPhase: true }
  ];

  const applySmartDefaults = () => {
    const d = SMART_DEFAULTS[responses.event_type];
    if (!d) return;
    sound.play('complete');
    setResponses(prev => ({ ...prev, ...d }));
    setAppliedDefaults(true);
    setShowSmartDefaults(null);
    setStatus('Smart defaults applied!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleAiRefine = async () => {
    setAiLoading(true); setAiEstimate(null);
    const b = calculateBudget(responses, 'standard', budgetConfig, vendors);
    
    // Check if API key is configured
    const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setAiEstimate('⚙️ AI refinement requires API setup.\n\nTo enable:\n1. Get an API key from console.anthropic.com\n2. Add REACT_APP_ANTHROPIC_API_KEY to your Vercel environment variables\n3. Redeploy\n\nCost: ~$0.01-0.05 per refinement');
      setAiLoading(false);
      return;
    }
    
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', 
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', 
          max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: `Research current event costs: ${responses.event_name || 'Conference'} in ${b.location}, ${b.attendance} attendees, ${b.baseDays} days, ${b.venueType}. Estimate: $${Math.round(b.total).toLocaleString()}. Provide: 1) Is estimate reasonable? 2) Specific venue suggestions with current prices 3) Cost-saving tips. Be concise, under 150 words.` }]
        })
      });
      const data = await res.json();
      if (data.error) {
        setAiEstimate(`⚠️ API Error: ${data.error.message || 'Unknown error'}`);
      } else {
        setAiEstimate(data.content?.map(c => c.type === 'text' ? c.text : '').join('') || 'No response received.');
        sound.play('complete');
      }
    } catch (e) { 
      setAiEstimate('⚠️ Could not connect. Check your API key and network connection.'); 
    }
    setAiLoading(false);
  };

  const saveProgress = (silent = false) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ char, program, phase, responses, needsInput, notes, team, appliedDefaults, savedAt: new Date().toISOString() }));
      if (!silent) { sound.play('select'); setStatus('Saved!'); setTimeout(() => setStatus(''), 2000); }
    } catch (e) {}
  };

  const loadProgress = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        setChar(d.char); setProgram(d.program); setPhase(d.phase || 0);
        setResponses(d.responses || {}); setNeedsInput(d.needsInput || {}); setNotes(d.notes || {}); setTeam(d.team || []);
        setAppliedDefaults(d.appliedDefaults || false);
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

  const update = (id, val) => { setResponses(p => ({ ...p, [id]: val })); setAiEstimate(null); if (id === 'event_type') setAppliedDefaults(false); };
  const addMember = () => { if (newMember.name) { sound.play('select'); setTeam([...team, { ...newMember, id: Date.now() }]); setNewMember({ name: '', role: '' }); }};

  const getProgress = (idx) => {
    const p = phases[idx];
    return { done: p.questions.filter(q => q.type === 'checkbox' ? responses[q.id]?.length > 0 : responses[q.id]?.toString().trim() || needsInput[q.id]).length, total: p.questions.length };
  };
  
  const totalProgress = () => {
    let t = 0, d = 0;
    phases.forEach(p => p.questions.forEach(q => { t++; if (q.type === 'checkbox' ? (responses[q.id]?.length > 0 || needsInput[q.id]) : (responses[q.id]?.toString().trim() || needsInput[q.id])) d++; }));
    return { done: d, total: t };
  };

  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();

  const exportText = () => {
    const b = calculateBudget(responses, 'standard', budgetConfig, vendors);
    const bLow = calculateBudget(responses, 'budget', budgetConfig, vendors);
    const bHigh = calculateBudget(responses, 'premium', budgetConfig, vendors);
    const timeline = generateTimeline(responses.target_date, responses, budgetConfig);
    const risks = analyzeRisks(responses, budgetConfig);
    
    let t = `# EVENT PROPOSAL: ${responses.event_name || 'Untitled'}\n\n`;
    t += `**Program:** ${programs.find(p => p.id === program)?.name || 'Not selected'}\n`;
    t += `**Owner:** ${charNames[char] || 'Not selected'}\n`;
    t += `**Location:** ${budgetConfig.locations[b.location]?.label || b.location}\n`;
    t += `**Date:** ${responses.target_date || 'TBD'}\n`;
    t += `**Budget Range:** ${formatMoney(bLow.total)} - ${formatMoney(bHigh.total)}\n\n`;
    
    if (team.length) { t += `## Team\n`; team.forEach(m => t += `- **${m.name}** — ${m.role || 'TBD'}\n`); t += '\n'; }
    if (risks.length) { t += `## ⚠️ Risk Flags\n`; risks.forEach(r => t += `- ${r.icon} ${r.message}\n`); t += '\n'; }
    if (timeline.length) { t += `## 📅 Timeline\n`; timeline.filter(m => !m.isPast).forEach(m => t += `- **${m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}** — ${m.icon} ${m.task}\n`); t += '\n'; }
    
    phases.forEach(p => {
      t += `## ${p.icon} ${p.name}\n`;
      p.questions.forEach(q => {
        const r = q.type === 'checkbox' ? responses[q.id]?.join(', ') : responses[q.id];
        if (r?.toString().trim() || (q.type === 'checkbox' && r?.length)) t += `**${q.label}**\n${r}\n\n`;
      });
    });
    
    t += `## 💰 Budget Estimate\n`;
    t += `| Scenario | Total |\n|----------|-------|\n`;
    t += `| Budget | ${formatMoney(bLow.total)} |\n| Standard | ${formatMoney(b.total)} |\n| Premium | ${formatMoney(bHigh.total)} |\n\n`;
    if (aiEstimate) t += `### AI Analysis\n${aiEstimate}\n\n`;
    return t;
  };

  const copy = async () => { await navigator.clipboard.writeText(exportText()); sound.play('complete'); setStatus('Copied!'); setTimeout(() => setStatus(''), 2000); };
  const email = () => { window.open(`mailto:operations@seedai.org?subject=${encodeURIComponent(`${responses.event_name || 'Event'} - Proposal`)}&body=${encodeURIComponent(exportText())}`); };
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/plain' })); a.download = `${responses.event_name || 'event'}-proposal.md`; a.click(); sound.play('complete'); };

  // ══════════════════════════════════════════════════════════════════════════
  // SCREENS
  // ══════════════════════════════════════════════════════════════════════════

  if (screen === 'title') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 p-2">{soundOn ? <Volume2 size={24}/> : <VolumeX size={24}/>}</button>
      <div className="text-center max-w-sm">
        <h1 className="text-5xl font-bold text-blue-400 mb-2" style={{ textShadow: '4px 4px 0 #1e3a8a' }}>SeedAI</h1>
        <h2 className="text-2xl text-yellow-400 mb-6" style={{ textShadow: '2px 2px 0 #92400e' }}>EVENT PLANNER</h2>
        <p className="text-slate-400 text-sm mb-2">Smart defaults • Budget scenarios • Vendor recommendations</p>
        <p className="text-slate-600 text-xs mb-8">Data: {dataSource === 'sheets' ? '📊 Google Sheets' : '💾 Built-in'}</p>
        <div className={`text-white text-lg mb-8 ${blink ? '' : 'opacity-0'}`}>PRESS START</div>
        <div className="flex flex-col gap-3 items-center">
          <Btn onClick={() => { sound.play('start'); clearSave(); setScreen('character'); }} variant="warning" className="w-48">NEW EVENT</Btn>
          {hasSave && (<Btn onClick={loadProgress} variant="success" className="w-48"><RotateCcw size={14} className="inline mr-2"/> CONTINUE</Btn>)}
        </div>
      </div>
    </div>
  );

  if (screen === 'character') return (
    <div className="min-h-screen bg-slate-900 p-6 font-mono">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl text-yellow-400 mb-2">WHO'S LEADING THIS?</h2>
        <p className="text-slate-400 text-sm mb-6">Select yourself as Event Owner</p>
        <div className="flex justify-center gap-4 flex-wrap mb-8">{['stuart', 'austin', 'anna', 'josh'].map(c => (<PixelChar key={c} id={c} selected={char === c} onClick={() => { sound.play('select'); setChar(c); }}/>))}</div>
        <div className="flex justify-center gap-4">
          <Btn onClick={() => setScreen('title')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('program')} disabled={!char} variant="success">CONTINUE →</Btn>
        </div>
      </div>
    </div>
  );

  if (screen === 'program') return (
    <div className="min-h-screen bg-slate-900 p-6 font-mono">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl text-yellow-400 mb-6 text-center">SELECT PROGRAM</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {programs.map(p => (<button key={p.id} onClick={() => { sound.play('select'); setProgram(p.id); }} className={`p-4 border-4 text-left ${program === p.id ? 'border-yellow-400 bg-slate-700 text-yellow-400' : 'border-slate-600 bg-slate-800 text-slate-300'}`}><span className="text-2xl mr-2">{p.icon}</span><span className="text-sm">{p.name}</span></button>))}
        </div>
        <div className="flex justify-center gap-4">
          <Btn onClick={() => setScreen('character')} variant="secondary">← BACK</Btn>
          <Btn onClick={() => setScreen('play')} disabled={!program} variant="success">START →</Btn>
        </div>
      </div>
    </div>
  );

  if (screen === 'export') {
    const total = totalProgress();
    return (
      <div className="min-h-screen bg-slate-900 p-4 sm:p-6 font-mono overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-2xl text-yellow-400">PROPOSAL READY</h2>
            <p className="text-slate-400 text-sm mt-1">{total.done}/{total.total} questions completed</p>
          </div>
          
          <TimelineView responses={responses} budgetConfig={budgetConfig} />
          <RiskFlags responses={responses} budgetConfig={budgetConfig} />
          <BudgetScenarios responses={responses} budgetConfig={budgetConfig} vendors={vendors} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
          
          <div className="border-4 border-blue-500 bg-slate-800 p-4 mb-4">
            <div className="text-blue-400 text-base font-bold mb-3">SHARE PROPOSAL</div>
            <div className="grid grid-cols-3 gap-3">
              <Btn onClick={copy} variant="primary" className="w-full"><Share2 size={14} className="inline mr-1"/>COPY</Btn>
              <Btn onClick={email} variant="warning" className="w-full"><Mail size={14} className="inline mr-1"/>EMAIL</Btn>
              <Btn onClick={download} variant="success" className="w-full"><Download size={14} className="inline mr-1"/>SAVE</Btn>
            </div>
            {status && <div className="text-center text-green-400 text-sm mt-3">{status}</div>}
          </div>
          
          <div className="flex justify-center gap-4">
            <Btn onClick={() => setScreen('play')} variant="secondary">← EDIT</Btn>
            <Btn onClick={() => { clearSave(); setScreen('title'); }} variant="primary">NEW EVENT</Btn>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PLAY SCREEN
  const p = phases[phase];
  const prog = getProgress(phase);
  const total = totalProgress();
  const isLastPhase = phase === phases.length - 1;

  return (
    <div className="min-h-screen bg-slate-900 font-mono">
      {/* Header */}
      <div className="bg-slate-800 border-b-4 border-slate-700 p-3 sm:p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{programs.find(x => x.id === program)?.icon}</span>
              <div>
                <div className="text-blue-400 text-sm font-bold">EVENT PLANNER</div>
                <div className="text-slate-500 text-xs">{charNames[char]}</div>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="text-slate-500 hover:text-slate-300 p-2">{soundOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
              <Btn onClick={() => saveProgress()} variant="secondary" className="text-xs py-2 px-3"><Save size={12} className="inline mr-1"/>SAVE</Btn>
              <Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success" className="text-xs py-2 px-3"><Sparkles size={12} className="inline mr-1"/>EXPORT</Btn>
            </div>
          </div>
          <ProgressBar current={total.done} total={total.total} label="PROGRESS" characterId={char} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        {/* Phase Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {phases.map((x, i) => {
            const pr = getProgress(i);
            return (<button key={x.id} onClick={() => { sound.play('navigate'); setPhase(i); }} className={`px-3 py-2 border-4 text-sm whitespace-nowrap flex-shrink-0 ${i === phase ? 'border-yellow-400 bg-slate-700 text-yellow-400' : pr.done === pr.total && pr.total > 0 ? 'border-green-500 bg-slate-800 text-green-400' : 'border-slate-600 bg-slate-800 text-slate-400'}`}>{x.icon} <span className="hidden sm:inline ml-1">{x.name}</span></button>);
          })}
        </div>

        {/* Smart Defaults Banner */}
        {showSmartDefaults && phase === 2 && (
          <div className="border-4 border-purple-500 bg-purple-900/20 p-4 mb-4">
            <div className="flex items-center gap-2 text-purple-400 mb-2"><Lightbulb size={20}/> <span className="font-bold">SMART DEFAULTS</span></div>
            <p className="text-sm text-slate-300 mb-3">Apply typical settings for <span className="text-purple-400 font-bold">{responses.event_type}</span>?</p>
            <div className="flex gap-3">
              <Btn onClick={applySmartDefaults} variant="purple" className="flex-1"><Sparkles size={14} className="inline mr-1"/> Apply Defaults</Btn>
              <Btn onClick={() => setShowSmartDefaults(null)} variant="secondary" className="flex-1">Skip</Btn>
            </div>
          </div>
        )}

        {/* Main Content Card */}
        <div className="border-4 border-blue-500 bg-slate-800 mb-4 rounded">
          <div className="bg-blue-600 p-4 sm:p-5 border-b-4 border-blue-500">
            <div className="text-sm text-blue-200">PHASE {p.id} OF {phases.length}</div>
            <h2 className="text-xl sm:text-2xl text-white">{p.icon} {p.name}</h2>
            <div className="text-sm sm:text-base text-blue-200">{p.subtitle}</div>
          </div>

          {/* Team Section (Phase 1) */}
          {phase === 0 && (
            <div className="p-4 sm:p-5 border-b-4 border-slate-700">
              <div className="text-yellow-400 mb-3 flex items-center gap-2"><Users size={18}/> <span className="font-bold">PLANNING TEAM</span></div>
              <div className="text-slate-400 mb-3">Owner: <span className="text-yellow-400 font-bold">{charNames[char]}</span></div>
              {team.length > 0 && (<div className="space-y-2 mb-3">{team.map(m => (<div key={m.id} className="flex justify-between items-center bg-slate-900 p-3 border-2 border-slate-700 text-slate-300">{m.name} {m.role && `— ${m.role}`}<button onClick={() => setTeam(team.filter(x => x.id !== m.id))} className="text-red-400 p-1"><X size={16}/></button></div>))}</div>)}
              <div className="flex gap-2">
                <input value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="flex-1 p-3 bg-slate-900 border-2 border-slate-600 text-slate-200" placeholder="Name"/>
                <input value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="flex-1 p-3 bg-slate-900 border-2 border-slate-600 text-slate-200" placeholder="Role"/>
                <button onClick={addMember} className="px-4 bg-green-600 border-2 border-green-400 text-white"><Plus size={18}/></button>
              </div>
            </div>
          )}

          {/* Phase 6: Budget & Timeline Output Screen */}
          {isLastPhase ? (
            <div className="p-4 sm:p-6">
              <TimelineView responses={responses} budgetConfig={budgetConfig} />
              <RiskFlags responses={responses} budgetConfig={budgetConfig} />
              <BudgetScenarios responses={responses} budgetConfig={budgetConfig} vendors={vendors} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
              
              <div className="text-center text-slate-500 text-sm mt-4 p-4 border-2 border-dashed border-slate-700 rounded">
                💡 These estimates are based on your selections in Phases 1-5.<br/>
                Go back to adjust details and see how the budget changes.
              </div>
            </div>
          ) : (
            /* Questions (Phases 1-5) */
            <div className="p-4 sm:p-5 space-y-5">
              {p.questions.map((q, i) => (
                <div key={q.id}>
                  <div className="flex justify-between items-start mb-2">
                    <label className="text-yellow-400 font-bold">{i+1}. {q.label}</label>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => setShowNote(showNote === q.id ? null : q.id)} className={`p-1 ${notes[q.id] ? 'text-blue-400' : 'text-slate-600'}`}><MessageSquare size={16}/></button>
                      <button onClick={() => { sound.play('select'); setNeedsInput(p => ({ ...p, [q.id]: !p[q.id] })); }} className={`p-1 ${needsInput[q.id] ? 'text-yellow-400' : 'text-slate-600'}`}><HelpCircle size={16}/></button>
                    </div>
                  </div>
                  {showNote === q.id && (<input value={notes[q.id] || ''} onChange={e => setNotes({ ...notes, [q.id]: e.target.value })} className="w-full p-3 mb-2 bg-slate-700 border-2 border-slate-600 text-slate-300" placeholder="Add a note..."/>)}
                  {q.type === 'checkbox' ? (<Checkbox options={q.options} selected={responses[q.id] || []} onChange={(val) => update(q.id, val)} />)
                    : q.type === 'textarea' ? (<textarea value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} rows={3} className="w-full p-3 bg-slate-900 border-4 border-slate-600 text-slate-200 focus:border-yellow-400 focus:outline-none resize-none" placeholder={q.placeholder}/>)
                    : q.type === 'select' ? (<select value={responses[q.id] || ''} onChange={e => { sound.play('select'); update(q.id, e.target.value); }} className="w-full p-3 bg-slate-900 border-4 border-slate-600 text-slate-200 focus:border-yellow-400 focus:outline-none"><option value="">-- SELECT --</option>{q.options.map(o => <option key={o} value={o}>{o}</option>)}</select>)
                    : q.type === 'date' ? (<input type="date" value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} className="w-full p-3 bg-slate-900 border-4 border-slate-600 text-slate-200 focus:border-yellow-400 focus:outline-none"/>)
                    : (<input type="text" value={responses[q.id] || ''} onChange={e => update(q.id, e.target.value)} className="w-full p-3 bg-slate-900 border-4 border-slate-600 text-slate-200 focus:border-yellow-400 focus:outline-none" placeholder={q.placeholder}/>)}
                  {needsInput[q.id] && !(q.type === 'checkbox' ? responses[q.id]?.length : responses[q.id]?.toString().trim()) && (<div className="text-yellow-400 text-sm mt-1 flex items-center gap-1"><HelpCircle size={14}/> Flagged for team input</div>)}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="border-t-4 border-slate-700 p-4 flex justify-between items-center">
            <Btn onClick={() => setPhase(Math.max(0, phase - 1))} disabled={phase === 0} variant="secondary">← PREV</Btn>
            <span className="text-slate-500 text-sm">{prog.done}/{prog.total}</span>
            {phase < phases.length - 1 ? (<Btn onClick={() => setPhase(phase + 1)} variant="primary">NEXT →</Btn>) : (<Btn onClick={() => { sound.play('complete'); setScreen('export'); }} variant="success"><Trophy size={16} className="inline mr-2"/>FINISH</Btn>)}
          </div>
        </div>
        {status && <div className="text-center text-green-400 text-sm">{status}</div>}
      </div>
    </div>
  );
}
