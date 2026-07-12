import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';
import AuthCard from '../components/AuthCard';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.warning('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link generated!');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'An error occurred. Please try again.';
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
      {!submitted ? (
        <>
          <p className="text-sm text-neutral-500 mb-5 font-sans leading-relaxed">
            Enter your work email address to request a secure recovery link. Note that in this demo, the link will be logged to your backend console logs.
          </p>

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

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-bold text-white bg-[#374bd5] hover:bg-[#2c3dbf] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Requesting...' : 'Generate Reset Link'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-4">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 mb-2">Request Processed</h3>
          <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
            A secure password reset URL has been generated and printed to the **backend server console** logs. 
            Please check the terminal output to locate the URL and update your password.
          </p>
        </div>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
