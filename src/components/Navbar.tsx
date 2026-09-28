import React, { useState } from 'react';
import { Instagram, MessageCircle, Mail, Menu, X as CloseIcon } from 'lucide-react';
import { STORE_CONFIG } from './PaymentModal';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenStore: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenStore,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Shop', id: 'shop', onClick: onOpenStore },
    { label: 'About', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const whatsappLink = `https://wa.me/${STORE_CONFIG.whatsapp.replace('+', '')}?text=${encodeURIComponent('Hi Haider! I have a question regarding V Digital Products Store:')}`;
  const instagramLink = `https://instagram.com/${STORE_CONFIG.instagram}`;
  const emailLink = `mailto:reviewshield.au@gmail.com?subject=${encodeURIComponent('Inquiry / Support - V Digital Products Store')}`;

  return (
    <header className="relative z-50 w-full px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24 pt-7 sm:pt-9 pb-4">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between">
        {/* Left Side: Logo "V" + Navigation links */}
        <div className="flex items-center gap-12 sm:gap-16 md:gap-20 lg:gap-24 xl:gap-28">
          {/* Brand Logo Zone */}
          <button
            onClick={() => onSelectTab('home')}
            className="group flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E58A36] rounded transition-transform active:scale-95 cursor-pointer"
            aria-label="V Brand Home"
          >
            <span
              className="text-2xl sm:text-[28px] font-black tracking-tight text-white leading-none select-none"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              V
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-10 xl:gap-11"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      onSelectTab(item.id);
                    }
                  }}
                  className={`relative py-1 text-[13px] sm:text-[13.5px] font-medium tracking-wide transition-colors duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E58A36] cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#E58A36] rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Social & Contact Icons Zone (WhatsApp, Instagram, Gmail) */}
        <div className="hidden sm:flex items-center gap-3.5 sm:gap-4 text-white">
          {/* WhatsApp Icon */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-neutral-900/80 border border-neutral-800 hover:border-[#25D366] text-neutral-300 hover:text-[#25D366] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#25D366] group relative"
            title="Chat on WhatsApp (+92 321 7945179)"
            aria-label="WhatsApp Contact"
          >
            <MessageCircle className="w-[18px] h-[18px]" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
              WhatsApp
            </span>
          </a>

          {/* Instagram Icon */}
          <a
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full bg-neutral-900/80 border border-neutral-800 hover:border-[#E1306C] text-neutral-300 hover:text-[#E1306C] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E1306C] group relative"
            title="DM on Instagram (@haiderdev.official)"
            aria-label="Instagram Profile"
          >
            <Instagram className="w-[18px] h-[18px]" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
              Instagram
            </span>
          </a>

          {/* Gmail / Email Icon */}
          <a
            href={emailLink}
            className="p-2 rounded-full bg-neutral-900/80 border border-neutral-800 hover:border-[#EA4335] text-neutral-300 hover:text-[#EA4335] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#EA4335] group relative"
            title="Email Support (reviewshield.au@gmail.com)"
            aria-label="Email Support"
          >
            <Mail className="w-[18px] h-[18px]" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-neutral-800">
              Gmail Support
            </span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-300 hover:text-white rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E58A36]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 border-b border-neutral-800/80 backdrop-blur-md px-6 py-6 transition-all duration-300">
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    onSelectTab(item.id);
                  }
                }}
                className={`text-left py-2 text-base font-medium ${
                  activeTab === item.id ? 'text-[#E58A36]' : 'text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-neutral-800 text-neutral-300">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#25D366] bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-semibold text-[#E1306C] bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href={emailLink}
              className="flex items-center gap-2 text-xs font-semibold text-[#EA4335] bg-neutral-900 border border-neutral-800 px-3 py-2 rounded-lg"
            >
              <Mail className="w-4 h-4" /> Gmail
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
