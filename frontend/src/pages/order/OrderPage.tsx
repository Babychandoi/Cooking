import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useBranch } from '../../component/BranchContext';
import {
  OrderResponse,
  CreateOrderRequest,
  OrderItemRequest,
  BranchDishResponse,
  TableResponse,
  TableSessionResponse,
} from '../../types/cooking';
import { orderApi, branchDishApi, tableApi, tableSessionApi } from '../../services/cookingApi';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Mới', color: 'bg-blue-100 text-blue-700' },
  PREPARING: { label: 'Đang nấu', color: 'bg-yellow-100 text-yellow-700' },
  SERVED: { label: 'Đã phục vụ', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const NEXT_STATUS: Record<string, any> = {
  NEW: { nextStatus: 'PREPARING', label: 'Bắt đầu nấu', btnColor: 'bg-yellow-500 hover:bg-yellow-600' },
  PREPARING: { nextStatus: 'SERVED', label: 'Hoàn thành', btnColor: 'bg-green-500 hover:bg-green-600' },
};

export default function OrderPageNew() {
  const { selectedBranch } = useBranch();
  
  // Orders
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orderTableMap, setOrderTableMap] = useState<Record<string, string>>({}); // orderId -> tableCode
  
  // Tables & Sessions
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null);
  const [activeSession, setActiveSession] = useState<TableSessionResponse | null>(null);
  
  // Available dishes for selected branch
  const [branchDishes, setBranchDishes] = useState<BranchDishResponse[]>([]);
  
  // Create Order Modal
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItemRequest[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (selectedBranch) {
      loadTablesAndOrders();
      loadBranchDishes();
    }
  }, [selectedBranch]);

  const loadTablesAndOrders = async () => {
    if (!selectedBranch) return;
    
    try {
      // Load all tables
      const tablesRes = await tableApi.getByBranch(selectedBranch.id);
      if (tablesRes.success && tablesRes.data) {
        setTables(tablesRes.data);
        
        // Get occupied tables only
        const occupiedTables = tablesRes.data.filter(t => t.status === 'occupied');
        
        // Load orders for each occupied table's active session
        const allOrders: OrderResponse[] = [];
        const tableMap: Record<string, string> = {};
        
        for (const table of occupiedTables) {
          try {
            const sessionRes = await tableSessionApi.getActiveByTable(table.id);
            if (sessionRes.success && sessionRes.data) {
              // Load orders for this session
              const ordersRes = await orderApi.getByTableSession(sessionRes.data.id);
              if (ordersRes.success && ordersRes.data) {
                // Map each order to its table
                ordersRes.data.forEach(order => {
                  tableMap[order.id] = table.tableCode;
                });
                allOrders.push(...ordersRes.data);
              }
            }
          } catch (error) {
            console.error(`Failed to load orders for table ${table.tableCode}:`, error);
          }
        }
        
        // Sort by creation time (newest first)
        allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(allOrders);
        setOrderTableMap(tableMap);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  };

  const loadBranchDishes = async () => {
    if (!selectedBranch) return;
    
    try {
      const res = await branchDishApi.getByBranch(selectedBranch.id);
      if (res.success && res.data) {
        // Only available dishes
        setBranchDishes(res.data.filter(bd => bd.isAvailable));
      }
    } catch (error: any) {
      console.error('Failed to load dishes:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const calculateTotal = (items: OrderItemRequest[]) => {
    return items.reduce((sum, item) => {
      const dish = branchDishes.find(d => d.dishId === item.dishId);
      return sum + (dish?.price || item.unitPrice || 0) * item.quantity;
    }, 0);
  };

  // ===== TABLE & SESSION =====
  
  const handleSelectTable = async (table: TableResponse) => {
    setSelectedTable(table);
    
    // Check if table has active session
    try {
      const res = await tableSessionApi.getActiveByTable(table.id);
      if (res.success && res.data) {
        setActiveSession(res.data);
      } else {
        setActiveSession(null);
      }
    } catch (error) {
      setActiveSession(null);
    }
  };

  const handleOpenSession = async () => {
    if (!selectedTable) return;
    
    try {
      const res = await tableSessionApi.openSession({ tableId: selectedTable.id });
      if (res.success && res.data) {
        setActiveSession(res.data);
        toast.success('Đã mở phiên bàn');
        loadTablesAndOrders();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi mở phiên bàn');
    }
  };

  const handleCloseSession = async () => {
    if (!activeSession) return;
    
    const result = await Swal.fire({
      title: 'Đóng phiên bàn?',
      text: 'Bạn có chắc muốn đóng phiên này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đóng',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await tableSessionApi.closeSession(activeSession.id);
        setActiveSession(null);
        setSelectedTable(null);
        toast.success('Đã đóng phiên bàn');
        loadTablesAndOrders();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi đóng phiên bàn');
      }
    }
  };

  // ===== ORDER CRUD =====
  
  const openCreateOrder = () => {
    if (!selectedBranch) {
      toast.warning('Vui lòng chọn chi nhánh');
      return;
    }
    
    if (!activeSession) {
      toast.warning('Vui lòng chọn bàn và mở phiên trước');
      return;
    }
    
    if (branchDishes.length === 0) {
      toast.warning('Không có món ăn nào có sẵn');
      return;
    }
    
    setOrderItems([{ dishId: branchDishes[0].dishId, quantity: 1 }]);
    setNote('');
    setShowOrderModal(true);
  };

  const addOrderItem = () => {
    if (branchDishes.length === 0) return;
    setOrderItems([...orderItems, { dishId: branchDishes[0].dishId, quantity: 1 }]);
  };

  const removeOrderItem = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  const updateOrderItem = (idx: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[idx] as any)[field] = value;
    setOrderItems(updated);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch || !activeSession) return;

    // Add unit prices from branch dishes
    const itemsWithPrices = orderItems.map(item => {
      const branchDish = branchDishes.find(bd => bd.dishId === item.dishId);
      return {
        ...item,
        unitPrice: branchDish?.price || 0,
      };
    });

    const payload: CreateOrderRequest = {
      tableSessionId: activeSession.id,
      branchId: selectedBranch.id,
      orderNumber: `ORD-${Date.now()}`,
      note: note || undefined,
      items: itemsWithPrices,
    };

    try {
      await orderApi.create(payload);
      toast.success('Tạo đơn hàng thành công');
      setShowOrderModal(false);
      loadTablesAndOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tạo đơn hàng');
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;

    const result = await Swal.fire({
      title: 'Cập nhật trạng thái?',
      text: `Chuyển sang: ${next.label}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await orderApi.updateStatus(orderId, next.nextStatus);
        toast.success('Cập nhật thành công');
        loadTablesAndOrders();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi cập nhật');
      }
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Hủy đơn hàng',
      input: 'textarea',
      inputLabel: 'Lý do hủy',
      inputPlaceholder: 'Nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'Hủy đơn',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#d33',
    });

    if (reason !== undefined) {
      try {
        await orderApi.cancel(orderId, reason || undefined);
        toast.success('Đã hủy đơn hàng');
        loadTablesAndOrders();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi hủy đơn');
      }
    }
  };

  if (!selectedBranch) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Vui lòng chọn chi nhánh để quản lý đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Chi nhánh: {selectedBranch.name}</p>
        </div>
        <button
          onClick={openCreateOrder}
          disabled={!activeSession}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Tạo đơn mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tables & Session */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Chọn bàn</h3>
            
            {/* Table Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`p-3 rounded-lg border-2 transition ${
                    selectedTable?.id === table.id
                      ? 'border-orange-500 bg-orange-50'
                      : table.status === 'available'
                      ? 'border-green-200 bg-green-50 hover:border-green-400'
                      : table.status === 'occupied'
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">Bàn {table.tableCode}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {table.status === 'available' ? '✓ Trống' : table.status === 'occupied' ? '● Đang dùng' : '◐ Đặt trước'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Session Info */}
            {selectedTable && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-gray-700">Bàn {selectedTable.tableCode}</p>
                  <p className="text-xs text-gray-500">Sức chứa: {selectedTable.capacity} người</p>
                </div>

                {activeSession ? (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-green-700">Phiên đang hoạt động</p>
                      <p className="text-xs text-green-600 mt-1">
                        Mở lúc: {new Date(activeSession.openedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseSession}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                    >
                      Đóng phiên
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600">Chưa có phiên hoạt động</p>
                    </div>
                    <button
                      onClick={handleOpenSession}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      Mở phiên mới
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Orders List */}
        <div className="lg:col-span-2">
          {/* Orders */}
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <p className="text-gray-400">Chưa có đơn hàng nào từ các bàn đang mở</p>
              </div>
            ) : (
              orders
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((order) => {
                  const isExpanded = expandedId === order.id;
                  const status = STATUS_MAP[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-700' };
                  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div
                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="font-semibold text-gray-800">{order.orderNumber}</span>
                          {orderTableMap[order.id] && (
                            <span className="text-xs px-2 py-1 rounded-full font-medium bg-purple-100 text-purple-700">
                              Bàn {orderTableMap[order.id]}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600 text-sm">{formatPrice(total)}</span>
                          
                          {NEXT_STATUS[order.status] && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateStatus(order.id, order.status);
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition ${NEXT_STATUS[order.status].btnColor}`}
                            >
                              {NEXT_STATUS[order.status].label}
                            </button>
                          )}
                          
                          {(order.status === 'NEW' || order.status === 'PREPARING') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelOrder(order.id);
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Hủy đơn"
                            >
                              <X size={16} />
                            </button>
                          )}
                          
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                          {order.note && (
                            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                              <strong>Ghi chú:</strong> {order.note}
                            </div>
                          )}
                          
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-500 text-xs border-b border-gray-200">
                                <th className="pb-2">Món ăn</th>
                                <th className="pb-2 text-center">SL</th>
                                <th className="pb-2 text-right">Đơn giá</th>
                                <th className="pb-2 text-right">Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                  <td className="py-2 text-gray-700">{item.dishName}</td>
                                  <td className="py-2 text-center text-gray-700">{item.quantity}</td>
                                  <td className="py-2 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                                  <td className="py-2 text-right font-medium text-gray-800">
                                    {formatPrice(item.unitPrice * item.quantity)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="font-bold">
                                <td colSpan={3} className="pt-2 text-right text-gray-700">Tổng cộng:</td>
                                <td className="pt-2 text-right text-orange-600">{formatPrice(total)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Tạo đơn hàng mới</h3>
              <button onClick={() => setShowOrderModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6">
              {/* Order Items */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Món ăn</label>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition"
                  >
                    <Plus size={12} />
                    Thêm món
                  </button>
                </div>

                <div className="space-y-2">
                  {orderItems.map((item, idx) => {
                    const dish = branchDishes.find(d => d.dishId === item.dishId);
                    
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={item.dishId}
                          onChange={(e) => updateOrderItem(idx, 'dishId', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          required
                        >
                          {branchDishes.map((bd) => (
                            <option key={bd.dishId} value={bd.dishId}>
                              {bd.dishName} — {formatPrice(bd.price)}
                            </option>
                          ))}
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(idx, 'quantity', Number(e.target.value))}
                          className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                          placeholder="SL"
                          required
                        />

                        <div className="w-32 text-right text-sm font-medium text-gray-700">
                          {formatPrice((dish?.price || 0) * item.quantity)}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeOrderItem(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          disabled={orderItems.length === 1}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Tổng cộng:</span>
                  <span className="text-xl font-bold text-orange-600">{formatPrice(calculateTotal(orderItems))}</span>
                </div>
              </div>

              {/* Note */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Ghi chú đặc biệt..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Tạo đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
