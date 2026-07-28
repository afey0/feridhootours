import React, { useState } from 'react';
import { UserCircle, Shield, X, Landmark, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = signup(name, email, password, role);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess('Account created successfully! You are now logged in.');
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    const res = resetPasswordRequest(email);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess('Password reset instructions sent. Please check the Operator email log.');
      setEmail('');
    }
  };

  const switchMode = (m: 'signin' | 'signup' | 'forgot') => {
    setMode(m);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="overlay animate-fade-in" style={{ zIndex: 2000 }}>
      <div className="glass-panel-strong rounded-2xl w-full max-w-md p-6 md:p-8 relative shadow-2xl border border-slate-200 bg-white text-slate-800 text-left">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-700 cursor-pointer transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            {mode === 'signin' && 'Access your saved manifests and dashboard'}
            {mode === 'signup' && 'Register as a passenger or agency for smart booking features'}
            {mode === 'forgot' && 'Enter your email to receive recovery verification details'}
          </p>
        </div>

        {/* Error / Success Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold mb-4 animate-fade-in">
            <CheckCircle size={16} className="shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              data-testid="signin-submit-btn"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-md transition duration-200 cursor-pointer text-sm"
            >
              Sign In
            </button>

            <p className="text-center text-xs text-slate-500 font-medium pt-2">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('signup')}
                className="text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {/* SIGN UP VIEW */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('passenger')}
                  className={`py-3.5 px-4 border rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition ${
                    role === 'passenger' 
                      ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-650 bg-white'
                  }`}
                >
                  <UserCircle size={16} /> Passenger
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agency')}
                  className={`py-3.5 px-4 border rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center gap-2 transition ${
                    role === 'agency' 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-750 shadow-sm' 
                      : 'border-slate-200 hover:bg-slate-50 text-slate-655 bg-white'
                  }`}
                >
                  <Landmark size={16} /> Travel Agency
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name / Agency Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="Ahmed Waheed"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="Create a password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirm</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-md transition duration-200 cursor-pointer text-sm"
            >
              Sign Up & Register
            </button>

            <p className="text-center text-xs text-slate-500 font-medium pt-2">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => switchMode('signin')}
                className="text-sky-600 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Registered Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl shadow-md transition duration-200 cursor-pointer text-sm"
            >
              Request Recovery Link
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => switchMode('signin')}
                className="text-xs font-bold text-sky-600 hover:underline cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* MOCK DEVELOPMENT LOGINS SECTION */}
        <div className="border-t border-slate-100 mt-6 pt-5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
            Or Quick Login (Testing Shortcuts)
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => { loginAsPassenger(); onClose(); }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2"><UserCircle size={15} className="text-sky-655" /> Login as Passenger</span>
              <span className="text-[9px] bg-slate-200 text-slate-550 px-2 py-0.5 rounded font-mono">bypass</span>
            </button>
            <button 
              onClick={() => { loginAsAgency(); onClose(); }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2"><Landmark size={15} className="text-indigo-655" /> Login as Travel Agency</span>
              <span className="text-[9px] bg-slate-200 text-slate-550 px-2 py-0.5 rounded font-mono">bypass</span>
            </button>
            <button 
              onClick={() => { loginAsAdmin(); onClose(); }}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2"><Shield size={15} className="text-amber-600" /> Login as Operator/Admin</span>
              <span className="text-[9px] bg-slate-200 text-slate-550 px-2 py-0.5 rounded font-mono">bypass</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
