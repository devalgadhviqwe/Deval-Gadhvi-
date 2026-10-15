import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  Activity,
  Flame,
  HeartHandshake,
  Plane,
  HeartPulse,
  Dumbbell,
  Search,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Stethoscope': return Stethoscope;
    case 'ShieldCheck': return ShieldCheck;
    case 'Activity': return Activity;
    case 'Flame': return Flame;
    case 'HeartHandshake': return HeartHandshake;
    case 'Plane': return Plane;
    case 'HeartPulse': return HeartPulse;
    case 'Dumbbell': return Dumbbell;
    default: return Activity;
  }
};

export const ServicesPage: React.FC = () => {
  const { services, diagnostics } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
            Clinical Services
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Personalized solutions for better health
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            At Newark Medical Associates, our medical specialties span preventive wellness, acute primary care, chronic condition mitigation, heart health, and personalized physical rehabilitation.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search medical services or treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {filteredServices.map((service) => {
            const Icon = getIcon(service.iconName);
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover-card-lift flex flex-col justify-between group relative"
              >
                {/* Top subtle highlight gradient bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4380FF] via-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center mb-5 group-hover:bg-[#4380FF] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-md group-hover:shadow-blue-500/25 transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#4380FF] transition-colors duration-200">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      {service.shortDesc}
                    </p>

                    {service.features && service.features.length > 0 && (
                      <div className="space-y-1.5 border-t border-slate-100 pt-4 mb-4">
                        {service.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 group-hover:translate-x-0.5 transition-transform duration-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-800 shrink-0 group-hover:text-[#4380FF] transition-colors" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/services/${service.slug}`}
                    className="w-full text-center flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-blue-900 group-hover:bg-[#4380FF] rounded-lg transition-all duration-300 shadow-2xs group-hover:shadow-md group-hover:shadow-blue-500/20"
                  >
                    <span>View Service Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Solutions Summary Section */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-2xs mb-16">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
              On-Site Diagnostic Suite
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Diagnostic Solutions at 337 Bloomfield Ave
            </h2>
            <p className="mt-2 text-slate-600 text-sm leading-relaxed">
              We provide rapid on-site testing to reduce turnaround time and deliver immediate answers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {diagnostics.map((diag) => (
              <div
                key={diag.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md hover:bg-white transition-all duration-200 group cursor-default"
              >
                <div className="font-bold text-sm text-slate-900 group-hover:text-[#4380FF] transition-colors">{diag.name}</div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{diag.shortDesc}</p>
                <div className="text-[11px] text-blue-900 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform">
                  {diag.turnaroundTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment CTA */}
        <div className="text-center p-8 bg-blue-50 border border-blue-100 rounded-2xl max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-blue-950 mb-2">Need a tailored clinical consultation?</h3>
          <p className="text-sm text-slate-600 mb-6">
            Our board-certified providers are available for direct phone booking and same-week consultations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="tel:9734129404"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Primary Care: (973) 412-9404</span>
            </a>
            <Link
              to="/providers"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-blue-900 bg-white hover:bg-blue-100/60 border border-blue-200 rounded-lg transition-colors"
            >
              <span>View All Providers &amp; Numbers</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
