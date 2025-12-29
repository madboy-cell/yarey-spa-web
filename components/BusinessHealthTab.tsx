
import React, { useState, useMemo } from 'react';
import { Booking, Service, Staff, Salesperson } from '../types';
import { Language } from '../App';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Loader2,
  Clock,
  ShoppingBag,
  Check,
  UserCheck,
  Zap,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Target,
  Flame
} from 'lucide-react';
import BookingDetailModal from './BookingDetailModal';

interface BusinessHealthTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  salespersons: Salesperson[];
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
  monthlyRevenueGoal: number;
  language: Language;
  onGoalUpdate: (newGoal: number) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
}

const TRANSLATIONS = {
  en: {
    cockpit: 'Executive Intelligence',
    bi: 'Daily Pulse',
    broadcast: 'Send LINE Report',
    transmitting: 'Transmitting...',
    sent: 'Report Sent',
    target: 'Monthly Target',
    yield: 'Accumulated Yield',
    dailyRevenue: 'Daily Revenue',
    dailyBurn: 'Operational Burn',
    dailyProfit: 'Daily Net Profit',
    confirmed: 'Confirmed: {count} Sessions',
    margin: 'Margin',
    salesPartner: 'Sales Partners',
    staffSnapshot: 'Staff Performance',
    dailySchedule: 'Daily Agenda',
    noBookings: 'No appointments for today',
    hrs: 'hrs',
    rev: 'Rev',
    comm: 'Comm',
    breakdown: {
      supplies: 'Cost of Goods',
      fixedLabor: 'Fixed Salaries',
      inHouseLabor: 'In-House Payout',
      agencyLabor: 'Part-time Payout',
      partner: 'Commissions'
    }
  },
  th: {
    cockpit: 'แผงควบคุมผู้บริหาร',
    bi: 'สรุปภาพรวมธุรกิจ',
    broadcast: 'ส่งรายงาน LINE',
    transmitting: 'กำลังประมวลผล...',
    sent: 'ส่งรายงานสำเร็จ',
    target: 'เป้าหมายรายเดือน',
    yield: 'รายได้สะสม',
    dailyRevenue: 'ยอดขายวันนี้',
    dailyBurn: 'ต้นทุนวันนี้',
    dailyProfit: 'กำไรสุทธิวันนี้',
    confirmed: 'ยืนยันแล้ว: {count} รายการ',
    margin: 'อัตรากำไร',
    salesPartner: 'สรุปยอดพาร์ทเนอร์',
    staffSnapshot: 'ผลงานพนักงาน',
    dailySchedule: 'ตารางงานวันนี้',
    noBookings: 'ไม่มีรายการจองสำหรับวันนี้',
    hrs: 'ชม.',
    rev: 'รายได้',
    comm: 'คอมฯ',
    breakdown: {
      supplies: 'ต้นทุนสินค้า (COGS)',
      fixedLabor: 'เงินเดือนประจำ',
      inHouseLabor: 'ค่ามือพนักงานประจำ',
      agencyLabor: 'ค่ามือพนักงาน Part-time',
      partner: 'ค่าคอมมิชชัน'
    }
  }
};

const LINE_BRIDGE_URL = 'https://yarey-spa-line-bot.sir-thanapat.workers.dev';

const getLocalToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split('T')[0];
};

const BusinessHealthTab: React.FC<BusinessHealthTabProps> = ({ 
  bookings, 
  services, 
  staff, 
  salespersons,
  inHouseHourlyRate,
  outsourceHourlyRate,
  monthlyRevenueGoal,
  language,
  onGoalUpdate,
  onEditBooking,
  onDeleteBooking
}) => {
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [broadcastState, setBroadcastState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const currentMonthKey = selectedDate.substring(0, 7);

  const getService = (id: string) => services.find(s => s.id === id);
  const getStaff = (id: string) => staff.find(s => s.id === id);

  const stats = useMemo(() => {
    const monthlyBookings = bookings.filter(b => b.date.startsWith(currentMonthKey) && b.payment_status !== 'Canceled');
    const monthlyAccruedRevenue = monthlyBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const monthlyProgress = Math.min((monthlyAccruedRevenue / (monthlyRevenueGoal || 1)) * 100, 100);

    const dayBookings = bookings
      .filter(b => b.date === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
      
    const activeDayBookings = dayBookings.filter(b => b.payment_status !== 'Canceled');
    const dailyRevenue = activeDayBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    
    const dailyFixedLabor = staff.filter(s => !s.is_outsource).reduce((sum, s) => sum + (s.base_salary || 0), 0) / 30;

    let dailySuppliesCost = 0;
    let dailyInHouseVariableLabor = 0;
    let dailyAgencyVariableLabor = 0;
    let dailyCommissionCost = 0;

    activeDayBookings.forEach(booking => {
      const service = getService(booking.service_id);
      if (service) {
        dailySuppliesCost += (service.totalUnitCost || 0);
        const staffMember = staff.find(st => st.id === booking.staff_id);
        const isAgency = (booking.staff_id === 'OUTSOURCE' || staffMember?.is_outsource);
        if (isAgency) dailyAgencyVariableLabor += (service.duration / 60) * outsourceHourlyRate;
        else dailyInHouseVariableLabor += (service.duration / 60) * inHouseHourlyRate;
        dailyCommissionCost += (booking.sales_commission || 0);
      }
    });

    const dailyTotalExpense = dailyFixedLabor + dailySuppliesCost + dailyInHouseVariableLabor + dailyAgencyVariableLabor + dailyCommissionCost;
    const dailyProfit = dailyRevenue - dailyTotalExpense;
    const margin = dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : 0;

    const staffMap = new Map<string, { name: string, hours: number, payout: number, color: string }>();
    activeDayBookings.forEach(b => {
      const s = getService(b.service_id);
      if (!s) return;
      const staffMember = getStaff(b.staff_id);
      const isAgency = b.staff_id === 'OUTSOURCE' || staffMember?.is_outsource;
      const hours = s.duration / 60;
      const id = b.staff_id;
      const rate = isAgency ? outsourceHourlyRate : inHouseHourlyRate;
      const payout = hours * rate;

      const existing = staffMap.get(id);
      if (existing) {
        existing.hours += hours;
        existing.payout += payout;
      } else {
        staffMap.set(id, {
          name: b.staff_id === 'OUTSOURCE' ? (language === 'en' ? 'Part-time' : 'ชั่วคราว') : (staffMember?.name || 'Unknown'),
          hours,
          payout,
          color: staffMember?.color_code || '#7D8461'
        });
      }
    });

    const partnerMap = new Map<string, { name: string, revenue: number, commission: number }>();
    activeDayBookings.forEach(b => {
      const s = getService(b.service_id);
      if (!s) return;
      const partner = salespersons.find(sp => sp.id === b.salesperson_id);
      const rev = s.price;
      const comm = b.sales_commission || 0;
      const id = b.salesperson_id || 'direct';
      const existing = partnerMap.get(id);
      if (existing) {
        existing.revenue += rev;
        existing.commission += comm;
      } else {
        partnerMap.set(id, {
          name: partner?.name || 'Direct',
          revenue: rev,
          commission: comm
        });
      }
    });

    return {
      dailyRevenue, dailyProfit, dailyTotalExpense, dailyMargin: margin,
      monthlyAccruedRevenue, monthlyProgress,
      dayBookings,
      activeDayCount: activeDayBookings.length,
      staffStats: Array.from(staffMap.values()).sort((a, b) => b.hours - a.hours),
      partnerStats: Array.from(partnerMap.values()).sort((a, b) => b.revenue - a.revenue),
      breakdown: [
        { label: t.breakdown.fixedLabor, value: dailyFixedLabor, color: '#7D8461' },
        { label: t.breakdown.inHouseLabor, value: dailyInHouseVariableLabor, color: '#A7AF93' },
        { label: t.breakdown.agencyLabor, value: dailyAgencyVariableLabor, color: '#2D2D2D' },
        { label: t.breakdown.supplies, value: dailySuppliesCost, color: '#D3D8C3' },
        { label: t.breakdown.partner, value: dailyCommissionCost, color: '#B4975A' }
      ]
    };
  }, [selectedDate, bookings, services, staff, salespersons, inHouseHourlyRate, outsourceHourlyRate, monthlyRevenueGoal, currentMonthKey, t.breakdown, language]);

  const sendLineReport = async () => {
    setBroadcastState('loading');
    
    const barSize = 10;
    const filled = Math.round((stats.monthlyProgress / 100) * barSize);
    const empty = barSize - filled;
    const progressBar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;

    let reportText = `${language === 'en' ? '🌿 YAREY EXECUTIVE REPORT' : '🌿 รายงานผู้บริหาร ยาเรย์'}\n`;
    reportText += `📅 ${selectedDate}\n\n`;
    
    reportText += `${language === 'en' ? '💰 REVENUE' : '💰 ยอดขาย'}: ฿${stats.dailyRevenue.toLocaleString()}\n`;
    reportText += `${language === 'en' ? '💎 PROFIT' : '💎 กำไร'}: ฿${stats.dailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${stats.dailyMargin.toFixed(1)}%)\n\n`;

    reportText += `${language === 'en' ? '🔥 DAILY BURN' : '🔥 ต้นทุนวันนี้'}: ฿${stats.dailyTotalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n`;
    stats.breakdown.filter(i => i.value > 0).forEach(i => {
      reportText += `• ${i.label}: ฿${i.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}\n`;
    });
    reportText += `\n`;

    reportText += `${language === 'en' ? '🚀 MONTHLY GOAL' : '🚀 เป้าหมายเดือนนี้'}: ${stats.monthlyProgress.toFixed(1)}%\n${progressBar}\n\n`;

    reportText += `${language === 'en' ? '👥 STAFF PERFORMANCE' : '👥 ผลงานพนักงาน'}:\n`;
    stats.staffStats.forEach(s => {
      reportText += `• ${s.name}: ${s.hours.toFixed(1)} ${language === 'en' ? 'hrs' : 'ชม.'} (฿${s.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })})\n`;
    });
    reportText += `\n`;

    if (stats.partnerStats.length > 0) {
      reportText += `${language === 'en' ? '🤝 PARTNERS' : '🤝 พาร์ทเนอร์'}:\n`;
      stats.partnerStats.forEach(p => {
        reportText += `• ${p.name}: ฿${p.revenue.toLocaleString()} (Comm: ฿${p.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })})\n`;
      });
    }

    try {
      const response = await fetch(LINE_BRIDGE_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ reportText }) 
      });
      if (response.ok) { setBroadcastState('success'); setTimeout(() => setBroadcastState('idle'), 3000); }
      else throw new Error('Broadcast Failed');
    } catch (e) { setBroadcastState('idle'); }
  };

  return (
    <div className="p-6 md:p-12 h-full bg-cream-dark overflow-y-auto scrollbar-hide pb-32">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <div className="flex items-center gap-3 text-gold font-black text-[10px] uppercase tracking-[0.4em] mb-2 opacity-80">
            <Activity size={14} strokeWidth={3} className="animate-pulse" /> {t.cockpit}
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-charcoal font-bold tracking-tight leading-none">{t.bi}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={sendLineReport} 
            disabled={broadcastState !== 'idle'}
            className={`h-14 px-8 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-premium transition-all active:scale-[0.98] ${broadcastState === 'success' ? 'bg-green-600 text-white' : 'bg-charcoal text-white hover:bg-charcoal-dark'}`}
          >
            {broadcastState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : broadcastState === 'success' ? <Check size={16} strokeWidth={3} /> : <Zap size={16} className="text-gold" strokeWidth={3} />}
            {broadcastState === 'loading' ? t.transmitting : broadcastState === 'success' ? t.sent : t.broadcast}
          </button>

          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-sage-100 shadow-soft">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-sage-50 rounded-xl text-sage transition-all active:scale-90"><ChevronLeft size={20} strokeWidth={2.5} /></button>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-black text-xs text-charcoal outline-none cursor-pointer uppercase tracking-widest text-center" />
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2 hover:bg-sage-50 rounded-xl text-sage transition-all active:scale-90"><ChevronRight size={20} strokeWidth={2.5} /></button>
          </div>
        </div>
      </div>

      {/* Target Progress Card */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-sage-100 shadow-premium mb-10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sage-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl transition-all group-hover:scale-110" />
        <div className="flex justify-between items-end mb-6 px-2 relative z-10">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-sage-50 rounded-2xl text-sage"><Target size={24} strokeWidth={2.5} /></div>
              <div>
                <p className="text-[10px] font-black text-sage uppercase tracking-[0.3em] opacity-60 mb-1">{t.target}</p>
                <p className="text-xl font-serif font-bold text-charcoal">฿{stats.monthlyAccruedRevenue.toLocaleString()} <span className="text-sage/30 mx-2">/</span> ฿{monthlyRevenueGoal.toLocaleString()}</p>
              </div>
           </div>
           <span className="text-4xl font-serif font-black text-sage">{stats.monthlyProgress.toFixed(1)}%</span>
        </div>
        <div className="h-6 w-full bg-sage-50 rounded-full overflow-hidden p-1.5 border border-sage-100 shadow-inner">
           <div className="h-full bg-sage rounded-full transition-all duration-1000 shadow-lg" style={{ width: `${stats.monthlyProgress}%` }} />
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[3rem] border border-sage-100 shadow-premium relative overflow-hidden group">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage/40 font-black mb-6">{t.dailyRevenue}</p>
          <div className="text-5xl md:text-6xl font-serif font-bold text-charcoal group-hover:text-sage transition-colors duration-500">฿{stats.dailyRevenue.toLocaleString()}</div>
          <p className="mt-8 text-[10px] font-black text-sage uppercase tracking-widest bg-sage-50 inline-block px-4 py-2 rounded-full">{t.confirmed.replace('{count}', stats.activeDayCount.toString())}</p>
        </div>
        
        <div className="bg-white p-10 rounded-[3rem] border border-sage-100 shadow-premium flex flex-col group">
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-sage/40 font-black">{t.dailyBurn}</p>
            <Flame size={16} className="text-gold animate-pulse" />
          </div>
          <div className="text-5xl md:text-6xl font-serif font-bold text-charcoal mb-8 flex items-baseline gap-2">
            <span className="text-2xl opacity-20">฿</span>{stats.dailyTotalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          
          <div className="space-y-4 mb-8 flex-1">
             {stats.breakdown.filter(i => i.value > 0).map((item, idx) => (
               <div key={idx} className="flex justify-between items-center group/item">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-sage/40 uppercase tracking-widest group-hover/item:text-sage transition-colors">{item.label}</span>
                 </div>
                 <span className="text-xs font-black text-charcoal">฿{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
               </div>
             ))}
          </div>

          <div className="flex h-3 w-full bg-sage-50 rounded-full overflow-hidden p-0.5 border border-sage-100 shadow-inner">
            {stats.breakdown.map((item, idx) => {
              const width = (item.value / (stats.dailyTotalExpense || 1)) * 100;
              return width > 0.5 ? <div key={idx} className="h-full transition-all duration-1000" style={{ width: `${width}%`, backgroundColor: item.color }} /> : null;
            })}
          </div>
        </div>

        <div className={`p-10 rounded-[3rem] border shadow-premium transition-all duration-500 hover:scale-[1.02] ${stats.dailyProfit > 0 ? 'bg-sage text-white border-sage' : 'bg-red-50 text-red-600 border-red-100'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-60">{t.dailyProfit}</p>
          <div className="text-5xl md:text-6xl font-serif font-bold">฿{Math.abs(stats.dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="mt-10 px-6 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">{t.margin}: {stats.dailyMargin.toFixed(1)}%</div>
        </div>
      </div>

      {/* Grid for Schedule & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[4rem] border border-white shadow-premium">
          <div className="flex justify-between items-center mb-12 px-4">
            <h4 className="font-serif text-4xl font-bold flex items-center gap-4 text-charcoal">
              <Clock size={32} strokeWidth={2.5} className="text-gold" /> {t.dailySchedule}
            </h4>
            <div className="text-[10px] font-black text-sage uppercase tracking-[0.3em] bg-white border border-sage-100 px-6 py-3 rounded-2xl shadow-soft">{stats.activeDayCount} Sessions</div>
          </div>
          
          <div className="space-y-6">
            {stats.dayBookings.length > 0 ? (
              stats.dayBookings.map((b) => {
                const service = getService(b.service_id);
                const isPaid = b.payment_status === 'Paid';
                const isCanceled = b.payment_status === 'Canceled';

                return (
                  <div key={b.id} onClick={() => { setSelectedDetailBooking(b); setIsDetailModalOpen(true); }} className={`group relative bg-white rounded-[2rem] border border-sage-100 shadow-soft hover:shadow-premium transition-all cursor-pointer overflow-hidden flex items-center px-6 py-5 md:px-10 md:py-8 gap-6 md:gap-10 ${isCanceled ? 'opacity-30 grayscale' : ''}`}>
                    <div className="flex flex-col items-center justify-center pr-6 md:pr-10 border-r border-sage-50 min-w-[70px] md:min-w-[110px]">
                      <span className="text-sm md:text-lg font-black text-charcoal group-hover:text-gold transition-colors">{b.start_time}</span>
                      <span className="text-[10px] font-bold text-sage/30 uppercase tracking-widest">{b.end_time}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h5 className="text-base md:text-xl font-bold text-charcoal truncate">{b.guest_name}</h5>
                         <span className="px-2 py-0.5 bg-sage-50 border border-sage-100 text-[9px] font-black text-sage uppercase rounded-lg shrink-0 tracking-tighter">{b.nationality}</span>
                      </div>
                      <p className="text-[11px] md:text-sm font-serif italic text-sage-dark/60 truncate">{service?.name}</p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-2">
                      <div className="text-xl md:text-3xl font-serif font-black text-charcoal">฿{service?.price.toLocaleString()}</div>
                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${isPaid ? 'bg-sage-50 text-sage border border-sage-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                         {isPaid ? 'Settled' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-24 flex flex-col items-center justify-center opacity-20">
                <CalendarIcon size={64} className="text-sage mb-6" strokeWidth={1} />
                <p className="font-serif text-2xl italic">{t.noBookings}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
           <div className="bg-white p-10 rounded-[3rem] border border-sage-100 shadow-premium">
              <h4 className="font-serif text-2xl font-bold mb-10 flex items-center gap-4 text-charcoal"><UserCheck size={22} className="text-gold" /> {t.staffSnapshot}</h4>
              <div className="space-y-4">
                {stats.staffStats.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-5 bg-cream rounded-[1.5rem] border border-sage-100 group transition-all hover:bg-white hover:shadow-soft">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg" style={{ backgroundColor: s.color }}>{s.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{s.name}</p>
                        <p className="text-[9px] font-black text-sage uppercase tracking-widest opacity-40">{s.hours.toFixed(1)} {t.hrs}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-serif font-bold text-sage">฿{s.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-white p-10 rounded-[3rem] border border-sage-100 shadow-premium">
              <h4 className="font-serif text-2xl font-bold mb-10 flex items-center gap-4 text-charcoal"><ShoppingBag size={22} className="text-gold" /> {t.salesPartner}</h4>
              <div className="space-y-4">
                {stats.partnerStats.map(p => (
                  <div key={p.name} className="p-6 bg-cream/50 rounded-[2rem] border border-sage-100 hover:bg-white transition-all hover:shadow-soft">
                    <div className="flex justify-between items-center mb-3">
                       <p className="text-sm font-bold text-charcoal">{p.name}</p>
                       <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">{t.rev}</span>
                          <p className="text-lg font-serif font-bold text-charcoal">฿{p.revenue.toLocaleString()}</p>
                       </div>
                    </div>
                    <div className="pt-4 border-t border-sage-100 flex justify-between items-center">
                       <span className="text-[9px] font-black text-sage/40 uppercase tracking-widest">{t.comm}</span>
                       <span className="text-xs font-black text-sage-dark">฿{p.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>

      <BookingDetailModal 
        isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}
        booking={selectedDetailBooking} service={selectedDetailBooking ? getService(selectedDetailBooking.service_id) || null : null}
        staffMember={selectedDetailBooking ? getStaff(selectedDetailBooking.staff_id) || null : null}
        salesperson={selectedDetailBooking ? salespersons.find(s => s.id === selectedDetailBooking.salesperson_id) || null : null}
        inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} language={language}
      />
    </div>
  );
};

export default BusinessHealthTab;
