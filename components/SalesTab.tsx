
import React from 'react';
import { Salesperson } from '../types';
import { Plus, Edit3, Trash2, Search, ShoppingBag } from 'lucide-react';
import { Language } from '../App';

interface SalesTabProps {
  salespersons: Salesperson[];
  onAdd: () => void;
  onEdit: (salesperson: Salesperson) => void;
  onDelete: (salesperson: Salesperson) => void;
  language?: Language;
}

const SalesTab: React.FC<SalesTabProps> = ({ salespersons, onAdd, onEdit, onDelete, language = 'en' }) => {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-charcoal font-semibold">
            {language === 'en' ? 'Sales Partners' : 'รายชื่อทีมขาย'}
          </h2>
          <p className="text-sage text-sm hidden sm:block">Manage your sales force and commission structures.</p>
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all h-11 md:h-12"
        >
          <Plus size={20} /> <span className="text-sm font-bold uppercase tracking-widest">{language === 'en' ? 'Add Partner' : 'เพิ่มทีมขาย'}</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-sage/20 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm h-11 md:h-12">
          <Search size={20} className="text-sage" />
          <input type="text" placeholder="Search partners..." className="bg-transparent outline-none w-full text-charcoal text-sm" />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {salespersons.map((s) => (
            <div 
              key={s.id} 
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-sage/10 shadow-sm hover:shadow-md transition-all p-5 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: s.color_code }} />
              
              <div className="flex items-start justify-between mb-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-inner" style={{ backgroundColor: s.color_code }}>
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal truncate max-w-[120px]">{s.name}</h3>
                    <p className="text-sage font-medium text-[9px] uppercase tracking-wider">Representative</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(s)} className="p-1.5 text-sage hover:bg-sage/10 rounded-lg transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(s)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-bold text-sage-dark uppercase tracking-tighter">
                  <ShoppingBag size={12} /> Commission
                </div>
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-serif font-bold text-charcoal">{s.commission_rate}%</span>
                   <span className="text-[8px] text-sage font-bold uppercase tracking-widest">Rate</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesTab;
