
import React from 'react';
import { Service } from '../types';
import { Plus, Edit3, Trash2, Search, UserCheck, UserPlus as AgencyIcon } from 'lucide-react';

interface ServicesTabProps {
  services: Service[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  language?: 'en' | 'th';
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
  onLaborRateChange: (inHouse: number, outsource: number) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ 
  services, 
  onAdd, 
  onEdit, 
  onDelete, 
  language = 'en',
  inHouseHourlyRate,
  outsourceHourlyRate,
  onLaborRateChange
}) => {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col bg-cream/30 overflow-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 shrink-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-charcoal font-semibold">Treatment Menu</h2>
          <p className="text-sage text-sm hidden sm:block">Manage your spa services, pricing, and operational costs.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          <div className="bg-white px-4 md:px-6 py-2 md:py-3 rounded-2xl border border-sage/10 shadow-sm flex flex-1 items-center justify-between sm:justify-start gap-4 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3 pr-4 md:pr-8 border-r border-sage/10">
              <div className="p-1.5 bg-sage/10 rounded-lg text-sage"><UserCheck size={14} /></div>
              <div className="flex flex-col">
                <span className="text-[7px] md:text-[8px] font-bold text-sage uppercase tracking-widest">In-House</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-charcoal/50">฿</span>
                  <input 
                    type="number" 
                    value={inHouseHourlyRate} 
                    onChange={(e) => onLaborRateChange(Number(e.target.value), outsourceHourlyRate)}
                    className="w-10 md:w-14 bg-transparent text-xs md:text-sm font-bold text-charcoal outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 bg-charcoal/5 rounded-lg text-charcoal/40"><AgencyIcon size={14} /></div>
              <div className="flex flex-col">
                <span className="text-[7px] md:text-[8px] font-bold text-charcoal/40 uppercase tracking-widest">Part-time</span>
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold text-charcoal/50">฿</span>
                  <input 
                    type="number" 
                    value={outsourceHourlyRate} 
                    onChange={(e) => onLaborRateChange(inHouseHourlyRate, Number(e.target.value))}
                    className="w-10 md:w-14 bg-transparent text-xs md:text-sm font-bold text-charcoal outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={onAdd}
            className="bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs font-bold uppercase tracking-widest h-11 md:h-12"
          >
            <Plus size={18} /> New Treatment
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
        <div className="flex-1 bg-white border border-sage/20 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm h-11 md:h-12">
          <Search size={18} className="text-sage" />
          <input type="text" placeholder="Search treatments..." className="bg-transparent outline-none w-full text-charcoal text-sm font-medium" />
        </div>
        <select className="bg-white border border-sage/20 rounded-2xl px-6 py-3 outline-none text-sage font-bold text-[10px] uppercase tracking-widest shadow-sm h-11 md:h-12">
          <option>All Categories</option>
          <option>Massage</option>
          <option>Facial</option>
        </select>
      </div>

      <div className="flex-1 overflow-hidden bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-sage/10 shadow-xl flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px] md:min-w-0">
            <thead className="bg-sage/5 border-b border-sage/10 sticky top-0 z-10">
              <tr>
                <th className="px-4 md:px-10 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold">Treatment</th>
                <th className="px-4 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold hidden sm:table-cell">Category</th>
                <th className="px-4 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold text-center">Dur.</th>
                <th className="px-4 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold text-center">Cost</th>
                <th className="px-4 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold text-center">Price</th>
                <th className="px-4 md:px-10 py-4 text-[9px] md:text-[10px] uppercase tracking-widest text-sage font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage/5">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-sage/5 transition-colors group">
                  <td className="px-4 md:px-10 py-4 md:py-6">
                    <p className="font-bold text-charcoal text-xs md:text-sm">{service.name}</p>
                    <div className="flex gap-1 mt-1 sm:hidden">
                       <span className="text-[7px] text-sage font-bold uppercase">{service.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 md:py-6 hidden sm:table-cell">
                    <span className="text-[10px] text-sage font-bold uppercase tracking-widest">{service.category}</span>
                  </td>
                  <td className="px-4 py-4 md:py-6 text-center">
                    <span className="text-xs text-charcoal font-medium">{service.duration}m</span>
                  </td>
                  <td className="px-4 py-4 md:py-6 text-center">
                    <span className="text-xs font-bold text-sage/60">฿{service.totalUnitCost}</span>
                  </td>
                  <td className="px-4 py-4 md:py-6 text-center">
                    <span className="text-xs font-bold text-charcoal">฿{service.price}</span>
                  </td>
                  <td className="px-4 md:px-10 py-4 md:py-6 text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <button onClick={() => onEdit(service)} className="p-2 text-sage hover:bg-sage/10 rounded-xl"><Edit3 size={16} /></button>
                      <button onClick={() => onDelete(service)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                    </div>
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

export default ServicesTab;
