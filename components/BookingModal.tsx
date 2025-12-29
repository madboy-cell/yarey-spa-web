
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Calendar as CalendarIcon, Clock, ShoppingBag, ChevronLeft, ChevronRight, ChevronDown, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Service, Staff, Booking, PaymentType, Channel, Salesperson } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  staff: Staff[];
  salespersons: Salesperson[];
  onSave: (bookings: Omit<Booking, 'id'>[], editId?: string) => void;
  bookingToEdit?: Booking | null;
  language?: 'en' | 'th';
}

interface FormGuest {
  id: string;
  guest_name: string;
  nationality: string;
  therapist_type: 'in-house' | 'part-time';
  staff_id: string;
  service_id: string;
  payment_status: 'Paid' | 'Pending' | 'Canceled';
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, services, staff, salespersons, onSave, bookingToEdit, language = 'en' }) => {
  const [isGroup, setIsGroup] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [channel, setChannel] = useState<Channel>('Walk-in');
  const [salespersonId, setSalespersonId] = useState<string>('');
  const [guests, setGuests] = useState<FormGuest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const inHouseStaff = staff.filter(s => !s.is_outsource);
  const prevOpenRef = useRef(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setShowSuccess(false);
      setIsSubmitting(false);
      if (bookingToEdit) {
        setBookingDate(bookingToEdit.date);
        setStartTime(bookingToEdit.start_time);
        setPaymentType(bookingToEdit.payment_type);
        setChannel(bookingToEdit.channel);
        setSalespersonId(bookingToEdit.salesperson_id || (salespersons[0]?.id || ''));
        setGuests([{
          id: bookingToEdit.id, 
          guest_name: bookingToEdit.guest_name, 
          nationality: bookingToEdit.nationality || 'Thailand', 
          therapist_type: bookingToEdit.staff_id === 'OUTSOURCE' ? 'part-time' : 'in-house', 
          staff_id: bookingToEdit.staff_id, 
          service_id: bookingToEdit.service_id, 
          payment_status: bookingToEdit.payment_status || 'Paid'
        }]);
      } else {
        const now = new Date();
        setBookingDate(now.toISOString().split('T')[0]);
        setStartTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
        setSalespersonId(salespersons[0]?.id || '');
        setGuests([{ 
          id: Math.random().toString(), 
          guest_name: '', 
          nationality: 'Thailand', 
          therapist_type: 'in-house', 
          staff_id: inHouseStaff[0]?.id || '', 
          service_id: services[0]?.id || '', 
          payment_status: 'Paid' 
        }]);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, bookingToEdit, salespersons, inHouseStaff, services]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const updateGuest = (id: string, field: keyof FormGuest, value: any) => {
    setGuests(prev => prev.map(g => {
      if (g.id === id) {
        const updated = { ...g, [field]: value };
        if (field === 'therapist_type' && value === 'part-time') updated.staff_id = 'OUTSOURCE';
        else if (field === 'therapist_type' && value === 'in-house') updated.staff_id = inHouseStaff[0]?.id || '';
        return updated;
      }
      return g;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const groupRef = isGroup ? (bookingToEdit?.group_ref || `GRP-${Date.now()}`) : undefined;
    const newBookings: Omit<Booking, 'id'>[] = guests.map(g => ({
      guest_name: String(g.guest_name).trim(), 
      nationality: String(g.nationality), 
      group_ref: groupRef ? String(groupRef) : undefined,
      date: String(bookingDate), 
      start_time: String(startTime), 
      end_time: String(calculateEndTime(startTime, g.service_id)),
      staff_id: String(g.staff_id), 
      salesperson_id: salespersonId ? String(salespersonId) : undefined,
      service_id: String(g.service_id), 
      payment_status: g.payment_status || 'Paid', 
      payment_type: paymentType, 
      channel: channel
    }));

    // Perform save
    await onSave(newBookings, bookingToEdit?.id);
    
    // Trigger Success UI
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Auto close after success transition
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const renderCalendar = () => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = calendarViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 md:h-10" />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = dateStr === bookingDate;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push(
        <button
          key={d}
          type="button"
          onClick={() => { setBookingDate(dateStr); setShowCalendar(false); }}
          className={`h-8 md:h-10 w-full flex items-center justify-center rounded-lg text-xs font-bold transition-all
            ${isSelected ? 'bg-sage text-white shadow-md scale-110 z-10' : 'hover:bg-sage/10 text-charcoal'}
            ${isToday && !isSelected ? 'text-sage border border-sage/20' : ''}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div ref={calendarRef} className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-sage/10 p-4 z-[110] w-full sm:w-[320px] animate-in fade-in slide-in-from-top-2">
        <div className="flex justify-between items-center mb-4">
          <button type="button" onClick={() => setCalendarViewDate(new Date(year, month - 1))} className="p-2 hover:bg-sage/5 rounded-lg text-sage"><ChevronLeft size={16} /></button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">{monthName}</span>
          <button type="button" onClick={() => setCalendarViewDate(new Date(year, month + 1))} className="p-2 hover:bg-sage/5 rounded-lg text-sage"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
            <div key={d} className="h-6 flex items-center justify-center text-[8px] font-bold text-sage/40">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const isThai = language === 'th';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-0 md:p-4">
      {/* Success Popup Transition */}
      {showSuccess && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[3rem] shadow-premium flex flex-col items-center gap-6 animate-in zoom-in-90 fade-in duration-300">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-charcoal">{isThai ? 'บันทึกสำเร็จ' : 'Confirmed'}</h3>
              <p className="text-[10px] font-black text-sage uppercase tracking-[0.3em] mt-2 opacity-60">
                {isThai ? 'รายการจองของคุณเรียบร้อยแล้ว' : 'Reservation Secure'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`bg-cream w-full h-full md:h-auto md:max-w-5xl md:max-h-[90vh] overflow-hidden rounded-none md:rounded-[2.5rem] shadow-2xl border-none md:border md:border-sage/20 flex flex-col transition-all duration-500 ${showSuccess ? 'opacity-30 scale-95 blur-sm grayscale' : 'opacity-100 scale-100'}`}>
        <div className="sticky top-0 bg-cream/95 backdrop-blur-md p-5 md:p-6 border-b border-sage/10 flex justify-between items-center z-20 shrink-0 safe-area-pt">
          <div>
            <h2 className={`text-lg md:text-2xl font-serif text-charcoal font-semibold ${isThai ? 'leading-relaxed' : ''}`}>
              {bookingToEdit ? (language === 'en' ? 'Edit Booking' : 'แก้ไขรายการจอง') : (language === 'en' ? 'New Booking' : 'เพิ่มการจองใหม่')}
            </h2>
            <p className="text-[8px] md:text-[10px] text-sage font-bold uppercase tracking-widest">Premium Spa Management</p>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 hover:bg-sage/10 rounded-full transition-colors active:scale-90"><X size={24} className="text-charcoal" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto scrollbar-hide pb-24 md:pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="space-y-1.5 relative">
              <label className="text-[9px] uppercase tracking-widest text-sage font-bold flex items-center gap-2"><CalendarIcon size={12} /> Date</label>
              <div 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-white border border-sage/20 rounded-xl px-4 h-11 md:h-12 flex items-center justify-between cursor-pointer hover:border-sage transition-all shadow-sm active:scale-[0.98]"
              >
                <span className="text-sm font-bold text-charcoal">{bookingDate || 'Select Date'}</span>
                <ChevronDown size={14} className="text-sage" />
              </div>
              {showCalendar && renderCalendar()}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-sage font-bold flex items-center gap-2"><Clock size={12} /> Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl px-4 h-11 md:h-12 outline-none focus:border-sage text-sm font-bold shadow-sm" required />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-sage font-bold flex items-center gap-2"><ShoppingBag size={12} /> Partner</label>
              <select value={salespersonId} onChange={(e) => setSalespersonId(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl px-4 h-11 md:h-12 outline-none focus:border-sage text-sm font-bold shadow-sm appearance-none">
                {salespersons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {!bookingToEdit && (
              <div className="flex items-end">
                 <button type="button" onClick={() => setIsGroup(!isGroup)} className={`flex items-center justify-center gap-3 w-full h-11 md:h-12 rounded-xl border transition-all active:scale-95 ${isGroup ? 'bg-sage text-white border-sage shadow-md' : 'bg-sage/5 border-sage/10 text-charcoal'}`}>
                    <input type="checkbox" checked={isGroup} onChange={() => {}} className="w-4 h-4 accent-white pointer-events-none" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Multi-Guest Group</span>
                 </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {guests.map((guest, index) => (
              <div key={guest.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-5 md:p-8 bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-[2rem] border border-sage/10 items-start shadow-sm relative group/guest">
                <div className="lg:col-span-3 space-y-1.5">
                  <label className="text-[8px] uppercase text-sage font-bold">Guest Name</label>
                  <input type="text" value={guest.guest_name} onChange={(e) => updateGuest(guest.id, 'guest_name', e.target.value)} className="w-full bg-cream/30 border border-sage/10 rounded-xl h-11 px-4 text-sm font-bold outline-none focus:border-sage" placeholder="Elena Petrov" required />
                </div>
                <div className="lg:col-span-3 space-y-1.5">
                  <label className="text-[8px] uppercase text-sage font-bold">Treatment</label>
                  <select value={guest.service_id} onChange={(e) => updateGuest(guest.id, 'service_id', e.target.value)} className="w-full bg-cream/30 border border-sage/10 rounded-xl h-11 px-4 text-xs font-bold outline-none focus:border-sage appearance-none">
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.duration}m)</option>)}
                  </select>
                </div>
                <div className="lg:col-span-4 space-y-2.5">
                  <label className="text-[8px] uppercase text-sage font-bold">Therapist</label>
                  <div className="flex bg-cream/50 p-1 rounded-xl border border-sage/10">
                     <button type="button" onClick={() => updateGuest(guest.id, 'therapist_type', 'in-house')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 ${guest.therapist_type === 'in-house' ? 'bg-sage text-white shadow-sm' : 'text-sage hover:bg-sage/5'}`}>In-House</button>
                     <button type="button" onClick={() => updateGuest(guest.id, 'therapist_type', 'part-time')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase transition-all active:scale-95 ${guest.therapist_type === 'part-time' ? 'bg-charcoal text-white shadow-sm' : 'text-sage hover:bg-sage/5'}`}>Part-time</button>
                  </div>
                  {guest.therapist_type === 'in-house' ? (
                    <select value={guest.staff_id} onChange={(e) => updateGuest(guest.id, 'staff_id', e.target.value)} className="w-full bg-cream/30 border border-sage/10 rounded-xl h-11 px-4 text-xs font-bold outline-none focus:border-sage appearance-none">
                      {inHouseStaff.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                  ) : <div className="h-11 bg-gray-50 flex items-center justify-center text-[9px] font-bold text-gray-400 uppercase rounded-xl border border-dashed border-gray-200">Part-time Dispatch</div>}
                </div>
                {guests.length > 1 && (
                  <button type="button" onClick={() => setGuests(prev => prev.filter(g => g.id !== guest.id))} className="lg:col-span-1 p-3 text-red-300 hover:text-red-500 self-center transition-colors active:scale-90">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            {isGroup && !bookingToEdit && (
              <button type="button" onClick={() => setGuests(prev => [...prev, { id: Math.random().toString(), guest_name: '', nationality: 'Thailand', therapist_type: 'in-house', staff_id: inHouseStaff[0]?.id || '', service_id: services[0]?.id || '', payment_status: 'Paid' }])} className="w-full py-4 border-2 border-dashed border-sage/20 rounded-2xl text-sage font-bold text-[10px] uppercase tracking-widest hover:bg-sage/5 transition-all flex items-center justify-center gap-2 active:scale-[0.99]">
                <Plus size={16} /> Add Group Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pt-4 border-t border-sage/10">
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-sage font-bold">Payment</label>
              <div className="flex gap-2">
                {['Cash', 'Card'].map(type => (
                  <button key={type} type="button" onClick={() => setPaymentType(type as PaymentType)} className={`flex-1 h-11 rounded-xl border text-[9px] font-bold uppercase transition-all active:scale-95 ${paymentType === type ? 'bg-sage text-white border-sage shadow-md' : 'bg-white text-sage border-sage/20 hover:bg-sage/5'}`}>{type}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-sage font-bold">Status</label>
              <div className="flex gap-2">
                {['Paid', 'Pending'].map(status => (
                  <button key={status} type="button" onClick={() => setGuests(prev => prev.map(g => ({...g, payment_status: status as any})))} className={`flex-1 h-11 rounded-xl border text-[9px] font-bold uppercase transition-all active:scale-95 ${guests[0]?.payment_status === status ? 'bg-charcoal text-white border-charcoal shadow-md' : 'bg-white text-sage border-sage/20 hover:bg-sage/5'}`}>{status}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 pb-20 md:pb-0 safe-area-pb">
            <button 
              type="submit" 
              disabled={isSubmitting || showSuccess}
              className={`w-full bg-charcoal hover:bg-black text-white font-bold h-14 md:h-16 rounded-[1.5rem] md:rounded-[2rem] shadow-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${isSubmitting ? 'opacity-80' : ''}`}
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (bookingToEdit ? 'Save Changes' : 'Confirm Reservation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
