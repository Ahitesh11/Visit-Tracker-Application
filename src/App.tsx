import React, { useState, useEffect, useRef } from 'react';
import {
  Info,
  TrendingUp,
  PlusCircle,
  FileText,
  BarChart3,
  Building2
} from 'lucide-react';
import { FmsVisit, MasterParty, User as UserType, WebSyncConfig } from './types';
import {
  getLocalVisits,
  getLocalParties,
  getLocalUsers,
  getLoggedInUser,
  setLoggedInUser,
  getSyncConfig,
  saveSyncConfig,
  addVisitToDatabase,
  updateVisitInDatabase,
  deleteVisitFromDatabase,
  addPartyToMaster,
  deletePartyFromMaster,
  registerSalesPerson,
  initLocalStorage,
  normalizeUser
} from './syncService';

import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HomeTab from './components/HomeTab';
import AddVisitTab from './components/AddVisitTab';
import VisitLogsTab from './components/VisitLogsTab';
import MasterPartiesTab from './components/MasterPartiesTab';
import ReportsTab from './components/ReportsTab';
import UsersTab from './components/UsersTab';
import SyncTab from './components/SyncTab';
import CompletedRecordsTab from './components/CompletedRecordsTab.tsx';


export default function App() {
  // Initialize context
  useEffect(() => {
    initLocalStorage();
  }, []);

  // Application States
  const [visits, setVisits] = useState<FmsVisit[]>([]);
  const [parties, setParties] = useState<MasterParty[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [syncConfig, setSyncConfig] = useState<WebSyncConfig>({ enabled: false, appsScriptUrl: '' });
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  
  // Navigation & UI controls
  const [activeTab, setActiveTab] = useState<'home' | 'logs' | 'records' | 'clients' | 'sync' | 'users' | 'reports'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSalesPersonFilter, setSelectedSalesPersonFilter] = useState('all');
  
  // Form handling state
  const [editingVisit, setEditingVisit] = useState<FmsVisit | null>(null);
  const [formData, setFormData] = useState({
    partyName: '',
    location: '',
    dateOfVisit: new Date().toISOString().split('T')[0],
    salesPersonName: ''
  });

  // Master Party Form
  const [newPartyData, setNewPartyData] = useState({ partyName: '', location: '', concernPerson: '' });
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);

  // New Salesperson User Form
  const [newUserData, setNewUserData] = useState({ username: '', name: '' });
  const [userSuccessMsg, setUserSuccessMsg] = useState('');

  // Login Form
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Info notification banners
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [alertBanner, setAlertBanner] = useState<{ type: 'success' | 'warning' | 'error' | 'info', text: string } | null>(null);

  // Custom Reporting States
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportSalesperson, setReportSalesperson] = useState('all');
  const [reportParty, setReportParty] = useState('all');
  const [reportStatus, setReportStatus] = useState('all');

  // Swipe-to-delete helpers (tracked per visit ID)
  const [swipeState, setSwipeState] = useState<{ id: string; offset: number } | null>(null);
  const touchStartX = useRef<number>(0);

  // Load initial datasets from LocalStorage
  const refreshAllData = async () => {
    const v = getLocalVisits();
    const p = getLocalParties();
    const u = getLocalUsers();
    const conf = getSyncConfig();
    const user = getLoggedInUser();

    setVisits(v);
    setParties(p);
    setUsers(u);
    setSyncConfig(conf);
    setCurrentUser(user);

    // If live synchronization is enabled and URL is set, pull live data securely
    if (conf.enabled && conf.appsScriptUrl) {
      setApiStatus('testing');
      try {
        const liveRes = await fetch(`${conf.appsScriptUrl}?action=getVisits`);
        const liveJson = await liveRes.json();
        if (liveJson.success && Array.isArray(liveJson.data)) {
          // Filter out header rows that might be accidentally returned by the Apps Script
          const validVisits = liveJson.data.filter((v: any) => 
            v.visitNo !== 'Visit No.' && 
            v.timestamp !== 'Timestamp' && 
            v.partyName !== 'Party Name'
          );
          setVisits(validVisits);
          // Sync back to local storage for offline support
          localStorage.setItem('fms_visits', JSON.stringify(validVisits));
        }

        const liveParty = await fetch(`${conf.appsScriptUrl}?action=getMasters`);
        const livePartyJson = await liveParty.json();
        if (livePartyJson.success && Array.isArray(livePartyJson.data)) {
          setParties(livePartyJson.data);
          localStorage.setItem('fms_parties', JSON.stringify(livePartyJson.data));
        }

        const liveUsersRes = await fetch(`${conf.appsScriptUrl}?action=getUsers`);
        const liveUsersJson = await liveUsersRes.json();
        if (liveUsersJson.success && Array.isArray(liveUsersJson.data)) {
          const normalizedUsers = liveUsersJson.data.map(normalizeUser);
          setUsers(normalizedUsers);
          localStorage.setItem('fms_users', JSON.stringify(normalizedUsers));
        }

        setApiStatus('connected');
      } catch (e) {
        console.warn('Apps Script failed validation. Check CORS or URL status.', e);
        setApiStatus('disconnected');
      }
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    triggerAlert('info', 'Fetching latest data from Google Sheets...');
    await refreshAllData();
    setIsRefreshing(false);
    triggerAlert('success', 'Data refresh complete!');
  };

  useEffect(() => {
    refreshAllData();
  }, [currentUser?.username]);

  // Alert dismiss helper
  const triggerAlert = (type: 'success' | 'warning' | 'error' | 'info', text: string) => {
    setAlertBanner({ type, text });
    setTimeout(() => {
      setAlertBanner(null);
    }, 4500);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginData.username || !loginData.password) {
      setLoginError('Kripya username aur password fill karein.');
      return;
    }

    const localUsers = getLocalUsers();
    const match = localUsers.find(
      u => u.username.toLowerCase() === loginData.username.toLowerCase().trim() &&
           u.password === loginData.password
    );

    if (match) {
      setLoggedInUser(match);
      setCurrentUser(match);
      triggerAlert('success', `Welcome back, ${match.name}!`);
    } else {
      setLoginError('Galat Username ya Password. Kripya dhyan se check karein (Default Password is: 123).');
    }
  };

  // Quick Switch logins for presentation debugging ease
  const triggerQuickLogin = (uname: string) => {
    const localUsers = getLocalUsers();
    const match = localUsers.find(u => u.username === uname);
    if (match) {
      setLoggedInUser(match);
      setCurrentUser(match);
      triggerAlert('success', `Quick Logged in: ${match.name}`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setLoggedInUser(null);
    setCurrentUser(null);
    setActiveTab('home');
    triggerAlert('warning', 'Session logged out.');
  };

  // When Party Selector changes, pre-fill details from Master
  const handlePartySelect = (partyName: string) => {
    setFormData(prev => ({ ...prev, partyName }));
    const match = parties.find(p => p.partyName === partyName);
    if (match) {
      setFormData(prev => ({
        ...prev,
        location: match.location
      }));
    }
  };

  // Form submit handler (Add / Edit Visit)
  const handleSubmitVisitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyName || !formData.dateOfVisit) {
      triggerAlert('warning', 'Kripya sabhi mandatory fields (Party, Date) bharein.');
      return;
    }

    const payload = {
      salesPersonName: formData.salesPersonName || currentUser?.name || '',
      partyName: formData.partyName,
      location: formData.location,
      dateOfVisit: formData.dateOfVisit,
      headOfVisit: formData.headOfVisit,
      concernPerson: formData.concernPerson,
      whatCustomerSaid: formData.whatCustomerSaid,
      nextVisitDate: formData.nextVisitDate
    };

    try {
      if (editingVisit) {
        // Auto-assign the 'Actual' timestamp when updating
        const now = new Date();
        const formattedActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        // Perform Edit update
        await updateVisitInDatabase({
          ...editingVisit,
          ...payload,
          actual: formattedActual
        });
        triggerAlert('success', 'FMS visit summary updated successfully!');
        setEditingVisit(null);
      } else {
        // Create new
        const result = await addVisitToDatabase(payload);
        triggerAlert('success', `Visit Saved! Ticket Number Generated: ${result.visitNo}`);
      }

      // Reset Form fields
      setFormData({
        partyName: '',
        location: '',
        dateOfVisit: new Date().toISOString().split('T')[0],
        salesPersonName: currentUser?.name || ''
      });
      setShowAddVisitModal(false);
      refreshAllData();
    } catch (err: any) {
      triggerAlert('error', `Failed to append record: ${err.message}`);
    }
  };

  // Edit action
  const startEditAction = (v: FmsVisit) => {
    setEditingVisit(v);
    setFormData({
      partyName: v.partyName,
      location: v.location,
      dateOfVisit: v.dateOfVisit,
      headOfVisit: v.headOfVisit || '',
      concernPerson: v.concernPerson || '',
      whatCustomerSaid: v.whatCustomerSaid || '',
      nextVisitDate: v.nextVisitDate || '',
      salesPersonName: v.salesPersonName
    });
    setShowAddVisitModal(true);
    triggerAlert('info', `Editing Ticket: ${v.visitNo}`);
  };

  // Delete Action
  const handleDeleteAction = async (id: string) => {
    if (confirm('Kya aap is Field Visit summary ko permanent delete karna chahte hain?')) {
      await deleteVisitFromDatabase(id);
      triggerAlert('warning', 'Field Visit deleted.');
      refreshAllData();
    }
  };

  // Touch handlers for mobile swipe-to-delete action
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipeState({ id, offset: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!swipeState || swipeState.id !== id) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - touchStartX.current;
    
    // Allow dragging left up to -120px
    if (diff < 0) {
      const offset = Math.max(-120, diff);
      setSwipeState({ id, offset });
    } else {
      setSwipeState({ id, offset: 0 });
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent, item: FmsVisit) => {
    if (!swipeState || swipeState.id !== item.id) return;
    
    // If swiped more than 80px left, prompt deletion
    if (swipeState.offset < -75) {
      setSwipeState({ id: item.id, offset: -100 });
      setTimeout(async () => {
        if (confirm(`Delete visit summary ${item.visitNo} for ${item.partyName}?`)) {
          await deleteVisitFromDatabase(item.id);
          triggerAlert('warning', `Deleted ${item.visitNo}`);
          refreshAllData();
        }
        setSwipeState(null);
      }, 100);
    } else {
      setSwipeState(null);
    }
  };

  // Save Apps Script setting config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSyncConfig(syncConfig);
    triggerAlert('success', syncConfig.enabled ? 'Synced live with Google Sheets Apps Script!' : 'Google Sheets Sync Offline. Operating locally.');
    refreshAllData();
  };

  // Add Master Party
  const handleAddMasterPartySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyData.partyName || !newPartyData.location) {
      alert('Kripya Party Name aur Business Location bharein.');
      return;
    }
    await addPartyToMaster(newPartyData.partyName, newPartyData.location);
    setNewPartyData({ partyName: '', location: '', concernPerson: '' });
    setShowAddPartyModal(false);
    triggerAlert('success', 'Naya Party Master List mein safety se add kiya gaya.');
    refreshAllData();
  };

  // Delete Master Party
  const handleDeleteMasterParty = async (id: string) => {
    if (confirm('Kya aap is party ko list se sadasya hatana chahte hain?')) {
      await deletePartyFromMaster(id);
      triggerAlert('warning', 'Party deleted from master.');
      refreshAllData();
    }
  };

  // Add Sales Person (Admin only)
  const handleAddSalesPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username || !newUserData.name) {
      alert('Fill all user fields.');
      return;
    }
    await registerSalesPerson(newUserData.username, newUserData.name);
    setNewUserData({ username: '', name: '' });
    setUserSuccessMsg(`Registered! Password is: '123' by default.`);
    setTimeout(() => {
      setUserSuccessMsg('');
    }, 4000);
    refreshAllData();
  };

  // Calculations for Dashboards & Metrics
  const filteredVisits = visits.filter(v => {
    // Role logic restriction: Sales Persons ONLY see their own visits
    const matchedUserRole = currentUser?.role === 'Admin' || v.salesPersonName === currentUser?.name;
    
    // UI filter constraints
    const matchesSearch = 
      v.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.salesPersonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSalesPerson = selectedSalesPersonFilter === 'all' || v.salesPersonName === selectedSalesPersonFilter;

    return matchedUserRole && matchesSearch && matchesSalesPerson;
  });

  // Calculate stats for Dashboard
  const myScopeVisits = visits.filter(v => currentUser?.role === 'Admin' || v.salesPersonName === currentUser?.name);
  
  // Split into pending and completed (those with 'actual' timestamp)
  const pendingVisits = myScopeVisits.filter(v => !v.actual);
  const completedVisits = myScopeVisits.filter(v => !!v.actual);
  
  const totalMyVisits = pendingVisits.length;

  // Unique elements for filters dropdown (Admin only filter lists)
  const uniqueSalesPersons: string[] = Array.from(new Set(visits.map(v => v.salesPersonName)));

  // Master Sheet count
  const masterClientsCount = parties.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. TOP STATS BAR BANNER CONTROLS */}
      {alertBanner && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
          alertBanner.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          alertBanner.type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
          alertBanner.type === 'info' ? 'bg-blue-50 text-blue-900 border-blue-200' :
          'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <Info className={`mt-0.5 shrink-0 ${
            alertBanner.type === 'success' ? 'text-emerald-500' :
            alertBanner.type === 'warning' ? 'text-amber-500' :
            alertBanner.type === 'info' ? 'text-blue-500' :
            'text-rose-500'
          }`} size={18} />
          <div className="text-sm font-medium">{alertBanner.text}</div>
        </div>
      )}

      {/* 2. SECURITY LOGIN WRAPPER */}
      {!currentUser ? (
        <LoginScreen 
          loginError={loginError}
          handleLogin={handleLogin}
          loginData={loginData}
          setLoginData={setLoginData}
          triggerQuickLogin={triggerQuickLogin}
        />
      ) : (
        /* 3. CORE LOGGED-IN WORKSPACE */
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* SIDEBAR NAVIGATION - DESKTOP SCREEN */}
          <Sidebar 
            currentUser={currentUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            apiStatus={apiStatus}
            handleLogout={handleLogout}
            totalMyVisits={totalMyVisits}
            partiesCount={parties.length}
            handleRefresh={handleManualRefresh}
            isRefreshing={isRefreshing}
          />

          {/* MAIN CONTAINER CONTENT */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* MOBILE TOP CONTROLS & HEADER */}
            <Header 
              setSidebarOpen={setSidebarOpen}
              currentUser={currentUser}
              handleLogout={handleLogout}
              handleRefresh={handleManualRefresh}
              isRefreshing={isRefreshing}
            />

            {/* ROUTED CONTENT VIEW AREA */}
            <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'home' && (
                <HomeTab 
                  currentUser={currentUser}
                  visits={myScopeVisits}
                  parties={parties}
                  syncConfig={syncConfig}
                  totalMyVisits={totalMyVisits}
                  setActiveTab={setActiveTab}
                  myScopeVisits={myScopeVisits}
                  masterClientsCount={masterClientsCount}
                  onOpenAddModal={() => setShowAddVisitModal(true)}
                />
              )}

              {activeTab === 'logs' && (
                <VisitLogsTab 
                  currentUser={currentUser}
                  filteredVisits={pendingVisits}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedSalesPersonFilter={selectedSalesPersonFilter}
                  setSelectedSalesPersonFilter={setSelectedSalesPersonFilter}
                  uniqueSalesPersons={uniqueSalesPersons}
                  swipeState={swipeState}
                  handleTouchStart={handleTouchStart}
                  handleTouchMove={handleTouchMove}
                  handleTouchEnd={handleTouchEnd}
                  startEditAction={startEditAction}
                  handleDeleteAction={handleDeleteAction}
                />
              )}

              {activeTab === 'records' && (
                <CompletedRecordsTab 
                  currentUser={currentUser}
                  filteredVisits={completedVisits}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedSalesPersonFilter={selectedSalesPersonFilter}
                  setSelectedSalesPersonFilter={setSelectedSalesPersonFilter}
                  uniqueSalesPersons={uniqueSalesPersons}
                  handleDeleteAction={handleDeleteAction}
                />
              )}

              {activeTab === 'clients' && (
                <MasterPartiesTab 
                  parties={parties}
                  showAddPartyModal={showAddPartyModal}
                  setShowAddPartyModal={setShowAddPartyModal}
                  newPartyData={newPartyData}
                  setNewPartyData={setNewPartyData}
                  handleAddMasterPartySubmit={handleAddMasterPartySubmit}
                  handleDeleteMasterParty={handleDeleteMasterParty}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab 
                  currentUser={currentUser}
                  visits={myScopeVisits}
                  parties={parties}
                  uniqueSalespersons={uniqueSalesPersons}
                  reportStartDate={reportStartDate}
                  setReportStartDate={setReportStartDate}
                  reportEndDate={reportEndDate}
                  setReportEndDate={setReportEndDate}
                  reportSalesperson={reportSalesperson}
                  setReportSalesperson={setReportSalesperson}
                  reportParty={reportParty}
                  setReportParty={setReportParty}
                  syncConfig={syncConfig}
                  triggerAlert={triggerAlert}
                />
              )}

              {activeTab === 'users' && currentUser.role === 'Admin' && (
                <UsersTab 
                  users={users}
                  newUserData={newUserData}
                  setNewUserData={setNewUserData}
                  handleAddSalesPerson={handleAddSalesPerson}
                  userSuccessMsg={userSuccessMsg}
                />
              )}

              {activeTab === 'sync' && (
                <SyncTab 
                  syncConfig={syncConfig}
                  setSyncConfig={setSyncConfig}
                  handleSaveConfig={handleSaveConfig}
                  apiStatus={apiStatus}
                  triggerAlert={triggerAlert}
                />
              )}
            </div>
          </main>

          {/* 4. MOBILE BOTTOM ACTION SYSTEM BAR */}
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-30 md:hidden shadow-lg shadow-indigo-100">
            <button
              id="mobile_nav_home"
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 text-xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <TrendingUp size={18} />
              <span className="text-[10px]">Home</span>
            </button>
            <button
              id="mobile_nav_add"
              onClick={() => setShowAddVisitModal(true)}
              className="flex flex-col items-center gap-1 text-xs cursor-pointer transition-all active:scale-95 text-slate-400 font-medium"
            >
              <PlusCircle size={18} />
              <span className="text-[10px]">Add Visit</span>
            </button>
            <button
              id="mobile_nav_logs"
              onClick={() => setActiveTab('logs')}
              className={`flex flex-col items-center gap-1 text-xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'logs' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <FileText size={18} />
              <span className="text-[10px]">Logs Log</span>
            </button>
            <button
              id="mobile_nav_reports"
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center gap-1 text-xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'reports' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-[10px]">Reports</span>
            </button>
            <button
              id="mobile_nav_clients"
              onClick={() => setActiveTab('clients')}
              className={`flex flex-col items-center gap-1 text-xs cursor-pointer transition-all active:scale-95 ${
                activeTab === 'clients' ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <Building2 size={18} />
              <span className="text-[10px]">Clients</span>
            </button>
          </nav>
        </div>
      )}

      {/* GLOBAL MODALS */}

      {/* Add / Edit Visit Modal */}
      {showAddVisitModal && (
        <AddVisitTab 
          currentUser={currentUser}
          users={users}
          formData={formData}
          setFormData={setFormData}
          parties={parties}
          handlePartySelect={handlePartySelect}
          handleSubmitVisitForm={handleSubmitVisitForm}
          editingVisit={editingVisit}
          setEditingVisit={setEditingVisit}
          onClose={() => {
            setShowAddVisitModal(false);
            setEditingVisit(null);
          }}
        />
      )}
    </div>
  );
}
