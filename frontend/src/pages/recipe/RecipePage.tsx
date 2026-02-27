import React, { useEffect, useState } from 'react';
import { Plus, ChevronDown, ChevronUp, Trash2, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { recipeApi, dishApi, ingredientApi } from '../../services/cookingApi';
import {
  RecipeResponse,
  CreateRecipeRequest,
  RecipeItemRequest,
  DishResponse,
  IngredientResponse,
} from '../../types/cooking';

export default function RecipePage() {
  const [recipes, setRecipes] = useState<RecipeResponse[]>([]);
  const [dishes, setDishes] = useState<DishResponse[]>([]);
  const [ingredients, setIngredients] = useState<IngredientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<number>(0);
  const [items, setItems] = useState<RecipeItemRequest[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recipesRes, dishesRes, ingredientsRes] = await Promise.all([
        recipeApi.getAll(),
        dishApi.getAll(),
        ingredientApi.getAll(),
      ]);
      setRecipes(recipesRes.data || []);
      setDishes(dishesRes.data || []);
      setIngredients(ingredientsRes.data || []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setSelectedDishId(dishes[0]?.id || 0);
    setItems([{ ingredientId: ingredients[0]?.id || 0, quantity: 1, unit: ingredients[0]?.unit || '' }]);
    setShowModal(true);
  };

  const openEdit = (recipe: RecipeResponse) => {
    setEditingId(recipe.id);
    setSelectedDishId(recipe.dishId);
    setItems(
      recipe.items.map((it) => ({
        ingredientId: it.ingredientId,
        quantity: it.quantity,
        unit: it.unit,
      })),
    );
    setShowModal(true);
  };

  const addItem = () => {
    setItems([
      ...items,
      { ingredientId: ingredients[0]?.id || 0, quantity: 1, unit: ingredients[0]?.unit || '' },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof RecipeItemRequest, value: any) => {
    const updated = [...items];
    (updated[idx] as any)[field] = value;
    if (field === 'ingredientId') {
      const ing = ingredients.find((i) => i.id === Number(value));
      if (ing) updated[idx].unit = ing.unit;
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.warning('Cần ít nhất 1 nguyên liệu');
      return;
    }
    const payload: CreateRecipeRequest = {
      dishId: selectedDishId,
      items: items.map((it) => ({
        ingredientId: Number(it.ingredientId),
        quantity: Number(it.quantity),
        unit: it.unit,
      })),
    };
    try {
      if (editingId) {
        await recipeApi.update(editingId, payload);
        toast.success('Cập nhật công thức thành công');
      } else {
        await recipeApi.create(payload);
        toast.success('Thêm công thức thành công');
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const filtered = recipes.filter(
    (r) =>
      r.dishName.toLowerCase().includes(search.toLowerCase()),
  );

  // Group by dishName
  const grouped = filtered.reduce<Record<string, RecipeResponse[]>>((acc, r) => {
    const key = r.dishName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

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
            placeholder="Tìm theo tên món..."
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
          Thêm công thức
        </button>
      </div>

      {/* Recipe List grouped by Dish */}
      <div className="space-y-3">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-10 text-gray-400">Không có dữ liệu</div>
        )}
        {Object.entries(grouped).map(([dishName, versions]) => (
          <div
            key={dishName}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {versions
              .sort((a, b) => b.version - a.version)
              .map((recipe) => {
                const isExpanded = expandedId === recipe.id;
                return (
                  <div key={recipe.id} className="border-b last:border-b-0 border-gray-50">
                    <div
                      className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-800">{recipe.dishName}</span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          v{recipe.version}
                        </span>
                        {recipe.isActive && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!recipe.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              Swal.fire({
                                title: 'Chuyển công thức',
                                html: `Sử dụng <b>${recipe.dishName} v${recipe.version}</b> thay cho phiên bản hiện tại?`,
                                icon: 'question',
                                showCancelButton: true,
                                confirmButtonColor: '#22c55e',
                                cancelButtonColor: '#6b7280',
                                confirmButtonText: 'Sử dụng',
                                cancelButtonText: 'Hủy',
                              }).then(async (result) => {
                                if (result.isConfirmed) {
                                  try {
                                    await recipeApi.activate(recipe.id);
                                    toast.success(`Đã chuyển sang v${recipe.version}`);
                                    loadData();
                                  } catch (err: any) {
                                    toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
                                  }
                                }
                              });
                            }}
                            className="text-xs px-3 py-1 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition"
                          >
                            Sử dụng
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(recipe);
                          }}
                          className="text-xs px-3 py-1 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                        >
                          Chỉnh sửa
                        </button>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-5 pb-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Ngày tạo: {new Date(recipe.createdAt).toLocaleString('vi-VN')}
                        </p>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-gray-500 border-b border-gray-100">
                              <th className="py-2 font-medium">Nguyên liệu</th>
                              <th className="py-2 font-medium">Số lượng</th>
                              <th className="py-2 font-medium">Đơn vị</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recipe.items.map((item) => (
                              <tr key={item.id} className="border-b border-gray-50 last:border-0">
                                <td className="py-2 text-gray-700">{item.ingredientName}</td>
                                <td className="py-2 text-gray-700">{item.quantity}</td>
                                <td className="py-2 text-gray-500">{item.unit}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Chỉnh sửa công thức' : 'Thêm công thức'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Món ăn</label>
                <select
                  value={selectedDishId}
                  onChange={(e) => setSelectedDishId(Number(e.target.value))}
                  disabled={!!editingId}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:bg-gray-100"
                >
                  {dishes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Nguyên liệu</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                  >
                    + Thêm dòng
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={item.ingredientId}
                        onChange={(e) => updateItem(idx, 'ingredientId', Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                        placeholder="SL"
                      />
                      <span className="w-12 text-sm text-gray-500 text-center">{item.unit}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
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
                  {editingId ? 'Lưu' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
