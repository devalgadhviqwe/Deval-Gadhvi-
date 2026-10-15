import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Phone,
  Calendar,
  CheckCircle2,
  Activity,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Flame,
  HeartHandshake,
  Plane,
  Dumbbell,
  ClipboardCheck,
  Droplet,
  Sparkles,
  ShieldAlert,
  FileCheck,
  Zap,
  Star
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { AboutSections } from '../components/common/AboutSections';
import { TeamSection } from '../components/common/TeamSection';
import { ScrollPop } from '../components/common/ScrollPop';

// Icon resolver helper for dynamic icon names
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Stethoscope': return Stethoscope;
    case 'ShieldCheck': return ShieldCheck;
    case 'Activity': return Activity;
    case 'Flame': return Flame;
    case 'HeartHandshake': return HeartHandshake;
    case 'Plane': return Plane;
    case 'HeartPulse': return HeartPulse;
    case 'Dumbbell': return Dumbbell;
    case 'ClipboardCheck': return ClipboardCheck;
    case 'Droplet': return Droplet;
    case 'Sparkles': return Sparkles;
    case 'ShieldAlert': return ShieldAlert;
    case 'FileCheck': return FileCheck;
    case 'Zap': return Zap;
    default: return Activity;
  }
};

export const HomePage: React.FC = () => {
  const { settings, services, diagnostics, testimonials, doctors, sections } = useClinic();

  const heroSection = sections.find((s) => s.sectionKey === 'hero');
  const servicesSection = sections.find((s) => s.sectionKey === 'services');
  const aboutSection = sections.find((s) => s.sectionKey === 'about');
  const diagSection = sections.find((s) => s.sectionKey === 'diagnostics');
  const processSection = sections.find((s) => s.sectionKey === 'process');
  const testSection = sections.find((s) => s.sectionKey === 'testimonials');

  const heroImage = heroSection?.imageUrl || '/src/assets/images/nma_hero_consultation_teal_1791532516993.jpg';
  const avatar1 = heroSection?.additionalImages?.[0] || '/src/assets/images/avatar_patient_1_1791532566289.jpg';
  const avatar2 = heroSection?.additionalImages?.[1] || '/src/assets/images/avatar_patient_2_1791532576262.jpg';
  const avatar3 = heroSection?.additionalImages?.[2] || '/src/assets/images/avatar_patient_3_1791532595296.jpg';

  return (
    <div className="bg-white min-h-screen">
      {/* =========================================================================
          SECTION 2: HERO SECTION (EXACT REFERENCE DESIGN MATCHING IMAGE 1)
          ========================================================================= */}
      <section className="relative bg-white pt-6 pb-16 lg:pt-10 lg:pb-24">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: ~45% - Heading, Description, Buttons, Appointment Indicator */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              {/* Exact 3-line heading with "Newark" in bright blue */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-medium text-[#111111] leading-[1.15] tracking-[-0.02em]">
                Primary &amp;<br />
                Preventative Care<br />
                in <span className="text-[#4380FF]">Newark</span>
              </h1>

              {/* Exact Description */}
              <p className="mt-5 text-[17px] sm:text-[18px] text-[#666666] font-normal leading-[1.6] max-w-[440px]">
                {heroSection?.subtitle ||
                  'At Newark Medical Associates provides compassionate, high-quality care focused on prevention, early detection, and patient comfort in a professional, nonjudgmental environment.'}
              </p>

              {/* Action Buttons: Pill-shaped, compact, with hover pop micro-animations */}
              <div className="mt-8 flex items-center gap-4">
                <Link
                  to={heroSection?.primaryButtonUrl || '/contact'}
                  className="hover-btn-pop inline-flex items-center justify-center px-7 py-3 text-[15px] font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors shadow-xs"
                >
                  {heroSection?.primaryButtonLabel || 'Contact Us'}
                </Link>
                <Link
                  to={heroSection?.secondaryButtonUrl || '/providers'}
                  className="hover-btn-pop inline-flex items-center justify-center px-7 py-3 text-[15px] font-medium text-[#4380FF] bg-white hover:bg-blue-50/40 border border-[#4380FF] rounded-full transition-colors shadow-xs"
                >
                  {heroSection?.secondaryButtonLabel || 'Our Providers'}
                </Link>
              </div>

              {/* Appointment Indicator: Overlapping patient avatars + text */}
              <ScrollPop
                delay={0.25}
                initialScale={0.85}
                yOffset={18}
                className="mt-8 flex items-center gap-3"
              >
                <div className="flex items-center">
                  <img
                    src={avatar1}
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-2xs"
                  />
                  <img
                    src={avatar2}
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white -ml-2.5 object-cover shadow-2xs"
                  />
                  <img
                    src={avatar3}
                    alt="Patient"
                    className="w-9 h-9 rounded-full border-2 border-white -ml-2.5 object-cover shadow-2xs"
                  />
                </div>
                <span className="text-sm font-semibold text-[#111111]">
                  {heroSection?.bodyText || '1000+ Appointments'}
                </span>
              </ScrollPop>
            </div>

            {/* Right Column: ~50% - Large healthcare consultation image with scroll pop-up */}
            <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
              <ScrollPop
                delay={0.15}
                initialScale={0.88}
                yOffset={28}
                className="w-full max-w-[490px] lg:max-w-[500px] h-[480px] sm:h-[560px] lg:h-[610px] rounded-[35px] overflow-hidden bg-slate-100 shrink-0"
              >
                <img
                  src={heroImage}
                  alt="Newark Medical Associates clinical consultation"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </ScrollPop>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: MEDICAL SERVICES (8 Core Service Cards)
          ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              Comprehensive Care
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {servicesSection?.title || 'Personalized solutions for better health'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              {servicesSection?.subtitle ||
                'From urgent sick visits and long-term condition management to cardiology and physical rehabilitation, explore our eight specialized service areas.'}
            </p>
          </div>

          {/* 8 Service Cards Grid with hover lift and micro-animations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => {
              const Icon = getIconComponent(service.iconName);
              return (
                <ScrollPop
                  key={service.id}
                  delay={(idx % 4) * 0.07}
                  initialScale={0.92}
                  yOffset={24}
                  className="group bg-slate-50 hover:bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-[#4380FF]/40 hover-card-lift transition-all flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Accent hover indicator line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4380FF] to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-900/10 text-blue-900 flex items-center justify-center mb-5 group-hover:bg-[#4380FF] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#4380FF] transition-colors duration-200">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-6">
                      {service.shortDesc}
                    </p>
                  </div>
                  <div>
                    <Link
                      to={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4380FF] group-hover:text-blue-700 transition-colors"
                    >
                      <span>View Services</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                  </div>
                </ScrollPop>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <span>Explore All Detailed Clinical Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ABOUT US RECREATION (EXACT REFERENCE DESIGN SECTIONS 1, 2, 3)
          ========================================================================= */}
      <AboutSections />

      {/* =========================================================================
          SECTION 5: DIAGNOSTIC SOLUTIONS (8 Diagnostic Tests)
          ========================================================================= */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              On-Site Laboratory & Testing
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {diagSection?.title || 'Diagnostic Solutions'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              {diagSection?.subtitle ||
                'Accurate, fast testing performed on-site at 337 Bloomfield Ave for swift medical clarity and peace of mind.'}
            </p>
          </div>

          {/* 8 Diagnostic Cards Grid with scroll pop-up and hover lift */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diagnostics.map((diag, idx) => {
              const Icon = getIconComponent(diag.iconName);
              return (
                <ScrollPop
                  key={diag.id}
                  delay={(idx % 4) * 0.07}
                  initialScale={0.92}
                  yOffset={24}
                  className="group bg-slate-50 hover:bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#4380FF]/40 hover-card-lift transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-4 group-hover:bg-[#4380FF] group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-[#4380FF] transition-colors">
                      {diag.name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {diag.shortDesc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/80 text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                    <span className="text-slate-700 font-semibold">Turnaround:</span> {diag.turnaroundTime}
                  </div>
                </ScrollPop>
              );
            })}
          </div>

          <div className="mt-12 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-blue-950">
                Need a pre-op clearance or specific diagnostic test?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Call our direct clinical desk at {settings?.phone || '(973) 412-9404'} to speak with staff and reserve your slot.
              </p>
            </div>
            <a
              href={`tel:${(settings?.phone || '973-412-9404').replace(/[^0-9]/g, '')}`}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0 transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call to Book: {settings?.phone || '(973) 412-9404'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: HOW IT WORKS (01 Listen, 02 Understand, 03 Personalize)
          ========================================================================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              Our Patient Care Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {processSection?.title || 'How It Works'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              We eliminate rushed consultations and confusing instructions through a calm, systematic three-step medical process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Listen */}
            <ScrollPop
              delay={0.05}
              initialScale={0.92}
              yOffset={24}
              className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-2xs relative"
            >
              <span className="text-3xl font-extrabold text-blue-900/20 font-serif block mb-3">
                01
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Listen
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We begin every visit by discussing your symptoms, concerns, and lifestyle in detail. You are never rushed, and your lived experience is fully respected.
              </p>
            </ScrollPop>

            {/* Step 2: Understand */}
            <ScrollPop
              delay={0.15}
              initialScale={0.92}
              yOffset={24}
              className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-2xs relative"
            >
              <span className="text-3xl font-extrabold text-blue-900/20 font-serif block mb-3">
                02
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Understand
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our board-certified clinicians integrate diagnostic labs, physical examinations, and family history to identify underlying root causes rather than merely masking symptoms.
              </p>
            </ScrollPop>

            {/* Step 3: Personalize */}
            <ScrollPop
              delay={0.25}
              initialScale={0.92}
              yOffset={24}
              className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-2xs relative"
            >
              <span className="text-3xl font-extrabold text-blue-900/20 font-serif block mb-3">
                03
              </span>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Personalize
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Together with you, we craft a tailored treatment and prevention plan—combining targeted prescriptions, dietary coaching, exercise guidance, and scheduled follow-ups.
              </p>
            </ScrollPop>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED PROVIDERS / CLINICAL LEADERSHIP: TEAM (EXACT REFERENCE IMAGE 2)
          ========================================================================= */}
      <TeamSection />

      {/* =========================================================================
          SECTION 7: TESTIMONIALS
          ========================================================================= */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-2">
              Patient Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              {testSection?.title || 'What Our Patients Say'}
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Read real feedback from Newark and Essex County patients who trust Newark Medical Associates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, idx) => (
              <ScrollPop
                key={t.id}
                delay={(idx % 4) * 0.08}
                initialScale={0.92}
                yOffset={24}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 italic leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{t.patientName}</div>
                  <div className="text-[11px] text-slate-500">{t.location} · {t.doctorCredited}</div>
                </div>
              </ScrollPop>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: CONTACT STRIP & LOCATION
          ========================================================================= */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                Convenient Newark Location
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to schedule your appointment?
              </h2>
              <p className="text-slate-200 text-sm sm:text-base max-w-2xl">
                We are conveniently located at 337 Bloomfield Avenue, Newark, NJ 07107 with accessible parking and public transit connections.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <a
                href={`tel:${(settings?.phone || '973-412-9404').replace(/[^0-9]/g, '')}`}
                className="px-6 py-3.5 text-center text-sm font-bold text-blue-950 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors inline-flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-blue-900" />
                <span>Call to Book: {settings?.phone || '(973) 412-9404'}</span>
              </a>
              <Link
                to="/providers"
                className="px-6 py-3.5 text-center text-sm font-semibold text-white bg-blue-800/80 hover:bg-blue-800 border border-blue-700 rounded-lg transition-colors text-center"
              >
                Provider Directory &amp; Direct Numbers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
