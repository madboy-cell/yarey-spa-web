
import React, { useState, useEffect } from 'react';
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
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setCategory(serviceToEdit.category);
      setDuration(serviceToEdit.duration);
      setPrice(serviceToEdit.price);
      setSkills(serviceToEdit.skills_required.join(', '));
    } else {
      setName('');
      setCategory('Massage');
      setDuration(60);
      setPrice(1000);
      setSkills('');
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      name,
      category,
      duration,
      price,
      skills_required: skills.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (serviceToEdit) {
      onSave({ ...serviceData, id: serviceToEdit.id });
    } else {
      onSave(serviceData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-md rounded-2xl shadow-2xl border border-sage/20">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center">
          <h2 className="text-xl font-serif text-charcoal font-semibold">
            {serviceToEdit ? 'Edit Treatment' : 'Add New Treatment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-full transition-colors">
            <X size={20} className="text-charcoal" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Treatment Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Deep Tissue Relief"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage transition-colors"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-sage font-bold">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-sage font-bold">Duration (min)</label>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Price (฿)</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Required Skills (comma separated)</label>
            <input 
              type="text" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Thai Massage, Oil Massage"
              className="w-full bg-white border border-sage/20 rounded-lg p-3 outline-none focus:border-sage"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-sage hover:bg-sage-dark text-white font-semibold py-3 rounded-xl shadow-lg transition-all mt-4"
          >
            {serviceToEdit ? 'Update Treatment' : 'Create Treatment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceModal;
