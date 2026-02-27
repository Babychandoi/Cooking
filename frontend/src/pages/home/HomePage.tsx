import React, { useEffect, useState } from 'react';
import { Beef, UtensilsCrossed, BookOpen, ShoppingCart } from 'lucide-react';
import { ingredientApi, dishApi, recipeApi, orderApi } from '../../services/cookingApi';

export default function HomePage() {
  const [stats, setStats] = useState({
    ingredients: 0,
    dishes: 0,
    recipes: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ingRes, dishRes, recipeRes, orderRes] = await Promise.all([
        ingredientApi.getAll(),
        dishApi.getAll(),
        recipeApi.getAll(),
        orderApi.getAll(),
      ]);

      setStats({
        ingredients: ingRes.data?.total || 0,
        dishes: dishRes.data?.total || 0,
        recipes: recipeRes.data?.total || 0,
        orders: orderRes.data?.total || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Nguyên liệu', value: stats.ingredients, icon: Beef, color: 'bg-blue-500', bgLight: 'bg-blue-50' },
    { label: 'Món ăn', value: stats.dishes, icon: UtensilsCrossed, color: 'bg-green-500', bgLight: 'bg-green-50' },
    { label: 'Công thức', value: stats.recipes, icon: BookOpen, color: 'bg-purple-500', bgLight: 'bg-purple-50' },
    { label: 'Đơn hàng', value: stats.orders, icon: ShoppingCart, color: 'bg-orange-500', bgLight: 'bg-orange-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgLight} p-3 rounded-lg`}>
                <card.icon size={24} className={`${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
