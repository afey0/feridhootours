import React, { useState } from 'react';
import { X, User, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePlatformStore } from '../store/usePlatformStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword } = useAuthStore();
  const { bookings } = usePlatformStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync inputs on open/user load using a synchronous ref
  const hasInitializedRef = React.useRef(false);

  if (isOpen && user && !hasInitializedRef.current) {
    setName(user.name);
    setEmail(user.email);
    setProfileMessage(null);
    setPasswordMessage(null);
    hasInitializedRef.current = true;
  }

  if (!isOpen && hasInitializedRef.current) {
    hasInitializedRef.current = false;
  }

  if (!isOpen || !user) return null;

  // Calculate stats for this user
  const userBookings = bookings.filter(b => {
    if (user.role === 'admin') return false;
    if (user.role === 'agency') return b.agencyId === user.id;
    return b.passengers.some(p => p.name.toLowerCase() === user.name.toLowerCase()) || b.bookedBy === user.name;
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!name.trim() || !email.trim()) {
      setProfileMessage({ type: 'error', text: 'Name and Email are required.' });
      return;
    }

    const res = updateProfile(user.id, name, email);
    if (res.success) {
      setProfileMessage({ type: 'success', text: res.message });
    } else {
      setProfileMessage({ type: 'error', text: res.message });
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!newPassword) {
      setPasswordMessage({ type: 'error', text: 'Password field cannot be empty.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    const res = changePassword(user.id, newPassword);
    if (res.success) {
      setPasswordMessage({ type: 'success', text: res.message });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 pt-2 pb-8 text-left">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 transition cursor-pointer text-xs"
        >
          <ArrowLeft size={16} className="text-sky-600" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">My Account & Profile</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative text-slate-800 text-left">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center text-left">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <User className="text-sky-600" size={22} />
              My Profile Settings
            </h3>
            <p className="text-slate-500 text-xs mt-1 font-medium">Update account credentials and change your password.</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-left">
          
          {/* Account Summary */}
          <div className="bg-sky-50/50 border border-sky-100/70 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg font-black shadow-md shadow-sky-500/10">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="text-sm font-black text-slate-805 block">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                  ID: {user.id} | {user.role === 'admin' ? 'Operator Admin' : user.role === 'agency' ? 'Travel Agent' : 'Passenger'}
                </span>
              </div>
            </div>
            {user.role !== 'admin' && (
              <div className="text-right">
                <span className="text-lg font-black text-sky-600 block">{userBookings.length}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">Total Bookings</span>
              </div>
            )}
          </div>

          {/* Form 1: Edit Profile details */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-slate-400" /> General Profile Information
            </h4>
            
            {profileMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${
                profileMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {profileMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-md shadow-sky-500/10"
              >
                Save Profile Details
              </button>
            </div>
          </form>

          {/* Form 2: Change Password */}
          <form onSubmit={handleUpdatePassword} className="space-y-4 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Lock size={14} className="text-slate-400" /> Security & Password
            </h4>

            {passwordMessage && (
              <div className={`p-3 rounded-xl text-xs font-semibold border ${
                passwordMessage.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500">New Password (min 6 chars)</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-slate-500">Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-sm focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit" 
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Change Password
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
