
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { TourOperator } from '../types';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (operator: TourOperator | Omit<TourOperator, 'id'>) => void;
  operatorToEdit?: TourOperator | null;
}

const OperatorModal: React.FC<OperatorModalProps> = ({ isOpen, onClose, onSave, operatorToEdit }) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState(50000);

  useEffect(() => {
    if (operatorToEdit) {
      setName(operatorToEdit.name);
      setLimit(operatorToEdit.total_credit_limit);
    } else {
      setName('');
      setLimit(50000);
    }
  }, [operatorToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      total_credit_limit: limit,
      outstanding_balance: operatorToEdit ? operatorToEdit.outstanding_balance : 0,
    };

    if (operatorToEdit) {
      onSave({ ...data, id: operatorToEdit.id });
    } else {
      onSave(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cream w-full max-w-md rounded-2xl shadow-2xl border border-sage/20 overflow-hidden">
        <div className="p-6 border-b border-sage/10 flex justify-between items-center bg-white">
          <h2 className="text-xl font-serif text-charcoal font-semibold">
            {operatorToEdit ? 'Update Partner' : 'New Tour Partner'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-sage/10 rounded-full transition-colors">
            <X size={20} className="text-charcoal" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Partner Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Andaman Luxury Travel"
              className="w-full bg-white border border-sage/20 rounded-xl p-4 outline-none focus:border-sage shadow-sm transition-all"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-sage font-bold">Approved Credit Limit (฿)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sage font-bold">฿</span>
              <input 
                type="number" 
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full bg-white border border-sage/20 rounded-xl p-4 pl-8 outline-none focus:border-sage shadow-sm transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-sage/70 italic flex items-center gap-1">
              <ShieldCheck size={12} /> Limit defines maximum outstanding credit before booking block.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-sage hover:bg-sage-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98]"
          >
            {operatorToEdit ? 'Save Changes' : 'Establish Partnership'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OperatorModal;
