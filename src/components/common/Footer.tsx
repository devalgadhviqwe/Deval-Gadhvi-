import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const Footer: React.FC = () => {
  const { settings, services } = useClinic();

  const phone = settings?.phone || '(973) 412-9404';
  const email = settings?.email || 'medicalnewark@gmail.com';
  const address = settings?.address || '337 Bloomfield Avenue, Newark, NJ 07107';
  const workingHours = settings?.workingHours || 'Monday – Friday: 8:30 AM – 6:00 PM | Saturday: 9:00 AM – 2:00 PM';
  const footerDesc =
    settings?.footerDescription ||
    'Newark Medical Associates provides comprehensive, patient-centered healthcare focused on prevention, chronic disease management, advanced diagnostics, and physical therapy in Newark, New Jersey.';

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-14 border-b border-slate-800">
          {/* Column 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings?.logoDarkUrl || settings?.logoUrl ? (
                <img
                  src={settings.logoDarkUrl || settings.logoUrl}
                  alt={settings.practiceName || 'Logo'}
                  className="h-10 w-auto max-w-[200px] object-contain rounded-md bg-white/10 p-1"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-lg font-serif shadow-sm">
                  NMA
                </div>
              )}
              {settings?.showLogoText !== false && (
                <span className="text-xl font-bold tracking-tight text-white">
                  {settings?.practiceName || 'Newark Medical Associates'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {footerDesc}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-sky-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Board-Certified Physicians & Clinicians</span>
            </div>
          </div>

          {/* Column 2: Medical Services */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Our Medical Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <Link
                    to={`/services/${service.slug}`}
                    className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span>{service.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/services"
                  className="text-sky-400 hover:text-sky-300 font-medium text-xs pt-1 inline-block"
                >
                  View All Services & Diagnostics &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation & Providers */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Patient Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/about-us" className="hover:text-white transition-colors">
                  About Our Practice
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-white transition-colors">
                  Meet Our Doctors & Clinicians
                </Link>
              </li>
              <li>
                <Link to="/providers/dr-prahlad-gadhavi" className="hover:text-white transition-colors">
                  Dr. Prahlad Gadhavi, MD
                </Link>
              </li>
              <li>
                <Link to="/providers/dr-deval-gadhvi" className="hover:text-white transition-colors">
                  Dr. Deval Gadhvi, MD (Medical Director)
                </Link>
              </li>
              <li>
                <Link to="/providers/dr-sankalp-pathak" className="hover:text-white transition-colors">
                  Dr. Sankalp Pathak, MD (Cardiologist)
                </Link>
              </li>
              <li>
                <Link to="/providers/dr-disha-patel" className="hover:text-white transition-colors">
                  Dr. Disha Patel, PT, DPT (Physical Therapy)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Appointment & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Clinic Contact & Hours */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white mb-4">
              Clinic Location & Hours
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
                <span>
                  <strong className="text-white block font-medium">Newark Office</strong>
                  {address}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Phone Consultation</span>
                  <a
                    href={`tel:${phone.replace(/[^0-9]/g, '')}`}
                    className="text-white hover:text-sky-300 font-medium"
                  >
                    {phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">General Inquiries</span>
                  <a
                    href={`mailto:${email}`}
                    className="text-white hover:text-sky-300 break-all"
                  >
                    {email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sky-400 mt-1 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Clinical Hours</span>
                  <span className="text-xs leading-relaxed block">{workingHours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimers and Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Newark Medical Associates. All rights reserved. 337 Bloomfield Ave, Newark, NJ 07107.
          </p>
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline">
              Committed to Newark Health &amp; Wellness
            </span>
            <Link
              to="/admin"
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              Staff Admin CMS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
