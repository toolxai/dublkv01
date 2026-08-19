'use client';

import { useEffect } from 'react';

interface DataFreeNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataFreeNoticeModal({ isOpen, onClose }: DataFreeNoticeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-dark-900/95 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-900/20 overflow-hidden z-10 animate-scale-in">
        {/* Glow Accent Top Right */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors z-20"
          aria-label="Close notice"
        >
          ✕
        </button>

        <div className="space-y-6 text-center relative z-10">
          {/* Top Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-purple-400/10 border border-purple-500/30 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/10">
            🖥️
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-wide">
              Best Video Experience Tip
            </h3>
            <p className="text-xs text-purple-400 font-semibold tracking-wider uppercase">
              වඩාත් හොඳ වීඩියෝ අත්දැකීමක් සඳහා
            </p>
          </div>

          {/* Messages */}
          <div className="space-y-4 text-left bg-dark-950/70 border border-white/10 rounded-2xl p-4 sm:p-5">
            {/* Sinhala Notice */}
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 flex-shrink-0">💡</span>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                Data Free හා Ads නොමැතිව චිත්රපට සහ TV Series නැරඹීමේදී වඩාත් හොඳ වීඩියෝ අත්දැකීමක් ලබා ගැනීම සඳහා <strong className="text-purple-300 font-bold">Desktop Mode</strong> හෝ <strong className="text-purple-300 font-bold">PC / Laptop</strong> එකක් භාවිත කරන්න.
              </p>
            </div>

            <div className="border-t border-white/10 my-2" />

            {/* English Notice */}
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5 flex-shrink-0">🌐</span>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                For a better video experience while watching movies and TV series data-free with no ads, please use <strong className="text-purple-300 font-bold">Desktop Mode</strong> or a <strong className="text-purple-300 font-bold">PC / Laptop</strong>.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            හරි, තේරුණා / I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
