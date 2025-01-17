export type UserRole = 'admin' | 'requester' | 'approver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountHead {
  id: string;
  name: string;
  code: string;
  active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentVoucher {
  id: string;
  voucherNumber: string;
  date: string;
  payee: string;
  accountHead: string;
  description: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  requester_id: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
}
