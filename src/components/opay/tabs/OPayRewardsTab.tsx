import React, { useState } from 'react';
import { useDemoWallet } from '../../../context/DemoWalletContext';
import { formatNgn } from '../../../utils/formatters';
import { 
  Sparkles, 
  Gift, 
  Tag, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Ticket, 
  Award,
  ChevronRight,
  Zap
} from 'lucide-react';

export const OPayRewardsTab: React.FC = () => {
  const { userProfile, claimDailyReward, addMoneyToWallet, opayBalance } = useDemoWallet();
  const [claimedDays, setClaimedDays] = useState<number[]>([1, 2]);
  const [activeScratch, setActiveScratch] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);

  const daysReward = [
    { day: 1, bonus: 50 },
    { day: 2, bonus: 100 },
    { day: 3, bonus: 150 },
    { day: 4, bonus: 200 },
    { day: 5, bonus: 300 },
    { day: 6, bonus: 500 },
    { day: 7, bonus: 1000 },
  ];

  const handleClaimDay = async (day: number, bonus: number) => {
    if (claimedDays.includes(day)) return;
    await claimDailyReward(day, bonus);
    setClaimedDays(prev => [...prev, day]);
  };

  const handleRedeemCashback = async () => {
    if (userProfile.cashbackPointsNgn <= 0) return;
    const pts = userProfile.cashbackPointsNgn;
    await addMoneyToWallet({
      method: 'bank_transfer',
      amountNgn: pts,
      sourceDetails: 'Cashback Reward Redemption',
    });
    alert(`Redeemed ${formatNgn(pts)} Cashback directly to your available balance!`);
  };

  return (
    <div className="space-y-4 py-2 animate-in fade-in duration-150">
      {/* Header Cashback Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1B3A2C] via-[#103424] to-[#0A2218] p-5 border border-emerald-500/30 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
              <Gift className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Cashback Points</span>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-[#00D589] border border-emerald-500/30">
            1 Pt = ₦1.00
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold font-mono text-[#00D589]">
              {formatNgn(userProfile.cashbackPointsNgn)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Available for instant wallet conversion</div>
          </div>
          <button
            onClick={handleRedeemCashback}
            className="rounded-xl bg-[#00D589] px-4 py-2 text-xs font-black text-[#0B3322] hover:bg-emerald-300 active:scale-95 transition-all shadow"
          >
            Redeem to Balance
          </button>
        </div>
      </div>

      {/* 7-Day Daily Check-In Streak */}
      <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Login Bonus Streak</h3>
          </div>
          <span className="text-[10.5px] text-slate-400 font-medium">Reset every Monday</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {daysReward.map((item) => {
            const isClaimed = claimedDays.includes(item.day);
            const isNext = !isClaimed && (claimedDays.length === item.day - 1);

            return (
              <button
                key={item.day}
                onClick={() => handleClaimDay(item.day, item.bonus)}
                disabled={isClaimed}
                className={`flex flex-col items-center justify-between rounded-xl p-2 transition-all ${
                  isClaimed
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 opacity-80'
                    : isNext
                    ? 'bg-[#1D3227] border-2 border-[#00D589] text-white shadow-md animate-pulse'
                    : 'bg-[#14171E] border border-slate-800/80 text-slate-400'
                }`}
              >
                <span className="text-[9px] font-bold">D{item.day}</span>
                <span className="font-mono text-[10px] font-black my-1 text-amber-300">+{item.bonus}</span>
                {isClaimed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00D589]" />
                ) : (
                  <span className="text-[8px] font-semibold">{isNext ? 'Claim' : 'Lock'}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Scratch Card Feature */}
      <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mystery Scratch & Win</h3>
          </div>
          <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold text-amber-300">
            Free Daily Card
          </span>
        </div>

        {!scratchRevealed ? (
          <div 
            onClick={() => {
              setActiveScratch(true);
              setScratchRevealed(true);
              claimDailyReward(10, 500);
            }}
            className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 p-6 border-2 border-dashed border-amber-400/50 cursor-pointer hover:border-amber-400 transition-all text-center space-y-2 group"
          >
            <Ticket className="h-8 w-8 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-white">Tap to Scratch & Reveal Bonus!</div>
              <div className="text-[10.5px] text-amber-300/90 mt-0.5">Win up to ₦10,000 instant cash credit</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-950/40 p-5 border border-[#00D589] text-center space-y-2 animate-in zoom-in-95">
            <Award className="h-8 w-8 text-[#00D589]" />
            <div className="text-sm font-extrabold text-white">🎉 You Won +₦500.00!</div>
            <div className="text-xs text-emerald-400">Credited directly to your available balance</div>
          </div>
        )}
      </div>

      {/* Voucher Center */}
      <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Ticket className="h-4 w-4 text-emerald-400" />
          <span>Active Discount Vouchers</span>
        </h3>

        <div className="space-y-2 text-xs">
          {[
            { title: '₦200 Off MTN / Airtel Data', desc: 'Valid for bundles above ₦1,000', code: 'DATA200' },
            { title: '100% Free Transfer Guarantee', desc: 'Unlimited interbank zero-fee transfers', code: 'FREEOPAY' },
            { title: '10% SportyBet Cashback', desc: 'Auto credited on wallet funding', code: 'BETBOOST' },
          ].map((v, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl bg-[#14171E] p-3 border border-slate-800/80">
              <div>
                <div className="font-bold text-white">{v.title}</div>
                <div className="text-[10.5px] text-slate-400">{v.desc}</div>
              </div>
              <button
                onClick={() => alert(`Voucher ${v.code} applied to your account!`)}
                className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-[#00D589] hover:bg-emerald-500/30 transition-colors"
              >
                Apply
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
