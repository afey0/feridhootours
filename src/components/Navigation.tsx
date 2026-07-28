import React, { useState, useEffect, useRef } from 'react';
import { User, Bell, LogOut, LayoutDashboard, Anchor, ShieldCheck, ChevronDown, UserCircle, Users, Ticket } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler
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

  return (
    <nav className="glass-panel px-6 py-4 rounded-full flex justify-between items-center sticky top-6 z-50 animate-fade-in border border-slate-205 shadow-md mb-10 text-slate-800">
      
      {/* Brand logo */}
      <div className="flex items-center gap-2.5 font-black text-xl cursor-pointer">
        <Anchor className="text-sky-600 rotate-12 shrink-0" size={28} />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 tracking-wide font-black">
          FeridhooTours
        </span>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-4">
        
        {user?.role === 'admin' && (
          <button 
            className={`font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 shadow-md transition duration-200 cursor-pointer ${
              showAdminView 
                ? 'bg-sky-600 text-white shadow-sky-600/10' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/10'
            }`}
            onClick={() => setShowAdminView(!showAdminView)}
          >
            <LayoutDashboard size={16} />
            <span>{showAdminView ? 'Back to Booking' : 'Admin Panel'}</span>
          </button>
        )}

        {user && (
          <button 
            onClick={onOpenMyBookings}
            className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 transition duration-200 text-xs font-extrabold shadow-sm"
          >
            <Ticket size={16} className="text-sky-600" />
            <span>{user.role === 'agency' ? 'Agency Manifest' : 'My Bookings'}</span>
          </button>
        )}

        <button 
          onClick={onManageBooking}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 transition duration-200 text-xs font-semibold shadow-sm"
        >
          <ShieldCheck size={16} className="text-sky-600" />
          <span>Manage Booking</span>
        </button>

        <button className="bg-transparent text-slate-500 hover:text-slate-700 cursor-pointer p-1.5 transition">
          <Bell size={20} />
        </button>

        {!user ? (
          <button 
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 transition duration-200 text-xs font-semibold shadow-sm"
            onClick={onSignIn}
          >
            <User size={16} className="text-sky-600" />
            <span>Sign In</span>
          </button>
        ) : (
          <div className="flex items-center gap-4">
            
            {/* User Session tag with dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer transition focus:outline-none"
              >
                <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-805 leading-none">{user.name}</span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {user.role === 'admin' 
                      ? 'Operator' 
                      : user.role === 'agency' 
                        ? 'Travel Agency' 
                        : 'Passenger'}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-500 shrink-0 ml-0.5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2.5 z-50 text-left animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1.5">
                    <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wider">Signed In As</span>
                    <span className="text-xs font-extrabold text-slate-700 block truncate mt-0.5">{user.email}</span>
                  </div>

                  <button 
                    onClick={() => { onOpenMyBookings(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 animate-none"
                  >
                    <Ticket size={15} className="text-sky-600" />
                    <span>{user.role === 'agency' ? 'Agency Manifest' : 'My Bookings'}</span>
                  </button>
                  
                  <button 
                    onClick={() => { onOpenProfile(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 animate-none"
                  >
                    <UserCircle size={15} className="text-sky-600" />
                    <span>My Profile</span>
                  </button>

                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => { onSavedPassengers(); setDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-2 animate-none"
                    >
                      <Users size={15} className="text-sky-600" />
                      <span>Saved Travelers</span>
                    </button>
                  )}

                  <button 
                    onClick={() => { onSignOut(); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer flex items-center gap-2 border-t border-slate-100 mt-1.5 animate-none"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
