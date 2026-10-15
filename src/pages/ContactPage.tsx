import React from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const ContactPage: React.FC = () => {
  const { settings } = useClinic();

  const phone = settings?.phone || '(973) 412-9404';
  const email = settings?.email || 'medicalnewark@gmail.com';
  const address = settings?.address || '337 Bloomfield Avenue, Newark, NJ 07107';
  const workingHours = settings?.workingHours || 'Monday – Friday: 8:30 AM – 6:00 PM | Saturday: 9:00 AM – 2:00 PM';
  const googleMapsUrl = settings?.googleMapsUrl || 'https://maps.google.com/?q=337+Bloomfield+Avenue+Newark+NJ+07107';

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">
            Patient Support &amp; Scheduling
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Contact Newark Medical Associates
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            We are here to answer your healthcare questions, coordinate appointments, and facilitate seamless medical care. Call our clinic or connect directly with your healthcare provider using the dedicated direct numbers below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Contact Details & Location */}
          <div className="lg:col-span-5 space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                Clinic Location &amp; Contact
              </h3>

              <div className="space-y-5 text-sm">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Physical Address
                    </span>
                    <strong className="text-base text-slate-900 font-bold block mt-0.5">
                      Newark Medical Associates
                    </strong>
                    <span className="text-slate-600 block leading-relaxed mt-0.5">
                      {address}
                    </span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 hover:text-blue-800 mt-2"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Direct Telephone
                    </span>
                    <a
                      href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                      className="text-lg font-bold text-slate-900 hover:text-blue-900 transition-colors block mt-0.5"
                    >
                      {phone}
                    </a>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Appointments, prescription renewals &amp; lab results
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${email}`}
                      className="text-base font-semibold text-slate-900 hover:text-blue-900 transition-colors break-all block mt-0.5"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                {/* Clinical Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
                      Clinic Hours
                    </span>
                    <span className="text-slate-700 block mt-0.5 font-medium leading-relaxed">
                      {workingHours}
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Sunday: Closed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency & Parking Guidance */}
            <div className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200/80 text-xs text-amber-950 space-y-2">
              <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Medical Emergencies
              </span>
              <p className="leading-relaxed">
                If you are experiencing chest pain, severe shortness of breath, sudden weakness, or other life-threatening symptoms, please call <strong>911</strong> immediately.
              </p>
            </div>
          </div>

          {/* Right Column: Direct Provider Appointment Directory (No generic web form / HIPAA Compliant) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200/90 shadow-2xs">
              <div className="border-b border-slate-100 pb-5 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4380FF] block mb-1">
                  Direct Clinical Lines
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Direct Provider Appointments
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  To protect patient privacy and adhere to HIPAA regulations, Newark Medical Associates does not use generic online booking forms. Each clinician maintains their own direct appointment line below.
                </p>
              </div>

              {/* Provider Cards Grid */}
              <div className="space-y-4">
                {/* 1. Dr. Prahlad & Dr. Deval (Primary Care) */}
                <div className="p-5 sm:p-6 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Primary Care &amp; Internal Medicine
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Dr. Prahlad Gadhavi &amp; Dr. Deval Gadhvi
                    </h3>
                    <p className="text-xs text-slate-600">
                      Preventative care, physicals, chronic illness management &amp; diagnostics
                    </p>
                    <div className="text-xs text-slate-500 pt-1">
                      Email: <a href="mailto:medicalnewark@gmail.com" className="text-blue-900 hover:underline font-medium">medicalnewark@gmail.com</a>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                    <a
                      href="tel:9734129404"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-xl shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call to Book: (973) 412-9404</span>
                    </a>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Direct: (973) 412-9404
                    </span>
                  </div>
                </div>

                {/* 2. Dr. Sankalp Pathak (Cardiology) */}
                <div className="p-5 sm:p-6 rounded-2xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 bg-sky-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Cardiology &amp; Heart Health
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Dr. Sankalp Pathak
                    </h3>
                    <p className="text-xs text-slate-600">
                      Cardiovascular consultations, EKGs, echocardiography &amp; heart screenings
                    </p>
                    <div className="text-xs text-slate-500 pt-1">
                      Email: <a href="mailto:mycardiovascularclinic@mycardiovascularclinic.com" className="text-blue-900 hover:underline font-medium">mycardiovascularclinic@mycardiovascularclinic.com</a>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                    <a
                      href="tel:9733705259"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-xl shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call to Book: (973) 370-5259</span>
                    </a>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Direct: (973) 370-5259
                    </span>
                  </div>
                </div>

                {/* 3. Disha (Physiotherapy / Motion Rehab) */}
                <div className="p-5 sm:p-6 rounded-2xl border border-teal-100 bg-teal-50/40 hover:bg-teal-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 bg-teal-100/80 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      Physical Therapy &amp; Rehabilitation
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Disha (Physiotherapy / Dr. Disha Patel)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Musculoskeletal physical therapy, post-op rehabilitation &amp; mobility
                    </p>
                    <div className="text-xs text-slate-500 pt-1">
                      Email: <a href="mailto:info@motionrehabpt.com" className="text-blue-900 hover:underline font-medium">info@motionrehabpt.com</a>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5">
                    <a
                      href="tel:8622854400"
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-xl shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call to Book: (862) 285-4400</span>
                    </a>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Direct: (862) 285-4400
                    </span>
                  </div>
                </div>
              </div>

              {/* HIPAA Compliance Note */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-start gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>HIPAA Compliance Notice:</strong> By connecting directly with your provider by phone, your patient privacy and medical information remain completely secure and compliant with healthcare privacy laws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
