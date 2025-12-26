
import React from 'react';
import { Staff } from '../types';
import { Plus, Edit3, Trash2, Search, Award } from 'lucide-react';

// Added language prop to handle translation and satisfy App.tsx requirements
interface StaffTabProps {
  staff: Staff[];
  onAdd: () => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  language?: 'en' | 'th';
}

// Destructured language from props
const StaffTab: React.FC<StaffTabProps> = ({ staff, onAdd, onEdit, onDelete, language = 'en' }) => {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Therapist Directory</h2>
          <p className="text-sage text-sm">Manage your team of professionals and their assigned specialties.</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} /> Add Therapist
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-sage/20 rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm">
          <Search size={20} className="text-sage" />
          <input type="text" placeholder="Search therapists by name or skill..." className="bg-transparent outline-none w-full text-charcoal" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-3xl border border-sage/10 shadow-sm hover:shadow-md transition-all p-6 group relative overflow-hidden"
            >
              {/* Decorative color strip */}
              <div 
                className="absolute top-0 left-0 w-full h-1.5" 
                style={{ backgroundColor: member.color_code }}
              />
              
              <div className="flex items-start justify-between mb-4 pt-2">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-inner"
                    style={{ backgroundColor: member.color_code }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal">{member.name}</h3>
                    <p className="text-sage font-medium text-xs uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(member)}
                    className="p-1.5 text-sage hover:bg-sage/10 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(member)}
                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sage-dark uppercase tracking-tighter">
                  <Award size={14} /> Specialties
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="text-[10px] bg-cream border border-sage/20 text-charcoal/80 px-2.5 py-1 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-sage/5 flex justify-between items-center text-[10px] font-bold text-sage uppercase tracking-widest">
                <span>Timeline ID: {member.id}</span>
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: member.color_code }}
                  />
                  <span>Display Color</span>
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
