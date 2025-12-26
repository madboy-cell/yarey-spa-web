import React, { useState } from 'react';
import { Booking, Staff, Service } from '../types';
import { 
  Clock, 
  Users, 
  DollarSign, 
  Globe, 
  Search, 
  Filter, 
  CheckCircle2, 
  Timer, 
  CreditCard, 
  User,
  MoreVertical,
  MapPin,
  Calendar,
  UserPlus as AgencyIcon,
  Edit3,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ bookings, staff, services, onEditBooking, onDeleteBooking }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const getBookingService = (serviceId: string) => services.find(s => s.id === serviceId);
  const getBookingStaff = (staffId: string) => staff.find(st => st.id === staffId);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings
    .filter(b => b.date === today)
    .filter(b => b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const totalRevenueToday = todayBookings.reduce((sum, b) => sum + (getBookingService(b.service_id)?.price || 0), 0);
  const totalHoursToday = todayBookings.reduce((sum, b) => {
    const s = getBookingService(b.service_id);
    return sum + (s ? s.duration / 60 : 0);
  }, 0);

  return (
    <div className="flex flex-col h-full bg-cream/30 overflow-hidden">
      {/* Metrics Row - Refined for Luxury Feel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-8 shrink-0">
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">Total Arrivals</p>
            <p className="text-3xl font-serif text-charcoal font-bold">{todayBookings.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">Treatment Vol</p>
            <p className="text-3xl font-serif text-charcoal font-bold">{totalHoursToday.toFixed(1)}h</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">Daily Yield</p>
            <p className="text-3xl font-serif text-charcoal font-bold">฿{totalRevenueToday.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-sage/10 shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="bg-sage/10 p-4 rounded-2xl text-sage">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-sage font-bold">Efficiency</p>
            <p className="text-3xl font-serif text-charcoal font-bold">82%</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden px-8 pb-8 flex flex-col gap-6">
        {/* Search and Filters */}
        <div className="flex justify-between items-center gap-4 shrink-0">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage/60" />
            <input 
              type="text" 
              placeholder="Search guest names or appointments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-sage/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-sage/20 shadow-sm font-medium text-charcoal"
            />
          </div>
          <button className="bg-white p-4 rounded-2xl border border-sage/10 text-sage hover:bg-sage/5 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>

        {/* Booking List Container */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-sage/10 shadow-xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-12 px-8 py-6 border-b border-sage/10 bg-sage/5 text-[10px] font-bold uppercase tracking-[0.2em] text-sage/70">
            <div className="col-span-3">Guest & Origin</div>
            <div className="col-span-3">Treatment & Time</div>
            <div className="col-span-3">Staff Assignment</div>
            <div className="col-span-1">Settlement</div>
            <div className="col-span-2 text-right">Yield & Actions</div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {todayBookings.length > 0 ? (
              todayBookings.map((b) => {
                const service = getBookingService(b.service_id);
                const assignedStaff = getBookingStaff(b.staff_id);
                const isPaid = b.payment_status === 'Paid';
                const isOutsource = b.staff_id === 'OUTSOURCE';
                
                return (
                  <div key={b.id} className="grid grid-cols-12 px-8 py-8 border-b border-sage/5 hover:bg-cream/50 transition-all items-center group">
                    {/* Guest Info */}
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-12 h-12 bg-cream rounded-2xl border border-sage/10 flex items-center justify-center text-sage font-serif font-bold text-lg shrink-0">
                        {b.guest_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-charcoal truncate">{b.guest_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] bg-sage/10 text-sage px-2 py-0.5 rounded-md font-bold uppercase flex items-center gap-1">
                            <Globe size={10} /> {b.nationality || 'N/A'}
                          </span>
                          {b.group_ref && (
                            <span className="text-[9px] bg-charcoal/5 text-charcoal/60 px-2 py-0.5 rounded-md font-bold uppercase">
                              Group
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Service & Time */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-2 text-charcoal">
                        <Clock size={14} className="text-sage" />
                        <span className="text-sm font-bold tracking-tight">{b.start_time} — {b.end_time}</span>
                      </div>
                      <p className="text-xs text-sage font-medium mt-1 truncate">{service?.name}</p>
                      <p className="text-[10px] text-sage/50 font-bold uppercase tracking-wider">{service?.duration} Minutes</p>
                    </div>

                    {/* Staff */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        {isOutsource ? (
                          <>
                            <div className="w-8 h-8 rounded-xl bg-charcoal text-white flex items-center justify-center">
                              <AgencyIcon size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-charcoal">Agency Therapist</p>
                              <p className="text-[9px] text-sage/60 font-medium uppercase tracking-widest">Outsource Pool</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div 
                              className="w-8 h-8 rounded-xl border-2 border-white shadow-sm flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ backgroundColor: assignedStaff?.color_code || '#8F9779' }}
                            >
                              {assignedStaff?.name.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-charcoal">{assignedStaff?.name || 'Unassigned'}</p>
                              <p className="text-[9px] text-sage/60 font-medium uppercase tracking-widest">{assignedStaff?.role || 'Staff'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 flex flex-col gap-1.5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest w-fit ${
                        isPaid ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}>
                        {isPaid ? <CheckCircle2 size={12} /> : <Timer size={12} />}
                        {b.payment_status}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="col-span-2 text-right">
                      <div className="flex items-center justify-end gap-6">
                        <div className="text-right">
                          <p className="text-base font-serif font-bold text-charcoal">฿{service?.price.toLocaleString()}</p>
                          <p className="text-[9px] text-sage/40 font-bold uppercase tracking-widest">{b.payment_type}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => onEditBooking(b)}
                            className="p-2 text-sage hover:bg-sage/10 rounded-xl transition-colors"
                            title="Edit Booking"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => onDeleteBooking(b)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                            title="Cancel Booking"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <Calendar size={64} strokeWidth={1} className="text-sage mb-4" />
                <p className="font-serif text-2xl text-charcoal italic">The journals are quiet today</p>
                <p className="text-sm text-sage uppercase tracking-widest mt-2">No active bookings found for this selection</p>
              </div>
            )}
          </div>
          
          {/* Footer Navigation for Daily Schedule */}
          <div className="bg-sage/5 px-8 py-4 border-t border-sage/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-6 text-[10px] font-bold text-sage/60 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Confirmed Sessions
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-400" /> Pending Arrivals
              </div>
            </div>
            <div className="text-[11px] font-bold text-sage">
              Showing {todayBookings.length} of {bookings.filter(b => b.date === today).length} Appointments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;