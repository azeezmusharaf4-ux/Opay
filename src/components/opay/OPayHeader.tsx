import React from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { Headphones, QrCode, Bell, User } from 'lucide-react';

interface OPayHeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenQr: () => void;
  onOpenHelp: () => void;
  onOpenLogin?: () => void;
}

export const OPayHeader: React.FC<OPayHeaderProps> = ({
  onOpenNotifications,
  onOpenProfile,
  onOpenQr,
  onOpenHelp,
  onOpenLogin,
}) => {
  const { userProfile, unreadNotificationCount, isAuthenticated } = useDemoWallet();

  return (
    <header 
      id="opay-header" 
      className="flex items-center justify-between pb-2 text-white safe-top-padding"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 20px) + 6px)' }}
    >
      {/* User Greeting & Avatar with Tier badge OR Logged-out state with Hi and Login button */}
      {!isAuthenticated ? (
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-bold tracking-tight text-white">
            Hi
          </span>
          <button
            id="opay-header-login-btn"
            onClick={onOpenLogin || onOpenProfile}
            className="rounded-full border border-[#10C986] px-4 py-1 text-xs sm:text-sm font-semibold text-[#10C986] bg-[#10C986]/10 hover:bg-[#10C986]/20 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Login
          </button>
        </div>
      ) : (
        <div 
          id="user-profile-trigger"
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative">
            <div className="h-9 w-9 overflow-hidden rounded-full border border-emerald-400/40 bg-slate-800 shadow-sm">
              {userProfile.avatarUrl ? (
                <img 
                  src={userProfile.avatarUrl} 
                  alt={userProfile.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-emerald-700 text-white font-bold">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
            {/* Tier badge: exact circular gold badge from screenshot */}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-[8px] font-black text-amber-950 shadow border border-slate-900">
              <span>3</span>
            </div>
          </div>

          <div className="flex items-center">
            <span className="text-[14px] font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Hi,{userProfile.name}
            </span>
          </div>
        </div>
      )}

      {/* Action Icons: Help, QR Scanner, Bell */}
      <div className="flex items-center gap-1.5">
        {/* Help with HELP badge */}
        <button
          id="opay-help-btn"
          onClick={onOpenHelp}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Customer Support"
          aria-label="Customer Support"
        >
          <Headphones className="h-4.5 w-4.5 stroke-[2]" />
          <span className="absolute -top-1 -right-1 rounded-full bg-[#FF3B69] px-1 py-0.2 text-[7px] font-extrabold tracking-wider text-white uppercase shadow-sm">
            HELP
          </span>
        </button>

        {/* QR Scanner */}
        <button
          id="opay-qr-btn"
          onClick={onOpenQr}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Scan QR Code"
          aria-label="Scan QR Code"
        >
          <QrCode className="h-4.5 w-4.5 stroke-[2]" />
        </button>

        {/* Notification Bell with Badge */}
        <button
          id="opay-notifications-btn"
          onClick={onOpenNotifications}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4.5 w-4.5 stroke-[2]" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-3.5 h-3.5 items-center justify-center rounded-full bg-[#FF3B69] px-0.5 text-[9px] font-black text-white shadow-md">
              {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
