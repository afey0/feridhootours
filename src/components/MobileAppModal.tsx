import React, { useState } from 'react';
import { Smartphone, QrCode, Download, CheckCircle2, ShieldCheck, Zap, X, Apple, Play } from 'lucide-react';


interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'download' | 'qr_scanner'>('overview');
  const [scannedTicket, setScannedTicket] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="overlay animate-fade-in" style={{ zIndex: 1300 }}>
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 flex flex-col animate-fade-in relative overflow-hidden text-left"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-7 pb-5 shrink-0 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-sky-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold font-display">Feridhoo Tours Mobile App</h3>
              <p className="text-sky-200/80 text-xs font-medium mt-0.5">iOS (App Store) & Android (Google Play) Native Mobile Applications</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white transition cursor-pointer p-1.5 rounded-xl hover:bg-white/10 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-8 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap size={16} /> Features & Screenshots
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'download' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download size={16} /> Download iOS & Android APK
          </button>
          <button
            onClick={() => setActiveTab('qr_scanner')}
            className={`py-3.5 px-4 font-bold text-xs border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'qr_scanner' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode size={16} /> Native Boarding QR Scanner
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <span className="text-xs font-black text-sky-600 uppercase tracking-widest bg-sky-50 border border-sky-200 px-3 py-1 rounded-full inline-block">
                    Official Mobile Proposal Specification
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    Speedboat Ticket Booking in the Palm of Your Hand
                  </h4>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    Designed according to Invigorate Maldives proposal requirements. Features real-time seat selection, offline ticket caching, camera QR scanning, and push notifications for schedules.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      'Interactive Vessel Seat Selection (Touring 38 & Touring 43)',
                      'Multiple Fare Categories (Local, Tourist, Work Permit, Resort)',
                      'Instant E-Ticket with Boarding QR Code Generation',
                      'Travel Agent Direct Sales Module & History',
                      'Offline Ticket Wallet for Low-Connectivity Islands',
                      'Cloudflare Compute & D1 Database Real-time Sync'
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile Screen Mockup */}
                <div className="mx-auto w-64 bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative">
                  <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-3" />
                  <div className="bg-slate-50 rounded-[30px] p-4 text-slate-900 space-y-3 min-h-[360px] text-xs">
                    <div className="bg-sky-600 text-white p-3 rounded-2xl font-black text-center">
                      <div className="text-[10px] text-sky-100 uppercase tracking-wider">Feridhoo Tours</div>
                      <div className="text-sm mt-0.5">Explore Maldives By Sea</div>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl space-y-2 shadow-sm">
                      <div className="font-extrabold text-slate-800 text-[11px]">Select Trip</div>
                      <div className="bg-slate-50 p-2 rounded-xl text-[10px] font-bold text-slate-600 flex justify-between">
                        <span>Airport → Feridhoo</span>
                        <span className="text-sky-600">$35.00</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 rounded-xl text-[10px] font-black text-center">
                        ✓ 18 Seats Available
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center space-y-1 shadow-sm">
                      <QrCode size={40} className="mx-auto text-slate-800" />
                      <div className="font-mono text-[9px] font-bold text-slate-500">FT-704819</div>
                      <div className="text-[9px] font-bold text-emerald-600">Active Boarding Pass</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-6 text-center py-4">
              <h4 className="text-xl font-black text-slate-900">Install Feridhoo Tours App</h4>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Download the compiled native mobile build packages for testing on iOS TestFlight and Android devices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
                {/* Android APK */}
                <div className="glass-panel border border-slate-200 p-6 rounded-2xl text-left space-y-3 hover:border-sky-500 transition">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Play size={20} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800 text-sm">Android APK Package</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">com.feridhootours.app v1.0.0 (ARM64)</p>
                  </div>
                  <button 
                    onClick={() => alert('Downloading FeridhooTours-v1.0.0.apk...')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <Download size={15} /> Download APK (18.4 MB)
                  </button>
                </div>

                {/* iOS App Store / TestFlight */}
                <div className="glass-panel border border-slate-200 p-6 rounded-2xl text-left space-y-3 hover:border-sky-500 transition">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <Apple size={20} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800 text-sm">iOS TestFlight Build</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">iPhone / iPad Native App</p>
                  </div>
                  <button 
                    onClick={() => alert('Opening iOS TestFlight invitation link...')}
                    className="w-full bg-slate-900 hover:bg-sky-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Download size={15} /> Open TestFlight Build
                  </button>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-xs text-sky-800 font-semibold max-w-lg mx-auto flex items-center gap-3 text-left">
                <ShieldCheck size={24} className="shrink-0 text-sky-600" />
                <span>Supports PWA Instant App mode: Tap "Add to Home Screen" in mobile Safari/Chrome for full native experience without store installation.</span>
              </div>
            </div>
          )}

          {activeTab === 'qr_scanner' && (
            <div className="space-y-6 text-center py-4">
              <h4 className="text-xl font-black text-slate-900">Native Boarding QR Ticket Scanner</h4>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                Scan passenger E-Tickets at the harbor terminal or vessel entrance for instant boarding verification.
              </p>

              <div className="max-w-md mx-auto bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                <div className="w-48 h-48 mx-auto border-2 border-dashed border-sky-400 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
                  <div className="w-full h-1 bg-sky-400 absolute top-0 animate-ping opacity-75" />
                  <QrCode size={64} className="text-sky-400 opacity-60 mb-2" />
                  <span className="text-[11px] text-sky-200 font-bold">Align QR Code Here</span>
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setScannedTicket('FT-704819 (Verified - Passenger: Hussain Siraaj - Seat 21, 22)')}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    Simulate Sample Scan
                  </button>
                </div>

                {scannedTicket && (
                  <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-bold animate-fade-in text-left">
                    <div className="text-white font-extrabold mb-1">✓ Ticket Verified & Valid</div>
                    <div>{scannedTicket}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500 font-semibold shrink-0">
          <span>Invigorate Maldives Proposal Phase 1 Compatible</span>
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition cursor-pointer"
          >
            Close App Preview
          </button>
        </div>
      </div>
    </div>
  );
};
