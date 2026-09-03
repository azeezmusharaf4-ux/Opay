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
      className="rounded-2xl bg-[#1B1E24] p-3 border border-slate-800/80 shadow-sm"
    >
      <div className="grid grid-cols-3 gap-2">
        {/* To OPay */}
        <button
          id="to-opay-action-btn"
          onClick={onTransferToOpay}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#122A20] text-[#00D589] group-hover:scale-105 transition-transform">
            <MessageSquareText className="h-5 w-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-slate-200">To OPay</span>
        </button>

        {/* To Bank */}
        <button
          id="to-bank-action-btn"
          onClick={onTransferToBank}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#122A20] text-[#00D589] group-hover:scale-105 transition-transform">
            <Landmark className="h-5 w-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-slate-200">To Bank</span>
        </button>

        {/* Withdraw */}
        <button
          id="withdraw-action-btn"
          onClick={onWithdraw}
          className="flex flex-col items-center justify-center gap-1.5 py-1 text-center hover:opacity-90 active:scale-95 transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#122A20] text-[#00D589] group-hover:scale-105 transition-transform">
            <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-medium text-slate-200">Withdraw</span>
        </button>
      </div>
    </div>
  );
};
