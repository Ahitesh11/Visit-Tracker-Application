import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { User as UserType, FmsVisit, MasterParty } from '../types';
import {
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  X,
  Calendar,
  User,
  Building2,
  TrendingUp,
  RefreshCw,
  Table,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  Layers
} from 'lucide-react';

interface ReportsTabProps {
  currentUser: UserType;
  visits: FmsVisit[];
  parties: MasterParty[];
  uniqueSalespersons: string[];
  reportStartDate: string;
  setReportStartDate: React.Dispatch<React.SetStateAction<string>>;
  reportEndDate: string;
  setReportEndDate: React.Dispatch<React.SetStateAction<string>>;
  reportSalesperson: string;
  setReportSalesperson: React.Dispatch<React.SetStateAction<string>>;
  reportParty: string;
  setReportParty: React.Dispatch<React.SetStateAction<string>>;
  syncConfig: any;
  triggerAlert: (type: 'success' | 'warning' | 'error' | 'info', text: string) => void;
}

// --- Helper Components ---

interface FilterChipProps {
  label: string;
  onClear: () => void;
}

const FilterChip = React.memo(({ label, onClear }: FilterChipProps) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold border border-indigo-100">
    {label}
    <button onClick={onClear} className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors">
      <X size={10} />
    </button>
  </span>
));

interface StatSummaryCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  trend?: { value: number; isPositive: boolean };
}

const StatSummaryCard = React.memo(({ title, value, subtext, icon, iconBg, iconColor, valueColor, trend }: StatSummaryCardProps) => (
  <div className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${iconBg} ${iconColor} transition-all group-hover:scale-105 duration-200`}>
        {icon}
      </div>
      <div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{title}</span>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-xl font-black ${valueColor} font-display`}>{value}</span>
          {trend && (
            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp size={8} className={trend.isPositive ? '' : 'rotate-180'} />
              {trend.value}%
            </span>
          )}
        </div>
        {subtext && <span className="text-[9px] text-slate-400 mt-0.5 block">{subtext}</span>}
      </div>
    </div>
  </div>
));

// --- Main Component ---

export default function ReportsTab({
  currentUser,
  visits,
  parties,
  uniqueSalespersons,
  reportStartDate,
  setReportStartDate,
  reportEndDate,
  setReportEndDate,
  reportSalesperson,
  setReportSalesperson,
  reportParty,
  setReportParty,
  syncConfig,
  triggerAlert
}: ReportsTabProps) {
  const [showPreviewTable, setShowPreviewTable] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Compute filtered visits based on all criteria
  const reportFilteredVisits = useMemo(() => {
    return visits.filter(v => {
      const matchesRole = currentUser.role === 'Admin' || v.salesPersonName === currentUser.name;
      const matchesSalesperson = reportSalesperson === 'all' || v.salesPersonName === reportSalesperson;
      const matchesParty = reportParty === 'all' || v.partyName === reportParty;

      let matchesDate = true;
      if (reportStartDate) {
        matchesDate = matchesDate && v.dateOfVisit >= reportStartDate;
      }
      if (reportEndDate) {
        matchesDate = matchesDate && v.dateOfVisit <= reportEndDate;
      }

      return matchesRole && matchesSalesperson && matchesParty && matchesDate;
    });
  }, [visits, currentUser, reportSalesperson, reportParty, reportStartDate, reportEndDate]);

  // Derived analytics
  const totalMatching = reportFilteredVisits.length;

  // Active filters count for clearing
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (reportStartDate) count++;
    if (reportEndDate) count++;
    if (reportSalesperson !== 'all') count++;
    if (reportParty !== 'all') count++;
    return count;
  }, [reportStartDate, reportEndDate, reportSalesperson, reportParty]);

  const clearAllFilters = useCallback(() => {
    setReportStartDate('');
    setReportEndDate('');
    setReportSalesperson('all');
    setReportParty('all');
    triggerAlert('info', 'All filters have been cleared.');
  }, [setReportStartDate, setReportEndDate, setReportSalesperson, setReportParty, triggerAlert]);

  // Export CSV handler with loading state
  const handleExportCSV = useCallback(async () => {
    if (reportFilteredVisits.length === 0) {
      triggerAlert('warning', 'No records found to export!');
      return;
    }

    setIsExporting(true);

    // Simulate a tiny delay for better UX feedback
    await new Promise(resolve => setTimeout(resolve, 100));

    const headers = [
      'Timestamp', 'Visit No.', 'Sales Person Name', 'Party Name',
      'Location', 'Date Of Visit'
    ];

    const rows = reportFilteredVisits.map(v => [
      v.timestamp || '', v.visitNo || '', v.salesPersonName || '',
      v.partyName || '', v.location || '', v.dateOfVisit || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `FMS_Report_${today}_${reportFilteredVisits.length}records.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerAlert('success', `Exported ${reportFilteredVisits.length} records to CSV successfully!`);
    setIsExporting(false);
  }, [reportFilteredVisits, triggerAlert]);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header Section */}
      <div className="bg-gradient-to-r from-white to-indigo-50/30 border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-indigo-500" />
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Analytics & Export</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 font-display tracking-tight">Custom Reports</h2>
            <p className="text-sm text-slate-500 mt-1">Filter, analyze, and export field visit data with advanced criteria.</p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || totalMatching === 0}
            className={`px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
          >
            {isExporting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {isExporting ? 'Preparing...' : 'Export CSV Report'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Controls</span>
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
              >
                <X size={12} /> Clear all
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={12} /> From Date
              </label>
              <input
                type="date"
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium bg-white text-slate-700 transition-all"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={12} /> To Date
              </label>
              <input
                type="date"
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium bg-white text-slate-700 transition-all"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
              />
            </div>

            {/* Salesperson */}
            {currentUser.role === 'Admin' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                  <User size={12} /> Representative
                </label>
                <select
                  className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium bg-white text-slate-700 cursor-pointer"
                  value={reportSalesperson}
                  onChange={(e) => setReportSalesperson(e.target.value)}
                >
                  <option value="all">All ({uniqueSalespersons.length})</option>
                  {uniqueSalespersons.map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Party Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Building2 size={12} /> Party
              </label>
              <select
                className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 outline-none text-sm font-medium bg-white text-slate-700 cursor-pointer"
                value={reportParty}
                onChange={(e) => setReportParty(e.target.value)}
              >
                <option value="all">All Parties ({parties.length})</option>
                {parties.slice(0, 50).map(p => (
                  <option key={p.id} value={p.partyName}>{p.partyName}</option>
                ))}
                {parties.length > 50 && <option disabled>+{parties.length - 50} more</option>}
              </select>
            </div>


          </div>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-5 pt-3 border-t border-slate-100">
              {reportStartDate && (
                <FilterChip label={`From: ${reportStartDate}`} onClear={() => setReportStartDate('')} />
              )}
              {reportEndDate && (
                <FilterChip label={`To: ${reportEndDate}`} onClear={() => setReportEndDate('')} />
              )}
              {reportSalesperson !== 'all' && (
                <FilterChip label={`Rep: ${reportSalesperson}`} onClear={() => setReportSalesperson('all')} />
              )}
              {reportParty !== 'all' && (
                <FilterChip label={`Party: ${reportParty}`} onClear={() => setReportParty('all')} />
              )}

            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-3">
        <StatSummaryCard
          title="Total Records"
          value={totalMatching}
          icon={<FileText size={16} />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          valueColor="text-indigo-600"
          subtext="Filtered visits"
        />
      </div>

      {/* Info Card & Google Sheets Link */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Table size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Report Generation Engine</p>
            <p className="text-xs text-slate-500 max-w-md">
              Filters are applied in real-time. Click Export to download a CSV file compatible with Excel, Google Sheets, and other analytics tools.
            </p>
          </div>
        </div>
        {syncConfig?.enabled && syncConfig?.appsScriptUrl && (
          <a
            href={syncConfig.appsScriptUrl.replace('/exec', '').replace('/macros/s/', '/edit')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center gap-2 text-xs shadow-sm hover:shadow-md"
          >
            <Layers size={14} /> Open Google Sheet
          </a>
        )}
      </div>

      {/* Preview Table Toggle */}
      {totalMatching > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <button
            onClick={() => setShowPreviewTable(!showPreviewTable)}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-indigo-500" />
              <span className="font-bold text-slate-700 text-sm">Data Preview</span>
              <span className="text-xs text-slate-400">({totalMatching} records)</span>
            </div>
            {showPreviewTable ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
          </button>

          {showPreviewTable && (
            <div className="border-t border-slate-100 p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-blue-600 text-white font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Visit No</th>
                    <th className="p-3">Sales Person Name</th>
                    <th className="p-3">Party Name</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Date Of Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportFilteredVisits.slice(0, 20).map(visit => (
                    <tr key={visit.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="p-3">{visit.timestamp}</td>
                      <td className="p-3 font-mono font-bold text-slate-700">{visit.visitNo}</td>
                      <td className="p-3">{visit.salesPersonName}</td>
                      <td className="p-3 font-medium">{visit.partyName}</td>
                      <td className="p-3 max-w-xs truncate" title={visit.location}>{visit.location}</td>
                      <td className="p-3 whitespace-nowrap">{visit.dateOfVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalMatching > 20 && (
                <div className="p-3 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-slate-50">
                  Showing 20 of {totalMatching} records. Export CSV to view all.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {totalMatching === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
            <FileText size={28} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-600 text-lg">No matching records</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filter criteria or clearing existing filters.</p>
          {activeFiltersCount > 0 && (
            <button onClick={clearAllFilters} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}