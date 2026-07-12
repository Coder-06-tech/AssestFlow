import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AuthCard from '../components/AuthCard';
import { ArrowRight } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !designation) {
      toast.warning('Please complete all form fields.');
      return;
    }

    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, designation);
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Card Footer
  const footerContent = (
    <>
      <span className="text-neutral-500">Already have an account?</span>
      <Link 
        to="/login" 
        className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-lg shadow-sm transition-colors text-xs"
      >
        Sign In
      </Link>
    </>
  );

  return (
    <AuthCard footer={footerContent}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

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

        {/* Designation */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="designation">
            Designation / Role Title
          </label>
          <input
            id="designation"
            type="text"
            required
            placeholder="e.g. System Admin, Asset Manager, Department Head"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="block w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
          <p className="text-[10px] text-slate-400 leading-normal font-medium">
            * Enter <span className="font-bold text-slate-650 text-slate-600">"Admin"</span>, <span className="font-bold text-slate-650 text-slate-600">"Manager"</span>, or <span className="font-bold text-slate-650 text-slate-600">"Head"</span> in designation to assign the corresponding system permissions.
          </p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
          />
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#374bd5] hover:bg-[#2c3dbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? 'Creating Account...' : (
            <>
              Create Account <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

      </form>
    </AuthCard>
  );
};

export default Signup;
