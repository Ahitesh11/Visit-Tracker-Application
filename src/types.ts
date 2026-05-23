export interface FmsVisit {
  id: string; // Internal unique ID
  timestamp: string; // ISO String or Format: YYYY-MM-DD HH:mm:ss
  visitNo: string; // Visit No. (e.g. VIS-1001)
  salesPersonName: string; // Name of sales person
  partyName: string; // Master Party selection
  location: string; // Location of party or GPS cords
  dateOfVisit: string; // Date (YYYY-MM-DD)
  headOfVisit?: string;
  concernPerson?: string;
  whatCustomerSaid?: string;
  nextVisitDate?: string;
  actual?: string;
  planned?: string;
  delay?: string;
}

export interface MasterParty {
  id: string;
  partyName: string;
  location: string;
  concernPerson?: string; // Optional helper for context
}

export interface User {
  username: string;
  name: string;
  role: 'Admin' | 'Salesperson';
  password?: string;
}

export type WebSyncConfig = {
  enabled: boolean;
  appsScriptUrl: string;
};
