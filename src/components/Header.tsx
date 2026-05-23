import React from 'react';
import { User as UserType } from '../types';
import { Menu, LogOut, RefreshCw } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: UserType;
  handleLogout: () => void;
  handleRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({
  setSidebarOpen,
  currentUser,
  handleLogout,
  handleRefresh,
  isRefreshing
}: HeaderProps) {
  return (
    <header className="p-4 bg-white border-b border-slate-100 flex items-center justify-between md:hidden shadow-sm z-30 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          id="menu_hamburger_btn"
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-slate-900 leading-tight">FMS Visit Tracker</span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`hidden sm:inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
          currentUser.role === 'Admin' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {currentUser.role}
        </span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer ${isRefreshing ? 'opacity-50 cursor-wait' : ''}`}
          title="Refresh Data"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
        <button
          id="quick_logout_head_btn"
          onClick={handleLogout}
          className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
