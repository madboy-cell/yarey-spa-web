
export type Category = 'Massage' | 'Facial' | 'Body Wrap' | 'Scrub' | 'Signature Package';
export type PaymentType = 'Cash' | 'Card';
export type Channel = 'Walk-in' | 'Online' | 'Phone';

export interface Service {
  id: string;
  name: string;
  category: Category;
  duration: number; // in minutes
  price: number;
  totalUnitCost: number; // Combined cost: Oil + Laundry + Utilities
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

export interface Salesperson {
  id: string;
  name: string;
  commission_rate: number; // Percentage, e.g., 5
  color_code: string;
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
  salesperson_id?: string;
  sales_commission?: number; // Calculated payout to the sales partner
  service_id: string;
  payment_status: 'Paid' | 'Pending' | 'Canceled';
  payment_type: PaymentType;
  channel: Channel;
}
