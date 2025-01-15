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
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
}

export interface AccountHead {
  id: string;
  name: string;
  code: string;
  active: boolean;
}