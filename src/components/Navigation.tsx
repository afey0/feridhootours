import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, LogOut, LayoutDashboard, Anchor, ShieldCheck, ChevronDown, UserCircle, Users, Ticket, Menu, X, AlertTriangle } from 'lucide-react';
import type { User as UserType } from '../store/useAuthStore';

interface Props {
  showAdminView: boolean;
  setShowAdminView: (v: boolean) => void;
  user: UserType | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onManageBooking: () => void;
  onSavedPassengers: () => void;
  onOpenProfile: () => void;
  onOpenMyBookings: () => void;
}

export const Navigation: React.FC<Props> = ({ 
  showAdminView, 
  setShowAdminView, 
  user, 
  onSignIn, 
  onSignOut, 
  onManageBooking,
  onSavedPassengers,
  onOpenProfile,
  onOpenMyBookings
}) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  return (
    <>
      <nav className="glass-panel px-4 md:px-6 py-3.5 md:py-4 rounded-3xl md:rounded-full flex justify-between items-center relative z-20 border border-slate-200/80 shadow-md mb-6 md:mb-8 text-slate-800 backdrop-blur-xl">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            if (showAdminView) setShowAdminView(false);
          }}
          className="flex items-center gap-2.5 font-black text-lg md:text-xl cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 shrink-0">
            <Anchor className="rotate-12" size={22} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 tracking-tight font-black leading-none text-base md:text-xl">
              FeridhooTours
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight hidden sm:inline">
              Speedboat & Ferry
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links (≥ 1024px) */}
        <div className="hidden lg:flex items-center gap-3">
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <button 
              className={`font-bold py-2 px-4 rounded-2xl text-xs flex items-center gap-2 shadow-md transition duration-200 cursor-pointer ${
                showAdminView 
                  ? 'bg-slate-900 text-white shadow-slate-900/10' 
                  : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/15'
              }`}
              onClick={() => setShowAdminView(!showAdminView)}
            >
              <LayoutDashboard size={16} />
              <span>{showAdminView ? 'Back to Booking' : 'Admin Panel'}</span>
            </button>
          )}

          <button 
            onClick={onManageBooking}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-2xl cursor-pointer flex items-center gap-2 transition duration-200 text-xs font-bold shadow-sm"
          >
            <ShieldCheck size={16} className="text-sky-600" />
            <span>Manage Reservation</span>
          </button>

          <button type="button" className="bg-slate-100 hover:bg-slate-200/70 text-slate-600 cursor-pointer p-2 rounded-2xl transition">
            <Bell size={18} />
          </button>

          {!user ? (
            <button 
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2 rounded-2xl cursor-pointer flex items-center gap-2 transition duration-200 text-xs shadow-md shadow-sky-600/15"
              onClick={onSignIn}
            >
              <User size={16} />
              <span>Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl shadow-sm cursor-pointer transition focus:outline-none"
              >
                <div className="w-7 h-7 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-800 leading-none">{user.name}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Operator Admin' : user.role === 'agency' ? 'Travel Agency' : 'Passenger'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 shrink-0 ml-0.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-3xl shadow-2xl py-3 z-50 text-left animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1.5">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Signed In As</span>
                    <span className="text-xs font-extrabold text-slate-800 block truncate mt-0.5">{user.email}</span>
                  </div>

                  <button 
                    onClick={() => { onOpenMyBookings(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer flex items-center gap-2.5"
                  >
                    <Ticket size={16} className="text-sky-600" />
                    <span>{user.role === 'agency' ? 'Agency Manifest' : 'My Bookings'}</span>
                  </button>
                  
                  <button 
                    onClick={() => { onOpenProfile(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer flex items-center gap-2.5"
                  >
                    <UserCircle size={16} className="text-sky-600" />
                    <span>My Profile</span>
                  </button>

                  {(user.role !== 'admin' && user.role !== 'super_admin') && (
                    <button 
                      onClick={() => { onSavedPassengers(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer flex items-center gap-2.5"
                    >
                      <Users size={16} className="text-sky-600" />
                      <span>Saved Travelers</span>
                    </button>
                  )}

                  <button 
                    onClick={() => { onSignOut(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2.5 border-t border-slate-100 mt-1.5"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile & Apple Tablet Hamburger Trigger Button (< 1024px) */}
        <div className="flex lg:hidden items-center gap-2">
          {user && (
            <button 
              onClick={onOpenMyBookings}
              className="bg-sky-50 text-sky-700 border border-sky-200 p-2.5 rounded-2xl cursor-pointer transition active:scale-95"
              title="My Bookings"
            >
              <Ticket size={18} />
            </button>
          )}

          <button 
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="bg-slate-900 text-white p-2.5 rounded-2xl cursor-pointer transition active:scale-95 shadow-md shadow-slate-900/10 flex items-center gap-2 text-xs font-extrabold"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
            <span className="hidden sm:inline font-bold">Menu</span>
          </button>
        </div>
      </nav>

      {/* Slide-over Mobile & iPad Hamburger Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ animation: 'fadeInBackdrop 0.25s ease-out' }}>
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div 
            className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col z-10 overflow-y-auto"
            style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Anchor size={20} />
                </div>
                <span className="font-extrabold text-slate-900 text-lg">Menu</span>
              </div>
              <button 
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Profile Card inside Drawer */}
            <div className="p-6 border-b border-slate-100 bg-sky-50/40">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-base font-black shrink-0 shadow-md shadow-sky-500/20">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-extrabold text-slate-900 truncate">{user.name}</span>
                    <span className="text-xs text-slate-500 truncate font-medium">{user.email}</span>
                    <span className="inline-block bg-sky-100 text-sky-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 w-fit">
                      {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Operator Admin' : user.role === 'agency' ? 'Travel Agency' : 'Passenger'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <h4 className="font-extrabold text-slate-900 text-sm">Welcome to FeridhooTours</h4>
                  <p className="text-xs text-slate-500 font-medium">Sign in to access your digital tickets, saved passengers, and travel history.</p>
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); onSignIn(); }}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/15 transition"
                  >
                    <User size={16} /> Sign In or Register
                  </button>
                </div>
              )}
            </div>

            {/* Menu Links */}
            <div className="p-4 space-y-1.5 flex-1 text-left">
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <>
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); setShowAdminView(!showAdminView); }}
                    className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <LayoutDashboard size={18} />
                    <span>{showAdminView ? 'Back to Booking App' : 'Operator Admin Control'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { 
                      setDrawerOpen(false); 
                      alert('Broadcasting system warning: Male-Maafushi Speedboats delayed by 20 mins due to sea conditions.'); 
                    }}
                    className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                  >
                    <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                    <span>Broadcast Disruption Alert</span>
                  </button>
                </>
              )}

              {user && (
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); onOpenMyBookings(); }}
                  className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
                >
                  <Ticket size={18} className="text-sky-600" />
                  <span>{user.role === 'agency' ? 'Agency Manifest Directory' : 'My Bookings & Boarding Passes'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => { setDrawerOpen(false); onManageBooking(); }}
                className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
              >
                <ShieldCheck size={18} className="text-sky-600" />
                <span>Self-Service Booking Lookup</span>
              </button>

              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => { setDrawerOpen(false); onOpenProfile(); }}
                    className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
                  >
                    <UserCircle size={18} className="text-sky-600" />
                    <span>My Profile & Settings</span>
                  </button>

                  {user.role !== 'admin' && (
                    <button
                      type="button"
                      onClick={() => { setDrawerOpen(false); onSavedPassengers(); }}
                      className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center gap-3 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition cursor-pointer"
                    >
                      <Users size={18} className="text-sky-600" />
                      <span>Saved Travelers Directory</span>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {user && (
              <div className="p-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setDrawerOpen(false); onSignOut(); }}
                  className="w-full p-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Sign Out Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
