
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Staff } from '../types';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: Staff | Omit<Staff, 'id'>) => void;
  staffToEdit?: Staff | null;
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSave, staffToEdit }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Therapist');
  const [skills, setSkills] = useState('');
  const [colorCode, setColorCode] = useState('#8F9779');
  const [baseSalary, setBaseSalary] = useState(0);

  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      if (staffToEdit) {
        setName(staffToEdit.name); 
        setRole(staffToEdit.role); 
        setSkills(staffToEdit.skills.join(', ')); 
        setColorCode(staffToEdit.color_code); 
        setBaseSalary(staffToEdit.base_salary || 0);
      } else {
        setName(''); 
        setRole('Therapist'); 
        setSkills(''); 
        setColorCode('#8F9779'); 
        setBaseSalary(0);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, staffToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      name, 
      role, 
      skills: skills.split(',').map(s => s.trim()).filter(Boolean), 
      color_code: colorCode, 
      base_salary: baseSalary, 
      is_outsource: false 
    };
    if (staffToEdit) onSave({ ...data, id: staffToEdit.id });
    else onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-cream w-full h-full md:h-auto md:max-w-md md:rounded-[2rem] shadow-2xl border-none md:border md:border-sage/20 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center safe-area-pt">
          <h2 className="text-xl font-serif text-charcoal font-semibold">{staffToEdit ? 'Edit Therapist' : 'New Therapist'}</h2>
          <button onClick={onClose} className="p-3 hover:bg-sage/10 rounded-full transition-colors"><X size={24} className="text-charcoal" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Monthly Salary (฿)</label>
            <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(Number(e.target.value))} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Position / Role</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Display Color Marker</label>
            <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="w-full h-12 bg-white border border-sage/20 rounded-xl p-1 cursor-pointer" />
          </div>
          <div className="pt-4 pb-10 md:pb-0 safe-area-pb">
            <button type="submit" className="w-full bg-sage hover:bg-sage-dark text-white font-bold h-14 md:h-16 rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
              {staffToEdit ? 'Save Changes' : 'Register Therapist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
