import React, { useState } from 'react';
import { User, AccountHead, UserRole } from '../types';
import { Users, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../lib/supabase';
import { createOTPService } from '../lib/otpService';
import { useNotification } from '../context/NotificationContext';

interface AdminDashboardProps {
  users: User[];
  accountHeads: AccountHead[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onAddAccountHead: (accountHead: Omit<AccountHead, 'id'>) => void;
  onUpdateAccountHead: (accountHead: AccountHead) => void;
  onDeleteAccountHead: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  accountHeads,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddAccountHead,
  onUpdateAccountHead,
  onDeleteAccountHead,
}) => {
  const { addNotification } = useNotification();
  const otpService = createOTPService(addNotification);

  const [activeTab, setActiveTab] = useState<'users' | 'accounts'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingAccountHead, setEditingAccountHead] = useState<AccountHead | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    mobile: '',
    role: 'requester' as UserRole,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [newAccountHead, setNewAccountHead] = useState<Omit<AccountHead, 'id'>>({
    name: '',
    code: '',
    active: true,
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOTP] = useState('');

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, newUser);
        onUpdateUser({ ...editingUser, ...newUser });
        setEditingUser(null);
      } else {
        if (!showOTPVerification) {
          // First step: Send OTP
          const { success, error } = await otpService.sendOTP(newUser.mobile);
          if (!success) throw new Error(error);
          setShowOTPVerification(true);
          return;
        }

        // Second step: Verify OTP and create user
        const isValid = otpService.verifyOTP(newUser.mobile, otp);
        if (!isValid) {
          throw new Error('Invalid OTP. Please try again.');
        }

        // Create user after OTP verification
        const { profile } = await createUser({
          ...newUser,
          otp
        });

        onAddUser({ ...profile });
        setShowOTPVerification(false);
        setOTP('');
      }

      setNewUser({ 
        name: '', 
        email: '', 
        mobile: '',
        role: 'requester', 
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      setShowUserForm(false);
    } catch (error) {
      console.error('Error managing user:', error);
      alert(error instanceof Error ? error.message : 'Failed to manage user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      onDeleteUser(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete user');
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccountHead) {
      onUpdateAccountHead({ ...editingAccountHead, ...newAccountHead });
      setEditingAccountHead(null);
    } else {
      onAddAccountHead(newAccountHead);
    }
    setNewAccountHead({ 
      name: '', 
      code: '', 
      active: true, 
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setShowAccountForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Manage Users</span>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 ${
            activeTab === 'accounts'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Account Heads</span>
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Users</h2>
            <button
              onClick={() => setShowUserForm(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          </div>

          {showUserForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      type="tel"
                      value={newUser.mobile}
                      onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      pattern="[0-9]{10}"
                      title="Please enter a valid 10-digit mobile number"
                    />
                  </div>
                  {showOTPVerification && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOTP(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                        pattern="[0-9]{6}"
                        title="Please enter the 6-digit OTP"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="requester">Requester</option>
                      <option value="approver">Approver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newUser.active}
                      onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">Active</label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserForm(false);
                        setShowOTPVerification(false);
                        setOTP('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      {showOTPVerification ? 'Verify OTP' : editingUser ? 'Update' : 'Send OTP'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewUser(user);
                          setShowUserForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Account Heads</h2>
            <button
              onClick={() => setShowAccountForm(true)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account Head</span>
            </button>
          </div>

          {showAccountForm && (
            <form onSubmit={handleAccountSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newAccountHead.name}
                  onChange={(e) => setNewAccountHead({ ...newAccountHead, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value={newAccountHead.code}
                  onChange={(e) => setNewAccountHead({ ...newAccountHead, code: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newAccountHead.active}
                  onChange={(e) => setNewAccountHead({ ...newAccountHead, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAccountForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingAccountHead ? 'Update' : 'Add'} Account Head
                </button>
              </div>
            </form>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountHeads.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{account.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{account.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {account.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingAccountHead(account);
                          setNewAccountHead(account);
                          setShowAccountForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteAccountHead(account.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;