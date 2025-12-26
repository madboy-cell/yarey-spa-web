
import React from 'react';
import { TourOperator } from '../types';
import { Plus, Edit3, Trash2, Search, CreditCard, Landmark, ArrowDownLeft, AlertCircle } from 'lucide-react';

interface OperatorsTabProps {
  operators: TourOperator[];
  onAdd: () => void;
  onEdit: (op: TourOperator) => void;
  onDelete: (op: TourOperator) => void;
  onSettle: (op: TourOperator) => void;
}

const OperatorsTab: React.FC<OperatorsTabProps> = ({ operators, onAdd, onEdit, onDelete, onSettle }) => {
  const totalOutstanding = operators.reduce((acc, curr) => acc + curr.outstanding_balance, 0);
  const totalLimits = operators.reduce((acc, curr) => acc + curr.total_credit_limit, 0);

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Tour Partnerships</h2>
          <p className="text-sage text-sm">Manage B2B credit accounts and settlement cycles.</p>
        </div>
        <button 
          onClick={onAdd}
          className="bg-sage hover:bg-sage-dark text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} /> New Partner
        </button>
      </div>

      {/* Credit Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-sage/10 p-3 rounded-2xl text-sage"><Landmark size={24} /></div>
             <span className="text-[10px] bg-sage/5 text-sage px-2 py-1 rounded-full font-bold uppercase">Total Accounts</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-sage font-bold">Receivables</p>
          <p className="text-3xl font-serif text-charcoal font-bold">฿{totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-sage/10 p-3 rounded-2xl text-sage"><CreditCard size={24} /></div>
             <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold uppercase">Healthy</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-sage font-bold">Total Credit Facility</p>
          <p className="text-3xl font-serif text-charcoal font-bold">฿{totalLimits.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="bg-orange-50 p-3 rounded-2xl text-orange-500"><AlertCircle size={24} /></div>
             <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold uppercase">Risk Monitoring</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-sage font-bold">Global Utilization</p>
          <p className="text-3xl font-serif text-charcoal font-bold">
            {totalLimits > 0 ? ((totalOutstanding / totalLimits) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Operator List */}
      <div className="flex-1 overflow-auto bg-white rounded-3xl border border-sage/10 shadow-lg">
        <table className="w-full text-left">
          <thead className="bg-sage/5 border-b border-sage/10 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Partner Name</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Credit Limit</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Balance</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Available</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Utilization</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/5">
            {operators.map(op => {
              const available = op.total_credit_limit - op.outstanding_balance;
              const utilization = (op.outstanding_balance / op.total_credit_limit) * 100;
              
              return (
                <tr key={op.id} className="hover:bg-sage/5 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="font-bold text-charcoal">{op.name}</p>
                    <p className="text-[10px] text-sage uppercase tracking-tighter">Verified Partner</p>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-charcoal">
                    ฿{op.total_credit_limit.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-red-500">
                    ฿{op.outstanding_balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-sage">
                    ฿{available.toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-32">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span className={utilization > 80 ? 'text-red-500' : 'text-sage'}>
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-cream border border-sage/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            utilization > 80 ? 'bg-red-400' : utilization > 50 ? 'bg-orange-300' : 'bg-sage'
                          }`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onSettle(op)}
                        title="Receive Payment"
                        className="flex items-center gap-1.5 bg-sage/10 text-sage px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-sage hover:text-white transition-all"
                      >
                        <ArrowDownLeft size={14} /> Settle
                      </button>
                      <button 
                        onClick={() => onEdit(op)}
                        className="p-2 text-sage hover:bg-sage/10 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(op)}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OperatorsTab;
