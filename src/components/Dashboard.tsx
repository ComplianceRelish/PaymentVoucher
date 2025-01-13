import React, { useState, useEffect } from 'react';
import { PaymentVoucher, UserRole, User, AccountHead } from '../types';
import PaymentList from './PaymentList';
import NewPaymentForm from './NewPaymentForm';
import AdminDashboard from './AdminDashboard';
import { IndianRupee, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [accountHeads, setAccountHeads] = useState<AccountHead[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('requester');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
    fetchAccountHeads();
    fetchVouchers();
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simple query to avoid recursion
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setUserRole(data.role);
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
        .eq('active', true);

      if (error) throw error;
      setAccountHeads(data || []);
    } catch (error) {
      console.error('Error fetching account heads:', error);
    }
  };

  const fetchVouchers = async () => {
    try {
      // Use proper join syntax
      const { data, error } = await supabase
        .from('payment_vouchers')
        .select(`
          *,
          account_heads!payment_vouchers_account_head_fkey (
            name
          ),
          profiles!payment_vouchers_requested_by_fkey (
            name
          )
        `)
        .eq('status', activeTab);

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedVouchers = data?.map(voucher => ({
        ...voucher,
        accountHead: voucher.account_heads?.name,
        requestedBy: voucher.profiles?.name,
      }));

      setVouchers(transformedVouchers || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  return (
    // ... existing JSX
  );
}

export default Dashboard;