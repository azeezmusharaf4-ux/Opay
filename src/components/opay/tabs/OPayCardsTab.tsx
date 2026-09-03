import React, { useState } from 'react';
import { useDemoWallet } from '../../../context/DemoWalletContext';
import { formatNgn } from '../../../utils/formatters';
import { 
  CreditCard, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Globe, 
  Sliders, 
  Plus,
  Zap
} from 'lucide-react';

export const OPayCardsTab: React.FC = () => {
  const { 
    cards, 
    toggleCardFreeze, 
    toggleCardOnline, 
    updateCardLimit, 
    userProfile 
  } = useDemoWallet();

  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || 'card-verve-1');
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentCard = cards.find(c => c.id === selectedCardId) || cards[0];

  const copyCardNumber = () => {
    if (!currentCard) return;
    navigator.clipboard.writeText(currentCard.cardNumber.replace(/\s+/g, '')).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentCard) return null;

  return (
    <div className="space-y-4 py-2 animate-in fade-in duration-150">
      {/* Card Selector Pills */}
      <div className="flex gap-2">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCardId(c.id)}
            className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
              selectedCardId === c.id
                ? 'bg-[#182C22] border-[#00D589] text-white shadow'
                : 'bg-[#1B1E24] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c.cardType}
          </button>
        ))}
      </div>

      {/* 3D-Style Debit Card Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#061C14] via-[#0F3526] to-[#04140D] p-6 border-2 border-emerald-500/40 text-white shadow-2xl space-y-6">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-[#00D589]/20 blur-2xl" />
        
        {/* Top Card Row */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-widest text-[#00D589]">OPAY</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
              {currentCard.cardType}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {currentCard.isFrozen ? (
              <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Frozen
              </span>
            ) : (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Active
              </span>
            )}
          </div>
        </div>

        {/* EMV Chip & Contactless */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-8 w-10 rounded-md bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 border border-amber-500/50 shadow-inner" />
          <Zap className="h-4 w-4 text-emerald-300 opacity-80" />
        </div>

        {/* Card Number */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="font-mono text-xl font-bold tracking-widest text-slate-100">
            {currentCard.cardNumber}
          </div>
          <button
            onClick={copyCardNumber}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Copy card number"
          >
            {copied ? <Check className="h-4 w-4 text-[#00D589]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {/* Cardholder & Expiry & CVV */}
        <div className="relative z-10 flex items-end justify-between text-xs pt-1">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Card Holder</div>
            <div className="font-bold tracking-wider uppercase text-slate-200">{currentCard.cardHolder}</div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Expires</div>
              <div className="font-mono font-bold text-slate-200">{currentCard.expiryDate}</div>
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">CVV</div>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-200">
                <span>{showCvv ? currentCard.cvv : '•••'}</span>
                <button
                  onClick={() => setShowCvv(!showCvv)}
                  className="p-0.5 text-slate-400 hover:text-white"
                >
                  {showCvv ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Security Controls */}
      <div className="rounded-2xl bg-[#1B1E24] p-4 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Card Controls & Security</h3>

        <div className="space-y-3 text-xs">
          {/* Freeze / Unfreeze Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#14171E] border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-white">Freeze Debit Card</div>
                <div className="text-[10.5px] text-slate-400">Temporarily block all incoming charges</div>
              </div>
            </div>
            <button
              onClick={() => toggleCardFreeze(currentCard.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentCard.isFrozen ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentCard.isFrozen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Online Payments Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#14171E] border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-[#00D589]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-white">Online Web Payments</div>
                <div className="text-[10.5px] text-slate-400">Enable e-commerce & international web transactions</div>
              </div>
            </div>
            <button
              onClick={() => toggleCardOnline(currentCard.id)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentCard.isOnlineEnabled ? 'bg-[#00D589]' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentCard.isOnlineEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Daily Spend Limit */}
          <div className="p-3 rounded-xl bg-[#14171E] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-[#00D589]" />
                <span>Daily Spend Limit</span>
              </span>
              <span className="font-mono font-bold text-[#00D589]">
                {formatNgn(currentCard.dailySpendLimit)}
              </span>
            </div>
            <input
              type="range"
              min="50000"
              max="1000000"
              step="50000"
              value={currentCard.dailySpendLimit}
              onChange={(e) => updateCardLimit(currentCard.id, parseInt(e.target.value))}
              className="w-full accent-[#00D589]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
