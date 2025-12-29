
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Salesperson } from '../types';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (salesperson: Salesperson | Omit<Salesperson, 'id'>) => void;
  salespersonToEdit?: Salesperson | null;
}

const SalesModal: React.FC<SalesModalProps> = ({ isOpen, onClose, onSave, salespersonToEdit }) => {
  const [name, setName] = useState('');
  const [commissionRate, setCommissionRate] = useState(5);
  const [colorCode, setColorCode] = useState('#8F9779');

  useEffect(() => {
    if (salespersonToEdit) {
      setName(salespersonToEdit.name); setCommissionRate(salespersonToEdit.commission_rate); setColorCode(salespersonToEdit.color_code);
    } else {
      setName(''); setCommissionRate(5); setColorCode('#8F9779');
    }
  }, [salespersonToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, commission_rate: commissionRate, color_code: colorCode };
    if (salespersonToEdit) onSave({ ...data, id: salespersonToEdit.id });
    else onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-cream w-full h-full md:h-auto md:max-w-md md:rounded-[2rem] shadow-2xl border-none md:border md:border-sage/20 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center safe-area-pt">
          <h2 className="text-xl font-serif text-charcoal font-semibold">{salespersonToEdit ? 'Edit Partner' : 'New Partner'}</h2>
          <button onClick={onClose} className="p-3 hover:bg-sage/10 rounded-full"><X size={24} className="text-charcoal" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Partner Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Commission Rate (%)</label>
            <input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Display Color</label>
            <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} className="w-full h-12 bg-white border border-sage/20 rounded-xl p-1 cursor-pointer" />
          </div>
          <div className="pt-4 pb-10 md:pb-0 safe-area-pb">
            <button type="submit" className="w-full bg-sage text-white font-bold h-14 md:h-16 rounded-xl shadow-lg uppercase tracking-widest text-xs">Register Partner</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesModal;
