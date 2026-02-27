import React, { useEffect, useState } from 'react';
import { Plus, XCircle, Search, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { orderApi, dishApi } from '../../services/cookingApi';
import {
  OrderResponse,
  CreateOrderRequest,
  OrderItemRequest,
  DishResponse,
} from '../../types/cooking';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Đang chế biến', color: 'bg-indigo-100 text-indigo-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const NEXT_STATUS: Record<string, { nextStatus: string; label: string; btnColor: string }> = {
  PENDING: { nextStatus: 'CONFIRMED', label: 'Xác nhận', btnColor: 'bg-blue-500 hover:bg-blue-600' },
  CONFIRMED: { nextStatus: 'PREPARING', label: 'Bắt đầu chế biến', btnColor: 'bg-indigo-500 hover:bg-indigo-600' },
  PREPARING: { nextStatus: 'COMPLETED', label: 'Hoàn thành', btnColor: 'bg-green-500 hover:bg-green-600' },
};

export default function OrderPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Create form
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [note, setNote] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, dishesRes] = await Promise.all([
        orderApi.getAll(),
        dishApi.getAll(),
      ]);
      setOrders(ordersRes.data || []);
      setDishes((dishesRes.data || []).filter((d) => d.isAvailable));
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tải dữ liệu',
        confirmButtonColor: '#f97316',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setCustomerName('');
    setTableNumber(1);
    setNote('');
    setOrderItems([{ dishId: dishes[0]?.id || 0, quantity: 1 }]);
    setShowModal(true);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { dishId: dishes[0]?.id || 0, quantity: 1 }]);
  };

  const removeOrderItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const updateOrderItem = (idx: number, field: keyof OrderItemRequest, value: number) => {
    const updated = [...orderItems];
    (updated[idx] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Cần ít nhất 1 món trong đơn hàng',
        confirmButtonColor: '#f97316',
      });
      return;
    }
    const payload: CreateOrderRequest = {
      customerName: customerName || undefined,
      tableNumber: tableNumber || undefined,
      note: note || undefined,
      items: orderItems.map((it) => ({
        dishId: Number(it.dishId),
        quantity: Number(it.quantity),
      })),
    };
    try {
      await orderApi.create(payload);
      Swal.fire({
        icon: 'success',
        title: 'Đặt hàng thành công!',
        text: 'Đơn hàng đã được tạo và nguyên liệu đã được trừ kho.',
        confirmButtonColor: '#f97316',
        timer: 2000,
        timerProgressBar: true,
      });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      const resData = err.response?.data;
      const insufficientItems = resData?.data; // array of { name, required, available, shortage }

      if (Array.isArray(insufficientItems) && insufficientItems.length > 0) {
        // Build a beautiful HTML table for insufficient stock details
        const rows = insufficientItems
          .map(
            (item: any) =>
              `<tr>
                <td style="padding:8px 12px;text-align:left;border-bottom:1px solid #f3f4f6;">${item.name}</td>
                <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;">${item.required}</td>
                <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;">${item.available}</td>
                <td style="padding:8px 12px;text-align:center;border-bottom:1px solid #f3f4f6;color:#ef4444;font-weight:600;">-${item.shortage}</td>
              </tr>`,
          )
          .join('');

        Swal.fire({
          icon: 'error',
          title: 'Không đủ nguyên liệu!',
          html: `
            <p style="margin-bottom:12px;color:#6b7280;font-size:14px;">Kho không đủ nguyên liệu để tạo đơn hàng này. Chi tiết:</p>
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead>
                  <tr style="background:#fef3c7;">
                    <th style="padding:8px 12px;text-align:left;font-weight:600;color:#92400e;">Nguyên liệu</th>
                    <th style="padding:8px 12px;text-align:center;font-weight:600;color:#92400e;">Cần</th>
                    <th style="padding:8px 12px;text-align:center;font-weight:600;color:#92400e;">Tồn kho</th>
                    <th style="padding:8px 12px;text-align:center;font-weight:600;color:#92400e;">Thiếu</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          `,
          confirmButtonColor: '#f97316',
          confirmButtonText: 'Đã hiểu',
          width: 520,
        });
      } else {
        const msg = resData?.message;
        Swal.fire({
          icon: 'error',
          title: 'Tạo đơn thất bại',
          text: Array.isArray(msg) ? msg.join(', ') : (msg || 'Có lỗi xảy ra'),
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  const handleCancel = async (id: number) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Hủy đơn hàng #' + id,
      input: 'textarea',
      inputLabel: 'Lý do hủy',
      inputPlaceholder: 'Nhập lý do...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hủy đơn',
      cancelButtonText: 'Đóng',
    });
    if (isConfirmed) {
      try {
        await orderApi.cancel(id, reason || undefined);
        Swal.fire({
          icon: 'success',
          title: 'Đã hủy đơn hàng',
          text: 'Đơn hàng đã được hủy và nguyên liệu đã hoàn kho.',
          confirmButtonColor: '#f97316',
          timer: 2000,
          timerProgressBar: true,
        });
        loadData();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Không thể hủy',
          text: err.response?.data?.message || 'Có lỗi xảy ra',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;

    const currentLabel = STATUS_MAP[currentStatus]?.label || currentStatus;
    const nextLabel = STATUS_MAP[next.nextStatus]?.label || next.nextStatus;

    const result = await Swal.fire({
      title: 'Chuyển trạng thái đơn hàng',
      html: `
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin:16px 0;">
          <span style="padding:6px 14px;border-radius:9999px;font-size:13px;font-weight:600;background:#fef3c7;color:#92400e;">${currentLabel}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span style="padding:6px 14px;border-radius:9999px;font-size:13px;font-weight:600;background:#dbeafe;color:#1e40af;">${nextLabel}</span>
        </div>
        <p style="color:#6b7280;font-size:14px;">Bạn có chắc muốn chuyển đơn #${orderId} sang trạng thái <b>${nextLabel}</b>?</p>
      `,
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: next.label,
      cancelButtonText: 'Hủy bỏ',
    });

    if (result.isConfirmed) {
      try {
        await orderApi.updateStatus(orderId, next.nextStatus);
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công!',
          text: `Đơn hàng #${orderId} đã chuyển sang ${nextLabel}.`,
          confirmButtonColor: '#f97316',
          timer: 2000,
          timerProgressBar: true,
        });
        loadData();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Không thể cập nhật',
          text: err.response?.data?.message || 'Có lỗi xảy ra',
          confirmButtonColor: '#f97316',
        });
      }
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const filtered = orders.filter(
    (o) =>
      (o.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search) ||
      String(o.tableNumber).includes(search),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên KH, mã đơn, số bàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-full sm:w-80"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Tạo đơn hàng
        </button>
      </div>

      {/* Order List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">Không có dữ liệu</div>
        )}
        {filtered
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((order) => {
            const isExpanded = expandedId === order.id;
            const status = STATUS_MAP[order.status] || {
              label: order.status,
              color: 'bg-gray-100 text-gray-700',
            };
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-semibold text-gray-800">#{order.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                      {status.label}
                    </span>
                    {order.customerName && (
                      <span className="text-sm text-gray-600">{order.customerName}</span>
                    )}
                    {order.tableNumber > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Bàn {order.tableNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-600 text-sm">
                      {formatPrice(order.totalPrice)}
                    </span>
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order.id, order.status);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition ${NEXT_STATUS[order.status].btnColor}`}
                        title={NEXT_STATUS[order.status].label}
                      >
                        {NEXT_STATUS[order.status].label}
                        <ArrowRight size={14} />
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(order.id);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Hủy đơn"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <div className="flex gap-6 text-xs text-gray-400 mt-3 mb-2">
                      <span>
                        Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {order.note && <span>Ghi chú: {order.note}</span>}
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100">
                          <th className="py-2 font-medium">Món</th>
                          <th className="py-2 font-medium text-center">SL</th>
                          <th className="py-2 font-medium text-right">Đơn giá</th>
                          <th className="py-2 font-medium text-right">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-50 last:border-0">
                            <td className="py-2 text-gray-700">{item.dishName}</td>
                            <td className="py-2 text-gray-700 text-center">{item.quantity}</td>
                            <td className="py-2 text-gray-500 text-right">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="py-2 text-gray-700 text-right font-medium">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-gray-200">
                          <td colSpan={3} className="py-2 text-right font-semibold text-gray-700">
                            Tổng:
                          </td>
                          <td className="py-2 text-right font-bold text-orange-600">
                            {formatPrice(order.totalPrice)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tạo đơn hàng</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Tùy chọn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số bàn</label>
                  <input
                    type="number"
                    min="1"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Tùy chọn"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Danh sách món</label>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Thêm món
                  </button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, idx) => {
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select
                          value={item.dishId}
                          onChange={(e) => updateOrderItem(idx, 'dishId', Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                          {dishes.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} — {formatPrice(d.price)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(idx, 'quantity', Number(e.target.value))}
                          className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-center"
                        />
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOrderItem(idx)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Đặt hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
