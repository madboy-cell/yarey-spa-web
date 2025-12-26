
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Briefcase, Settings, ChevronRight, Plus, BarChart3, LineChart, Coins, Activity, Globe, PieChart } from 'lucide-react';
import { db } from './firebase';

// Consolidate Firestore imports to resolve named export errors reported at these line positions
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

import Dashboard from './components/Dashboard';
import ServicesTab from './components/ServicesTab';
import StaffTab from './components/StaffTab';
import RevenueTab from './components/RevenueTab';
import CostManagementTab from './components/CostManagementTab';
import BusinessHealthTab from './components/BusinessHealthTab';
import AnalyticsTab from './components/AnalyticsTab';
import BookingModal from './components/BookingModal';
import ServiceModal from './components/ServiceModal';
import StaffModal from './components/StaffModal';
import ConfirmModal from './components/ConfirmModal';
import { Service, Staff, Booking, ServiceCost } from './types';
import { INITIAL_SERVICE_COSTS } from './constants';

export type Language = 'en' | 'th';

const TRANSLATIONS = {
  en: {
    brand: 'Yarey',
    tagline: 'Spa & Wellness Phuket',
    newBooking: 'New Booking',
    nav: {
      dashboard: 'Timeline Desk',
      health: 'Business Health',
      analytics: 'Yield Analytics',
      revenue: 'Revenue Ledger',
      cost: 'Cost Architecture',
      services: 'Treatment Menu',
      staff: 'Staff Directory',
      settings: 'System Settings',
    },
  },
  th: {
    brand: 'ยาเรย์',
    tagline: 'สปา แอนด์ เวลเนส ภูเก็ต',
    newBooking: 'เพิ่มการจองใหม่',
    nav: {
      dashboard: 'ตารางเวลา',
      health: 'สุขภาพธุรกิจ',
      analytics: 'วิเคราะห์รายได้',
      revenue: 'บัญชีรายได้',
      cost: 'โครงสร้างต้นทุน',
      services: 'เมนูทรีทเมนท์',
      staff: 'รายชื่อพนักงาน',
      settings: 'ตั้งค่าระบบ',
    },
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('yarey_lang') as Language) || 'en';
  });
  
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState<number>(() => {
    const savedGoal = localStorage.getItem('yarey_revenue_goal');
    return savedGoal ? Number(savedGoal) : 450000;
  });
  
  const [inHouseHourlyRate, setInHouseHourlyRate] = useState(250);
  const [outsourceHourlyRate, setOutsourceHourlyRate] = useState(400);
  const [serviceCosts, setServiceCosts] = useState<ServiceCost[]>(INITIAL_SERVICE_COSTS);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
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

  const t = TRANSLATIONS[language];

  // PERSIST SETTINGS
  useEffect(() => {
    localStorage.setItem('yarey_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('yarey_revenue_goal', monthlyRevenueGoal.toString());
  }, [monthlyRevenueGoal]);

  // LIVE FIRESTORE SYNC
  useEffect(() => {
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Service)));
    });
    
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Staff)));
    });

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('date', 'desc')), (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Booking)));
    });

    return () => {
      unsubServices();
      unsubStaff();
      unsubBookings();
    };
  }, []);

  const handleSaveBookings = async (newBookings: Omit<Booking, 'id'>[], editId?: string) => {
    try {
      if (editId) {
        // Prepare clean object for update
        const cleanBooking = JSON.parse(JSON.stringify(newBookings[0]));
        await updateDoc(doc(db, 'bookings', editId), cleanBooking);
      } else {
        // Handle potential group bookings (modal returns an array)
        for (const b of newBookings) {
          // Flatten data and ensure payment_status default if not provided
          const cleanBooking = JSON.parse(JSON.stringify({
            ...b,
            payment_status: b.payment_status || 'Pending'
          }));
          await addDoc(collection(db, 'bookings'), cleanBooking);
        }
      }
    } catch (e) {
      console.error("FIRESTORE BOOKING SAVE ERROR: ", e);
      alert(`Failed to save booking: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    setEditingBooking(null);
  };

  const handleSaveService = async (service: Service | Omit<Service, 'id'>) => {
    try {
      const cleanService = JSON.parse(JSON.stringify(service));
      if ('id' in service) {
        const { id, ...data } = cleanService;
        await updateDoc(doc(db, 'services', id), data);
      } else {
        await addDoc(collection(db, 'services'), cleanService);
      }
    } catch (e) {
      console.error("FIRESTORE SERVICE SAVE ERROR: ", e);
    }
    setEditingService(null);
  };

  const handleSaveStaff = async (member: Staff | Omit<Staff, 'id'>) => {
    try {
      const cleanStaff = JSON.parse(JSON.stringify(member));
      if ('id' in member) {
        const { id, ...data } = cleanStaff;
        await updateDoc(doc(db, 'staff', id), data);
      } else {
        await addDoc(collection(db, 'staff'), cleanStaff);
      }
    } catch (e) {
      console.error("FIRESTORE STAFF SAVE ERROR: ", e);
    }
    setEditingStaff(null);
  };

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Calendar },
    { id: 'health', label: t.nav.health, icon: Activity },
    { id: 'analytics', label: t.nav.analytics, icon: PieChart },
    { id: 'revenue', label: t.nav.revenue, icon: BarChart3 },
    { id: 'cost', label: t.nav.cost, icon: Coins },
    { id: 'services', label: t.nav.services, icon: Briefcase },
    { id: 'staff', label: t.nav.staff, icon: Users },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-cream overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-sage/10 flex flex-col shadow-xl z-20">
        <div className="p-8">
          <h1 className="text-2xl font-serif text-sage font-bold tracking-widest uppercase">{t.brand}</h1>
          <p className="text-[10px] tracking-[0.2em] text-sage-dark font-medium mt-1 uppercase">{t.tagline}</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
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
          <h2 className="text-xl font-serif text-charcoal font-semibold capitalize">
            {navItems.find(n => n.id === activeTab)?.label || activeTab}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-cream p-1 rounded-xl border border-sage/10">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  language === 'en' ? 'bg-sage text-white shadow-sm' : 'text-sage/40 hover:text-sage'
                }`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('th')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  language === 'th' ? 'bg-sage text-white shadow-sm' : 'text-sage/40 hover:text-sage'
                }`}
              >
                ไทย
              </button>
            </div>

            <button 
              onClick={() => {
                setEditingBooking(null);
                setIsBookingModalOpen(true);
              }}
              className="bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus size={18} /> {t.newBooking}
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard 
              bookings={bookings} 
              staff={staff} 
              services={services} 
              language={language}
              onEditBooking={(b) => { setEditingBooking(b); setIsBookingModalOpen(true); }}
              onDeleteBooking={(b) => setConfirmDelete({
                isOpen: true,
                title: language === 'en' ? "Cancel Appointment" : "ยกเลิกการนัดหมาย",
                message: language === 'en' ? `Are you sure you want to delete ${b.guest_name}'s session?` : `คุณแน่ใจหรือไม่ว่าต้องการลบการนัดหมายของ ${b.guest_name}?`,
                onConfirm: () => deleteDoc(doc(db, 'bookings', b.id))
              })}
            />
          )}
          {activeTab === 'health' && (
            <BusinessHealthTab 
              bookings={bookings} 
              services={services} 
              staff={staff} 
              language={language}
              serviceCosts={serviceCosts}
              inHouseHourlyRate={inHouseHourlyRate}
              outsourceHourlyRate={outsourceHourlyRate}
              monthlyRevenueGoal={monthlyRevenueGoal}
              onGoalUpdate={setMonthlyRevenueGoal}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab 
              bookings={bookings} 
              services={services} 
              staff={staff} 
              monthlyRevenueGoal={monthlyRevenueGoal}
              onGoalUpdate={setMonthlyRevenueGoal}
            />
          )}
          {activeTab === 'revenue' && <RevenueTab bookings={bookings} services={services} language={language} />}
          {activeTab === 'cost' && (
            <CostManagementTab 
              bookings={bookings} 
              services={services} 
              staff={staff}
              language={language}
              inHouseHourlyRate={inHouseHourlyRate}
              outsourceHourlyRate={outsourceHourlyRate}
              onInHouseRateChange={setInHouseHourlyRate}
              onOutsourceRateChange={setOutsourceHourlyRate}
              serviceCosts={serviceCosts}
              onSaveCosts={setServiceCosts}
            />
          )}
          {activeTab === 'services' && <ServicesTab services={services} language={language} onAdd={() => setIsServiceModalOpen(true)} onEdit={(s) => {setEditingService(s); setIsServiceModalOpen(true);}} onDelete={(s) => setConfirmDelete({ isOpen: true, title: "Delete Treatment", message: `Delete ${s.name}?`, onConfirm: () => deleteDoc(doc(db, 'services', s.id))})} />}
          {activeTab === 'staff' && <StaffTab staff={staff} language={language} onAdd={() => setIsStaffModalOpen(true)} onEdit={(m) => {setEditingStaff(m); setIsStaffModalOpen(true);}} onDelete={(m) => setConfirmDelete({ isOpen: true, title: "Delete Staff", message: `Remove ${m.name} from directory?`, onConfirm: () => deleteDoc(doc(db, 'staff', m.id))})} />}
        </div>
      </main>

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        services={services} 
        staff={staff} 
        language={language}
        onSave={handleSaveBookings}
        bookingToEdit={editingBooking}
      />
      <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSave={handleSaveService} serviceToEdit={editingService} />
      <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={handleSaveStaff} staffToEdit={editingStaff} />
      <ConfirmModal isOpen={confirmDelete.isOpen} title={confirmDelete.title} message={confirmDelete.message} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={confirmDelete.onConfirm} confirmLabel={language === 'en' ? "Confirm" : "ยืนยัน"} />
    </div>
  );
};

export default App;
