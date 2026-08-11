export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export const Roles = {
  ADMIN: 'ADMIN' as Role,
  SALES: 'SALES' as Role,
  WAREHOUSE: 'WAREHOUSE' as Role,
  ACCOUNTS: 'ACCOUNTS' as Role,
};

export const CustomerTypes = {
  RETAIL: 'RETAIL' as CustomerType,
  WHOLESALE: 'WHOLESALE' as CustomerType,
  DISTRIBUTOR: 'DISTRIBUTOR' as CustomerType,
};

export const CustomerStatuses = {
  LEAD: 'LEAD' as CustomerStatus,
  ACTIVE: 'ACTIVE' as CustomerStatus,
  INACTIVE: 'INACTIVE' as CustomerStatus,
};

export const MovementTypes = {
  IN: 'IN' as MovementType,
  OUT: 'OUT' as MovementType,
};

export const ChallanStatuses = {
  DRAFT: 'DRAFT' as ChallanStatus,
  CONFIRMED: 'CONFIRMED' as ChallanStatus,
  CANCELLED: 'CANCELLED' as ChallanStatus,
};
