import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { formatNgn } from '../../utils/formatters';
import { 
  Smartphone, 
  Wifi, 
  Trophy, 
  Briefcase, 
  HandCoins, 
  Tv, 
  Megaphone, 
  Zap, 
  Check, 
  AlertCircle, 
  Sparkles,
  Lock,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';

interface OPayServiceModalProps {
  serviceName: string;
  onClose: () => void;
}

const TELCOS = ['MTN', 'Airtel', 'Glo', '9mobile'];
const BETTING_PLATFORMS = ['SportyBet', 'Bet9ja', '1xBet', 'Betway', 'BangBet', 'Merrybet'];
const TV_PROVIDERS = ['DStv', 'GOtv', 'Startimes', 'Showmax'];

export const OPayServiceModal: React.FC<OPayServiceModalProps> = ({ serviceName, onClose }) => {
  const { 
    opayBalance, 
    quickServiceRecharge, 
    lockInSafeBox, 
    requestInstantLoan, 
    activeLoan,
    userProfile 
  } = useDemoWallet();

  const [selectedProvider, setSelectedProvider] = useState(
    serviceName === 'Betting' ? BETTING_PLATFORMS[0] : 
    serviceName === 'TV' ? TV_PROVIDERS[0] : TELCOS[0]
  );
  const [targetId, setTargetId] = useState(userProfile.phone);
  const [selectedAmount, setSelectedAmount] = useState('2000');
  const [customTitle, setCustomTitle] = useState('House Rent 2026');
  const [lockDuration, setLockDuration] = useState(90);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const numAmount = parseFloat(selectedAmount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (numAmount <= 0) {
      setError('Please select or enter a valid amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (serviceName === 'SafeBox') {
        if (numAmount > opayBalance) {
          throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
        }
        await lockInSafeBox(customTitle, numAmount, lockDuration);
        setSuccessMsg(`Locked ${formatNgn(numAmount)} in ${customTitle} at 22% p.a.`);
      } else if (serviceName === 'Loan') {
        await requestInstantLoan(numAmount);
        setSuccessMsg(`Simulated loan of ${formatNgn(numAmount)} disbursed to your wallet.`);
      } else if (serviceName === 'Invitation') {
        alert('Invitation link copied! Share with friends to test referral rewards.');
        onClose();
        return;
      } else {
        const typeKey = serviceName === 'Airtime' ? 'airtime' :
                        serviceName === 'Data' ? 'data' :
                        serviceName === 'Betting' ? 'betting' : 'tv';

        await quickServiceRecharge({
          serviceType: typeKey,
          providerName: selectedProvider,
          targetIdentifier: targetId || userProfile.phone,
          packageDescription: `${selectedProvider} ${serviceName} Payment`,
          amountNgn: numAmount,
        });
        setSuccessMsg(`Successfully purchased ${selectedProvider} ${serviceName}! Earned 2% cashback.`);
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        id="opay-service-modal"
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#15181E] border border-slate-800 shadow-2xl text-slate-100 my-auto"
      >
        {/* Header with Top-Left Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5 bg-[#1B1E24]">
          <div className="flex items-center gap-2.5">
            <button
              id="service-back-btn"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Go Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00D589]">
              {serviceName === 'Airtime' && <Smartphone className="h-4 w-4" />}
              {serviceName === 'Data' && <Wifi className="h-4 w-4" />}
              {serviceName === 'Betting' && <Trophy className="h-4 w-4" />}
              {serviceName === 'TV' && <Tv className="h-4 w-4" />}
              {serviceName === 'SafeBox' && <Briefcase className="h-4 w-4" />}
              {serviceName === 'Loan' && <HandCoins className="h-4 w-4" />}
              {serviceName === 'Invitation' && <Megaphone className="h-4 w-4" />}
              {serviceName === 'More' && <Zap className="h-4 w-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">{serviceName} Service</h2>
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-950/50 p-3 text-xs text-red-300 border border-red-900/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/20 p-3 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Service-Specific Configurations */}
          {(serviceName === 'Airtime' || serviceName === 'Data') && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Select Network Provider</label>
              <div className="grid grid-cols-4 gap-2">
                {TELCOS.map((telco) => (
                  <button
                    key={telco}
                    type="button"
                    onClick={() => setSelectedProvider(telco)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      selectedProvider === telco
                        ? 'bg-[#00D589] text-[#0B3322] shadow'
                        : 'bg-[#1B1E24] text-slate-300 border border-slate-800'
                    }`}
                  >
                    {telco}
                  </button>
                ))}
              </div>
            </div>
          )}

          {serviceName === 'Betting' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Select Betting Platform</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-xl bg-[#1B1E24] p-3 text-base text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-semibold"
              >
                {BETTING_PLATFORMS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {serviceName === 'TV' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Select Cable Provider</label>
              <div className="grid grid-cols-4 gap-2">
                {TV_PROVIDERS.map((tv) => (
                  <button
                    key={tv}
                    type="button"
                    onClick={() => setSelectedProvider(tv)}
                    className={`rounded-xl py-2 text-xs font-bold transition-all ${
                      selectedProvider === tv
                        ? 'bg-[#00D589] text-[#0B3322] shadow'
                        : 'bg-[#1B1E24] text-slate-300 border border-slate-800'
                    }`}
                  >
                    {tv}
                  </button>
                ))}
              </div>
            </div>
          )}

          {serviceName === 'SafeBox' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Savings Target Name</label>
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. New Car, House Rent, Vacation"
                  className="w-full rounded-xl bg-[#1B1E24] p-3 text-base text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-semibold placeholder-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Lock Duration (Days)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 90, 180].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLockDuration(days)}
                      className={`rounded-xl py-2 text-xs font-bold transition-all ${
                        lockDuration === days
                          ? 'bg-[#00D589] text-[#0B3322] shadow'
                          : 'bg-[#1B1E24] text-slate-300 border border-slate-800'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {serviceName === 'Loan' && (
            <div className="rounded-2xl bg-[#1A1E27] p-4 border border-emerald-500/30 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Your Eligible OKash Credit Limit:</span>
                <span className="font-bold text-emerald-400 font-mono">{formatNgn(activeLoan.loanLimitNgn)}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Borrow instant funds with 0 collateral. Repayment due in 30 days.
              </div>
            </div>
          )}

          {/* Identifier Input */}
          {serviceName !== 'SafeBox' && serviceName !== 'Loan' && serviceName !== 'Invitation' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">
                {serviceName === 'Betting' ? 'User ID / Account' : 
                 serviceName === 'TV' ? 'SmartCard / IUC Number' : 'Phone Number'}
              </label>
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-xl bg-[#1B1E24] p-3 text-base text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
              />
            </div>
          )}

          {/* Amount Selection */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-400">Amount (₦)</label>
              {serviceName !== 'Loan' && (
                <span className="text-slate-400 font-mono">Bal: {formatNgn(opayBalance)}</span>
              )}
            </div>
            <input
              type="number"
              autoComplete="off"
              spellCheck={false}
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              className="w-full rounded-xl bg-[#1B1E24] py-3 px-3.5 text-base font-bold text-white border border-slate-800 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
            />
            <div className="grid grid-cols-4 gap-2">
              {['1000', '2000', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className="rounded-lg bg-slate-800/80 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  ₦{parseInt(amt).toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#00D589] py-3.5 text-sm font-extrabold text-[#0B3322] hover:bg-emerald-300 active:scale-[0.99] transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/30"
          >
            {isSubmitting ? (
              <span>Processing Transaction...</span>
            ) : (
              <>
                <span>{serviceName === 'Loan' ? 'Disburse' : serviceName === 'SafeBox' ? 'Lock Funds' : 'Pay'} {formatNgn(numAmount)}</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
