import React, { useEffect, useState } from 'react';

interface OPaySplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export const OPaySplashScreen: React.FC<OPaySplashScreenProps> = ({ 
  onFinish, 
  duration = 2200 
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start smooth dissolve transition at 1700ms (matches video Frame 00:02)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(duration - 500, 1400));

    // Remove from DOM after dissolve finishes (Frame 00:03)
    const finishTimer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div 
      id="opay-splash-screen"
      onClick={() => setIsFadingOut(true)}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#00B875] text-[#0A1C2A] transition-opacity duration-500 ease-out select-none cursor-pointer ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Centered Brand Lockup matching Frame 00:01 & 00:02 in video */}
      <div className="flex flex-col items-center justify-center px-6 text-center animate-in fade-in zoom-in-[0.98] duration-300">
        
        {/* 1. White OPay Logo Ring directly on green canvas */}
        <div className="relative flex items-center justify-center">
          <svg 
            className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-sm" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Crisp White Outer Ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="34" 
              stroke="#FFFFFF" 
              strokeWidth="15" 
            />
            {/* Cyan/Mint Horizontal Tab on the left matching OPay brand mark in video */}
            <rect 
              x="12" 
              y="42" 
              width="22" 
              height="16" 
              rx="2.5" 
              fill="#00D589" 
            />
          </svg>
        </div>

        {/* 2. Slogan: "We are Beyond Banking" */}
        <h1 
          className="mt-6 text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#0A1C2A] leading-tight"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          We are Beyond Banking
        </h1>

        {/* 3. Regulatory Disclaimer: Coat of Arms + CBN / NDIC Banner */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#0A1C2A] text-xs sm:text-[13px]">
          {/* Nigerian Coat of Arms vector badge */}
          <div className="h-6 w-6 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 48 48" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
              {/* Red Eagle Crest */}
              <path d="M24 6C23 4 25 3 24 2C23 3 25 4 24 6Z" fill="#D32F2F" />
              <circle cx="24" cy="5" r="2.5" fill="#D32F2F" />
              {/* Torse */}
              <rect x="20" y="8" width="8" height="2" rx="1" fill="#00B875" />
              <rect x="22" y="8" width="4" height="2" fill="#FFFFFF" />
              {/* Black Shield with Y-pall */}
              <path d="M18 11H30V24C30 30 24 35 24 35C24 35 18 30 18 24V11Z" fill="#111827" />
              <path d="M20 12L24 20L28 12M24 20V32" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {/* Left Stallion (White Horse) */}
              <path d="M12 24C12 18 15 15 17 14L18 20L15 28L13 28Z" fill="#F9FAFB" />
              {/* Right Stallion (White Horse) */}
              <path d="M36 24C36 18 33 15 31 14L30 20L33 28L35 28Z" fill="#F9FAFB" />
              {/* Green Mount Base */}
              <ellipse cx="24" cy="36" rx="16" ry="3" fill="#15803D" />
            </svg>
          </div>

          <div className="flex items-center gap-1 font-semibold tracking-tight text-[#0A1C2A]">
            <span>Licensed by the <strong className="font-black text-[#0A1C2A]">CBN</strong> and insured by the</span>
            <span className="text-[#0A1C2A]/60 font-normal mx-0.5">|</span>
            <div className="flex items-baseline">
              <span className="font-black text-[#004C97] text-xs sm:text-[14px] tracking-tight">NDIC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle home indicator bar at bottom matching iOS */}
      <div className="absolute bottom-2.5 inset-x-0 flex justify-center pointer-events-none">
        <div className="h-1 w-32 rounded-full bg-[#0A1C2A]/20" />
      </div>
    </div>
  );
};
