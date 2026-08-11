export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface CustomerFollowUp {
  id: string;
  customerId: string;
  note: string;
  createdById: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followUps: number;
    challans: number;
  };
  followUps?: CustomerFollowUp[];
  challans?: SalesChallan[];
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'IN' | 'OUT';

export interface StockMovement {
  id: string;
  productId: string;
  quantityChanged: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface SalesChallanItem {
  id: string;
  challanId: string;
  productId: string;
  productSnapshot: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesChallan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerSnapshot: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: User;
  items?: SalesChallanItem[];
}

export interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  leadCustomers: number;
  totalProducts: number;
  lowStockProductsCount: number;
  totalStockValue: number;
  totalChallans: number;
  totalRevenue: number;
}
