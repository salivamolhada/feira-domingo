export type PaymentStatus = 'pago' | 'pendente' | 'parcial' | 'fiado';
export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'outro';
export type OrderStatus = 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

export interface SaleItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Sale {
  id: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  date: string; // YYYY-MM-DD
  isSunday: boolean;
  items: SaleItem[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  deliveryTime?: string;
  deliveryType?: 'retirada' | 'entrega';
  deliveryFee?: number;
  discount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  unit: string;
  active: boolean;
  description?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  category: 'ingredientes' | 'embalagens' | 'entrega' | 'gas_energia' | 'equipamentos' | 'marketing' | 'outros';
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  monthName: string;
  totalRevenue: number;
  totalReceived: number;
  totalPending: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
  averageTicket: number;
  sundayRevenue: number;
  sundayOrderCount: number;
  otherDaysRevenue: number;
}
