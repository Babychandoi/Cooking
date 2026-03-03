import { NavLink } from 'react-router-dom';
import {
  Beef,
  UtensilsCrossed,
  ShoppingCart,
  LayoutDashboard,
  Users,
  MapPin,
  Grid3x3,
  Receipt,
} from 'lucide-react';
import { useAuth } from './AuthContext';

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan', adminOnly: false },
  { to: '/branches', icon: MapPin, label: 'Chi nhánh', adminOnly: true },
  { to: '/tables', icon: Grid3x3, label: 'Bàn ăn', adminOnly: false },
  { to: '/ingredients', icon: Beef, label: 'Nguyên liệu', adminOnly: false },
  { to: '/dishes', icon: UtensilsCrossed, label: 'Món ăn', adminOnly: false },
  { to: '/orders', icon: ShoppingCart, label: 'Đơn hàng', adminOnly: false },
  { to: '/invoices', icon: Receipt, label: 'Hóa đơn', adminOnly: false },
  { to: '/employees', icon: Users, label: 'Nhân viên', adminOnly: true },
];

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const visibleItems = menuItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 text-white">
          <UtensilsCrossed size={22} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Cooking</h1>
          <p className="text-xs text-gray-400">Quản lý nhà bếp</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="mt-4 px-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 border-r-3 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
