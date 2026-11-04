import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { ScrollPop } from '../components/common/ScrollPop';

export const ProvidersPage: React.FC = () => {
  const { doctors, settings } = useClinic();

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
            Medical Staff Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Our Physicians &amp; Clinical Specialists
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            Our team brings together distinguished board-certified specialists in internal medicine, interventional cardiology, and physical rehabilitation—working collaboratively to serve Newark and Northern New Jersey.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {doctors.map((doctor, index) => (
            <ScrollPop
              key={doctor.id}
              delay={index * 0.1}
              initialScale={0.9}
              yOffset={30}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#4380FF]/40 shadow-2xs hover:shadow-md hover-card-lift transition-all flex flex-col sm:flex-row relative"
            >
              {/* Accent hover indicator line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4380FF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
              {/* Doctor Photo Column */}
              <div className="sm:w-5/12 bg-slate-100 relative overflow-hidden aspect-4/5 sm:aspect-auto">
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Doctor Details Column */}
              <div className="sm:w-7/12 p-6 sm:p-7 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                    {doctor.experienceYears}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight group-hover:text-blue-900 transition-colors">
                    {doctor.name}
                  </h3>
                  <div className="text-xs font-semibold text-blue-800 mt-1">
                    {doctor.title}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {doctor.qualifications}
                  </div>

                  {/* Specialties Pills (clean typography) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {doctor.specialties.slice(0, 3).map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-900">Direct Phone:</span>
                    <a
                      href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`}
                      className="font-bold text-blue-900 hover:underline"
                    >
                      {doctor.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`}
                      className="hover-btn-pop flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call to Book</span>
                    </a>

                    <Link
                      to={`/providers/${doctor.slug}`}
                      className="hover-btn-pop inline-flex items-center justify-center gap-1 py-2.5 px-4 text-xs font-medium text-[#4380FF] bg-white border border-[#4380FF] hover:bg-blue-50/50 rounded-full transition-colors"
                    >
                      <span>Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollPop>
          ))}
        </div>

        {/* Consultation Prompt with Direct Tap-to-Call */}
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-bold">Ready to schedule with a specific physician or specialist?</h3>
            <p className="text-sm text-slate-200">
              Call the provider's direct appointment desk above for immediate scheduling and insurance coordination.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href="tel:9734129404"
              className="hover-btn-pop px-5 py-2.5 text-xs font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dr. Gadhavi: (973) 412-9404</span>
            </a>
            <a
              href="tel:9733705259"
              className="hover-btn-pop px-5 py-2.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-colors inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Dr. Pathak: (973) 370-5259</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
