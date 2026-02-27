import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser } from '../../services/service';
import { useAuth } from '../../component/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      if (res.data?.token) {
        await login(res.data.token, res.data.refreshToken);
        toast.success('Đăng nhập thành công');
        navigate('/');
      } else {
        toast.error(res.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white mb-4">
            <UtensilsCrossed size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cooking</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý nhà bếp thông minh</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Đăng nhập</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cooking.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          {/* <p className="text-center text-sm text-gray-500 mt-6">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-700 font-medium">
              Đăng ký
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}
