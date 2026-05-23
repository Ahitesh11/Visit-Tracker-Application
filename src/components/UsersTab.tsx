import React from 'react';
import { User as UserType } from '../types';

interface UsersTabProps {
  users: UserType[];
  newUserData: { username: string; name: string };
  setNewUserData: React.Dispatch<React.SetStateAction<{ username: string; name: string }>>;
  handleAddSalesPerson: (e: React.FormEvent) => Promise<void> | void;
  userSuccessMsg: string;
}

export default function UsersTab({
  users,
  newUserData,
  setNewUserData,
  handleAddSalesPerson,
  userSuccessMsg
}: UsersTabProps) {
  return (
    <div className="space-y-6 animate-in duration-300 font-sans">
      
      {/* STAFF ROLES CONTROL BODY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: NEW ACCOUNT GENERATION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit">
          <h3 className="font-black text-slate-800 text-sm mb-4 border-b border-slate-100 pb-3 font-display">Register Field Representative</h3>
          
          {userSuccessMsg && (
            <div className="mb-4 bg-emerald-55 text-emerald-900 font-bold text-xs p-3.5 rounded-xl border border-emerald-100 animate-pulse">
              {userSuccessMsg}
            </div>
          )}

          <form onSubmit={handleAddSalesPerson} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5" htmlFor="sales_username">Unique Username *</label>
              <input
                id="sales_username"
                type="text"
                required
                placeholder="e.g. sadasya1"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-slate-50 text-slate-800 transition-all"
                value={newUserData.username}
                onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-widest mb-1.5" htmlFor="sales_fullname">Full Name *</label>
              <input
                id="sales_fullname"
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-slate-50 text-slate-800 transition-all"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                id="add_sales_user_btn"
                type="submit"
                className="w-full min-h-[46px] bg-indigo-650 text-white font-bold hover:bg-indigo-700 text-xs rounded-xl cursor-pointer shadow-md shadow-indigo-100 transition-all active:scale-95 hover:shadow-lg"
              >
                Add New Staff User
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: DISPLAY CURRENT TEAM MEMBERS */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm md:col-span-2 space-y-4">
          <div>
            <h3 className="font-black text-slate-800 text-sm font-display">FMS Registered Team & Login Credentials</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">These users correspond with Username database in Ffs / Master. All salespersons have access to input custom field schedules.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {users.map((staff, i) => (
              <div key={i} className="p-4 bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl flex items-center gap-3 justify-between hover:shadow-sm duration-200 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-black text-indigo-700 font-display">
                    {staff.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <span className="font-bold text-slate-800 text-xs block truncate">{staff.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">USER: <span className="text-indigo-600 font-bold">@{staff.username}</span> | PWD: 123</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-full ${
                  staff.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-55 text-indigo-700'
                }`}>{staff.role}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
