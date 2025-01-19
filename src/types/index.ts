export type UserRole = 'admin' | 'requester' | 'approver';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  role: UserRole;
  active: boolean;
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
  createdBy: string;
  approvedBy?: string;
  rejectedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountHead {
  id: string;
  name: string;
  code: string;
  active: boolean;
}