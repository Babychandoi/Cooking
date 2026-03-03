import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useBranch } from '../../component/BranchContext';
import {
  TableResponse,
  CreateTableRequest,
  UpdateTableRequest,
} from '../../types/cooking';
import { tableApi } from '../../services/cookingApi';

export default function TablePage() {
  const { selectedBranch } = useBranch();
  
  const [tables, setTables] = useState<TableResponse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTableRequest>({
    branchId: '',
    tableCode: '1',
    capacity: 4,
  });

  const loadData = useCallback(async () => {
    if (!selectedBranch) return;
    
    try {
      const res = await tableApi.getByBranch(selectedBranch.id);
      if (res.success && res.data) {
        setTables(res.data.sort((a, b) => a.tableCode.localeCompare(b.tableCode)));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    if (!selectedBranch) {
      toast.warning('Vui lòng chọn chi nhánh');
      return;
    }
    
    setEditingId(null);
    setForm({
      branchId: selectedBranch.id,
      tableCode: `${tables.length + 1}`,
      capacity: 4,
    });
    setShowModal(true);
  };

  const openEdit = (table: TableResponse) => {
    setEditingId(table.id);
    setForm({
      branchId: table.branchId,
      tableCode: table.tableCode,
      capacity: table.capacity,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await tableApi.update(editingId, form as UpdateTableRequest);
        toast.success('Cập nhật bàn thành công');
      } else {
        await tableApi.create(form);
        toast.success('Tạo bàn thành công');
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu bàn');
    }
  };

  const handleDelete = async (id: string, tableCode: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa bàn ${tableCode}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await tableApi.delete(id);
        toast.success('Đã xóa bàn');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi xóa bàn');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Trống';
      case 'occupied':
        return 'Đang dùng';
      case 'reserved':
        return 'Đặt trước';
      default:
        return status;
    }
  };

  if (!selectedBranch) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Vui lòng chọn chi nhánh để quản lý bàn ăn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bàn ăn</h1>
          <p className="text-sm text-gray-500 mt-1">Chi nhánh: {selectedBranch.name}</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Thêm bàn mới
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`relative border-2 rounded-xl p-4 transition hover:shadow-md ${getStatusColor(table.status)}`}
          >
            <div className="text-center mb-3">
              <p className="text-2xl font-bold">Bàn {table.tableCode}</p>
              <p className="text-xs mt-1">{table.capacity} người</p>
            </div>

            <div className="text-center mb-3">
              <span className="text-xs font-medium">{getStatusLabel(table.status)}</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              <button
                onClick={() => openEdit(table)}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                title="Sửa"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(table.id, table.tableCode)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Xóa"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Chưa có bàn nào. Thêm bàn mới để bắt đầu.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Sửa bàn' : 'Thêm bàn mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã bàn</label>
                  <input
                    type="text"
                    required
                    value={form.tableCode}
                    onChange={(e) => setForm({ ...form, tableCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="VD: A1, B2, VIP1..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa (người)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
