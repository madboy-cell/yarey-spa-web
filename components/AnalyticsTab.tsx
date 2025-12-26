
import React, { useMemo, useState } from 'react';
import { Booking, Service, Staff } from '../types';
import { 
  TrendingUp, Users, Target, ArrowUpRight, 
  Award, Briefcase, MousePointer2, Phone, 
  Footprints, Zap, CheckCircle2, Flame,
  DollarSign, BarChart3, Calendar, ChevronDown,
  ArrowDownRight, History
} from 'lucide-react';

interface AnalyticsTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ bookings, services, staff }) => {
  // Global Fixed Monthly Target for the Spa
  const [fixedMonthlyTarget, setFixedMonthlyTarget] = useState(450000);

  // Available cycles for selection (Targets are now globally fixed)
  const CYCLES = [
    { id: '2025-03', label: 'March 2025' },
    { id: '2025-02', label: 'February 2025' },
    { id: '2025-01', label: 'January 2025' },
  ];

  const [selectedCycleId, setSelectedCycleId] = useState(CYCLES[0].id);
  
  const selectedCycle = CYCLES.find(c => c.id === selectedCycleId) || CYCLES[0];

  const getService = (id: string) => services.find(s => s.id === id);

  // Filter bookings for the selected month
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => b.date.startsWith(selectedCycleId));
  }, [bookings, selectedCycleId]);

  // Mock data for previous months if no real bookings exist in the state for them
  const processedBookings = useMemo(() => {
    if (filteredBookings.length > 0) return filteredBookings;
    
    // Fallback mock counts based on cycle to simulate historical data
    const mockCounts: Record<string, number> = {
      '2025-02': 185,
      '2025-01': 160
    };
    const count = mockCounts[selectedCycleId] || 0;
    
    return bookings.slice(0, count > 0 ? Math.min(count, bookings.length) : 10);
  }, [filteredBookings, selectedCycleId, bookings]);

  // --- 1. CORE SALES METRICS ---
  const stats = useMemo(() => {
    const rawRevenue = processedBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
    
    // Manual overrides for demo purposes to show historical goal status
    let finalRevenue = rawRevenue;
    if (selectedCycleId === '2025-02') finalRevenue = 462000; // Over the 450k target
    if (selectedCycleId === '2025-01') finalRevenue = 365000; // Under the 450k target
    
    const totalBookings = processedBookings.length;
    const avgTicket = totalBookings > 0 ? finalRevenue / totalBookings : 0;
    const achievement = (finalRevenue / fixedMonthlyTarget) * 100;
    const isGoalMet = finalRevenue >= fixedMonthlyTarget;
    
    return { totalRevenue: finalRevenue, totalBookings, avgTicket, achievement, isGoalMet };
  }, [processedBookings, services, fixedMonthlyTarget, selectedCycleId]);

  // --- 2. CHANNEL PERFORMANCE ---
  const channelSales = useMemo(() => {
    const channels = ['Walk-in', 'Online', 'Phone', 'Tour Operator'];
    return channels.map(name => {
      const filtered = processedBookings.filter(b => b.channel === name);
      const revenue = filtered.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      const icons: Record<string, any> = {
        'Walk-in': <Footprints size={16} />,
        'Online': <MousePointer2 size={16} />,
        'Phone': <Phone size={16} />,
        'Tour Operator': <Briefcase size={16} />
      };
      return { name, revenue, icon: icons[name] };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [processedBookings, services]);

  // --- 3. THERAPIST LEADERBOARD ---
  const leaderBoard = useMemo(() => {
    return staff.map(st => {
      const staffBookings = processedBookings.filter(b => b.staff_id === st.id);
      const revenue = staffBookings.reduce((sum, b) => sum + (getService(b.service_id)?.price || 0), 0);
      return { ...st, revenue, count: staffBookings.length };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [processedBookings, staff, services]);

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-auto scrollbar-hide">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <TrendingUp size={12} /> Performance Analysis
          </div>
          <h2 className="text-4xl font-serif text-charcoal font-semibold">Sales Cockpit</h2>
        </div>
        
        {/* Fixed Target and Month Selector */}
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-2 rounded-2xl border border-sage/10 shadow-sm flex flex-col justify-center">
            <label className="text-[9px] uppercase font-bold text-sage/60 tracking-widest">Global Monthly Target</label>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-charcoal">฿</span>
              <input 
                type="number"
                value={fixedMonthlyTarget}
                onChange={(e) => setFixedMonthlyTarget(Number(e.target.value))}
                className="w-24 bg-transparent text-sm font-bold text-charcoal outline-none border-b border-transparent focus:border-sage"
              />
            </div>
          </div>

          <div className="relative group">
            <select 
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="appearance-none bg-white px-6 py-4 pr-12 rounded-2xl border border-sage/10 shadow-sm text-sm font-bold text-charcoal outline-none cursor-pointer hover:border-sage/30 transition-all"
            >
              {CYCLES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-sage pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Primary Goal Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-sage/10 shadow-xl relative overflow-hidden flex flex-col justify-center">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-serif text-2xl text-charcoal font-semibold">Revenue Goal Status</h3>
              <p className="text-sm text-sage font-medium">Tracking against standard monthly target: ฿{fixedMonthlyTarget.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                {stats.isGoalMet && <CheckCircle2 size={20} className="text-green-500" />}
                <span className={`text-4xl font-serif font-bold ${stats.isGoalMet ? 'text-green-600' : 'text-sage'}`}>
                  {stats.achievement.toFixed(1)}%
                </span>
              </div>
              <p className={`text-[10px] uppercase font-bold mt-1 ${stats.isGoalMet ? 'text-green-600' : 'text-sage/60'}`}>
                {stats.isGoalMet ? 'Performance Met' : 'Performance Tracking'}
              </p>
            </div>
          </div>
          
          <div className="relative w-full h-12 bg-cream rounded-2xl border border-sage/10 overflow-hidden shadow-inner p-1.5">
            <div 
              className={`h-full rounded-xl shadow-lg transition-all duration-1000 flex items-center justify-end px-4 relative overflow-hidden ${
                stats.isGoalMet ? 'bg-green-600' : 'bg-sage'
              }`}
              style={{ width: `${Math.min(stats.achievement, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              {stats.achievement > 15 && <span className="text-white text-[10px] font-bold z-10">฿{stats.totalRevenue.toLocaleString()}</span>}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-sage/60">Selected Month Revenue</p>
              <p className="text-xl font-bold text-charcoal">฿{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-sage/60">Average Ticket</p>
              <p className="text-xl font-bold text-charcoal">฿{stats.avgTicket.toFixed(0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-sage/60">
                {stats.isGoalMet ? 'Monthly Surplus' : 'Shortfall'}
              </p>
              <p className={`text-xl font-bold ${stats.isGoalMet ? 'text-green-600' : 'text-red-400'}`}>
                ฿{Math.abs(fixedMonthlyTarget - stats.totalRevenue).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Historical Context Card */}
        <div className="bg-charcoal p-10 rounded-[2.5rem] text-white shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-sage/20 rounded-full blur-3xl" />
          <div className="mb-auto">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-sage-light mb-6">
                <History size={24} />
             </div>
             <h3 className="text-2xl font-serif font-bold mb-2">Cycle Benchmarking</h3>
             <div className="space-y-4 mt-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <span className="text-xs text-white/60 font-medium">Standard Target</span>
                  <span className="text-sm font-bold">฿{fixedMonthlyTarget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/60 font-medium">Growth Index</span>
                  <div className="flex items-center gap-1 text-green-400 font-bold">
                    <ArrowUpRight size={14} />
                    <span className="text-sm">12.4%</span>
                  </div>
                </div>
             </div>
          </div>
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
             <p className="text-[10px] text-sage-light leading-relaxed">
               The current fixed target of ฿{fixedMonthlyTarget.toLocaleString()} is consistent across all historical comparisons.
             </p>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Performance Leaderboard */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><Award size={20} /></div>
              <h4 className="font-serif text-xl text-charcoal font-semibold">Top Performers ({selectedCycle.label})</h4>
            </div>
          </div>
          <div className="flex-1 space-y-5">
            {leaderBoard.slice(0, 5).map((member, idx) => (
              <div key={member.id} className="flex items-center gap-4 group">
                <div className="relative">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: member.color_code }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  {idx === 0 && (
                    <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-charcoal w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <Zap size={10} fill="currentColor" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{member.name}</p>
                  <p className="text-[9px] text-sage font-bold uppercase tracking-widest">{member.count} Sessions</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-serif font-bold text-charcoal">฿{member.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><DollarSign size={20} /></div>
            <h4 className="font-serif text-xl text-charcoal font-semibold">Revenue Sources</h4>
          </div>
          <div className="flex-1 space-y-5">
            {channelSales.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between p-3 rounded-2xl border border-sage/5 hover:bg-cream transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cream text-sage rounded-lg group-hover:bg-sage group-hover:text-white transition-all">
                    {channel.icon}
                  </div>
                  <span className="text-xs font-bold text-charcoal uppercase tracking-tighter">{channel.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-serif font-bold text-charcoal">฿{channel.revenue.toLocaleString()}</p>
                  <div className="w-20 h-1 bg-sage/10 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-sage" 
                      style={{ width: `${(channel.revenue / stats.totalRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Patterns */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-lg flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-sage/10 rounded-xl text-sage"><BarChart3 size={20} /></div>
            <h4 className="font-serif text-xl text-charcoal font-semibold">Efficiency Metrics</h4>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="space-y-8">
               <div className="relative pt-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Team Capacity</span>
                    <span className="text-sm font-bold text-charcoal">78%</span>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden border border-sage/5">
                    <div className="h-full bg-sage rounded-full" style={{ width: '78%' }} />
                  </div>
               </div>
               <div className="relative">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Room Utilization</span>
                    <span className="text-sm font-bold text-charcoal">62%</span>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden border border-sage/5">
                    <div className="h-full bg-sage/60 rounded-full" style={{ width: '62%' }} />
                  </div>
               </div>
               <div className="relative pb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-bold text-sage uppercase tracking-widest">Menu Upsell Rate</span>
                    <span className="text-sm font-bold text-charcoal">24%</span>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden border border-sage/5">
                    <div className="h-full bg-charcoal rounded-full" style={{ width: '24%' }} />
                  </div>
               </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-sage/5 flex items-center gap-2 text-[10px] text-sage font-bold uppercase">
             <Target size={12} className="text-green-500" />
             <span>Data based on {selectedCycle.label} performance</span>
          </div>
        </div>
      </div>

      {/* Sales Action Plan */}
      <div className={`p-6 rounded-[2rem] border flex items-center gap-6 transition-all duration-500 ${
        stats.isGoalMet ? 'bg-green-50 border-green-100' : 'bg-sage/5 border-sage/10'
      }`}>
        <div className={`p-4 rounded-2xl shadow-sm ${stats.isGoalMet ? 'bg-green-600 text-white' : 'bg-white text-sage'}`}>
          {stats.isGoalMet ? <CheckCircle2 size={24} /> : <Target size={24} />}
        </div>
        <div className="flex-1">
          <h5 className={`text-xs font-bold uppercase tracking-widest mb-1 ${stats.isGoalMet ? 'text-green-800' : 'text-charcoal'}`}>
            {stats.isGoalMet ? 'Monthly Target Achievement' : 'Growth Strategic Plan'}
          </h5>
          <p className={`text-xs font-medium leading-relaxed ${stats.isGoalMet ? 'text-green-700' : 'text-sage'}`}>
            {stats.isGoalMet 
              ? `The ฿${fixedMonthlyTarget.toLocaleString()} goal was met for ${selectedCycle.label}. Net surplus of ฿${(stats.totalRevenue - fixedMonthlyTarget).toLocaleString()} achieved.`
              : `Total revenue for ${selectedCycle.label} was ฿${stats.totalRevenue.toLocaleString()}, which is ฿${(fixedMonthlyTarget - stats.totalRevenue).toLocaleString()} short of the fixed ฿${fixedMonthlyTarget.toLocaleString()} goal.`
            }
          </p>
        </div>
        {stats.isGoalMet && (
          <div className="hidden md:flex flex-col items-center justify-center bg-green-600/10 px-6 py-2 rounded-xl border border-green-200">
             <span className="text-[10px] font-bold text-green-700 uppercase">Goal Status</span>
             <span className="text-sm font-bold text-green-800">Achieved</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
