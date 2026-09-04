import React from 'react';
import { MessageSquareText, Landmark, ArrowUpRight } from 'lucide-react';

interface OPayQuickActionsProps {
  onTransferToOpay: () => void;
  onTransferToBank: () => void;
  onWithdraw: () => void;
}

export const OPayQuickActions: React.FC<OPayQuickActionsProps> = ({
  onTransferToOpay,
  onTransferToBank,
  onWithdraw,
}) => {
  return (
    <div 
      id="opay-quick-actions" 
      className="rounded-2xl bg-[#1E1F24] p-3 border border-slate-800/60 shadow-sm"
    >
      <div className="grid grid-cols-3 gap-2">
        {/* To OPay */}
        <button
          id="to-opay-action-btn"
          onClick={onTransferToOpay}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3524] text-[#10C986] group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-[#10C986]" viewBox="0 0 24 24">
              <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7.414L4 21.414V6a2 2 0 0 1 2-2zm8 3a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 6c-2.33 0-4.318 1.4-5 3.328.784.425 1.68.672 2.632.672h4.736c.952 0 1.848-.247 2.632-.672C16.318 14.4 14.33 13 12 13z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-300">To OPay</span>
        </button>

        {/* To Bank */}
        <button
          id="to-bank-action-btn"
          onClick={onTransferToBank}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3524] text-[#10C986] group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-[#10C986]" viewBox="0 0 24 24">
              <path d="M12 2L2 7v3h20V7L12 2zm-8 8v8h3v-8H4zm6 0v8h3v-8h-3zm6 0v8h3v-8h-3zm-14 9v3h20v-3H2z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-300">To Bank</span>
        </button>

        {/* Withdraw */}
        <button
          id="withdraw-action-btn"
          onClick={onWithdraw}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group cursor-pointer"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F3524] text-[#10C986] group-hover:scale-105 transition-transform">
            <svg className="h-5 w-5 fill-[#10C986]" viewBox="0 0 24 24">
              <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm10 5.414L10.414 13H14v2H7V8h2v3.586L13.586 7 15 8.414z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-slate-300">Withdraw</span>
        </button>
      </div>
    </div>
  );
};
