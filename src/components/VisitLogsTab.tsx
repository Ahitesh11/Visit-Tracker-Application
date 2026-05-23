import React from 'react';
import { User as UserType, FmsVisit } from '../types';
import { Search, MapPin, Trash2, Edit } from 'lucide-react';

interface VisitLogsTabProps {
  currentUser: UserType;
  filteredVisits: FmsVisit[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedSalesPersonFilter: string;
  setSelectedSalesPersonFilter: React.Dispatch<React.SetStateAction<string>>;
  uniqueSalesPersons: string[];
  swipeState: { id: string; offset: number } | null;
  handleTouchStart: (e: React.TouchEvent, id: string) => void;
  handleTouchMove: (e: React.TouchEvent, id: string) => void;
  handleTouchEnd: (e: React.TouchEvent, item: FmsVisit) => void;
  startEditAction: (v: FmsVisit) => void;
  handleDeleteAction: (id: string) => void;
}

const formatTimestamp = (ts: string) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch(e) {
    return ts;
  }
};

export default function VisitLogsTab({
  currentUser,
  filteredVisits,
  searchQuery,
  setSearchQuery,
  selectedSalesPersonFilter,
  setSelectedSalesPersonFilter,
  uniqueSalesPersons,
  swipeState,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  startEditAction,
  handleDeleteAction
}: VisitLogsTabProps) {
  return (
    <div className="space-y-6 animate-in duration-300 font-sans">

      {/* SEARCH FILTERS HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 font-display">Pending Records</h2>
            <span className="text-xs text-slate-500 font-bold"> <span className="text-indigo-600">{filteredVisits.length}</span> matching rows.</span>
          </div>

          {/* Quick Export reminder */}
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl font-bold font-mono">
            {/* Sheet Name: Fms (Heading Row 5) */}
          </span>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              id="logs_search_input"
              type="text"
              placeholder="Search party, details..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl text-xs border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold bg-slate-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sales Person Filters (Admin view only) */}
          <div>
            {currentUser.role === 'Admin' ? (
              <select
                id="salesperson_filter"
                className="w-full min-h-[44px] px-3.5 text-xs rounded-xl border border-slate-200 outline-none bg-slate-50 font-bold cursor-pointer"
                value={selectedSalesPersonFilter}
                onChange={(e) => setSelectedSalesPersonFilter(e.target.value)}
              >
                <option value="all">FMS Representative: All Staff</option>
                {uniqueSalesPersons.map(sp => (
                  <option key={sp} value={sp}>{sp}</option>
                ))}
              </select>
            ) : (
              <div className="min-h-[44px] flex items-center px-4 bg-slate-50 border border-slate-200/85 rounded-xl text-xs font-bold text-slate-500 text-center justify-center">
                Viewing My Records Only
              </div>
            )}
          </div>

          {/* Clear Button */}
          <button
            id="clear_filters_btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedSalesPersonFilter('all');
            }}
            className="w-full min-h-[44px] bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset Filter View
          </button>

        </div>
      </div>

      {/* LOGS TABLE (Responsive Swipe-to-delete card view for Mobile, Column grids for tables) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-2">

        {/* MOBILE DETAILED CARD LIST (< 768px View with Swipe metrics) */}
        <div className="md:hidden space-y-2.5 p-2">
          <div className="flex justify-end items-center text-[10px] text-slate-400 border-b border-slate-100 pb-2 mb-2 font-bold">
            <span>{filteredVisits.length} matches</span>
          </div>

          {filteredVisits.map((item) => {
            const isSwiping = swipeState?.id === item.id;
            const offset = isSwiping ? swipeState.offset : 0;

            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200 select-none bg-slate-50"
              >

                {/* Sliding Container Content */}
                <div
                  className="bg-white p-4 relative z-10 transition-transform duration-75 text-xs text-slate-700 font-medium"
                  style={{ transform: `translateX(${offset}px)` }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-[13px] block">{item.partyName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.visitNo} • {formatTimestamp(item.timestamp)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50/50 p-2 text-slate-600 mb-2 rounded-xl border border-slate-100">
                    <div><span className="text-slate-400 font-bold block">Agent:</span> {item.salesPersonName}</div>
                    <div><span className="text-slate-400 font-bold block">Date of Visit:</span> {item.dateOfVisit}</div>
                    <div className="col-span-2"><span className="text-slate-400 font-bold block">Location:</span> {item.location}</div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100">
                    <button
                      id={`mobile_edit_btn_${item.id}`}
                      onClick={() => startEditAction(item)}
                      className="px-3.5 py-1.5 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 font-bold text-slate-650 rounded-xl flex items-center gap-1 cursor-pointer transition text-[11px] active:scale-95"
                    >
                      <Edit size={12} /> Edit
                    </button>
                  </div>

                </div>
              </div>
            );
          })}

          {filteredVisits.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs font-bold">No matching visit logs could be found on the server.</div>
          )}
        </div>

        {/* DESKTOP FULL TABLE VIEW (Tablet & Desktop: Grid Tables) */}
        <div className="hidden md:block overflow-x-auto text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white font-bold border-b border-blue-700 text-[10px] uppercase tracking-wider">
                <th className="p-4">Visit No.</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Sales Person Name</th>
                <th className="p-4">Party Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Date Of Visit</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
              {filteredVisits.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/20 transition-all">

                  {/* Ticket info */}
                  <td className="p-4 font-bold text-indigo-650 font-mono text-xs">
                    {item.visitNo}
                  </td>

                  {/* Timestamp */}
                  <td className="p-4 text-[13px]">
                    <span className="block text-[10px] text-slate-400 font-mono mt-0.5">{formatTimestamp(item.timestamp)}</span>
                  </td>

                  {/* Sales Person */}
                  <td className="p-4 text-[13px] font-bold text-slate-800">
                    {item.salesPersonName}
                  </td>

                  {/* Party Name */}
                  <td className="p-4 font-bold text-slate-800">
                    {item.partyName}
                  </td>

                  {/* Location */}
                  <td className="p-4 text-[12px] text-slate-600">
                    <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" /> {item.location}</span>
                  </td>

                  {/* Date Of Visit */}
                  <td className="p-4 font-bold text-[13px] text-slate-700">
                    {item.dateOfVisit}
                  </td>

                  {/* Controls */}
                  <td className="p-4 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        id={`desktop_edit_btn_${item.id}`}
                        onClick={() => startEditAction(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all active:scale-95"
                        title="Edit Summary Record"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 text-xs font-bold">
                    No field visits found which match criteria. Select other filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
