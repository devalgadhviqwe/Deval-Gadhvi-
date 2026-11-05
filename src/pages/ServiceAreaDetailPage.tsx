import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Car,
  Bus,
  Calendar,
  Building2,
  Stethoscope,
  Heart,
  Activity,
  Award
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { SERVICE_AREAS } from '../data/serviceAreas';
import { ScrollPop } from '../components/common/ScrollPop';

export const ServiceAreaDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings, services, doctors, diagnostics } = useClinic();

  const area = SERVICE_AREAS.find((a) => a.slug === slug);

  useEffect(() => {
    if (area) {
      document.title = area.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', area.metaDescription);
      }
    }
  }, [area]);

  if (!area) {
    return <Navigate to="/service-areas" replace />;
  }

  const phone = settings?.phone || '(973) 412-9404';
  const clinicAddress = settings?.address || '337 Bloomfield Avenue, Newark, NJ 07107';

  // Structured Data Schema for Local SEO
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    'name': `Newark Medical Associates - Serving ${area.name}, ${area.state}`,
    'description': area.metaDescription,
    'telephone': phone,
    'url': `https://newarkmedicalassociates.com/service-areas/${area.slug}`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': '337 Bloomfield Avenue',
      'addressLocality': 'Newark',
      'addressRegion': 'NJ',
      'postalCode': '07107',
      'addressCountry': 'US'
    },
    'areaServed': {
      '@type': 'AdministrativeArea',
      'name': `${area.name}, ${area.state}`,
      'postalCode': area.zipCodes.join(', ')
    },
    'medicalSpecialty': [
      'PrimaryCare',
      'Cardiovascular',
      'Physiotherapy',
      'PreventiveMedicine'
    ]
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-14">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/" className="hover:text-[#4380FF] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/service-areas" className="hover:text-[#4380FF] transition-colors">Service Areas</Link>
          <span>/</span>
          <span className="text-[#4380FF] font-bold">{area.name}, {area.state}</span>
        </div>

        {/* Hero Banner for this Area */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-2xs mb-10 relative overflow-hidden">
          {/* Top blue bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4380FF] via-blue-500 to-sky-400" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#4380FF] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Serving {area.name}, {area.state} ({area.zipCodes.join(', ')})</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-slate-900 leading-[1.2] tracking-tight">
                {area.headline}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {area.subheadline}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-800" />
                  <span><strong>{area.travelTime}</strong> ({area.distanceFromClinic})</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Board-Certified Physicians</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Multilingual (EN / ES / HI / GU)</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                  className="hover-btn-pop inline-flex items-center gap-2 px-7 py-3 text-sm font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call to Book: {phone}</span>
                </a>
                <Link
                  to="/providers"
                  className="hover-btn-pop inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#4380FF] bg-white border border-[#4380FF] hover:bg-blue-50/50 rounded-full transition-colors"
                >
                  Meet Our Clinicians
                </Link>
              </div>
            </div>

            {/* Quick Location & Travel Summary Card */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Visit Details for {area.name} Residents
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5">Clinic Address:</span>
                  <p>{clinicAddress}</p>
                  <span className="text-emerald-700 font-medium">Free patient parking available on-site</span>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Car className="w-3.5 h-3.5 text-blue-800" />
                    <span>Driving from {area.name}:</span>
                  </span>
                  <p className="leading-relaxed">{area.drivingDirections}</p>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Bus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Public Transit:</span>
                  </span>
                  <p className="leading-relaxed">{area.transitDirections}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Left Narrative Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xs space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Healthcare Dedicated to Patients from {area.name}, {area.state}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed font-normal">
                {area.introText}
              </p>

              <h3 className="text-lg font-bold text-slate-900 pt-3">
                Key Benefits for Our {area.name} Community:
              </h3>
              <ul className="space-y-3">
                {area.localHighlights.map((hl, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-[#4380FF] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.8]" />
                    </div>
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Medical Services Provided */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                    Comprehensive Care
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Clinical Services Available to {area.name} Patients
                  </h3>
                </div>
                <Link
                  to="/services"
                  className="hidden sm:inline-flex text-xs font-bold text-[#4380FF] hover:underline items-center gap-1"
                >
                  <span>View All Services</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.slice(0, 6).map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.slug}`}
                    className="group relative overflow-hidden p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#4380FF]/40 hover:bg-white hover-card-lift transition-all flex flex-col justify-between"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4380FF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#4380FF] transition-colors mb-1">
                        {service.name}
                      </h4>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {service.shortDesc}
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-bold text-[#4380FF] inline-flex items-center gap-1">
                      <span>Learn more</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* On-Site Diagnostic Capabilities */}
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-2xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                Rapid Diagnostics
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                On-Site Testing Suite (No Hospital Referral Delay)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than sending you to off-site commercial labs or distant radiology centers, we conduct diagnostic blood panels, EKGs, echocardiograms, and allergy screenings right here at 337 Bloomfield Ave.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {diagnostics.slice(0, 8).map((d) => (
                  <div
                    key={d.id}
                    className="group relative overflow-hidden p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#4380FF]/40 hover:bg-white transition-all text-center"
                  >
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4380FF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="font-bold text-xs text-slate-900">{d.name}</div>
                    <div className="text-[10px] text-blue-800 font-medium mt-1">{d.turnaroundTime}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Doctors & Direct Scheduling */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Booking Card */}
            <div className="bg-blue-900 text-white rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 block">
                Direct Appointment Line
              </span>
              <h3 className="text-xl font-bold">
                Reserve an Appointment from {area.name}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                Our front desk coordinators speak English, Spanish, Hindi, and Gujarati. Call directly for immediate same-week scheduling.
              </p>
              <a
                href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                className="hover-btn-pop w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full shadow-xs transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call to Book: {phone}</span>
              </a>
              <p className="text-[11px] text-center text-slate-300 pt-1">
                Mon–Fri: 8:30 AM – 6:00 PM | Sat: 9:00 AM – 2:00 PM
              </p>
            </div>

            {/* Attending Physicians Quick Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Our Clinical Leadership
              </h4>
              <div className="space-y-4">
                {doctors.slice(0, 3).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/providers/${doc.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <img
                      src={doc.imageUrl}
                      alt={doc.name}
                      className="w-12 h-12 rounded-full object-cover object-top border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-slate-900 group-hover:text-[#4380FF] transition-colors truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{doc.title}</div>
                      <div className="text-[10px] text-blue-800 font-medium">{doc.experienceYears}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Neighboring Areas */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Other Nearby Communities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_AREAS.filter((a) => a.slug !== area.slug).map((a) => (
                  <Link
                    key={a.slug}
                    to={`/service-areas/${a.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#4380FF] text-slate-700 transition-colors"
                  >
                    {a.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            to="/service-areas"
            className="hover-btn-pop inline-flex items-center gap-2 px-6 py-2.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View All Regional Service Areas</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

