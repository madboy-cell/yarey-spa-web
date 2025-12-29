
import React from 'react';
import { Service } from '../types';
import { 
  UserCheck, 
  UserPlus as AgencyIcon, 
  TrendingUp,
  Settings2
} from 'lucide-react';

interface CostManagementTabProps {
  services: Service[];
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
  onLaborRateChange: (inHouse: number, outsource: number) => void;
  onServiceSave: (service: Service) => void;
  language?: 'en' | 'th';
}

const CostManagementTab: React.FC<CostManagementTabProps> = ({ 
  services, 
  inHouseHourlyRate, 
  outsourceHourlyRate, 
  onLaborRateChange,
  onServiceSave,
  language = 'en'
}) => {
  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-auto scrollbar-hide">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sage font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
            <TrendingUp size={12} /> Expense Management
          </div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Cost Architecture</h2>
          <p className="text-sage text-xs font-medium mt-1">Configure hourly payout benchmarks and track treatment overhead costs.</p>
        </div>
        
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
                  onChange={(e) => onLaborRateChange(Number(e.target.value), outsourceHourlyRate)}
                  className="w-20 bg-transparent text-lg font-serif font-bold text-charcoal outline-none border-b border-sage/20 focus:border-sage"
                />
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
                  onChange={(e) => onLaborRateChange(inHouseHourlyRate, Number(e.target.value))}
                  className="w-20 bg-transparent text-lg font-serif font-bold text-charcoal outline-none border-b border-sage/20 focus:border-sage"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-sage/10 shadow-xl overflow-hidden flex flex-col mb-10 shrink-0">
        <div className="p-8 border-b border-sage/10 flex items-center gap-5 bg-sage/5">
          <div className="bg-sage p-3.5 rounded-2xl text-white shadow-md"><Settings2 size={24} /></div>
          <div>
            <h3 className="font-serif text-2xl text-charcoal font-semibold">Treatment Overhead Configuration</h3>
            <p className="text-[10px] text-sage font-bold uppercase tracking-widest mt-1">Set total Unit Cost (Oil + Laundry + Utilities) per service</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-sage text-[10px] uppercase tracking-[0.2em] font-bold">
              <tr>
                <th className="px-10 py-5 border-b border-sage/10">Treatment Name</th>
                <th className="px-6 py-5 border-b border-sage/10 text-center">Total Unit Cost</th>
                <th className="px-6 py-5 border-b border-sage/10 text-center">Duration</th>
                <th className="px-6 py-5 border-b border-sage/10 text-center italic opacity-40">Financial Implication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/5">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-cream/40 transition-colors group">
                  <td className="px-10 py-5">
                    <p className="text-sm font-bold text-charcoal">{service.name}</p>
                    <p className="text-[9px] text-sage font-bold uppercase tracking-widest">{service.category}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-sage/60 font-bold">฿</span>
                      <input 
                        type="number"
                        value={service.totalUnitCost || 0}
                        onChange={(e) => onServiceSave({ ...service, totalUnitCost: Number(e.target.value) })}
                        className="w-32 bg-cream/50 border border-sage/10 rounded-xl p-3 text-center text-sm font-bold text-charcoal focus:bg-white focus:border-sage outline-none transition-all shadow-inner"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-bold text-charcoal">{service.duration}m</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className="text-[10px] text-sage/40 font-medium">Profit base: ฿{service.price - (service.totalUnitCost || 0)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CostManagementTab;
