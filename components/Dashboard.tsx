
import React, { useState } from 'react';
import { Booking, Staff, Service } from '../types';
import { Language } from '../App';
import { 
  Clock, 
  Users, 
  DollarSign, 
  Globe, 
  Search, 
  Filter, 
  CheckCircle2, 
  Timer, 
  Calendar as CalendarIcon,
  UserPlus as AgencyIcon,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
  language: Language;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
}

const TRANSLATIONS = {
  en: {
    metrics: {
      arrivals: 'Daily Arrivals',
      vol: 'Treatment Vol',
      yield: 'Daily Yield',
      efficiency: 'Efficiency'
    },
    table: {
      guest: 'Guest & Origin',
      treatment: 'Treatment & Time',
      assignment: 'Staff Assignment',
      settlement: 'Settlement',
      actions: 'Yield & Actions'
    },
    empty: 'No sessions for this date',
    search: 'Search guest names...'
  },
  th: {
    metrics: {
      arrivals: 'ลูกค้าวันนี้',
      vol: 'ชั่วโมงทรีทเมนท์',
      yield: 'รายได้วันนี้',
      efficiency: 'ประสิทธิภาพ'
    },
    table: {
      guest: 'ลูกค้าและที่มา',
      treatment: 'รายการและเวลา',
      assignment: 'พนักงานที่ดูแล',
      settlement: 'การชำระเงิน',
      actions: 'ยอดชำระและจัดการ'
    },
    empty: 'ไม่มีรายการจองสำหรับวันนี้',
    search: 'ค้นหาชื่อลูกค้า...'
  }
};

const Dashboard: React.FC<DashboardProps> = ({ bookings, staff, services, language, onEditBooking, onDeleteBooking }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  
  const t = TRANSLATIONS[language];

  const getBookingService = (serviceId: string) => services.find(s => s.id === serviceId);
  const getBookingStaff = (staffId: string) => staff.find(st => st.id === staffId);

  const selectedDayBookings = bookings
    .filter(b => b.date === viewDate)
    .filter(b => b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const totalRevenue = selectedDayBookings.reduce((sum, b) => sum + (getBookingService(b.service_id)?.price || 0), 0);
  const totalHours = selectedDayBookings.reduce((sum, b) => {
    const s = getBookingService(b.service_id);
    return sum + (s ? s.duration / 60 : 0);
  }, 0);

  const shiftDate = (days: number) => {
    const current = new Date(viewDate);
    current.setDate(current.getDate() + days);
    setViewDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col h-full bg-cream/30 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 shrink-0">
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage"><Users size={24} /></div>
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">{t.metrics.arrivals}</p><p className="text-3xl font-serif text-charcoal font-bold">{selectedDayBookings.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage"><Timer size={24} /></div>
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">{t.metrics.vol}</p><p className="text-3xl font-serif text-charcoal font-bold">{totalHours.toFixed(1)}h</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage"><DollarSign size={24} /></div>
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">{t.metrics.yield}</p><p className="text-3xl font-serif text-charcoal font-bold">฿{totalRevenue.toLocaleString()}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage"><CheckCircle2 size={24} /></div>
          <div><p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">{t.metrics.efficiency}</p><p className="text-3xl font-serif text-charcoal font-bold">82%</p></div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-8 pb-8 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-sage/10 shadow-sm">
             <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-sage/5 rounded-xl text-sage transition-all"><ChevronLeft size={20} /></button>
             <div className="flex items-center gap-3 px-2 border-x border-sage/10"><CalendarIcon size={18} className="text-sage" /><input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="bg-transparent text-sm font-bold text-charcoal outline-none cursor-pointer p-1" /></div>
             <button onClick={() => shiftDate(1)} className="p-2 hover:bg-sage/5 rounded-xl text-sage transition-all"><ChevronRight size={20} /></button>
          </div>
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/60" /><input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-sage/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-sage/20 shadow-sm font-medium text-charcoal" /></div>
            <button className="bg-white p-4 rounded-2xl border border-sage/10 text-sage hover:bg-sage/5 transition-all shadow-sm"><Filter size={20} /></button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-sage/10 shadow-xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 px-8 py-6 border-b border-sage/10 bg-sage/5 text-[10px] font-bold uppercase tracking-[0.2em] text-sage/70">
            <div className="col-span-3">{t.table.guest}</div>
            <div className="col-span-3">{t.table.treatment}</div>
            <div className="col-span-3">{t.table.assignment}</div>
            <div className="col-span-1">{t.table.settlement}</div>
            <div className="col-span-2 text-right">{t.table.actions}</div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {selectedDayBookings.length > 0 ? (
              selectedDayBookings.map((b) => {
                const service = getBookingService(b.service_id);
                const assignedStaff = getBookingStaff(b.staff_id);
                const isPaid = b.payment_status === 'Paid';
                const isOutsource = b.staff_id === 'OUTSOURCE';
                return (
                  <div key={b.id} className="grid grid-cols-12 px-8 py-8 border-b border-sage/5 hover:bg-cream/50 transition-all items-center group">
                    <div className="col-span-3 flex items-center gap-4"><div className="w-12 h-12 bg-cream rounded-2xl border border-sage/10 flex items-center justify-center text-sage font-serif font-bold text-lg">{b.guest_name.charAt(0)}</div><div><p className="text-sm font-bold text-charcoal">{b.guest_name}</p><div className="flex items-center gap-2 mt-1"><span className="text-[9px] bg-sage/10 text-sage px-2 py-0.5 rounded-md font-bold uppercase"><Globe size={10} className="inline mr-1" />{b.nationality}</span></div></div></div>
                    <div className="col-span-3 flex flex-col gap-1"><div className="flex items-center gap-2 text-charcoal"><Clock size={14} className="text-sage" /><span className="text-sm font-bold">{b.start_time} — {b.end_time}</span></div><p className="text-xs text-sage font-medium">{service?.name}</p></div>
                    <div className="col-span-3 flex items-center gap-3">
                      {isOutsource ? <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center"><AgencyIcon size={14} /></div><p className="text-xs font-bold">{language === 'en' ? 'Agency' : 'พนักงานสำรอง'}</p></div> : <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: assignedStaff?.color_code }}>{assignedStaff?.name.charAt(0)}</div><p className="text-xs font-bold text-charcoal">{assignedStaff?.name}</p></div>}
                    </div>
                    <div className="col-span-1"><div className={`inline-flex px-3 py-1 rounded-xl text-[9px] font-bold uppercase ${isPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{isPaid ? (language === 'en' ? 'Paid' : 'ชำระแล้ว') : (language === 'en' ? 'Pending' : 'ค้างชำระ')}</div></div>
                    <div className="col-span-2 text-right flex items-center justify-end gap-6"><div className="text-right font-bold font-serif text-charcoal">฿{service?.price.toLocaleString()}</div><div className="flex gap-2 opacity-0 group-hover:opacity-100"><button onClick={() => onEditBooking(b)} className="p-2 text-sage"><Edit3 size={18} /></button><button onClick={() => onDeleteBooking(b)} className="p-2 text-red-400"><Trash2 size={18} /></button></div></div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40"><CalendarIcon size={64} className="text-sage mb-4" /><p className="font-serif text-2xl text-charcoal italic">{t.empty}</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
