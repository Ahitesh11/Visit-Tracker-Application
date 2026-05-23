import React from 'react';
import { User as UserType, FmsVisit } from '../types';
import { Search, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

interface CompletedRecordsTabProps {
  currentUser: UserType;
  filteredVisits: FmsVisit[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedSalesPersonFilter: string;
  setSelectedSalesPersonFilter: React.Dispatch<React.SetStateAction<string>>;
  uniqueSalesPersons: string[];
  handleDeleteAction: (id: string) => void;
}

const formatDateSimple = (ts: string) => {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  } catch(e) {
    return ts;
  }
};

export default function CompletedRecordsTab({
  currentUser,
  filteredVisits,
  searchQuery,
  setSearchQuery,
  selectedSalesPersonFilter,
  setSelectedSalesPersonFilter,
  uniqueSalesPersons,
  handleDeleteAction
}: CompletedRecordsTabProps) {
  return (
    <div className="space-y-6 animate-in duration-300 font-sans">

      {/* SEARCH FILTERS HEADER BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800 font-display flex items-center gap-2">
              <CheckCircle2 className="text-emerald-500" /> Completed Records
            </h2>
            <span className="text-xs text-slate-500 font-bold">Total completed visits: <span className="text-emerald-600">{filteredVisits.length}</span></span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search party, details..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl text-xs border border-slate-200 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-bold bg-slate-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sales Person Filters (Admin view only) */}
          <div>
            {currentUser.role === 'Admin' ? (
              <select
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
            onClick={() => {
              setSearchQuery('');
              setSelectedSalesPersonFilter('all');
            }}
            className="w-full min-h-[44px] bg-slate-50 hover:bg-slate-100 hover:text-emerald-600 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            Reset Filter View
          </button>

        </div>
      </div>

      {/* DESKTOP FULL TABLE VIEW (Responsive wrapper) */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-2">
        <div className="overflow-x-auto text-[13px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3 whitespace-nowrap">Timestamp</th>
                <th className="p-3 whitespace-nowrap">Visit No.</th>
                <th className="p-3 whitespace-nowrap">Sales Person Name</th>
                <th className="p-3 whitespace-nowrap">Party Name</th>
                <th className="p-3 whitespace-nowrap">Location</th>
                <th className="p-3 whitespace-nowrap">Date Of Visit</th>
                <th className="p-3 whitespace-nowrap">Planned</th>
                <th className="p-3 whitespace-nowrap">Actual</th>
                <th className="p-3 whitespace-nowrap">Delay</th>
                <th className="p-3 whitespace-nowrap">Head Of Visit</th>
                <th className="p-3 whitespace-nowrap">Concern Person</th>
                <th className="p-3 whitespace-nowrap">What Did The Customer Say</th>
                <th className="p-3 whitespace-nowrap">Next Visit Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {filteredVisits.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-all text-[11px]">
                  <td className="p-3 whitespace-nowrap text-[10px] text-slate-400 font-mono">{formatDateSimple(item.timestamp)}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-700 font-mono">{item.visitNo}</td>
                  <td className="p-3 whitespace-nowrap">{item.salesPersonName}</td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-800">{item.partyName}</td>
                  <td className="p-3 min-w-[150px]">{item.location}</td>
                  <td className="p-3 whitespace-nowrap">{item.dateOfVisit}</td>
                  <td className="p-3 whitespace-nowrap">{formatDateSimple(item.planned) || '-'}</td>
                  <td className="p-3 whitespace-nowrap text-emerald-600 font-bold">{formatDateSimple(item.actual) || '-'}</td>
                  <td className="p-3 whitespace-nowrap">{item.delay || '-'}</td>
                  <td className="p-3 whitespace-nowrap">{item.headOfVisit || '-'}</td>
                  <td className="p-3 whitespace-nowrap">{item.concernPerson || '-'}</td>
                  <td className="p-3 min-w-[200px]">{item.whatCustomerSaid || '-'}</td>
                  <td className="p-3 whitespace-nowrap">{item.nextVisitDate || '-'}</td>
                </tr>
              ))}
              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-12 text-center text-slate-400 text-xs font-bold">
                    No completed records found.
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
