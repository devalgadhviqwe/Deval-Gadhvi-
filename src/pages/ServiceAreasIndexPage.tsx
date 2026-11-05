import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  Bus,
  Stethoscope,
  Heart,
  Activity,
  Calendar
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { SERVICE_AREAS } from '../data/serviceAreas';
import { ScrollPop } from '../components/common/ScrollPop';

export const ServiceAreasIndexPage: React.FC = () => {
  const { settings, services } = useClinic();
  const phone = settings?.phone || '(973) 412-9404';

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF]" />
            <span>Regional Healthcare Coverage</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Areas &amp; Communities We Proudly Serve
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
            Located conveniently along the Bloomfield Avenue medical corridor at <strong>337 Bloomfield Ave, Newark, NJ 07107</strong>, Newark Medical Associates provides fast, high-quality primary care, cardiology, and physical therapy for patients across Essex and Hudson County communities.
          </p>
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {SERVICE_AREAS.map((area, idx) => (
            <ScrollPop
              key={area.slug}
              delay={idx * 0.06}
              initialScale={0.92}
              yOffset={20}
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#4380FF]/40 overflow-hidden shadow-2xs hover:shadow-md hover-card-lift transition-all flex flex-col justify-between relative"
            >
              {/* Accent hover line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4380FF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#4380FF] flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {area.state} · {area.zipCodes.join(', ')}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full">
                    {area.travelTime}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-[#4380FF] transition-colors mb-2">
                  {area.name}, {area.state}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-3">
                  Approx. {area.distanceFromClinic} from our Bloomfield Ave clinic
                </p>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-3">
                  {area.introText}
                </p>

                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Car className="w-3.5 h-3.5 text-blue-800 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{area.drivingDirections}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Bus className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{area.transitDirections}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-50 mt-2">
                <Link
                  to={`/service-areas/${area.slug}`}
                  className="hover-btn-pop w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors shadow-xs"
                >
                  <span>Explore Care for {area.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ScrollPop>
          ))}
        </div>

        {/* Why Travel to Newark Medical Associates */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-2xs mb-14">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              Integrated Multi-Specialty Care
            </span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Why Patients Across Essex &amp; Hudson Counties Choose Us
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Skip hospital-network bureaucracy and long waiting times. Our clinic combines personal touch, prompt appointments, and advanced diagnostic testing in one accessible location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#4380FF] flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Primary &amp; Urgent Visits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Same-week appointments for annual physicals, sick visits, pre-op exams, and chronic illness management.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Board-Certified Cardiology</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full on-site cardiovascular suite with EKGs, echocardiograms, and stress testing led by Dr. Sankalp Pathak.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">Dedicated Physical Therapy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Licensed musculoskeletal rehabilitation and pain relief guided by Dr. Disha Patel, PT, DPT.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="p-8 sm:p-10 rounded-3xl bg-blue-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">Schedule Your Visit Today</h3>
            <p className="text-sm text-slate-200 max-w-xl">
              Accepting new patients from Belleville, Bloomfield, East Orange, Kearny, Harrison, Irvington, Montclair, and all of Newark.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={`tel:${phone.replace(/[^0-9]/g, '')}`}
              className="hover-btn-pop inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call to Book: {phone}</span>
            </a>
            <Link
              to="/contact"
              className="hover-btn-pop inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-colors"
            >
              Directions &amp; Hours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
