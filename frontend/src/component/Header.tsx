import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from './AuthContext';

const pageTitles: Record<string, string> = {
  '/': 'Tổng quan',
  '/ingredients': 'Quản lý Nguyên liệu',
  '/dishes': 'Quản lý Món ăn',
  '/recipes': 'Quản lý Công thức',
  '/orders': 'Quản lý Đơn hàng',
  '/employees': 'Quản lý Nhân viên',
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const title = pageTitles[location.pathname] || 'Cooking App';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell size={20} />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1 transition"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">{initials}</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.fullName || 'User'}
              </span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
