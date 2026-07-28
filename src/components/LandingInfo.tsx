import React, { useState } from 'react';
import { Compass, Ship, ShieldCheck, Landmark, MapPin, Phone, Mail, Clock, ChevronDown, ChevronUp, ArrowRight, HelpCircle } from 'lucide-react';

interface Props {
  onOpenTerms: () => void;
  onSelectRoute: (from: string, to: string) => void;
}

export const LandingInfo: React.FC<Props> = ({ onOpenTerms, onSelectRoute }) => {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  const destinations = [
    {
      id: 'MLE',
      name: 'Malé Capital Hub',
      code: 'MLE',
      desc: 'Central commercial and airport transit terminal linking all island routes.',
      price: '$5.00',
      time: '15m Ferry / Speedboats',
      image: '/images/male.png'
    },
    {
      id: 'MAF',
      name: 'Maafushi Paradise',
      code: 'MAF',
      desc: 'Popular tourist island known for guesthouses, watersports, and bikini beach.',
      price: '$25.00',
      time: '45m Express Speedboat',
      image: '/images/maafushi.png'
    },
    {
      id: 'DHI',
      name: 'Dhigurah Sanctuary',
      code: 'DHI',
      desc: 'Beautiful long sandspit famous for year-round whale shark and manta sightings.',
      price: '$45.00',
      time: '90m Premium Speedboat',
      image: '/images/dhigurah.png'
    },
    {
      id: 'FUL',
      name: 'Fulidhoo Culture',
      code: 'FUL',
      desc: 'Quiet tropical getaway featuring stingray feeding and traditional Maldives vibes.',
      price: '$35.00',
      time: '75m Luxury Speedboat',
      image: '/images/fulidhoo.png'
    }
  ];

  const faqs = [
    {
      q: 'How long does bank transfer slip verification take?',
      a: 'Once you upload your transaction slip, operator admins audit and verify it in under 15 minutes. Your boarding pass and dynamic QR code tickets will unlock immediately after approval.'
    },
    {
      q: 'Can I reschedule my speedboat travel time or select new seats?',
      a: 'Yes, absolutely! Open the "Manage Booking" portal in the top navigation, enter your 6-character booking reference (PNR), authenticate via the SMS/Email OTP, and you can re-select seats or change transit times.'
    },
    {
      q: 'What is the refund policy for cancellations?',
      a: 'Cancellations made more than 24 hours prior to departure receive a 100% refund. Cancellations between 12 to 24 hours receive a 50% refund. Cancellations made less than 12 hours before transit are non-refundable.'
    },
    {
      q: 'Are child discounts or baggage limits enforced?',
      a: 'Infants under 2 years travel free of charge on parent laps. Each passenger has a free luggage limit of 20kg checked baggage + 5kg cabin hand luggage. Overweight luggage is subject to a small $1.50 per kg surcharge.'
    }
  ];

  return (
    <div className="space-y-16 mt-16 text-slate-800 animate-fade-in">
      
      {/* Visual Destinations Spotlights */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2">
            <Compass className="text-sky-600 animate-spin-slow" size={22} />
            Spotlight Atoll Destinations
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-semibold">Explore stunning destinations and schedule instant speedboats across the Maldives.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map(d => (
            <div 
              key={d.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 text-left"
            >
              <div>
                {/* Destination Picture Container */}
                <div className="relative w-full h-40 overflow-hidden bg-slate-150">
                  <img 
                    src={d.image} 
                    alt={d.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] px-2 py-0.5 rounded-md font-black font-mono border border-slate-200/60 shadow-sm uppercase">
                    {d.code}
                  </span>
                </div>

                <div className="p-5">
                  <h4 className="font-extrabold text-base text-slate-850">
                    {d.name}
                  </h4>
                  <p className="text-slate-550 text-xs mt-2 leading-relaxed font-medium">
                    {d.desc}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 mx-5 pb-5 pt-4 flex justify-between items-center text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-extrabold">Price From</span>
                  <span className="text-slate-800 text-sm font-black">{d.price}</span>
                </div>
                <button
                  onClick={() => onSelectRoute('MLE', d.id)}
                  className="bg-white border border-slate-200 hover:bg-sky-500 hover:text-white hover:border-sky-500 cursor-pointer p-2.5 rounded-xl text-slate-700 transition flex items-center justify-center shadow-sm"
                  title="Search Schedules"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Transit Services Grid */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2">
            <Ship className="text-sky-600" size={22} />
            Smart Transit Features
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-semibold">Reliable luxury speedboats and inter-island ferry services at your fingertips.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left">
            <div className="w-10 h-10 bg-sky-50 text-sky-655 border border-sky-100 rounded-xl flex items-center justify-center mb-4">
              <Ship size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-850 mb-1.5">Premium Speedboats</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Travel comfortably inside fully enclosed, air-conditioned speedboats featuring leather seating, USB charging ports, and free bottled water.
            </p>
          </div>

          <div className="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-655 border border-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-850 mb-1.5">2FA Secure PNR</h4>
            <p className="text-slate-500 text-xs leading-relaxed font-medium">
              Manage passenger names, seat maps, and departure times securely. Access is locked behind automated One-Time Passcodes (OTP).
            </p>
          </div>

          <div className="glass-panel border border-slate-200 bg-white rounded-2xl p-5 shadow-sm text-left">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-655 border border-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Landmark size={20} />
            </div>
            <h4 className="font-extrabold text-sm text-slate-850 mb-1.5">Agency Manifest Tools</h4>
            <p className="text-slate-550 mb-1.5">
              Approved travel agencies can reserve seats in bulk, manage dynamic manifest registries, and settle balances via bank transfer slips.
            </p>
          </div>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-slate-200/80 pt-12">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-850 flex items-center gap-2">
            <HelpCircle className="text-sky-655" size={20} />
            Frequently Asked
          </h3>
          <p className="text-slate-555 leading-relaxed text-xs font-semibold">
            Need answers about baggage allowances, seat management, bank transfers, or refunds? Explore our quick FAQ guide.
          </p>
        </div>
        
        <div className="lg:col-span-2 space-y-3.5">
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition shadow-sm text-left"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 px-5 font-extrabold text-slate-800 text-xs sm:text-sm flex justify-between items-center hover:bg-slate-50 cursor-pointer transition select-none"
                >
                  <span>{f.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-sky-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-500 leading-relaxed font-semibold border-t border-slate-100 pt-3 animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Office, Address, Contact & Links Footer */}
      <footer className="border-t border-slate-200 pt-10 pb-6 text-xs text-slate-500 font-medium">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8">
          {/* Address */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Headquarters</h4>
            <p className="flex items-start gap-2 text-slate-550 leading-relaxed">
              <MapPin size={16} className="text-sky-600 shrink-0 mt-0.5" />
              <span>
                FeridhooTours Maldives Pvt Ltd<br />
                H. Ameenee Building, 4th Floor<br />
                Boduthakurufaanu Magu, Malé 20066<br />
                Republic of Maldives
              </span>
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Customer Support</h4>
            <div className="space-y-2 text-slate-550">
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-sky-600" />
                <span>+960 333 4567 / +960 777 1234</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-sky-600" />
                <span>support@feridhootours.mv</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={15} className="text-sky-600" />
                <span>Saturday – Thursday, 8:00 AM – 8:00 PM</span>
              </p>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px]">Company & Legal</h4>
            <div className="flex flex-col gap-2 font-bold text-sky-600">
              <button onClick={onOpenTerms} className="hover:underline text-left cursor-pointer">
                Terms of Service & Rules
              </button>
              <a href="#faqs" onClick={() => setOpenFaq(0)} className="hover:underline text-left">
                Cancellation & Refund Center
              </a>
              <span className="text-slate-400 font-medium">Approved by Maldives Transport Authority</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          © {new Date().getFullYear()} FeridhooTours Maldives. All Rights Reserved. FeridhooTours v2.2.0.
        </div>
      </footer>

    </div>
  );
};
