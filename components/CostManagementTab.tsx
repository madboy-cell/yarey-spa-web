import React, { useMemo } from 'react';
import { Service, Staff, Booking } from '../types';
import { 
  UserCheck, 
  UserPlus as AgencyIcon, 
  Calculator, 
  ReceiptText, 
  Armchair,
  Coins,
  History,
  TrendingUp
} from 'lucide-react';

interface CostManagementTabProps {
  bookings: Booking[];
  services: Service[];
  staff: Staff[];
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
  onInHouseRateChange: (val: number) => void;
  onOutsourceRateChange: (val: number) => void;
  serviceCosts: any[];
  onSaveCosts: (costs: any[]) => void;
}

const CostManagementTab: React.FC<CostManagementTabProps> = ({ 
  bookings,
  services, 
  staff,
  inHouseHourlyRate,
  outsourceHourlyRate,
  onInHouseRateChange,
  onOutsourceRateChange
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const calculateLaborCost = (duration: number, hourlyRate: number) => {
    return (duration / 60) * hourlyRate;
  };

  const ledgerEntries = useMemo(() => {
    return bookings
      .filter(b => b.date === today)
      .map(booking => {
        const service = services.find(s => s.id === booking.service_id);
        const isOutsource = booking.staff_id === 'OUTSOURCE';
        const assignedStaff = staff.find(st => st.id === booking.staff_id);
        
        const duration = service?.duration || 0;
        const laborRate = isOutsource ? outsourceHourlyRate : inHouseHourlyRate;
        const laborCost = calculateLaborCost(duration, laborRate);

        return {
          ...booking,
          serviceName: service?.name || 'Unknown',
          duration,
          isOutsource,
          staffName: isOutsource ? 'Agency Personnel' : (assignedStaff?.name || 'Unknown'),
          laborRate,
          laborCost,
        };
      })
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [bookings, services, staff, today, inHouseHourlyRate, outsourceHourlyRate]);

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-hidden">
      {/* Header & Global Rate Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <TrendingUp size={12} /> Expense Management
          </div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Therapist Payouts</h2>
          <p className="text-sage text-xs font-medium mt-1">Configure hourly payout benchmarks and track daily therapist costs.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white px-8 py-5 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-10">
            <div className="flex items-center gap-4 pr-10 border-r border-sage/10">
              <div className="p-2 bg-sage/10 rounded-xl text-sage"><UserCheck size={20} /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-sage uppercase tracking-widest">In-House Rate</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-charcoal">฿</span>
                  <input 
                    type="number" 
                    value={inHouseHourlyRate} 
                    onChange={(e) => onInHouseRateChange(Number(e.target.value))}
                    className="w-20 bg-transparent text-lg font-serif font-bold text-charcoal outline-none border-b border-sage/20 focus:border-sage"
                  />
                  <span className="text-xs text-sage/40 font-bold">/hr</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 bg-charcoal/5 rounded-xl text-charcoal/40"><AgencyIcon size={20} /></div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Agency Rate</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-charcoal">฿</span>
                  <input 
                    type="number" 
                    value={outsourceHourlyRate} 
                    onChange={(e) => onOutsourceRateChange(Number(e.target.value))}
                    className="w-20 bg-transparent text-lg font-serif font-bold text-charcoal outline-none border-b border-sage/20 focus:border-sage"
                  />
                  <span className="text-xs text-sage/40 font-bold">/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table - Expanded to fill space */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-sage/10 shadow-xl overflow-hidden flex flex-col mb-4">
        <div className="p-8 border-b border-sage/10 flex items-center gap-5 bg-sage/5 shrink-0">
          <div className="bg-charcoal p-3.5 rounded-2xl text-white shadow-md"><ReceiptText size={24} /></div>
          <div>
            <h3 className="font-serif text-2xl text-charcoal font-semibold">Live Payout Ledger</h3>
            <p className="text-[10px] text-sage font-bold uppercase tracking-widest mt-1">Calculated as (Duration / 60) × Rate</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 text-sage text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-10 py-6 border-b border-sage/10">Session Details</th>
                <th className="px-10 py-6 border-b border-sage/10">Personnel</th>
                <th className="px-10 py-6 text-center border-b border-sage/10">Duration</th>
                <th className="px-10 py-6 text-center border-b border-sage/10">Benchmark</th>
                <th className="px-10 py-6 text-right border-b border-sage/10">Labor Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/5">
              {ledgerEntries.length > 0 ? (
                ledgerEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-cream/40 transition-colors group">
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-sage/5 border border-sage/10 flex items-center justify-center text-sage font-bold text-sm uppercase">
                          {entry.guest_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-charcoal">{entry.guest_name}</p>
                          <p className="text-[10px] text-sage/70 uppercase font-bold tracking-tight">{entry.serviceName} • {entry.start_time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
                        entry.isOutsource ? 'bg-charcoal/5 text-charcoal/60 border-charcoal/10' : 'bg-sage/10 text-sage border-sage/10'
                      }`}>
                        {entry.isOutsource ? <AgencyIcon size={14} /> : <UserCheck size={14} />}
                        {entry.staffName}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-charcoal">{entry.duration}m</span>
                        <span className="text-[9px] uppercase font-bold text-sage/30 tracking-widest">Treatment Time</span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-charcoal">฿{entry.laborRate}/hr</span>
                        <span className="text-[9px] uppercase font-bold text-sage/30 tracking-widest">Applied Rate</span>
                      </div>
                    </td>
                    <td className="px-10 py-7 text-right">
                      <div className="flex flex-col items-end">
                        <p className="text-xl font-serif font-bold text-charcoal">
                          ฿{entry.laborCost.toFixed(0)}
                        </p>
                        <p className="text-[10px] font-bold uppercase text-sage/40 tracking-widest">Attributed Payout</p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center opacity-30">
                       <History size={80} strokeWidth={1} className="text-sage mb-6" />
                       <p className="font-serif text-3xl text-charcoal italic">The journals are quiet</p>
                       <p className="text-xs text-sage font-bold uppercase tracking-widest mt-2">No session costs to display for today</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostManagementTab;