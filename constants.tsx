
import { Service, Staff, Booking, ServiceCost } from './types';

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Traditional Thai Massage', category: 'Massage', duration: 60, price: 1200, skills_required: ['Thai Massage'] },
  { id: 's2', name: 'Aromatherapy Bliss', category: 'Massage', duration: 90, price: 2500, skills_required: ['Oil Massage'] },
  { id: 's3', name: 'Radiance Glow Facial', category: 'Facial', duration: 60, price: 1800, skills_required: ['Esthetics'] },
  { id: 's4', name: 'Andaman Sea Salt Scrub', category: 'Scrub', duration: 45, price: 1500, skills_required: ['Body Treatments'] },
  { id: 's5', name: 'Yarey Signature Package', category: 'Signature Package', duration: 150, price: 4500, skills_required: ['Thai Massage', 'Oil Massage', 'Body Treatments'] },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'st1', name: 'Lek', role: 'Senior Therapist', skills: ['Thai Massage', 'Oil Massage', 'Body Treatments'], color_code: '#8F9779', base_salary: 15000, is_outsource: false },
  { id: 'st2', name: 'Pim', role: 'Senior Therapist', skills: ['Esthetics', 'Oil Massage'], color_code: '#A7AF93', base_salary: 18000, is_outsource: false },
  { id: 'st3', name: 'Som', role: 'Therapist', skills: ['Thai Massage'], color_code: '#767E61', base_salary: 12000, is_outsource: false },
];

export const INITIAL_SERVICE_COSTS: ServiceCost[] = [
  { serviceId: 's1', cogs: 80 },
  { serviceId: 's2', cogs: 250 },
  { serviceId: 's3', cogs: 400 },
  { serviceId: 's4', cogs: 300 },
  { serviceId: 's5', cogs: 600 },
];

export const NATIONALITIES = [
  "Thailand", "China", "Russia", "United Kingdom", "Australia", 
  "USA", "Germany", "France", "South Korea", "Japan", 
  "Singapore", "India", "Other"
];

// PROGRAMMATIC MOCK DATA GENERATOR (60 SESSIONS)
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const now = new Date();
  
  // Helper for dates
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  const staffIds = ['st1', 'st2', 'st3', 'OUTSOURCE'];
  const serviceIds = ['s1', 's2', 's3', 's4', 's5'];
  const paymentTypes: ('Cash' | 'Card')[] = ['Cash', 'Card'];
  const channels: ('Walk-in' | 'Online' | 'Phone')[] = ['Walk-in', 'Online', 'Phone'];

  // Current Month Data (30 sessions)
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), Math.min(now.getDate(), i + 1));
    const startHour = 10 + Math.floor(Math.random() * 8);
    bookings.push({
      id: `cur-${i}`,
      guest_name: `Guest ${i + 1}`,
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      date: formatDate(d),
      start_time: `${String(startHour).padStart(2, '0')}:00`,
      end_time: `${String(startHour + 1).padStart(2, '0')}:00`,
      staff_id: staffIds[Math.floor(Math.random() * staffIds.length)],
      service_id: serviceIds[Math.floor(Math.random() * serviceIds.length)],
      payment_status: 'Paid',
      payment_type: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      channel: channels[Math.floor(Math.random() * channels.length)]
    });
  }

  // Previous Month Data (30 sessions)
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, (i % 28) + 1);
    const startHour = 10 + Math.floor(Math.random() * 8);
    bookings.push({
      id: `prev-${i}`,
      guest_name: `Past Guest ${i + 1}`,
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      date: formatDate(d),
      start_time: `${String(startHour).padStart(2, '0')}:00`,
      end_time: `${String(startHour + 1).padStart(2, '0')}:00`,
      staff_id: staffIds[Math.floor(Math.random() * staffIds.length)],
      service_id: serviceIds[Math.floor(Math.random() * serviceIds.length)],
      payment_status: 'Paid',
      payment_type: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      channel: channels[Math.floor(Math.random() * channels.length)]
    });
  }

  return bookings;
};

export const INITIAL_BOOKINGS: Booking[] = generateMockBookings();
