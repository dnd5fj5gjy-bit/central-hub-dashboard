const STORAGE_KEY = 'central-hub-data';

const defaultData = {
  businesses: [],
  favourites: [],
  activity: [],
};

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData, businesses: [], favourites: [], activity: [] };
    const parsed = JSON.parse(raw);
    return {
      businesses: parsed.businesses || [],
      favourites: parsed.favourites || [],
      activity: parsed.activity || [],
    };
  } catch {
    return { ...defaultData };
  }
}

export function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addBusiness(business) {
  const data = load();
  const newBusiness = {
    id: crypto.randomUUID(),
    name: business.name || '',
    sector: business.sector || '',
    description: business.description || '',
    status: business.status || 'active',
    createdAt: new Date().toISOString(),
    items: {
      projects: [],
      briefs: [],
      proposals: [],
      scripts: [],
      decks: [],
      links: [],
      notes: [],
    },
  };
  data.businesses.push(newBusiness);
  save(data);
  addActivity(`Added business "${newBusiness.name}"`, newBusiness.name, 'business', newBusiness.name);
  return newBusiness;
}

export function updateBusiness(id, updates) {
  const data = load();
  const idx = data.businesses.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  data.businesses[idx] = { ...data.businesses[idx], ...updates, items: data.businesses[idx].items };
  if (updates.items) {
    data.businesses[idx].items = updates.items;
  }
  save(data);
  addActivity(`Updated business "${data.businesses[idx].name}"`, data.businesses[idx].name, 'business', data.businesses[idx].name);
  return data.businesses[idx];
}

export function deleteBusiness(id) {
  const data = load();
  const business = data.businesses.find((b) => b.id === id);
  if (!business) return;
  data.businesses = data.businesses.filter((b) => b.id !== id);
  data.favourites = data.favourites.filter((f) => f.businessId !== id);
  save(data);
  addActivity(`Deleted business "${business.name}"`, business.name, 'business', business.name);
}

export function addItem(businessId, section, item) {
  const data = load();
  const business = data.businesses.find((b) => b.id === businessId);
  if (!business) return null;
  const newItem = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...item,
  };
  if (!business.items[section]) {
    business.items[section] = [];
  }
  business.items[section].push(newItem);
  save(data);
  addActivity(`Added ${section.slice(0, -1)} "${newItem.title || newItem.name}"`, business.name, section, newItem.title || newItem.name);
  return newItem;
}

export function updateItem(businessId, section, itemId, updates) {
  const data = load();
  const business = data.businesses.find((b) => b.id === businessId);
  if (!business || !business.items[section]) return null;
  const idx = business.items[section].findIndex((i) => i.id === itemId);
  if (idx === -1) return null;
  business.items[section][idx] = { ...business.items[section][idx], ...updates };
  save(data);
  addActivity(`Updated ${section.slice(0, -1)} "${business.items[section][idx].title || business.items[section][idx].name}"`, business.name, section, business.items[section][idx].title || business.items[section][idx].name);
  return business.items[section][idx];
}

export function deleteItem(businessId, section, itemId) {
  const data = load();
  const business = data.businesses.find((b) => b.id === businessId);
  if (!business || !business.items[section]) return;
  const item = business.items[section].find((i) => i.id === itemId);
  business.items[section] = business.items[section].filter((i) => i.id !== itemId);
  data.favourites = data.favourites.filter((f) => !(f.businessId === businessId && f.section === section && f.itemId === itemId));
  save(data);
  if (item) {
    addActivity(`Deleted ${section.slice(0, -1)} "${item.title || item.name}"`, business.name, section, item.title || item.name);
  }
}

export function toggleFavourite(businessId, section, itemId) {
  const data = load();
  const idx = data.favourites.findIndex(
    (f) => f.businessId === businessId && f.section === section && f.itemId === itemId
  );
  if (idx >= 0) {
    data.favourites.splice(idx, 1);
  } else {
    data.favourites.push({ businessId, section, itemId });
  }
  save(data);
  return data.favourites;
}

export function isFavourite(favourites, businessId, section, itemId) {
  return favourites.some(
    (f) => f.businessId === businessId && f.section === section && f.itemId === itemId
  );
}

export function addActivity(action, businessName, itemType, itemName) {
  const data = load();
  data.activity.unshift({
    id: crypto.randomUUID(),
    action,
    businessName: businessName || '',
    itemType: itemType || '',
    itemName: itemName || '',
    timestamp: new Date().toISOString(),
  });
  if (data.activity.length > 200) {
    data.activity = data.activity.slice(0, 200);
  }
  save(data);
}

export function getRecentActivity(count = 50) {
  const data = load();
  return data.activity.slice(0, count);
}

export function getItemCount(business) {
  if (!business || !business.items) return 0;
  return Object.values(business.items).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
}
