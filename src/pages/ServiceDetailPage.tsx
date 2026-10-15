import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Calendar, Phone, ArrowRight, User, Mail } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { ScrollPop } from '../components/common/ScrollPop';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { services, doctors, settings } = useClinic();

  const service = services.find((s) => s.slug === slug);
  if (!service) {
    return <Navigate to="/services" replace />;
  }

  // Find associated doctor if specified
  const doctor = doctors.find((d) => d.id === service.doctorId);

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Clinical Services</span>
          </Link>
        </div>

        {/* Header Block */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs mb-10">
          <div className="p-8 sm:p-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              Clinical Department
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              {service.name}
            </h1>
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-3xl">
              {service.shortDesc}
            </p>
          </div>

          {/* Service Banner Image with scroll pop-up */}
          {service.imageUrl && (
            <ScrollPop
              delay={0.1}
              initialScale={0.92}
              yOffset={24}
              className="aspect-16/9 max-h-[420px] w-full overflow-hidden bg-slate-100 border-t border-slate-100"
            >
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </ScrollPop>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Detailed Description */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                About this Service
              </h2>
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-3">
                <p>{service.fullDesc}</p>
                <p>
                  At Newark Medical Associates, our diagnostic and clinical management protocols are
                  designed to provide seamless continuity of care. We combine advanced outpatient testing
                  with personal attention, guiding you through each stage of treatment.
                </p>
              </div>
            </div>

            {/* Key Service Features */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs">
                <h3 className="text-xl font-bold text-slate-900 mb-5">
                  Key Service Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {service.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Conditions Treated */}
            {service.treatments && service.treatments.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xs">
                <h3 className="text-xl font-bold text-slate-900 mb-5">
                  Conditions Evaluated &amp; Treated
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.treatments.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Attending Doctor & CTA */}
          <div className="lg:col-span-4 space-y-6">
            {/* Attending Doctor Card */}
            {doctor && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block mb-3">
                  Attending Physician
                </span>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                    <img
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-top"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {doctor.name}
                    </h4>
                    <span className="text-xs font-semibold text-blue-800 block mt-0.5">
                      {doctor.title}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      {doctor.experienceYears}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {doctor.bio}
                </p>
                <Link
                  to={`/providers/${doctor.slug}`}
                  className="w-full text-center block py-2 px-3 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  View Doctor Profile &rarr;
                </Link>
              </div>
            )}

            {/* Direct Provider Appointment CTA (HIPAA Compliant / Tap-to-Call) */}
            <div className="bg-blue-900 rounded-2xl p-6 text-white space-y-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
                Direct Appointment Booking
              </span>
              <h4 className="text-lg font-bold">
                {doctor ? `Schedule with ${doctor.name}` : `Schedule ${service.name}`}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Contact the direct clinical desk to reserve an appointment for {service.name}. Same-week consultations available.
              </p>

              <div className="pt-1 flex flex-col gap-2.5">
                <a
                  href={`tel:${(doctor?.phone || settings?.phone || '973-412-9404').replace(/[^0-9]/g, '')}`}
                  className="w-full py-3 text-center text-xs font-bold text-blue-950 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-blue-900" />
                  <span>Call to Book: {doctor?.phone || settings?.phone || '(973) 412-9404'}</span>
                </a>

                {doctor?.email && (
                  <a
                    href={`mailto:${doctor.email}`}
                    className="w-full py-2.5 text-center text-xs font-medium text-slate-200 hover:text-white bg-blue-800/60 hover:bg-blue-800 border border-blue-700/80 rounded-xl transition-colors flex items-center justify-center gap-2 truncate px-3"
                  >
                    <Mail className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                    <span className="truncate">{doctor.email}</span>
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-blue-800/80 text-[11px] text-sky-200/80">
                <span>Direct Provider Line · No online patient health form required</span>
              </div>
            </div>

            {/* Location Notice */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-900 block">Clinic Location</span>
              <p>337 Bloomfield Avenue, Newark, NJ 07107</p>
              <p className="text-slate-500">Free parking available for patients.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
