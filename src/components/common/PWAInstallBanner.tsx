import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running as installed native PWA or dismissed, do not render
  if (isInstalled || dismissed) {
    return null;
  }

  // Only show if browser supports install or if it's iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <aside aria-label="Install application" className="w-full max-w-md mx-auto px-4 pt-2 pb-1 z-30">
        <div className="flex items-center justify-between gap-3 bg-[#131720]/95 backdrop-blur-md border border-[#00B875]/30 rounded-2xl p-2.5 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2.5">
            <img 
              src="/icons/apple-touch-icon.png" 
              alt="OPay" 
              className="w-9 h-9 rounded-xl shadow-md border border-white/10 shrink-0" 
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-wide">Install OPay App</span>
              <span className="text-[10px] text-slate-400">Add to home screen for native experience</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 bg-[#00B875] hover:bg-[#00D589] active:scale-95 text-[#072418] px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guided Install Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[#161B26] border border-slate-700/60 p-6 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img 
                  src="/icons/apple-touch-icon.png" 
                  alt="OPay" 
                  className="w-11 h-11 rounded-2xl shadow border border-white/15" 
                />
                <div>
                  <h3 className="text-base font-bold text-white">Install OPay on iPhone</h3>
                  <p className="text-xs text-slate-400">Add to your iOS Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 bg-[#1B2232] p-3 rounded-2xl border border-slate-700/50">
                <div className="w-7 h-7 rounded-xl bg-[#00B875]/20 text-[#00B875] flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    Tap the Share button <Share className="w-3.5 h-3.5 text-[#00B875]" />
                  </p>
                  <p className="text-slate-400">Located in the bottom Safari toolbar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1B2232] p-3 rounded-2xl border border-slate-700/50">
                <div className="w-7 h-7 rounded-xl bg-[#00B875]/20 text-[#00B875] flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    Select &quot;Add to Home Screen&quot; <PlusSquare className="w-3.5 h-3.5 text-[#00B875]" />
                  </p>
                  <p className="text-slate-400">Scroll down in the share sheet to find it.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1B2232] p-3 rounded-2xl border border-slate-700/50">
                <div className="w-7 h-7 rounded-xl bg-[#00B875]/20 text-[#00B875] flex items-center justify-center shrink-0 font-bold">
                  3
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Tap &quot;Add&quot; in the top right</p>
                  <p className="text-slate-400">OPay will now appear on your home screen with the official app icon!</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full rounded-2xl bg-[#00B875] py-3 text-xs font-black text-[#072418] hover:bg-[#00D589] uppercase tracking-wider transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
