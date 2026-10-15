import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ScrollPop } from './ScrollPop';

// SECTION 1: ABOUT US INTRODUCTION (REFERENCE IMAGE 1)
export const AboutIntroSection: React.FC = () => {
  const { sections } = useClinic();
  const aboutSec = sections.find((s) => s.sectionKey === 'about' || s.sectionKey === 'about_intro');

  const img1 = aboutSec?.additionalImages?.[0] || aboutSec?.imageUrl || '/src/assets/images/gallery_screening_1_1791534688866.jpg';
  const img2 = aboutSec?.additionalImages?.[1] || aboutSec?.secondaryImageUrl || '/src/assets/images/gallery_screening_2_1791534700033.jpg';
  const img3 = aboutSec?.additionalImages?.[2] || '/src/assets/images/gallery_screening_3_1791534712268.jpg';

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Small Section Label */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF] shrink-0" />
          <span className="text-sm font-medium text-[#111111] tracking-tight">About us</span>
        </div>

        {/* Main Heading: Exact wording, 2 lines desktop, regular-to-medium font */}
        <h2 className="text-3xl sm:text-5xl lg:text-[58px] font-medium text-[#111111] leading-[1.15] tracking-[-0.02em] text-center max-w-[820px] mx-auto">
          {aboutSec?.title || 'Vision for a healthier and brighter tomorrow'}
        </h2>

        {/* Centered Pill Button: Get Started */}
        <div className="mt-7 flex justify-center">
          <Link
            to={aboutSec?.primaryButtonUrl || '/contact'}
            className="inline-flex items-center justify-center px-7 py-3 text-[15px] font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors"
          >
            {aboutSec?.primaryButtonLabel || 'Get Started'}
          </Link>
        </div>

        {/* Three-Image Gallery: 3 equal-width images, ~520px height, 20px gap, 24px rounded corners with scroll pop-up */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Image 1: Community screening consultation */}
          <ScrollPop
            delay={0.05}
            className="h-[420px] sm:h-[480px] lg:h-[520px] rounded-[24px] overflow-hidden bg-slate-100"
          >
            <img
              src={img1}
              alt="Healthcare professionals interacting with patients during community health screening"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/gallery_screening_1_1791534688866.jpg';
              }}
            />
          </ScrollPop>

          {/* Image 2: Diagnostic swab / clinical exam */}
          <ScrollPop
            delay={0.15}
            className="h-[420px] sm:h-[480px] lg:h-[520px] rounded-[24px] overflow-hidden bg-slate-100"
          >
            <img
              src={img2}
              alt="Medical professional performing health screening test"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/gallery_screening_2_1791534700033.jpg';
              }}
            />
          </ScrollPop>

          {/* Image 3: Community health outreach */}
          <ScrollPop
            delay={0.25}
            className="h-[420px] sm:h-[480px] lg:h-[520px] rounded-[24px] overflow-hidden bg-slate-100 md:col-span-2 lg:col-span-1"
          >
            <img
              src={img3}
              alt="Medical professionals performing clinical healthcare activities"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/src/assets/images/gallery_screening_3_1791534712268.jpg';
              }}
            />
          </ScrollPop>
        </div>
      </div>
    </section>
  );
};

// SECTION 2: OUR MISSION (REFERENCE IMAGE 2)
export const OurMissionSection: React.FC = () => {
  const { sections } = useClinic();
  const missionSec = sections.find((s) => s.sectionKey === 'about_mission' || s.id === 'sec-about-mission');

  const missionImg1 = missionSec?.imageUrl || '/src/assets/images/mission_doctor_capsule_1791534727327.jpg';
  const missionImg2 = missionSec?.secondaryImageUrl || '/src/assets/images/mission_blood_pressure_1791534804414.jpg';

  const missionPoints = [
    'Comprehensive primary & preventative care',
    'Compassionate and personalized patient experience',
    'Cutting-edge on-site diagnostic capabilities',
    'Multidisciplinary clinical collaboration'
  ];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Overlapping medical photography composition with scroll pop-up */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[420px] h-[520px] sm:h-[560px] flex items-center">
              {/* Main Image: Female healthcare professional in white coat (Tall vertical capsule) */}
              <ScrollPop
                delay={0.1}
                initialScale={0.88}
                yOffset={35}
                className="w-[280px] sm:w-[310px] h-[460px] sm:h-[510px] rounded-[160px] overflow-hidden bg-slate-100"
              >
                <img
                  src={missionImg1}
                  alt="Doctor at Newark Medical Associates"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/mission_doctor_capsule_1791534727327.jpg';
                  }}
                />
              </ScrollPop>

              {/* Secondary Image: Blood pressure measurement (Smaller vertical capsule overlapping bottom right) */}
              <ScrollPop
                delay={0.25}
                initialScale={0.82}
                yOffset={45}
                className="absolute -bottom-2 right-2 sm:right-4 w-[180px] sm:w-[200px] h-[250px] sm:h-[280px] rounded-[100px] overflow-hidden border-4 border-white shadow-xs bg-slate-100 z-10"
              >
                <img
                  src={missionImg2}
                  alt="Blood pressure monitoring and clinical assessment"
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.src = '/src/assets/images/mission_blood_pressure_1791534804414.jpg';
                  }}
                />
              </ScrollPop>
            </div>
          </div>

          {/* Right Column: Mission Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Small Section Label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF] shrink-0" />
              <span className="text-sm font-medium text-[#111111] tracking-tight">Our mission</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-medium text-[#111111] leading-[1.15] tracking-[-0.02em]">
              Committed to community wellness.
            </h2>

            {/* Body Paragraph */}
            <p className="mt-5 text-[16px] sm:text-[17px] text-[#666666] leading-[1.65] font-normal">
              At Newark Medical Associates, our mission is to deliver accessible, high-quality, and preventive-focused clinical care for individuals and families across Newark. We believe in building lasting patient-doctor partnerships grounded in empathy, active listening, and thorough diagnostic precision.
            </p>

            {/* Value checklist */}
            <ul className="mt-6 space-y-3.5">
              {missionPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-3 text-[15px] sm:text-[16px] text-[#111111]">
                  <div className="w-5 h-5 rounded-full bg-[#4380FF] flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            <div className="mt-8">
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-7 py-3 text-[15px] font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// SECTION 3: OUR VISION (REFERENCE IMAGE 3)
export const OurVisionSection: React.FC = () => {
  const { sections } = useClinic();
  const visionSec = sections.find((s) => s.sectionKey === 'about_vision' || s.id === 'sec-about-vision');
  const visionImg = visionSec?.imageUrl || '/src/assets/images/vision_consultation_warm_1791534815659.jpg';

  const visionPoints = [
    'Proactive prevention and early health risk detection',
    'Specialist collaboration uniting primary care, cardiology, and PT',
    'Compassionate, multilingual care for our diverse community',
    'Unhurried consultations focused entirely on patient well-being'
  ];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Vision Content */}
          <div className="lg:col-span-6 flex flex-col justify-center order-2 lg:order-1">
            {/* Small Section Label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF] shrink-0" />
              <span className="text-sm font-medium text-[#111111] tracking-tight">Our vision</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-medium text-[#111111] leading-[1.15] tracking-[-0.02em]">
              Transforming healthcare into a proactive partnership.
            </h2>

            {/* Body Paragraph */}
            <p className="mt-5 text-[16px] sm:text-[17px] text-[#666666] leading-[1.65] font-normal">
              We envision a community where quality healthcare is proactive rather than reactive. By combining modern on-site diagnostic testing, dedicated primary care, and integrated physical rehabilitation under one roof, we empower each patient with the knowledge and tools for lifelong vitality.
            </p>

            {/* Vision Pillars */}
            <ul className="mt-6 space-y-3.5">
              {visionPoints.map((point, index) => (
                <li key={index} className="flex items-center gap-3 text-[15px] sm:text-[16px] text-[#111111]">
                  <div className="w-5 h-5 rounded-full bg-[#4380FF] flex items-center justify-center text-white shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                  </div>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            <div className="mt-8">
              <Link
                to="/providers"
                className="inline-flex items-center justify-center px-7 py-3 text-[15px] font-medium text-white bg-[#4380FF] hover:bg-[#3270ee] rounded-full transition-colors"
              >
                Meet Our Providers
              </Link>
            </div>
          </div>

          {/* Right Column: Large Healthcare Visual with scroll pop-up */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end order-1 lg:order-2">
            <ScrollPop
              delay={0.12}
              initialScale={0.88}
              yOffset={35}
              className="w-full max-w-[490px] lg:max-w-[500px] h-[480px] sm:h-[540px] lg:h-[580px] rounded-[35px] overflow-hidden bg-slate-100"
            >
              <img
                src={visionImg}
                alt="Compassionate healthcare consultation at Newark Medical Associates"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = '/src/assets/images/vision_consultation_warm_1791534815659.jpg';
                }}
              />
            </ScrollPop>
          </div>
        </div>
      </div>
    </section>
  );
};

// COMBINED EXPORT
export const AboutSections: React.FC = () => {
  return (
    <>
      <AboutIntroSection />
      <OurMissionSection />
      <OurVisionSection />
    </>
  );
};
