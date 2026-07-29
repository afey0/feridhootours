import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { SearchHero } from './components/SearchHero';
import { ScheduleList } from './components/ScheduleList';
import { SeatMap } from './components/SeatMap';
import { BookingModal } from './components/BookingModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PassengerDetails } from './components/PassengerDetails';
import { MyBookings } from './components/MyBookings';
import { ManageBookingModal } from './components/ManageBookingModal';
import { SavedPassengersModal } from './components/SavedPassengersModal';
import { TermsModal } from './components/TermsModal';
import { LandingInfo } from './components/LandingInfo';
import { ProfileModal } from './components/ProfileModal';
import { PublicTicketModal } from './components/PublicTicketModal';
import { useBookingFlow } from './store/useBookingFlow';
import { useAuthStore } from './store/useAuthStore';
import { usePlatformStore } from './store/usePlatformStore';
import { Anchor, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export type ActivePage = 
  | 'booking' 
  | 'admin' 
  | 'my_bookings' 
  | 'manage_booking' 
  | 'saved_passengers' 
  | 'profile' 
  | 'auth' 
  | 'terms' 
  | 'public_ticket';

function App() {
  const [publicTicketPnr, setPublicTicketPnr] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<ActivePage>('booking');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pnrParam = params.get('pnr') || params.get('ticket');
    if (pnrParam) {
      setPublicTicketPnr(pnrParam.trim().toUpperCase());
      setActivePage('public_ticket');
    }
  }, []);

  const {
    currentStep,
    selectedSchedule,
    selectedSeats,
    passengers,
    promoCode,
    discount,
    activePromo,
    isLocking,
    lockExpiresAt,
    latestBookingRef,
    passengerCount,
    goSearch,
    setSearchParams,
    selectSchedule,
    toggleSeat,
    reserveSeats,
    goBackToSeats,
    savePassengerDetails,
    applyPromo,
    removePromo,
    confirmPayment
  } = useBookingFlow();

  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    user, 
    logout 
  } = useAuthStore();

  const { alert: globalAlert, hideAlert } = usePlatformStore();
  
  const [showAdminView, setShowAdminView] = useState(false);
  const [adminTab, setAdminTab] = useState<'dashboard' | 'vessels' | 'fleet' | 'verify' | 'bookings' | 'locations' | 'reports' | 'emails' | 'users' | 'audit'>('dashboard');
  const [searchFromPort, setSearchFromPort] = useState('MLE');
  const [searchToPort, setSearchToPort] = useState('MAF');

  // Sync isAuthModalOpen with activePage
  useEffect(() => {
    if (isAuthModalOpen) {
      setActivePage('auth');
    }
  }, [isAuthModalOpen]);

  // Auto-route Admin and Super Admin to Admin Dashboard upon login
  const prevUserIdRef = useRef<string | null>(user?.id || null);
  useEffect(() => {
    if (user && prevUserIdRef.current !== user.id) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        setShowAdminView(true);
        setActivePage('admin');
      }
    }
    prevUserIdRef.current = user?.id || null;
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'super_admin' && showAdminView) {
      setShowAdminView(false);
      setActivePage('booking');
    }
    
    // If the user logs out, reset views and mid-booking steps
    if (!user) {
      if (activePage === 'my_bookings' || activePage === 'saved_passengers' || activePage === 'profile' || activePage === 'admin') {
        setActivePage('booking');
      }
      if (currentStep !== 'search' && currentStep !== 'confirmation') {
        goSearch();
      }
    }
  }, [user, currentStep, goSearch, showAdminView, activePage]);

  const [hasSearched, setHasSearched] = useState(false);

  // Dynamic pricing calculation
  const subtotalAmount = useMemo(() => {
    if (!selectedSchedule) return 0;
    const basePrice = selectedSchedule.price;
    return selectedSeats.reduce((sum, seat) => {
      let seatPrice = basePrice;
      if (seat.class === 'VIP') seatPrice += 15;
      else if (seat.class === 'Premium') seatPrice += 5;
      return sum + seatPrice;
    }, 0);
  }, [selectedSeats, selectedSchedule]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotalAmount - discount);
  }, [subtotalAmount, discount]);

  const steps = [
    { num: 1, label: 'Departures', key: 'search' },
    { num: 2, label: 'Seat Layout', key: 'select_seats' },
    { num: 3, label: 'Passenger Info', key: 'passenger_details' },
    { num: 4, label: 'Payment', key: 'payment' }
  ];

  const getStepIndex = (step: string) => {
    switch(step) {
      case 'search': return 0;
      case 'select_seats': return 1;
      case 'passenger_details': return 2;
      case 'payment': case 'confirmation': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-6 min-h-screen flex flex-col text-slate-800">
      <Navigation 
        showAdminView={showAdminView || activePage === 'admin'} 
        setShowAdminView={(v) => {
          setShowAdminView(v);
          setActivePage(v ? 'admin' : 'booking');
        }}
        user={user}
        onSignIn={() => { setAuthModalOpen(true); setActivePage('auth'); }}
        onSignOut={logout}
        onManageBooking={() => setActivePage('manage_booking')}
        onSavedPassengers={() => setActivePage('saved_passengers')}
        onOpenProfile={() => setActivePage('profile')}
        onOpenMyBookings={() => setActivePage('my_bookings')}
        onSelectAdminTab={(tab) => {
          setAdminTab(tab);
          setShowAdminView(true);
          setActivePage('admin');
        }}
      />

      <main className="flex-1">
        {/* FULL PAGE ROUTER VIEWS */}
        {activePage === 'admin' && (user?.role === 'admin' || user?.role === 'super_admin') ? (
          <AdminDashboard initialTab={adminTab} onTabChange={setAdminTab} />
        ) : activePage === 'my_bookings' ? (
          <MyBookings onBack={() => setActivePage('booking')} user={user} />
        ) : activePage === 'manage_booking' ? (
          <ManageBookingModal isOpen={true} onClose={() => setActivePage('booking')} />
        ) : activePage === 'saved_passengers' && user ? (
          <SavedPassengersModal isOpen={true} onClose={() => setActivePage('booking')} />
        ) : activePage === 'profile' && user ? (
          <ProfileModal isOpen={true} onClose={() => setActivePage('booking')} />
        ) : activePage === 'auth' ? (
          <AuthModal isOpen={true} onClose={() => { setAuthModalOpen(false); setActivePage('booking'); }} />
        ) : activePage === 'terms' ? (
          <TermsModal isOpen={true} onClose={() => setActivePage('booking')} />
        ) : activePage === 'public_ticket' && publicTicketPnr ? (
          <PublicTicketModal 
            pnr={publicTicketPnr} 
            onClose={() => {
              setPublicTicketPnr(null);
              setActivePage('booking');
              if (window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }} 
          />
        ) : (
          /* PRIMARY BOOKING SEARCH FLOW */
          <div className="space-y-6 sm:space-y-8">
            {/* Stepper Header */}
            <div className="glass-panel rounded-2xl sm:rounded-full px-4 py-3 border border-slate-200/80 shadow-sm flex items-center justify-center gap-2 sm:gap-4 flex-wrap max-w-2xl mx-auto">
              {steps.map((s, i) => (
                <React.Fragment key={s.key}>
                  <div className={`flex items-center gap-2 transition duration-300 ${
                    i <= currentIndex ? 'text-sky-600 font-extrabold' : 'text-slate-400 font-semibold'
                  }`}>
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-black transition duration-300 ${
                      i <= currentIndex 
                        ? 'bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20' 
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}>
                      {s.num}
                    </div>
                    <span className="text-xs sm:text-sm hidden md:inline font-bold">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 sm:w-8 md:w-10 h-[2px] rounded-full transition duration-300 ${
                      i < currentIndex ? 'bg-gradient-to-r from-sky-500 to-indigo-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Dynamic Views */}
            {currentStep === 'search' && (
              <>
                <SearchHero 
                  initialFromPort={searchFromPort}
                  initialToPort={searchToPort}
                  onSearch={(from, to, count, date) => {
                    setSearchFromPort(from);
                    setSearchToPort(to);
                    setSearchParams(count, date);
                    setHasSearched(true);
                  }} 
                /> 
                {!hasSearched && (
                  <LandingInfo 
                    onOpenTerms={() => setActivePage('terms')}
                    onSelectRoute={(from, to) => {
                      setSearchFromPort(from);
                      setSearchToPort(to);
                      setSearchParams(1, '2026-06-24');
                      setHasSearched(true);
                    }}
                  />
                )}
              </>
            )}

            {(currentStep === 'search' && hasSearched) && (
              <div className="mt-8">
                <ScheduleList 
                  fromPort={searchFromPort}
                  toPort={searchToPort}
                  onSelect={(sched) => {
                    if (!user) {
                      setAuthModalOpen(true);
                      setActivePage('auth');
                    } else {
                      selectSchedule(sched);
                    }
                  }} 
                />
              </div>
            )}

            {currentStep === 'select_seats' && selectedSchedule && (
              <div className="animate-fade-in space-y-6">
                <div className="glass-panel rounded-2xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="text-xl font-bold text-slate-805 flex items-center gap-2 leading-none">
                      <Anchor size={18} className="text-sky-600" />
                      {selectedSchedule.vesselName}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 uppercase">
                        {selectedSchedule.vesselType}
                      </span>
                    </h2>
                    <div className="text-slate-500 text-xs mt-1.5 font-medium">
                      {selectedSchedule.routeFrom} → {selectedSchedule.routeTo} | {selectedSchedule.departureTime} — {selectedSchedule.arrivalTime}
                    </div>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {selectedSchedule.amenities.map(a => (
                        <span key={a} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-semibold">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button 
                    className="bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs transition duration-200 cursor-pointer"
                    onClick={() => { goSearch(); setHasSearched(false); }}
                  >
                    Change Route
                  </button>
                </div>
                
                <SeatMap 
                  scheduleId={selectedSchedule.id}
                  selectedSeats={selectedSeats} 
                  onToggleSeat={toggleSeat} 
                  onConfirm={reserveSeats}
                  passengerCount={passengerCount}
                />
              </div>
            )}

            {currentStep === 'passenger_details' && (
              <PassengerDetails 
                selectedSeats={selectedSeats}
                onSave={savePassengerDetails}
                onBack={goBackToSeats}
              />
            )}

            {/* Lock Acquired Transition Screen */}
            {isLocking && currentStep === 'select_seats' && (
              <div className="overlay" style={{ zIndex: 1200 }}>
                <div className="glass-panel-strong rounded-2xl p-8 max-w-sm text-center border border-slate-300 shadow-2xl space-y-4">
                  <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-600 rounded-full flex items-center justify-center mx-auto animate-spin shrink-0">
                    <Anchor size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-wide">Securing Cabin Seats...</h3>
                  <p className="text-slate-500 text-xs leading-normal font-medium">
                    Acquiring distributed locks to prevent double booking on this speedboat.
                  </p>
                </div>
              </div>
            )}

            {/* Checkout & Confirmation Overlay Modal */}
            {(currentStep === 'payment' || currentStep === 'confirmation') && (
              <BookingModal 
                totalAmount={totalAmount}
                lockExpiresAt={lockExpiresAt}
                onPay={(method, slip) => confirmPayment(method, slip, user)}
                onCancel={() => { goSearch(); setHasSearched(false); }}
                isProcessing={isLocking}
                step={currentStep}
                
                // Details props
                subtotalAmount={subtotalAmount}
                promoCode={promoCode}
                discount={discount}
                activePromo={activePromo}
                onApplyPromo={applyPromo}
                onRemovePromo={removePromo}
                latestBookingRef={latestBookingRef}
                selectedSchedule={selectedSchedule}
                selectedSeats={selectedSeats}
                passengers={passengers}
                user={user}
              />
            )}
          </div>
        )}

        {/* Alert Popup Dialog */}
        {globalAlert && (
          <div className="overlay animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="glass-panel-strong rounded-3xl w-full max-w-sm p-6 relative shadow-2xl border border-slate-200 text-center bg-white/95 backdrop-blur-md">
              <div className="flex flex-col items-center gap-4">
                <div className={`p-3 rounded-full ${
                  globalAlert.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                    : globalAlert.type === 'error'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {globalAlert.type === 'success' && <CheckCircle size={28} />}
                  {globalAlert.type === 'error' && <AlertTriangle size={28} />}
                  {(globalAlert.type === 'info' || !globalAlert.type) && <Info size={28} />}
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-base font-black text-slate-850 font-display tracking-tight">{globalAlert.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed px-2">{globalAlert.message}</p>
                </div>
                
                <button
                  type="button"
                  onClick={hideAlert}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold py-2.5 rounded-xl text-xs transition duration-150 cursor-pointer shadow-sm mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
