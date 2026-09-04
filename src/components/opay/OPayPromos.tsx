import React from 'react';
import { Banknote, Sparkles, Users, ArrowRight } from 'lucide-react';

interface OPayPromosProps {
  onSavingsClick: () => void;
  onInviteClick: () => void;
  onSignUpClick?: () => void;
}

export const OPayPromos: React.FC<OPayPromosProps> = ({
  onSavingsClick,
  onInviteClick,
  onSignUpClick,
}) => {
  return (
    <div id="opay-promos-container" className="space-y-2 pb-2">
      {/* Sign Up Banner matching IMG_2745.png */}
      <div 
        id="promo-signup-banner"
        onClick={onSignUpClick || onInviteClick}
        className="relative overflow-hidden rounded-2xl bg-[#1E1F24] p-3 border border-slate-800/60 shadow-sm cursor-pointer hover:border-[#10C986]/40 transition-all group"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            {/* 3D phone and cash icon representation matching IMG_2745.png */}
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/30 text-[#10C986] border border-[#10C986]/30 shadow-inner group-hover:scale-105 transition-transform">
              <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="16" height="24" rx="3" fill="#10C986" fillOpacity="0.3" stroke="#10C986" strokeWidth="1.5" />
                <rect x="9" y="7" width="10" height="15" rx="1.5" fill="#1E1F24" />
                <path d="M12 24h4" stroke="#10C986" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M16 8l8-3v8l-8 3V8z" fill="#00E599" fillOpacity="0.8" stroke="#10C986" strokeWidth="1" />
                <circle cx="20" cy="12" r="1.5" fill="#092B1D" />
              </svg>
            </div>

            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white tracking-tight">
                Get ₦300 airtime voucher
              </span>
              <p className="text-[10px] leading-tight text-slate-400">
                Register now and enjoy instant welcome bonuses
              </p>
            </div>
          </div>

          <button
            id="signup-banner-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (onSignUpClick) onSignUpClick();
              else onInviteClick();
            }}
            className="flex shrink-0 items-center justify-center rounded-full bg-[#10C986] px-4 py-1.5 text-xs font-bold text-[#092B1D] shadow hover:bg-[#0fd68e] active:scale-95 transition-all cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};
