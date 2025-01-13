import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';

interface NewPaymentFormProps {
  onSubmit: (payment: {
    payee: string;
    accountHead: string;
    description: string;
    amount: number;
  }) => void;
  accountHeads: { id: string; name: string }[];
}

const NewPaymentForm: React.FC<NewPaymentFormProps> = ({ onSubmit, accountHeads }) => {
  const [payee, setPayee] = useState('');
  const [accountHead, setAccountHead] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payee || !accountHead || !amount || !description) return;
    
    onSubmit({
      payee,
      accountHead,
      description,
      amount: parseFloat(amount),
    });
    
    setPayee('');
    setAccountHead('');
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">New Payment Voucher</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="payee" className="block text-sm font-medium text-gray-700">
            Payee Name
          </label>
          <input
            type="text"
            id="payee"
            value={payee}
            onChange={(e) => setPayee(e.target.value)}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter payee name"
          />
        </div>

        <div>
          <label htmlFor="accountHead" className="block text-sm font-medium text-gray-700">
            Payment Account
          </label>
          <select
            id="accountHead"
            value={accountHead}
            onChange={(e) => setAccountHead(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Account Head</option>
            {accountHeads.map((head) => (
              <option key={head.id} value={head.id}>
                {head.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Payment Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter payment details"
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit Voucher
        </button>
      </div>
    </form>
  );
};

export default NewPaymentForm;