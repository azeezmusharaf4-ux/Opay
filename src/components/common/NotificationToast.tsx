import React from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { Bell, ArrowDownLeft, X, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface NotificationToastProps {
  onViewNotification: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onViewNotification }) => {
  const { activeToast, dismissToast } = useDemoWallet();

  if (!activeToast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top-4 duration-300">
      <div 
        id="in-app-notification-toast"
        className="flex items-start gap-3 rounded-2xl bg-[#171B24] p-4 border-2 border-emerald-500 shadow-[0_10px_30px_rgba(0,0,0,0.6)] text-white backdrop-blur-lg"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-[#00D589] border border-emerald-500/30">
          <ArrowDownLeft className="h-5 w-5 stroke-[2.5]" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#00D589] flex items-center gap-1">
              <span>{activeToast.title}</span>
            </h4>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-white p-0.5 rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11.5px] leading-snug text-slate-200">
            {activeToast.message}
          </p>
          <button
            onClick={() => {
              dismissToast();
              onViewNotification();
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline pt-0.5"
          >
            <span>Open Notification Center</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
