export type UserRole = 'admin' | 'requester' | 'approver';

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentVoucher {
  id: string;
  requester_id: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}
