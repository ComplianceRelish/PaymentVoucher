import React, { useState } from 'react';
import { User, AccountHead } from '../types';
import { Users, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useNotification } from '../hooks/useNotification';
import AddUserForm from './AddUserForm';

interface AdminDashboardProps {
  users: User[];
  accountHeads: AccountHead[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onDeleteUser: (id: string) => void;
  onDeleteAccountHead: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users,
  accountHeads,
  onAddUser,
  onDeleteUser,
  onDeleteAccountHead
}) => {
  const { addNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<'users' | 'accountHeads'>('users');
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const handleDeleteUser = async (userId: string) => {
    try {
      onDeleteUser(userId);
      addNotification('User deleted successfully', 'success');
    } catch (error) {
      addNotification('Failed to delete user', 'error');
    }
  };

  const handleDeleteAccountHead = async (accountHeadId: string) => {
    try {
      onDeleteAccountHead(accountHeadId);
      addNotification('Account head deleted successfully', 'success');
    } catch (error) {
      addNotification('Failed to delete account head', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('accountHeads')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              activeTab === 'accountHeads'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Account Heads
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Users</h2>
            <button
              onClick={() => setShowAddUserForm(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>

          {showAddUserForm && (
            <div className="mb-8">
              <AddUserForm
                onAddUser={async (userData) => {
                  await onAddUser(userData);
                  setShowAddUserForm(false);
                }}
              />
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
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
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

      {activeTab === 'accountHeads' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Account Heads</h2>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountHeads.map((accountHead) => (
                  <tr key={accountHead.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {accountHead.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {accountHead.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteAccountHead(accountHead.id)}
                        className="text-red-600 hover:text-red-900"
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
    </div>
  );
};

export default AdminDashboard;