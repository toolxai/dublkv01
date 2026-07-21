'use client';

import { useState, useEffect } from 'react';

export default function CommunityModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen or closed the community modal
    const hasSeen = localStorage.getItem('dublk_community_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('dublk_community_seen', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-950/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-dark-900 border border-white/10 p-6 sm:p-8 shadow-2xl shadow-brand-500/20 z-10 text-center animate-scale-in overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-brand-500/30">
          🎬
        </div>

        {/* Title & Description */}
        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
          Join DubLK Community!
        </h2>
        <p className="text-xs sm:text-sm text-dark-300 mb-6 leading-relaxed">
          Stay updated with the latest Sinhala dubbed releases, request movies, and connect with thousands of movie lovers.
        </p>

        {/* Social Links Stack */}
        <div className="space-y-3 mb-6">
          {/* WhatsApp */}
          <a
            href="https://whatsapp.com/channel/0029VbDbx6OBVJkufvzfZY1T"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20 transition-all font-semibold text-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">💬</span>
              <span>Join WhatsApp Channel</span>
            </div>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/dublkofficial"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] hover:bg-[#0088cc]/20 transition-all font-semibold text-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">✈️</span>
              <span>Join Telegram Channel</span>
            </div>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/dublkofficial"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20 transition-all font-semibold text-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📘</span>
              <span>Follow Facebook Page</span>
            </div>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>

        {/* Continue to site */}
        <button
          onClick={handleClose}
          className="w-full py-2.5 text-xs text-dark-400 hover:text-white transition-colors"
        >
          Continue to Website
        </button>
      </div>
    </div>
  );
}
