import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { dishApi } from '../../services/cookingApi';
import { DishResponse, CreateDishRequest, UpdateDishRequest } from '../../types/cooking';

export default function DishPage() {
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateDishRequest>({
    name: '',
    description: '',
    price: 0,
    isAvailable: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await dishApi.getAll();
      setDishes(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách món ăn');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', description: '', price: 0, isAvailable: false });
    setShowModal(true);
  };

  const openEdit = (item: DishResponse) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dishApi.update(editingId, form as UpdateDishRequest);
        toast.success('Cập nhật thành công');
      } else {
        await dishApi.create(form);
        toast.success('Thêm thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (result.isConfirmed) {
      try {
        await dishApi.delete(id);
        toast.success('Đã xóa');
        loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filtered = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 w-full sm:w-72"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Thêm món ăn
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((dish) => (
          <div
            key={dish.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{dish.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {dish.description || 'Không có mô tả'}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  dish.isAvailable
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {dish.isAvailable ? 'Có sẵn' : 'Hết'}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg font-bold text-orange-600">
                {formatPrice(dish.price)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(dish)}
                  className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                  title="Sửa"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(dish.id, dish.name)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400">
            Không có dữ liệu
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Sửa món ăn' : 'Thêm món ăn'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isAvailable}
                      onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-300"
                    />
                    <span className="text-sm text-gray-700">Có sẵn</span>
                  </label>
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
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
