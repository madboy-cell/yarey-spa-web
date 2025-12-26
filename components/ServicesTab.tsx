
import React from 'react';
import { Service } from '../types';
import { Plus, Edit3, Trash2, Search } from 'lucide-react';

interface ServicesTabProps {
  services: Service[];
  onAdd: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services, onAdd, onEdit, onDelete }) => {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Treatment Menu</h2>
          <p className="text-sage text-sm">Manage your spa services, pricing, and duration.</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} /> Add Treatment
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white border border-sage/20 rounded-xl px-4 py-2 flex items-center gap-3">
          <Search size={20} className="text-sage" />
          <input type="text" placeholder="Search treatments..." className="bg-transparent outline-none w-full text-charcoal" />
        </div>
        <select className="bg-white border border-sage/20 rounded-xl px-4 py-2 outline-none text-sage font-medium">
          <option>All Categories</option>
          <option>Massage</option>
          <option>Facial</option>
          <option>Signature Package</option>
        </select>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-3xl border border-sage/10 shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-sage/5 border-b border-sage/10 sticky top-0">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-sage font-bold">Service Name</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-sage font-bold">Category</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-sage font-bold">Duration</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-sage font-bold">Price</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-sage font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/5">
            {services.map(service => (
              <tr key={service.id} className="hover:bg-sage/5 transition-colors group">
                <td className="px-6 py-5">
                  <p className="font-semibold text-charcoal">{service.name}</p>
                  <div className="flex gap-1 mt-1">
                    {service.skills_required.map(skill => (
                      <span key={skill} className="text-[9px] bg-sage/10 text-sage px-2 py-0.5 rounded-full uppercase">{skill}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-sage-dark font-medium">{service.category}</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm text-charcoal">{service.duration} mins</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-sm font-bold text-charcoal">฿{service.price.toLocaleString()}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(service)}
                      className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(service)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServicesTab;
