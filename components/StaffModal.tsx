
import React, { useState, useEffect } from 'react';
import { X, UserCheck } from 'lucide-react';
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

  useEffect(() => {
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
  }, [staffToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staffData = {
      name,
      role,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      color_code: colorCode,
      base_salary: baseSalary,
      is_outsource: false, // Registered staff are always in-house
    };

    if (staffToEdit) {
      onSave({ ...staffData, id: staffToEdit.id });
    } else {
      onSave(staffData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-md rounded-2xl shadow-2xl border border-sage/20">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center">
          <h2 className="text-xl font-serif text-charcoal font-semibold">
            {staffToEdit ? 'Edit Therapist' : 'Register Therapist'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-full transition-colors">
            <X size={20} className="text-charcoal" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-sage/5 p-4 rounded-xl border border-sage/10 flex items-center gap-3 mb-2">
            <div className="bg-sage text-white p-2 rounded-lg">
              <UserCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sage uppercase tracking-widest">In-House Directory</p>
              <p className="text-[11px] text-charcoal font-medium">Registering a permanent team member</p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Khun Anong"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage transition-colors"
              required
            />
          </div>

          <div className="space-y-1 animate-in fade-in duration-300">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Monthly Base Salary (฿)</label>
            <input 
              type="number" 
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              placeholder="15000"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Role</label>
            <input 
              type="text" 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Therapist"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Skills (comma separated)</label>
            <input 
              type="text" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Thai Massage, Esthetics"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Timeline Color</label>
            <div className="flex gap-4 items-center">
              <input 
                type="color" 
                value={colorCode}
                onChange={(e) => setColorCode(e.target.value)}
                className="w-12 h-12 bg-white border border-sage/20 rounded-lg p-1 cursor-pointer"
              />
              <span className="text-sm font-mono text-sage">{colorCode}</span>
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 rounded-xl shadow-lg transition-all mt-4"
          >
            {staffToEdit ? 'Update Details' : 'Register to Team'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
