import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { OPayHeader } from './OPayHeader';
import { OPayBalanceCard } from './OPayBalanceCard';
import { OPayRecentTransactionsPreview } from './OPayRecentTransactionsPreview';
import { OPayQuickActions } from './OPayQuickActions';
import { OPayServicesGrid } from './OPayServicesGrid';
import { OPayPromos } from './OPayPromos';
import { OPayBottomNav, OPayTab } from './OPayBottomNav';
import { OPayRewardsTab } from './tabs/OPayRewardsTab';
import { OPayFinanceTab } from './tabs/OPayFinanceTab';
import { OPayCardsTab } from './tabs/OPayCardsTab';
import { OPayMeTab } from './tabs/OPayMeTab';
import { OPayHistoryModal } from './OPayHistoryModal';
import { OPayNotificationsModal } from './OPayNotificationsModal';
import { OPayTransferModal } from './OPayTransferModal';
import { OPayAddMoneyModal } from './OPayAddMoneyModal';
import { OPayServiceModal } from './OPayServiceModal';
import { OPayWithdrawModal } from './OPayWithdrawModal';
import { OPayProfileModal } from './OPayProfileModal';
import { OPayReceiptModal } from './OPayReceiptModal';
import { OPayAuthScreen } from './auth/OPayAuthScreen';
import { Transaction } from '../../types';
import { Sparkles, ChevronLeft } from 'lucide-react';

export const OPayApp: React.FC = () => {
  const { 
    userProfile, 
    opayBalance, 
    isAuthenticated, 
    loginUser, 
    registerUser, 
    registeredAccounts 
  } = useDemoWallet();
  
  const [activeTab, setActiveTab] = useState<OPayTab>('home');

  // Modals state
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferType, setTransferType] = useState<'op_transfer' | 'bank_transfer'>('op_transfer');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'welcome_back'>('login');

  const requireAuth = (action: () => void, mode: 'login' | 'register' | 'welcome_back' = 'login') => {
    if (!isAuthenticated) {
      setAuthModalMode(mode);
      setShowAuthModal(true);
    } else {
      action();
    }
  };

  const handleOpenTransfer = (type: 'op_transfer' | 'bank_transfer') => {
    requireAuth(() => {
      setTransferType(type);
      setShowTransfer(true);
    });
  };

  return (
    <div 
      id="opay-web-app"
      className="relative flex flex-col w-full max-w-md mx-auto min-h-screen bg-[#121212] text-slate-100 font-sans shadow-2xl border-x border-[#1E1F24]"
    >
      {/* Main Content Area */}
      <main className={`flex-1 ${activeTab === 'me' ? 'px-3 sm:px-4 py-0 pb-24' : 'px-3 sm:px-3.5 py-1.5 space-y-2 pb-24'} w-full`}>
        {/* Top Header (Shown on Home and secondary tabs; Me tab has its own dedicated header matching IMG_2428.png) */}
        {activeTab !== 'me' && (
          <OPayHeader
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenProfile={() => requireAuth(() => setShowProfile(true))}
            onOpenLogin={() => {
              setAuthModalMode('login');
              setShowAuthModal(true);
            }}
            onOpenQr={() => setShowQrModal(true)}
            onOpenHelp={() => setShowHelpModal(true)}
          />
        )}

        {/* Tab-dependent Views */}
        {activeTab === 'home' && (
          <div className="space-y-2 animate-in fade-in duration-150">
            {/* Announcement Banner matching IMG_2745.png */}
            <div 
              id="opay-announcement-bar"
              onClick={() => setShowNotifications(true)}
              className="flex items-center justify-between rounded-xl bg-[#241A12] px-2.5 py-1.5 text-xs text-[#E5943B] border border-[#3E2C1E]/60 cursor-pointer hover:bg-[#2F2116] transition-colors"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <div className="flex items-center gap-1 shrink-0 font-bold">
                  <svg className="h-3.5 w-3.5 fill-[#E5943B]" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                  <span className="text-[10.5px]">More &gt;&gt;</span>
                </div>
                <span className="truncate text-[10.5px] font-medium text-[#E5943B]">
                  OPay Official Statement: OPay is fully licensed by CBN and insured by NDIC
                </span>
              </div>
              <span className="text-xs text-[#E5943B] shrink-0 font-bold ml-1">&gt;</span>
            </div>

            {/* 1. Teal Balance Card & Business Sales */}
            <OPayBalanceCard
              onOpenHistory={() => requireAuth(() => setShowHistory(true))}
              onOpenAddMoney={() => requireAuth(() => setShowAddMoney(true))}
            />

            {/* 2. Recent Transactions (Visible right on the Home view matching reference) */}
            <OPayRecentTransactionsPreview
              onOpenHistory={() => requireAuth(() => setShowHistory(true))}
              onSelectTransaction={(tx) => requireAuth(() => setSelectedTx(tx))}
            />

            {/* 3. Quick Action Buttons (To OPay, To Bank, Withdraw) */}
            <OPayQuickActions
              onTransferToOpay={() => handleOpenTransfer('op_transfer')}
              onTransferToBank={() => handleOpenTransfer('bank_transfer')}
              onWithdraw={() => requireAuth(() => setShowWithdraw(true))}
            />

            {/* 4. 8 Services Grid */}
            <OPayServicesGrid
              onSelectService={(name) => requireAuth(() => setActiveService(name))}
            />

            {/* 5. Promotional Banners */}
            <OPayPromos
              onSavingsClick={() => requireAuth(() => setActiveService('Safebox'))}
              onInviteClick={() => requireAuth(() => setActiveService('Refer & Earn'))}
              onSignUpClick={() => {
                setAuthModalMode('register');
                setShowAuthModal(true);
              }}
            />
          </div>
        )}

        {activeTab === 'rewards' && (
          <OPayRewardsTab />
        )}

        {activeTab === 'finance' && (
          <OPayFinanceTab 
            onOpenSafeBoxModal={() => setActiveService('SafeBox')}
            onOpenLoanModal={() => setActiveService('Loan')}
          />
        )}

        {activeTab === 'cards' && (
          <OPayCardsTab />
        )}

        {activeTab === 'me' && (
          <OPayMeTab
            onOpenProfileModal={() => setShowProfile(true)}
            onOpenHistoryModal={() => setShowHistory(true)}
          />
        )}
      </main>

      {/* Pinned Working Bottom Navigation Bar */}
      <OPayBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />

      {/* Modals & Dialogs */}
      {showHistory && (
        <OPayHistoryModal onClose={() => setShowHistory(false)} />
      )}

      {showNotifications && (
        <OPayNotificationsModal onClose={() => setShowNotifications(false)} />
      )}

      {showTransfer && (
        <OPayTransferModal
          initialType={transferType}
          onClose={() => setShowTransfer(false)}
          onOpenHistory={() => setShowHistory(true)}
        />
      )}

      {showAddMoney && (
        <OPayAddMoneyModal onClose={() => setShowAddMoney(false)} />
      )}

      {showWithdraw && (
        <OPayWithdrawModal onClose={() => setShowWithdraw(false)} />
      )}

      {activeService && (
        <OPayServiceModal
          serviceName={activeService}
          onClose={() => setActiveService(null)}
        />
      )}

      {showProfile && (
        <OPayProfileModal onClose={() => setShowProfile(false)} />
      )}

      {/* Auth Screen Modal (Login / Register) */}
      {showAuthModal && (
        <OPayAuthScreen
          initialMode={authModalMode}
          onLogin={async (creds) => {
            const res = await loginUser(creds);
            if (res.success) {
              setShowAuthModal(false);
            }
            return res;
          }}
          onRegister={async (data) => {
            const res = await registerUser(data);
            if (res.success) {
              setShowAuthModal(false);
            }
            return res;
          }}
          existingAccountsCount={registeredAccounts.length}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {selectedTx && (
        <OPayReceiptModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onTransferAgain={(tx) => {
            setSelectedTx(null);
            setTransferType(tx.type === 'bank_transfer' ? 'bank_transfer' : 'op_transfer');
            setShowTransfer(true);
          }}
          onViewRecords={() => {
            setSelectedTx(null);
            setShowHistory(true);
          }}
        />
      )}

      {/* QR Code Scanner Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-6 text-center text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <button
                id="qr-back-btn"
                onClick={() => setShowQrModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              </button>
              <h3 className="text-base font-bold">QR Code Scanner</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="relative mx-auto h-48 w-48 rounded-2xl bg-[#0D1016] border-2 border-dashed border-[#00D589] flex items-center justify-center overflow-hidden">
              <div className="h-40 w-40 bg-[radial-gradient(#00D589_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[#00D589] shadow-[0_0_8px_#00D589] animate-bounce" />
            </div>
            <p className="text-xs text-slate-400">
              Align recipient QR code or Merchant Pay code within frame to scan.
            </p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#0B3322]"
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-6 text-left text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <button
                  id="help-back-btn"
                  onClick={() => setShowHelpModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 transition-colors"
                  aria-label="Back"
                >
                  <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
                </button>
                <h3 className="text-base font-bold">OPay Support</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-[#13161C] rounded-xl border border-slate-800">
                <div className="font-bold text-white">24/7 Helpline</div>
                <div className="font-mono text-emerald-400">0700-OPAY-HELP (0700-6729-3366)</div>
              </div>
              <div className="p-3 bg-[#13161C] rounded-xl border border-slate-800">
                <div className="font-bold text-white">Support Email</div>
                <div className="font-mono text-slate-300">support@opaydigital.com</div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300">
                All accounts, balances, cards, and transactions in this application are protected by OPay security.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
