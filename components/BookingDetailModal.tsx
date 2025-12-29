
import React from 'react';
import { X, Globe, Clock, User, Briefcase, DollarSign, Activity, CreditCard, Wallet, ShoppingBag, ArrowRight } from 'lucide-react';
import { Booking, Service, Staff, Salesperson } from '../types';
import { Language } from '../App';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  service: Service | null;
  staffMember: Staff | null;
  salesperson: Salesperson | null;
  inHouseHourlyRate: number;
  outsourceHourlyRate: number;
  language: Language;
}

const TRANSLATIONS = {
  en: {
    title: 'Session Insight',
    guest: 'Guest',
    treatment: 'Treatment',
    economics: 'Unit Economics',
    revenue: 'Revenue',
    overhead: 'Overhead',
    labor: 'Labor',
    profit: 'Net Profit',
    margin: 'Margin',
    therapist: 'Staff',
    agent: 'Referral',
    payment: 'Payment',
    close: 'Done'
  },
  th: {
    title: 'สรุปข้อมูลเซสชัน',
    guest: 'ลูกค้า',
    treatment: 'บริการ',
    economics: 'วิเคราะห์ต้นทุน',
    revenue: 'ยอดรวมบริการ',
    overhead: 'ต้นทุนวัสดุ',
    labor: 'ต้นทุนค่าแรง',
    profit: 'กำไรสุทธิ',
    margin: 'อัตรากำไร (%)',
    therapist: 'เทอราปิส',
    agent: 'ผู้แนะนำ',
    payment: 'ชำระเงิน',
    close: 'ปิดหน้าต่าง'
  }
};

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  isOpen,
  onClose,
  booking,
  service,
  staffMember,
  salesperson,
  inHouseHourlyRate,
  outsourceHourlyRate,
  language
}) => {
  if (!isOpen || !booking || !service) return null;

  const t = TRANSLATIONS[language];
  
  // Financial Logic
  const isOutsource = booking.staff_id === 'OUTSOURCE' || staffMember?.is_outsource === true;
  const laborRate = isOutsource ? outsourceHourlyRate : inHouseHourlyRate;
  const laborCost = (service.duration / 60) * laborRate;
  const unitCost = service.totalUnitCost || 0;
  const revenue = service.price;
  const netProfit = revenue - unitCost - laborCost;
  const margin = (netProfit / revenue) * 100;
  const isProfitable = netProfit > 0;

  return (
    <div className="fixed inset-0 bg-charcoal/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-sage/10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-sage/5 flex justify-between items-center bg-cream/50">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-sage" />
            <span className="text-xs font-bold text-sage uppercase tracking-widest">{t.title}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-sage/10 rounded-full transition-colors">
            <X size={18} className="text-charcoal/40" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Guest & Service Summary */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-lg font-serif font-bold text-charcoal">{booking.guest_name}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-sage/10 text-sage px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">
                  <Globe size={10} className="inline mr-1" /> {booking.nationality}
                </span>
                <span className="text-[10px] text-sage font-bold uppercase tracking-tight">
                  <Clock size={10} className="inline mr-1" /> {booking.start_time}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-charcoal">{service.name}</p>
              <p className="text-[10px] text-sage/60 font-bold uppercase">{service.duration} mins</p>
            </div>
          </div>

          {/* Economic Breakdown - Compact Row */}
          <div className="bg-cream/50 p-4 rounded-2xl border border-sage/10">
            <p className="text-[9px] font-bold text-sage uppercase tracking-widest mb-3">{t.economics}</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold text-sage/40 uppercase">{t.revenue}</p>
                <p className="text-xs font-bold text-charcoal">฿{revenue.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold text-sage/40 uppercase">{t.overhead}</p>
                <p className="text-xs font-bold text-red-400">฿{unitCost.toLocaleString()}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold text-sage/40 uppercase">{t.labor}</p>
                <p className="text-xs font-bold text-red-400">฿{laborCost.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Net Profit Banner - Compact */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${isProfitable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <div>
              <p className={`text-[8px] font-bold uppercase tracking-widest mb-0.5 ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>{t.profit}</p>
              <p className={`text-2xl font-serif font-bold ${isProfitable ? 'text-green-900' : 'text-red-900'}`}>
                ฿{Math.abs(netProfit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-bold text-charcoal/30 uppercase mb-0.5">{t.margin}</p>
              <p className={`text-sm font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {margin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Operational Details - Simple Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage/5 rounded-lg flex items-center justify-center text-sage">
                <User size={14} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-sage/50 uppercase">{t.therapist}</p>
                <p className="text-[10px] font-bold text-charcoal truncate">{staffMember?.name || (isOutsource ? (language === 'en' ? 'Part-time' : 'พนักงานชั่วคราว') : (language === 'en' ? 'Staff' : 'พนักงานประจำ'))}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage/5 rounded-lg flex items-center justify-center text-sage">
                <Wallet size={14} />
              </div>
              <div>
                <p className="text-[8px] font-bold text-sage/50 uppercase">{t.payment}</p>
                <p className="text-[10px] font-bold text-charcoal">{booking.payment_type === 'Cash' ? 'เงินสด' : 'บัตร/โอน'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-sage/5 border-t border-sage/5 text-center">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-sage hover:bg-sage-dark text-white rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all active:scale-[0.98]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
