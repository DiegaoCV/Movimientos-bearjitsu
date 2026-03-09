
export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lastUpdated: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface SaleItem {
  itemId: string;
  itemName?: string;
  quantity: number;
  priceAtSale: number;
}

export interface PaymentRecord {
  amount: number;
  timestamp: string;
}

export interface Transaction {
  id: string;
  type: 'SALE' | 'STOCK_IN';
  items: SaleItem[];
  totalAmount: number;
  timestamp: string;
  paymentStatus: 'PAID' | 'CREDIT';
  clientId?: string; // Relación con el cliente
  customerName?: string;
  totalPaid: number;
  payments: PaymentRecord[];
}

export type ViewType = 'DASHBOARD' | 'INVENTORY' | 'SALES' | 'CLIENTS' | 'CREDITS' | 'REPORTS' | 'SETTINGS';

export interface AppConfig {
  spreadsheetAppUrl: string;
  isLinked: boolean;
}
