
import React, { useMemo } from 'react';
import { Booking, Service, Staff } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Timer, 
  PieChart, 
  Activity, 
  Target,
  BarChart2,
  Info,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Layers,
  Zap,
  Share2,
  ArrowUpRight
} from 'lucide-react';
import { Language } from '../App';

interface AnalyticsTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  language: Language;
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
}

const TRANSLATIONS = {
  en: {
    title: 'Growth Intelligence',
    subtitle: 'Executive Pulse',
    revenue: 'Revenue',
    profit: 'Net Profit',
    volume: 'Sessions',
    avgTicket: 'Hrly Yield',
    revVsCost: 'Margin & Operational Velocity',
    peakHours: 'Resource Density',
    therapistYield: 'Talent Contribution',
    revenueMix: 'Portfolio Strategy',
    channelMix: 'Acquisition Channels'
  },
  th: {
    title: 'ข้อมูลการเติบโตเชิงลึก',
    subtitle: 'สรุปผลประกอบการ',
    revenue: 'รายได้รวม',
    profit: 'กำไรสุทธิ',
    volume: 'จำนวนรอบ',
    avgTicket: 'รายได้/ชม.',
    revVsCost: 'อัตรากำไรและประสิทธิภาพ',
    peakHours: 'ความหนาแน่นลูกค้า',
    therapistYield: 'ผลงานรายบุคคล',
    revenueMix: 'สัดส่วนบริการ',
    channelMix: 'ช่องทางที่มา'
  }
};

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ 
  bookings, services, staff, language, inHouseHourlyRate, outsourceHourlyRate 
}) => {
  const t = TRANSLATIONS[language];

  const processedData = useMemo(() => {
    const months: any[] = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'th-TH', { month: 'short' }).format(d);
      
      const monthBookings = bookings.filter(b => b.date.startsWith(monthKey));
      
      let revenue = 0;
      let cost = 0;
      let totalDuration = 0;
      const categoryRevenue: Record<string, number> = {};
      const channelCount: Record<string, number> = { 'Walk-in': 0, 'Online': 0, 'Phone': 0 };
      const therapistRevenue: Record<string, number> = {};
      const hourlyHeatmap: Record<number, number> = {};

      monthBookings.forEach(b => {
        const service = services.find(s => s.id === b.service_id);
        if (!service) return;

        revenue += service.price;
        totalDuration += service.duration;
        categoryRevenue[service.category] = (categoryRevenue[service.category] || 0) + service.price;
        channelCount[b.channel] = (channelCount[b.channel] || 0) + 1;
        
        const hour = parseInt(b.start_time.split(':')[0]);
        hourlyHeatmap[hour] = (hourlyHeatmap[hour] || 0) + 1;

        const staffName = staff.find(s => s.id === b.staff_id)?.name || (b.staff_id === 'OUTSOURCE' ? 'Agency' : 'Unknown');
        therapistRevenue[staffName] = (therapistRevenue[staffName] || 0) + service.price;

        const overhead = service.totalUnitCost || 0;
        const labor = (service.duration / 60) * (b.staff_id === 'OUTSOURCE' ? outsourceHourlyRate : inHouseHourlyRate);
        cost += (overhead + labor);
      });

      months.push({
        label: label.toUpperCase(),
        revenue,
        profit: revenue - cost,
        cost,
        volume: monthBookings.length,
        efficiency: totalDuration > 0 ? revenue / (totalDuration / 60) : 0,
        categoryRevenue,
        channelCount,
        hourlyHeatmap,
        therapistRevenue
      });
    }
    return months;
  }, [bookings, services, staff, inHouseHourlyRate, outsourceHourlyRate, language]);

  const current = processedData[3] || { revenue: 0, profit: 0, volume: 0, efficiency: 0, categoryRevenue: {}, channelCount: {}, hourlyHeatmap: {}, therapistRevenue: {} };
  const previous = processedData[2] || { revenue: 0, profit: 0, volume: 0, efficiency: 0 };

  const calculateDelta = (curr: number, prev: number) => {
    if (!prev || prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const deltas = {
    revenue: calculateDelta(current.revenue, previous.revenue),
    profit: calculateDelta(current.profit, previous.profit),
    volume: calculateDelta(current.volume, previous.volume),
    efficiency: calculateDelta(current.efficiency, previous.efficiency),
  };

  const maxVal = Math.max(...processedData.map(d => Math.max(d.revenue, d.cost)), 1000);
  const chartHeight = 220; 
  const chartMax = maxVal * 1.3;
  const segmentWidth = 800 / 3;

  const StatCard = ({ label, value, delta, icon: Icon, prefix = '', suffix = '' }: any) => {
    const isUp = delta >= 0;
    return (
      <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-lg shadow-sage/5 flex flex-col justify-between group transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-5">
          <div className="p-3 bg-sage/5 rounded-2xl text-sage group-hover:bg-sage group-hover:text-white transition-all">
            <Icon size={18} />
          </div>
          <div className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {isUp ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta).toFixed(1)}%
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-sage/40 font-black mb-1.5">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-serif font-bold text-charcoal">{prefix}{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}{suffix}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 lg:p-12 h-full bg-[#FAFAF8] overflow-y-auto scrollbar-hide pb-32">
      {/* Editorial Responsive Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 text-sage font-bold text-[11px] uppercase tracking-[0.5em] mb-3">
            <Activity size={16} className="animate-pulse" /> {t.title}
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-charcoal font-semibold tracking-tight leading-[1.1]">{t.subtitle}</h2>
        </div>
        <div className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] border border-sage/10 shadow-sm shrink-0">
          <ShieldCheck className="text-green-500" size={28} />
          <div className="leading-none">
            <p className="text-[11px] font-black text-sage uppercase tracking-[0.2em] mb-1.5">Intelligence Status</p>
            <p className="text-[13px] font-bold text-charcoal">Verified & Encrypted</p>
          </div>
        </div>
      </div>

      {/* KPI Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12">
        <StatCard label={t.revenue} value={current.revenue} delta={deltas.revenue} icon={DollarSign} prefix="฿" />
        <StatCard label={t.profit} value={current.profit} delta={deltas.profit} icon={PieChart} prefix="฿" />
        <StatCard label={t.volume} value={current.volume} delta={deltas.volume} icon={Zap} suffix=" ses." />
        <StatCard label={t.avgTicket} value={current.efficiency} delta={deltas.efficiency} icon={Target} prefix="฿" suffix="/hr" />
      </div>

      {/* Adaptive Growth Chart */}
      <div className="mb-12 bg-white p-6 md:p-12 rounded-[3rem] border border-sage/10 shadow-2xl shadow-sage/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage/5 rounded-full -mr-48 -mt-48 blur-[100px] opacity-60" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 relative z-10">
          <div>
            <h3 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">Fiscal Momentum</h3>
            <p className="text-[10px] md:text-[11px] text-sage font-black uppercase tracking-[0.3em] mt-3 opacity-60">{t.revVsCost}</p>
          </div>
          <div className="flex gap-3 p-2 bg-cream/50 rounded-2xl border border-sage/10">
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-white shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full bg-sage" />
              <span className="text-[10px] font-black text-sage uppercase tracking-widest">{t.revenue}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-charcoal/20" />
              <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Op. Costs</span>
            </div>
          </div>
        </div>
        
        <div className="w-full relative h-[280px] md:h-[350px]">
          <svg viewBox="0 0 800 400" className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8F9779" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8F9779" stopOpacity="0" />
              </linearGradient>
              <filter id="pointShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                <feOffset dx="0" dy="4" result="offsetblur" />
                <feComponentTransfer><feFuncA type="linear" slope="0.1"/></feComponentTransfer>
                <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Faint Horizontal Grids */}
            {[0, 0.5, 1].map((p, i) => {
              const y = 300 - (p * 300) + 50;
              return <line key={i} x1="0" y1={y} x2="800" y2={y} stroke="#F2F2F0" strokeWidth="1" />;
            })}

            {/* Cost Path */}
            <path 
              d={processedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * segmentWidth} ${300 - (d.cost / chartMax) * 300 + 50}`).join(' ')}
              fill="none" stroke="#333333" strokeWidth="1.5" strokeOpacity="0.1" strokeDasharray="6 6"
            />

            {/* Revenue Gradient */}
            <path 
              d={`${processedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * segmentWidth} ${300 - (d.revenue / chartMax) * 300 + 50}`).join(' ')} L 800 400 L 0 400 Z`}
              fill="url(#growthGrad)"
            />
            
            {/* Main Revenue Line */}
            <path 
              d={processedData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * segmentWidth} ${300 - (d.revenue / chartMax) * 300 + 50}`).join(' ')}
              fill="none" stroke="#8F9779" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            />

            {/* Points & Labels */}
            {processedData.map((d, i) => {
              const x = i * segmentWidth;
              const y = 300 - (d.revenue / chartMax) * 300 + 50;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="8" fill="white" filter="url(#pointShadow)" />
                  <circle cx={x} cy={y} r="4" fill="#8F9779" />
                  
                  {/* Axis Label */}
                  <text x={x} y={385} textAnchor="middle" className="text-[14px] font-black fill-sage/40 uppercase tracking-[0.4em]">{d.label}</text>
                  
                  {/* Floating Value - Hidden on smallest mobile viewboxes via transform logic if needed, but here kept minimal */}
                  <g transform={`translate(${x}, ${y - 35})`}>
                     <rect x="-35" y="-12" width="70" height="24" rx="12" fill="#333333" />
                     <text textAnchor="middle" y="5" className="fill-white text-[11px] font-black">฿{(d.revenue / 1000).toFixed(1)}k</text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Growth Strategy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Portfolio Strategy Mix */}
        <div className="bg-white p-10 rounded-[2.5rem] border border-sage/10 shadow-xl shadow-sage/5">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h4 className="font-serif text-3xl font-semibold text-charcoal">{t.revenueMix}</h4>
              <p className="text-[11px] text-sage font-black uppercase tracking-[0.2em] mt-2 opacity-60">Demand Distribution by Category</p>
            </div>
            <div className="p-3 bg-sage/5 rounded-2xl text-sage"><Layers size={22} /></div>
          </div>
          <div className="space-y-8">
            {Object.entries(current.categoryRevenue as Record<string, number>)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, rev]) => {
                const percent = (rev / (current.revenue || 1)) * 100;
                return (
                  <div key={cat} className="group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[13px] font-bold text-charcoal/80 uppercase tracking-widest">{cat}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black text-sage">{percent.toFixed(1)}%</span>
                        <span className="text-sm font-serif font-bold text-charcoal/40">฿{rev.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-cream rounded-full overflow-hidden shadow-inner border border-sage/5">
                      <div className="h-full bg-sage rounded-full transition-all duration-1000 group-hover:bg-sage-dark" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Acquisition & Performance Column */}
        <div className="flex flex-col gap-8">
            {/* Channel Performance Pills */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-sage/10 shadow-xl shadow-sage/5">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="font-serif text-2xl font-semibold text-charcoal">{t.channelMix}</h4>
                  <p className="text-[11px] text-sage font-black uppercase tracking-[0.2em] mt-2 opacity-60">Source Attribution</p>
                </div>
                <div className="p-3 bg-sage/5 rounded-2xl text-sage"><Share2 size={22} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(current.channelCount as Record<string, number>).map(([channel, count]) => {
                  const total = Object.values(current.channelCount as Record<string, number>).reduce((a, b) => a + b, 0);
                  const percent = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <div key={channel} className="text-center p-4 bg-cream/30 rounded-3xl border border-sage/5 hover:bg-white transition-all group">
                       <p className="text-[9px] font-black text-sage uppercase tracking-[0.2em] mb-2">{channel}</p>
                       <p className="text-2xl font-serif font-bold text-charcoal mb-1">{count}</p>
                       <div className="text-[10px] font-black text-sage/40">{percent.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Talent Pulse */}
            <div className="bg-white p-10 rounded-[2.5rem] border border-sage/10 shadow-xl shadow-sage/5 flex-1">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="font-serif text-2xl font-semibold text-charcoal">{t.therapistYield}</h4>
                    <BarChart2 size={20} className="text-sage" />
                </div>
                <div className="space-y-6">
                    {Object.entries(current.therapistRevenue as Record<string, number>)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, rev]) => {
                            const percent = (rev / (current.revenue || 1)) * 100;
                            return (
                                <div key={name} className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-2xl bg-cream flex items-center justify-center text-[12px] font-black text-sage border border-sage/10">{name.charAt(0)}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline mb-1.5">
                                            <span className="text-sm font-bold text-charcoal">{name}</span>
                                            <span className="text-[12px] font-serif font-bold text-sage">฿{rev.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-cream rounded-full overflow-hidden">
                                            <div className="h-full bg-sage rounded-full" style={{ width: `${percent}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div className="mt-8 pt-6 border-t border-sage/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Info size={16} className="text-sage/30" />
                        <span className="text-[10px] font-black text-sage/30 uppercase tracking-[0.2em]">Efficiency Protocol V4.2</span>
                    </div>
                    <ChevronRight size={18} className="text-sage/30" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
