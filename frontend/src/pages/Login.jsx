import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AuthCard from '../components/AuthCard';
import { Eye, EyeOff, ArrowRight, Chrome, ShieldAlert, Contact, Landmark, Fingerprint } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid email or password.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleComingSoon = (provider) => {
    toast.info(`${provider} integration is coming soon!`);
  };

  // Card Footer
  const footerContent = (
    <>
      <span className="text-neutral-500">New here?</span>
      <Link 
        to="/signup" 
        className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg shadow-sm transition-colors text-xs"
      >
        Create Account
      </Link>
    </>
  );

  return (
    <AuthCard footer={footerContent}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
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

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#374bd5] hover:bg-[#2c3dbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Signing In...' : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-neutral-200"></div>
          <span className="flex-shrink mx-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Or continue with
          </span>
          <div className="flex-grow border-t border-neutral-200"></div>
        </div>

        {/* Google & SSO Row */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleComingSoon('Google')}
            className="flex justify-center items-center gap-2 py-2.5 px-4 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors"
          >
            {/* SVG G Logo */}
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.6 5.6 0 0 1 8.35 13a5.6 5.6 0 0 1 5.641-5.6c1.478 0 2.822.548 3.847 1.448l3.12-3.12A9.97 9.97 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.518 0 9.99-4.482 9.99-10 0-.585-.053-1.157-.153-1.715z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleComingSoon('SSO')}
            className="flex justify-center items-center gap-2 py-2.5 px-4 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 shadow-sm transition-colors"
          >
            <Contact className="h-4.5 w-4.5 text-neutral-500" />
            SSO
          </button>
        </div>

      </form>
    </AuthCard>
  );
};

export default Login;
