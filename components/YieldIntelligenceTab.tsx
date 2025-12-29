
import React, { useMemo, useState } from 'react';
import { Booking, Service, Staff, Salesperson } from '../types';
import { Language } from '../App';
import { 
  BarChart3, ChevronDown, Wallet, CreditCard, 
  History, CheckCircle2, Circle, Search, 
  Edit3, Trash2, Users, ShoppingBag, Clock, DollarSign
} from 'lucide-react';

interface YieldIntelligenceTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  salespersons: Salesperson[];
  monthlyRevenueGoal: number;
  onGoalUpdate: (newGoal: number) => void;
  language: Language;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
}

const TRANSLATIONS = {
  en: {
    title: 'Yield Intelligence',
    subtitle: 'Sales Ledger',
    target: 'Goal',
    achievement: 'Goal Progress',
    revenue: 'Accrued Revenue',
    ticket: 'Avg Ticket',
    ledger: 'Transaction Ledger',
    noData: 'No transactions found',
    search: 'Search ledger...',
    staffPerformance: 'Staff Performance',
    partnerPerformance: 'Partner Performance',
    totalHours: 'Total Hours',
    payout: 'Variable Payout',
    commission: 'Commission',
    sales: 'Sales Rev'
  },
  th: {
    title: 'วิเคราะห์รายได้',
    subtitle: 'สรุปผลประกอบการรายวัน',
    target: 'เป้าหมาย',
    achievement: 'ความสำเร็จ',
    revenue: 'รายได้สะสม',
    ticket: 'ยอดเฉลี่ย',
    ledger: 'บันทึกธุรกรรม',
    noData: 'ไม่พบธุรกรรมในรอบนี้',
    search: 'ค้นหา...',
    staffPerformance: 'สรุปผลงานพนักงาน',
    partnerPerformance: 'สรุปยอดพาร์ทเนอร์',
    totalHours: 'ชม. รวม',
    payout: 'ค่ามือสะสม',
    commission: 'ค่าคอมฯ',
    sales: 'ยอดขาย'
  }
};

const YieldIntelligenceTab: React.FC<YieldIntelligenceTabProps> = ({ 
  bookings, services, staff, salespersons, monthlyRevenueGoal, onGoalUpdate, language, onEditBooking, onDeleteBooking, inHouseHourlyRate, outsourceHourlyRate
}) => {
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const isThai = language === 'th';

  const dynamicCycles = useMemo(() => {
    const monthsSet = new Set<string>();
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    bookings.forEach(b => b.date && monthsSet.add(b.date.substring(0, 7)));
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a)).map(id => {
      const [year, month] = id.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1);
      return { id, label: dateObj.toLocaleString(language === 'en' ? 'default' : 'th-TH', { month: 'long', year: 'numeric' }) };
    });
  }, [bookings, language]);

  const [selectedCycleId, setSelectedCycleId] = useState(dynamicCycles[0]?.id || '');

  const getService = (id: string) => services.find(s => s.id === id);

  const periodBookings = useMemo(() => {
    return bookings.filter(b => b.date.startsWith(selectedCycleId));
  }, [bookings, selectedCycleId]);

  const filteredLedger = useMemo(() => {
    if (!searchTerm) return periodBookings;
    return periodBookings.filter(b => 
      b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getService(b.service_id)?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [periodBookings, searchTerm, services]);

  const staffPerformance = useMemo(() => {
    const map = new Map<string, { name: string, hours: number, payout: number, color: string }>();
    
    periodBookings.forEach(b => {
      const s = getService(b.service_id);
      if (!s) return;
      
      const staffMember = staff.find(st => st.id === b.staff_id);
      const isOutsource = b.staff_id === 'OUTSOURCE' || staffMember?.is_outsource === true;
      const rate = isOutsource ? outsourceHourlyRate : inHouseHourlyRate;
      const hours = s.duration / 60;
      const payout = hours * rate;
      
      const id = b.staff_id;
      const existing = map.get(id);
      if (existing) {
        existing.hours += hours;
        existing.payout += payout;
      } else {
        map.set(id, { 
          name: b.staff_id === 'OUTSOURCE' ? (language === 'en' ? 'Agency (On-Call)' : 'สำรอง (Agency)') : (staffMember?.name || 'Unknown'), 
          hours, 
          payout,
          color: staffMember?.color_code || '#666666'
        });
      }
    });
    
    return Array.from(map.values()).sort((a, b) => b.payout - a.payout);
  }, [periodBookings, services, staff, inHouseHourlyRate, outsourceHourlyRate, language]);

  const partnerPerformance = useMemo(() => {
    const map = new Map<string, { name: string, revenue: number, commission: number }>();
    
    periodBookings.forEach(b => {
      const s = getService(b.service_id);
      if (!s) return;
      
      const partner = salespersons.find(p => p.id === b.salesperson_id);
      const revenue = s.price;
      const commission = b.sales_commission || 0;
      
      const id = b.salesperson_id || 'direct';
      const existing = map.get(id);
      if (existing) {
        existing.revenue += revenue;
        existing.commission += commission;
      } else {
        map.set(id, { 
          name: partner?.name || (language === 'en' ? 'Direct/Walk-in' : 'วอล์คอิน/ตรง'), 
          revenue, 
          commission 
        });
      }
    });
    
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [periodBookings, services, salespersons, language]);

  const stats = useMemo(() => {
    const revenue = periodBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const totalCosts = periodBookings.reduce((sum, b) => {
      const s = getService(b.service_id);
      if (!s) return sum;
      const unitCost = s.totalUnitCost || 0;
      const staffMember = staff.find(st => st.id === b.staff_id);
      const isOutsource = b.staff_id === 'OUTSOURCE' || staffMember?.is_outsource === true;
      const laborRate = isOutsource ? outsourceHourlyRate : inHouseHourlyRate;
      const laborCost = (s.duration / 60) * laborRate;
      const commission = b.sales_commission || 0;
      return sum + unitCost + laborCost + commission;
    }, 0);
    const count = periodBookings.length;
    return {
      revenue,
      profit: revenue - totalCosts,
      count,
      achievement: (revenue / (monthlyRevenueGoal || 1)) * 100
    };
  }, [periodBookings, services, staff, monthlyRevenueGoal, inHouseHourlyRate, outsourceHourlyRate]);

  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-cream/30 overflow-y-auto scrollbar-hide pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-6 md:mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <BarChart3 size={12} /> {t.title}
          </div>
          <h2 className={`text-2xl md:text-4xl font-serif text-charcoal font-semibold ${isThai ? 'leading-relaxed' : ''}`}>{t.subtitle}</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="bg-white/70 backdrop-blur-md px-4 py-2 rounded-xl border border-sage/10 shadow-sm flex flex-col min-w-[120px]">
            <label className="text-[8px] uppercase font-bold text-sage/60 tracking-widest">{t.target}</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-charcoal">฿</span>
              <input 
                type="number" value={monthlyRevenueGoal} 
                onChange={(e) => onGoalUpdate(Number(e.target.value))}
                className="w-full bg-transparent text-xs md:text-sm font-bold text-charcoal outline-none transition-all"
              />
            </div>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <select 
              value={selectedCycleId} 
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="appearance-none bg-white/70 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 pr-10 md:pr-12 rounded-xl md:rounded-2xl border border-sage/10 shadow-sm text-xs md:text-sm font-bold text-charcoal outline-none cursor-pointer w-full"
            >
              {dynamicCycles.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
          </div>
        </div>
      </div>

      {!periodBookings.length ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 bg-white/50 rounded-[2rem] md:rounded-[3rem] border border-dashed border-sage/20 text-center">
          <History size={48} className="text-sage/20 mb-4" />
          <h3 className="text-xl md:text-2xl font-serif text-charcoal font-semibold mb-2">{t.noData}</h3>
          <p className="text-sage text-xs">{selectedCycleId}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8 shrink-0">
            <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-sage/10 shadow-lg flex flex-col justify-center">
              <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-sage font-bold mb-1">{t.revenue}</p>
              <div className="text-xl md:text-2xl font-serif font-bold text-charcoal">฿{stats.revenue.toLocaleString()}</div>
            </div>
            <div className="bg-sage/5 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-sage/20 shadow-lg flex flex-col justify-center">
              <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-sage font-bold mb-1">Accrued Profit</p>
              <div className="text-xl md:text-2xl font-serif font-bold text-sage-dark">฿{stats.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            </div>
            <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-sage/10 shadow-lg sm:col-span-2 md:col-span-1 flex flex-col justify-center">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-sage font-bold">{t.achievement}</p>
                <span className="text-sm md:text-lg font-serif font-bold text-sage">{stats.achievement.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 md:h-3 bg-cream rounded-full overflow-hidden p-0.5 border border-sage/5">
                <div className="h-full bg-sage rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.achievement, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 shrink-0">
            {/* Staff Performance Summary */}
            <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-sage/10 shadow-xl flex flex-col h-fit">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-charcoal mb-6 flex items-center gap-2">
                <Users size={20} className="text-sage" /> {t.staffPerformance}
              </h3>
              <div className="space-y-4">
                {staffPerformance.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-4 bg-cream/40 rounded-2xl border border-sage/5 group hover:border-sage/20 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shadow-sm" style={{ backgroundColor: s.color }}>{s.name.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-charcoal">{s.name}</span>
                        <span className="text-[9px] text-sage/40 uppercase tracking-widest font-bold flex items-center gap-1"><Clock size={10} /> {s.hours.toFixed(1)} {t.totalHours}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-sage">฿{s.payout.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <p className="text-[8px] text-sage/30 uppercase tracking-widest font-bold">{t.payout}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Performance Summary */}
            <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-sage/10 shadow-xl flex flex-col h-fit">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-charcoal mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-sage" /> {t.partnerPerformance}
              </h3>
              <div className="space-y-4">
                {partnerPerformance.map(p => (
                  <div key={p.name} className="flex items-center justify-between p-4 bg-cream/40 rounded-2xl border border-sage/5 group hover:border-sage/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-charcoal">{p.name}</span>
                      <span className="text-[9px] text-sage/40 uppercase tracking-widest font-bold flex items-center gap-1"><DollarSign size={10} /> ฿{p.revenue.toLocaleString()} {t.sales}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-serif font-bold text-charcoal">฿{p.commission.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <p className="text-[8px] text-sage/30 uppercase tracking-widest font-bold">{t.commission}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] border border-sage/10 shadow-xl overflow-hidden flex flex-col min-h-0">
            <div className="p-4 md:p-8 border-b border-sage/10 flex flex-col sm:flex-row justify-between items-center gap-3 bg-sage/5">
              <h4 className="font-serif text-xl md:text-2xl font-semibold text-charcoal flex items-center gap-2"><BarChart3 size={18} className="text-sage" /> {t.ledger}</h4>
              <div className="relative w-full sm:w-64 md:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
                <input 
                  type="text" placeholder={t.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-sage/20 rounded-xl py-2 md:py-2.5 pl-9 md:pl-12 pr-4 text-[10px] md:text-xs font-bold outline-none focus:border-sage transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="min-w-[800px] md:min-w-0">
                <table className="w-full text-left">
                  <thead className="bg-white text-sage text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 md:px-10 py-4 md:py-5 border-b border-sage/10 bg-white">Date & Guest</th>
                      <th className="px-6 md:px-10 py-4 md:py-5 border-b border-sage/10 bg-white">Service Details</th>
                      <th className="px-6 md:px-10 py-4 md:py-5 border-b border-sage/10 bg-white">Payment</th>
                      <th className="px-6 md:px-10 py-4 md:py-5 border-b border-sage/10 bg-white text-right">Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/5">
                    {filteredLedger.map(b => {
                      const s = getService(b.service_id);
                      const isPaid = b.payment_status === 'Paid';
                      return (
                        <tr key={b.id} className="hover:bg-cream/50 transition-colors group">
                          <td className="px-6 md:px-10 py-4 md:py-6">
                            <div className="flex flex-col">
                              <span className="text-[8px] md:text-[9px] text-sage font-bold mb-0.5">{b.date}</span>
                              <span className={`text-xs md:text-sm font-bold text-charcoal ${isThai ? 'leading-relaxed' : ''}`}>{b.guest_name}</span>
                            </div>
                          </td>
                          <td className="px-6 md:px-10 py-4 md:py-6">
                            <div className="flex flex-col">
                              <span className={`text-[10px] md:text-xs font-bold text-charcoal/80 ${isThai ? 'leading-relaxed' : ''}`}>{s?.name}</span>
                              <span className="text-[7px] md:text-[9px] text-sage/60 font-bold uppercase tracking-tighter">
                                 Cost: ฿{s?.totalUnitCost}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 md:px-10 py-4 md:py-6">
                            <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-charcoal uppercase tracking-widest">
                              {b.payment_type === 'Cash' ? <Wallet size={12} className="text-sage" /> : <CreditCard size={12} className="text-sage" />}
                              <span className="hidden sm:inline">{b.payment_type}</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[7px] md:text-[8px] ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {isPaid ? (language === 'en' ? 'Paid' : 'แล้ว') : (language === 'en' ? 'Pend' : 'ค้าง')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 md:px-10 py-4 md:py-6 text-right">
                            <div className="flex items-center justify-end gap-3 md:gap-6">
                              <span className="text-xs md:text-sm font-serif font-bold text-charcoal">฿{s?.price.toLocaleString()}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); onEditBooking(b); }} className="p-1.5 text-sage hover:bg-sage/10 rounded-lg transition-colors active:scale-90">
                                  <Edit3 size={14} />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteBooking(b); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors active:scale-90">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default YieldIntelligenceTab;
