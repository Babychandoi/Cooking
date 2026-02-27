import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, PackagePlus, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { ingredientApi } from '../../services/cookingApi';
import { IngredientResponse, CreateIngredientRequest, UpdateIngredientRequest } from '../../types/cooking';

export default function IngredientPage() {
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restockId, setRestockId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [form, setForm] = useState<CreateIngredientRequest>({
    name: '',
    unit: '',
    stock: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await ingredientApi.getAll();
      setIngredients(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách nguyên liệu');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', unit: '', stock: 0 });
    setShowModal(true);
  };

  const openEdit = (item: IngredientResponse) => {
    setEditingId(item.id);
    setForm({ name: item.name, unit: item.unit, stock: item.stock });
    setShowModal(true);
  };

  const openRestock = (item: IngredientResponse) => {
    setRestockId(item.id);
    setRestockQty('');
    setShowRestockModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await ingredientApi.update(editingId, form as UpdateIngredientRequest);
        toast.success('Cập nhật thành công');
      } else {
        await ingredientApi.create(form);
        toast.success('Thêm thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockId) return;
    try {
      await ingredientApi.restock(restockId, Number(restockQty));
      toast.success('Nhập kho thành công');
      setShowRestockModal(false);
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
        await ingredientApi.delete(id);
        toast.success('Đã xóa');
        loadData();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
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
            placeholder="Tìm kiếm nguyên liệu..."
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
          Thêm nguyên liệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">ID</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Tên</th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">Đơn vị</th>
                <th className="text-right px-5 py-3 text-gray-500 font-medium">Tồn kho</th>
                <th className="text-center px-5 py-3 text-gray-500 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600">{item.id}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-5 py-3 text-gray-600">{item.unit}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-800">{item.stock}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openRestock(item)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="Nhập kho"
                      >
                        <PackagePlus size={16} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                <input
                  type="text"
                  required
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
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

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nhập kho</h3>
            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng nhập thêm
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Nhập kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
