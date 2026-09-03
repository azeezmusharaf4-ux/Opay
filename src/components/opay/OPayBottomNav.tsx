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
      className="sticky bottom-0 z-30 flex items-center justify-around border-t border-slate-800/70 bg-[#16181E] px-2 py-1 rounded-t-2xl shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`opay-nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-2 py-0.5 transition-all ${
              isActive ? 'text-[#00D589]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative flex h-6 w-10 items-center justify-center rounded-full transition-colors ${
              isActive ? 'bg-[#292E39]' : ''
            }`}>
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'stroke-[2.5] text-[#00D589]' : 'stroke-[1.8] text-slate-400'}`} />
              
              {/* Notification dot for 'Me' tab */}
              {tab.id === 'me' && unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#FF3B69] ring-2 ring-[#16181E]" />
              )}
            </div>
            <span className={`text-[10px] tracking-tight ${isActive ? 'font-bold text-[#00D589]' : 'font-medium text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

