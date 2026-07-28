import React, { useState } from 'react';
import { Shield, Landmark, Mail, Lock, User, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, signup, resetPasswordRequest, loginAsPassenger, loginAsAgency, loginAsAdmin } = useAuthStore();
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'passenger' | 'agency'>('passenger');
  
  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    const res = login(email, password);
    if (!res.success) {
      setError(res.message);
    } else {
      onClose();
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = signup(name, email, password, role);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess('Account created successfully! You are now logged in.');
      setTimeout(() => onClose(), 1200);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const res = resetPasswordRequest(email);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess(res.message);
    }
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto space-y-6 my-4 text-left">
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
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Account Authentication</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
        {/* Title Header */}
        <div className="mb-6 border-b border-slate-100 pb-5">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            {mode === 'signin' && 'Sign In to FeridhooTours'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            {mode === 'signin' && 'Access your digital boarding passes, saved manifests, and booking history.'}
            {mode === 'signup' && 'Register as a passenger or travel agency for instant seat bookings.'}
            {mode === 'forgot' && 'Enter your email address to receive password reset instructions.'}
          </p>
        </div>

        {/* Error / Success Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold mb-5 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-xs font-semibold mb-5 animate-fade-in">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              data-testid="signin-submit-btn"
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer text-sm mt-2"
            >
              Sign In
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Don't have an account yet? </span>
              <button 
                type="button" 
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className="text-xs font-extrabold text-sky-600 hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('passenger')}
                  className={`py-2.5 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                    role === 'passenger' 
                      ? 'bg-sky-50 border-sky-500 text-sky-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <User size={16} /> Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agency')}
                  className={`py-2.5 px-4 rounded-2xl border text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition ${
                    role === 'agency' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Landmark size={16} /> Travel Agency
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name / Company Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="e.g. Ibrahim Rasheed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer text-sm mt-2"
            >
              Create Account
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Already have an account? </span>
              <button 
                type="button" 
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className="text-xs font-extrabold text-sky-600 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-slate-800 text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-sky-600/20 transition cursor-pointer text-sm mt-2"
            >
              Send Password Reset Link
            </button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button 
                type="button" 
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className="text-xs font-extrabold text-sky-600 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* DEMO ONE-CLICK QUICK LOGINS */}
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
            Demo Instant Sign In Options
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => { loginAsPassenger(); onClose(); }}
              className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100/80 text-sky-700 border border-sky-200 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <User size={14} /> Login as Passenger
            </button>
            <button
              type="button"
              onClick={() => { loginAsAgency(); onClose(); }}
              className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Landmark size={14} /> Login as Travel Agency
            </button>
            <button
              type="button"
              onClick={() => { loginAsAdmin(); onClose(); }}
              className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Shield size={14} /> Login as Operator/Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
