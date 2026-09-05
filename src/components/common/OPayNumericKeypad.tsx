import React from 'react';
import { ShieldCheck, Delete } from 'lucide-react';

interface OPayNumericKeypadProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  title?: string;
  className?: string;
  hideHeader?: boolean;
}

export const OPayNumericKeypad: React.FC<OPayNumericKeypadProps> = ({
  onKeyPress,
  onDelete,
  onClear,
  title = 'OPay Secure Numeric Keypad',
  className = '',
  hideHeader = false,
}) => {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore haptic errors
      }
    }
  };

  const handleKeyClick = (key: string) => {
    triggerHaptic();
    onKeyPress(key);
  };

  const handleDeleteClick = () => {
    triggerHaptic();
    onDelete();
  };

  return (
    <div 
      id="opay-secure-numeric-keypad"
      className={`w-full select-none bg-[#16181E] border-t border-slate-800/80 pt-2 pb-3 px-3 transition-all ${className}`}
    >
      {/* Header bar with Shield */}
      {!hideHeader && (
        <div className="flex items-center justify-center gap-1.5 pb-2.5 text-[11.5px] font-medium text-slate-400">
          <ShieldCheck className="h-4 w-4 text-[#00D589]" />
          <span className="tracking-wide text-slate-300">{title}</span>
        </div>
      )}

      {/* 3-Column Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            id={`keypad-btn-${num}`}
            type="button"
            onClick={() => handleKeyClick(num)}
            className="h-12 sm:h-13 rounded-xl bg-[#24262E] hover:bg-[#2C2F3A] active:bg-[#343845] active:scale-[0.98] text-white font-bold text-xl sm:text-2xl transition-all flex items-center justify-center shadow-sm cursor-pointer border border-slate-700/40"
          >
            {num}
          </button>
        ))}

        {/* Row 4: 0 takes 2 columns, backspace takes 1 column */}
        <button
          id="keypad-btn-0"
          type="button"
          onClick={() => handleKeyClick('0')}
          className="col-span-2 h-12 sm:h-13 rounded-xl bg-[#24262E] hover:bg-[#2C2F3A] active:bg-[#343845] active:scale-[0.98] text-white font-bold text-xl sm:text-2xl transition-all flex items-center justify-center shadow-sm cursor-pointer border border-slate-700/40"
        >
          0
        </button>

        <button
          id="keypad-btn-delete"
          type="button"
          onClick={handleDeleteClick}
          aria-label="Delete"
          className="h-12 sm:h-13 rounded-xl bg-[#24262E] hover:bg-[#2C2F3A] active:bg-[#343845] active:scale-[0.98] text-slate-200 transition-all flex items-center justify-center shadow-sm cursor-pointer border border-slate-700/40"
        >
          <Delete className="h-5 w-5 text-slate-200" />
        </button>
      </div>
    </div>
  );
};
