import React from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { RefreshCw, Tag, TrendingUp, CreditCard, User } from 'lucide-react';

export type OPayTab = 'home' | 'rewards' | 'finance' | 'cards' | 'me';

interface OPayBottomNavProps {
  activeTab: OPayTab;
  onChangeTab: (tab: OPayTab) => void;
}

export const OPayBottomNav: React.FC<OPayBottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const { unreadNotificationCount } = useDemoWallet();

  const tabs: { id: OPayTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: RefreshCw,
    },
    {
      id: 'rewards',
      label: 'Rewards',
      icon: Tag,
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: TrendingUp,
    },
    {
      id: 'cards',
      label: 'Cards',
      icon: CreditCard,
    },
    {
      id: 'me',
      label: 'Me',
      icon: User,
    },
  ];

  return (
    <nav 
      id="opay-bottom-nav" 
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 flex items-center justify-around border-t border-slate-800/80 bg-[#16181E]/95 backdrop-blur-md px-2 pt-1.5 shadow-2xl safe-bottom-padding"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 10px) + 6px)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`opay-nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 transition-all cursor-pointer"
            style={{ color: isActive ? '#10C986' : '#7E848D' }}
          >
            <div 
              className={`relative flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                isActive ? 'bg-[#22242B]' : ''
              }`}
            >
              <Icon 
                className={`h-5 w-5 ${
                  isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'
                }`} 
              />
              
              {/* Notification dot for 'Me' tab */}
              {tab.id === 'me' && unreadNotificationCount > 0 && (
                <span className="absolute top-0.5 right-1 h-2 w-2 rounded-full bg-[#FF3B69] ring-2 ring-[#16181E]" />
              )}
            </div>
            <span 
              className="text-[10px] tracking-tight"
              style={{
                color: isActive ? '#10C986' : '#7E848D',
                fontWeight: isActive ? '700' : '500'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

