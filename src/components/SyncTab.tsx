import React from 'react';
import { WebSyncConfig } from '../types';
import { APPS_SCRIPT_CODE } from '../appsScriptCode';

interface SyncTabProps {
  syncConfig: WebSyncConfig;
  setSyncConfig: React.Dispatch<React.SetStateAction<WebSyncConfig>>;
  handleSaveConfig: (e: React.FormEvent) => Promise<void> | void;
  apiStatus: string;
  triggerAlert: (type: 'success' | 'warning' | 'error' | 'info', text: string) => void;
}

export default function SyncTab({
  syncConfig,
  setSyncConfig,
  handleSaveConfig,
  apiStatus,
  triggerAlert
}: SyncTabProps) {
  return (
    <div className="space-y-6 animate-in duration-300 font-sans">
      
      {/* COPIER / SYNC SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONF PANEL */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
          <div>
            <h3 className="font-black text-slate-800 text-sm font-display">Configure Google Sheets Link</h3>
            <p className="text-xs text-slate-500 mt-1">Toggle live mode and coordinate web connections directly with sheets.</p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/65 rounded-2xl">
              <div>
                <span className="font-bold text-xs text-slate-800 block">Live Sync Mode</span>
                <span className="text-[10px] text-slate-400 block font-semibold">Toggle actual API write queries</span>
              </div>
              <input
                id="live_sync_toggle"
                type="checkbox"
                className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                checked={syncConfig.enabled}
                onChange={(e) => setSyncConfig({ ...syncConfig, enabled: e.target.checked })}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide" htmlFor="apps_script_url">Apps Script Web App URL</label>
              <input
                id="apps_script_url"
                type="url"
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-slate-50 text-slate-800 font-mono transition-all"
                value={syncConfig.appsScriptUrl}
                onChange={(e) => setSyncConfig({ ...syncConfig, appsScriptUrl: e.target.value })}
              />
            </div>

            <div>
              <button
                id="save_sync_config_btn"
                type="submit"
                className="w-full min-h-[44px] bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-100"
              >
                Save Settings Profile
              </button>
            </div>
          </form>

          {/* CURRENT STATUS */}
          <div className="border-t border-slate-100 pt-4 flex gap-3.5 text-xs font-bold">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider">Status Network</span>
              <span className={`font-bold uppercase tracking-wider block mt-0.5 ${
                apiStatus === 'connected' ? 'text-emerald-700' :
                apiStatus === 'testing' ? 'text-indigo-600' :
                'text-slate-500'
              }`}>
                {apiStatus === 'connected' ? '● Connected' :
                 apiStatus === 'testing' ? '● Testing...' :
                 '● Local Sandbox Mode'}
              </span>
            </div>
          </div>
        </div>

        {/* APPS SCRIPT CODE VIEWER WRAPPER */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-slate-800 text-sm font-display">Create Backend - Google Apps Script Code</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Copy and paste this script inside Extensions &gt; Apps Script in your spreadsheet layout.</p>
            </div>
            <button
              id="copy_apps_script_btn"
              onClick={() => {
                navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                triggerAlert('success', 'Apps Script code copied to clipboard successfully!');
              }}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all"
            >
              Copy Script Code
            </button>
          </div>

          <div className="bg-slate-900 text-indigo-200 p-4 rounded-2xl overflow-x-auto font-mono text-xs max-h-80 select-all border border-slate-800 leading-relaxed text-left">
            <pre>{APPS_SCRIPT_CODE}</pre>
          </div>

          {/* SHEET SETUP INSTRUCTIONS */}
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-950 text-xs leading-relaxed space-y-1.5 font-sans">
            <span className="font-black block text-amber-800 uppercase tracking-widest text-[10px]">🔥 Crucial Google Sheets Setup Mapping:</span>
            <p className="font-semibold">1. Tab 1 name MUST be <strong className="text-amber-900 underline">"Fms"</strong>. Headers starts at <strong>Row 5</strong> (Data appends starting from Row 6).</p>
            <p className="font-semibold">2. Column headers must match EXACTLY: <code className="bg-amber-105 px-1 py-0.5 rounded">Timestamp | Visit No. | Sales Person Name | Party Name | Location | Date Of Visit | Planned | Actual | Delay | Head Of Visit | Concern Person | What Did The Customer Say | Next Visit Date</code>.</p>
            <p className="font-semibold">3. Tab 2 name MUST be <strong className="text-amber-900 underline">"Master"</strong>. Row 1: <code className="bg-amber-105 px-1 py-0.5 rounded">Party Name | Location</code>.</p>
            <p className="font-semibold">4. Tab 3 name MUST be <strong className="text-amber-900 underline">"Users"</strong>. Row 1: <code className="bg-amber-105 px-1 py-0.5 rounded">Username | Password | Name | Role</code>.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
