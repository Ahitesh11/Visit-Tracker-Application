import React, { useMemo } from 'react';
import { User as UserType, FmsVisit, MasterParty, WebSyncConfig } from '../types';
import {
  Clock, Building2, Check, FileText, MapPin, PlusCircle, TrendingUp, MoreHorizontal,
  ArrowRight, Zap, Activity, CheckCircle2, Clock3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface HomeTabProps {
  currentUser: UserType;
  visits: FmsVisit[];
  parties: MasterParty[];
  syncConfig: WebSyncConfig;
  totalMyVisits: number;
  setActiveTab: React.Dispatch<React.SetStateAction<any>>;
  myScopeVisits: FmsVisit[];
  masterClientsCount: number;
  onOpenAddModal: () => void;
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  subtext?: string;
  badge?: { text: string; bgColor: string; textColor: string };
  trend?: { value: number; isPositive: boolean };
}

const StatCard = React.memo(({ title, value, icon, iconBg, iconColor, valueColor, subtext, badge, trend }: StatCardProps) => (
  <div className="bg-white border border-slate-200/80 rounded-xl p-5 hover:border-slate-300 transition-all duration-200 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.bgColor} ${badge.textColor}`}>
          {badge.text}
        </span>
      )}
    </div>
    <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-black font-display ${valueColor}`}>{value}</span>
      {trend && (
        <span className={`text-[11px] flex items-center gap-0.5 font-bold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          <TrendingUp size={12} className={trend.isPositive ? '' : 'rotate-180'} />
          {trend.value.toFixed(0)}%
        </span>
      )}
    </div>
    {subtext && <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>}
  </div>
));

const VisitLogItem = React.memo(({ partyName, location, dateOfVisit, isCompleted }: { partyName: string; location: string; dateOfVisit: string; isCompleted: boolean }) => (
  <div className="flex gap-3 justify-between items-start px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-bold text-slate-800 truncate">{partyName}</p>
      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5 font-medium">
        <MapPin size={12} className="text-slate-400" /> {location}
      </p>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[11px] font-bold text-slate-500 shrink-0">{dateOfVisit}</span>
      <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded-md ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
        {isCompleted ? 'Completed' : 'Pending'}
      </span>
    </div>
  </div>
));

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PIE_COLORS = ['#10b981', '#f59e0b']; // Completed, Pending

export default function HomeTab({
  currentUser, visits, parties, syncConfig, totalMyVisits,
  setActiveTab, myScopeVisits, masterClientsCount, onOpenAddModal,
}: HomeTabProps) {
  
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const recentVisits = useMemo(() => {
    // Sort by timestamp descending
    return [...myScopeVisits].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }, [myScopeVisits]);

  // --- DATA PROCESSING FOR CHARTS ---

  // 1. Completion Status (Pie Chart)
  const statusData = useMemo(() => {
    let completed = 0;
    let pending = 0;
    myScopeVisits.forEach(v => {
      if (v.actual) completed++;
      else pending++;
    });
    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
  }, [myScopeVisits]);

  // 2. Daily Trend (Bar Chart for last 7 days)
  const trendData = useMemo(() => {
    const counts: Record<string, number> = {};
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      counts[dateStr] = 0;
    }
    
    myScopeVisits.forEach(v => {
      if (counts[v.dateOfVisit] !== undefined) {
        counts[v.dateOfVisit]++;
      }
    });

    return Object.keys(counts).map(date => {
      const parts = date.split('-');
      const label = `${parts[2]}/${parts[1]}`; // DD/MM
      return { date: label, visits: counts[date] };
    });
  }, [myScopeVisits]);

  // 3. Top Performers / Parties (Bar Chart)
  const groupedData = useMemo(() => {
    const counts: Record<string, number> = {};
    myScopeVisits.forEach(v => {
      const key = currentUser.role === 'Admin' ? v.salesPersonName : v.partyName;
      counts[key] = (counts[key] || 0) + 1;
    });

    // Sort top 5
    return Object.keys(counts)
      .map(name => ({ name: name.substring(0, 15) + (name.length > 15 ? '...' : ''), total: counts[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [myScopeVisits, currentUser.role]);


  return (
    <div className="space-y-6 font-sans animate-in duration-300">

      {/* Hero */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div>
            <h2 className="text-2xl font-black text-slate-800 font-display">
              {greeting}, {currentUser.name}
            </h2>
            <p className="text-[14px] text-slate-500 mt-1 font-medium">
              Track your field performance, travel logs, and daily schedules.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[12px] rounded-xl flex items-center gap-1.5 font-bold">
                <Clock size={14} className="text-indigo-500" /> {visits.length} records globally
              </span>
              <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[12px] rounded-xl flex items-center gap-1.5 font-bold">
                <Building2 size={14} className="text-indigo-500" /> {parties.length} master parties
              </span>
              {syncConfig.enabled && (
                <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[12px] rounded-xl flex items-center gap-1.5 font-bold shadow-sm">
                  <Check size={14} /> Sheet Synced
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={onOpenAddModal}
            className="group h-[48px] px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
          >
            <PlusCircle size={18} className="transition-transform group-hover:rotate-90" />
            <span className="hidden sm:inline">Log New Visit</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Scope Visits" value={totalMyVisits} icon={<FileText size={20} />}
          iconBg="bg-indigo-50" iconColor="text-indigo-600" valueColor="text-slate-800"
          subtext={currentUser.role === 'Admin' ? 'All staff logs combined' : 'Your personal conducted logs'}
          badge={{ text: 'All time', bgColor: 'bg-slate-100', textColor: 'text-slate-500' }} />
        
        <StatCard title="Total Master Parties" value={parties.length} icon={<Building2 size={20} />}
          iconBg="bg-purple-50" iconColor="text-purple-600" valueColor="text-slate-800"
          subtext="Active clients available in database" />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Trend Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-[14px] font-black text-slate-800 mb-4 flex items-center gap-2 font-display">
            <Activity size={18} className="text-indigo-500" /> Daily Visit Trend (Last 7 Days)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="visits" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
          <h3 className="text-[14px] font-black text-slate-800 mb-2 flex items-center gap-2 font-display">
            <CheckCircle2 size={18} className="text-emerald-500" /> Visit Completion Status
          </h3>
          <p className="text-xs text-slate-400 font-medium mb-4">Pending vs Follow-up Actualized</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grouped Bar Chart (Top Performers or Parties) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-[14px] font-black text-slate-800 mb-4 flex items-center gap-2 font-display">
            <TrendingUp size={18} className="text-purple-500" /> 
            {currentUser.role === 'Admin' ? 'Top Sales Representatives' : 'Most Visited Parties'}
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupedData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={120} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="total" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={30}>
                  {groupedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent logs */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-4 border-b border-slate-100">
            <h3 className="text-[14px] font-black text-slate-800 flex items-center gap-2 font-display">
              <Clock3 size={18} className="text-amber-500" /> Recent Actions
            </h3>
            <button onClick={() => setActiveTab('logs')} className="text-slate-300 hover:text-indigo-500 transition-colors p-1 bg-slate-50 rounded-lg">
              <MoreHorizontal size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
            {recentVisits.length > 0 ? (
              recentVisits.map((v) => (
                <VisitLogItem key={v.id} partyName={v.partyName} location={v.location} dateOfVisit={v.dateOfVisit} isCompleted={!!v.actual} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300 text-[12px] gap-2">
                <Zap size={24} className="text-slate-200" />
                <span className="font-bold">No visits logged yet</span>
                <button onClick={onOpenAddModal} className="text-indigo-500 hover:text-indigo-700 flex items-center gap-1 text-[13px] font-bold mt-2">
                  Create first record <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}