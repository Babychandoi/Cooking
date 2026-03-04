import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, X, Receipt, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';
import { useBranch } from '../../component/BranchContext';
import {
  InvoiceResponse,
  CreateInvoiceRequest,
  PaymentResponse,
  CreatePaymentRequest,
  OrderResponse,
} from '../../types/cooking';
import { invoiceApi, paymentApi, tableSessionApi, orderApi } from '../../services/cookingApi';
import Pagination from '../../component/Pagination';

export default function InvoicePage() {
  const { selectedBranch } = useBranch();
  
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Detail Modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<InvoiceResponse | null>(null);
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  
  // Payment Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<CreatePaymentRequest>({
    invoiceId: '',
    amount: 0,
    method: 'CASH',
  });

  const loadData = useCallback(async () => {
    if (!selectedBranch) return;
    
    try {
      const res = await invoiceApi.getAll({ page, limit: 20, search });
      if (res.success && res.data) {
        // Handle paginated response
        setInvoices(res.data.items);
        setTotalPages(res.data.totalPages);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  }, [page, search, selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ thanh toán';
      case 'paid':
        return 'Đã thanh toán';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const openDetail = async (invoice: InvoiceResponse) => {
    setDetailInvoice(invoice);
    
    // Load payments
    try {
      const res = await paymentApi.getByInvoice(invoice.id);
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
    
    // Load orders
    try {
      const res = await orderApi.getByTableSession(invoice.tableSessionId);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
    
    setShowDetailModal(true);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setDetailInvoice(null);
    setPayments([]);
    setOrders([]);
  };

  const openPayment = (invoice: InvoiceResponse) => {
    const finalAmount = parseFloat(invoice.finalAmount);
    const paidAmount = payments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0);
    const remainingAmount = finalAmount - paidAmount;
    
    setPaymentForm({
      invoiceId: invoice.id,
      amount: remainingAmount,
      method: 'CASH',
    });
    setShowPaymentModal(true);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await paymentApi.create(paymentForm);
      toast.success('Thanh toán thành công');
      setShowPaymentModal(false);
      
      // Reload invoice detail
      if (detailInvoice) {
        const invoiceRes = await invoiceApi.getById(detailInvoice.id);
        if (invoiceRes.success && invoiceRes.data) {
          setDetailInvoice(invoiceRes.data);
        }
        
        const paymentsRes = await paymentApi.getByInvoice(detailInvoice.id);
        if (paymentsRes.success && paymentsRes.data) {
          setPayments(paymentsRes.data);
        }
      }
      
      // Reload invoice list
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi thanh toán');
    }
  };

  if (!selectedBranch) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Vui lòng chọn chi nhánh để xem hóa đơn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Hóa đơn</h1>
          <p className="text-sm text-gray-500 mt-1">Chi nhánh: {selectedBranch.name}</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm hóa đơn..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã HĐ</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">VAT (8%)</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-3 font-medium text-gray-800">#{invoice.id.slice(0, 8)}</td>
                <td className="px-5 py-3 text-gray-600 text-sm">
                  {new Date(invoice.issuedAt).toLocaleString('vi-VN')}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">{formatPrice(parseFloat(invoice.totalAmount))}</td>
                <td className="px-5 py-3 text-right text-blue-600">+{formatPrice(parseFloat(invoice.vatAmount))}</td>
                <td className="px-5 py-3 text-right font-bold text-orange-600">{formatPrice(parseFloat(invoice.finalAmount))}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {getStatusLabel(invoice.status)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openDetail(invoice)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => openPayment(invoice)}
                        className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition"
                        title="Thanh toán"
                      >
                        <CreditCard size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Chưa có hóa đơn nào</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Chi tiết hóa đơn</h3>
              </div>
              <button onClick={closeDetail} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Invoice Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Mã hóa đơn</p>
                    <p className="font-medium text-gray-800">#{detailInvoice.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ngày tạo</p>
                    <p className="font-medium text-gray-800">
                      {new Date(detailInvoice.issuedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trạng thái</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(detailInvoice.status)}`}>
                      {getStatusLabel(detailInvoice.status)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium text-gray-800">{formatPrice(parseFloat(detailInvoice.totalAmount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT (8%):</span>
                      <span className="font-medium text-blue-600">+{formatPrice(parseFloat(detailInvoice.vatAmount))}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span className="text-gray-800">Thành tiền:</span>
                      <span className="text-orange-600">{formatPrice(parseFloat(detailInvoice.finalAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Các món đã gọi</h4>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Không có món nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-500">
                            Order #{order.orderNumber}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'SERVED' ? 'bg-green-100 text-green-700' :
                            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status === 'SERVED' ? 'Đã phục vụ' :
                             order.status === 'PREPARING' ? 'Đang nấu' :
                             order.status === 'CANCELLED' ? 'Đã hủy' : 'Mới'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex-1">
                                <span className="text-gray-700">{item.dishName}</span>
                                <span className="text-gray-400 ml-2">x{item.quantity}</span>
                              </div>
                              <span className="text-gray-600 font-medium">
                                {formatPrice(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Lịch sử thanh toán</h4>
                  {detailInvoice.status === 'pending' && (
                    <button
                      onClick={() => openPayment(detailInvoice)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      <CreditCard size={14} />
                      Thanh toán
                    </button>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>Chưa có thanh toán nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {payment.method === 'CASH' ? 'Tiền mặt' : payment.method === 'CARD' ? 'Thẻ' : 'Chuyển khoản'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(payment.paidAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{formatPrice(payment.amount)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              payment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Hoàn thành' : payment.status === 'PENDING' ? 'Đang xử lý' : 'Thất bại'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Thanh toán</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
                  <select
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  >
                    <option value="CASH">Tiền mặt</option>
                    <option value="CARD">Thẻ</option>
                    <option value="TRANSFER">Chuyển khoản</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Xác nhận thanh toán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
