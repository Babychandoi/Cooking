import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, MapPin, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  BranchResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  RestaurantChainResponse,
} from '../../types/cooking';
import { branchApi, restaurantChainApi } from '../../services/cookingApi';
import Pagination from '../../component/Pagination';

export default function BranchPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [chains, setChains] = useState<RestaurantChainResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBranchRequest>({
    chainId: '',
    name: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    loadData();
    loadChains();
  }, [page, search]);

  const loadData = async () => {
    try {
      const res = await branchApi.getAll({ page, limit: 20, search });
      if (res.success && res.data) {
        // Handle both paginated and non-paginated responses
        if (Array.isArray(res.data)) {
          // Non-paginated response (plain array)
          const filtered = search 
            ? res.data.filter(b => 
                b.name.toLowerCase().includes(search.toLowerCase()) ||
                b.address.toLowerCase().includes(search.toLowerCase())
              )
            : res.data;
          setBranches(filtered);
          setTotalPages(1);
        } else {
          // Paginated response
          setBranches(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  };

  const loadChains = async () => {
    try {
      const res = await restaurantChainApi.getAll({ page: 1, limit: 100 });
      if (res.success && res.data) {
        // Handle both paginated and non-paginated responses
        if (Array.isArray(res.data)) {
          setChains(res.data);
        } else {
          setChains(res.data.items);
        }
      }
    } catch (error) {
      console.error('Failed to load chains:', error);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      chainId: chains[0]?.id || '',
      name: '',
      address: '',
      phone: '',
    });
    setShowModal(true);
  };

  const openEdit = (branch: BranchResponse) => {
    setEditingId(branch.id);
    setForm({
      chainId: branch.chainId,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await branchApi.update(editingId, form as UpdateBranchRequest);
        toast.success('Cập nhật chi nhánh thành công');
      } else {
        await branchApi.create(form);
        toast.success('Tạo chi nhánh thành công');
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu chi nhánh');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa chi nhánh "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await branchApi.delete(id);
        toast.success('Đã xóa chi nhánh');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi xóa chi nhánh');
      }
    }
  };

  const getChainName = (chainId: string) => {
    return chains.find(c => c.id === chainId)?.name || 'N/A';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các chi nhánh trong hệ thống</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Thêm chi nhánh
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm chi nhánh..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {branches && branches.length > 0 ? (
          branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{branch.name}</h3>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {getChainName(branch.chainId)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(branch)}
                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(branch.id, branch.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="shrink-0" />
                  <span>{branch.phone}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Tạo: {new Date(branch.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Chưa có chi nhánh nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Sửa chi nhánh' : 'Thêm chi nhánh mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                {/* Chain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chuỗi nhà hàng</label>
                  <select
                    required
                    value={form.chainId}
                    onChange={(e) => setForm({ ...form, chainId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    disabled={chains.length === 0}
                  >
                    {chains.length === 0 ? (
                      <option value="">Đang tải...</option>
                    ) : (
                      chains.map((chain) => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chi nhánh</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    rows={2}
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              {/* Actions */}
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
