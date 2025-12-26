
import { Service, Staff, Booking, TourOperator } from './types';

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

export const INITIAL_TOUR_OPERATORS: TourOperator[] = [
  { id: 'to1', name: 'Luxury Phuket Tours', total_credit_limit: 50000, outstanding_balance: 12500 },
  { id: 'to2', name: 'Andaman Dream Travel', total_credit_limit: 30000, outstanding_balance: 2000 },
  { id: 'to3', name: 'Blue Sky Holidays', total_credit_limit: 100000, outstanding_balance: 45000 },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', guest_name: 'David Smith', nationality: 'United Kingdom', date: today, start_time: '10:00', end_time: '11:00', staff_id: 'st1', service_id: 's1', payment_status: 'Paid', payment_type: 'Cash', channel: 'Walk-in' },
  { id: 'b2', guest_name: 'Emma Watson', nationality: 'Australia', date: today, start_time: '11:30', end_time: '13:00', staff_id: 'st2', service_id: 's2', payment_status: 'Pending', payment_type: 'Card', channel: 'Online' },
  { id: 'b3', guest_name: 'Mr. Lee', nationality: 'South Korea', group_ref: 'G123', date: today, start_time: '14:00', end_time: '15:00', staff_id: 'st3', service_id: 's1', payment_status: 'Pending', payment_type: 'Credit', channel: 'Tour Operator', tour_operator_id: 'to1' },
  { id: 'b4', guest_name: 'Mrs. Lee', nationality: 'South Korea', group_ref: 'G123', date: today, start_time: '14:00', end_time: '15:00', staff_id: 'OUTSOURCE', service_id: 's1', payment_status: 'Pending', payment_type: 'Credit', channel: 'Tour Operator', tour_operator_id: 'to1' },
];

export const NATIONALITIES = [
  "Thailand", "China", "Russia", "United Kingdom", "Australia", 
  "USA", "Germany", "France", "South Korea", "Japan", 
  "Singapore", "India", "Other"
];
