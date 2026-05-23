import { FmsVisit, MasterParty, User, WebSyncConfig } from './types';
import { INITIAL_USERS, INITIAL_PARTIES, INITIAL_VISITS } from './initialData';

// Storage keys
const STORAGE_KEY_VISITS = 'fms_visits';
const STORAGE_KEY_PARTIES = 'fms_parties';
const STORAGE_KEY_USERS = 'fms_users';
const STORAGE_KEY_CONFIG = 'fms_config';
const STORAGE_KEY_CURRENT_USER = 'fms_current_user';

// Initialize default data if not present
export function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEY_VISITS)) {
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(INITIAL_VISITS));
  }
  if (!localStorage.getItem(STORAGE_KEY_PARTIES)) {
    localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(INITIAL_PARTIES));
  }
  if (!localStorage.getItem(STORAGE_KEY_USERS)) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEY_CONFIG)) {
    const envUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string) || '';
    const defaultConfig: WebSyncConfig = {
      enabled: !!envUrl,
      appsScriptUrl: envUrl
    };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(defaultConfig));
  }
}

// Fetch all local visits
export function getLocalVisits(): FmsVisit[] {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEY_VISITS);
  return raw ? JSON.parse(raw) : [];
}

// Fetch all local parties
export function getLocalParties(): MasterParty[] {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEY_PARTIES);
  return raw ? JSON.parse(raw) : [];
}

// Helper to normalize user data from various possible Apps Script output formats
export function normalizeUser(u: any): User {
  const exactName = u['Sales Person Name'] || u.salesPersonName;
  const exactRole = u['Role'];
  const rawName = u.name || '';
  const rawRole = u.role || '';

  let trueName = exactName || rawName;
  let trueRole = exactRole || rawRole;

  if (['Admin', 'Staff', 'Salesperson'].includes(rawName)) {
    trueRole = rawName;
    trueName = exactName || rawRole;
  }

  return {
    username: u.username || u.Username || '',
    password: u.password || u.Password || '',
    name: trueName,
    role: (trueRole === 'Admin' ? 'Admin' : 'Salesperson')
  };
}

// Fetch all local users
export function getLocalUsers(): User[] {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEY_USERS);
  const parsed = raw ? JSON.parse(raw) : [];
  return parsed.map(normalizeUser);
}

// Fetch current active user
export function getLoggedInUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

// Set current active user
export function setLoggedInUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
}

// Fetch web synchronization configurations
export function getSyncConfig(): WebSyncConfig {
  initLocalStorage();
  const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (raw) {
    try {
      const config = JSON.parse(raw) as WebSyncConfig;
      const envUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string) || '';
      if (!config.appsScriptUrl && envUrl) {
        config.appsScriptUrl = envUrl;
        config.enabled = true;
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
      }
      return config;
    } catch {
      // fallback
    }
  }
  const envUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string) || '';
  return { enabled: !!envUrl, appsScriptUrl: envUrl };
}

// Save config
export function saveSyncConfig(config: WebSyncConfig) {
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
}

// -------------------------------------------------------------
// LIVE APPS SCRIPT API COMMUNICATIONS
// -------------------------------------------------------------

export async function fetchLiveVisits(url: string): Promise<FmsVisit[]> {
  try {
    const res = await fetch(`${url}?action=getVisits`, {
      method: 'GET',
      mode: 'cors'
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.error || 'Unknown Apps Script error');
  } catch (err) {
    console.error('Failed to load visits from Apps Script. Using local.', err);
    throw err;
  }
}

export async function fetchLiveParties(url: string): Promise<MasterParty[]> {
  try {
    const res = await fetch(`${url}?action=getMasters`, {
      method: 'GET',
      mode: 'cors'
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    throw new Error(json.error || 'Unknown Apps Script error');
  } catch (err) {
    console.error('Failed to load masters from Apps Script. Using local.', err);
    throw err;
  }
}

export async function fetchLiveUsers(url: string): Promise<User[]> {
  try {
    const res = await fetch(`${url}?action=getUsers`, {
      method: 'GET',
      mode: 'cors'
    });
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data.map(normalizeUser);
    }
    throw new Error(json.error || 'Unknown Apps Script error');
  } catch (err) {
    console.error('Failed to load users from Apps Script. Using local.', err);
    throw err;
  }
}

// -------------------------------------------------------------
// CORE MUTATORS (Appends, Updates, Deletions)
// -------------------------------------------------------------

export async function addVisitToDatabase(visit: Omit<FmsVisit, 'id' | 'timestamp' | 'visitNo'>): Promise<{ success: boolean; id: string; visitNo: string }> {
  const list = getLocalVisits();
  const config = getSyncConfig();
  
  // Create randomized compliant Visit Number
  const visitCode = `VIS-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const formatTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const newVisit: FmsVisit = {
    ...visit,
    id: `local-${Date.now()}`,
    timestamp: formatTime,
    visitNo: visitCode
  };

  // 1. Save Locally
  list.unshift(newVisit); // Add to top
  localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(list));

  // 2. Apps Script sync if enabled
  if (config.enabled && config.appsScriptUrl) {
    try {
      const response = await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script POST avoids preflight block
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addVisit',
          data: {
            "Timestamp": newVisit.timestamp,
            "Visit No.": visitCode,
            "Sales Person Name": visit.salesPersonName,
            "Party Name": visit.partyName,
            "Location": visit.location,
            "Date Of Visit": visit.dateOfVisit,
            "Head Of Visit": visit.headOfVisit || "",
            "Concern Person": visit.concernPerson || "",
            "What Did The Customer Say": visit.whatCustomerSaid || "",
            "Next Visit Date": visit.nextVisitDate || "",
            "Actual": visit.actual || "",
            
            // CamelCase fallbacks
            timestamp: newVisit.timestamp,
            visitNo: visitCode,
            salesPersonName: visit.salesPersonName,
            partyName: visit.partyName,
            location: visit.location,
            dateOfVisit: visit.dateOfVisit,
            headOfVisit: visit.headOfVisit || "",
            concernPerson: visit.concernPerson || "",
            whatCustomerSaid: visit.whatCustomerSaid || "",
            nextVisitDate: visit.nextVisitDate || "",
            actual: visit.actual || ""
          }
        })
      });
      console.log('Apps Script call processed safely (no-cors mode).');
    } catch (e) {
      console.error('Remote sync push issue:', e);
    }
  }

  return { success: true, id: newVisit.id, visitNo: visitCode };
}

export async function updateVisitInDatabase(visit: FmsVisit): Promise<{ success: boolean }> {
  const list = getLocalVisits();
  const config = getSyncConfig();

  // 1. Update Locally
  const idx = list.findIndex(v => v.id === visit.id);
  if (idx !== -1) {
    list[idx] = { ...visit };
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(list));
  }

  // 2. Apps Script sync if enabled
  if (config.enabled && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateVisit',
          data: {
            id: visit.id,
            "Timestamp": visit.timestamp,
            "Visit No.": visit.visitNo,
            "Sales Person Name": visit.salesPersonName,
            "Party Name": visit.partyName,
            "Location": visit.location,
            "Date Of Visit": visit.dateOfVisit,
            "Head Of Visit": visit.headOfVisit || "",
            "Concern Person": visit.concernPerson || "",
            "What Did The Customer Say": visit.whatCustomerSaid || "",
            "Next Visit Date": visit.nextVisitDate || "",
            "Actual": visit.actual || "",

            // CamelCase fallbacks
            timestamp: visit.timestamp,
            visitNo: visit.visitNo,
            salesPersonName: visit.salesPersonName,
            partyName: visit.partyName,
            location: visit.location,
            dateOfVisit: visit.dateOfVisit,
            headOfVisit: visit.headOfVisit || "",
            concernPerson: visit.concernPerson || "",
            whatCustomerSaid: visit.whatCustomerSaid || "",
            nextVisitDate: visit.nextVisitDate || "",
            actual: visit.actual || ""
          }
        })
      });
    } catch (e) {
      console.error('Remote update issue:', e);
    }
  }

  return { success: true };
}

export async function deleteVisitFromDatabase(id: string): Promise<{ success: boolean }> {
  const list = getLocalVisits();
  const config = getSyncConfig();

  // 1. Delete Locally
  const filtered = list.filter(v => v.id !== id);
  localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(filtered));

  // 2. Remote deletion if enabled
  if (config.enabled && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteVisit',
          id: id
        })
      });
    } catch (e) {
      console.error('Remote delete issue:', e);
    }
  }

  return { success: true };
}

// -------------------------------------------------------------
// MASTER PARTY CONFIGURATIONS
// -------------------------------------------------------------

export async function addPartyToMaster(partyName: string, location: string): Promise<MasterParty> {
  const list = getLocalParties();
  const config = getSyncConfig();
  
  const newItem: MasterParty = {
    id: `m-local-${Date.now()}`,
    partyName,
    location
  };

  list.push(newItem);
  localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(list));

  // Sync if configured
  if (config.enabled && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'addMaster',
          data: { partyName, location }
        })
      });
    } catch (e) {
      console.error('Remote Master add issue', e);
    }
  }

  return newItem;
}

export async function deletePartyFromMaster(id: string): Promise<boolean> {
  const list = getLocalParties();
  const filtered = list.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PARTIES, JSON.stringify(filtered));

  const config = getSyncConfig();
  if (config.enabled && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'deleteMaster',
          id: id
        })
      });
    } catch (e) {
      console.error(e);
    }
  }
  return true;
}

// -------------------------------------------------------------
// USER MANAGEMENT
// -------------------------------------------------------------

export async function registerSalesPerson(username: string, name: string): Promise<User> {
  const list = getLocalUsers();
  const config = getSyncConfig();

  const newUser: User = {
    username: username.toLowerCase().trim(),
    name,
    password: '123', // default initial key
    role: 'Salesperson'
  };

  list.push(newUser);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(list));

  if (config.enabled && config.appsScriptUrl) {
    try {
      await fetch(config.appsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'addUser',
          data: newUser
        })
      });
    } catch (e) {
      console.error('Remote user add issue', e);
    }
  }

  return newUser;
}
