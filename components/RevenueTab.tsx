import React from 'react';
import { Booking, Service, TourOperator } from '../types';
import { TrendingUp, DollarSign, Wallet, CreditCard, ChevronDown, Filter, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface RevenueTabProps {
  bookings: Booking[];
  services: Service[];
  operators: TourOperator[];
}

const RevenueTab: React.FC<RevenueTabProps> = ({ bookings, services, operators }) => {
  const getBookingPrice = (serviceId: string) => services.find(s => s.id === serviceId)?.price || 0;
  
  const totalRevenue = bookings.reduce((acc, curr) => acc + getBookingPrice(curr.service_id), 0);
  const paidRevenue = bookings
    .filter(b => b.payment_status === 'Paid')
    .reduce((acc, curr) => acc + getBookingPrice(curr.service_id), 0);
  const pendingRevenue = totalRevenue - paidRevenue;

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

  // Fix: Explicitly type entries to prevent arithmetic error on unknown/any types during sort on line 34
  const topService = (Object.entries(revenueByCategory) as [string, number][]).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="p-8 h-full flex flex-col bg-cream/30 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif text-charcoal font-semibold">Financial Performance</h2>
          <p className="text-sage text-sm">Real-time revenue tracking and transaction history for Yarey Phuket.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-sage/20 text-sage px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold hover:bg-sage/5 transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button className="bg-sage text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg hover:bg-sage-dark transition-all">
            <FileText size={18} /> Export Report
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={64} className="text-sage" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Total Revenue</p>
          <p className="text-3xl font-serif text-charcoal font-bold">฿{totalRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-1.5 text-[10px] text-sage font-bold uppercase">
            <ArrowUpRight size={14} className="text-green-500" />
            <span>+12.5% from yesterday</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Cash & Card (Paid)</p>
          <p className="text-3xl font-serif text-charcoal font-bold text-sage">฿{paidRevenue.toLocaleString()}</p>
          <div className="mt-4 w-full bg-sage/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-sage h-full rounded-full" 
              style={{ width: `${(paidRevenue / totalRevenue) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Credit Outstanding</p>
          <p className="text-3xl font-serif text-red-400 font-bold">฿{pendingRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] text-sage font-bold uppercase tracking-widest">Pending Settlement</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold mb-1">Top Category</p>
          <p className="text-3xl font-serif text-charcoal font-bold truncate">{topService ? topService[0] : 'None'}</p>
          <p className="mt-4 text-[10px] text-sage font-bold uppercase tracking-widest">
            {topService ? `฿${topService[1].toLocaleString()} Volume` : 'No data yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Transaction Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-sage/10 shadow-lg flex flex-col overflow-hidden">
          <div className="p-6 border-b border-sage/10 flex justify-between items-center">
            <h3 className="font-serif text-xl text-charcoal font-semibold">Recent Transactions</h3>
            <span className="text-[10px] bg-sage/10 text-sage px-3 py-1 rounded-full font-bold uppercase tracking-widest">Today</span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-sage/5 border-b border-sage/10 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Guest</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Payment</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold">Method</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-sage font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage/5">
                {bookings.map(booking => {
                  const service = services.find(s => s.id === booking.service_id);
                  return (
                    <tr key={booking.id} className="hover:bg-sage/5 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-charcoal">{booking.guest_name}</p>
                        <p className="text-[10px] text-sage font-medium uppercase">{service?.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-tighter ${
                          booking.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {booking.payment_type === 'Cash' && <Wallet size={14} className="text-sage" />}
                          {booking.payment_type === 'Card' && <CreditCard size={14} className="text-sage" />}
                          {booking.payment_type === 'Credit' && <FileText size={14} className="text-red-300" />}
                          <span className="text-xs font-medium text-charcoal/80">{booking.payment_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-charcoal">฿{service?.price.toLocaleString()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-sage/10 shadow-lg">
            <h3 className="font-serif text-xl text-charcoal font-semibold mb-6">Payment Methods</h3>
            <div className="space-y-5">
              {['Cash', 'Card', 'Credit'].map(method => {
                const value = revenueByMethod[method] || 0;
                const percent = totalRevenue > 0 ? (value / totalRevenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-sage">{method}</span>
                      <span className="text-charcoal">฿{value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-cream border border-sage/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          method === 'Credit' ? 'bg-red-300' : 'bg-sage'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-sage p-6 rounded-3xl shadow-lg text-white">
            <h3 className="font-serif text-xl font-semibold mb-4">Tour Operator Settlement</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-6">
              There are {bookings.filter(b => b.payment_type === 'Credit').length} pending credit transactions waiting for operator billing cycles.
            </p>
            <div className="space-y-3">
              {operators.slice(0, 3).map(op => (
                <div key={op.id} className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest">{op.name}</span>
                  <span className="text-xs font-bold">฿{op.outstanding_balance.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-white text-sage rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-cream transition-colors">
              Process Billings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;
