
import React, { useState, useEffect } from 'react';
import { Calendar, Users, Briefcase, Settings, Plus, Activity, ShoppingBag, PieChart, Menu, Trash2, AlertTriangle, RotateCcw, BarChart3 } from 'lucide-react';
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

import Dashboard from './components/Dashboard';
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
    nav: {
      dashboard: 'Timeline',
      health: 'Health',
      intelligence: 'Ledger',
      analytics: 'Analytics',
      services: 'Services',
      staff: 'Staff',
      sales: 'Sales',
      settings: 'Settings',
    },
  },
  th: {
    brand: 'ยาเรย์',
    tagline: 'สปา & เวลเนส ภูเก็ต',
    newBooking: 'จองบริการใหม่',
    resetTitle: 'รีเซ็ตระบบพื้นฐาน',
    resetDesc: 'ลบข้อมูลทั้งหมดในฐานข้อมูล (รายการจอง, เมนูบริการ, รายชื่อพนักงาน, พาร์ทเนอร์) ข้อมูลที่ลบแล้วไม่สามารถเรียกคืนได้',
    resetBtn: 'ยืนยันการล้างข้อมูลทั้งหมด',
    nav: {
      dashboard: 'ตารางเวลาจอง',
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('yarey_lang') as Language) || 'en';
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
    const unsubGoal = onSnapshot(doc(db, 'settings', 'business_goals'), async (snapshot) => {
      if (!snapshot.exists()) {
        await setDoc(doc(db, 'settings', 'business_goals'), { monthlyGoal: 150000 });
      } else {
        const data = snapshot.data();
        if (data && typeof data.monthlyGoal === 'number') {
          setMonthlyGoal(data.monthlyGoal);
        }
      }
    });

    const unsubRates = onSnapshot(doc(db, 'settings', 'rates'), async (snapshot) => {
      if (!snapshot.exists()) {
        await setDoc(doc(db, 'settings', 'rates'), { inHouseRate: 250, outsourceRate: 400 });
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

  const updateSalesGoal = async (newGoal: number) => {
    try {
      await setDoc(doc(db, 'settings', 'business_goals'), { monthlyGoal: newGoal }, { merge: true });
    } catch (e) { console.error("Update Goal Error:", e); }
  };

  const updateLaborRates = async (inHouse: number, outsource: number) => {
    try {
      await setDoc(doc(db, 'settings', 'rates'), { inHouseRate: inHouse, outsourceRate: outsource }, { merge: true });
    } catch (e) { console.error("Update Rates Error:", e); }
  };

  useEffect(() => {
    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      setServices(snapshot.docs.map(d => ({ ...d.data(), id: d.id, totalUnitCost: d.data().totalUnitCost ?? 0 } as Service)));
    });
    
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      setStaff(snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Staff)));
    });

    const unsubSales = onSnapshot(collection(db, 'salespersons'), (snapshot) => {
      if (snapshot.empty) {
        addDoc(collection(db, 'salespersons'), { name: 'Direct/Walk-in', commission_rate: 0, color_code: '#8F9779' });
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

  const handleSystemReset = async () => {
    setConfirmDelete({
      isOpen: true,
      title: language === 'en' ? 'Factory Reset System' : 'รีเซ็ตระบบเป็นค่าเริ่มต้น',
      message: language === 'en' ? 'This will PERMANENTLY delete all your bookings, staff, services and sales data. This is intended to clear mock data. Are you sure?' : 'การดำเนินการนี้จะลบข้อมูลการจอง พนักงาน บริการ และทีมขายทั้งหมดอย่างถาวร คุณแน่ใจใช่หรือไม่ที่จะล้างฐานข้อมูลระบบทั้งหมด?',
      onConfirm: async () => {
        try {
          const collectionsToClear = ['bookings', 'services', 'staff', 'salespersons'];
          for (const collName of collectionsToClear) {
            const snapshot = await getDocs(collection(db, collName));
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
          }
          alert(language === 'en' ? 'System Reset Successful' : 'รีเซ็ตระบบสำเร็จแล้ว');
          setActiveTab('dashboard');
        } catch (error) {
          console.error("Reset Failed:", error);
          alert("Reset failed. Check console for details.");
        }
      }
    });
  };

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: Calendar },
    { id: 'health', label: t.nav.health, icon: Activity },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'intelligence', label: t.nav.intelligence, icon: PieChart },
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
        <aside className="w-20 lg:w-72 bg-white border-r border-sage/10 flex flex-col shadow-xl z-20 shrink-0">
          <div className="p-4 lg:p-8 flex flex-col items-center lg:items-start">
            <h1 className="text-xl lg:text-2xl font-serif text-sage font-bold tracking-widest uppercase truncate">{t.brand}</h1>
            <p className="hidden lg:block text-[10px] tracking-[0.2em] text-sage-dark font-medium mt-1 uppercase truncate">{t.tagline}</p>
          </div>
          <nav className="flex-1 px-2 lg:px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 lg:py-4 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id 
                  ? 'bg-sage text-white shadow-lg shadow-sage/30' 
                  : 'text-sage hover:bg-sage/5'
                }`}
                title={item.label}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'text-sage'} />
                <span className="hidden lg:block font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-full">
        {/* Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-sage/10 flex items-center justify-between px-4 md:px-8 z-20 shrink-0">
          <div className="flex items-center gap-3">
             {isMobile && <h1 className="text-lg font-serif text-sage font-bold tracking-widest uppercase">{t.brand}</h1>}
             {!isMobile && <h2 className="text-lg md:text-xl font-serif text-charcoal font-semibold capitalize truncate">
              {navItems.find(n => n.id === activeTab)?.label || activeTab}
            </h2>}
          </div>
          
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-1 bg-cream/50 p-1 rounded-xl border border-sage/10">
              <button onClick={() => setLanguage('en')} className={`px-2 md:px-3 py-1 rounded-lg text-[9px] font-bold transition-all ${language === 'en' ? 'bg-sage text-white shadow-sm' : 'text-sage/40'}`}>EN</button>
              <button onClick={() => setLanguage('th')} className={`px-2 md:px-3 py-1 rounded-lg text-[9px] font-bold transition-all ${language === 'th' ? 'bg-sage text-white shadow-sm' : 'text-sage/40'}`}>TH</button>
            </div>
            <button 
              onClick={() => { setEditingBooking(null); setIsBookingModalOpen(true); }}
              className="bg-sage hover:bg-sage-dark text-white px-3 md:px-5 py-2 rounded-xl font-bold text-[10px] md:text-xs flex items-center gap-2 shadow-lg transition-all h-9 md:h-11 active:scale-95"
            >
              <Plus size={16} /> <span className="hidden xs:inline">{t.newBooking}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        <div className={`flex-1 relative overflow-hidden ${isMobile ? 'pb-24' : ''}`}>
          <div className="absolute inset-0 overflow-y-auto scrollbar-hide pb-20 md:pb-0">
            {activeTab === 'dashboard' && <Dashboard bookings={bookings} staff={staff} services={services} salespersons={salespersons} language={language} onEditBooking={onEditBookingHandler} onDeleteBooking={onDeleteBookingHandler} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} />}
            {activeTab === 'health' && <BusinessHealthTab bookings={bookings} services={services} staff={staff} salespersons={salespersons} language={language} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} monthlyRevenueGoal={monthlyGoal} onGoalUpdate={updateSalesGoal} />}
            {activeTab === 'intelligence' && <YieldIntelligenceTab bookings={bookings} services={services} staff={staff} salespersons={salespersons} monthlyRevenueGoal={monthlyGoal} onGoalUpdate={updateSalesGoal} language={language} onEditBooking={onEditBookingHandler} onDeleteBooking={onDeleteBookingHandler} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} />}
            {activeTab === 'analytics' && <AnalyticsTab bookings={bookings} services={services} staff={staff} language={language} inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} />}
            {activeTab === 'services' && (
              <ServicesTab 
                services={services} language={language} onAdd={() => setIsServiceModalOpen(true)} 
                onEdit={(s) => {setEditingService(s); setIsServiceModalOpen(true);}} 
                onDelete={(s) => setConfirmDelete({ isOpen: true, title: "ลบเมนูบริการ", message: `ต้องการลบรายการ ${s.name}?`, onConfirm: () => deleteDoc(doc(db, 'services', s.id))})}
                inHouseHourlyRate={inHouseHourlyRate} outsourceHourlyRate={outsourceHourlyRate} onLaborRateChange={updateLaborRates}
              />
            )}
            {activeTab === 'staff' && <StaffTab staff={staff} language={language} onAdd={() => setIsStaffModalOpen(true)} onEdit={(m) => {setEditingStaff(m); setIsStaffModalOpen(true);}} onDelete={(m) => setConfirmDelete({ isOpen: true, title: "ลบรายชื่อพนักงาน", message: `ยืนยันการลบชื่อคุณ ${m.name}?`, onConfirm: () => deleteDoc(doc(db, 'staff', m.id))})} />}
            {activeTab === 'sales' && <SalesTab salespersons={salespersons} language={language} onAdd={() => setIsSalesModalOpen(true)} onEdit={(s) => {setEditingSalesperson(s); setIsSalesModalOpen(true);}} onDelete={(s) => setConfirmDelete({ isOpen: true, title: "ลบรายชื่อพาร์ทเนอร์", message: `ลบรายชื่อคุณ ${s.name}?`, onConfirm: () => deleteDoc(doc(db, 'salespersons', s.id))})} />}
            {activeTab === 'settings' && (
              <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 md:space-y-8">
                <div className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-sage/10 shadow-lg">
                  <h3 className="text-lg md:text-xl font-serif font-bold text-charcoal mb-3 flex items-center gap-3">
                    <AlertTriangle className="text-red-500" size={20} /> {t.resetTitle}
                  </h3>
                  <p className="text-xs md:text-sm text-sage mb-6 leading-relaxed">
                    {t.resetDesc}
                  </p>
                  <button 
                    onClick={handleSystemReset}
                    className="w-full flex items-center justify-center gap-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3.5 rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    <RotateCcw size={16} /> {t.resetBtn}
                  </button>
                </div>
                <div className="text-center text-sage/40 text-[8px] md:text-[10px] uppercase tracking-[0.3em]">
                  Yarey Spa Management v2.2.0 • Premium Edition
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-sage/10 flex items-center justify-around h-20 safe-area-pb z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90 ${activeTab === item.id ? 'text-sage font-bold' : 'text-gray-400'}`}
              >
                <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-sage/10' : ''}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-[8px] md:text-[9px] uppercase tracking-tighter font-bold">{item.label}</span>
              </button>
            ))}
            <button
               onClick={() => setActiveTab('settings')}
               className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90 ${activeTab === 'settings' ? 'text-sage font-bold' : 'text-gray-400'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-sage/10' : ''}`}>
                <Menu size={20} />
              </div>
              <span className="text-[8px] md:text-[9px] uppercase tracking-tighter font-bold">More</span>
            </button>
          </nav>
        )}
      </main>

      {/* Modals */}
      <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} services={services} staff={staff} salespersons={salespersons} language={language} onSave={handleSaveBookings} bookingToEdit={editingBooking} />
      <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSave={(s) => { const clean = JSON.parse(JSON.stringify(s)); if ('id' in clean) { const {id, ...data} = clean; updateDoc(doc(db, 'services', id), data); } else { addDoc(collection(db, 'services'), clean); } setEditingService(null); }} serviceToEdit={editingService} />
      <StaffModal isOpen={isStaffModalOpen} onClose={() => setIsStaffModalOpen(false)} onSave={(m) => { const clean = JSON.parse(JSON.stringify(m)); if ('id' in clean) { const {id, ...data} = clean; updateDoc(doc(db, 'staff', id), data); } else { addDoc(collection(db, 'staff'), clean); } setEditingStaff(null); }} staffToEdit={editingStaff} />
      <SalesModal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} onSave={(s) => { const clean = JSON.parse(JSON.stringify(s)); if ('id' in clean) { const {id, ...data} = clean; updateDoc(doc(db, 'salespersons', id), data); } else { addDoc(collection(db, 'salespersons'), clean); } setEditingSalesperson(null); }} salespersonToEdit={editingSalesperson} />
      <ConfirmModal isOpen={confirmDelete.isOpen} title={confirmDelete.title} message={confirmDelete.message} onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })} onConfirm={confirmDelete.onConfirm} confirmLabel={language === 'en' ? "Confirm" : "ยืนยันการทำรายการ"} />
    </div>
  );
};

export default App;
