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
      {/* Main Mint Green Balance Card */}
      <div 
        id="opay-balance-card"
        className="relative overflow-hidden rounded-2xl bg-[#10C986] p-3 text-[#092B1D] shadow-md shadow-emerald-950/20"
      >
        {/* Subtle decorative background shine */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-white/10 blur-xl" />

        {/* Top row: Available Balance + Eye + History link */}
        <div className="relative z-10 flex items-center justify-between text-[11.5px] font-medium text-[#092B1D]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 fill-[#092B1D] text-transparent" />
            <span className="font-semibold tracking-tight">Available Balance</span>
            <button
              id="toggle-balance-btn"
              onClick={toggleBalanceVisibility}
              className="ml-0.5 p-0.5 hover:opacity-80 transition-opacity"
              title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
              aria-label="Toggle balance visibility"
            >
              {isBalanceHidden ? (
                <EyeOff className="h-3.5 w-3.5 text-[#092B1D]" />
              ) : (
                <Eye className="h-3.5 w-3.5 text-[#092B1D]" />
              )}
            </button>
          </div>

          <button
            id="view-transaction-history-btn"
            onClick={onOpenHistory}
            className="flex items-center gap-0.5 font-medium hover:underline focus:outline-none text-[11.5px]"
          >
            <span>Transaction History</span>
            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Middle row: Large Amount + Add Money Button */}
        <div className="relative z-10 mt-2 flex items-center justify-between">
          <div 
            onClick={onOpenHistory}
            className="group flex items-center cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tight font-mono text-[#092B1D]">
              {!isAuthenticated ? '****' : (isBalanceHidden ? '••••••' : formatNgn(opayBalance))}
            </span>
            <ChevronRight className="ml-1 h-4 w-4 text-[#092B1D] group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
          </div>

          <button
            id="add-money-btn"
            onClick={onOpenAddMoney}
            className="flex items-center justify-center rounded-full bg-[#0D3824] px-3.5 py-1.5 text-xs font-bold text-[#10C986] hover:bg-[#072417] active:scale-95 transition-all shadow-sm"
          >
            <span>+ Add Money</span>
          </button>
        </div>
      </div>

      {/* Secondary Strip: Business Service - Today's Sales (Shown only when logged in) */}
      {isAuthenticated && (
        <div 
          id="opay-sales-strip"
          className="flex items-center justify-between rounded-2xl bg-[#1E1F24] px-3.5 py-2.5 text-xs text-slate-300 border border-slate-800/80 hover:bg-[#25272F] cursor-pointer transition-colors"
          onClick={onOpenHistory}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#10C986]/15 text-[#10C986]">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M4 4h16a2 2 0 0 1 2 2v2H2V6a2 2 0 0 1 2-2zm-2 6h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10zm4 4v4h4v-4H6z" />
              </svg>
            </div>
            <div className="text-[11px]">
              <span className="text-slate-400">Business Service - Today's Sales: </span>
              <span className="font-bold text-[#10C986] font-mono">
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
