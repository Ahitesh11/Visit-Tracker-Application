import React, { useState, useCallback, useMemo } from 'react';
import { User as UserType, FmsVisit, MasterParty } from '../types';
import { Compass, X, Info, MapPin, Calendar as CalendarIcon, TrendingUp, AlertCircle, User, Clock, Briefcase, Send } from 'lucide-react';

interface AddVisitTabProps {
  currentUser: UserType;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  parties: MasterParty[];
  handlePartySelect: (partyName: string) => void;
  users: UserType[];
  handleSubmitVisitForm: (e: React.FormEvent) => Promise<void> | void;
  editingVisit: FmsVisit | null;
  setEditingVisit: React.Dispatch<React.SetStateAction<FmsVisit | null>>;
  onClose?: () => void;
}

interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
}

const FormLabel = React.memo(({ htmlFor, children, required, tooltip }: FormLabelProps) => (
  <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-1.5">
    {children}
    {required && <span className="text-rose-400 text-sm leading-none">*</span>}
    {tooltip && (
      <div className="relative group">
        <Info size={11} className="text-slate-300 cursor-help" />
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] font-normal px-2 py-1 rounded-md whitespace-nowrap z-10">
          {tooltip}
        </div>
      </div>
    )}
  </label>
));

const inputBase = "w-full min-h-[44px] px-3 text-[14px] text-slate-800 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 hover:bg-white";
const selectBase = "w-full min-h-[44px] px-3 text-[14px] text-slate-800 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer hover:bg-white";

interface FormSelectProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}

const FormSelect = React.memo(({ id, value, onChange, options, required }: FormSelectProps) => (
  <select id={id} className={selectBase} value={value} onChange={onChange} required={required}>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
));

interface FormInputProps {
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  invalid?: boolean;
}

const FormInput = React.memo(({ id, type, value, onChange, placeholder, required, icon, invalid }: FormInputProps) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
        {icon}
      </div>
    )}
    <input
      id={id}
      type={type}
      className={`${inputBase} ${icon ? 'pl-9' : ''} ${invalid ? 'border-rose-300 bg-rose-50 focus:border-rose-400' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
    />
  </div>
));

const FormTextarea = React.memo(({ id, value, onChange, placeholder, rows = 3 }: {
  id: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number;
}) => (
  <textarea
    id={id}
    rows={rows}
    className="w-full p-3 text-[14px] text-slate-800 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 hover:bg-white resize-none"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
));

export default function AddVisitTab({
  currentUser, formData, setFormData, parties,
  handlePartySelect, users,
  handleSubmitVisitForm, editingVisit, setEditingVisit, onClose
}: AddVisitTabProps) {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleSubmitVisitForm(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);

  const isInvalid = useCallback((field: string, value: string) =>
    touchedFields.has(field) && !value.trim(), [touchedFields]);

  const statusOptions = [
    { value: 'Pending', label: 'Pending — Not Met' },
    { value: 'Completed', label: 'Completed — Successful' },
    { value: 'Rescheduled', label: 'Rescheduled' },
    { value: 'No Show', label: 'No Show — Client Busy' },
  ];

  const delayOptions = ['None', '15 mins', '30 mins', '45 mins', '1 hour+', 'Rescheduled'];

  const statusHint: Record<string, string> = {
    Completed: 'Mark after a successful meeting',
    Pending: 'Awaiting client confirmation',
    Rescheduled: 'Reschedule to a future date',
    'No Show': 'Client was not available',
  };

  const handleCancelEdit = useCallback(() => {
    setEditingVisit(null);
    setFormData({
      partyName: '', location: '',
      dateOfVisit: new Date().toISOString().split('T')[0],
      salesPersonName: currentUser?.name || ''
    });
    setTouchedFields(new Set());
    if (onClose) onClose();
  }, [setEditingVisit, setFormData, onClose]);

  const selectedPartyDetails = useMemo(() =>
    parties.find(p => p.partyName === formData.partyName), [parties, formData.partyName]);

  const handleLocationDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    // Show a loading state if we want, but for simplicity, we just set a temporary placeholder
    setFormData(prev => ({ ...prev, location: 'Detecting...' }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ ...prev, location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
      },
      (error) => {
        alert("Unable to retrieve your location.");
        setFormData(prev => ({ ...prev, location: '' }));
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="border-b border-slate-100 px-6 md:px-8 py-5 flex items-start sm:items-center justify-between shrink-0 bg-white gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {editingVisit ? 'Edit Mode' : 'New Entry'}
              </span>
            </div>
            <h2 className="text-lg font-medium text-slate-800">
              {editingVisit ? `Edit Visit #${editingVisit.visitNo}` : 'Register Field Visit'}
            </h2>
            <p className="text-[13px] text-slate-400 mt-0.5">
              {/* Entries are timestamped and synced with Google Sheets. */}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleLocalSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto relative">

          {/* Context strip */}
          {!editingVisit && (
            <div className="flex flex-wrap gap-4 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[13px]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <User size={14} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-0.5 block">Sales Person Name</label>
                  <select
                    className={`${selectBase} border-none p-0 text-[13px] font-medium text-slate-700 focus:ring-0`}
                    value={formData.salesPersonName}
                    onChange={(e) => setFormData({ ...formData, salesPersonName: e.target.value })}
                    required
                  >
                    <option value="">— Select Rep —</option>
                    {users.map(u => (
                      <option key={u.username} value={u.name}>{u.name}</option>
                    ))}
                    {/* If current user isn't in users yet, add them */}
                    {!users.find(u => u.name === currentUser.name) && (
                      <option value={currentUser.name}>{currentUser.name}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <Clock size={14} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-0.5">Timestamp</p>
                  <p className="text-slate-400 text-[12px]">Assigned on save</p>
                </div>
              </div>
              {selectedPartyDetails && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Briefcase size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-0.5">Party Type</p>
                    <p className="font-medium text-blue-600 text-[12px]">{selectedPartyDetails.type || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Party + Location */}
          {!editingVisit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <FormLabel htmlFor="party_selector" required tooltip="Synced from Master Database">
                  Party Name
                </FormLabel>
                <select
                  id="party_selector"
                  className={`${selectBase} ${isInvalid('partyName', formData.partyName) ? 'border-rose-300 bg-rose-50' : ''}`}
                  value={formData.partyName}
                  onChange={(e) => handlePartySelect(e.target.value)}
                  onBlur={() => handleBlur('partyName')}
                  required
                >
                  <option value="">— Select Party —</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.partyName}>{p.partyName}</option>
                  ))}
                </select>
                {parties.length === 0 && (
                  <p className="text-[11px] text-amber-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> No parties available.
                  </p>
                )}
              </div>

              <div>
                <FormLabel htmlFor="location_input" required tooltip="Address or GPS coordinates">
                  Location / Coordinates
                </FormLabel>
                <div className="relative">
                  <FormInput
                    id="location_input"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Worli, Mumbai"
                    required
                    icon={<MapPin size={14} />}
                  />
                  <button
                    type="button"
                    onClick={handleLocationDetect}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors cursor-pointer"
                    title="Auto-detect GPS coordinates"
                  >
                    <MapPin size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Date, Type, Status */}
          {!editingVisit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <FormLabel htmlFor="date_of_visit_input" required>Date of Visit</FormLabel>
                <FormInput
                  id="date_of_visit_input"
                  type="date"
                  value={formData.dateOfVisit}
                  onChange={(e) => setFormData({ ...formData, dateOfVisit: e.target.value })}
                  required
                  icon={<CalendarIcon size={14} />}
                />
              </div>
            </div>
          )}

          {/* Action Button Optional Fields (Only visible when updating) */}
          {editingVisit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-slate-100">
              <div className="sm:col-span-2">
                <h3 className="text-[13px] font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-500" /> Follow-Up Details
                </h3>
              </div>
              <div>
                <FormLabel htmlFor="head_of_visit_input">Head Of Visit</FormLabel>
                <FormInput
                  id="head_of_visit_input"
                  type="text"
                  value={formData.headOfVisit || ''}
                  onChange={(e) => setFormData({ ...formData, headOfVisit: e.target.value })}
                  placeholder="e.g. Product Demo"
                />
              </div>
              <div>
                <FormLabel htmlFor="concern_person_input">Concern Person</FormLabel>
                <FormInput
                  id="concern_person_input"
                  type="text"
                  value={formData.concernPerson || ''}
                  onChange={(e) => setFormData({ ...formData, concernPerson: e.target.value })}
                  placeholder="e.g. Mr. Sharma"
                  icon={<User size={14} />}
                />
              </div>
              <div className="sm:col-span-2">
                <FormLabel htmlFor="customer_said_input">What Did The Customer Say</FormLabel>
                <textarea
                  id="customer_said_input"
                  value={formData.whatCustomerSaid || ''}
                  onChange={(e) => setFormData({ ...formData, whatCustomerSaid: e.target.value })}
                  placeholder="Enter detailed customer feedback or requirements..."
                  className="w-full h-20 px-3 py-2 text-[14px] text-slate-800 rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 hover:bg-white resize-none"
                />
              </div>
              <div>
                <FormLabel htmlFor="next_visit_date_input">Next Visit Date</FormLabel>
                <FormInput
                  id="next_visit_date_input"
                  type="date"
                  value={formData.nextVisitDate || ''}
                  onChange={(e) => setFormData({ ...formData, nextVisitDate: e.target.value })}
                  icon={<CalendarIcon size={14} />}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group w-full h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSubmitting ? (
                <>
                  <Compass size={16} className="animate-spin" />
                  {editingVisit ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  {editingVisit ? 'Save Changes' : 'Submit & Sync to Sheet'}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-300 mt-2">
              Data will be appended to master Google Sheet and local database.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}