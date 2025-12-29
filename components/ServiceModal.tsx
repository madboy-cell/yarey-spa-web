
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Service, Category } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service | Omit<Service, 'id'>) => void;
  serviceToEdit?: Service | null;
}

const CATEGORIES: Category[] = ['Massage', 'Facial', 'Body Wrap', 'Scrub', 'Signature Package'];

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, serviceToEdit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Massage');
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(1000);
  const [totalUnitCost, setTotalUnitCost] = useState(0);
  const [skills, setSkills] = useState('');
  
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      if (serviceToEdit) {
        setName(serviceToEdit.name); 
        setCategory(serviceToEdit.category); 
        setDuration(serviceToEdit.duration); 
        setPrice(serviceToEdit.price); 
        setTotalUnitCost(serviceToEdit.totalUnitCost || 0); 
        setSkills(serviceToEdit.skills_required.join(', '));
      } else {
        setName(''); 
        setCategory('Massage'); 
        setDuration(60); 
        setPrice(1000); 
        setTotalUnitCost(0); 
        setSkills('');
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, serviceToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { 
      name, 
      category, 
      duration, 
      price, 
      totalUnitCost, 
      skills_required: skills.split(',').map(s => s.trim()).filter(Boolean) 
    };
    if (serviceToEdit) onSave({ ...data, id: serviceToEdit.id } as Service);
    else onSave(data as Omit<Service, 'id'>);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-cream w-full h-full md:h-auto md:max-w-md md:rounded-[2rem] shadow-2xl border-none md:border md:border-sage/20 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center bg-white/50 safe-area-pt">
          <h2 className="text-xl font-serif text-charcoal font-semibold">{serviceToEdit ? 'Edit Treatment' : 'New Treatment'}</h2>
          <button onClick={onClose} className="p-3 hover:bg-sage/10 rounded-full"><X size={24} className="text-charcoal" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Treatment Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-xs font-bold focus:border-sage">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Price (฿)</label>
              <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Unit Cost (฿)</label>
              <input type="number" value={totalUnitCost} onChange={(e) => setTotalUnitCost(Number(e.target.value))} className="w-full bg-sage/5 border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-sage font-bold">Skills Required</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Thai, Oil" className="w-full bg-white border border-sage/20 rounded-xl h-11 md:h-12 px-4 outline-none text-sm font-bold focus:border-sage" />
          </div>
          <div className="pt-4 pb-10 md:pb-0 safe-area-pb">
            <button type="submit" className="w-full bg-sage hover:bg-sage-dark text-white font-bold h-14 md:h-16 rounded-xl shadow-lg uppercase tracking-widest text-xs transition-all active:scale-[0.98]">
              {serviceToEdit ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
