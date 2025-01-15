import React from 'react';
import { PaymentVoucher } from '../types';
import { IndianRupee, CheckCircle, XCircle, Clock, Download } from 'lucide-react';

interface PaymentListProps {
  vouchers: PaymentVoucher[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDownload: (voucher: PaymentVoucher) => void;
  userRole: string;
}

const PaymentList: React.FC<PaymentListProps> = ({
  vouchers,
  onApprove,
  onReject,
  onDownload,
  userRole,
}) => {
  const getStatusIcon = (status: PaymentVoucher['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" />;
      case 'rejected':
        return <XCircle className="text-red-500" />;
      default:
        return <Clock className="text-yellow-500" />;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {vouchers.map((voucher) => (
        <div
          key={voucher.id}
          className="bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <IndianRupee className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">Voucher #{voucher.voucherNumber}</h3>
                  <span className="text-sm text-gray-500">
                    ({new Date(voucher.date).toLocaleDateString()})
                  </span>
                </div>
                <p className="text-gray-600">Payee: {voucher.payee}</p>
                <p className="text-gray-600 text-sm">Account: {voucher.accountHead}</p>
                <p className="text-gray-600 mt-2">{voucher.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-2xl font-bold">{formatAmount(voucher.amount)}</span>
              <div className="flex items-center space-x-2">
                {voucher.status === 'pending' && userRole === 'approver' && (
                  <>
                    <button
                      onClick={() => onApprove(voucher.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(voucher.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                {voucher.status === 'approved' && userRole === 'requester' && (
                  <button
                    onClick={() => onDownload(voucher)}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                )}
                {voucher.status !== 'pending' && (
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(voucher.status)}
                    <span className="capitalize">{voucher.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 flex justify-between">
            <span>Created by: {voucher.requestedBy}</span>
            {voucher.approvedBy && (
              <span>Approved by: {voucher.approvedBy}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentList;