const STORAGE_KEY = 'ow-central-hub-v2';
const ACTIVITY_KEY = 'ow-activity-log';
const SEED_KEY = 'ow-seeded-v2';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return new Date().toISOString();
}

// ── Storage CRUD ─────────────────────────────────

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return { businesses: [] };
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Activity Log ─────────────────────────────────

export function loadActivity() {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load activity:', e);
  }
  return [];
}

function saveActivity(log) {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(log));
}

export function logActivity(action, businessName, sectionName, itemTitle) {
  const log = loadActivity();
  log.unshift({
    id: generateId(),
    action,
    businessName,
    sectionName,
    itemTitle,
    timestamp: now(),
  });
  if (log.length > 200) log.length = 200;
  saveActivity(log);
}

// ── Business CRUD ────────────────────────────────

export function addBusiness(name, sector, status, description) {
  const data = loadData();
  const biz = {
    id: generateId(),
    name,
    sector: sector || '',
    status: status || 'Active',
    description: description || '',
    createdAt: now(),
    sections: {
      projects: [],
      briefs: [],
      proposals: [],
      scripts: [],
      decks: [],
      links: [],
      documents: [],
      notes: [],
    },
  };
  data.businesses.push(biz);
  saveData(data);
  logActivity('Created business', name, null, null);
  return biz;
}

export function updateBusiness(bizId, updates) {
  const data = loadData();
  const idx = data.businesses.findIndex((b) => b.id === bizId);
  if (idx === -1) return null;
  const biz = data.businesses[idx];
  if (updates.name !== undefined) biz.name = updates.name;
  if (updates.sector !== undefined) biz.sector = updates.sector;
  if (updates.status !== undefined) biz.status = updates.status;
  if (updates.description !== undefined) biz.description = updates.description;
  saveData(data);
  logActivity('Updated business', biz.name, null, null);
  return biz;
}

export function deleteBusiness(bizId) {
  const data = loadData();
  const biz = data.businesses.find((b) => b.id === bizId);
  data.businesses = data.businesses.filter((b) => b.id !== bizId);
  saveData(data);
  if (biz) logActivity('Deleted business', biz.name, null, null);
}

// ── Item CRUD ────────────────────────────────────

export function addItem(bizId, section, item) {
  const data = loadData();
  const biz = data.businesses.find((b) => b.id === bizId);
  if (!biz || !biz.sections[section]) return null;
  const newItem = {
    id: generateId(),
    ...item,
    favourite: item.favourite || false,
    createdAt: now(),
    updatedAt: now(),
  };
  biz.sections[section].push(newItem);
  saveData(data);
  logActivity('Added item', biz.name, section, newItem.title);
  return newItem;
}

export function updateItem(bizId, section, itemId, updates) {
  const data = loadData();
  const biz = data.businesses.find((b) => b.id === bizId);
  if (!biz || !biz.sections[section]) return null;
  const idx = biz.sections[section].findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  Object.assign(biz.sections[section][idx], updates, { updatedAt: now() });
  saveData(data);
  logActivity('Updated item', biz.name, section, biz.sections[section][idx].title);
  return biz.sections[section][idx];
}

export function deleteItem(bizId, section, itemId) {
  const data = loadData();
  const biz = data.businesses.find((b) => b.id === bizId);
  if (!biz || !biz.sections[section]) return;
  const item = biz.sections[section].find((i) => i.id === itemId);
  biz.sections[section] = biz.sections[section].filter((i) => i.id !== itemId);
  saveData(data);
  if (item) logActivity('Deleted item', biz.name, section, item.title);
}

export function toggleFavourite(bizId, section, itemId) {
  const data = loadData();
  const biz = data.businesses.find((b) => b.id === bizId);
  if (!biz || !biz.sections[section]) return null;
  const item = biz.sections[section].find((i) => i.id === itemId);
  if (!item) return null;
  item.favourite = !item.favourite;
  item.updatedAt = now();
  saveData(data);
  logActivity(item.favourite ? 'Favourited' : 'Unfavourited', biz.name, section, item.title);
  return item;
}

// ── Get all favourites across all businesses ─────

export function getAllFavourites() {
  const data = loadData();
  const favs = [];
  for (const biz of data.businesses) {
    for (const [section, items] of Object.entries(biz.sections)) {
      for (const item of items) {
        if (item.favourite) {
          favs.push({ ...item, businessName: biz.name, businessId: biz.id, section });
        }
      }
    }
  }
  return favs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

// ── Search across everything ─────────────────────

export function searchAll(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase();
  const data = loadData();
  const results = [];
  for (const biz of data.businesses) {
    if (biz.name.toLowerCase().includes(q) || (biz.description || '').toLowerCase().includes(q)) {
      results.push({ type: 'business', business: biz });
    }
    for (const [section, items] of Object.entries(biz.sections)) {
      for (const item of items) {
        const searchable = [item.title, item.body, item.note, item.description, item.url, item.content, item.summary]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (searchable.includes(q)) {
          results.push({
            type: 'item',
            item: { ...item, businessName: biz.name, businessId: biz.id, section },
          });
        }
      }
    }
  }
  return results;
}

// ── Item count for a business ────────────────────

export function getItemCount(biz) {
  if (!biz || !biz.sections) return 0;
  return Object.values(biz.sections).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
}

// ── Seed data ────────────────────────────────────

export function seedData() {
  if (localStorage.getItem(SEED_KEY)) return false;

  const data = { businesses: [] };

  // ─── Ted's Health ───────────────────────────────
  data.businesses.push({
    id: generateId(),
    name: "Ted's Health",
    sector: 'Health & Wellness',
    status: 'Active',
    description: "Men's health TRT and ED service — partnerships, marketing, content",
    createdAt: now(),
    sections: {
      projects: [],
      briefs: [
        {
          id: generateId(),
          title: 'TH Brief 1 — Symptom Checklist',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: Symptom Checklist\nCategory: Awareness / Education\nFormat: Static graphic or carousel\n\nHeadline: \"Could it be Low T?\"\nBody copy: Checklist-style — fatigue, low mood, brain fog, weight gain, reduced libido, poor sleep, loss of motivation.\nCTA: \"If 3+ apply, it might be time to check your levels.\"\nVisual: Clean medical-grade feel, dark tones, tick/check iconography. TH brand colours.\nNote: Should feel clinical but approachable. Not scaremongering — empowering.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 2 — \u00A340 Price Point',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: \u00A340 Price Point\nCategory: Conversion / Offer\nFormat: Static graphic\n\nHeadline: \"Expert TRT from \u00A340/month\"\nBody copy: Emphasise affordability vs clinics (\u00A3200+/month). Include: blood test, doctor consultation, ongoing monitoring, medication delivered.\nCTA: \"Start your free assessment today\"\nVisual: Bold price lockup. Clean layout. Trustworthy medical feel.\nNote: Price is the hook. Make it unmissable but not cheap-looking.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 3 — How It Works',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: How It Works\nCategory: Education / Conversion\nFormat: Carousel (3\u20134 slides) or infographic\n\nStep 1: \"Free online assessment\" — quick health questionnaire\nStep 2: \"At-home blood test\" — delivered to your door\nStep 3: \"Doctor-led review\" — UK clinician reviews your results\nStep 4: \"Treatment delivered\" — monthly medication, ongoing support\nVisual: Numbered steps, clean icons, progress/flow feel. TH brand.\nNote: Simplicity is key. Remove all friction from the mental model.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 4 — Low T Stat',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: Low T Stat\nCategory: Awareness / Hook\nFormat: Static graphic\n\nHeadline: \"1 in 4 men over 30 have low testosterone\"\nBody copy: \"Most don\u2019t know it. Symptoms creep in — fatigue, weight gain, low mood. A simple blood test can tell you where you stand.\"\nCTA: \"Check your levels free\"\nVisual: Bold stat typography. Data-driven feel. Dark, authoritative.\nNote: Stat is the scroll-stopper. Make the number huge and impossible to ignore.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 5 — What Low T Feels Like',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: What Low T Feels Like\nCategory: Awareness / Empathy\nFormat: Static or short carousel\n\nHeadline: \"What low testosterone actually feels like\"\nBody copy: First-person perspective — \"You wake up tired. Coffee doesn\u2019t help. You\u2019ve lost interest in things you used to love. You snap at people. You feel like you\u2019re running on 40%.\"\nCTA: \"Sound familiar? It might not be in your head.\"\nVisual: Moody, editorial photography feel. Relatable. Not clinical — human.\nNote: Emotional resonance over medical jargon. This is the empathy ad.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 6 — Trust Signals',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: Trust Signals\nCategory: Credibility / Conversion\nFormat: Static graphic\n\nHeadline: \"Trusted by thousands of men across the UK\"\nBody copy: Key trust points — UK-registered doctors, CQC-regulated pharmacy, discreet packaging, ongoing clinical support, 4.8-star average rating.\nCTA: \"Join them — start your free assessment\"\nVisual: Trust badges, star ratings, shield/lock iconography. Premium medical aesthetic.\nNote: Overcome scepticism. Stack the credibility signals. Clean, not cluttered.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 7 — The Difference',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: The Difference (Before/After)\nCategory: Aspiration / Conversion\nFormat: Static graphic or carousel\n\nHeadline: \"The difference optimised testosterone makes\"\nBody copy: Before vs after comparison — energy, mood, body composition, libido, mental clarity. Not extreme transformation — subtle, realistic improvement.\nCTA: \"See what\u2019s possible — free assessment\"\nVisual: Split layout or comparison format. Lifestyle imagery. Aspirational but believable.\nNote: Not a miracle cure pitch. Realistic, grounded optimism.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Brief 8 — Conversation Starter',
          body: "GRAPHIC DESIGN BRIEF — Ku Editors\n\nBrief: Conversation Starter\nCategory: Engagement / Awareness\nFormat: Static graphic (poll/question format)\n\nHeadline: \"When did you last get your testosterone checked?\"\nBody copy: Options — \"Last 6 months / Last year / Never / Didn\u2019t know I could\". Designed to prompt engagement and self-reflection.\nCTA: \"It takes 2 minutes — check free\"\nVisual: Poll/quiz aesthetic. Interactive feel even in static format. Clean, modern.\nNote: Engagement-first creative. Gets saves and comments. Low pressure.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
      proposals: [],
      scripts: [],
      decks: [],
      links: [
        {
          id: generateId(),
          title: "Ted's Health Website",
          url: 'https://tedshealth.com',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH White-Label Dashboard',
          url: 'https://dnd5fj5gjy-bit.github.io/th-whitelabel-dashboard/',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
      documents: [
        {
          id: generateId(),
          title: 'TH Brand Guidelines',
          fileType: 'HTML',
          description: 'Full brand guidelines document — colours, typography, tone of voice, logo usage, imagery direction',
          content: '',
          link: '',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH Meta Ads Brief',
          fileType: 'HTML',
          description: '8 video ad scripts across TOF/MOF/BOF — awareness hooks, education, testimonial-style, direct conversion',
          content: '',
          link: '',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
      notes: [
        {
          id: generateId(),
          title: 'TH Partnership Pipeline — Full List',
          body: "PARTNERSHIP PIPELINE — 23 PARTNERS\n\n1. Vitality (Health Insurance) — vitality.co.uk — partnerships@vitality.co.uk\n2. Nuffield Health — nuffieldhealth.com — corporate@nuffieldhealth.com\n3. Bupa — bupa.co.uk — partnerships@bupa.com\n4. David Lloyd Clubs — davidlloyd.co.uk — commercial@davidlloyd.co.uk\n5. Gymshark — gymshark.com — collaborations@gymshark.com\n6. Huel — huel.com — partnerships@huel.com\n7. Whoop — whoop.com — brand@whoop.com\n8. Manual — manual.co — partnerships@manual.co\n9. Numan — numan.com — hello@numan.com\n10. Thriva — thriva.co — partners@thriva.co\n11. ZOE — joinzoe.com — partnerships@joinzoe.com\n12. Hims & Hers (UK) — forhims.co.uk — uk-partnerships@hims.com\n13. The Turmeric Co — theturmericco.com — trade@theturmericco.com\n14. Bulk — bulk.com — marketing@bulk.com\n15. MyProtein — myprotein.com — influencer@myprotein.com\n16. PureGym — puregym.com — commercial@puregym.com\n17. Barry's — barrys.com — partnerships@barrys.com\n18. Hussle — hussle.com — b2b@hussle.com\n19. Third Space — thirdspace.london — membership@thirdspace.london\n20. Heights — yourheights.com — hello@yourheights.com\n21. Wild Nutrition — wildnutrition.com — trade@wildnutrition.com\n22. Form Nutrition — formnutrition.com — hello@formnutrition.com\n23. Innermost — liveinnermost.com — partnerships@liveinnermost.com",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'TH March Figures Summary',
          body: "MARCH 2026 — KEY FIGURES\n\nTRT Patients: 507\nED Patients: 728\nTotal Revenue: \u00A37,029\n\nNotes: Steady month. ED continues to outpace TRT in volume. Revenue tracking below target — need to push conversion rate on assessments and revisit pricing strategy for Q2.",
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
    },
  });

  // ─── Modern Savage ──────────────────────────────
  data.businesses.push({
    id: generateId(),
    name: 'Modern Savage',
    sector: 'Nutrition & Supplements',
    status: 'Active',
    description: 'Bear Grylls family-owned whole-food nutrition brand — launch July 2026',
    createdAt: now(),
    sections: {
      projects: [],
      briefs: [],
      proposals: [],
      scripts: [
        {
          id: generateId(),
          title: '70 Founder-Led Scripts Collection',
          body: "AD COPY COLLECTION\n\nType: Founder-led video scripts for Bear Grylls to camera\nTotal: 70 scripts across 3 categories\n\n30 x Direct Ad Scripts — performance marketing, clear CTA, benefit-led\n30 x Conversational Scripts — organic/social feel, storytelling, behind-the-scenes\n10 x Family Scripts — Bear + family, lifestyle integration, authenticity\n\nAll scripts designed for Meta/TikTok/YouTube Shorts. 30\u201360 second format. Teleprompter-ready.",
          type: 'Ad Copy',
          note: '30 ad + 30 conversational + 10 family scripts for Bear to camera',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
      decks: [],
      links: [
        { id: generateId(), title: 'Social Strategy', url: 'https://dnd5fj5gjy-bit.github.io/modern-savage-strategy/', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: 'Brand Deck', url: 'https://dnd5fj5gjy-bit.github.io/openclaw-shared-docs/junior/modern-savage-brand-deck-2026-04-13.html', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: '70 Scripts', url: 'https://modernsavage-x-bg-script.netlify.app/', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: 'Social Strategy PDF', url: 'https://dnd5fj5gjy-bit.github.io/openclaw-shared-docs/junior/modern-savage-social-strategy.pdf', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: 'Brand Deck PDF', url: 'https://dnd5fj5gjy-bit.github.io/openclaw-shared-docs/junior/modern-savage-brand-deck-2026-04-13.pdf', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: '70 Scripts PDF', url: 'https://dnd5fj5gjy-bit.github.io/openclaw-shared-docs/junior/modern-savage-70-scripts.pdf', favourite: false, createdAt: now(), updatedAt: now() },
      ],
      documents: [
        { id: generateId(), title: 'Modern Savage Meta Ads Brief', fileType: 'HTML', description: '10 launch ads across 3 funnel stages — TOF awareness, MOF education, BOF conversion', content: '', link: '', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: 'Modern Savage Social Strategy', fileType: 'PDF', description: 'Full social media strategy — platforms, cadence, content pillars, tone of voice, growth tactics', content: '', link: '', favourite: false, createdAt: now(), updatedAt: now() },
        { id: generateId(), title: 'Modern Savage Brand Deck', fileType: 'PDF', description: 'Brand positioning deck — vision, mission, values, target audience, visual identity, competitive landscape', content: '', link: '', favourite: false, createdAt: now(), updatedAt: now() },
      ],
      notes: [],
    },
  });

  // ─── DIRTEA ─────────────────────────────────────
  data.businesses.push({
    id: generateId(),
    name: 'DIRTEA',
    sector: 'Functional Mushrooms / Wellness',
    status: 'Active',
    description: 'Marketing pitch research — competitive analysis, commercial audit, market research',
    createdAt: now(),
    sections: {
      projects: [],
      briefs: [],
      proposals: [],
      scripts: [],
      decks: [],
      links: [],
      documents: [],
      notes: [
        {
          id: generateId(),
          title: 'DIRTEA Brand Audit',
          body: "BRAND AUDIT\n\nScope: Website UX/messaging, YouTube content analysis, press coverage review, online reputation & reviews.\n\nKey areas: Brand positioning consistency, content quality, customer sentiment, PR reach, SEO performance, social proof strength.\n\nPurpose: Identify strengths to leverage and gaps to exploit in pitch positioning.",
          note: 'Website, YouTube, press, reputation analysis',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'Competitive Analysis — 5 Brands',
          body: "COMPETITIVE LANDSCAPE\n\n1. Four Sigmatic — US-first, mushroom coffee pioneer, strong DTC\n2. Spacegoods — UK challenger, younger demographic, vibrant branding\n3. OM Mushroom — Functional powders, clean positioning, retail-heavy\n4. London Nootropics — UK premium, adaptogen coffee blends\n5. Rheal — UK superfood blends, female-skewing, wellness aesthetic\n\nWhite space identified: Premium UK functional mushroom brand with celebrity/wellness credibility, male 30+ audience underserved, subscription model opportunity.",
          note: 'Four Sigmatic, Spacegoods, OM Mushroom, London Nootropics, Rheal + white space',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'Commercial & Editorial Audit',
          body: "COMMERCIAL & EDITORIAL AUDIT\n\nPress: Coverage in Evening Standard, Vogue, Men\u2019s Health, GQ. Strong lifestyle press, weaker in business/trade press.\nRetail: Selfridges, Planet Organic, Amazon UK. No Boots/Holland & Barrett yet.\nFunding: Bootstrapped to date, reportedly exploring Series A.\nFounders: Simon & Andrew Sherlock — twin brothers, former property investors.\nPartnerships: David Beckham (investor), various wellness influencers.\nProducts: Mushroom coffees, powders, super blends, tinctures.\nUnder-told stories: Sourcing transparency, clinical backing, founder journey from property to wellness.",
          note: 'Press, retail, funding, founders, partnerships, products, under-told stories',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
        {
          id: generateId(),
          title: 'Market Research & Category Analysis',
          body: "MARKET & CATEGORY RESEARCH\n\nGlobal functional mushroom market: ~$13B by 2030, 8.5% CAGR.\nUK market: Fastest-growing wellness sub-category. Mainstream adoption accelerating.\nKey trends: Adaptogen stacking, mushroom coffee replacing traditional, gut-brain axis awareness.\n40+ audience: Highest spending power, most health-conscious, least served by current branding.\nScepticism barriers: \"Mushroom coffee\" concept, efficacy doubt, taste concerns.\nCultural moments: Biohacking mainstream, Tim Ferriss effect, NHS strain pushing private wellness.\nRegulatory: Novel food regulations, health claim restrictions under UK ASA/CAP.\nSearch opportunity: High-intent keywords underserved — \"best mushroom coffee UK\", \"lion\u2019s mane benefits\", \"reishi for sleep\".",
          note: 'Market size, trends, 40+ audience, scepticism, cultural moments, regulatory, search opportunity',
          favourite: false, createdAt: now(), updatedAt: now(),
        },
      ],
    },
  });

  // ─── Bear Witness ───────────────────────────────
  data.businesses.push({
    id: generateId(),
    name: 'Bear Witness',
    sector: 'Social Media Management',
    status: 'Active',
    description: 'Social media management dashboard — 9 modules + Content Forge',
    createdAt: now(),
    sections: {
      projects: [],
      briefs: [],
      proposals: [],
      scripts: [],
      decks: [],
      links: [
        { id: generateId(), title: 'Bear Witness Dashboard', url: 'https://dnd5fj5gjy-bit.github.io/bear-witness-dashboard/', favourite: false, createdAt: now(), updatedAt: now() },
      ],
      documents: [],
      notes: [],
    },
  });

  saveData(data);
  localStorage.setItem(SEED_KEY, 'true');
  logActivity('System seeded', 'All', null, '4 businesses pre-populated');
  return true;
}
