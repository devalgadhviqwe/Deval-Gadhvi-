import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Phone } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { ScrollPop } from './ScrollPop';

export const TeamSection: React.FC = () => {
  const { doctors } = useClinic();

  // Primary initial team configuration with uploaded doctor photos & direct phone numbers
  const initialTeamFallbacks = [
    {
      id: 'doc-1',
      name: 'Dr. Prahlad Gadhavi',
      role: 'Founder & Internal Medicine Specialist',
      specialty: 'Internal Medicine',
      slug: 'dr-prahlad-gadhavi',
      phone: '(973) 412-9404',
      email: 'medicalnewark@gmail.com',
      imageUrl: '/uploads/aU1QUlSKO9mpYg2rCyxW7d2q0_1791973543258_5455.avif',
      fallbackAssetUrl: '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
      isPlaceholder: false
    },
    {
      id: 'doc-2',
      name: 'Dr. Deval Gadhvi',
      role: 'Medical Director & Primary Care',
      specialty: 'Primary Care & Internal Medicine',
      slug: 'dr-deval-gadhvi',
      phone: '(973) 412-9404',
      email: 'medicalnewark@gmail.com',
      imageUrl: '/uploads/SiRK7DEBXDBaO1d4R9uqpEvLUg_1791973553041_9635.avif',
      fallbackAssetUrl: '/src/assets/images/dr_deval_gadhvi_1791527225408.jpg',
      isPlaceholder: false
    },
    {
      id: 'doc-3',
      name: 'Dr. Sankalp Pathak',
      role: 'Interventional Cardiologist',
      specialty: 'Cardiology & Cardiovascular Disease',
      slug: 'dr-sankalp-pathak',
      phone: '(973) 370-5259',
      email: 'mycardiovascularclinic@mycardiovascularclinic.com',
      imageUrl: '/uploads/llBwa8qqHJ0lkN1qwePotRnzyg_1791973561605_204.avif',
      fallbackAssetUrl: '/src/assets/images/dr_sankalp_pathak_1791527235581.jpg',
      isPlaceholder: false
    },
    {
      id: 'doc-4',
      name: 'Dr. Disha Patel',
      role: 'Doctor of Physical Therapy',
      specialty: 'Physical Therapy & Rehabilitation',
      slug: 'dr-disha-patel',
      phone: '(862) 285-4400',
      email: 'info@motionrehabpt.com',
      imageUrl: '/uploads/tnrxNiojdNLKiHtHPyMhvxIsQM0_1791973570730_3593.avif',
      fallbackAssetUrl: '/src/assets/images/dr_disha_patel_1791527246009.jpg',
      isPlaceholder: false
    }
  ];

  // Dynamically resolve doctors from live database / admin panel while preserving target layout & order
  const activeDoctors = doctors && doctors.length > 0 ? [...doctors].sort((a, b) => a.displayOrder - b.displayOrder) : [];

  const resolvedMembers = initialTeamFallbacks.map((fallback) => {
    const liveDoc = activeDoctors.find(
      (d) => d.id === fallback.id || d.slug === fallback.slug || d.name.toLowerCase().includes(fallback.name.toLowerCase())
    );
    if (liveDoc) {
      const liveImage = liveDoc.imageUrl && liveDoc.imageUrl.trim() ? liveDoc.imageUrl : fallback.imageUrl;
      const isPlaceholder = !liveImage || liveImage.includes('silhouette_placeholder');

      return {
        id: liveDoc.id || fallback.id,
        name: liveDoc.name || fallback.name,
        role: liveDoc.title || fallback.role,
        specialty: liveDoc.specialties?.[0] || fallback.specialty,
        slug: liveDoc.slug || fallback.slug,
        phone: liveDoc.phone || fallback.phone,
        email: liveDoc.email || fallback.email,
        imageUrl: liveImage,
        fallbackAssetUrl: fallback.fallbackAssetUrl,
        isPlaceholder
      };
    }
    return fallback;
  });

  // If new doctors were added via admin panel beyond the 4 initial, append them in order
  activeDoctors.forEach((doc) => {
    if (!resolvedMembers.some((m) => m.id === doc.id || m.slug === doc.slug)) {
      resolvedMembers.push({
        id: doc.id,
        name: doc.name,
        role: doc.title || 'Specialist',
        specialty: doc.specialties?.[0] || 'Clinical Specialist',
        slug: doc.slug,
        phone: doc.phone || '(973) 412-9404',
        email: doc.email || 'medicalnewark@gmail.com',
        imageUrl: doc.imageUrl || '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
        fallbackAssetUrl: '/src/assets/images/dr_prahlad_gadhavi_1791527214445.jpg',
        isPlaceholder: false
      });
    }
  });

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Center: Small blue circular dot + "Team" label */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4380FF] shrink-0" />
          <span className="text-sm font-medium text-[#111111] tracking-tight">Team</span>
        </div>

        {/* Main Heading: Max-width ~750px, desktop two lines */}
        <div className="text-center max-w-[750px] mx-auto mb-14 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-medium text-[#111111] leading-[1.15] tracking-[-0.02em]">
            Meet our dedicated and
            <br className="hidden sm:inline" /> experienced team of experts
          </h2>
        </div>

        {/* Doctor Grid: Exact Three-Column Layout (Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {resolvedMembers.map((member, index) => (
            <ScrollPop
              key={member.id}
              delay={index * 0.1}
              initialScale={0.88}
              yOffset={32}
              className="group flex flex-col"
            >
              {/* Doctor Image Container: Light blue-gray bg #F4F9FC, rounded-3xl ~28px, overflow-hidden */}
              <div className="relative w-full aspect-[4/4.75] bg-[#F4F9FC] rounded-[28px] overflow-hidden flex items-center justify-center shadow-xs">
                {member.isPlaceholder ? (
                  /* Gray silhouette placeholder */
                  <div className="w-full h-full flex items-center justify-center bg-[#F4F9FC] relative">
                    <svg
                      viewBox="0 0 240 280"
                      className="w-[72%] h-[72%] text-slate-300 fill-current opacity-70"
                      aria-hidden="true"
                    >
                      <circle cx="120" cy="85" r="48" />
                      <path d="M40 240 C40 170, 75 155, 120 155 C165 155, 200 170, 200 240 Z" />
                    </svg>
                  </div>
                ) : (
                  /* Doctor Portrait with automatic fallback error handling */
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      if (member.fallbackAssetUrl && e.currentTarget.src !== member.fallbackAssetUrl) {
                        e.currentTarget.src = member.fallbackAssetUrl;
                      }
                    }}
                  />
                )}

                {/* Profile Link Arrow Button: Floating rounded circular button */}
                <Link
                  to={`/providers/${member.slug}`}
                  aria-label={`View full profile of ${member.name}`}
                  className="absolute bottom-4 right-4 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/95 hover:bg-white text-[#111111] hover:text-[#4380FF] shadow-xs flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                </Link>
              </div>

              {/* Text Information Below Image */}
              <div className="mt-4 sm:mt-5">
                {/* Doctor's Full Name: Medium weight, dark text ~20-22px */}
                <Link
                  to={`/providers/${member.slug}`}
                  className="block text-xl sm:text-[22px] font-medium text-[#111111] hover:text-[#4380FF] transition-colors leading-tight"
                >
                  {member.name}
                </Link>

                {/* Role / Specialty: Subtle muted gray #666666 ~14-15px */}
                <p className="mt-1 text-sm sm:text-[15px] text-[#666666] leading-normal font-normal">
                  {member.role}
                </p>

                {/* Direct Appointment Phone & Call to Book Button */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 font-medium truncate">
                    Direct: <span className="text-slate-900 font-semibold">{member.phone}</span>
                  </div>
                  <a
                    href={`tel:${member.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-full transition-colors shrink-0 shadow-2xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call to Book</span>
                  </a>
                </div>
              </div>
            </ScrollPop>
          ))}
        </div>
      </div>
    </section>
  );
};
