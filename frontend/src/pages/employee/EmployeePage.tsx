import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ShieldCheck, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { userApi } from '../../services/cookingApi';
import { UserResponse, CreateUserRequest, UpdateUserRequest } from '../../types/user';

export default function EmployeePage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await userApi.getAll();
      setUsers(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ fullName: '', email: '', password: '', phone: '', role: 'USER' });
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (item: UserResponse) => {
    setEditingId(item.id);
    setEditForm({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone,
      role: item.role,
      isActive: item.isActive,
    });
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const payload: UpdateUserRequest = { ...editForm };
        if (!payload.password) delete payload.password;
        await userApi.update(editingId, payload);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await userApi.create(form);
        toast.success('Tạo nhân viên thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'Xóa nhân viên?',
      text: `Bạn có chắc muốn xóa "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Hủy',
      confirmButtonText: 'Xóa',
    });
    if (result.isConfirmed) {
      try {
        await userApi.delete(id);
        toast.success('Đã xóa nhân viên');
        loadData();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Không thể xóa');
      }
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus size={18} />
          Thêm nhân viên
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                <th className="px-6 py-4 text-left font-semibold">#</th>
                <th className="px-6 py-4 text-left font-semibold">Họ tên</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Số điện thoại</th>
                <th className="px-6 py-4 text-center font-semibold">Vai trò</th>
                <th className="px-6 py-4 text-center font-semibold">Trạng thái</th>
                <th className="px-6 py-4 text-center font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    Không tìm thấy nhân viên nào
                  </td>
                </tr>
              ) : (
                filtered.map((u, idx) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          {u.role === 'ADMIN' ? (
                            <ShieldCheck size={16} className="text-orange-600" />
                          ) : (
                            <User size={16} className="text-gray-500" />
                          )}
                        </div>
                        <span className="font-medium text-gray-800">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-gray-600">{u.phone || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {u.role === 'ADMIN' ? 'Admin' : 'Nhân viên'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          u.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {u.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={editingId ? editForm.fullName || '' : form.fullName}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, fullName: e.target.value })
                      : setForm({ ...form, fullName: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={editingId ? editForm.email || '' : form.email}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, email: e.target.value })
                      : setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingId ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingId}
                    minLength={6}
                    value={editingId ? editForm.password || '' : form.password}
                    onChange={(e) =>
                      editingId
                        ? setEditForm({ ...editForm, password: e.target.value })
                        : setForm({ ...form, password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editingId ? editForm.phone || '' : form.phone}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, phone: e.target.value })
                      : setForm({ ...form, phone: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  value={editingId ? editForm.role || 'USER' : form.role}
                  onChange={(e) =>
                    editingId
                      ? setEditForm({ ...editForm, role: e.target.value as 'USER' | 'ADMIN' })
                      : setForm({ ...form, role: e.target.value as 'USER' | 'ADMIN' })
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                >
                  <option value="USER">Nhân viên</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {editingId && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, isActive: !editForm.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      editForm.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        editForm.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-500">
                    {editForm.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition shadow-sm"
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
