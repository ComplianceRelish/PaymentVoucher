import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useNotification } from '../hooks/useNotification';

interface AddUserFormProps {
  onSubmit: (user: Omit<User, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onSubmit, onCancel }) => {
  const { addNotification } = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'requester' as UserRole,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      addNotification('User added successfully', 'success');
      onCancel();
    } catch (error) {
      addNotification('Failed to add user', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          required
          value={formData.phone_number}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Initial Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          value={formData.role}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="requester">Requester</option>
          <option value="approver">Approver</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          Add User
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;
