import React, { useState } from 'react';
import { User, AccountHead, UserRole } from '../types';
import { Users, BookOpen, Plus, Pencil, Trash2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'users' | 'accounts'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingAccountHead, setEditingAccountHead] = useState<AccountHead | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);

  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
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

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUser({ ...editingUser, ...newUser });
      setEditingUser(null);
    } else {
      onAddUser(newUser);
    }
    setNewUser({ 
      name: '', 
      email: '', 
      role: 'requester', 
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setShowUserForm(false);
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
            <form onSubmit={handleUserSubmit} className="bg-white p-4 rounded-lg shadow space-y-4">
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
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="requester">Requester</option>
                  <option value="approver">Approver</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newUser.active}
                  onChange={(e) => setNewUser({ ...newUser, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {editingUser ? 'Update' : 'Add'} User
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
                        onClick={() => onDeleteUser(user.id)}
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