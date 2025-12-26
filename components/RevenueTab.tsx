
import React from 'react';
import { Booking, Service } from '../types';
import { TrendingUp, DollarSign, Wallet, CreditCard, Filter, FileText, ArrowUpRight } from 'lucide-react';

// Added language prop to handle translation and satisfy App.tsx requirements
interface RevenueTabProps {
  bookings: Booking[];
  services: Service[];
  language?: 'en' | 'th';
}

// Destructured language from props
const RevenueTab: React.FC<RevenueTabProps> = ({ bookings, services, language = 'en' }) => {
  const getBookingPrice = (serviceId: string) => services.find(s => s.id === serviceId)?.price || 0;
  
  const totalRevenue = bookings.reduce((acc, curr) => acc + getBookingPrice(curr.service_id), 0);

  const revenueByMethod = bookings.reduce((acc: Record<string, number>, curr) => {
    const price = getBookingPrice(curr.service_id);
    acc[curr.payment_type] = (acc[curr.payment_type] || 0) + price;
    return acc;
  }, {});

  const revenueByCategory = bookings.reduce((acc: Record<string, number>, curr) => {
    const service = services.find(s => s.id === curr.service_id);
    const category = service?.category || 'Unknown';
    acc[category] = (acc[category] || 0) + (service?.price || 0);
    return acc;
  }, {});

  const topService = (Object.entries(revenueByCategory) as [string, number][]).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Financial Performance</h2>
          <p className="text-sage text-sm">Real-time revenue tracking for Yarey Phuket.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-sage/20 text-sage px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-sage/5 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="bg-sage text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:bg-sage-dark transition-all">
            <FileText size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2rem] border border-sage/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={64} className="text-sage" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Gross Yield</p>
          <p className="text-4xl font-serif text-charcoal font-bold">฿{totalRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-sage font-bold uppercase">
            <ArrowUpRight size={14} className="text-green-500" />
            <span>Realized Income</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-sage/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Cash Contribution</p>
          <p className="text-4xl font-serif text-charcoal font-bold text-sage">฿{(revenueByMethod.Cash || 0).toLocaleString()}</p>
          <div className="mt-4 w-full bg-sage/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-sage h-full rounded-full" 
              style={{ width: `${((revenueByMethod.Cash || 0) / (totalRevenue || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-sage/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Top Category</p>
          <p className="text-4xl font-serif text-charcoal font-bold truncate">{topService ? topService[0] : 'None'}</p>
          <p className="mt-4 text-[10px] text-sage font-bold uppercase tracking-widest">
            Primary Volume Driver
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-sage/10 shadow-xl flex flex-col overflow-hidden">
          <div className="p-8 border-b border-sage/10 flex justify-between items-center">
            <h3 className="font-serif text-2xl text-charcoal font-semibold">Transaction Ledger</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-sage/5 border-b border-sage/10 sticky top-0">
                <tr>
                  <th className="px-10 py-5 text-[10px] uppercase tracking-widest text-sage font-bold">Guest</th>
                  <th className="px-10 py-5 text-[10px] uppercase tracking-widest text-sage font-bold">Treatment</th>
                  <th className="px-10 py-5 text-[10px] uppercase tracking-widest text-sage font-bold">Method</th>
                  <th className="px-10 py-5 text-[10px] uppercase tracking-widest text-sage font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/5">
                {bookings.map(booking => {
                  const service = services.find(s => s.id === booking.service_id);
                  return (
                    <tr key={booking.id} className="hover:bg-cream/50 transition-colors">
                      <td className="px-10 py-6">
                        <p className="text-sm font-bold text-charcoal">{booking.guest_name}</p>
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-xs text-sage font-bold uppercase">{service?.name}</p>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          {booking.payment_type === 'Cash' ? <Wallet size={14} className="text-sage" /> : <CreditCard size={14} className="text-sage" />}
                          <span className="text-xs font-bold text-charcoal/80 uppercase tracking-widest">{booking.payment_type}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-base font-serif font-bold text-charcoal">฿{service?.price.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-sage/10 shadow-xl">
          <h3 className="font-serif text-2xl text-charcoal font-semibold mb-8">Payment Mix</h3>
          <div className="space-y-8">
            {['Cash', 'Card'].map(method => {
              const value = revenueByMethod[method] || 0;
              const percent = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
              return (
                <div key={method} className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-sage">{method}</span>
                    <span className="text-charcoal font-serif text-sm">฿{value.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full bg-cream border border-sage/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sage rounded-full transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-sage/40 font-bold uppercase tracking-[0.2em]">{percent.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 p-6 bg-sage/5 rounded-2xl border border-sage/10">
             <h4 className="text-[10px] font-bold text-sage uppercase tracking-[0.2em] mb-2">Managerial Note</h4>
             <p className="text-xs text-sage leading-relaxed italic">
               Total realized income accounts for all confirmed arrivals. All sessions marked as 'Paid' by default.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;
