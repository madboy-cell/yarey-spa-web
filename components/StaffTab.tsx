
import React from 'react';
import { Staff } from '../types';
import { Plus, Edit3, Trash2, Search, Award } from 'lucide-react';

interface StaffTabProps {
  staff: Staff[];
  onAdd: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  language?: 'en' | 'th';
}

const StaffTab: React.FC<StaffTabProps> = ({ staff, onAdd, onEdit, onDelete, language = 'en' }) => {
  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif text-charcoal font-semibold">Staff Directory</h2>
          <p className="text-sage text-sm hidden sm:block">Manage your team of professionals and specialties.</p>
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all h-11 md:h-12"
        >
          <Plus size={20} /> <span className="text-sm font-bold uppercase tracking-widest">Add Staff</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-sage/20 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm h-11 md:h-12">
          <Search size={20} className="text-sage" />
          <input type="text" placeholder="Search staff..." className="bg-transparent outline-none w-full text-charcoal text-sm" />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {staff.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-sage/10 shadow-sm hover:shadow-md transition-all p-5 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: member.color_code }} />
              
              <div className="flex items-start justify-between mb-4 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-inner" style={{ backgroundColor: member.color_code }}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal truncate max-w-[120px]">{member.name}</h3>
                    <p className="text-sage font-medium text-[9px] uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(member)} className="p-1.5 text-sage hover:bg-sage/10 rounded-lg"><Edit3 size={16} /></button>
                  <button onClick={() => onDelete(member)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-bold text-sage-dark uppercase">
                  <Award size={12} /> Specialties
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="text-[8px] bg-cream border border-sage/20 text-charcoal/80 px-2 py-0.5 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                  {member.skills.length > 3 && <span className="text-[8px] text-sage/40">+{member.skills.length - 3}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffTab;
