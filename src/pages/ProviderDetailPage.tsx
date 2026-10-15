import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { ScrollPop } from '../components/common/ScrollPop';

export const ProviderDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { doctors, settings } = useClinic();

  const doctor = doctors.find((d) => d.slug === slug);
  if (!doctor) {
    return <Navigate to="/providers" replace />;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to="/providers"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Providers</span>
          </Link>
        </div>

        {/* Doctor Header & Bio Card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-8 sm:p-12 items-start">
            {/* Doctor Photo with scroll pop-up */}
            <div className="md:col-span-5 lg:col-span-4">
              <ScrollPop
                delay={0.1}
                initialScale={0.88}
                yOffset={25}
                className="rounded-xl overflow-hidden bg-slate-100 shadow-md ring-1 ring-slate-900/10 aspect-3/4 max-w-sm mx-auto"
              >
                <img
                  src={doctor.imageUrl}
                  alt={doctor.name}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
              </ScrollPop>

              {/* Quick Details below photo */}
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>{doctor.clinicLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-900 shrink-0" />
                  <a
                    href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`}
                    className="hover:text-blue-900 font-bold text-slate-900"
                  >
                    {doctor.phone}
                  </a>
                </div>
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-900 shrink-0" />
                    <a
                      href={`mailto:${doctor.email}`}
                      className="hover:text-blue-900 font-medium text-slate-700 truncate"
                    >
                      {doctor.email}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>{doctor.availability}</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <a
                    href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-lg shadow-2xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call to Book: {doctor.phone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Doctor Identity & Bio */}
            <div className="md:col-span-7 lg:col-span-8 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  {doctor.experienceYears} · Active Practice
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  {doctor.name}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-blue-900 mt-1">
                  {doctor.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {doctor.qualifications}
                </p>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Clinical Specialties &amp; Focus
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Detailed Biography */}
              <div className="pt-2 border-t border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  Physician Biography
                </h2>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
                  {doctor.bio}
                </p>
              </div>

              {/* Credentials / Education */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {doctor.education && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900 mb-1">
                      <GraduationCap className="w-4 h-4" />
                      <span>Education &amp; Training</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doctor.education}
                    </p>
                  </div>
                )}

                {doctor.hospitalAffiliations && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-800 mb-1">
                      <Building2 className="w-4 h-4" />
                      <span>Hospital Affiliations</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {doctor.hospitalAffiliations}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Direct Appointment Booking Box (No Web Forms / HIPAA Compliant) */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-2xs">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4380FF] block mb-1">
              Direct Provider Appointments
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Schedule an Appointment with {doctor.name}
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              To schedule an appointment or check same-week clinical availability, please contact {doctor.name}'s office directly using the phone number below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Tap-to-Call Booking Card */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  Direct Phone Appointment Line
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 tracking-tight my-2">
                  {doctor.phone}
                </div>
                <p className="text-xs text-blue-800/80 leading-relaxed">
                  Tap below to call directly from your smartphone. Our coordination staff will assist with scheduling, insurance verification, and intake.
                </p>
              </div>

              <div>
                <a
                  href={`tel:${doctor.phone.replace(/[^0-9]/g, '')}`}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call to Book: {doctor.phone}</span>
                </a>
              </div>
            </div>

            {/* Provider Office & Email Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                  Office &amp; Email Contact
                </span>

                <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Direct Email:</span>
                      <a
                        href={`mailto:${doctor.email}`}
                        className="text-blue-900 hover:underline font-medium break-all"
                      >
                        {doctor.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Clinical Hours:</span>
                      <span>{doctor.availability}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-slate-900">Location:</span>
                      <span>{doctor.clinicLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HIPAA Compliance Assurance */}
              <div className="pt-4 border-t border-slate-200/80 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>HIPAA Privacy Protection:</strong> We do not ask patients to submit medical details or health inquiries through web forms. All consultations are scheduled directly over verified clinical lines.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
