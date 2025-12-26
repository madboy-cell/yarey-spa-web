
import React, { useState, useEffect } from 'react';
import { X, Plus, UserPlus, Globe, UserCheck, UserPlus as AgencyIcon, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Service, Staff, Booking, PaymentType, Channel } from '../types';
import { NATIONALITIES } from '../constants';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  staff: Staff[];
  onSave: (bookings: Omit<Booking, 'id'>[], editId?: string) => void;
  bookingToEdit?: Booking | null;
  language?: 'en' | 'th';
}

interface FormGuest {
  id: string;
  guest_name: string;
  nationality: string;
  therapist_type: 'in-house' | 'outsource';
  staff_id: string;
  service_id: string;
  payment_status: 'Paid' | 'Pending' | 'Canceled';
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, services, staff, onSave, bookingToEdit, language = 'en' }) => {
  const [isGroup, setIsGroup] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [channel, setChannel] = useState<Channel>('Walk-in');
  
  const inHouseStaff = staff.filter(s => !s.is_outsource);

  const [guests, setGuests] = useState<FormGuest[]>([
    { 
      id: Math.random().toString(), 
      guest_name: '', 
      nationality: 'Thailand',
      therapist_type: 'in-house',
      staff_id: inHouseStaff[0]?.id || '', 
      service_id: services[0]?.id || '',
      payment_status: 'Pending' 
    }
  ]);

  useEffect(() => {
    if (bookingToEdit && isOpen) {
      setIsGroup(!!bookingToEdit.group_ref);
      setBookingDate(bookingToEdit.date);
      setStartTime(bookingToEdit.start_time);
      setPaymentType(bookingToEdit.payment_type);
      setChannel(bookingToEdit.channel);
      
      setGuests([{
        id: bookingToEdit.id,
        guest_name: bookingToEdit.guest_name,
        nationality: bookingToEdit.nationality || 'Thailand',
        therapist_type: bookingToEdit.staff_id === 'OUTSOURCE' ? 'outsource' : 'in-house',
        staff_id: bookingToEdit.staff_id,
        service_id: bookingToEdit.service_id,
        payment_status: bookingToEdit.payment_status || 'Pending'
      }]);
    } else if (isOpen) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      
      setIsGroup(false);
      setBookingDate(dateStr);
      setStartTime(timeStr);
      setPaymentType('Cash');
      setChannel('Walk-in');
      setGuests([{ 
        id: Math.random().toString(), 
        guest_name: '', 
        nationality: 'Thailand',
        therapist_type: 'in-house',
        staff_id: inHouseStaff[0]?.id || '', 
        service_id: services[0]?.id || '',
        payment_status: 'Pending'
      }]);
    }
  }, [bookingToEdit, isOpen]);

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
      service_id: services[0]?.id || '',
      payment_status: 'Pending'
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
    const groupRef = isGroup ? (bookingToEdit?.group_ref || `GRP-${Date.now()}`) : undefined;
    
    // Ensure data is flattened and all fields are strings (except price/duration which aren't here)
    const newBookings: Omit<Booking, 'id'>[] = guests.map(g => ({
      guest_name: String(g.guest_name).trim(),
      nationality: String(g.nationality),
      group_ref: groupRef ? String(groupRef) : undefined,
      date: String(bookingDate),
      start_time: String(startTime),
      end_time: String(calculateEndTime(startTime, g.service_id)),
      staff_id: String(g.staff_id),
      service_id: String(g.service_id),
      payment_status: g.payment_status || 'Pending',
      payment_type: paymentType,
      channel: channel
    }));

    onSave(newBookings, bookingToEdit?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-sage/20">
        <div className="sticky top-0 bg-cream/95 backdrop-blur-md p-6 border-b border-sage/10 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-serif text-charcoal font-semibold">
              {bookingToEdit ? 'Adjust Appointment' : 'New Experience Registration'}
            </h2>
            <p className="text-[10px] text-sage font-bold uppercase tracking-widest mt-1">
              {bookingToEdit ? `Ref: ${bookingToEdit.id}` : 'Live Desk Enrollment'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-full transition-colors">
            <X size={24} className="text-charcoal" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold flex items-center gap-2">
                <CalendarIcon size={12} /> Arrival Date
              </label>
              <input 
                type="date" 
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-white border border-sage/20 rounded-2xl p-4 outline-none focus:border-sage transition-all shadow-sm font-medium text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold flex items-center gap-2">
                <Clock size={12} /> Arrival Time
              </label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-sage/20 rounded-2xl p-4 outline-none focus:border-sage transition-all shadow-sm font-medium text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Origin Channel</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="w-full bg-white border border-sage/20 rounded-2xl p-4 outline-none focus:border-sage shadow-sm font-bold text-sm"
              >
                <option value="Walk-in">Walk-in</option>
                <option value="Phone">Phone</option>
                <option value="Online">Online</option>
              </select>
            </div>
            {!bookingToEdit && (
              <div className="flex items-end pb-1">
                 <label className="flex items-center cursor-pointer group bg-sage/5 px-6 py-4 rounded-2xl border border-sage/10 hover:border-sage/30 transition-all w-full h-[54px]">
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
                    <span className="ml-4 text-[10px] font-bold text-charcoal uppercase tracking-widest">Multi-Guest</span>
                 </label>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xs uppercase tracking-[0.25em] text-sage font-bold flex items-center gap-2">
              <UserPlus size={14} /> Guest Detail Configuration
            </h3>
            <div className="space-y-4">
              {guests.map((guest, index) => (
                <div key={guest.id} className="grid grid-cols-1 md:grid-cols-12 gap-5 p-8 bg-white rounded-[2rem] border border-sage/10 items-start shadow-sm relative group/guest">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[9px] uppercase text-sage font-bold tracking-widest">Guest Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Elena Petrova"
                      value={guest.guest_name}
                      onChange={(e) => updateGuest(guest.id, 'guest_name', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3.5 text-sm outline-none focus:border-sage font-bold"
                      required
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] uppercase text-sage font-bold tracking-widest">Nationality</label>
                    <select 
                      value={guest.nationality}
                      onChange={(e) => updateGuest(guest.id, 'nationality', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3.5 text-sm outline-none focus:border-sage font-medium"
                    >
                      {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[9px] uppercase text-sage font-bold tracking-widest">Treatment Selection</label>
                    <select 
                      value={guest.service_id}
                      onChange={(e) => updateGuest(guest.id, 'service_id', e.target.value)}
                      className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3.5 text-sm outline-none focus:border-sage font-medium"
                    >
                      {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}m)</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[9px] uppercase text-sage font-bold tracking-widest">Therapist Allocation</label>
                    <div className="flex bg-cream/50 p-1 rounded-xl border border-sage/10 mb-2">
                       <button 
                         type="button" 
                         onClick={() => updateGuest(guest.id, 'therapist_type', 'in-house')}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           guest.therapist_type === 'in-house' ? 'bg-sage text-white shadow-sm' : 'text-sage hover:bg-sage/5'
                         }`}
                       >
                         <UserCheck size={12} /> Team
                       </button>
                       <button 
                         type="button" 
                         onClick={() => updateGuest(guest.id, 'therapist_type', 'outsource')}
                         className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                           guest.therapist_type === 'outsource' ? 'bg-charcoal text-white shadow-sm' : 'text-sage hover:bg-sage/5'
                         }`}
                       >
                         <AgencyIcon size={12} /> Agency
                       </button>
                    </div>
                    {guest.therapist_type === 'in-house' ? (
                      <select 
                        value={guest.staff_id}
                        onChange={(e) => updateGuest(guest.id, 'staff_id', e.target.value)}
                        className="w-full bg-cream/30 border border-sage/20 rounded-xl p-3.5 text-sm outline-none focus:border-sage font-bold"
                        required
                      >
                        {inHouseStaff.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                    ) : (
                      <div className="bg-charcoal/5 border border-charcoal/10 rounded-xl p-3.5 text-[10px] font-bold text-charcoal/60 uppercase tracking-widest text-center italic">
                        On-call Personnel
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-1 flex justify-center self-center h-full">
                    {guests.length > 1 && !bookingToEdit && (
                      <button 
                        type="button" 
                        onClick={() => removeGuest(guest.id)}
                        className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isGroup && !bookingToEdit && (
                <button 
                  type="button" 
                  onClick={addGuest}
                  className="w-full py-5 border-2 border-dashed border-sage/20 rounded-[2rem] text-sage font-bold text-xs uppercase tracking-[0.3em] hover:bg-sage/5 hover:border-sage/40 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Link Additional Guest Profile
                </button>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-sage/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Settlement Instrument</label>
                <div className="flex gap-4">
                  {['Cash', 'Card'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPaymentType(type as PaymentType)}
                      className={`flex-1 py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        paymentType === type 
                        ? 'bg-sage text-white border-sage shadow-xl -translate-y-1' 
                        : 'bg-white text-sage border-sage/20 hover:border-sage/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Status</label>
                <div className="flex gap-4">
                  {(['Paid', 'Pending'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setGuests(guests.map(g => ({ ...g, payment_status: status })))}
                      className={`flex-1 py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        guests[0].payment_status === status 
                        ? 'bg-charcoal text-white border-charcoal shadow-xl -translate-y-1' 
                        : 'bg-white text-sage border-sage/20 hover:border-sage/40'
                      }`}
                    >
                      {status === 'Pending' ? 'Unpaid' : 'Paid'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full bg-charcoal hover:bg-black text-white font-bold py-6 rounded-[2rem] shadow-2xl transition-all transform active:scale-[0.99] uppercase tracking-[0.3em] text-sm"
            >
              {bookingToEdit ? 'Finalize Adjustments' : 'Validate & Secure Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
