import React, { useState, useEffect, useCallback } from 'react';
import { Share2, Mail, Download, Users, MessageSquare, HelpCircle, Trophy, Volume2, VolumeX, Plus, X, Sparkles, Calculator, AlertTriangle, Save, RotateCcw, Zap, Loader, Calendar, Clock, CheckCircle, Lightbulb, ExternalLink, MapPin, RefreshCw } from 'lucide-react';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    GOOGLE SHEETS CONFIGURATION                              ║
// ║  To use your own data, set these environment variables or edit below       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const SHEET_ID = process.env.REACT_APP_SHEET_ID || '16-es1Gxv-oaG7MgtH6-ZqrGwgPl-Ly3Q_fXaYFc3AAs';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || ''; // Optional: for private sheets

// Function to fetch data from published Google Sheet
const fetchSheetData = async (sheetName) => {
  try {
    // Using published CSV format (sheet must be published to web)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
    const response = await fetch(url);
    const text = await response.text();
    // Parse the JSONP response
    const json = JSON.parse(text.substring(47).slice(0, -2));
    
    const headers = json.table.cols.map(col => col.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[headers[i]] = cell ? cell.v : '';
      });
      return obj;
    });
    return rows;
  } catch (error) {
    console.log(`Could not fetch ${sheetName} from Google Sheets, using defaults`);
    return null;
  }
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    DEFAULT/FALLBACK BUDGET CONFIG                           ║
// ║  Used when Google Sheets data is unavailable                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const DEFAULT_BUDGET_CONFIG = {
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

// Default vendor data (used when Google Sheets unavailable)
const DEFAULT_VENDORS = {
  venues: [
    { city: "Washington DC", name: "Ronald Reagan Building", type: "Conference center", tier: "Premium", min_capacity: 50, max_capacity: 5000, min_price: 12000, max_price: 50000, url: "https://rrbitc.com", features: "AV included, 22 event spaces", notes: "65000 sq ft", source: "Venue website" },
    { city: "Washington DC", name: "Partnership for Public Service", type: "Conference center", tier: "Standard", min_capacity: 15, max_capacity: 200, min_price: 4000, max_price: 12000, url: "https://ourpublicservice.org/about/conference-center-rental/", features: "Modern AV, hybrid capable", notes: "8000 sq ft. Discounts Mon/Fri", source: "Venue website" },
    { city: "Washington DC", name: "National Building Museum", type: "Museum/unique venue", tier: "Premium", min_capacity: 100, max_capacity: 1000, min_price: 15000, max_price: 35000, url: "https://nbm.org", features: "Iconic Great Hall", notes: "Historic architecture", source: "Venue website" },
    { city: "Washington DC", name: "National Press Club", type: "Conference center", tier: "Standard", min_capacity: 25, max_capacity: 500, min_price: 3000, max_price: 15000, url: "https://press.org", features: "Historic, media-friendly", notes: "Great for policy events", source: "Industry guides" },
    { city: "Washington DC", name: "Georgetown Conference Center", type: "University/campus", tier: "Budget", min_capacity: 25, max_capacity: 300, min_price: 2000, max_price: 8000, url: "https://conference.georgetown.edu", features: "Academic setting, AV included", notes: "Partner discounts possible", source: "Venue website" },
    { city: "Washington DC", name: "MLK Library", type: "Government building", tier: "Budget", min_capacity: 25, max_capacity: 200, min_price: 1500, max_price: 4000, url: "https://dclibrary.org/mlk", features: "Renovated 2020, modern", notes: "Mission alignment helps", source: "Venue website" },
  ],
  caterers: [
    { city: "Washington DC", name: "Ridgewells Catering", tier: "Premium", budget_pp: 75, standard_pp: 125, premium_pp: 200, url: "https://ridgewells.com", notes: "95+ years. Award-winning." },
    { city: "Washington DC", name: "Occasions Caterers", tier: "Premium", budget_pp: 65, standard_pp: 110, premium_pp: 175, url: "https://occasionscaterers.com", notes: "Custom menus, experiential." },
    { city: "Washington DC", name: "RSVP Catering", tier: "Standard", budget_pp: 45, standard_pp: 75, premium_pp: 120, url: "https://rsvpcatering.com", notes: "25+ years. Corporate focus." },
    { city: "Washington DC", name: "CNF Catering", tier: "Budget", budget_pp: 35, standard_pp: 55, premium_pp: 85, url: "https://cnfcatering.com", notes: "Since 1986. Good value." },
  ],
  av_companies: [
    { city: "Washington DC", name: "Media Support Services", tier: "Standard", basic_day: 1500, standard_day: 3500, premium_day: 8000, url: "https://mssav.com", notes: "Since 1996. DC venue experts." },
    { city: "Washington DC", name: "Meeting Tomorrow", tier: "Standard", basic_day: 2000, standard_day: 5000, premium_day: 15000, url: "https://meetingtomorrow.com", notes: "National company. Multi-city." },
    { city: "Washington DC", name: "AV Universal", tier: "Budget", basic_day: 1000, standard_day: 2500, premium_day: 6000, url: "https://avuniversal.com", notes: "NoVA based. Responsive." },
    { city: "Washington DC", name: "Electric Events DC", tier: "Standard", basic_day: 2000, standard_day: 5000, premium_day: 15000, url: "https://electriceventsdc.com", notes: "20+ years. Full service." },
  ],
};

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              SMART DEFAULTS                                 ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const SMART_DEFAULTS = {
  "Conference": { duration: "Full day", attendance: "100-250 (large)", venue_type: "Conference center", program_elements: ["Keynote speeches", "Panel discussions", "Networking time", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks", "Lunch", "Reception/Appetizers"], av_needs: ["Basic (mics, projector)", "Multiple screens", "Recording"], production_needs: ["Photographer", "Videographer"], collateral_needs: ["Event website", "Registration system", "Name badges", "Printed programs"] },
  "Workshop/Training": { duration: "Half day (4-5 hours)", attendance: "25-50 (small)", venue_type: "Conference center", program_elements: ["Workshops/trainings", "Breakout sessions", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks", "Lunch"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: ["Registration system", "Name badges", "Printed programs"] },
  "Roundtable Discussion": { duration: "2-3 hours", attendance: "Under 25 (intimate)", venue_type: "Corporate office", program_elements: ["Panel discussions", "Networking time", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: ["Name badges"] },
  "Summit": { duration: "Full day", attendance: "100-250 (large)", venue_type: "Hotel", program_elements: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Networking time"], fnb_items: ["Coffee/Light Snacks", "Breakfast", "Lunch", "Reception/Appetizers"], av_needs: ["Basic (mics, projector)", "Professional staging", "Multiple screens", "Recording"], production_needs: ["Photographer", "Videographer", "Social media coverage"], collateral_needs: ["Event website", "Registration system", "Name badges", "Signage/banners", "Swag/giveaways"] },
  "Reception/Networking": { duration: "2-3 hours", attendance: "50-100 (medium)", venue_type: "Museum/unique venue", program_elements: ["Networking time", "Entertainment"], fnb_items: ["Reception/Appetizers", "Alcohol service"], av_needs: ["Basic (mics, projector)"], production_needs: ["Photographer"], collateral_needs: ["Name badges", "Signage/banners"] },
  "Briefing/Presentation": { duration: "2-3 hours", attendance: "25-50 (small)", venue_type: "Corporate office", program_elements: ["Keynote speeches", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks"], av_needs: ["Basic (mics, projector)"], production_needs: [], collateral_needs: ["Printed programs"] },
  "Demo Day/Showcase": { duration: "Half day (4-5 hours)", attendance: "50-100 (medium)", venue_type: "Conference center", program_elements: ["Demos/showcases", "Networking time", "Q&A sessions"], fnb_items: ["Coffee/Light Snacks", "Lunch"], av_needs: ["Basic (mics, projector)", "Multiple screens"], production_needs: ["Photographer", "Videographer"], collateral_needs: ["Event website", "Registration system", "Name badges", "Signage/banners"] },
  "Multi-format": { duration: "Full day", attendance: "100-250 (large)", venue_type: "Conference center", program_elements: ["Keynote speeches", "Panel discussions", "Breakout sessions", "Workshops/trainings", "Networking time"], fnb_items: ["Coffee/Light Snacks", "Lunch"], av_needs: ["Basic (mics, projector)", "Multiple screens"], production_needs: ["Photographer"], collateral_needs: ["Event website", "Registration system", "Name badges", "Printed programs"] },
};

const STORAGE_KEY = 'seedai-event-planner-save';

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                              HELPER FUNCTIONS                               ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const generateTimeline = (eventDate, responses, budgetConfig) => {
  if (!eventDate) return [];
  const date = new Date(eventDate);
  if (isNaN(date.getTime())) return [];
  const today = new Date();
  const weeksOut = Math.floor((date - today) / (7 * 24 * 60 * 60 * 1000));
  const venueLeadTime = budgetConfig.venueTypes[responses.venue_type]?.leadTime || 12;
  
  const milestones = [
    { weeks: Math.max(venueLeadTime, 16), task: "🏛️ Venue contract signed", category: "venue" },
    { weeks: 14, task: "🎤 Keynote speakers confirmed", category: "content" },
    { weeks: 12, task: "📋 Program outline finalized", category: "content" },
    { weeks: 10, task: "🎯 Marketing campaign launched", category: "marketing" },
    { weeks: 8, task: "📝 Registration opens", category: "registration" },
    { weeks: 8, task: "🍽️ Catering menu selected", category: "logistics" },
    { weeks: 6, task: "🎬 AV requirements confirmed", category: "production" },
    { weeks: 4, task: "📦 Collateral to print", category: "logistics" },
    { weeks: 2, task: "🔢 Final headcount to venue", category: "logistics" },
    { weeks: 1, task: "✅ Final walkthrough", category: "logistics" },
    { weeks: 0, task: "🎉 EVENT DAY", category: "event" },
  ];
  
  return milestones.filter(m => m.weeks <= weeksOut + 2).map(m => {
    const milestoneDate = new Date(date);
    milestoneDate.setDate(milestoneDate.getDate() - (m.weeks * 7));
    const isPast = milestoneDate < today;
    const isUrgent = !isPast && milestoneDate < new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    return { ...m, date: milestoneDate, isPast, isUrgent, weeksOut: m.weeks };
  }).sort((a, b) => a.date - b.date);
};

const analyzeRisks = (responses, budgetConfig) => {
  const risks = [];
  const attendance = budgetConfig.attendanceDefaults[responses.attendance] || 75;
  const eventDate = responses.target_date ? new Date(responses.target_date) : null;
  const today = new Date();
  const weeksOut = eventDate ? Math.floor((eventDate - today) / (7 * 24 * 60 * 60 * 1000)) : null;
  const venueLeadTime = budgetConfig.venueTypes[responses.venue_type]?.leadTime || 12;
  const location = budgetConfig.locations[responses.location];
  
  if (weeksOut !== null && weeksOut < venueLeadTime) {
    risks.push({ severity: "high", icon: "⏰", message: `${responses.venue_type || 'This venue type'} typically requires ${venueLeadTime}+ weeks lead time. You have ${weeksOut} weeks.` });
  } else if (weeksOut !== null && weeksOut < 8) {
    risks.push({ severity: "high", icon: "⏰", message: `Only ${weeksOut} weeks until event. Expedited planning may increase costs 15-25%.` });
  }
  
  if (eventDate && location?.peakMonths?.includes(eventDate.getMonth() + 1)) {
    risks.push({ severity: "medium", icon: "📅", message: `${location.label} is in peak season in ${eventDate.toLocaleString('default', { month: 'long' })}. Expect 20-30% higher costs.` });
  }
  
  if (responses.location === "Washington DC" && eventDate && [3, 4].includes(eventDate.getMonth() + 1)) {
    risks.push({ severity: "medium", icon: "🌸", message: "Cherry blossom season means premium hotel rates and limited availability." });
  }
  
  if (responses.format === "Hybrid (in-person + virtual)") {
    risks.push({ severity: "medium", icon: "🖥️", message: "Hybrid events typically cost 30-40% more than in-person only." });
  }
  
  if (responses.fnb_items?.includes("Alcohol service") && responses.venue_type === "Government building") {
    risks.push({ severity: "high", icon: "🍷", message: "Most government buildings prohibit alcohol. Verify venue policy." });
  }
  
  if (attendance > 100 && !responses.collateral_needs?.includes("Registration system")) {
    risks.push({ severity: "low", icon: "📝", message: "Consider a registration system to manage check-in for 100+ attendees." });
  }
  
  return risks.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
};

const calculateBudget = (responses, scenario, budgetConfig) => {
  const attendanceKey = responses.attendance || "50-100 (medium)";
  const attendance = budgetConfig.attendanceDefaults[attendanceKey] || 75;
  const durationKey = responses.duration || "Full day";
  const days = budgetConfig.durationMultipliers[durationKey] || 1;
  const locationKey = responses.location || "Washington DC";
  const locationMultiplier = budgetConfig.locations[locationKey]?.multiplier || 1.0;
  const venueType = responses.venue_type || "Not sure yet";
  const venueConfig = budgetConfig.venueTypes[venueType] || budgetConfig.venueTypes["Not sure yet"];
  
  let costs = { venue: 0, foodBeverage: 0, avTechnical: 0, production: 0, collateral: 0, marketing: 0, staffing: 0 };
  
  const venuePerPerson = venueConfig.perPerson[scenario] || venueConfig.perPerson.standard;
  const venueBase = Math.max(venuePerPerson * attendance, venueConfig.minSpend || 0);
  costs.venue = venueBase * days * locationMultiplier;
  
  (responses.fnb_items || []).forEach(item => {
    const cfg = budgetConfig.foodAndBeverage[item];
    if (cfg) costs.foodBeverage += (cfg[scenario] || cfg.standard) * attendance * days * locationMultiplier;
  });
  
  (responses.av_needs || []).forEach(item => {
    const cfg = budgetConfig.avTechnical[item];
    if (cfg) costs.avTechnical += (cfg[scenario] || cfg.standard) * days * locationMultiplier;
  });
  
  (responses.production_needs || []).forEach(item => {
    const cfg = budgetConfig.production[item];
    if (cfg) {
      const cost = cfg[scenario] || cfg.standard;
      costs.production += (cfg.perDay ? cost * days : cost) * locationMultiplier;
    }
  });
  
  (responses.collateral_needs || []).forEach(item => {
    const cfg = budgetConfig.collateral[item];
    if (cfg) {
      const cost = cfg[scenario] || cfg.standard;
      costs.collateral += cfg.perPerson ? cost * attendance : cost;
    }
  });
  
  (responses.marketing_channels || []).forEach(item => {
    const cfg = budgetConfig.marketing[item];
    if (cfg) costs.marketing += cfg[scenario] || cfg.standard;
  });
  
  costs.staffing = (budgetConfig.staffing[scenario] || budgetConfig.staffing.standard) * days * locationMultiplier;
  
  const subtotal = Object.values(costs).reduce((a, b) => a + b, 0);
  const contingencyRate = budgetConfig.contingency[scenario] || budgetConfig.contingency.standard;
  const contingency = subtotal * contingencyRate;
  
  return { ...costs, subtotal, contingency, total: subtotal + contingency, attendance, days, location: locationKey, locationMultiplier, venueType, scenario };
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
    const sounds = {
      select: () => { osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(880, now + 0.05); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.1); },
      navigate: () => { osc.frequency.setValueAtTime(330, now); gain.gain.setValueAtTime(0.08, now); osc.start(now); osc.stop(now + 0.05); },
      complete: () => { osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1); osc.frequency.setValueAtTime(784, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.4); },
      start: () => { osc.frequency.setValueAtTime(262, now); osc.frequency.setValueAtTime(330, now + 0.1); gain.gain.setValueAtTime(392, now + 0.2); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.3); },
      save: () => { osc.frequency.setValueAtTime(600, now); osc.frequency.setValueAtTime(800, now + 0.1); gain.gain.setValueAtTime(0.1, now); osc.start(now); osc.stop(now + 0.15); },
    };
    sounds[type]?.();
  }
  toggle() { this.enabled = !this.enabled; return this.enabled; }
}
const sound = new SoundSystem();

// Character SVGs
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
      <div className={`p-2 border-4 ${selected ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 bg-slate-800'}`}>{getCharacterSvg(id, 48)}</div>
      <div className={`text-center mt-1 ${selected ? 'text-yellow-400' : 'text-slate-400'}`}>
        <div className="text-xs font-bold">{names[id]}</div>
        <div className="text-xs opacity-75">{titles[id]}</div>
      </div>
    </div>
  );
};

const charNames = { stuart: "Stuart", austin: "Austin", anna: "Anna", josh: "Josh" };

// UI Components
const Btn = ({ children, onClick, disabled, variant = "primary", className = "" }) => {
  const v = { primary: "bg-blue-600 hover:bg-blue-500 border-blue-400 text-white", secondary: "bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200", success: "bg-green-600 hover:bg-green-500 border-green-400 text-white", warning: "bg-yellow-500 hover:bg-yellow-400 border-yellow-300 text-slate-900", danger: "bg-red-600 hover:bg-red-500 border-red-400 text-white" };
  return (<button onClick={(e) => { sound.play('navigate'); onClick?.(e); }} disabled={disabled} className={`px-3 py-2 font-mono font-bold uppercase text-xs border-4 transition-all disabled:opacity-50 active:translate-y-1 ${v[variant]} ${className}`} style={{ boxShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>{children}</button>);
};

const ProgressWithCharacter = ({ current, total, label, characterId }) => {
  const percentage = Math.round((current / total) * 100);
  return (
    <div className="font-mono">
      <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span>{percentage}%</span></div>
      <div className="relative">
        <div className="flex gap-1 h-6">{[...Array(10)].map((_, i) => (<div key={i} className={`flex-1 border-2 ${i < Math.round((current / total) * 10) ? 'bg-green-400 border-green-300' : 'bg-slate-800 border-slate-600'}`}/>))}</div>
        <div className="absolute top-1/2 transition-all duration-300" style={{ left: `${Math.min(percentage, 95)}%`, transform: 'translate(-50%, -50%)' }}>{getCharacterSvg(characterId, 28)}</div>
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

// Data
const programs = [
  { id: 'ai-across-america', name: 'AI Across America', icon: '🇺🇸' },
  { id: 'accelerate-science', name: 'Accelerate Science Now', icon: '🔬' },
  { id: 'ai-primers', name: 'AI Primers', icon: '📚' },
  { id: 'fysa', name: 'FYSA', icon: '📋' },
  { id: 'policy', name: 'Policy Engagement', icon: '🏛️' },
  { id: 'other', name: 'Other Initiative', icon: '✨' }
];

// Vendor Recommendations Component
const VendorRecommendations = ({ vendors, responses, budgetConfig, category }) => {
  const [expanded, setExpanded] = useState(false);
  const location = responses.location || "Washington DC";
  const attendance = budgetConfig.attendanceDefaults[responses.attendance] || 75;
  const venueType = responses.venue_type;
  
  let filteredVendors = [];
  let title = "";
  
  if (category === 'venues') {
    title = "🏛️ RECOMMENDED VENUES";
    filteredVendors = (vendors.venues || [])
      .filter(v => v.city === location)
      .filter(v => !venueType || venueType === "Not sure yet" || v.type === venueType)
      .filter(v => attendance >= (v.min_capacity || 0) && attendance <= (v.max_capacity || 9999))
      .slice(0, 6);
  } else if (category === 'caterers') {
    title = "🍽️ RECOMMENDED CATERERS";
    filteredVendors = (vendors.caterers || []).filter(v => v.city === location).slice(0, 4);
  } else if (category === 'av') {
    title = "🎤 RECOMMENDED AV COMPANIES";
    filteredVendors = (vendors.av_companies || []).filter(v => v.city === location).slice(0, 4);
  }
  
  if (filteredVendors.length === 0) return null;
  
  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();
  const tierColors = { Budget: 'text-green-400', Standard: 'text-blue-400', Premium: 'text-purple-400' };
  
  return (
    <div className="border-2 border-slate-600 bg-slate-900 p-2 mb-2">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex justify-between items-center text-xs text-slate-400 hover:text-slate-200">
        <span>{title}</span>
        <span>{expanded ? '▼' : '▶'} {filteredVendors.length} options</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {filteredVendors.map((v, i) => (
            <div key={i} className="border border-slate-700 p-2 bg-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-slate-200">{v.name}</div>
                  <div className={`text-xs ${tierColors[v.tier] || 'text-slate-400'}`}>{v.tier}</div>
                </div>
                {v.url && (
                  <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink size={12}/>
                  </a>
                )}
              </div>
              {category === 'venues' && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatMoney(v.min_price)} - {formatMoney(v.max_price)} • {v.min_capacity}-{v.max_capacity} guests
                </div>
              )}
              {category === 'caterers' && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatMoney(v.budget_pp)}-{formatMoney(v.premium_pp)}/person
                </div>
              )}
              {category === 'av' && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatMoney(v.basic_day)}-{formatMoney(v.premium_day)}/day
                </div>
              )}
              {v.notes && <div className="text-xs text-slate-600 mt-1">{v.notes}</div>}
            </div>
          ))}
          <div className="text-xs text-slate-600 text-center pt-1">
            💡 Data from vendor websites. Verify current pricing directly.
          </div>
        </div>
      )}
    </div>
  );
};

// Budget Estimator with Scenarios
const BudgetEstimator = ({ responses, budgetConfig, vendors, onAiRefine, aiEstimate, aiLoading }) => {
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const budgetScenarios = {
    budget: calculateBudget(responses, 'budget', budgetConfig),
    standard: calculateBudget(responses, 'standard', budgetConfig),
    premium: calculateBudget(responses, 'premium', budgetConfig)
  };
  const budget = budgetScenarios[selectedScenario];
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
  
  const locationLabel = budgetConfig.locations[budget.location]?.label || budget.location;
  const hasSelections = categories.length > 0;
  
  return (
    <div className="border-4 border-green-500 bg-slate-800 p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-green-400 text-sm"><Calculator size={16}/> BUDGET SCENARIOS</div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={10}/> {locationLabel}
        </div>
      </div>
      
      <div className="text-xs text-slate-500 mb-3">{budget.attendance} attendees × {budget.days} day(s)</div>
      
      {/* Scenario Tabs */}
      <div className="flex gap-1 mb-3">
        {[{ id: 'budget', label: '💰 Budget' }, { id: 'standard', label: '⭐ Standard' }, { id: 'premium', label: '✨ Premium' }].map(s => (
          <button key={s.id} onClick={() => { sound.play('select'); setSelectedScenario(s.id); }}
            className={`flex-1 p-2 border-2 text-xs ${selectedScenario === s.id ? 'border-green-400 bg-green-900/30 text-green-400' : 'border-slate-600 bg-slate-900 text-slate-400'}`}>
            {s.label}
          </button>
        ))}
      </div>
      
      {hasSelections ? (
        <>
          <div className="mb-3 text-xs">
            <div className="grid grid-cols-4 gap-1 mb-1 text-slate-500">
              <div>Category</div><div className="text-center">Budget</div><div className="text-center">Standard</div><div className="text-center">Premium</div>
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
          
          {/* Vendor Recommendations */}
          <VendorRecommendations vendors={vendors} responses={responses} budgetConfig={budgetConfig} category="venues" />
          <VendorRecommendations vendors={vendors} responses={responses} budgetConfig={budgetConfig} category="caterers" />
          <VendorRecommendations vendors={vendors} responses={responses} budgetConfig={budgetConfig} category="av" />
          
          {/* AI Refinement */}
          <div className="border-t border-slate-700 pt-3 mt-3">
            <button onClick={onAiRefine} disabled={aiLoading}
              className={`w-full p-2 border-2 text-xs flex items-center justify-center gap-2 transition-all ${aiLoading ? 'border-purple-500 bg-purple-900/30 text-purple-400' : 'border-purple-500 bg-slate-900 text-purple-400 hover:bg-purple-900/30'} disabled:opacity-50`}>
              {aiLoading ? (<><Loader size={14} className="animate-spin"/> Searching current market data...</>) : (<><Zap size={14}/> Refine with AI (live market data)</>)}
            </button>
            {aiEstimate && (
              <div className="mt-3 p-2 bg-purple-900/20 border-2 border-purple-500/50 text-xs">
                <div className="text-purple-400 font-bold mb-2"><Sparkles size={12} className="inline mr-1"/> AI MARKET ANALYSIS</div>
                <div className="text-slate-300 whitespace-pre-wrap">{aiEstimate}</div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-slate-500 text-xs text-center py-4">Select options to see budget estimates</div>
      )}
      
      <div className="text-xs text-slate-600 border-t border-slate-700 pt-2 mt-3">
        💡 Estimates from curated vendor database. Click vendor names for direct links.
      </div>
    </div>
  );
};

// Main App Component
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
  const [budgetConfig, setBudgetConfig] = useState(DEFAULT_BUDGET_CONFIG);
  const [vendors, setVendors] = useState(DEFAULT_VENDORS);
  const [dataSource, setDataSource] = useState('default');

  // Load vendor data from Google Sheets on mount
  useEffect(() => {
    const loadData = async () => {
      if (SHEET_ID === 'YOUR_SHEET_ID_HERE') {
        setDataSource('default');
        return;
      }
      
      try {
        const [venuesData, caterersData, avData] = await Promise.all([
          fetchSheetData('venues'),
          fetchSheetData('caterers'),
          fetchSheetData('av_companies'),
        ]);
        
        if (venuesData || caterersData || avData) {
          setVendors({
            venues: venuesData || DEFAULT_VENDORS.venues,
            caterers: caterersData || DEFAULT_VENDORS.caterers,
            av_companies: avData || DEFAULT_VENDORS.av_companies,
          });
          setDataSource('sheets');
        }
      } catch (error) {
        console.log('Using default vendor data');
      }
    };
    loadData();
  }, []);

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

  useEffect(() => {
    if (responses.event_type && SMART_DEFAULTS[responses.event_type] && !appliedDefaults) {
      setShowSmartDefaults(responses.event_type);
    }
  }, [responses.event_type, appliedDefaults]);

  const phases = [
    { id: 1, name: "THE SPARK", icon: "💡", subtitle: "What's the big idea?", questions: [
      { id: "event_name", label: "What would you call this event?", type: "text", placeholder: "Working title..." },
      { id: "spark", label: "What's the spark? The problem or opportunity?", type: "textarea", placeholder: "What made you think 'we need an event'?" },
      { id: "success_headline", label: "Imagine success. What's the headline?", type: "textarea", placeholder: "Dream big!" },
      { id: "why_event", label: "Why is an event the right format?", type: "textarea", placeholder: "vs. report, webinar, etc." },
      { id: "seedai_alignment", label: "How does this connect to SeedAI's mission?", type: "textarea", placeholder: "Try It, Prove It, Scale It..." }
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
    { id: 6, name: "THE PLAN", icon: "🚀", subtitle: "Budget & timeline", questions: [
      { id: "budget_known", label: "Do you have a budget in mind?", type: "select", options: ["Yes, specific budget", "Rough range", "Need help estimating"] },
      { id: "budget_range", label: "Budget range?", type: "select", options: ["Under $10K", "$10-25K", "$25-50K", "$50-100K", "$100-250K", "$250K+", "TBD"] },
      { id: "funding_sources", label: "Funding sources?", type: "checkbox", options: ["Organizational budget", "Sponsorships", "Grants", "Registration fees", "Partner contributions", "In-kind support", "TBD"] },
      { id: "risks", label: "What could go wrong?", type: "textarea", placeholder: "Be honest..." },
      { id: "success_metrics", label: "How will you measure success?", type: "textarea", placeholder: "Goals, metrics..." }
    ]}
  ];

  const applySmartDefaults = () => {
    const defaults = SMART_DEFAULTS[responses.event_type];
    if (!defaults) return;
    sound.play('complete');
    setResponses(prev => ({ ...prev, ...defaults }));
    setAppliedDefaults(true);
    setShowSmartDefaults(null);
    setStatus('Smart defaults applied!');
    setTimeout(() => setStatus(''), 2000);
  };

  const handleAiRefine = async () => {
    setAiLoading(true); setAiEstimate(null);
    const budget = calculateBudget(responses, 'standard', budgetConfig);
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: `Research current event costs for: ${responses.event_name || 'Conference'} in ${budget.location}, ${budget.attendance} attendees, ${budget.days} day(s), ${budget.venueType}. Current estimate: $${Math.round(budget.total).toLocaleString()}. Provide: 1) Refined estimate, 2) Specific venue suggestions with links, 3) Cost-saving tips. Under 150 words.` }]
        })
      });
      const data = await response.json();
      setAiEstimate(data.content?.map(c => c.type === 'text' ? c.text : '').join('') || 'Unable to get estimate.');
      sound.play('complete');
    } catch (e) { setAiEstimate('⚠️ Could not connect. Using database estimates.'); }
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

  const update = (id, val) => { setResponses(p => ({ ...p, [id]: val })); setAiEstimate(null); if (id === 'event_type') setAppliedDefaults(false); };
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

  const formatMoney = (n) => '$' + Math.round(n).toLocaleString();

  const exportText = () => {
    const budgetStandard = calculateBudget(responses, 'standard', budgetConfig);
    const budgetLow = calculateBudget(responses, 'budget', budgetConfig);
    const budgetHigh = calculateBudget(responses, 'premium', budgetConfig);
    const total = totalProgress();
    const isPartial = total.done < total.total;
    const locationLabel = budgetConfig.locations[budgetStandard.location]?.label || budgetStandard.location;
    const timeline = generateTimeline(responses.target_date, responses, budgetConfig);
    const risks = analyzeRisks(responses, budgetConfig);
    
    let t = `# EVENT PROPOSAL: ${responses.event_name || 'Untitled'}\n\n`;
    if (isPartial) t += `**⚠️ DRAFT — ${total.done}/${total.total} questions completed**\n\n`;
    t += `**Program:** ${programs.find(p => p.id === program)?.name || 'Not selected'}\n**Owner:** ${charNames[char] || 'Not selected'}\n**Location:** ${locationLabel}\n**Date:** ${responses.target_date || 'TBD'}\n**Budget Range:** ${formatMoney(budgetLow.total)} - ${formatMoney(budgetHigh.total)}\n\n`;
    
    if (team.length) { t += `## Team\n`; team.forEach(m => t += `- **${m.name}** — ${m.role || 'TBD'}\n`); t += '\n'; }
    if (risks.length) { t += `## ⚠️ Risk Flags\n`; risks.forEach(r => t += `- ${r.icon} ${r.message}\n`); t += '\n'; }
    if (timeline.length) { t += `## 📅 Timeline\n`; timeline.filter(m => !m.isPast).slice(0, 8).forEach(m => t += `- **${m.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}** — ${m.task}\n`); t += '\n'; }
    
    phases.forEach(p => {
      t += `## ${p.icon} ${p.name}\n`;
      p.questions.forEach(q => {
        const r = q.type === 'checkbox' ? responses[q.id]?.join(', ') : responses[q.id];
        if (r?.trim?.() || (q.type === 'checkbox' && r?.length)) t += `**${q.label}**\n${r}\n\n`;
        else if (needsInput[q.id]) t += `**${q.label}**\n⚠️ NEEDS INPUT\n\n`;
      });
    });
    
    t += `## 💰 Budget (3 Scenarios)\n| Category | Budget | Standard | Premium |\n|----------|--------|----------|--------|\n`;
    if (budgetStandard.venue > 0) t += `| Venue | ${formatMoney(budgetLow.venue)} | ${formatMoney(budgetStandard.venue)} | ${formatMoney(budgetHigh.venue)} |\n`;
    if (budgetStandard.foodBeverage > 0) t += `| F&B | ${formatMoney(budgetLow.foodBeverage)} | ${formatMoney(budgetStandard.foodBeverage)} | ${formatMoney(budgetHigh.foodBeverage)} |\n`;
    if (budgetStandard.avTechnical > 0) t += `| AV | ${formatMoney(budgetLow.avTechnical)} | ${formatMoney(budgetStandard.avTechnical)} | ${formatMoney(budgetHigh.avTechnical)} |\n`;
    if (budgetStandard.production > 0) t += `| Production | ${formatMoney(budgetLow.production)} | ${formatMoney(budgetStandard.production)} | ${formatMoney(budgetHigh.production)} |\n`;
    t += `| **TOTAL** | **${formatMoney(budgetLow.total)}** | **${formatMoney(budgetStandard.total)}** | **${formatMoney(budgetHigh.total)}** |\n\n`;
    if (aiEstimate) t += `### AI Analysis\n${aiEstimate}\n\n`;
    t += `---\n*Data source: ${dataSource === 'sheets' ? 'Google Sheets database' : 'Built-in defaults'}*`;
    return t;
  };

  const copy = async () => { await navigator.clipboard.writeText(exportText()); sound.play('complete'); setStatus('Copied!'); setTimeout(() => setStatus(''), 2000); };
  const email = () => { window.open(`mailto:operations@seedai.org?subject=${encodeURIComponent(`${responses.event_name || 'Event'} - Proposal`)}&body=${encodeURIComponent(exportText())}`); };
  const download = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([exportText()], { type: 'text/plain' })); a.download = `${responses.event_name || 'event'}-proposal.md`; a.click(); sound.play('complete'); };

  // SCREENS
  if (screen === 'title') return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-mono">
      <button onClick={() => { sound.toggle(); setSoundOn(!soundOn); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300">{soundOn ? <Volume2 size={20}/> : <VolumeX size={20}/>}</button>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-blue-400 mb-2" style={{ textShadow: '4px 4px 0 #1e3a8a' }}>SeedAI</h1>
        <h2 className="text-2xl text-yellow-400 mb-4" style={{ textShadow: '2px 2px 0 #92400e' }}>EVENT PLANNER</h2>
        <p className="text-slate-400 text-xs mb-2 max-w-xs mx-auto">Smart defaults • Budget scenarios • Vendor recommendations</p>
        <p className="text-slate-600 text-xs mb-6">Data: {dataSource === 'sheets' ? '📊 Google Sheets' : '💾 Built-in'}</p>
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
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl text-yellow-400 mb-4">WHO'S LEADING THIS?</h2>
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
    return (
      <div className="min-h-screen bg-slate-900 p-4 font-mono overflow-auto">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl text-yellow-400">PROPOSAL READY</h2>
            <p className="text-slate-500 text-xs mt-1">{total.done}/{total.total} completed</p>
          </div>
          
          <BudgetEstimator responses={responses} budgetConfig={budgetConfig} vendors={vendors} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
          
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

        {showSmartDefaults && phase === 2 && (
          <div className="border-4 border-purple-500 bg-purple-900/20 p-3 mb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm mb-2"><Lightbulb size={16}/> SMART DEFAULTS</div>
            <p className="text-xs text-slate-400 mb-3">Apply typical settings for <span className="text-purple-400 font-bold">{responses.event_type}</span>?</p>
            <div className="flex gap-2">
              <Btn onClick={applySmartDefaults} variant="primary" className="flex-1"><Sparkles size={12} className="inline mr-1"/> Apply</Btn>
              <Btn onClick={() => setShowSmartDefaults(null)} variant="secondary" className="flex-1">Skip</Btn>
            </div>
          </div>
        )}

        <div className="border-4 border-blue-500 bg-slate-800 mb-3">
          <div className="bg-blue-600 p-3 border-b-4 border-blue-500">
            <div className="text-xs text-blue-200">PHASE {p.id} OF {phases.length}</div>
            <h2 className="text-lg text-white">{p.icon} {p.name}</h2>
            <div className="text-xs text-blue-200">{p.subtitle}</div>
          </div>

          {phase === 0 && (
            <div className="p-3 border-b-4 border-slate-700">
              <div className="text-yellow-400 text-xs mb-2 flex items-center gap-2"><Users size={12}/> TEAM</div>
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
              <BudgetEstimator responses={responses} budgetConfig={budgetConfig} vendors={vendors} onAiRefine={handleAiRefine} aiEstimate={aiEstimate} aiLoading={aiLoading} />
            </div>
          )}

          <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
            {p.questions.map((q, i) => (
              <div key={q.id} className={needsInput[q.id] && !(q.type === 'checkbox' ? responses[q.id]?.length : responses[q.id]?.trim?.()) ? 'border-l-4 border-yellow-400 pl-2' : ''}>
                <div className="flex justify-between items-start mb-1">
                  <label className="text-yellow-400 text-xs flex-1">{i+1}. {q.label}</label>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => setShowNote(showNote === q.id ? null : q.id)} className={notes[q.id] ? 'text-blue-400' : 'text-slate-600'}><MessageSquare size={12}/></button>
                    <button onClick={() => toggleInput(q.id)} className={needsInput[q.id] ? 'text-yellow-400' : 'text-slate-600'}><HelpCircle size={12}/></button>
                  </div>
                </div>
                {showNote === q.id && (<input value={notes[q.id] || ''} onChange={e => setNotes({ ...notes, [q.id]: e.target.value })} className="w-full p-2 mb-1 bg-slate-700 border-2 border-slate-600 text-slate-300 text-xs" placeholder="Note..."/>)}
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
