import { useState, useEffect } from 'react';
import { PaymentVoucher, UserRole, User, AccountHead } from '../types';
import PaymentList from './PaymentList';
import NewPaymentForm from './NewPaymentForm';
import AdminDashboard from './AdminDashboard';
import { IndianRupee, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface DashboardProps {
  session: Session;
  role: UserRole;
  onLogout: () => Promise<void>;
}

function Dashboard({ session, role, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchAccountHeads();
    fetchVouchers();
  }, [session.user.id]); // Re-fetch when user ID changes

  const fetchUserProfile = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id);

      if (error) throw error;

      if (profiles) {
        setUsers(profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        })));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchAccountHeads = async () => {
    try {
      const { data, error } = await supabase
        .from('account_heads')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        setAccountHeads(data.map(head => ({
          id: head.id,
          name: head.name,
          code: head.code,
          created_at: head.created_at,
          updated_at: head.updated_at
        })));
      }
    } catch (error) {
      console.error('Error fetching account heads:', error);
    }
  };

  const fetchVouchers = async () => {
    try {
      let query = supabase
        .from('payment_vouchers')
        .select('*, profiles(name), account_heads(name)')
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      // Filter vouchers based on user role
      if (role === 'requester') {
        query = query.eq('requested_by', session.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedVouchers: PaymentVoucher[] = data.map(voucher => ({
          id: voucher.id,
          voucherNumber: voucher.voucher_number,
          date: voucher.date,
          payee: voucher.payee,
          accountHead: voucher.account_head_id,
          description: voucher.description,
          amount: voucher.amount,
          status: voucher.status,
          requestedBy: voucher.requested_by,
          requestedDate: voucher.requested_date,
          approvedBy: voucher.approved_by,
          approvedDate: voucher.approved_date,
          rejectedBy: voucher.rejected_by,
          rejectedDate: voucher.rejected_date,
          requester_id: voucher.requested_by,
          created_at: voucher.created_at,
          updated_at: voucher.updated_at
        }));
        setVouchers(formattedVouchers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setLoading(false);
    }
  };

  const handleNewPayment = async (payment: {
    payee: string;
    accountHead: string;
    description: string;
    amount: number;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('payment_vouchers')
        .insert({
          payee: payment.payee,
          account_head_id: payment.accountHead,
          description: payment.description,
          amount: payment.amount,
          requested_by: user.id,
        });

      if (error) throw error;
      fetchVouchers();
    } catch (error) {
      console.error('Error creating payment voucher:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('payment_vouchers')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      fetchVouchers();
    } catch (error) {
      console.error('Error approving voucher:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('payment_vouchers')
        .update({
          status: 'rejected',
          rejected_by: user.id,
          rejected_date: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      fetchVouchers();
    } catch (error) {
      console.error('Error rejecting voucher:', error);
    }
  };

  const handleDownload = (voucher: PaymentVoucher) => {
    // TODO: Implement PDF generation and download
    console.log('Downloading voucher:', voucher);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IndianRupee className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Relish Foods Pvt Ltd</h1>
                <p className="text-sm text-gray-500">Payment Approval System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm capitalize">
                {role}
              </span>
              {role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(!showAdminPanel)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {showAdminPanel ? 'View Vouchers' : 'Admin Panel'}
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {role === 'admin' && showAdminPanel ? (
          <AdminDashboard
            users={users}
            accountHeads={accountHeads}
            onAddUser={async () => {}}
            onUpdateUser={async () => {}}
            onDeleteUser={async () => {}}
            onAddAccountHead={async () => {}}
            onUpdateAccountHead={async () => {}}
            onDeleteAccountHead={async () => {}}
          />
        ) : (
          <>
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => {
                      setActiveTab('pending');
                      fetchVouchers();
                    }}
                    className={`${
                      activeTab === 'pending'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <Clock className={`${
                      activeTab === 'pending' ? 'text-blue-500' : 'text-gray-400'
                    } mr-2 h-5 w-5`} />
                    Pending Vouchers
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('approved');
                      fetchVouchers();
                    }}
                    className={`${
                      activeTab === 'approved'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <CheckCircle className={`${
                      activeTab === 'approved' ? 'text-green-500' : 'text-gray-400'
                    } mr-2 h-5 w-5`} />
                    Approved Vouchers
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('rejected');
                      fetchVouchers();
                    }}
                    className={`${
                      activeTab === 'rejected'
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    <XCircle className={`${
                      activeTab === 'rejected' ? 'text-red-500' : 'text-gray-400'
                    } mr-2 h-5 w-5`} />
                    Rejected Vouchers
                  </button>
                </nav>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {role === 'requester' && activeTab === 'pending' && (
                <div className="lg:col-span-1">
                  <NewPaymentForm
                    onSubmit={handleNewPayment}
                    accountHeads={accountHeads}
                  />
                </div>
              )}
              <div className={role === 'requester' && activeTab === 'pending' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <PaymentList
                    vouchers={vouchers}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDownload={handleDownload}
                    userRole={role}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;