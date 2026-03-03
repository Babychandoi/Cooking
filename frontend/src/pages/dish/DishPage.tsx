import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Eye, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useBranch } from '../../component/BranchContext';
import {
  DishResponse,
  CreateDishRequest,
  UpdateDishRequest,
  BranchDishResponse,
  CreateBranchDishRequest,
  UpdateBranchDishRequest,
} from '../../types/cooking';
import { dishApi, branchDishApi } from '../../services/cookingApi';
import Pagination from '../../component/Pagination';

export default function DishPageSimple() {
  const { selectedBranch } = useBranch();
  
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [branchDishes, setBranchDishes] = useState<BranchDishResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const [showDishModal, setShowDishModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishForm, setDishForm] = useState<CreateDishRequest>({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingBranchDish, setEditingBranchDish] = useState<BranchDishResponse | null>(null);
  const [priceForm, setPriceForm] = useState({ price: 0, isAvailable: true });

  const loadData = useCallback(async () => {
    try {
      const dishRes = await dishApi.getAll({ page, limit: 12, search });
      if (dishRes.success && dishRes.data) {
        setDishes(dishRes.data.items);
        setTotalPages(dishRes.data.totalPages);
      }
      
      if (selectedBranch) {
        const branchDishRes = await branchDishApi.getByBranch(selectedBranch.id);
        if (branchDishRes.success && branchDishRes.data) {
          setBranchDishes(branchDishRes.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi tải dữ liệu');
    }
  }, [page, search, selectedBranch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBranchDish = (dishId: string) => branchDishes.find(bd => bd.dishId === dishId);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const openCreateDish = () => {
    setEditingDishId(null);
    setDishForm({ name: '', description: '', imageUrl: '' });
    setSelectedImageFile(null);
    setImagePreview('');
    setShowDishModal(true);
  };

  const openEditDish = (dish: DishResponse) => {
    setEditingDishId(dish.id);
    setDishForm({ name: dish.name, description: dish.description, imageUrl: dish.imageUrl || '' });
    setSelectedImageFile(null);
    setImagePreview(dish.imageUrl || '');
    setShowDishModal(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = dishForm.imageUrl;
      
      if (selectedImageFile) {
        setUploadingImage(true);
        const uploadRes = await dishApi.uploadImage(selectedImageFile);
        if (uploadRes.success && uploadRes.data) {
          imageUrl = uploadRes.data.url;
        }
        setUploadingImage(false);
      }

      const payload = { ...dishForm, imageUrl };

      if (editingDishId) {
        await dishApi.update(editingDishId, payload as UpdateDishRequest);
        toast.success('Cập nhật món ăn thành công');
      } else {
        await dishApi.create(payload);
        toast.success('Tạo món ăn thành công');
      }

      setShowDishModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu món ăn');
    }
  };

  const handleDeleteDish = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc muốn xóa món "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (result.isConfirmed) {
      try {
        await dishApi.delete(id);
        toast.success('Đã xóa món ăn');
        loadData();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Lỗi xóa món ăn');
      }
    }
  };

  const openManagePrice = (dish: DishResponse) => {
    if (!selectedBranch) {
      toast.warning('Vui lòng chọn chi nhánh');
      return;
    }

    const existing = getBranchDish(dish.id);
    
    if (existing) {
      setEditingBranchDish(existing);
      setPriceForm({ price: existing.price, isAvailable: existing.isAvailable });
    } else {
      setEditingBranchDish(null);
      setPriceForm({ price: 0, isAvailable: true });
    }
    
    setShowPriceModal(true);
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    try {
      if (editingBranchDish) {
        await branchDishApi.update(editingBranchDish.id, priceForm as UpdateBranchDishRequest);
        toast.success('Cập nhật giá thành công');
      } else {
        const payload: CreateBranchDishRequest = {
          branchId: selectedBranch.id,
          dishId: dishes.find(d => !getBranchDish(d.id))?.id || '',
          ...priceForm,
        };
        await branchDishApi.create(payload);
        toast.success('Thêm món vào chi nhánh thành công');
      }

      setShowPriceModal(false);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi lưu giá món ăn');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Món ăn</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selectedBranch ? `Chi nhánh: ${selectedBranch.name}` : 'Chọn chi nhánh để xem giá'}
          </p>
        </div>
        <button
          onClick={openCreateDish}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Thêm món mới
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {dishes.map((dish) => {
          const branchDish = getBranchDish(dish.id);
          
          return (
            <div key={dish.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="relative h-48 bg-gray-100">
                {dish.imageUrl ? (
                  <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{dish.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{dish.description || 'Không có mô tả'}</p>

                {selectedBranch && branchDish ? (
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-orange-600">{formatPrice(branchDish.price)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${branchDish.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {branchDish.isAvailable ? 'Có sẵn' : 'Hết'}
                      </span>
                    </div>
                  </div>
                ) : selectedBranch ? (
                  <div className="mb-3">
                    <span className="text-sm text-gray-400 italic">Chưa có giá tại chi nhánh này</span>
                  </div>
                ) : (
                  <div className="mb-3">
                    <span className="text-sm text-gray-400 italic">Chọn chi nhánh để xem giá</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  {selectedBranch && (
                    <button
                      onClick={() => openManagePrice(dish)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition text-sm"
                      title="Quản lý giá"
                    >
                      <DollarSign size={14} />
                      Giá
                    </button>
                  )}
                  
                  <button
                    onClick={() => openEditDish(dish)}
                    className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg transition"
                    title="Sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteDish(dish.id, dish.name)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Dish Modal */}
      {showDishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingDishId ? 'Sửa món ăn' : 'Thêm món mới'}
              </h3>
              <button onClick={() => setShowDishModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên món</label>
                  <input
                    type="text"
                    required
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    rows={3}
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                  <div className="flex items-start gap-4">
                    {imagePreview && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="dish-image-upload"
                      />
                      <label
                        htmlFor="dish-image-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition text-sm"
                      >
                        <Upload size={16} />
                        Chọn ảnh
                      </label>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG, GIF (Max 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowDishModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {uploadingImage ? 'Đang tải ảnh...' : editingDishId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingBranchDish ? 'Cập nhật giá' : 'Thêm món vào chi nhánh'}
              </h3>
              <button onClick={() => setShowPriceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePrice} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={priceForm.price}
                    onChange={(e) => setPriceForm({ ...priceForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="price-available"
                    checked={priceForm.isAvailable}
                    onChange={(e) => setPriceForm({ ...priceForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-300"
                  />
                  <label htmlFor="price-available" className="text-sm text-gray-700">Có sẵn để bán</label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  {editingBranchDish ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
