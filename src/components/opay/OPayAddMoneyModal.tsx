import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { formatNgn } from '../../utils/formatters';
import { 
  Plus, 
  CreditCard, 
  Landmark, 
  Check, 
  Copy, 
  ShieldCheck, 
  ChevronLeft, 
  Zap, 
  ArrowDownLeft,
  Sparkles
} from 'lucide-react';

interface OPayAddMoneyModalProps {
  onClose: () => void;
}

export const OPayAddMoneyModal: React.FC<OPayAddMoneyModalProps> = ({ onClose }) => {
  const { addMoneyToWallet, userProfile, opayBalance } = useDemoWallet();
  const [activeTab, setActiveTab] = useState<'bank' | 'presets' | 'card'>('bank');
  const [customAmount, setCustomAmount] = useState('10000');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddFunds = async (amount: number, method: 'bank_transfer' | 'debit_card' | 'ussd' = 'bank_transfer') => {
    if (amount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await addMoneyToWallet({
        method,
        amountNgn: amount,
        sourceDetails: method === 'debit_card' ? 'Linked Mastercard •••• 4122' : 'Bank Inflow Deposit',
      });
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(userProfile.accountNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        id="opay-add-money-modal"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#15181E] border border-slate-800 shadow-2xl text-slate-100 my-auto"
      >
        {/* Header with Top-Left Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5 bg-[#1B1E24]">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              aria-label="Go Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00D589]">
              <Plus className="h-4 w-4 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">Add Money</h2>
              <p className="text-[10px] text-emerald-400 font-mono">
                Available: {formatNgn(opayBalance)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="flex border-b border-slate-800/60 bg-[#121418] p-1.5 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => { setActiveTab('bank'); setErrorMessage(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'bank' 
                ? 'bg-[#00D589] text-[#0B3322] font-bold shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bank Transfer
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('presets'); setErrorMessage(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'presets' 
                ? 'bg-[#00D589] text-[#0B3322] font-bold shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Instant Top-Up
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('card'); setErrorMessage(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-center whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'card' 
                ? 'bg-[#00D589] text-[#0B3322] font-bold shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Debit Card
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto overscroll-contain">
          {added && (
            <div className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-emerald-500/20 p-3 text-xs font-bold text-emerald-400 border border-emerald-500/30 text-center animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Deposit Confirmed & Credited!</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-rose-500/20 p-2.5 text-xs text-rose-300 border border-rose-500/30">
              {errorMessage}
            </div>
          )}

          {/* Dedicated Virtual Bank Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#1A1E27] p-4 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-[#00D589]" />
                    <span>Your OPay Account Details</span>
                  </span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                    Tier 3 Verified
                  </span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center bg-[#14171E] p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">OPay Account Number</div>
                      <div className="font-mono text-lg font-extrabold text-[#00D589] tracking-wider">{userProfile.accountNumber}</div>
                    </div>
                    <button
                      onClick={copyAccount}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="flex justify-between text-slate-300 px-1 text-xs">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold text-white uppercase">{userProfile.fullName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 px-1 text-xs">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="font-bold text-emerald-400">OPay / PayCom</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#11161F] p-3 border border-slate-800/60 text-[11px] text-slate-300 space-y-1">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00D589]" />
                  <span>How to fund your wallet:</span>
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Open your bank mobile app or dial your bank USSD, select transfer to <span className="text-emerald-300 font-medium">OPay (Paycom)</span>, and enter your 10-digit account number above.
                </p>
              </div>

              <button
                onClick={() => handleAddFunds(50000, 'bank_transfer')}
                disabled={loading}
                className="w-full rounded-2xl bg-[#00D589] py-3.5 text-xs font-extrabold text-[#0B3322] hover:bg-emerald-300 active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                <span>Confirm Bank Deposit (+₦50,000)</span>
              </button>
            </div>
          )}

          {/* Quick Top-Up Presets Tab */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Quick Top-Up Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000, 20000, 50000, 100000, 250000, 500000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => handleAddFunds(amt, 'bank_transfer')}
                      disabled={loading}
                      className="flex flex-col items-center justify-center rounded-2xl bg-[#1B1E24] p-3 border border-slate-800 hover:border-emerald-500/50 hover:bg-[#222732] active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-xs font-black font-mono text-[#00D589]">+{formatNgn(amt)}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Instant credit</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Form */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="text-xs font-medium text-slate-400">Custom Deposit Amount</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400">₦</span>
                    <input
                      type="number"
                      autoComplete="off"
                      spellCheck={false}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="w-full rounded-xl bg-[#1B1E24] py-3 pl-8 pr-3 text-base font-bold text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const val = parseFloat(customAmount);
                      if (val > 0) handleAddFunds(val, 'bank_transfer');
                    }}
                    disabled={loading}
                    className="rounded-xl bg-[#00D589] px-5 py-3 text-xs font-extrabold text-[#0B3322] hover:bg-emerald-300 transition-colors shadow cursor-pointer"
                  >
                    Top Up
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Card Tab */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#1A1E27] p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-[#00D589]" />
                    <span>Linked Mastercard •••• 4122</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">Exp 09/27</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Top-up Amount</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleAddFunds(amt, 'debit_card')}
                        disabled={loading}
                        className="rounded-xl bg-[#14171E] p-2 text-xs font-bold text-[#00D589] border border-slate-800 hover:border-emerald-500/50 cursor-pointer"
                      >
                        +{formatNgn(amt)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
