import React, { useCallback, useMemo } from 'react';
import { User as UserType } from '../types';
import {
  X,
  TrendingUp,
  PlusCircle,
  FileText,
  BarChart3,
  Building2,
  Users,
  Database,
  LogOut,
  Zap,
  ChevronRight,
  Circle,
  Layers,
  Activity,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentUser: UserType;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  apiStatus: string;
  handleLogout: () => void;
  totalMyVisits: number;
  partiesCount: number;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

// --- Reusable Nav Item Component ---
interface NavItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  tabKey: string;
  activeTab: string;
  onClick: () => void;
  badge?: number | string;
  badgeColor?: string;
}

const NavItem = React.memo(({ id, icon, label, tabKey, activeTab, onClick, badge, badgeColor = 'bg-blue-50 text-blue-600' }: NavItemProps) => {
  const isActive = activeTab === tabKey;

  return (
    <button
      id={id}
      onClick={onClick}
      className={`group relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 cursor-pointer ${isActive
        ? 'bg-blue-50 text-blue-700 shadow-sm'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator line */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-full" />
      )}

      <span className={`transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`}>
        {icon}
      </span>

      <span className="flex-1 text-left">{label}</span>

      {badge !== undefined && badge !== null && badge !== 0 && (
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${badgeColor} transition-all group-hover:scale-105`}>
          {badge}
        </span>
      )}

      {isActive && <ChevronRight size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
});

// --- Main Component ---

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  apiStatus,
  handleLogout,
  totalMyVisits,
  partiesCount,
  handleRefresh,
  isRefreshing
}: SidebarProps) {

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, [setActiveTab, setSidebarOpen]);

  // API status configuration for better display
  const apiStatusConfig = useMemo(() => {
    switch (apiStatus) {
      case 'connected':
        return { label: '', color: 'bg-emerald-500', pulse: true, icon: <Zap size={12} /> };
      case 'testing':
        return { label: 'Testing Connection', color: 'bg-indigo-500', pulse: true, icon: <Activity size={12} /> };
      default:
        return { label: 'Offline Mode', color: 'bg-slate-400', pulse: false, icon: <Database size={12} /> };
    }
  }, [apiStatus]);

  // User initials for avatar
  const userInitials = useMemo(() => {
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  }, [currentUser.name]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 bg-white border-r border-slate-200 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:sticky md:top-0 md:h-screen transition-transform duration-300 ease-in-out z-40 flex flex-col justify-between shrink-0 shadow-sm font-sans`}
      >
        {/* Header Section */}
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xl shrink-0">
                    V
                  </div>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 block tracking-tight text-lg leading-tight">
                    Visit Tracker
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-widest block">
                    {currentUser.role === 'Admin' ? '' : ''}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer ${isRefreshing ? 'opacity-50 cursor-wait' : ''}`}
                  title="Refresh Data"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Card - Enhanced */}
          <div className="px-5 pt-5 pb-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-semibold text-base shrink-0">
                    {userInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-[14px] truncate">{currentUser.name}</p>
                  <p className="text-[12px] text-slate-500 truncate flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    @{currentUser.username}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Main navigation">
            <NavItem
              id="tab_home_btn"
              icon={<TrendingUp size={18} />}
              label="Dashboard"
              tabKey="home"
              activeTab={activeTab}
              onClick={() => handleTabChange('home')}
            />


            <NavItem
              id="tab_logs_btn"
              icon={<FileText size={18} />}
              label="Visit Log Sheet"
              tabKey="logs"
              activeTab={activeTab}
              onClick={() => handleTabChange('logs')}
              badge={totalMyVisits > 0 ? totalMyVisits : undefined}
              badgeColor="bg-blue-50 text-blue-600"
            />

            <NavItem
              id="tab_records_btn"
              icon={<Layers size={18} />}
              label="Completed Records"
              tabKey="records"
              activeTab={activeTab}
              onClick={() => handleTabChange('records')}
            />

            <NavItem
              id="tab_reports_btn"
              icon={<BarChart3 size={18} />}
              label="Reports & Export"
              tabKey="reports"
              activeTab={activeTab}
              onClick={() => handleTabChange('reports')}
            />

            <NavItem
              id="tab_clients_btn"
              icon={<Building2 size={18} />}
              label="Master Parties"
              tabKey="clients"
              activeTab={activeTab}
              onClick={() => handleTabChange('clients')}
              badge={partiesCount > 0 ? partiesCount : undefined}
              badgeColor="bg-blue-50 text-blue-600"
            />

            {currentUser.role === 'Admin' && (
              <NavItem
                id="tab_users_btn"
                icon={<Users size={18} />}
                label="Users"
                tabKey="users"
                activeTab={activeTab}
                onClick={() => handleTabChange('users')}
              />
            )}

            {/* Google Sheet Sync tab hidden as requested
            <NavItem
              id="tab_sync_btn"
              icon={<Database size={18} />}
              label="Google Sheet Sync"
              tabKey="sync"
              activeTab={activeTab}
              onClick={() => handleTabChange('sync')}
            />
            */}
          </nav>

          {/* Footer Section */}
          <div className="border-t border-slate-100 bg-slate-50/30 p-5 mt-auto">
            {/* Sync Status */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${apiStatusConfig.color} ${apiStatusConfig.pulse ? 'animate-pulse' : ''}`} />
                  <span className="font-medium text-slate-400 text-[11px] uppercase tracking-widest">
                    {apiStatusConfig.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  {apiStatusConfig.icon}
                  {apiStatus === 'connected' ? 'Live' : apiStatus === 'testing' ? 'Testing' : 'Local'}
                </span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5 leading-relaxed">
                {apiStatus === 'connected' && ''}
                {apiStatus === 'testing' && 'Verifying web app connectivity...'}
                {apiStatus === 'disconnected' && 'Running in offline simulation mode'}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group w-full h-[44px] border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Log Out</span>
            </button>

            {/* Version / copyright hint */}
            <div className="text-center mt-4">
              <span className="text-[9px] text-slate-300 font-mono"></span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}