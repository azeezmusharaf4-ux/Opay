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
    // Start fade out slightly before completion
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(duration - 300, 1500));

    // Finish splash
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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#00B67A] text-white transition-opacity duration-300 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Center Container matching IMG_2422.png */}
      <div className="flex flex-col items-center justify-center px-6 -mt-12 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* 1. White circular emblem with OPay 'O' Logo */}
        <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-white shadow-xl shadow-emerald-900/20">
          <svg 
            className="h-16 w-16 sm:h-20 sm:w-20" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* OPay Green Outer Ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="34" 
              stroke="#00B67A" 
              strokeWidth="15" 
            />
            {/* Dark Purple Horizontal Segment/Bar on the Left */}
            <rect 
              x="12" 
              y="44.5" 
              width="24" 
              height="11" 
              rx="2.5" 
              fill="#22004B" 
            />
          </svg>
        </div>

        {/* 2. Slogan: "We are Beyond Banking" */}
        <h1 
          className="mt-7 sm:mt-8 text-2xl sm:text-3xl font-black tracking-tight text-[#1E0242] leading-tight"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          We are Beyond Banking
        </h1>

        {/* 3. Regulatory Disclaimer matching IMG_2422.png footer banner */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#1E0242] text-[11px] sm:text-xs">
          {/* Nigerian Coat of Arms icon vector */}
          <div className="h-5 w-5 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-emerald-950" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 7H18L15 10L16.5 15L12 12L7.5 15L9 10L6 7H9.5L12 2Z" fill="#14462B" />
              <path d="M7 11C7 16 12 21 12 21C12 21 17 16 17 11V6L12 4L7 6V11Z" stroke="#1E0242" strokeWidth="1.5" fill="none" />
              <path d="M9.5 9L12 13L14.5 9M12 13V18" stroke="#00B67A" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 font-medium tracking-tight">
            <span>Licensed by the <strong className="font-extrabold text-[#140030]">CBN</strong> and insured by the</span>
            <span className="text-slate-500 font-light mx-0.5">|</span>
            <div className="flex flex-col items-start leading-none">
              <span className="font-black text-[#140030] text-xs sm:text-[13px] tracking-tight">NDIC</span>
              <span className="text-[5px] sm:text-[6px] uppercase tracking-tighter opacity-85 font-semibold -mt-0.5">Nigeria Deposit Insurance Corporation</span>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle bottom home bar simulator matching iOS screenshot aesthetic */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
        <div className="h-1 w-32 rounded-full bg-[#1E0242]/30" />
      </div>
    </div>
  );
};
