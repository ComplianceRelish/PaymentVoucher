import React, { useState } from 'react';
import { User, AccountHead, UserRole } from '../types';
import { Users, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import AddUserForm from './AddUserForm';

interface AdminDashboardProps {
  users: User[];
  accountHeads: AccountHead[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
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
  const [activeTab, setActiveTab] = useState<'users' | 'accounts'>('users');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

  const handleAddUser = async (userData: Omit<User, 'id'>) => {
    try {
      await onAddUser(userData);
      setShowAddUserForm(false);
      addNotification('User added successfully', 'success');
    } catch (error) {
      addNotification('Failed to add user', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Users className="w-5 h-5 mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'accounts'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Account Heads
        </button>
      </div>

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Users</h2>
            <button
              onClick={() => setShowAddUserForm(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>

          {showAddUserForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New User</h3>
                <AddUserForm
                  onSubmit={handleAddUser}
                  onCancel={() => setShowAddUserForm(false)}
                />
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden">
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
                    Phone Number
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
                    <td className="px-6 py-4 whitespace-nowrap">{user.mobile}</td>
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
                        onClick={() => onDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
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
            <form onSubmit={(e) => e.preventDefault()} className="bg-white p-4 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value=""
                  onChange={(e) => {}}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  type="text"
                  value=""
                  onChange={(e) => {}}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={(e) => {}}
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
                  Add Account Head
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