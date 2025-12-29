
import React, { useState } from 'react';
import { Booking, Staff, Service, Salesperson } from '../types';
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
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import BookingDetailModal from './BookingDetailModal';

interface DashboardProps {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
  salespersons: Salesperson[];
  language: Language;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
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
    empty: 'The space is breathing. No sessions scheduled yet.',
    search: 'Search guest names...'
  },
  th: {
    metrics: {
      arrivals: 'จำนวนผู้เข้าใช้บริการ',
      vol: 'ชั่วโมงบริการรวม',
      yield: 'ยอดขายวันนี้',
      efficiency: 'ประสิทธิภาพการจอง'
    },
    table: {
      guest: 'ข้อมูลลูกค้า & สัญชาติ',
      treatment: 'บริการ & เวลา',
      assignment: 'ผู้ให้บริการ (เทอราปิส)',
      settlement: 'สถานะการชำระ',
      actions: 'ยอดรวม & จัดการ'
    },
    empty: 'ความสงบเงียบ... ยังไม่มีรายการนัดหมายสำหรับช่วงเวลานี้',
    search: 'ค้นหาชื่อลูกค้า...'
  }
};

const Dashboard: React.FC<DashboardProps> = ({ 
  bookings, 
  staff, 
  services, 
  salespersons, 
  language, 
  onEditBooking, 
  onDeleteBooking,
  inHouseHourlyRate,
  outsourceHourlyRate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const t = TRANSLATIONS[language];

  const getBookingService = (serviceId: string) => services.find(s => s.id === serviceId);
  const getBookingStaff = (staffId: string) => staff.find(st => st.id === staffId);
  const getSalesperson = (id: string) => salespersons.find(s => s.id === id);

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

  const openBookingDetail = (b: Booking) => {
    setSelectedDetailBooking(b);
    setIsDetailModalOpen(true);
  };

  const isThai = language === 'th';

  return (
    <div className="flex flex-col h-full bg-cream/30">
      {/* Metric Cards with Glassmorphism - Stacked on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 p-4 md:p-8 shrink-0">
        {[
          { label: t.metrics.arrivals, value: selectedDayBookings.length, icon: Users, suffix: 'guests' },
          { label: t.metrics.vol, value: totalHours.toFixed(1), icon: Timer, suffix: 'hrs' },
          { label: t.metrics.yield, value: `฿${totalRevenue.toLocaleString()}`, icon: DollarSign, isCurrency: true },
          { label: t.metrics.efficiency, value: '82%', icon: TrendingUp, suffix: 'cap' }
        ].map((m, idx) => (
          <div key={idx} className="bg-white/70 backdrop-blur-md p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/50 shadow-xl shadow-sage/5 flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-sage/10 p-2.5 md:p-4 rounded-xl md:rounded-2xl text-sage shrink-0"><m.icon size={18} className="sm:w-6 sm:h-6" /></div>
            <div className="relative z-10 text-center sm:text-left">
              <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-0.5 sm:mb-1 ${isThai ? 'leading-relaxed' : ''}`}>{m.label}</p>
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <p className="text-xl md:text-3xl font-serif text-charcoal font-bold">{m.value}</p>
                {m.suffix && <span className="text-[7px] md:text-[9px] font-bold text-sage/40 uppercase tracking-widest">{m.suffix}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-hidden px-4 md:px-8 pb-4 md:pb-8 flex flex-col gap-4 md:gap-6">
        {/* Controls - Adaptive Layout */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-3 md:gap-4 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl border border-sage/10 shadow-sm w-full lg:w-auto justify-between sm:justify-center">
             <button onClick={() => shiftDate(-1)} className="p-2 md:p-2.5 hover:bg-sage/5 rounded-xl text-sage transition-all active:scale-90"><ChevronLeft size={18} /></button>
             <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 border-x border-sage/10">
               <CalendarIcon size={16} className="text-sage" />
               <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="bg-transparent text-xs md:text-sm font-bold text-charcoal outline-none cursor-pointer py-1" />
             </div>
             <button onClick={() => shiftDate(1)} className="p-2 md:p-2.5 hover:bg-sage/5 rounded-xl text-sage transition-all active:scale-90"><ChevronRight size={18} /></button>
          </div>
          <div className="flex flex-row items-center gap-2 md:gap-4 w-full">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/60" />
              <input type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/80 backdrop-blur-sm border border-sage/10 rounded-2xl py-3 md:py-4 pl-10 md:pl-14 pr-4 outline-none focus:ring-4 focus:ring-sage/5 shadow-sm font-medium text-xs md:text-sm text-charcoal transition-all placeholder:text-sage/30" />
            </div>
            <button className="bg-white p-3 md:p-4 rounded-2xl border border-sage/10 text-sage hover:bg-sage hover:text-white transition-all shadow-sm active:scale-90"><Filter size={18} /></button>
          </div>
        </div>

        {/* Timeline Table - Preservation of Line Structure with Scroll */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-white shadow-2xl shadow-sage/10 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="min-w-[700px] md:min-w-0 flex flex-col h-full">
              <div className="grid grid-cols-12 px-6 md:px-10 py-5 md:py-6 border-b border-sage/10 bg-sage/5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-sage/70 sticky top-0 z-10">
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
                      <div 
                        key={b.id} 
                        onClick={() => openBookingDetail(b)}
                        className={`grid grid-cols-12 px-6 md:px-10 py-6 md:py-8 border-b border-sage/5 hover:bg-white transition-all items-center group cursor-pointer relative ${isPaid ? 'border-l-[4px] md:border-l-[6px] border-l-sage' : 'border-l-[4px] md:border-l-[6px] border-l-orange-200'}`}
                      >
                        <div className="col-span-3 flex items-center gap-3 md:gap-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-cream rounded-xl md:rounded-2xl border border-sage/10 flex items-center justify-center text-sage font-serif font-bold text-base md:text-lg group-hover:bg-sage group-hover:text-white transition-colors">{b.guest_name.charAt(0)}</div>
                          <div>
                            <p className={`text-xs md:text-sm font-bold text-charcoal group-hover:text-sage transition-colors truncate max-w-[100px] sm:max-w-none ${isThai ? 'leading-relaxed' : ''}`}>{b.guest_name}</p>
                            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                              <span className="text-[8px] md:text-[9px] bg-sage/10 text-sage px-1.5 md:px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">
                                <Globe size={8} className="inline mr-1" />{b.nationality}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-3 flex flex-col gap-0.5 md:gap-1">
                          <div className="flex items-center gap-1.5 md:gap-2 text-charcoal">
                            <Clock size={12} className="text-sage" />
                            <span className="text-[10px] md:text-sm font-bold">{b.start_time} — {b.end_time}</span>
                          </div>
                          <p className={`text-[9px] md:text-xs text-sage font-medium italic truncate ${isThai ? 'leading-relaxed' : ''}`}>{service?.name}</p>
                        </div>

                        <div className="col-span-3 flex items-center gap-2 md:gap-3">
                          {isOutsource ? (
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-charcoal text-white flex items-center justify-center shadow-sm"><AgencyIcon size={12} /></div>
                              <p className={`text-[10px] md:text-xs font-bold text-charcoal/60 truncate ${isThai ? 'leading-relaxed' : ''}`}>{language === 'en' ? 'Agency' : 'สำรอง'}</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl flex items-center justify-center text-white text-[9px] md:text-[10px] font-bold shadow-sm" style={{ backgroundColor: assignedStaff?.color_code }}>
                                {assignedStaff?.name.charAt(0)}
                              </div>
                              <p className={`text-[10px] md:text-xs font-bold text-charcoal truncate ${isThai ? 'leading-relaxed' : ''}`}>{assignedStaff?.name}</p>
                            </div>
                          )}
                        </div>

                        <div className="col-span-1">
                          <div className={`inline-flex px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-bold uppercase tracking-widest ${isPaid ? 'bg-sage text-white shadow-lg shadow-sage/20' : 'bg-cream text-charcoal/40 border border-sage/10'}`}>
                            {isPaid ? (language === 'en' ? 'Paid' : 'ชำระแล้ว') : (language === 'en' ? 'Pend' : 'ค้าง')}
                          </div>
                        </div>

                        <div className="col-span-2 text-right flex items-center justify-end gap-3 md:gap-6">
                          <div className="text-right font-bold font-serif text-charcoal text-sm md:text-lg">฿{service?.price.toLocaleString()}</div>
                          <div className="flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onEditBooking(b)} className="p-1.5 md:p-2 text-sage hover:bg-sage/10 rounded-lg active:scale-90"><Edit3 size={16} /></button>
                            <button onClick={() => onDeleteBooking(b)} className="p-1.5 md:p-2 text-red-400 hover:bg-red-50 rounded-lg active:scale-90"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 md:p-20 text-center opacity-40">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-sage/5 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-sage/10">
                      <CalendarIcon size={30} className="text-sage" />
                    </div>
                    <h3 className="font-serif text-lg md:text-2xl text-charcoal italic mb-2 px-6 md:px-10 leading-snug">{t.empty}</h3>
                    <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] text-sage font-bold">Yarey Spa Phuket</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedDetailBooking}
        service={selectedDetailBooking ? getBookingService(selectedDetailBooking.service_id) || null : null}
        staffMember={selectedDetailBooking ? getBookingStaff(selectedDetailBooking.staff_id) || null : null}
        salesperson={selectedDetailBooking ? getSalesperson(selectedDetailBooking.salesperson_id || '') || null : null}
        inHouseHourlyRate={inHouseHourlyRate}
        outsourceHourlyRate={outsourceHourlyRate}
        language={language}
      />
    </div>
  );
};

export default Dashboard;
