
import React, { useMemo, useState, useEffect } from 'react';
import { Booking, Service, Staff, Category } from '../types';
import { 
  TrendingUp, Users, Target, ArrowUpRight, 
  Award, Briefcase, MousePointer2, Phone, 
  Footprints, Zap, CheckCircle2, Flame,
  DollarSign, BarChart3, Calendar, ChevronDown,
  ArrowDownRight, History, PieChart, Info,
  Activity
} from 'lucide-react';

interface AnalyticsTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  monthlyRevenueGoal: number;
  onGoalUpdate: (newGoal: number) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ bookings, services, staff, monthlyRevenueGoal, onGoalUpdate }) => {
  // --- DYNAMIC ROLLING CYCLE GENERATION ---
  const dynamicCycles = useMemo(() => {
    const monthsSet = new Set<string>();
    const now = new Date();
    
    // 1. Add rolling 12 months starting from now
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(id);
    }
    
    // 2. Ensure all months from existing bookings are also included
    bookings.forEach(b => {
      if (b.date) {
        monthsSet.add(b.date.substring(0, 7));
      }
    });

    // 3. Format and Sort (Descending)
    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a))
      .map(id => {
        const [year, month] = id.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1);
        const label = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
        return { id, label };
      });
  }, [bookings]);

  const [selectedCycleId, setSelectedCycleId] = useState(dynamicCycles[0].id);
  
  useEffect(() => {
    if (!dynamicCycles.find(c => c.id === selectedCycleId)) {
      setSelectedCycleId(dynamicCycles[0].id);
    }
  }, [dynamicCycles, selectedCycleId]);

  const selectedCycle = dynamicCycles.find(c => c.id === selectedCycleId) || dynamicCycles[0];
  const getService = (id: string) => services.find(s => s.id === id);

  // --- FILTERED DATA SET ---
  const currentPeriodBookings = useMemo(() => {
    return bookings.filter(b => b.date.startsWith(selectedCycleId));
  }, [bookings, selectedCycleId]);

  const hasData = currentPeriodBookings.length > 0;

  // --- KPI CALCULATIONS ---
  const stats = useMemo(() => {
    const rawRevenue = currentPeriodBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    const totalBookings = currentPeriodBookings.length;
    const avgTicket = totalBookings > 0 ? rawRevenue / totalBookings : 0;
    const achievement = (rawRevenue / monthlyRevenueGoal) * 100;
    const isGoalMet = rawRevenue >= monthlyRevenueGoal;
    
    return { totalRevenue: rawRevenue, totalBookings, avgTicket, achievement, isGoalMet };
  }, [currentPeriodBookings, services, monthlyRevenueGoal]);

  const categoryPerformance = useMemo(() => {
    const categories: Category[] = ['Massage', 'Facial', 'Body Wrap', 'Scrub', 'Signature Package'];
    return categories.map(cat => {
      const catBookings = currentPeriodBookings.filter(b => getService(b.service_id)?.category === cat);
      const revenue = catBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      return { name: cat, revenue, count: catBookings.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [currentPeriodBookings, services]);

  const channelSales = useMemo(() => {
    const channels: ('Walk-in' | 'Online' | 'Phone')[] = ['Walk-in', 'Online', 'Phone'];
    return channels.map(name => {
      const filtered = currentPeriodBookings.filter(b => b.channel === name);
      const revenue = filtered.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      const icons: Record<string, any> = {
        'Walk-in': <Footprints size={16} />,
        'Online': <MousePointer2 size={16} />,
        'Phone': <Phone size={16} />
      };
      return { name, revenue, icon: icons[name] };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [currentPeriodBookings, services]);

  const leaderBoard = useMemo(() => {
    return staff.map(st => {
      const staffBookings = currentPeriodBookings.filter(b => b.staff_id === st.id);
      const revenue = staffBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      return { ...st, revenue, count: staffBookings.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [currentPeriodBookings, staff, services]);

  const isCurrentMonth = selectedCycleId === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-auto scrollbar-hide">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <TrendingUp size={12} /> Yield Optimization
          </div>
          <h2 className="text-4xl font-serif text-charcoal font-semibold">Sales Cockpit</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white px-6 py-2 rounded-2xl border border-sage/10 shadow-sm flex flex-col justify-center">
            <label className="text-[9px] uppercase font-bold text-sage/60 tracking-widest">Target Revenue</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal">฿</span>
              <input 
                type="number"
                value={monthlyRevenueGoal}
                onChange={(e) => onGoalUpdate(Number(e.target.value))}
                className="w-24 bg-transparent text-sm font-bold text-charcoal outline-none border-b border-transparent focus:border-sage"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -top-1 -right-1 z-10 flex">
               {isCurrentMonth && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-sage"></span></span>}
            </div>
            <select 
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="appearance-none bg-white px-6 py-4 pr-12 rounded-2xl border border-sage/10 shadow-sm text-sm font-bold text-charcoal outline-none cursor-pointer hover:border-sage transition-all min-w-[200px]"
            >
              {dynamicCycles.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white/50 rounded-[3rem] border border-dashed border-sage/20 text-center">
          <div className="p-8 bg-cream rounded-full mb-6 shadow-inner border border-sage/5">
            <History size={64} className="text-sage/30" />
          </div>
          <h3 className="text-2xl font-serif text-charcoal font-semibold mb-2">Cycle Horizon: {selectedCycle.label}</h3>
          <p className="text-sage text-sm max-w-xs">There are no realized transactions recorded for this specific temporal cycle yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-sage/10 shadow-xl relative overflow-hidden flex flex-col justify-center">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-serif text-2xl text-charcoal font-semibold">Goal Trajectory</h3>
                  <p className="text-sm text-sage font-medium">Tracking {selectedCycle.label} against benchmark: ฿{monthlyRevenueGoal.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <span className={`text-4xl font-serif font-bold ${stats.isGoalMet ? 'text-green-600' : 'text-sage'}`}>
                    {stats.achievement.toFixed(1)}%
                  </span>
                  <p className={`text-[10px] uppercase font-bold mt-1 ${stats.isGoalMet ? 'text-green-600' : 'text-sage/60'}`}>
                    {stats.isGoalMet ? 'Exceeding' : 'Developing'}
                  </p>
                </div>
              </div>
              
              <div className="relative w-full h-12 bg-cream rounded-2xl border border-sage/10 overflow-hidden shadow-inner p-1.5">
                <div 
                  className={`h-full rounded-xl shadow-lg transition-all duration-1000 relative overflow-hidden ${
                    stats.isGoalMet ? 'bg-green-600' : 'bg-sage'
                  }`}
                  style={{ width: `${Math.min(stats.achievement, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-8">
                <div className="p-4 bg-cream/30 rounded-2xl border border-sage/5">
                  <p className="text-[10px] uppercase font-bold text-sage/60 mb-1">Total Yield</p>
                  <p className="text-xl font-bold text-charcoal">฿{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-cream/30 rounded-2xl border border-sage/5">
                  <p className="text-[10px] uppercase font-bold text-sage/60 mb-1">Volume</p>
                  <p className="text-xl font-bold text-charcoal">{stats.totalBookings} Arrivals</p>
                </div>
                <div className="p-4 bg-cream/30 rounded-2xl border border-sage/5">
                  <p className="text-[10px] uppercase font-bold text-sage/60 mb-1">Ticket Avg</p>
                  <p className="text-xl font-bold text-charcoal">฿{stats.avgTicket.toFixed(0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-charcoal p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage/10 rounded-full -mr-10 -mt-10 blur-3xl" />
              <div className="flex items-center gap-3 mb-6">
                <Activity size={24} className="text-sage-light" />
                {isCurrentMonth && <span className="bg-sage px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-white shadow-lg animate-pulse">Live Reporting</span>}
              </div>
              <h3 className="text-2xl font-serif font-bold mb-4">Cycle Pulse</h3>
              <div className="space-y-5">
                 <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-xs text-white/60 font-medium">Daily Target Rate</span>
                   <span className="text-sm font-bold">฿{(monthlyRevenueGoal / 30).toFixed(0)}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-white/10 pb-3">
                   <span className="text-xs text-white/60 font-medium">Actual Run Rate</span>
                   <span className="text-sm font-bold">฿{(stats.totalRevenue / (isCurrentMonth ? Math.max(1, new Date().getDate()) : 30)).toFixed(0)}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-xs text-white/60 font-medium">Forecast Velocity</span>
                   <div className={`flex items-center gap-1.5 font-bold ${stats.achievement > 40 ? 'text-green-400' : 'text-sage-light'}`}>
                     <ArrowUpRight size={14} />
                     <span className="text-xs uppercase tracking-wider">{stats.achievement > 40 ? 'Accelerating' : 'Standard'}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><PieChart size={20} /></div>
                <h4 className="font-serif text-xl text-charcoal font-semibold">Treatment Mix</h4>
              </div>
              <div className="flex-1 space-y-6">
                {categoryPerformance.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-xs font-bold text-charcoal">{cat.name}</span>
                        <span className="text-[10px] text-sage ml-2">({cat.count})</span>
                      </div>
                      <span className="text-xs font-bold text-charcoal">฿{cat.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden border border-sage/5">
                      <div className="h-full bg-sage transition-all duration-1000" style={{ width: `${(cat.revenue / (stats.totalRevenue || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><Award size={20} /></div>
                <h4 className="font-serif text-xl text-charcoal font-semibold">Top Performers</h4>
              </div>
              <div className="flex-1 space-y-5">
                {leaderBoard.slice(0, 5).map((member, idx) => (
                  <div key={member.id} className="flex items-center justify-between group p-2 hover:bg-cream/50 rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-[11px]" style={{ backgroundColor: member.color_code }}>{member.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{member.name}</p>
                        <p className="text-[9px] text-sage font-bold uppercase tracking-widest">{member.count} Appointments</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-charcoal">฿{member.revenue.toLocaleString()}</p>
                       {idx === 0 && <span className="text-[8px] bg-sage/10 text-sage px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">MVP</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><BarChart3 size={20} /></div>
                <h4 className="font-serif text-xl text-charcoal font-semibold">Origin Insights</h4>
              </div>
              <div className="space-y-8 flex-1 flex flex-col justify-center">
                 {channelSales.map(channel => {
                   const share = (channel.revenue / (stats.totalRevenue || 1)) * 100;
                   return (
                    <div key={channel.name} className="bg-cream/50 p-5 rounded-3xl border border-sage/5">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sage">{channel.icon}</span>
                            <span className="text-[10px] font-bold text-charcoal uppercase tracking-widest">{channel.name}</span>
                          </div>
                          <span className="text-xs font-bold">{share.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 w-full bg-white rounded-full overflow-hidden">
                          <div className="h-full bg-sage transition-all duration-1000" style={{ width: `${share}%` }} />
                        </div>
                    </div>
                   );
                 })}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-sage/5 rounded-[2rem] border border-sage/10 flex items-center gap-6">
            <div className="p-3 bg-white rounded-2xl text-sage shadow-sm"><Info size={24} /></div>
            <div>
              <h5 className="text-[11px] font-bold text-charcoal uppercase tracking-widest mb-1">Temporal Yield Intelligence</h5>
              <p className="text-xs text-sage leading-relaxed">
                Summary for <span className="font-bold text-charcoal">{selectedCycle.label}</span> shows a realized average ticket of <span className="font-bold text-charcoal">฿{stats.avgTicket.toFixed(0)}</span>. 
                {stats.achievement > 75 
                  ? " Performance is trending exceptionally high. Maintain current therapist utilization to secure month-end profitability."
                  : " Opportunity exists to elevate ticket averages through signature package upsells for the remainder of this cycle."
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsTab;
