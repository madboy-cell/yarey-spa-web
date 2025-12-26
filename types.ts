export type Category = 'Massage' | 'Facial' | 'Body Wrap' | 'Scrub' | 'Signature Package';
export type PaymentType = 'Cash' | 'Card';
export type Channel = 'Walk-in' | 'Online' | 'Phone';

export interface Service {
  id: string;
  name: string;
  category: Category;
  duration: number; // in minutes
  price: number;
  skills_required: string[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  skills: string[];
  color_code: string;
  base_salary: number;    // Fixed monthly salary (for in-house)
  is_outsource: boolean;  // Toggle for occasional therapists
}

export interface Booking {
  id: string;
  guest_name: string;
  nationality?: string;
  group_ref?: string;
  date: string;       // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  staff_id: string;
  service_id: string;
  payment_status: 'Paid' | 'Pending' | 'Canceled';
  payment_type: PaymentType;
  channel: Channel;
}

// Simplified to only track COGS (Cost of Goods Sold) per service
export interface ServiceCost {
  serviceId: string;
  cogs: number;
}

