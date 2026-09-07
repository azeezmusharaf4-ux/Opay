import React, { useState } from 'react';
import { useDemoWallet } from '../../../context/DemoWalletContext';
import { formatNgn } from '../../../utils/formatters';
import { 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Calendar,
  Gauge,
  CreditCard,
  Store,
  Users2,
  ShieldCheck,
  Headphones,
  Sparkles,
  PhoneCall,
  Star,
  Hexagon,
  AlertTriangle,
  CheckCircle2,
  Lock,
  X,
  Smartphone,
  Check
} from 'lucide-react';

interface OPayMeTabProps {
  onOpenProfileModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenSupportModal?: () => void;
  onOpenSecurityModal?: () => void;
}

export const OPayMeTab: React.FC<OPayMeTabProps> = ({
  onOpenProfileModal,
  onOpenHistoryModal,
}) => {
  const { 
    userProfile, 
    opayBalance,
    isAuthenticated 
  } = useDemoWallet();

  const [showBalance, setShowBalance] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="-mx-3.5 sm:-mx-4 -mt-3 flex flex-col min-h-screen text-slate-100 animate-in fade-in duration-150 select-none pb-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 rounded-full bg-[#181B22]/95 border border-emerald-500/40 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D589]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. TOP GREEN SECTION matching IMG_2428.png */}
      <div className="bg-[#0C241B] px-4 pt-4 pb-5 rounded-b-[28px] space-y-4 shadow-lg border-b border-emerald-950/40">
        
        {/* User Info Row */}
        {!isAuthenticated ? (
          <div className="flex items-center justify-between">
            <div 
              onClick={onOpenProfileModal}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-emerald-400/40 bg-slate-800 flex items-center justify-center text-slate-300">
                <Hexagon className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Hi</span>
                </h2>
                <span className="text-xs text-slate-300">Welcome to OPay</span>
              </div>
            </div>

            <button
              onClick={onOpenProfileModal}
              className="rounded-full bg-[#00D589] px-4 py-1.5 text-xs font-black text-[#082218] shadow hover:bg-[#00E599] transition-colors"
            >
              Login / Sign Up
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div 
              onClick={onOpenProfileModal}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Avatar with circular ring border */}
              <div className="relative">
                <div className="h-13 w-13 h-[50px] w-[50px] overflow-hidden rounded-full border-2 border-emerald-400/40 bg-slate-800 shadow-md">
                  {userProfile.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt={userProfile.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-emerald-700 text-white font-bold text-base">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Tier Badge */}
              <div className="space-y-1">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Hi,{userProfile.name || 'MUSARAF'}</span>
                </h2>

                {/* Gold Tier 3 Badge matching reference */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#DFB062]/20 via-[#F3CE7E]/25 to-[#DFB062]/20 border border-[#F3CE7E]/40 px-2 py-0.5 shadow-sm">
                  <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-[#F5D48B] to-[#C89538] text-[9px] font-black text-[#382200] shadow-sm">
                    3
                  </div>
                  <span className="text-[11px] font-bold text-[#F3CE7E] tracking-tight">
                    Tier 3
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hexagon Settings Icon with Red Notification Dot */}
            <button
              id="me-settings-btn"
              onClick={onOpenProfileModal}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-200 hover:text-white hover:bg-emerald-900/30 transition-colors"
              aria-label="Settings"
            >
              <Hexagon className="h-6 w-6 stroke-[1.8]" />
              <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444] shadow-[0_0_6px_#EF4444]" />
            </button>
          </div>
        )}

        {/* Balance & Security Shield Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Balance Block */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span>Total Balance</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle Balance Visibility"
              >
                {showBalance ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {!isAuthenticated ? '****' : (showBalance ? formatNgn(opayBalance) : '••••••')}
              </span>
            </div>

            {/* Interest Credited Today Badge */}
            {isAuthenticated && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#113125] border border-emerald-500/20 px-2.5 py-1 text-[11px] text-slate-300">
                <span>Interest Credited Today</span>
                <span className="font-bold text-[#00E599] font-mono">+₦0.09</span>
              </div>
            )}
          </div>

          {/* Glowing Green Shield Emblem matching IMG_2428.png */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glowing Radial Halo Ring */}
            <div className="absolute h-20 w-20 rounded-full bg-[#00D589]/15 blur-md animate-pulse" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-[#133C2D] to-[#0A261C] border border-[#00D589]/50 shadow-[0_0_15px_rgba(0,213,137,0.3)]">
              {/* Inner Shield Badge */}
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00E89B] to-[#00B67A] text-[#0A261C] shadow-md">
                <Check className="h-7 w-7 stroke-[3.5] text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Mint Green "7 Safety Tips" Banner */}
        <div 
          onClick={() => setActiveModal('safety_tips')}
          className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#00E599] to-[#00D589] p-3.5 sm:p-4 text-[#062417] shadow-lg cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚠️</span>
              <span className="text-sm font-black text-[#041D12]">7 Safety Tips</span>
            </div>
            <p className="text-xs font-medium text-[#0A3320]">
              Make your account more secure.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveModal('safety_tips');
            }}
            className="rounded-full bg-[#181D23] px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-black transition-colors"
          >
            View
          </button>
        </div>

      </div>

      {/* 2. BODY CONTENT (Continuous Vertical Scroll List) */}
      <div className="px-4 pt-3 space-y-3.5">
        
        {/* GROUP 1: Transaction History & Account Management */}
        <div 
          id="me-group-1"
          className="rounded-2xl bg-[#181B22] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-sm"
        >
          {/* Row 1: Transaction History */}
          <button
            id="me-tx-history-row"
            onClick={onOpenHistoryModal}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Calendar className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Transaction History
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 2: Account Limits */}
          <button
            id="me-account-limits-row"
            onClick={onOpenProfileModal}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Gauge className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  Account Limits
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  View your transaction limits
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 3: Bank Card/Account */}
          <button
            id="me-bank-card-row"
            onClick={() => setActiveModal('bank_card')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <CreditCard className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  Bank Card/Account
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Add payment option
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 4: My BizPayment */}
          <button
            id="me-biz-payment-row"
            onClick={() => setActiveModal('biz_payment')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Store className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  My BizPayment
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Receive payment for business
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 5: OJunior */}
          <button
            id="me-ojunior-row"
            onClick={() => setActiveModal('ojunior')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Users2 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  OJunior
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Create an account for your child/ward
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* GROUP 2: Security & Customer Center (matching IMG_2429.png) */}
        <div 
          id="me-group-2"
          className="rounded-2xl bg-[#181B22] border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-sm"
        >
          {/* Row 1: Security Center */}
          <button
            id="me-security-center-row"
            onClick={() => setActiveModal('security_center')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  Security Center
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Protect your funds
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 2: Customer Service Center */}
          <button
            id="me-customer-service-row"
            onClick={() => setActiveModal('customer_service')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Headphones className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Customer Service Center
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 3: Invitation */}
          <button
            id="me-invitation-row"
            onClick={() => setActiveModal('invitation')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Sparkles className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors block leading-tight">
                  Invitation
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Invite friends and earn up to ₦6,300 Bonus
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 4: OPay USSD */}
          <button
            id="me-ussd-row"
            onClick={() => setActiveModal('ussd')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <PhoneCall className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                OPay USSD
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Row 5: Rate Us */}
          <button
            id="me-rate-us-row"
            onClick={() => showToast('Thank you for rating OPay 5 Stars!')}
            className="flex w-full items-center justify-between p-4 hover:bg-[#1F232C] transition-colors text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                <Star className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Rate Us
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* 3. FOOTER: Regulatory Disclaimer matching IMG_2429.png */}
        <div className="pt-2 pb-6 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
          {/* Nigerian Coat of Arms vector */}
          <div className="h-4 w-4 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald-500" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 7H18L15 10L16.5 15L12 12L7.5 15L9 10L6 7H9.5L12 2Z" fill="#10B981" />
              <path d="M7 11C7 16 12 21 12 21C12 21 17 16 17 11V6L12 4L7 6V11Z" stroke="#34D399" strokeWidth="1.5" fill="none" />
              <path d="M9.5 9L12 13L14.5 9M12 13V18" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-1 font-medium tracking-tight">
            <span>Licensed by the <strong className="font-extrabold text-white">CBN</strong> and insured by the</span>
            <div className="flex flex-col items-start leading-none ml-0.5">
              <span className="font-black text-white text-xs tracking-tight">NDIC</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sub-Modals for complete working functionality */}
      
      {/* 1. 7 Safety Tips Modal */}
      {activeModal === 'safety_tips' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <h3 className="text-base font-bold text-white">7 OPay Safety Tips</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 max-h-72 overflow-y-auto pr-1">
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">1. Never share your 6-digit PIN</p>
                <p className="text-slate-400">OPay staff will never ask for your PIN, OTP, or password.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">2. Beware of Fake SMS / Alerts</p>
                <p className="text-slate-400">Always confirm incoming funds in your OPay transaction history before releasing goods.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">3. Lock Lost Phone Immediately</p>
                <p className="text-slate-400">Dial *955*131# from any line to instantly block your OPay account if your phone is missing.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">4. Enable Biometric Fingerprint</p>
                <p className="text-slate-400">Use Face ID or Fingerprint for seamless and secure sign-in.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">5. Use Verified Official Channels</p>
                <p className="text-slate-400">Only contact support via verified in-app chat or verified social handles.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">6. Check Merchant / Account Name</p>
                <p className="text-slate-400">Double check recipient names before confirming any transfer.</p>
              </div>
              <div className="rounded-xl bg-[#111317] p-3 border border-slate-800">
                <p className="font-bold text-white mb-0.5">7. Update App Regularly</p>
                <p className="text-slate-400">Keep your app updated to get the latest security features and patches.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Safety settings confirmed');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              I Understand & Keep My Account Secure
            </button>
          </div>
        </div>
      )}

      {/* 2. Bank Card / Account Modal */}
      {activeModal === 'bank_card' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">Bank Card & Account</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-[#101318] p-3.5 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">OPay Debit Verve Card</p>
                  <p className="text-slate-400 font-mono mt-0.5">•••• •••• •••• 9012</p>
                </div>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <div className="rounded-xl bg-[#101318] p-3.5 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Linked Bank (Access Bank)</p>
                  <p className="text-slate-400 font-mono mt-0.5">Acc: 0123456789</p>
                </div>
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                  Linked
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('New card linking option ready');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              + Add New Debit Card / Bank
            </button>
          </div>
        </div>
      )}

      {/* 3. My BizPayment Modal */}
      {activeModal === 'biz_payment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">OPay BizPayment</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 bg-[#101318] rounded-xl border border-slate-800">
                <p className="font-bold text-white">Business Merchant Name</p>
                <p className="text-slate-400 mt-0.5">{userProfile.fullName} ENTERPRISES</p>
              </div>
              <div className="p-3 bg-[#101318] rounded-xl border border-slate-800">
                <p className="font-bold text-white">Static POS QR Code</p>
                <p className="text-slate-400 mt-0.5">Collect payments without POS machine fee.</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Merchant QR Code displayed');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Generate Merchant Payment QR
            </button>
          </div>
        </div>
      )}

      {/* 4. OJunior Modal */}
      {activeModal === 'ojunior' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">OJunior Account</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              OJunior gives your child a smart savings wallet with parental spend controls, zero transfer fees, and financial education.
            </p>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('OJunior application initiated');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Create Child / Ward Account
            </button>
          </div>
        </div>
      )}

      {/* 5. Security Center Modal */}
      {activeModal === 'security_center' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">OPay Security Center</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Account Protection Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> High (Protected)
                </span>
              </div>
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Biometric / Face Unlock</span>
                <span className="font-bold text-emerald-400">Enabled</span>
              </div>
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Payment PIN Protection</span>
                <span className="font-bold text-emerald-400">Active</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Security audit completed');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Run Security Health Check
            </button>
          </div>
        </div>
      )}

      {/* 6. Customer Service Modal */}
      {activeModal === 'customer_service' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Headphones className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">OPay Customer Support</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-[#101318] rounded-xl border border-slate-800">
                <p className="font-bold text-white">24/7 Live In-App Chat</p>
                <p className="text-slate-400 mt-0.5">Average response time: &lt; 2 minutes</p>
              </div>
              <div className="p-3 bg-[#101318] rounded-xl border border-slate-800">
                <p className="font-bold text-white">Official Helpline</p>
                <p className="text-emerald-400 font-mono mt-0.5 font-bold">0700 8888 328</p>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Connecting to customer care representative...');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Start Live Support Chat
            </button>
          </div>
        </div>
      )}

      {/* 7. Invitation Modal */}
      {activeModal === 'invitation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">Invite & Earn ₦6,300</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-900/40 to-[#00D589]/20 p-4 text-center border border-emerald-500/30">
              <p className="text-xs text-slate-300">Your Referral Code</p>
              <p className="text-2xl font-black text-[#00E599] font-mono tracking-widest my-1.5">
                {userProfile.accountNumber || '8143290184'}
              </p>
              <p className="text-[11px] text-slate-400">Earn ₦1,200 immediately each invited friend signs up and adds ₦1,000.</p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(userProfile.accountNumber || '8143290184').catch(() => {});
                setActiveModal(null);
                showToast('Referral link copied to clipboard!');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Copy Referral Link
            </button>
          </div>
        </div>
      )}

      {/* 8. USSD Modal */}
      {activeModal === 'ussd' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#171A21] border border-slate-800 p-5 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-5 w-5 text-[#00D589]" />
                <h3 className="text-base font-bold text-white">OPay USSD Banking</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Main USSD Banking Code</span>
                <span className="font-mono font-bold text-[#00D589] text-sm">*955#</span>
              </div>
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Quick Balance Check</span>
                <span className="font-mono font-bold text-white">*955*0#</span>
              </div>
              <div className="flex justify-between items-center bg-[#101318] p-3 rounded-xl border border-slate-800">
                <span>Emergency Account Lock</span>
                <span className="font-mono font-bold text-red-400">*955*131#</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                showToast('Dial *955# from your registered SIM');
              }}
              className="w-full rounded-xl bg-[#00D589] py-2.5 text-xs font-bold text-[#082218] hover:bg-[#00E599] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
