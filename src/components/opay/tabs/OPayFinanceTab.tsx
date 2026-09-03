import React, { useState } from 'react';
import { useDemoWallet } from '../../../context/DemoWalletContext';
import { formatNgn, formatTimestamp } from '../../../utils/formatters';
import { 
  TrendingUp, 
  Briefcase, 
  Lock, 
  Unlock, 
  HandCoins, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  ArrowUpRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface OPayFinanceTabProps {
  onOpenSafeBoxModal: () => void;
  onOpenLoanModal: () => void;
}

export const OPayFinanceTab: React.FC<OPayFinanceTabProps> = ({
  onOpenSafeBoxModal,
  onOpenLoanModal,
}) => {
  const { 
    userProfile, 
    safeBoxes, 
    activeLoan, 
    withdrawFromSafeBox, 
    repayInstantLoan,
    opayBalance,
    isBalanceHidden
  } = useDemoWallet();

  const [activeFinanceView, setActiveFinanceView] = useState<'overview' | 'safebox' | 'loans'>('overview');
  const [repaying, setRepaying] = useState(false);

  const totalWealth = userProfile.savingsBalanceNgn + userProfile.owealthBalanceNgn;

  const handleRepay = async () => {
    if (activeLoan.currentBorrowedNgn <= 0) return;
    setRepaying(true);
    try {
      await repayInstantLoan(activeLoan.currentBorrowedNgn);
      alert('Loan repaid in full from your available demo balance.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Repayment failed.');
    } finally {
      setRepaying(false);
    }
  };

  return (
    <div className="space-y-4 py-2 animate-in fade-in duration-150">
      {/* Finance Overview Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D281F] via-[#113B2C] to-[#0A2018] p-5 border border-emerald-500/40 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#00D589]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Savings & Investments</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00D589] border border-emerald-500/30">
            Up to 27% p.a.
          </span>
        </div>

        <div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {isBalanceHidden ? '••••••' : formatNgn(totalWealth)}
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mt-1">
            <span>Daily Interest Payout: ~₦34.20/day</span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-900/60 text-xs">
          <div className="bg-[#081C14]/80 p-2.5 rounded-xl border border-emerald-900/40">
            <div className="text-[10.5px] text-slate-400">SafeBox Locked Vault</div>
            <div className="font-mono font-bold text-white mt-0.5">
              {isBalanceHidden ? '••••••' : formatNgn(userProfile.savingsBalanceNgn)}
            </div>
          </div>
          <div className="bg-[#081C14]/80 p-2.5 rounded-xl border border-emerald-900/40">
            <div className="text-[10.5px] text-slate-400">OWealth Daily Fund</div>
            <div className="font-mono font-bold text-[#00D589] mt-0.5">
              {isBalanceHidden ? '••••••' : formatNgn(userProfile.owealthBalanceNgn)}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation */}
      <div className="flex border-b border-slate-800/80 bg-[#14171E] p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveFinanceView('overview')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeFinanceView === 'overview'
              ? 'bg-[#00D589] text-[#0B3322] font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Plans
        </button>
        <button
          onClick={() => setActiveFinanceView('safebox')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeFinanceView === 'safebox'
              ? 'bg-[#00D589] text-[#0B3322] font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SafeBox ({safeBoxes.length})
        </button>
        <button
          onClick={() => setActiveFinanceView('loans')}
          className={`flex-1 py-2 rounded-xl transition-all ${
            activeFinanceView === 'loans'
              ? 'bg-[#00D589] text-[#0B3322] font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          OKash Loans
        </button>
      </div>

      {/* Active SafeBox Plans */}
      {(activeFinanceView === 'overview' || activeFinanceView === 'safebox') && (
        <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#00D589]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">SafeBox Fixed Plans</h3>
            </div>
            <button
              onClick={onOpenSafeBoxModal}
              className="flex items-center gap-1 text-[11px] font-bold text-[#00D589] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Target</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {safeBoxes.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl bg-[#14171E] p-3.5 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-[#00D589]">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{plan.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Matures: {formatTimestamp(plan.lockedUntil)}
                      </div>
                    </div>
                  </div>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                    {plan.interestRateAnnual}% p.a.
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-400 text-[10.5px]">Principal: </span>
                    <span className="font-mono font-bold text-white">{formatNgn(plan.principalNgn)}</span>
                  </div>
                  <button
                    onClick={() => withdrawFromSafeBox(plan.id)}
                    className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[10.5px] font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
                  >
                    <Unlock className="h-3 w-3 text-emerald-400" />
                    <span>Instant Matured Cashout</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OKash Instant Loans */}
      {(activeFinanceView === 'overview' || activeFinanceView === 'loans') && (
        <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">OKash Instant Credit</h3>
            </div>
            <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
              0 Collateral
            </span>
          </div>

          <div className="rounded-2xl bg-[#14171E] p-4 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Eligible Borrow Limit:</span>
              <span className="font-bold text-white font-mono">{formatNgn(activeLoan.loanLimitNgn)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Borrowed Debt:</span>
              <span className="font-bold text-amber-400 font-mono">
                {formatNgn(activeLoan.currentBorrowedNgn)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onOpenLoanModal}
                className="rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#0B3322] hover:bg-emerald-300 shadow"
              >
                Borrow Money
              </button>
              <button
                onClick={handleRepay}
                disabled={activeLoan.currentBorrowedNgn <= 0 || repaying}
                className="rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40"
              >
                Repay Loan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
