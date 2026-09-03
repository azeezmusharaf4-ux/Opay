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
    <div id="opay-promos-container" className="space-y-2">
      {/* Sign Up Banner matching IMG_2486.png */}
      <div 
        id="promo-signup-banner"
        onClick={onSignUpClick || onInviteClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b271d] via-[#0d3125] to-[#092119] p-2.5 border border-emerald-900/50 shadow-sm cursor-pointer hover:border-emerald-600/50 transition-all group"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Green cash stack icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
              <Banknote className="h-5 w-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white">Get ₦300 airtime voucher</span>
                <Sparkles className="h-3 w-3 text-amber-400" />
              </div>
              <p className="text-[10px] leading-tight text-slate-300">
                Register now and enjoy instant welcome bonuses and free bank transfers
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
            className="flex shrink-0 items-center justify-center rounded-full bg-[#00D589] px-4 py-1.5 text-xs font-black text-[#0B3322] shadow hover:bg-emerald-300 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-1 pt-1">
        <h3 className="text-xs font-bold text-white tracking-tight">
          OPay 7 Savings Festival
        </h3>
      </div>

      {/* Main Promo Card: Earn 27% p.a. */}
      <div 
        id="promo-savings-festival-card"
        onClick={onSavingsClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0b271d] via-[#0d3125] to-[#092119] p-2.5 border border-emerald-900/50 shadow-sm cursor-pointer hover:border-emerald-600/50 transition-all group"
      >
        <div className="relative z-10 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Green cash stack icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner group-hover:scale-105 transition-transform">
              <Banknote className="h-5 w-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white">Earn 27% p.a. Now!</span>
                <Sparkles className="h-3 w-3 text-amber-400" />
              </div>
              <p className="text-[10px] leading-tight text-slate-300">
                Create a Target, earn 27% p.a. & invite friends to earn up to ₦5M!
              </p>
            </div>
          </div>

          <button
            id="savings-festival-go-btn"
            className="flex shrink-0 items-center justify-center rounded-full bg-[#00D589] px-3.5 py-1 text-xs font-bold text-[#0B3322] shadow hover:bg-emerald-300 transition-colors"
          >
            Go
          </button>
        </div>
      </div>

      {/* Secondary Promo: Share OPay with Others matching IMG_2472.png */}
      <div 
        id="promo-invite-card"
        onClick={onInviteClick}
        className="relative overflow-hidden rounded-2xl bg-[#1B1E24] p-2.5 border border-slate-800/80 shadow-sm cursor-pointer hover:bg-[#222730] transition-colors"
      >
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 overflow-hidden">
              <Users className="h-4.5 w-4.5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Share OPay with Others</h4>
              <p className="text-[10px] leading-tight text-slate-400">
                Help a loved one get their own account in minutes
              </p>
            </div>
          </div>
          <button
            id="share-opay-go-btn"
            className="flex shrink-0 items-center justify-center rounded-full bg-[#00D589] px-3.5 py-1 text-xs font-bold text-[#0B3322] shadow hover:bg-emerald-300 transition-colors"
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
};
