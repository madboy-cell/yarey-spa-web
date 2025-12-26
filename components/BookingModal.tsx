
import React, { useState } from 'react';
import { X, Plus, UserPlus, Globe, UserCheck, UserPlus as AgencyIcon } from 'lucide-react';
import { Service, Staff, TourOperator, Booking, PaymentType, Channel } from '../types';
import { NATIONALITIES } from '../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  staff: Staff[];
  operators: TourOperator[];
  onSave: (bookings: Omit<Booking, 'id'>[]) => void;
}

interface FormGuest {
  id: string;
  guest_name: string;
  nationality: string;
  therapist_type: 'in-house' | 'outsource';
  staff_id: string;
  service_id: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, services, staff, operators, onSave }) => {
  const [isGroup, setIsGroup] = useState(false);
  const [startTime, setStartTime] = useState('10:00');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [channel, setChannel] = useState<Channel>('Walk-in');
  const [tourOperatorId, setTourOperatorId] = useState('');
  
  // Only use in-house staff for the dropdown selection
  const inHouseStaff = staff.filter(s => !s.is_outsource);

  const [guests, setGuests] = useState<FormGuest[]>([
    { 
      id: Math.random().toString(), 
      guest_name: '', 
      nationality: 'Thailand',
      therapist_type: 'in-house',
      staff_id: inHouseStaff[0]?.id || '', 
      service_id: services[0]?.id || '' 
    }
  ]);

  if (!isOpen) return null;

  const calculateEndTime = (start: string, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return start;
    
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const addGuest = () => {
    setGuests([...guests, { 
      id: Math.random().toString(), 
      guest_name: '', 
      nationality: 'Thailand',
      therapist_type: 'in-house',
      staff_id: inHouseStaff[0]?.id || '', 
      service_id: services[0]?.id || '' 
    }]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(guests.filter(g => g.id !== id));
    }
  };

  const updateGuest = (id: string, field: keyof FormGuest, value: any) => {
    setGuests(guests.map(g => {
      if (g.id === id) {
        const updated = { ...g, [field]: value };
        // If switching to outsource, we use a special ID string
        if (field === 'therapist_type' && value === 'outsource') {
          updated.staff_id = 'OUTSOURCE';
        } else if (field === 'therapist_type' && value === 'in-house') {
          updated.staff_id = inHouseStaff[0]?.id || '';
        }
        return updated;
      }
      return g;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const groupRef = isGroup ? `GRP-${Date.now()}` : undefined;
    const today = new Date().toISOString().split('T')[0];
    
    const newBookings: Omit<Booking, 'id'>[] = guests.map(g => ({
      guest_name: g.guest_name,
      nationality: g.nationality,
      group_ref: groupRef,
      date: today,
      start_time: startTime,
      end_time: calculateEndTime(startTime, g.service_id),
      staff_id: g.staff_id,
      service_id: g.service_id,
      payment_status: 'Pending' as const,
      payment_type: paymentType,
      channel: channel,
      tour_operator_id: paymentType === 'Credit' ? tourOperatorId : undefined
    }));

    onSave(newBookings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-sage/20">
        <div className="sticky top-0 bg-cream p-6 border-b border-sage/10 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-serif text-charcoal font-semibold">New Experience Booking</h2>
            <p className="text-[10px] text-sage font-bold uppercase tracking-widest mt-1">Guest Registration</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-full transition-colors">
            <X size={24} className="text-charcoal" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-sage font-bold">Preferred Arrival</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-sage/20 rounded-xl p-3 outline-none focus:border-sage transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-sage font-bold">Booking Source</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="w-full bg-white border border-sage/20 rounded-xl p-3 outline-none focus:border-sage shadow-sm"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Phone">Phone</option>
                <option value="Online">Online</option>
                <option value="Tour Operator">Tour Operator</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end pb-1">
               <label className="flex items-center cursor-pointer group bg-sage/5 px-6 py-3 rounded-2xl border border-sage/10 hover:border-sage/30 transition-all">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={isGroup} 
                      onChange={() => setIsGroup(!isGroup)} 
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${isGroup ? 'bg-sage' : 'bg-gray-300'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isGroup ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                  <span className="ml-4 text-sm font-bold text-charcoal uppercase tracking-widest">Group / Couple Session</span>
               </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm uppercase tracking-[0.2em] text-sage font-bold">Guest Particulars</h3>
              {isGroup && (
                <button 
                  type="button" 
                  onClick={addGuest}
                  className="flex items-center gap-2 bg-sage/10 text-sage hover:bg-sage hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  <UserPlus size={14} /> Add Additional Guest
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div key={guest.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-white rounded-3xl border border-sage/10 items-start shadow-sm transition-all">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] uppercase text-sage font-bold">Full Guest Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Elena Petrova"
                      value={guest.guest_name}
                      onChange={(e) => updateGuest(guest.id, 'guest_name', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3 text-sm outline-none focus:border-sage font-semibold"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase text-sage font-bold flex items-center gap-1">
                      <Globe size={10} /> Nationality
                    </label>
                    <select 
                      value={guest.nationality}
                      onChange={(e) => updateGuest(guest.id, 'nationality', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3 text-sm outline-none focus:border-sage"
                    >
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] uppercase text-sage font-bold">Treatment</label>
                    <select 
                      value={guest.service_id}
                      onChange={(e) => updateGuest(guest.id, 'service_id', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3 text-sm outline-none focus:border-sage"
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}m)</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] uppercase text-sage font-bold">Assign Therapist</label>
                    <div className="flex bg-cream/50 p-1 rounded-xl border border-sage/10 mb-2">
                       <button 
                         type="button" 
                         onClick={() => updateGuest(guest.id, 'therapist_type', 'in-house')}
                         className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           guest.therapist_type === 'in-house' ? 'bg-sage text-white shadow-sm' : 'text-sage hover:bg-sage/5'
                         }`}
                       >
                         <UserCheck size={12} /> In-House
                       </button>
                       <button 
                         type="button" 
                         onClick={() => updateGuest(guest.id, 'therapist_type', 'outsource')}
                         className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           guest.therapist_type === 'outsource' ? 'bg-charcoal text-white shadow-sm' : 'text-sage hover:bg-sage/5'
                         }`}
                       >
                         <AgencyIcon size={12} /> Outsource
                       </button>
                    </div>
                    
                    {guest.therapist_type === 'in-house' ? (
                      <select 
                        value={guest.staff_id}
                        onChange={(e) => updateGuest(guest.id, 'staff_id', e.target.value)}
                        className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3 text-sm outline-none focus:border-sage animate-in fade-in duration-300"
                        required
                      >
                        {inHouseStaff.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                    ) : (
                      <div className="bg-charcoal/5 border border-charcoal/10 rounded-xl p-3 text-[11px] font-bold text-charcoal/60 uppercase tracking-widest text-center animate-in fade-in duration-300">
                        Daily Agency Personnel
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1 flex justify-center pb-2 self-center">
                    {guests.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeGuest(guest.id)}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-sage/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <label className="text-xs uppercase tracking-widest text-sage font-bold">Settlement Method</label>
                <div className="flex gap-4">
                  {['Cash', 'Card', 'Credit'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPaymentType(type as PaymentType)}
                      className={`flex-1 py-4 px-6 rounded-2xl border text-sm font-bold uppercase tracking-widest transition-all ${
                        paymentType === type 
                        ? 'bg-sage text-white border-sage shadow-xl -translate-y-0.5' 
                        : 'bg-white text-sage border-sage/20 hover:border-sage/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {paymentType === 'Credit' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs uppercase tracking-widest text-sage font-bold">Associated Tour Operator</label>
                  <select 
                    value={tourOperatorId}
                    onChange={(e) => setTourOperatorId(e.target.value)}
                    className="w-full bg-white border border-sage/20 rounded-2xl p-4 outline-none focus:border-sage shadow-sm font-semibold"
                    required={paymentType === 'Credit'}
                  >
                    <option value="">Select Account...</option>
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} (Available: ฿{(op.total_credit_limit - op.outstanding_balance).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-charcoal hover:bg-black text-white font-bold py-5 rounded-2xl shadow-2xl transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
            >
              Complete Booking & Send to Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
