import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';
import AuthCard from '../components/AuthCard';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Reset token is missing in URL. Please request a new link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Cannot reset password without token.');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      toast.success('Password updated successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to reset password. The link might be expired.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Card Footer
  const footerContent = (
    <Link 
      to="/login" 
      className="inline-flex items-center gap-1.5 text-xs text-[#4f46e5] hover:text-[#4338ca] font-bold transition-colors"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Login
    </Link>
  );

  return (
    <AuthCard footer={footerContent}>
      <p className="text-sm text-neutral-500 mb-5 font-sans leading-relaxed">
        Enter a new secure password for your account below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="password">
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-3 pr-10 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !token}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#374bd5] hover:bg-[#2c3dbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
