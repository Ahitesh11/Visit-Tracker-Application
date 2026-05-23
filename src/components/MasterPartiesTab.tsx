import React, { useCallback, useRef, useEffect, useState } from 'react';
import { MasterParty } from '../types';
import { Plus, X, MapPin, Trash2, Building2, User, AlertCircle, Loader2, Search } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Utility ───────────────────────────────────────────
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ─────────────────────────────────────────────
interface MasterPartiesTabProps {
  parties: MasterParty[];
  showAddPartyModal: boolean;
  setShowAddPartyModal: React.Dispatch<React.SetStateAction<boolean>>;
  newPartyData: { partyName: string; location: string; concernPerson: string };
  setNewPartyData: React.Dispatch<React.SetStateAction<{ partyName: string; location: string; concernPerson: string }>>;
  handleAddMasterPartySubmit: (e: React.FormEvent) => Promise<void> | void;
  handleDeleteMasterParty: (id: string) => Promise<void> | void;
  isLoading?: boolean;
}

// ─── Sub-Components ────────────────────────────────────

function MetricCard({ label, value, icon: Icon, colorClass }: { label: string; value: number; icon: any; colorClass: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800">{value}</p>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full py-16 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
        <Building2 size={28} className="text-slate-300" />
      </div>
      <h3 className="text-sm font-black text-slate-700 mb-1">No Parties Found</h3>
      <p className="text-xs text-slate-400 max-w-xs">Your master sheet is empty. Register your first client party to start tracking visitations.</p>
    </div>
  );
}

function DeleteConfirmModal({
  party,
  onConfirm,
  onCancel,
  isDeleting
}: {
  party: MasterParty;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle size={24} className="text-rose-500" />
        </div>
        <h3 className="text-base font-black text-slate-800 mb-2">Delete Party?</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Are you sure you want to remove <span className="font-bold text-slate-700">{party.partyName}</span>?
          This will also remove all associated visitation logs. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────

export default function MasterPartiesTab({
  parties,
  showAddPartyModal,
  setShowAddPartyModal,
  newPartyData,
  setNewPartyData,
  handleAddMasterPartySubmit,
  handleDeleteMasterParty,
  isLoading = false,
}: MasterPartiesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MasterParty | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus trap & ESC close for modal
  useEffect(() => {
    if (!showAddPartyModal) return;

    const timer = setTimeout(() => firstInputRef.current?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowAddPartyModal(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddPartyModal, setShowAddPartyModal]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowAddPartyModal(false);
      }
    }
    if (showAddPartyModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showAddPartyModal, setShowAddPartyModal]);

  // Filtered parties
  const filteredParties = parties.filter(p =>
    p.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.concernPerson?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Wrapped submit handler with loading state
  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await handleAddMasterPartySubmit(e);
      setShowAddPartyModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [handleAddMasterPartySubmit, isSubmitting, setShowAddPartyModal]);

  // Wrapped delete handler with confirmation
  const onDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    try {
      await handleDeleteMasterParty(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, isDeleting, handleDeleteMasterParty]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans pb-8">

      {/* ─── HEADER WITH METRICS ───────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Master Parties Registry</h2>
            <p className="text-xs text-slate-500 font-medium max-w-md">
              Row-1 metadata sheet that anchors all downstream visitation logs. Manage your client base here.
            </p>
          </div>

          <button
            onClick={() => setShowAddPartyModal(true)}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer transition-all active:scale-95 duration-100 shadow-lg shadow-indigo-200/50 hover:shadow-indigo-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} strokeWidth={2.5} />
            Register Client Party
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Total Parties"
            value={parties.length}
            icon={Building2}
            colorClass="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            label="With Contact"
            value={parties.filter(p => p.concernPerson).length}
            icon={User}
            colorClass="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            label="Locations"
            value={new Set(parties.map(p => p.location)).size}
            icon={MapPin}
            colorClass="bg-amber-50 text-amber-600"
          />
        </div>
      </div>

      {/* ─── ADD PARTY MODAL ───────────────────────────── */}
      {showAddPartyModal && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-[10vh] p-4 animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" />

          <div
            ref={modalRef}
            className="relative bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-sm">Add Party to Master Sheet</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Fill in the details below to register a new client.</p>
              </div>
              <button
                onClick={() => setShowAddPartyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-all active:scale-95"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Party Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="new_party_name"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Party / Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={firstInputRef}
                      id="new_party_name"
                      type="text"
                      required
                      placeholder="e.g. Reliance Tech Pvt. Ltd."
                      className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-white text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-300"
                      value={newPartyData.partyName}
                      onChange={(e) => setNewPartyData({ ...newPartyData, partyName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="new_party_location"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Business Location <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="new_party_location"
                      type="text"
                      required
                      placeholder="e.g. Worli, Mumbai"
                      className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-white text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-300"
                      value={newPartyData.location}
                      onChange={(e) => setNewPartyData({ ...newPartyData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Concern Person */}
                <div className="space-y-1.5 md:col-span-2">
                  <label
                    htmlFor="new_party_concern"
                    className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Concern / Contact Person
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="new_party_concern"
                      type="text"
                      placeholder="e.g. Mr. S. Sharma (Managing Director)"
                      className="w-full min-h-[44px] pl-10 pr-3.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-white text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-300"
                      value={newPartyData.concernPerson}
                      onChange={(e) => setNewPartyData({ ...newPartyData, concernPerson: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPartyModal(false)}
                  className="px-5 py-2.5 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPartyData.partyName.trim() || !newPartyData.location.trim()}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 active:bg-indigo-800 text-xs rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-indigo-200/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={14} strokeWidth={2.5} />
                      Add to Registry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SEARCH & FILTER BAR ───────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search parties by name, location, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold bg-white text-slate-800 transition-all placeholder:font-medium placeholder:text-slate-300"
          />
        </div>
        <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
          {filteredParties.length} of {parties.length} parties
        </span>
      </div>

      {/* ─── PARTIES GRID ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParties.map((p, index) => (
            <div
              key={p.id}
              className="group bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 flex justify-between items-start hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards"
              style={{ animationDelay: `${index * 50}ms`, animationDuration: '400ms' }}
            >
              <div className="min-w-0 flex-1">
                <span className="font-black text-slate-800 text-sm block truncate" title={p.partyName}>
                  {p.partyName}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1.5 flex items-center gap-1.5 font-medium">
                  <MapPin size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{p.location}</span>
                </span>
                {p.concernPerson && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg mt-3 font-bold border border-indigo-100/50">
                    <User size={10} />
                    {p.concernPerson}
                  </span>
                )}
              </div>

              <button
                onClick={() => setDeleteTarget(p)}
                className="p-2 text-slate-400 bg-white border border-slate-100 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove from Master"
                aria-label={`Delete ${p.partyName}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {filteredParties.length === 0 && parties.length > 0 && (
            <div className="col-span-full py-12 text-center">
              <Search size={24} className="text-slate-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">No parties match your search.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 mt-2 underline underline-offset-2"
              >
                Clear search
              </button>
            </div>
          )}

          {parties.length === 0 && <EmptyState />}
        </div>
      </div>

      {/* ─── DELETE CONFIRMATION MODAL ─────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          party={deleteTarget}
          onConfirm={onDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}