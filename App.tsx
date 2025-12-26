import React, { useState } from 'react';
import { Calendar, Users, Briefcase, Settings, CreditCard, ChevronRight, Plus, BarChart3, LineChart, Coins } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ServicesTab from './components/ServicesTab';
import StaffTab from './components/StaffTab';
import RevenueTab from './components/RevenueTab';
import OperatorsTab from './components/OperatorsTab';
import AnalyticsTab from './components/AnalyticsTab';
import CostManagementTab from './components/CostManagementTab';
import BookingModal from './components/BookingModal';
import ServiceModal from './components/ServiceModal';
import StaffModal from './components/StaffModal';
import OperatorModal from './components/OperatorModal';
import ConfirmModal from './components/ConfirmModal';
import { Service, Staff, Booking, TourOperator, ServiceCost } from './types';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_TOUR_OPERATORS, INITIAL_BOOKINGS } from './constants';

type Tab = 'dashboard' | 'analytics' | 'revenue' | 'cost' | 'services' | 'staff' | 'operators' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [operators, setOperators] = useState<TourOperator[]>(INITIAL_TOUR_OPERATORS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  
  // Cost Management State
  const [inHouseHourlyRate, setInHouseHourlyRate] = useState(250);
  const [outsourceHourlyRate, setOutsourceHourlyRate] = useState(400);
  const [serviceCosts, setServiceCosts] = useState<ServiceCost[]>([]);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingOperator, setEditingOperator] = useState<TourOperator | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSaveBookings = (newBookings: Omit<Booking, 'id'>[], editId?: string) => {
    if (editId) {
      // Editing an existing booking
      const updatedBooking = { ...newBookings[0], id: editId };
      setBookings(bookings.map(b => b.id === editId ? (updatedBooking as Booking) : b));
    } else {
      // Adding new bookings
      const withIds = newBookings.map(b => ({ 
        ...b, 
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0]
      }));
      setBookings([...bookings, ...withIds]);
    }
    setEditingBooking(null);
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setConfirmDelete({
      isOpen: true,
      title: "Cancel Appointment",
      message: `Are you sure you want to remove the booking for "${booking.guest_name}"? This action cannot be undone.`,
      onConfirm: () => {
        setBookings(bookings.filter(b => b.id !== booking.id));
      }
    });
  };

  const handleSaveService = (serviceData: Service | Omit<Service, 'id'>) => {
    if ('id' in serviceData) {
      setServices(services.map(s => s.id === serviceData.id ? (serviceData as Service) : s));
    } else {
      const withId = { ...serviceData, id: `s${Date.now()}` };
      setServices([...services, withId]);
    }
    setEditingService(null);
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };

  const initiateDeleteService = (service: Service) => {
    setConfirmDelete({
      isOpen: true,
      title: "Remove Service",
      message: `Are you sure you want to remove "${service.name}"?`,
      onConfirm: () => {
        setServices(services.filter(s => s.id !== service.id));
      }
    });
  };

  const handleSaveStaff = (staffData: Staff | Omit<Staff, 'id'>) => {
    if ('id' in staffData) {
      setStaff(staff.map(s => s.id === staffData.id ? (staffData as Staff) : s));
    } else {
      const withId = { ...staffData, id: `st${Date.now()}` };
      setStaff([...staff, withId]);
    }
    setEditingStaff(null);
  };

  const handleSaveOperator = (opData: TourOperator | Omit<TourOperator, 'id'>) => {
    if ('id' in opData) {
      setOperators(operators.map(o => o.id === opData.id ? (opData as TourOperator) : o));
    } else {
      const withId = { ...opData, id: `to${Date.now()}` };
      setOperators([...operators, withId]);
    }
    setEditingOperator(null);
  };

  const handleSettleOperator = (op: TourOperator) => {
    setConfirmDelete({
      isOpen: true,
      title: "Record Settlement",
      message: `Confirm ฿${op.outstanding_balance.toLocaleString()} payment?`,
      onConfirm: () => {
        setOperators(operators.map(o => o.id === op.id ? { ...o, outstanding_balance: 0 } : o));
        setBookings(bookings.map(b => b.tour_operator_id === op.id ? { ...b, payment_status: 'Paid' } : b));
      }
    });
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'revenue', label: 'Revenue', icon: BarChart3 },
    { id: 'cost', label: 'Cost', icon: Coins },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'operators', label: 'Operators', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-cream overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-sage/10 flex flex-col shadow-xl z-20">
        <div className="p-8">
          <h1 className="text-2xl font-serif text-sage font-bold tracking-widest uppercase">Yarey</h1>
          <p className="text-[10px] tracking-[0.2em] text-sage-dark font-medium mt-1 uppercase">Spa & Wellness Phuket</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-sage text-white shadow-lg shadow-sage/30 translate-x-1' 
                : 'text-sage hover:bg-sage/5'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-sage'} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-20 bg-white border-b border-sage/10 flex items-center justify-between px-8 z-10 shrink-0">
          <h2 className="text-xl font-serif text-charcoal font-semibold capitalize">{activeTab}</h2>
          <button 
            onClick={() => {
              setEditingBooking(null);
              setIsBookingModalOpen(true);
            }}
            className="bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus size={18} /> New Booking
          </button>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard 
              bookings={bookings} 
              staff={staff} 
              services={services} 
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}
          {activeTab === 'analytics' && <AnalyticsTab bookings={bookings} services={services} staff={staff} />}
          {activeTab === 'revenue' && <RevenueTab bookings={bookings} services={services} operators={operators} />}
          {activeTab === 'cost' && (
            <CostManagementTab 
              bookings={bookings} 
              services={services} 
              staff={staff}
              inHouseHourlyRate={inHouseHourlyRate}
              outsourceHourlyRate={outsourceHourlyRate}
              onInHouseRateChange={setInHouseHourlyRate}
              onOutsourceRateChange={setOutsourceHourlyRate}
              serviceCosts={serviceCosts}
              onSaveCosts={setServiceCosts}
            />
          )}
          {activeTab === 'services' && <ServicesTab services={services} onAdd={() => setIsServiceModalOpen(true)} onEdit={openEditService} onDelete={initiateDeleteService} />}
          {activeTab === 'staff' && <StaffTab staff={staff} onAdd={() => setIsStaffModalOpen(true)} onEdit={(m) => {setEditingStaff(m); setIsStaffModalOpen(true);}} onDelete={(m) => {setStaff(staff.filter(s => s.id !== m.id))}} />}
          {activeTab === 'operators' && <OperatorsTab operators={operators} onAdd={() => setIsOperatorModalOpen(true)} onEdit={(o) => {setEditingOperator(o); setIsOperatorModalOpen(true);}} onDelete={(o) => setOperators(operators.filter(op => op.id !== o.id))} onSettle={handleSettleOperator} />}
        </div>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        services={services} 
        staff={staff} 
        operators={operators} 
        onSave={handleSaveBookings}
        bookingToEdit={editingBooking}
      />
      <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSave={handleSaveService} serviceToEdit={editingService} />
      <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={handleSaveStaff} staffToEdit={editingStaff} />
      <OperatorModal isOpen={isOperatorModalOpen} onClose={() => setIsOperatorModalOpen(false)} onSave={handleSaveOperator} operatorToEdit={editingOperator} />
      <ConfirmModal isOpen={confirmDelete.isOpen} title={confirmDelete.title} message={confirmDelete.message} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={confirmDelete.onConfirm} confirmLabel="Confirm" />
    </div>
  );
};

export default App;