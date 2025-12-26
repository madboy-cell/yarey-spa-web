
import React, { useState, useMemo } from 'react';
import { Booking, Service, Staff, ServiceCost, Category } from '../types';
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
  BarChart3,
  Info
} from 'lucide-react';

interface BusinessHealthTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  serviceCosts: ServiceCost[];
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
    broadcast: 'Broadcast to LINE',
    sending: 'Sending Briefing...',
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
    leaderboard: 'Staff Leaderboard',
    origin: 'Origin Share',
    summary: 'Intelligence Summary'
  },
  th: {
    cockpit: 'แดชบอร์ดสรุปผลการดำเนินงาน',
    bi: 'ข้อมูลเชิงลึกทางธุรกิจ',
    broadcast: 'ส่งรายงานเข้า LINE',
    sending: 'กำลังส่ง...',
    monthlyGoal: 'เป้าหมายรายเดือน',
    target: 'เป้าหมาย',
    progress: 'ความสำเร็จตามแผน',
    yield: 'รายได้สะสม',
    dailyRevenue: 'รายได้ต่อวัน',
    dailyBurn: 'ค่าใช้จ่ายการดำเนินงาน',
    dailyProfit: 'กำไรสุทธิรายวัน',
    confirmed: 'ยืนยันแล้ว: {count} รายการ',
    fixed: 'คงที่',
    variable: 'แปรผัน',
    margin: 'ส่วนต่างกำไร',
    portfolio: 'สัดส่วนทรีทเมนท์',
    leaderboard: 'ผลงานพนักงาน',
    origin: 'ช่องทางการจอง',
    summary: 'สรุปการวิเคราะห์เชิงกลยุทธ์'
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
  serviceCosts,
  inHouseHourlyRate,
  outsourceHourlyRate,
  monthlyRevenueGoal,
  language,
  onGoalUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState(getLocalToday());
  const [isSending, setIsSending] = useState(false);

  const t = TRANSLATIONS[language];

  const getService = (id: string) => services.find(s => s.id === id);

  const stats = useMemo(() => {
    const currentMonthKey = selectedDate.substring(0, 7); 
    const monthlyRelevantBookings = bookings.filter(b => 
      b.date.startsWith(currentMonthKey) && 
      (b.payment_status === 'Paid' || b.payment_status === 'Pending')
    );
    
    const monthlyRevenue = monthlyRelevantBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const progressPercentage = Math.min((monthlyRevenue / monthlyRevenueGoal) * 100, 100);

    const categories: Category[] = ['Massage', 'Facial', 'Body Wrap', 'Scrub', 'Signature Package'];
    const categoryPerformance = categories.map(cat => {
      const catBookings = monthlyRelevantBookings.filter(b => getService(b.service_id)?.category === cat);
      const revenue = catBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      return { name: cat, revenue, count: catBookings.length };
    }).sort((a, b) => b.revenue - a.revenue);

    const staffLeaderboard = staff.map(st => {
      const staffBookings = monthlyRelevantBookings.filter(b => b.staff_id === st.id);
      const revenue = staffBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      return { ...st, revenue, count: staffBookings.length };
    }).sort((a, b) => b.revenue - a.revenue);

    const dayBookings = bookings.filter(b => b.date === selectedDate);
    const activeDayBookings = dayBookings.filter(b => b.payment_status === 'Paid' || b.payment_status === 'Pending');
    const dailyRevenue = activeDayBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const dailyFixedLabor = staff.filter(s => !s.is_outsource).reduce((sum, s) => sum + (s.base_salary || 0), 0) / 30;

    let totalVariableCost = 0;
    activeDayBookings.forEach(booking => {
      const service = getService(booking.service_id);
      const costConfig = serviceCosts.find(sc => sc.serviceId === booking.service_id);
      if (service) {
        totalVariableCost += costConfig?.cogs || 0;
        const isOutsource = booking.staff_id === 'OUTSOURCE';
        const rate = isOutsource ? outsourceHourlyRate : inHouseHourlyRate;
        totalVariableCost += (service.duration / 60) * rate;
      }
    });

    const dailyProfit = dailyRevenue - (dailyFixedLabor + totalVariableCost);

    return {
      dailyRevenue,
      dailyProfit,
      dailyFixedLabor,
      dailyVariableCost: totalVariableCost,
      dailyTotalExpense: dailyFixedLabor + totalVariableCost,
      dailyMargin: dailyRevenue > 0 ? (dailyProfit / dailyRevenue) * 100 : -100,
      monthlyRevenue,
      progressPercentage,
      monthName: new Date(selectedDate).toLocaleString(language === 'en' ? 'default' : 'th-TH', { month: 'long' }),
      categoryPerformance,
      staffLeaderboard,
      bookingCount: activeDayBookings.length,
    };
  }, [selectedDate, bookings, services, staff, serviceCosts, inHouseHourlyRate, outsourceHourlyRate, monthlyRevenueGoal, language]);

  const generateProgressBar = (percent: number) => {
    const totalBlocks = 10;
    const filledBlocks = Math.round(percent / 10);
    return '▓'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);
  };

  const sendLineReport = async () => {
    setIsSending(true);
    try {
      const formattedDate = new Date(selectedDate).toLocaleDateString(language === 'en' ? 'en-GB' : 'th-TH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const topStaff = stats.staffLeaderboard.length > 0 && stats.staffLeaderboard[0].revenue > 0 ? stats.staffLeaderboard[0] : null;
      const progressBar = generateProgressBar(stats.progressPercentage);
      const reportText = language === 'en' ? 
`🌿 *Yarey Spa Executive Briefing*
📅 ${formattedDate}
📊 *DAILY PERFORMANCE*
💰 Revenue: ฿${stats.dailyRevenue.toLocaleString()}
🔥 Burn: ฿${stats.dailyTotalExpense.toFixed(0)}
✨ *Net Profit: ฿${stats.dailyProfit.toFixed(0)}* ${stats.dailyProfit > 0 ? '📈' : '📉'}
📈 *MONTHLY MILESTONE*
🎯 Goal: ${stats.progressPercentage.toFixed(1)}%
[${progressBar}]
💰 Total: ฿${stats.monthlyRevenue.toLocaleString()} / ฿${monthlyRevenueGoal.toLocaleString()}`
: 
`🌿 *สรุปผลการดำเนินงาน ยาเรย์ สปา*
📅 ${formattedDate}
📊 *ผลประกอบการรายวัน*
💰 รายได้: ฿${stats.dailyRevenue.toLocaleString()}
🔥 ค่าใช้จ่าย: ฿${stats.dailyTotalExpense.toFixed(0)}
✨ *กำไรสุทธิ: ฿${stats.dailyProfit.toFixed(0)}* ${stats.dailyProfit > 0 ? '📈' : '📉'}
📈 *ความคืบหน้าเป้าหมายเดือนนี้*
🎯 สำเร็จแล้ว: ${stats.progressPercentage.toFixed(1)}%
[${progressBar}]
💰 รวมสะสม: ฿${stats.monthlyRevenue.toLocaleString()} / ฿${monthlyRevenueGoal.toLocaleString()}`;

      const response = await fetch(LINE_BRIDGE_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText }) 
      });
      if (!response.ok) throw new Error('Network response was not ok');
      alert(language === 'en' ? '✅ Executive Briefing Sent!' : '✅ ส่งรายงานสรุปผลเรียบร้อยแล้ว!');
    } catch (e) { 
      console.error(e);
      alert(language === 'en' ? '❌ Failed to send briefing.' : '❌ ไม่สามารถส่งรายงานได้'); 
    } finally { setIsSending(false); }
  };

  const isProfitable = stats.dailyProfit > 0;

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-y-auto scrollbar-hide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <Activity size={12} /> {t.cockpit}
          </div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">{t.bi}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={sendLineReport} disabled={isSending} className={`px-6 py-3.5 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg transition-all ${isSending ? 'bg-sage/50 cursor-not-allowed' : 'bg-sage hover:bg-sage-dark'} text-white`}>
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isSending ? t.sending : t.broadcast}
          </button>
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-sage/10 shadow-sm">
            <CalendarIcon size={18} className="ml-2 text-sage" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent font-bold text-sm text-charcoal p-2 cursor-pointer outline-none" />
            <button onClick={() => setSelectedDate(getLocalToday())} className="bg-sage/5 p-2 rounded-xl text-sage"><RotateCcw size={14} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-xl mb-8 relative overflow-hidden shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-sage/10 rounded-xl text-sage"><Target size={20} /></div>
              <div>
                <h3 className="text-xl font-serif text-charcoal font-semibold">{t.monthlyGoal} — {stats.monthName}</h3>
                <div className="flex items-center gap-2 text-[10px] text-sage font-bold uppercase tracking-widest">
                  <span>{t.target}: ฿</span>
                  <input 
                    type="number" 
                    value={monthlyRevenueGoal} 
                    onChange={(e) => onGoalUpdate(Number(e.target.value))} 
                    className="bg-sage/5 border-b border-sage/20 focus:border-sage outline-none px-1 w-28 text-[11px] font-bold text-charcoal py-1 rounded transition-colors" 
                  />
                  <span className="text-[9px] text-sage-dark/40 italic">(Auto-saves)</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-[11px] font-bold text-charcoal uppercase tracking-widest">{t.progress}</span>
                <span className={`text-sm font-bold ${stats.progressPercentage > 80 ? 'text-green-600' : 'text-sage'}`}>{stats.progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div className={`h-full rounded-full transition-all duration-1000 ${stats.progressPercentage > 80 ? 'bg-green-500' : 'bg-sage'}`} style={{ width: `${stats.progressPercentage}%` }} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase font-bold text-sage/60 mb-1">{t.yield}</p>
            <div className="flex items-baseline justify-end gap-1 font-serif font-bold text-charcoal">
               <span className="text-3xl">฿{stats.monthlyRevenue.toLocaleString()}</span>
               <span className="text-xs text-sage/40">/ ฿{monthlyRevenueGoal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold mb-2">{t.dailyRevenue}</p>
          <div className="text-4xl font-serif font-bold text-charcoal">฿{stats.dailyRevenue.toLocaleString()}</div>
          <p className="mt-4 text-[9px] font-bold text-sage-dark uppercase tracking-widest">{t.confirmed.replace('{count}', stats.bookingCount.toString())}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage font-bold mb-2">{t.dailyBurn}</p>
          <div className="text-4xl font-serif font-bold text-charcoal">฿{stats.dailyTotalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <p className="mt-4 text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">{t.fixed}: ฿{stats.dailyFixedLabor.toFixed(0)} | {t.variable}: ฿{stats.dailyVariableCost.toFixed(0)}</p>
        </div>
        <div className={`p-8 rounded-[2.5rem] border shadow-xl ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mb-2 ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>{t.dailyProfit}</p>
          <div className={`text-4xl font-serif font-bold ${isProfitable ? 'text-green-800' : 'text-red-800'}`}>฿{Math.abs(stats.dailyProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className={`mt-4 px-3 py-1 rounded-full text-[9px] font-bold uppercase text-white w-fit ${isProfitable ? 'bg-green-600' : 'bg-red-600'}`}>{t.margin}: {stats.dailyMargin.toFixed(1)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 shrink-0">
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg h-80 overflow-hidden flex flex-col">
          <h4 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2"><PieChart size={18} /> {t.portfolio}</h4>
          <div className="space-y-4 overflow-y-auto pr-2">
            {stats.categoryPerformance.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase"><span className="text-charcoal">{cat.name}</span><span className="text-sage">฿{cat.revenue.toLocaleString()}</span></div>
                <div className="h-1.5 w-full bg-cream rounded-full border border-sage/5 overflow-hidden"><div className="h-full bg-sage" style={{ width: `${(cat.revenue / (stats.monthlyRevenue || 1)) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg h-80 overflow-hidden flex flex-col">
          <h4 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2"><Award size={18} /> {t.leaderboard}</h4>
          <div className="space-y-3 overflow-y-auto pr-2">
            {stats.staffLeaderboard.slice(0, 5).map(member => (
              <div key={member.id} className="flex items-center justify-between p-2.5 bg-cream/50 rounded-2xl border border-sage/5">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-[10px]" style={{ backgroundColor: member.color_code }}>{member.name.charAt(0)}</div><p className="text-xs font-bold text-charcoal">{member.name}</p></div>
                <p className="text-xs font-bold text-charcoal">฿{member.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg h-80 flex flex-col justify-center">
          <h4 className="font-serif text-xl font-semibold mb-6 flex items-center gap-2"><BarChart3 size={18} /> {t.origin}</h4>
          <div className="text-center p-6 bg-sage/5 rounded-3xl border border-dashed border-sage/20 italic text-xs text-sage">{language === 'en' ? 'Data sync from origin channels active' : 'กำลังซิงค์ข้อมูลจากช่องทางจอง...'}</div>
        </div>
      </div>

      <div className="p-6 bg-sage/5 rounded-[2rem] border border-sage/10 flex items-center gap-6 shrink-0 mb-4">
        <div className="p-3 bg-white rounded-2xl text-sage shadow-sm"><Info size={24} /></div>
        <div><h5 className="text-[11px] font-bold text-charcoal uppercase tracking-widest mb-1">{t.summary}</h5><p className="text-xs text-sage leading-relaxed">{language === 'en' ? 'Performance includes potential revenue from pending sessions.' : 'การวิเคราะห์ผลการดำเนินงานรวมรายได้ที่คาดหวังจากรายการที่รอชำระเงินแล้ว'}</p></div>
      </div>
    </div>
  );
};

export default BusinessHealthTab;
