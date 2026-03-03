import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, PackagePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useBranch } from '../../component/BranchContext';
import {
  IngredientResponse,
  CreateIngredientRequest,
  UpdateIngredientRequest,
  BranchIngredientResponse,
  CreateBranchIngredientRequest,
  UpdateBranchIngredientRequest,
  RestockBranchIngredientRequest,
} from '../../types/cooking';
import { ingredientApi, branchIngredientApi } from '../../services/cookingApi';
import Pagination from '../../component/Pagination';

export default function IngredientPageNew() {
  const { selectedBranch } = useBranch();
  
  // Ingredients (Master data)
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  // Branch Ingredients (Stock per branch)
  const [branchIngredients, setBranchIngredients] = useState<BranchIngredientResponse[]>([]);
  
  // Ingredient Modal
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [editingIngredientId, setEditingIngredientId] = useState<string | null>(null);
  const [ingredientForm, setIngredientForm] = useState<CreateIngredientRequest>({
    name: '',
    unit: '',
  });
  
  // Branch Ingredient Modal (Stock management)
  const [showBranchIngredientModal, setShowBranchIngredientModal] = useState(false);
  const [editingBranchIngredient, setEditingBranchIngredient] = useState<BranchIngredientResponse | null>(null);
  const [branchIngredientForm, setBranchIngredientForm] = useState<CreateBranchIngredientRequest>({
    branchId: '',
    ingredientId: '',
    stock: 0,
  });
  
  // Restock Modal
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockBranchIngredientId, setRestockBranchIngredientId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');

  useEffect(() => {
    loadData();
  }, [page, search, selectedBranch]);

  const loadData = async () => {
    try {
      const ingredientRes = await ingredientApi.getAll({ page, limit: 20, search });
      if (ingredientRes.success && ingredientRes.data) {
        setIngredients(ingredientRes.data.items);
        setTotalPages(ingredientRes.data.totalPages);
      }
      
      // Load branch ingredients if branch selected
      if (selectedBranch) {
        const branchIngredientRes = await branchIngredientApi.getByBranch(selectedBranch.id);
        if (branchIngredientRes.success && branchIngredientRes.data) {
          setBranchIngredients(branchIngredientRes.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  };

  const getBranchIngredientForIngredient = (ingredientId: string): BranchIngredientResponse | undefined => {
    return branchIngredients.find(bi => bi.ingredientId === ingredientId);
  };

  // ===== INGREDIENT CRUD =====
  
  const openCreateIngredient = () => {
    setEditingIngredientId(null);
    setIngredientForm({ name: '', unit: '' });
    setShowIngredientModal(true);
  };

  const openEditIngredient = (ingredient: IngredientResponse) => {
    setEditingIngredientId(ingredient.id);
    setIngredientForm({ name: ingredient.name, unit: ingredient.unit });
    setShowIngredientModal(true);
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingIngredientId) {
        await ingredientApi.update(editingIngredientId, ingredientForm as UpdateIngredientRequest);
        toast.success('Cập nhật nguyên liệu thành công');
      } else {
        await ingredientApi.create(ingredientForm);
        toast.success('Tạo nguyên liệu thành công');
      }

      setShowIngredientModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu nguyên liệu');
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa nguyên liệu "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await ingredientApi.delete(id);
        toast.success('Đã xóa nguyên liệu');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi xóa nguyên liệu');
      }
    }
  };

  // ===== BRANCH INGREDIENT CRUD =====
  
  const openManageStock = (ingredient: IngredientResponse) => {
    if (!selectedBranch) {
      toast.warning('Vui lòng chọn chi nhánh');
      return;
    }

    const existing = getBranchIngredientForIngredient(ingredient.id);
    
    if (existing) {
      // Edit existing
      setEditingBranchIngredient(existing);
      setBranchIngredientForm({
        branchId: existing.branchId,
        ingredientId: existing.ingredientId,
        stock: parseFloat(existing.stockQuantity),
      });
    } else {
      // Create new
      setEditingBranchIngredient(null);
      setBranchIngredientForm({
        branchId: selectedBranch.id,
        ingredientId: ingredient.id,
        stock: 0,
      });
    }
    
    setShowBranchIngredientModal(true);
  };

  const handleSaveBranchIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranchIngredient) {
        await branchIngredientApi.update(editingBranchIngredient.id, {
          stock: branchIngredientForm.stock,
        } as UpdateBranchIngredientRequest);
        toast.success('Cập nhật tồn kho thành công');
      } else {
        await branchIngredientApi.create(branchIngredientForm);
        toast.success('Thêm nguyên liệu vào chi nhánh thành công');
      }

      setShowBranchIngredientModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu tồn kho');
    }
  };

  const openRestock = (branchIngredient: BranchIngredientResponse) => {
    setRestockBranchIngredientId(branchIngredient.id);
    setRestockQty('');
    setShowRestockModal(true);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockBranchIngredientId) return;

    try {
      await branchIngredientApi.restock(restockBranchIngredientId, {
        quantity: Number(restockQty),
      } as RestockBranchIngredientRequest);
      toast.success('Nhập kho thành công');
      setShowRestockModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi nhập kho');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nguyên liệu</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedBranch ? `Chi nhánh: ${selectedBranch.name}` : 'Chọn chi nhánh để xem tồn kho'}
          </p>
        </div>
        <button
          onClick={openCreateIngredient}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Thêm nguyên liệu
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm nguyên liệu..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên nguyên liệu</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn vị</th>
              {selectedBranch && (
                <>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </>
              )}
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingredients.map((ingredient) => {
              const branchIngredient = getBranchIngredientForIngredient(ingredient.id);
              const stock = branchIngredient ? parseFloat(branchIngredient.stockQuantity) : 0;
              const hasLowStock = branchIngredient && stock < 1;
              
              return (
                <tr key={ingredient.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{ingredient.name}</td>
                  <td className="px-5 py-3 text-gray-600">{ingredient.unit}</td>
                  
                  {selectedBranch && (
                    <>
                      <td className="px-5 py-3 text-right font-medium text-gray-800">
                        {branchIngredient ? stock.toFixed(2) : '-'}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {branchIngredient ? (
                          hasLowStock ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Sắp hết
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Đủ
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-gray-400 italic">Chưa có</span>
                        )}
                      </td>
                    </>
                  )}
                  
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {selectedBranch && (
                        <>
                          {branchIngredient ? (
                            <button
                              onClick={() => openRestock(branchIngredient)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                              title="Nhập kho"
                            >
                              <PackagePlus size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => openManageStock(ingredient)}
                              className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded transition"
                              title="Thêm vào chi nhánh"
                            >
                              Thêm
                            </button>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => openEditIngredient(ingredient)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                        title="Sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteIngredient(ingredient.id, ingredient.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Ingredient Modal */}
      {showIngredientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingIngredientId ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
              </h3>
              <button onClick={() => setShowIngredientModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="p-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu</label>
                  <input
                    type="text"
                    required
                    value={ingredientForm.name}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <input
                    type="text"
                    required
                    value={ingredientForm.unit}
                    onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="kg, lít, gói..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowIngredientModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {editingIngredientId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Ingredient Modal (Stock Management) */}
      {showBranchIngredientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingBranchIngredient ? 'Cập nhật tồn kho' : 'Thêm nguyên liệu vào chi nhánh'}
              </h3>
              <button onClick={() => setShowBranchIngredientModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBranchIngredient} className="p-6">
              <div className="space-y-4">
                {/* Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={branchIngredientForm.stock}
                    onChange={(e) => setBranchIngredientForm({ ...branchIngredientForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBranchIngredientModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {editingBranchIngredient ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Nhập kho</h3>
              <button onClick={() => setShowRestockModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRestock} className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng nhập thêm</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Nhập số lượng..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
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
