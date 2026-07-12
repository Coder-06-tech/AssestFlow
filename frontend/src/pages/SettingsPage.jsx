import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userApi from '../services/userService';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  Briefcase, 
  CheckCircle2, 
  Save, 
  Shield, 
  Bell, 
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const SettingsPage = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    designation: '',
    password: '',
    confirmPassword: '',
    profilePhoto: ''
  });

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        designation: user.designation || '',
        password: '',
        confirmPassword: '',
        profilePhoto: user.profilePhoto || ''
      });
    }
  }, [user]);

  // Handle Photo Upload (Base64 conversion)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        profilePhoto: reader.result
      }));
      toast.success('New profile photo loaded. Remember to click Save Changes to persist.');
    };
    reader.readAsDataURL(file);
  };

  // Submit Profile Changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        email: formData.email,
        designation: formData.designation,
        profilePhoto: formData.profilePhoto
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await userApi.updateProfile(payload);

      if (res.success) {
        toast.success('Settings updated successfully!');
        // Refresh Auth Context user info
        await refreshUser();
        // Clear passwords
        setFormData(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h1 className="text-lg font-bold text-slate-800">Account Settings</h1>
        
        <div className="flex items-center gap-4.5 justify-end">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            <Bell size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PROFILE CARD SUMMARY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-5 h-fit">
          
          {/* Avatar Container */}
          <div className="relative group">
            {formData.profilePhoto ? (
              <img 
                src={formData.profilePhoto} 
                alt="Profile Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-50/50 shadow-sm transition-all"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center border-4 border-blue-50/50 shadow-sm uppercase">
                {formData.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            
            {/* Camera Overlay Button */}
            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md shadow-blue-500/10 border-2 border-white transition-all">
              <Camera size={14} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden"
              />
            </label>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-850 text-slate-800">{formData.name || 'Your Name'}</h2>
            <p className="text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
              <Briefcase size={12} />
              <span>{formData.designation || 'No Designation Set'}</span>
            </p>
            <p className="text-[11px] text-slate-450 font-medium text-slate-500">{formData.email}</p>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
              {user?.role || 'EMPLOYEE'}
            </span>
            <span className="px-2.5 py-0.5 border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
              {user?.status || 'ACTIVE'}
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: DETAILED EDIT SETTINGS FORM */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-bold text-slate-455 text-slate-500 uppercase tracking-wider">Profile Credentials</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <User size={12} className="text-slate-500" />
                  <span>Full Name</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                  required
                />
              </div>

              {/* Mail ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail size={12} className="text-slate-500" />
                  <span>Mail ID</span>
                </label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                  required
                />
              </div>

              {/* Designation */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Briefcase size={12} className="text-slate-500" />
                  <span>Designation / Role Title</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Lead UI Designer"
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>

            </div>

            <div className="border-b border-slate-100 pb-4 pt-2">
              <h3 className="text-xs font-bold text-slate-455 text-slate-500 uppercase tracking-wider">Change Password</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold">
              
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-slate-500" />
                  <span>New Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock size={12} className="text-slate-500" />
                  <span>Confirm New Password</span>
                </label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>

            </div>

            {/* ACTION ROW */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-2">
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-55"
              >
                <Save size={13} />
                <span>{loading ? 'Saving Settings...' : 'Save Changes'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};

export default SettingsPage;
