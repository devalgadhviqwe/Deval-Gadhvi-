import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plus } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const Header: React.FC = () => {
  const { settings } = useClinic();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about-us' },
    { label: 'Services', path: '/services' },
    { label: 'Providers', path: '/providers' },
    { label: 'Blog', path: '/blog' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="w-full bg-white sticky top-0 z-50">
      {/* Centered max-w-[1100px] header container with height ~85-95px */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[90px]">
          {/* Logo and Branding: Left Position */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.practiceName || 'Logo'}
                className="h-9 sm:h-10 w-auto max-w-[200px] object-contain transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              /* Small rounded blue square containing simple white medical plus icon */
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#4380FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Plus className="w-5 h-5 stroke-[2.8]" />
              </div>
            )}
            {settings?.showLogoText !== false && (
              <span className="text-[17px] sm:text-[18px] font-medium text-[#111111] tracking-tight">
                {settings?.practiceName || 'Newark Medical Associates'}
              </span>
            )}
          </Link>

          {/* Centered Navigation: Home | About | Services | Providers with animated hover underline */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative text-[15px] font-medium transition-colors py-1 group ${
                  isActive(item.path)
                    ? 'text-[#4380FF]'
                    : 'text-[#111111] hover:text-[#4380FF]'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#4380FF] rounded-full transition-all duration-300 ${
                    isActive(item.path)
                      ? 'w-full'
                      : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right Button: Blue rounded pill button "Contact Us" with hover micro-animation */}
          <div className="hidden md:flex items-center shrink-0">
            <Link
              to={settings?.primaryCtaUrl || '/contact'}
              className="hover-btn-pop inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-[#4380FF] hover:bg-[#3372f0] rounded-full transition-all shadow-xs"
            >
              {settings?.primaryCtaLabel || 'Contact Us'}
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#111111] hover:text-[#4380FF] focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-5 py-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-1.5 ${
                  isActive(item.path) ? 'text-[#4380FF]' : 'text-[#111111]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center block py-2.5 text-sm font-medium text-white bg-[#4380FF] rounded-full"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
