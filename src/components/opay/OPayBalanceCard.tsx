import React from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { ShieldCheck, Eye, EyeOff, ChevronRight, Plus } from 'lucide-react';
import { formatNgn } from '../../utils/formatters';

interface OPayBalanceCardProps {
  onOpenHistory: () => void;
  onOpenAddMoney: () => void;
}

export const OPayBalanceCard: React.FC<OPayBalanceCardProps> = ({
  onOpenHistory,
  onOpenAddMoney,
}) => {
  const { opayBalance, isBalanceHidden, toggleBalanceVisibility, userProfile, isAuthenticated } = useDemoWallet();

  return (
    <div className="space-y-1.5">
      {/* Main Teal/Green Balance Card */}
      <div 
        id="opay-balance-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00D589] via-[#00DF8F] to-[#00C77A] p-3 text-[#0B3322] shadow-md shadow-emerald-950/20"
      >
        {/* Subtle decorative background waves */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -left-4 -top-4 h-16 w-16 rounded-full bg-emerald-300/20 blur-lg" />

        {/* Top row: Available Balance + Eye + History link */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-semibold text-[#0B3322]/90">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 fill-[#0B3322] text-transparent" />
            <span className="font-semibold tracking-tight">Available Balance</span>
            <button
              id="toggle-balance-btn"
              onClick={toggleBalanceVisibility}
              className="ml-0.5 p-0.5 hover:opacity-80 transition-opacity"
              title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
              aria-label="Toggle balance visibility"
            >
              {isBalanceHidden ? (
                <EyeOff className="h-3.5 w-3.5 text-[#0B3322]" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-[#0B3322]" />
              )}
            </button>
          </div>

          <button
            id="view-transaction-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-0.5 font-semibold hover:underline focus:outline-none"
          >
            <span>Transaction History</span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Middle row: Large Amount + Add Money Button */}
        <div className="relative z-10 mt-1.5 flex items-center justify-between">
          <div 
            onClick={onOpenHistory}
            className="group flex items-center cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tight font-mono text-[#0B3322]">
              {!isAuthenticated ? '****' : (isBalanceHidden ? '••••••' : formatNgn(opayBalance))}
            </span>
            <ChevronRight className="ml-0.5 h-4.5 w-4.5 text-[#0B3322]/80 group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>

          <button
            id="add-money-btn"
            onClick={onOpenAddMoney}
            className="flex items-center gap-1 rounded-full bg-[#0D3824] px-3.5 py-1.5 text-xs font-bold text-[#00DF8F] hover:bg-[#082819] active:scale-95 transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            <span>+ Add Money</span>
          </button>
        </div>
      </div>

      {/* Secondary Strip: Business Service - Today's Sales (Shown only when logged in) */}
      {isAuthenticated && (
        <div 
          id="opay-sales-strip"
          className="flex items-center justify-between rounded-xl bg-[#1B1E24] px-3 py-2 text-xs text-slate-300 border border-slate-800/60 hover:bg-[#222730] cursor-pointer transition-colors"
          onClick={onOpenHistory}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00D589]/15 text-[#00D589]">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 0 1 2 2v2H2V6a2 2 0 0 1 2-2zm-2 6h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10zm4 4v4h4v-4H6z" />
              </svg>
            </div>
            <div className="text-[11px]">
              <span className="text-slate-400">Business Service - Today's Sales: </span>
              <span className="font-bold text-[#00DF8F] font-mono">
                {isBalanceHidden ? '••••••' : formatNgn(userProfile.todaySalesNgn)}
              </span>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
        </div>
      )}
    </div>
  );
};
