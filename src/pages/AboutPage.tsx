import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import {
  AboutIntroSection,
  OurMissionSection,
  OurVisionSection
} from '../components/common/AboutSections';
import { TeamSection } from '../components/common/TeamSection';
import { ScrollPop } from '../components/common/ScrollPop';

export const AboutPage: React.FC = () => {
  const { settings } = useClinic();

  const whyChooseUsPoints = [
    {
      title: 'On-Site Diagnostic Suite',
      desc: 'EKG, blood draws, echocardiograms, and allergy testing all performed on-site at 337 Bloomfield Ave.'
    },
    {
      title: 'Prompt Scheduling',
      desc: 'Convenient same-week appointments for acute illnesses, preventative physicals, and chronic care management.'
    },
    {
      title: 'Multilingual Clinical Team',
      desc: 'Our providers and staff speak English, Spanish, Hindi, and Gujarati to serve our vibrant local community.'
    },
    {
      title: 'Collaborative Care Team',
      desc: 'Internal medicine, cardiology, and physical therapy collaborate seamlessly under one roof.'
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* =========================================================================
          SECTION 1: ABOUT US INTRODUCTION (EXACT REFERENCE 1)
          ========================================================================= */}
      <AboutIntroSection />

      {/* =========================================================================
          SECTION 2: OUR MISSION (EXACT REFERENCE 2)
          ========================================================================= */}
      <OurMissionSection />

      {/* =========================================================================
          SECTION 3: OUR VISION (EXACT REFERENCE 3)
          ========================================================================= */}
      <OurVisionSection />

      {/* =========================================================================
          SECTION 4: TEAM — MEET OUR DEDICATED & EXPERIENCED TEAM (IMAGE 2)
          ========================================================================= */}
      <TeamSection />

      {/* =========================================================================
          WHY CHOOSE US (CLEAN 4-COLUMN CARDS)
          ========================================================================= */}
      <section className="bg-white py-16 lg:py-20 border-t border-slate-100">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF] shrink-0" />
              <span className="text-sm font-medium text-[#111111] tracking-tight">Our Distinction</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-medium text-[#111111] tracking-tight">
              Why Patients Choose Newark Medical Associates
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUsPoints.map((item, idx) => (
              <ScrollPop
                key={idx}
                delay={idx * 0.08}
                initialScale={0.92}
                yOffset={25}
                className="bg-white p-6 rounded-[20px] border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="w-7 h-7 rounded-full bg-[#4380FF] flex items-center justify-center text-white mb-4">
                    <Check className="w-4 h-4 stroke-[2.8]" />
                  </div>
                  <h3 className="text-base font-medium text-[#111111] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{item.desc}</p>
                </div>
              </ScrollPop>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONTACT CTA BANNER
          ========================================================================= */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollPop
            delay={0.1}
            initialScale={0.94}
            yOffset={25}
            className="rounded-[28px] bg-slate-50 border border-slate-200/80 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="max-w-xl">
              <h3 className="text-2xl sm:text-3xl font-medium text-[#111111]">
                Ready to take control of your health?
              </h3>
              <p className="text-[#666666] text-sm mt-2 leading-relaxed">
                Schedule a consultation with our clinicians today or call our front desk directly at{' '}
                <span className="font-medium text-[#111111]">{settings?.phone || '(973) 412-9404'}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`tel:${(settings?.phone || '973-412-9404').replace(/[^0-9]/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 text-[15px] font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors shadow-2xs"
              >
                <span>Call to Book: {settings?.phone || '(973) 412-9404'}</span>
              </a>
              <Link
                to="/providers"
                className="inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium text-[#4380FF] bg-white border border-[#4380FF] hover:bg-blue-50/50 rounded-full transition-colors"
              >
                View Providers
              </Link>
            </div>
          </ScrollPop>
        </div>
      </section>
    </div>
  );
};
