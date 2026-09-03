import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { formatNgn } from '../../utils/formatters';
import { ArrowUpRight, ShieldCheck, Clock, CheckCircle2, Copy, Check, AlertCircle, ChevronLeft } from 'lucide-react';
import { OPayReceiptModal } from './OPayReceiptModal';
import { Transaction } from '../../types';

interface OPayWithdrawModalProps {
  onClose: () => void;
}

export const OPayWithdrawModal: React.FC<OPayWithdrawModalProps> = ({ onClose }) => {
  const { opayBalance, performAtmWithdrawal } = useDemoWallet();
  const [method, setMethod] = useState<'atm' | 'pos'>('atm');
  const [amount, setAmount] = useState('5000');
  const [cashoutCode, setCashoutCode] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError('Please enter a valid cashout amount.');
      return;
    }

    if (numAmount > opayBalance) {
      setError(`Insufficient balance. Current available balance is ${formatNgn(opayBalance)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await performAtmWithdrawal(numAmount);
      setCashoutCode(res.code);
      setCompletedTx(res.tx);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Withdrawal simulation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!cashoutCode) return;
    navigator.clipboard.writeText(cashoutCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        id="opay-withdraw-modal"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#15181E] border border-slate-800 shadow-2xl text-slate-100 my-auto"
      >
        {/* Header with Top-Left Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5 bg-[#1B1E24]">
          <div className="flex items-center gap-2.5">
            <button
              id="withdraw-back-btn"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Go Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00D589]">
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">Withdraw (Cashout)</h2>
              <p className="text-[10px] text-emerald-400 font-mono">
                Available: {formatNgn(opayBalance)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        {!cashoutCode ? (
          <form onSubmit={handleGenerateCode} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto overscroll-contain">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-950/50 p-3 text-xs text-red-300 border border-red-900/50">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Channels: ATM Cardless or POS Merchant */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('atm')}
                className={`flex-1 rounded-2xl p-3 text-left border transition-all ${
                  method === 'atm'
                    ? 'bg-[#182C22] border-[#00D589] text-white'
                    : 'bg-[#1B1E24] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-[#00D589]">Cardless ATM</div>
                <div className="text-[10.5px] text-slate-300 mt-0.5">Quickteller / Interswitch ATM</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('pos')}
                className={`flex-1 rounded-2xl p-3 text-left border transition-all ${
                  method === 'pos'
                    ? 'bg-[#182C22] border-[#00D589] text-white'
                    : 'bg-[#1B1E24] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-[#00D589]">POS Merchant Agent</div>
                <div className="text-[10.5px] text-slate-300 mt-0.5">Nearby OPay Authorized Agent</div>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Withdrawal Amount (₦)</label>
              <input
                type="number"
                autoComplete="off"
                spellCheck={false}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-[#1B1E24] py-3 px-3.5 text-base font-bold text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
              />
              <div className="grid grid-cols-4 gap-2 pt-1">
                {['2000', '5000', '10000', '20000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="rounded-lg bg-slate-800/80 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    ₦{parseInt(amt).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#131E18] p-3 text-[11px] text-emerald-300 border border-emerald-900/50 flex items-center justify-between">
              <span>Simulated Cashout Fee</span>
              <span className="font-bold text-[#00D589]">₦0.00 (Free)</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00D589] py-3.5 text-sm font-extrabold text-[#0B3322] hover:bg-emerald-300 active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/30"
            >
              {isSubmitting ? 'Generating Code...' : `Generate Cashout Code (${formatNgn(numAmount)})`}
            </button>
          </form>
        ) : (
          <div className="p-6 space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-[#00D589] border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Cashout Code Generated!</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter this 6-digit one-time code at any {method === 'atm' ? 'Quickteller ATM' : 'OPay POS Agent'}
              </p>
            </div>

            {/* Code Box */}
            <div className="rounded-2xl bg-[#12151B] p-5 border border-emerald-500/40 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">One-Time Cashout PIN</span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-3xl font-extrabold tracking-widest text-[#00D589]">
                  {cashoutCode}
                </span>
                <button
                  onClick={copyCode}
                  className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:text-white"
                  title="Copy code"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-mono pt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Expires in 15:00 minutes</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  if (completedTx) {
                    // Show receipt
                    setCashoutCode(null);
                  }
                }}
                className="rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                View E-Receipt
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-[#00D589] py-3 text-xs font-bold text-[#0B3322] hover:bg-emerald-300"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {completedTx && !cashoutCode && (
        <OPayReceiptModal
          transaction={completedTx}
          onClose={onClose}
        />
      )}
    </div>
  );
};
