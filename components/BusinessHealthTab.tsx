
import React, { useState, useMemo } from 'react';
import { Booking, Service, Staff, Salesperson, Category } from '../types';
import { Language } from '../App';
import { 
  Activity, 
  Calendar as CalendarIcon, 
  Send,
  Loader2,
  RotateCcw,
  Target,
  PieChart,
  Award,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  ShoppingBag,
  Check,
  TrendingUp,
  MapPin,
  Flag,
  UserCheck,
  UserPlus as AgencyIcon,
  Zap
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
}

const TRANSLATIONS = {
  en: {
    cockpit: 'Executive Performance Cockpit',
    bi: 'Business Intelligence',
    broadcast: 'Send Daily Report',
    transmitting: 'Transmitting...',
    sent: 'Report Sent',
    monthlyGoal: 'Monthly Goal',
    target: 'Target',
    progress: 'Progress Achievement',
    yield: 'Accumulated Yield',
    dailyRevenue: 'Daily Revenue',
    dailyBurn: 'Operational Burn',
    dailyProfit: 'Daily Net Profit',
    confirmed: 'Confirmed: {count} Sessions',
    fixed: 'Fixed',
    variable: 'Variable',
    margin: 'Margin',
    portfolio: 'Treatment Portfolio',
    salesPartner: 'Daily Sales Snapshot',
    staffSnapshot: 'Daily Staff Snapshot',
    dailySchedule: 'Daily Schedule',
    noBookings: 'No appointments for this snapshot',
    mileage: 'Monthly Goal Mileage',
    commission: 'Comm.',
    payout: 'Payable',
    hrs: 'hrs',
    agencyLabel: 'Agency Partners',
    inHouse: 'In-house',
    agency: 'Agency',
    breakdown: {
      supplies: 'Overhead / Supplies',
      fixedLabor: 'Fixed Salary Labor',
      inHouseLabor: 'In-House Variable Labor',
      agencyLabor: 'Agency Variable Labor',
      partner: 'Partner Commission'
    }
  },
  th: {
    cockpit: 'แผงควบคุมผลการดำเนินงาน',
    bi: 'วิเคราะห์ธุรกิจเชิงลึก',
    broadcast: 'ส่งรายงานสรุปทาง LINE',
    transmitting: 'กำลังประมวลผล...',
    sent: 'ส่งรายงานสำเร็จ',
    monthlyGoal: 'เป้าหมายยอดขายรายเดือน',
    target: 'เป้าหมายหลัก',
    progress: 'ความคืบหน้าตามแผน',
    yield: 'รายได้สะสมรายเดือน',
    dailyRevenue: 'ยอดขายวันนี้',
    dailyBurn: 'ค่าใช้จ่ายการดำเนินงาน',
    dailyProfit: 'กำไรสุทธิวันนี้',
    confirmed: 'ยืนยันแล้ว: {count} เซสชัน',
    fixed: 'ต้นทุนคงที่',
    variable: 'ต้นทุนแปรผัน',
    margin: 'อัตรากำไรสุทธิ',
    portfolio: 'สัดส่วนทรีทเมนท์',
    salesPartner: 'สรุปยอดพาร์ทเนอร์วันนี้',
    staffSnapshot: 'สรุปผลงานพนักงานวันนี้',
    dailySchedule: 'ตารางนัดหมายวันนี้',
    noBookings: 'ไม่มีรายการจองในวันที่เลือก',
    mileage: 'ความคืบหน้าเป้าหมายรายเดือน',
    commission: 'ค่าคอมฯ',
    payout: 'ค่าแรงสุทธิ',
    hrs: 'ชม.',
    agencyLabel: 'พนักงานภายนอก (Agency)',
    inHouse: 'ประจำ',
    agency: 'สำรอง',
    breakdown: {
      supplies: 'ต้นทุนผลิตภัณฑ์ / วัสดุ',
      fixedLabor: 'เงินเดือนพนักงานประจำ (ฐาน)',
      inHouseLabor: 'ค่ามือพนักงานประจำ (รายชั่วโมง)',
      agencyLabor: 'ค่าจ้างพนักงานสำรอง',
      partner: 'ค่าคอมมิชชันพาร์ทเนอร์'
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
  onGoalUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [broadcastState, setBroadcastState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const currentMonthKey = selectedDate.substring(0, 7);

  const getService = (id: string) => services.find(s => s.id === id);
  const getStaff = (id: string) => staff.find(s => s.id === id);
  const getSalesperson = (id: string) => salespersons.find(s => s.id === id);

  const stats = useMemo(() => {
    const monthlyRelevantBookings = bookings.filter(b => 
      b.date.startsWith(currentMonthKey) && 
      (b.payment_status === 'Paid' || b.payment_status === 'Pending')
    );
    const monthlyRevenue = monthlyRelevantBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const progressPercentage = Math.min((monthlyRevenue / (monthlyRevenueGoal || 1)) * 100, 100);

    const dayBookings = bookings
      .filter(b => b.date === selectedDate)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
      
    const activeDayBookings = dayBookings.filter(b => b.payment_status === 'Paid' || b.payment_status === 'Pending');
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
        const staffMember = staff.find(s => s.id === booking.staff_id);
        const isAgency = (booking.staff_id === 'OUTSOURCE' || staffMember?.is_outsource);
        if (isAgency) dailyAgencyVariableLabor += (service.duration / 60) * outsourceHourlyRate;
        else dailyInHouseVariableLabor += (service.duration / 60) * inHouseHourlyRate;
        dailyCommissionCost += (booking.sales_commission || 0);
      }
    });

    const dailyTotalExpense = dailyFixedLabor + dailySuppliesCost + dailyInHouseVariableLabor + dailyAgencyVariableLabor + dailyCommissionCost;
    const dailySalesPartners = salespersons.map(s => {
      const sDayBookings = activeDayBookings.filter(b => b.salesperson_id === s.id);
      const rev = sDayBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      const comm = sDayBookings.reduce((sum, b) => sum + (b.sales_commission || 0), 0);
      return { name: s.name, revenue: rev, commission: comm, count: sDayBookings.length };
    }).filter(s => s.count > 0).sort((a, b) => b.revenue - a.revenue);

    const inHouseStats = staff.filter(s => !s.is_outsource).map(s => {
      const sDayBookings = activeDayBookings.filter(b => b.staff_id === s.id);
      const hours = sDayBookings.reduce((sum, b) => sum + (getService(b.service_id)?.duration / 60 || 0), 0);
      const payout = sDayBookings.reduce((sum, b) => sum + (getService(b.service_id)?.duration / 60 * inHouseHourlyRate || 0), 0);
      return { id: s.id, name: s.name, hours, payout, count: sDayBookings.length, color: s.color_code, isAgency: false };
    }).filter(s => s.count > 0);

    const agencyBookings = activeDayBookings.filter(b => b.staff_id === 'OUTSOURCE' || staff.find(st => st.id === b.staff_id)?.is_outsource);
    if (agencyBookings.length > 0) {
      const hours = agencyBookings.reduce((sum, b) => sum + (getService(b.service_id)?.duration / 60 || 0), 0);
      const payout = agencyBookings.reduce((sum, b) => sum + (getService(b.service_id)?.duration / 60 * outsourceHourlyRate || 0), 0);
      inHouseStats.push({ id: 'agency-total', name: t.agencyLabel, hours, payout, count: agencyBookings.length, color: '#333333', isAgency: true });
    }

    const dailyProfit = dailyRevenue - dailyTotalExpense;
    const margin = dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : 0;

    return {
      dailyRevenue, dailyProfit, dailyTotalExpense, dailySuppliesCost, dailyFixedLabor,
      dailyInHouseVariableLabor, dailyAgencyVariableLabor, dailyCommissionCost, dailyMargin: margin,
      monthlyRevenue, progressPercentage, bookingCount: activeDayBookings.length,
      dailySalesPartners, dailyStaffStats: inHouseStats.sort((a, b) => b.payout - a.payout),
      dayBookings
    };
  }, [selectedDate, bookings, services, staff, salespersons, inHouseHourlyRate, outsourceHourlyRate, monthlyRevenueGoal, currentMonthKey, t.agencyLabel]);

  const sendLineReport = async () => {
    setBroadcastState('loading');
    
    // Generate actual report text based on current stats
    let reportText = `
${language === 'en' ? '🌿 YAREY SPA PERFORMANCE' : '🌿 ยาเรย์ สปา สรุปรายงาน'}
📅 ${selectedDate}

💰 ${t.dailyRevenue}: ฿${stats.dailyRevenue.toLocaleString()}
🔥 ${t.dailyBurn}: ฿${stats.dailyTotalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
💎 ${t.dailyProfit}: ฿${stats.dailyProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} (${stats.dailyMargin.toFixed(1)}%)

👥 ${t.confirmed.replace('{count}', stats.bookingCount.toString())}

--- ${language === 'en' ? 'STAFF PERFORMANCE' : 'สรุปผลงานพนักงาน'} ---
`.trim();

    stats.dailyStaffStats.forEach(s => {
      reportText += `\n👤 ${s.name}: ${s.hours.toFixed(1)} ${t.hrs} (฿${s.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })})`;
    });

    reportText += `\n\n--- ${language === 'en' ? 'SALES PARTNERS' : 'สรุปยอดพาร์ทเนอร์'} ---`;
    
    stats.dailySalesPartners.forEach(p => {
      reportText += `\n🤝 ${p.name}: ฿${p.revenue.toLocaleString()} / ฿${p.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${t.commission}`;
    });

    reportText += `\n\n--- ${language === 'en' ? 'MONTHLY PROGRESS' : 'ความคืบหน้ารายเดือน'} ---
🎯 ${t.target}: ฿${monthlyRevenueGoal.toLocaleString()}
📈 ${t.yield}: ฿${stats.monthlyRevenue.toLocaleString()} (${stats.progressPercentage.toFixed(1)}%)
    `.trim();

    try {
      const response = await fetch(LINE_BRIDGE_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText }) 
      });
      if (response.ok) { 
        setBroadcastState('success'); 
        setTimeout(() => setBroadcastState('idle'), 3000); 
      } else {
        throw new Error('Broadcast Failed');
      }
    } catch (e) { 
      setBroadcastState('idle'); 
      console.error("LINE Broadcast Error:", e);
    }
  };

  const openBookingDetail = (b: Booking) => {
    setSelectedDetailBooking(b);
    setIsDetailModalOpen(true);
  };

  const isProfitable = stats.dailyProfit > 0;
  const hasAgency = stats.dailyStaffStats.some(s => s.isAgency);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-cream/30 overflow-y-auto scrollbar-hide safe-area-pb">
      {/* Dynamic Floating Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 shrink-0 relative z-20">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.4em] mb-1">
            <Activity size={12} className="animate-pulse" /> {t.cockpit}
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-charcoal font-semibold">{t.bi}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <button 
            onClick={sendLineReport} 
            disabled={broadcastState !== 'idle'}
            className={`h-12 px-8 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]
              ${broadcastState === 'success' ? 'bg-green-600 text-white' : 'bg-charcoal hover:bg-black text-white'}`}
          >
            {broadcastState === 'loading' ? <Loader2 size={16} className="animate-spin" /> : broadcastState === 'success' ? <Check size={16} /> : <Zap size={16} className="text-sage" />}
            {broadcastState === 'loading' ? t.transmitting : broadcastState === 'success' ? t.sent : t.broadcast}
          </button>

          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-sage/10 shadow-xl">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2.5 hover:bg-sage/5 rounded-xl text-sage transition-colors"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2 px-2 border-x border-sage/5">
              <CalendarIcon size={16} className="text-sage" />
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-bold text-xs text-charcoal outline-none cursor-pointer" />
            </div>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split('T')[0]); }} className="p-2.5 hover:bg-sage/5 rounded-xl text-sage transition-colors"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Monthly Mileage - Fluid Aesthetic */}
      <div className="bg-gradient-to-br from-white to-cream p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5 mb-8 shrink-0 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sage/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-sage/10" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex items-center gap-5 w-full lg:w-auto shrink-0">
              <div className="p-4 bg-sage text-white rounded-[1.5rem] shadow-xl shadow-sage/20"><Flag size={28} /></div>
              <div>
                <h3 className={`text-xl font-serif text-charcoal font-semibold ${language === 'th' ? 'leading-relaxed' : ''}`}>{t.mileage}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-serif font-bold text-sage">฿{stats.monthlyRevenue.toLocaleString()}</span>
                  <span className="text-[10px] text-sage/40 font-bold uppercase tracking-widest">Accrued</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex justify-between items-end text-[10px] font-bold text-sage uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Zap size={10} /> Performance Progress</span>
                <span className="text-lg font-serif font-bold text-charcoal">{stats.progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 bg-cream/80 rounded-full overflow-hidden p-0.5 border border-sage/5 shadow-inner">
                <div 
                  className="h-full rounded-full transition-all duration-[1.5s] ease-out bg-gradient-to-r from-sage/40 via-sage to-sage-dark animate-shimmer" 
                  style={{ width: `${stats.progressPercentage}%`, backgroundSize: '200% 100%' }} 
                />
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-sage/10 w-full lg:w-auto shadow-sm">
                <span className="text-[10px] font-bold text-sage/60 uppercase tracking-widest">Target:</span>
                <span className="text-xs font-bold text-sage">฿</span>
                <input type="number" value={monthlyRevenueGoal} onChange={(e) => onGoalUpdate(Number(e.target.value))} className="bg-transparent w-28 text-base font-serif font-bold text-charcoal outline-none text-right" />
            </div>
        </div>
      </div>

      {/* Snapshot Cards - Enhanced Depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5 group hover:shadow-sage/10 transition-all">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold mb-4">{t.dailyRevenue}</p>
          <div className="text-4xl md:text-5xl font-serif font-bold text-charcoal">฿{stats.dailyRevenue.toLocaleString()}</div>
          <div className="mt-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-bold text-sage-dark uppercase tracking-widest">{t.confirmed.replace('{count}', stats.bookingCount.toString())}</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold mb-4">{t.dailyBurn}</p>
          <div className="text-4xl md:text-5xl font-serif font-bold text-charcoal">฿{stats.dailyTotalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="mt-8 space-y-3 pt-6 border-t border-sage/5">
            {[
              { label: t.breakdown.supplies, val: stats.dailySuppliesCost },
              { label: t.breakdown.fixedLabor, val: stats.dailyFixedLabor },
              { label: t.breakdown.inHouseLabor, val: stats.dailyInHouseVariableLabor },
              { label: t.breakdown.agencyLabor, val: stats.dailyAgencyVariableLabor },
              { label: t.breakdown.partner, val: stats.dailyCommissionCost }
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center group/item">
                <span className="text-[9px] font-bold text-sage/40 uppercase tracking-widest group-hover/item:text-sage transition-colors">{item.label}</span>
                <span className="text-xs font-bold text-charcoal">฿{item.val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border shadow-2xl transition-all ${isProfitable ? 'bg-green-50/50 border-green-100 shadow-green-500/5' : 'bg-red-50/50 border-red-100 shadow-red-500/5'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-4 ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>{t.dailyProfit}</p>
          <div className={`text-4xl md:text-5xl font-serif font-bold ${isProfitable ? 'text-green-800' : 'text-red-800'}`}>฿{Math.abs(stats.dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className={`mt-8 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase text-white w-fit shadow-lg shadow-sage/20 ${isProfitable ? 'bg-green-600' : 'bg-red-600'}`}>
            {t.margin}: {stats.dailyMargin.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24 md:mb-8 shrink-0">
        {/* Daily Staff - Premium Rows with Aggregated Header Totals */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5 h-[28rem] flex flex-col">
          <div className="flex items-start justify-between mb-8">
            <h4 className="font-serif text-2xl font-semibold flex items-center gap-3">
              <UserCheck size={20} className="text-sage" /> {t.staffSnapshot}
            </h4>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[9px] font-bold text-sage uppercase tracking-widest">{t.inHouse}</p>
                <p className="text-base font-bold text-charcoal">฿{stats.dailyInHouseVariableLabor.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              {hasAgency && (
                <div className="text-right border-l border-sage/10 pl-4">
                  <p className="text-[9px] font-bold text-charcoal/30 uppercase tracking-widest">{t.agency}</p>
                  <p className="text-base font-bold text-charcoal">฿{stats.dailyAgencyVariableLabor.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide flex-1">
            {stats.dailyStaffStats.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-cream/40 rounded-[1.5rem] border border-sage/5 hover:border-sage/20 transition-all group/s">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-bold shadow-lg" style={{ backgroundColor: s.color }}>
                      {s.isAgency ? <AgencyIcon size={16} /> : s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal group-hover/s:text-sage transition-colors">{s.name}</p>
                      <p className="text-[9px] text-sage/40 font-bold uppercase tracking-widest">{s.hours.toFixed(1)} {t.hrs}</p>
                    </div>
                </div>
                <div className="text-right">
                   <p className="text-base font-serif font-bold text-sage">฿{s.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Sales Partner */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5 h-[28rem] flex flex-col">
          <h4 className="font-serif text-2xl font-semibold mb-8 flex items-center gap-3"><ShoppingBag size={20} className="text-sage" /> {t.salesPartner}</h4>
          <div className="space-y-4 overflow-y-auto pr-2 scrollbar-hide flex-1">
            {stats.dailySalesPartners.map(p => (
              <div key={p.name} className="p-4 bg-cream/40 rounded-[1.5rem] border border-sage/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-charcoal">{p.name}</p>
                    <span className="text-[10px] font-bold text-sage">฿{p.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-bold text-sage/40 uppercase tracking-widest">
                    <span>{p.count} sessions</span>
                    <span>{t.commission}: ฿{p.commission.toLocaleString()}</span>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Schedule Summary */}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-2xl shadow-sage/5 h-[28rem] flex flex-col">
          <h4 className="font-serif text-2xl font-semibold mb-8 flex items-center gap-3"><Clock size={20} className="text-sage" /> {t.dailySchedule}</h4>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-4">
            {stats.dayBookings.map((b) => {
              const isPaid = b.payment_status === 'Paid';
              return (
                <div key={b.id} onClick={() => openBookingDetail(b)} className="flex items-center justify-between p-4 bg-cream/40 rounded-[1.5rem] border border-sage/5 hover:bg-white cursor-pointer transition-all shadow-sm hover:shadow-lg active:scale-[0.98]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-sage">{b.start_time}</span>
                      <span className="text-xs font-bold text-charcoal truncate max-w-[120px]">{b.guest_name}</span>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-xl ${isPaid ? 'text-green-500 bg-green-50' : 'text-orange-400 bg-orange-50'}`}>
                    {isPaid ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BookingDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedDetailBooking}
        service={selectedDetailBooking ? getService(selectedDetailBooking.service_id) || null : null}
        staffMember={selectedDetailBooking ? getStaff(selectedDetailBooking.staff_id) || null : null}
        salesperson={selectedDetailBooking ? getSalesperson(selectedDetailBooking.salesperson_id || '') || null : null}
        inHouseHourlyRate={inHouseHourlyRate}
        outsourceHourlyRate={outsourceHourlyRate}
        language={language}
      />
    </div>
  );
};

export default BusinessHealthTab;
