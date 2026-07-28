import React from 'react';
import { Scale, Clock, ShieldCheck, HelpCircle, FileText, ArrowLeft } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6 my-4 text-left">
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
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Policy Directory</span>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative text-slate-800 text-left">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-650 border border-sky-100 flex items-center justify-center shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Terms of Service & Transit Policies</h2>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">FeridhooTours Maldives Speedboat & Ferry Transit Guidelines</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs text-slate-600 leading-relaxed font-medium">
          
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Clock size={16} className="text-sky-550" /> 1. Booking Cancellation & Refund Policy
            </h3>
            <p>
              Passengers can cancel or modify bookings subject to the following timeline refund tiers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-550 font-semibold">
              <li><strong className="text-slate-800">More than 24 hours prior to departure:</strong> 100% Refund of the transacted ticket amount.</li>
              <li><strong className="text-slate-800">Between 12 to 24 hours prior to departure:</strong> 50% Refund (subject to a 50% cancellation fee).</li>
              <li><strong className="text-slate-800">Less than 12 hours prior to departure:</strong> Strictly non-refundable.</li>
            </ul>
            <p>
              Refunds will be processed back to the original payment channel (or bank transfer clearance) within 5-7 business days of request validation.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-sky-550" /> 2. Check-In & Boarding Protocols
            </h3>
            <p>
              To ensure punctual transit schedules, passengers must arrive at the Hulhumalé Ferry Terminal or local island jetty gates at least <strong className="text-slate-800">15 minutes before the scheduled departure time</strong>.
            </p>
            <p>
              Boarding gates close exactly <strong className="text-slate-800">5 minutes prior</strong> to vessel launch. Late arrivals will be classified as a no-show and are non-refundable. A valid National Identity Card or Passport must be presented to scan the boarding pass QR code.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <HelpCircle size={16} className="text-sky-550" /> 3. Weather & Safety-Related Disruptions
            </h3>
            <p>
              Vessel transit operations are subject to marine meteorological safety. In the event of storm gale warnings, extreme wave swells, or coast guard travel warnings, transits may be delayed, rescheduled, or cancelled by the operator.
            </p>
            <p>
              In such force majeure events, passengers will receive 100% schedule credits or 100% ticket refunds, with no administrative fees applied.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <FileText size={16} className="text-sky-550" /> 4. Travel Agency Manifest Holds
            </h3>
            <p>
              Registered travel agencies can reserve blocks of speedboat seats in bulk. For bank transfer payments, agencies must upload a clear bank transaction transfer slip within <strong className="text-slate-800">6 hours of seat reservation</strong>.
            </p>
            <p>
              If the transfer slip is not uploaded within the 6-hour hold window, the system will automatically release the seats back to public inventory. Slips undergo audit validation by admin operators before QR ticket codes are issued.
            </p>
          </div>

        </div>

        {/* Footer Accept */}
        <div className="mt-6 border-t border-slate-100 pt-4 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer shadow-sm shadow-sky-500/10"
          >
            I Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
};
