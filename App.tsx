import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Settings, Plus, Activity, ShoppingBag, PieChart, Menu, Trash2, AlertTriangle, RotateCcw, BarChart3, X, ChevronRight } from 'lucide-react';
import { db } from './firebase';

import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';

import ServicesTab from './components/ServicesTab';
import StaffTab from './components/StaffTab';
import SalesTab from './components/SalesTab';
import BusinessHealthTab from './components/BusinessHealthTab';
import YieldIntelligenceTab from './components/YieldIntelligenceTab';
import AnalyticsTab from './components/AnalyticsTab';
import BookingModal from './components/BookingModal';
import ServiceModal from './components/ServiceModal';
import StaffModal from './components/StaffModal';
import SalesModal from './components/SalesModal';
import ConfirmModal from './components/ConfirmModal';
import { Service, Staff, Booking, Salesperson } from './types';

export type Language = 'en' | 'th';

const TRANSLATIONS = {
  en: {
    brand: 'Yarey',
    tagline: 'Spa Phuket',
    newBooking: 'New Booking',
    resetTitle: 'System Reset',
    resetDesc: 'Wipe all database records (Bookings, Services, Staff, Partners). This cannot be undone.',
    resetBtn: 'Perform Factory Reset',
    menu: 'Executive Menu',
    nav: {
      health: 'Dashboard',
      intelligence: 'Ledger',
      analytics: 'Analytics',
      services: 'Treatments',
      staff: 'Therapists',
      sales: 'Partners',
      settings: 'Settings',
    },
  },
  th: {
    brand: 'ยาเรย์',
    tagline: 'สปา & เวลเนส ภูเก็ต',
    newBooking: 'จองบริการใหม่',
    resetTitle: 'รีเซ็ตระบบพื้นฐาน',
    resetDesc: 'ลบข้อมูลทั้งหมดในฐานข้อมูล ข้อมูลที่ลบแล้วไม่สามารถเรียกคืนได้',
    resetBtn: 'ยืนยันการล้างข้อมูลทั้งหมด',
    menu: 'เมนูผู้บริหาร',
    nav: {
      health: 'วิเคราะห์ธุรกิจ',
      intelligence: 'บันทึกรายได้',
      analytics: 'รายงานกราฟ',
      services: 'เมนูบริการ',
      staff: 'ทีมพนักงาน',
      sales: 'พาร์ทเนอร์',
      settings: 'ตั้งค่าระบบ',
    },
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('health');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('yarey_lang') as Language) || 'en';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [monthlyGoal, setMonthlyGoal] = useState<number>(150000);
  const [inHouseHourlyRate, setInHouseHourlyRate] = useState(250);
  const [outsourceHourlyRate, setOutsourceHourlyRate] = useState(400);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingSalesperson, setEditingSalesperson] = useState<Salesperson | null>(null);

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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('yarey_lang', language);
  }, [language]);

  useEffect(() => {
    // Safety check for DB initialization
    if (!db) return;

    const unsubGoal = onSnapshot(doc(db, 'settings', 'business_goals'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(db, 'settings', 'business_goals'), { monthlyGoal: 150000 });
        } catch (e) { console.error(e); }
      } else {
        const data = snapshot.data();
        if (data && typeof data.monthlyGoal === 'number') {
          setMonthlyGoal(data.monthlyGoal);
        }
      }
    });

    const unsubRates = onSnapshot(doc(db, 'settings', 'rates'), async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(doc(db, 'settings', 'rates'), { inHouseRate: 250, outsourceRate: 400 });
        } catch (e) { console.error(e); }
      } else {
        const data = snapshot.data();
        if (data) {
          setInHouseHourlyRate(data.inHouseRate ?? 250);
          setOutsourceHourlyRate(data.outsourceRate ?? 400);
        }
      }
    });

    return () => {
      unsubGoal();
      unsubRates();
    };
  }, []);

  useEffect(() => {
    if (!db) return;

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(d => ({ ...d.data(), id: d.id, totalUnitCost: d.data().totalUnitCost ?? 0 } as Service)));
    });
    
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Staff)));
    });

    const unsubSales = onSnapshot(collection(db, 'salespersons'), (snapshot) => {
      if (snapshot.empty) {
        addDoc(collection(db, 'salespersons'), { name: 'Direct/Walk-in', commission_rate: 0, color_code: '#7D8461' });
      }
      setSalespersons(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Salesperson)));
    });

    const unsubBookings = onSnapshot(query(collection(db, 'bookings'), orderBy('date', 'desc')), (snapshot) => {
      setBookings(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Booking)));
    });

    return () => {
      unsubServices();
      unsubStaff();
      unsubSales();
      unsubBookings();
    };
  }, []);

  const handleSaveBookings = async (newBookings: Omit<Booking, 'id'>[], editId?: string) => {
    if (!db) return;
    try {
      if (editId) {
        const b = newBookings[0];
        const service = services.find(s => s.id === b.service_id);
        const salesperson = salespersons.find(s => s.id === b.salesperson_id);
        const commission = (service?.price || 0) * ((salesperson?.commission_rate || 0) / 100);
        await updateDoc(doc(db, 'bookings', editId), JSON.parse(JSON.stringify({ ...b, sales_commission: commission })));
      } else {
        for (const b of newBookings) {
          const service = services.find(s => s.id === b.service_id);
          const salesperson = salespersons.find(s => s.id === b.salesperson_id);
          const commission = (service?.price || 0) * ((salesperson?.commission_rate || 0) / 100);
          await addDoc(collection(db, 'bookings'), JSON.parse(JSON.stringify({ ...b, payment_status: b.payment_status || 'Pending', sales_commission: commission })));
        }
      }
    } catch (e) { console.error(e); }
    setEditingBooking(null);
  };

  const handleSaveService = async (service: Service | Omit<Service, 'id'>) => {
    if (!db) {
        console.error("Firestore not initialized");
        return;
    }
    try {
        const cleanPayload = JSON.parse(JSON.stringify(service));
        
        if ('id' in service && service.id) {
            await updateDoc(doc(db, 'services', service.id), cleanPayload);
        } else {
            await addDoc(collection(db, 'services'), cleanPayload);
        }
        
        setEditingService(null);
        setIsServiceModalOpen(false);
    } catch (e) { 
        console.error("Error saving service", e); 
    }
  };

  const handleSaveStaff = async (member: Staff | Omit<Staff, 'id'>) => {
    if (!db) {
      console.error("Firestore not initialized");
      return;
    }

    try {
      const cleanPayload = JSON.parse(JSON.stringify(member)); 
      
      if ('id' in member && member.id) {
        await updateDoc(doc(db, 'staff', member.id), cleanPayload);
      } else {
        await addDoc(collection(db, 'staff'), cleanPayload);
      }
      
      setEditingStaff(null);
      setIsStaffModalOpen(false);
    } catch (e) {
      console.error("Error saving staff:", e);
    }
  };

  const handleSaveSalesperson = async (salesperson: Salesperson | Omit<Salesperson, 'id'>) => {
    if (!db) {
      console.error("Firestore not initialized");
      return;
    }

    try {
      const cleanPayload = JSON.parse(JSON.stringify(salesperson));
      
      if ('id' in salesperson && salesperson.id) {
        await updateDoc(doc(db, 'salespersons', salesperson.id), cleanPayload);
      } else {
        await addDoc(collection(db, 'salespersons'), cleanPayload);
      }
      
      setEditingSalesperson(null);
      setIsSalesModalOpen(false);
    } catch (e) {
      console.error("Error saving salesperson:", e);
    }
  };

  const handleGoalUpdate = async (newGoal: number) => {
    setMonthlyGoal(newGoal);
    if (!db) return;
    try {
      await setDoc(doc(db, 'settings', 'business_goals'), { monthlyGoal: newGoal }, { merge: true });
    } catch (e) { console.error("Error updating goal:", e); }
  };

  const navItems = [
    { id: 'health', label: t.nav.health, icon: Activity },
    { id: 'intelligence', label: t.nav.intelligence, icon: PieChart },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'services', label: t.nav.services, icon: Briefcase },
    { id: 'staff', label: t.nav.staff, icon: Users },
    { id: 'sales', label: t.nav.sales, icon: ShoppingBag },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const onEditBookingHandler = (b: Booking) => {
    setEditingBooking(b);
    setIsBookingModalOpen(true);
  };

  const onDeleteBookingHandler = (b: Booking) => {
    setConfirmDelete({
      isOpen: true,
      title: language === 'en' ? "Cancel Appointment" : "ยกเลิกรายการจอง",
      message: language === 'en' ? `Are you sure you want to delete this booking for ${b.guest_name}?` : `คุณแน่ใจหรือไม่ที่จะลบการนัดหมายของคุณ ${b.guest_name}?`,
      onConfirm: () => deleteDoc(doc(db, 'bookings', b.id))
    });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-cream overflow-hidden font-sans safe-area-pl safe-area-pr safe-area-pt">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-20 lg:w-72 bg-white/40 backdrop-blur-xl border-r border-sage-100 flex flex-col z-20 shrink-0">
          <div className="p-8 lg:p-10 flex flex-col items-center lg:items-start">
            <h1 className="text-3xl lg:text-4xl font-serif text-sage font-bold tracking-tighter uppercase">{t.brand}</h1>
            <p className="hidden lg:block text-[10px] tracking-[0.4em] text-gold font-bold mt-1 uppercase opacity-80">{t.tagline}</p>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all duration-500 ${
                  activeTab === item.id 
                  ? 'bg-sage text-white shadow-premium' 
                  : 'text-sage/60 hover:bg-sage-50 hover:text-sage'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-sage/60'} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="hidden lg:block font-bold text-xs uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Header */}
        <header className="h-20 bg-white/30 backdrop-blur-md border-b border-sage-100 flex items-center justify-between px-6 md:px-10 z-20 shrink-0">
          <div className="flex items-center gap-4">
             {isMobile && <h1 className="text-2xl font-serif text-sage font-bold tracking-tight uppercase">{t.brand}</h1>}
             {!isMobile && <h2 className="text-sm font-bold text-sage uppercase tracking-[0.3em] truncate opacity-40">
              {navItems.find(n => n.id === activeTab)?.label || activeTab}
            </h2>}
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl border border-sage-100">
              <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-sage text-white shadow-sm' : 'text-sage/30'}`}>EN</button>
              <button onClick={() => setLanguage('th')} className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${language === 'th' ? 'bg-sage text-white shadow-sm' : 'text-sage/30'}`}>TH</button>
            </div>
            <button 
              onClick={() => { setEditingBooking(null); setIsBookingModalOpen(true); }}
              className="bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-premium transition-all active:scale-95"
            >
              <Plus size={16} strokeWidth={3} /> <span>{t.newBooking}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className={`flex-1 relative overflow-hidden ${isMobile ? 'pb-20' : ''}`}>
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
            {activeTab === 'health' && <BusinessHealthTab bookings={bookings} services={services} staff={staff} salespersons={salespersons} language={language} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} monthlyRevenueGoal={monthlyGoal} onGoalUpdate={handleGoalUpdate} onEditBooking={onEditBookingHandler} onDeleteBooking={onDeleteBookingHandler} />}
            {activeTab === 'intelligence' && <YieldIntelligenceTab bookings={bookings} services={services} staff={staff} salespersons={salespersons} monthlyRevenueGoal={monthlyGoal} onGoalUpdate={handleGoalUpdate} language={language} onEditBooking={onEditBookingHandler} onDeleteBooking={onDeleteBookingHandler} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} />}
            {activeTab === 'analytics' && <AnalyticsTab bookings={bookings} services={services} staff={staff} language={language} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} />}
            
            {activeTab === 'services' && (
                <ServicesTab 
                    services={services} 
                    language={language} 
                    onAdd={() => {
                        setEditingService(null);
                        setIsServiceModalOpen(true);
                    }} 
                    onEdit={(s) => {
                        setEditingService(s);
                        setIsServiceModalOpen(true);
                    }} 
                    onDelete={(s) => setConfirmDelete({ 
                        isOpen: true, 
                        title: "ลบเมนูบริการ", 
                        message: `ต้องการลบรายการ ${s.name}?`, 
                        onConfirm: () => deleteDoc(doc(db, 'services', s.id))
                    })} 
                    inHouseHourlyRate={inHouseHourlyRate} 
                    outsourceHourlyRate={outsourceHourlyRate} 
                    onLaborRateChange={setOutsourceHourlyRate} 
                />
            )}
            
            {activeTab === 'staff' && (
                <StaffTab 
                    staff={staff} 
                    language={language} 
                    onAdd={() => {
                      setEditingStaff(null);
                      setIsStaffModalOpen(true);
                    }} 
                    onEdit={(m) => {
                      setEditingStaff(m);
                      setIsStaffModalOpen(true);
                    }} 
                    onDelete={(m) => setConfirmDelete({ 
                      isOpen: true, 
                      title: "ลบรายชื่อพนักงาน", 
                      message: `ยืนยันการลบชื่อคุณ ${m.name}?`, 
                      onConfirm: () => deleteDoc(doc(db, 'staff', m.id))
                    })} 
                />
            )}
            
            {activeTab === 'sales' && (
                <SalesTab 
                    salespersons={salespersons} 
                    language={language} 
                    onAdd={() => {
                        setEditingSalesperson(null);
                        setIsSalesModalOpen(true);
                    }} 
                    onEdit={(s) => {
                        setEditingSalesperson(s);
                        setIsSalesModalOpen(true);
                    }} 
                    onDelete={(s) => setConfirmDelete({ 
                        isOpen: true, 
                        title: "ลบรายชื่อพาร์ทเนอร์", 
                        message: `ลบรายชื่อคุณ ${s.name}?`, 
                        onConfirm: () => deleteDoc(doc(db, 'salespersons', s.id))
                    })} 
                />
            )}
            
            {activeTab === 'settings' && (
              <div className="p-8 max-w-2xl mx-auto space-y-10">
                <div className="bg-white p-10 rounded-[2.5rem] border border-sage-100 shadow-premium">
                  <h3 className="text-2xl font-serif font-bold text-charcoal mb-4 flex items-center gap-3">
                    <AlertTriangle className="text-gold" size={24} /> {t.resetTitle}
                  </h3>
                  <p className="text-sm text-sage/60 mb-8 leading-relaxed font-medium">
                    {t.resetDesc}
                  </p>
                  <button 
                    onClick={() => {}}
                    className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    <RotateCcw size={16} /> {t.resetBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-sage-100 flex items-center justify-around h-24 safe-area-pb z-30 shadow-2xl">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`flex flex-col items-center justify-center w-full h-full gap-2 transition-all ${activeTab === item.id ? 'text-sage' : 'text-sage/30'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-sage-50 shadow-inner' : ''}`}>
                  <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                </div>
                <span className="text-[8px] uppercase tracking-widest font-black">{item.label}</span>
              </button>
            ))}
            <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className={`flex flex-col items-center justify-center w-full h-full gap-2 transition-all ${isMobileMenuOpen ? 'text-sage' : 'text-sage/30'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${isMobileMenuOpen ? 'bg-sage-50' : ''}`}>
                <Menu size={22} />
              </div>
              <span className="text-[8px] uppercase tracking-widest font-black">Menu</span>
            </button>
          </nav>
        )}
      </main>

      {/* Modals with Updated Theming */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} services={services} staff={staff} salespersons={salespersons} language={language} onSave={handleSaveBookings} bookingToEdit={editingBooking} />
      
      <ServiceModal 
        isOpen={isServiceModalOpen} 
        onClose={() => {
            setIsServiceModalOpen(false);
            setEditingService(null);
        }} 
        onSave={handleSaveService} 
        serviceToEdit={editingService} 
      />
      
      <StaffModal 
        isOpen={isStaffModalOpen} 
        onClose={() => { 
          setIsStaffModalOpen(false); 
          setEditingStaff(null); 
        }} 
        onSave={handleSaveStaff} 
        staffToEdit={editingStaff} 
      />
      
      <SalesModal 
        isOpen={isSalesModalOpen} 
        onClose={() => {
            setIsSalesModalOpen(false);
            setEditingSalesperson(null);
        }} 
        onSave={handleSaveSalesperson} 
        salespersonToEdit={editingSalesperson} 
      />
      
      <ConfirmModal isOpen={confirmDelete.isOpen} title={confirmDelete.title} message={confirmDelete.message} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={confirmDelete.onConfirm} />
    </div>
  );
};

export default App;