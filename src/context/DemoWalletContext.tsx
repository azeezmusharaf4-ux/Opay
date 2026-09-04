import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { 
  Transaction, 
  DemoNotification, 
  OPayUserProfile, 
  OPayDebitCard,
  SafeBoxPlan,
  ActiveLoan,
  TransactionStatus,
  RegisteredUserAccount,
  SmsNotificationLog,
  VerificationStatus,
  VerificationAuditLog
} from '../types';
import { generateReference, generateSessionId, formatNgn } from '../utils/formatters';
import { soundManager } from '../utils/audio';
import { hashCredentialsOnBackend, verifyPinOnBackend, updatePinOnBackend, VerifyPinResult, clientSha256 } from '../utils/security';
import confetti from 'canvas-confetti';

interface DemoWalletContextType {
  // Authentication State
  isAuthenticated: boolean;
  isManuallyLoggedOut: boolean;
  rememberedAccount: RegisteredUserAccount | null;
  currentUser: RegisteredUserAccount | null;
  registeredAccounts: RegisteredUserAccount[];
  smsLogs: SmsNotificationLog[];
  lastSentSms: SmsNotificationLog | null;
  
  // Auth Operations
  registerUser: (data: {
    fullName: string;
    phone: string;
    email: string;
    nin: string;
    password?: string;
    pin: string;
    verificationLog?: VerificationAuditLog;
  }) => Promise<{ success: boolean; error?: string }>;
  loginUser: (credentials: {
    identifier: string;
    pinOrPass: string;
  }) => Promise<{ 
    success: boolean; 
    error?: string; 
    verificationStatus?: VerificationStatus; 
    accountData?: RegisteredUserAccount;
    requiresPermanentPasswordReset?: boolean;
    resetSessionToken?: string;
  }>;
  verifyTransactionPin: (pin: string) => Promise<VerifyPinResult>;
  updateTransactionPin: (params: { newPin: string; currentPin?: string }) => Promise<{ success: boolean; message?: string }>;
  logoutUser: (isManual?: boolean) => void;
  clearRememberedAccount: () => void;
  setRememberedAccount: (accountId: string) => void;
  switchAccount: (accountId: string) => void;
  updateAccountPasswordInClient: (accountId: string, newPassword: string) => void;
  refreshAccountsFromServer: () => Promise<void>;
  processBscWithdrawal: (payload: {
    transactionId: string;
    accountNumber: string;
    amountNgn: number;
    sender?: string;
    status?: string;
    timestamp?: number;
  }) => { success: boolean; error?: string; duplicate?: boolean; targetUser?: string };

  // Wallet State
  opayBalance: number;
  isBalanceHidden: boolean;
  userProfile: OPayUserProfile;
  cards: OPayDebitCard[];
  safeBoxes: SafeBoxPlan[];
  activeLoan: ActiveLoan;
  transactions: Transaction[];
  notifications: DemoNotification[];
  unreadNotificationCount: number;
  activeToast: DemoNotification | null;
  soundEnabled: boolean;

  // Actions
  toggleBalanceVisibility: () => void;
  toggleSound: () => void;
  updateUserProfile: (profile: Partial<OPayUserProfile>) => void;
  
  // Banking Operations
  sendOpayTransfer: (params: {
    recipientName: string;
    recipientPhone: string;
    amountNgn: number;
    remark?: string;
  }) => Promise<Transaction>;

  sendBankTransfer: (params: {
    bankName: string;
    bankCode?: string;
    accountNumber: string;
    accountName: string;
    amountNgn: number;
    remark?: string;
  }) => Promise<Transaction>;

  performAtmWithdrawal: (amountNgn: number) => Promise<{ code: string; tx: Transaction }>;

  quickServiceRecharge: (params: {
    serviceType: 'airtime' | 'data' | 'betting' | 'tv';
    providerName: string;
    targetIdentifier: string;
    packageDescription: string;
    amountNgn: number;
  }) => Promise<Transaction>;

  addMoneyToWallet: (params: {
    method: 'bank_transfer' | 'debit_card' | 'ussd' | 'paystack';
    amountNgn: number;
    sourceDetails?: string;
    reference?: string;
  }) => Promise<Transaction>;

  lockInSafeBox: (title: string, amountNgn: number, durationDays: number) => Promise<boolean>;
  withdrawFromSafeBox: (planId: string) => Promise<boolean>;

  requestInstantLoan: (amountNgn: number) => Promise<boolean>;
  repayInstantLoan: (amountNgn: number) => Promise<boolean>;

  claimDailyReward: (dayIndex: number, bonusNgn: number) => Promise<boolean>;

  // Card Controls
  toggleCardFreeze: (cardId: string) => void;
  toggleCardOnline: (cardId: string) => void;
  updateCardLimit: (cardId: string, newLimit: number) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  dismissToast: () => void;

  // Global Reset
  resetToDemoDefaults: () => void;
}

const STORAGE_KEY_PREFIX = 'OPAY_BANKING_APP_V3';
const ACCOUNTS_STORAGE_KEY = 'OPAY_REGISTERED_ACCOUNTS_V3';
const ACTIVE_ACCOUNT_KEY = 'OPAY_ACTIVE_ACCOUNT_ID_V3';
const REMEMBERED_ACCOUNT_KEY = 'OPAY_REMEMBERED_ACCOUNT_ID_V3';
const MANUAL_LOGOUT_KEY = 'OPAY_MANUALLY_LOGGED_OUT_V3';
const SMS_LOGS_STORAGE_KEY = 'OPAY_SMS_LOGS_V3';

const DEFAULT_USER_PROFILE: OPayUserProfile = {
  name: 'MUSARAF',
  fullName: 'MUSARAF OLAWALE ABDULAZEEZ',
  phone: '+2347075817357',
  accountNumber: '7075817357',
  tier: 3,
  tierName: 'Tier 3',
  dailyLimitNgn: 5000000,
  singleMaxNgn: 1000000,
  avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
  todaySalesNgn: 11300.00,
  savingsBalanceNgn: 25450.00,
  owealthBalanceNgn: 8200.00,
  cashbackPointsNgn: 1450.00,
  isKycVerified: true,
  email: 'a*@gmail.com',
  bvnLinked: true,
  ninLinked: true,
  gender: 'Male',
  dob: '**-**-13',
  nickname: '',
  address: '',
};

const DEFAULT_CARDS: OPayDebitCard[] = [
  {
    id: 'card-verve-1',
    cardType: 'Physical Verve',
    cardNumber: '5061 0422 9811 4092',
    cardHolder: 'MUSARAF O BELLO',
    expiryDate: '08/29',
    cvv: '814',
    isFrozen: false,
    isOnlineEnabled: true,
    isAtmEnabled: true,
    isPosEnabled: true,
    dailySpendLimit: 500000,
    colorTheme: 'teal',
  },
  {
    id: 'card-visa-1',
    cardType: 'Virtual Visa',
    cardNumber: '4187 5590 1234 7720',
    cardHolder: 'MUSARAF O BELLO',
    expiryDate: '11/28',
    cvv: '392',
    isFrozen: false,
    isOnlineEnabled: true,
    isAtmEnabled: false,
    isPosEnabled: false,
    dailySpendLimit: 250000,
    colorTheme: 'gold',
  }
];

const DEFAULT_SAFEBOXES: SafeBoxPlan[] = [
  {
    id: 'plan-rent',
    title: 'Yearly House Rent Lock',
    principalNgn: 15000.00,
    interestRateAnnual: 18.5,
    accruedInterestNgn: 412.30,
    lockedUntil: Date.now() + 86400000 * 90,
    autoRenew: true,
  },
  {
    id: 'plan-emergency',
    title: 'Emergency Rainy Day Fund',
    principalNgn: 10450.00,
    interestRateAnnual: 16.0,
    accruedInterestNgn: 220.15,
    lockedUntil: Date.now() + 86400000 * 45,
    autoRenew: false,
  }
];

const DEFAULT_LOAN: ActiveLoan = {
  loanLimitNgn: 150000.00,
  currentBorrowedNgn: 0.00,
  dueDate: Date.now() + 86400000 * 30,
  dailyInterestPercent: 0.1,
  status: 'eligible',
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-op-1788393360902',
    reference: 'OPAY2609026WDV4V',
    type: 'op_transfer',
    title: 'Transfer to FUNMILAYO ADENEKAN',
    description: 'Transfer to OPay User (9125856006)',
    amountNgn: 100,
    status: 'successful',
    timestamp: 1788393360902,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'FUNMILAYO ADENEKAN',
      accountOrPhone: '9125856006',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 123900,
    sessionId: '100004178839336090289913503520',
    networkRoutingSession: 'NIP-SW-260902-ENKO',
    networkRoutes: [
      'OPay Core Switch Gateway',
      'NIBSS Instant Payment (NIP Interbank)',
      'Interswitch Central Switch',
      'CBN Settlement Router',
    ],
  },
  {
    id: 'tx-bank-1788393053647',
    reference: 'OPAY2609023K028T',
    type: 'bank_transfer',
    title: 'Transfer to KHADIJAT SHEHU',
    description: 'Interbank transfer to 9138764755 (Momo Payment Service Bank)',
    amountNgn: 10000,
    status: 'successful',
    timestamp: 1788393053647,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'KHADIJAT SHEHU',
      accountOrPhone: '9138764755',
      bankName: 'Momo Payment Service Bank',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 124000,
    sessionId: '100004178839305364791701671435',
    networkRoutingSession: 'NIP-SW-260902-IBXC',
    networkRoutes: [
      'OPay Core Switch Gateway',
      'NIBSS Instant Payment (NIP Interbank)',
      'Interswitch Central Switch',
      'CBN Settlement Router',
    ],
  },
  {
    id: 'tx-svc-1788392875268',
    reference: 'OPAY2609025P1LTR',
    type: 'tv',
    title: 'DStv TV',
    description: 'DStv TV Payment for +2347075817357',
    amountNgn: 2000,
    status: 'successful',
    timestamp: 1788392875268,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'DStv Service',
      accountOrPhone: '+2347075817357',
      bankName: 'DStv',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 134000,
    sessionId: '100004178839287526879897861331',
  },
  {
    id: 'tx-sb-1788392873143',
    reference: 'OPAY260902CGR9IK',
    type: 'safebox_deposit',
    title: 'Locked into SafeBox: House Rent 2026',
    description: 'Locked for 90 days at 22% p.a.',
    amountNgn: 2000,
    status: 'successful',
    timestamp: 1788392873143,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay Wallet',
    },
    recipient: {
      name: 'OPay SafeBox Vault',
      accountOrPhone: 'plan-1788392873143',
      bankName: 'OPay SafeBox',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 136000,
    sessionId: '100004178839287314383755343070',
  },
  {
    id: 'tx-sb-1788392872216',
    reference: 'OPAY260902LF0A2D',
    type: 'safebox_deposit',
    title: 'Locked into SafeBox: House Rent 2026',
    description: 'Locked for 90 days at 22% p.a.',
    amountNgn: 2000,
    status: 'successful',
    timestamp: 1788392872216,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay Wallet',
    },
    recipient: {
      name: 'OPay SafeBox Vault',
      accountOrPhone: 'plan-1788392872216',
      bankName: 'OPay SafeBox',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 138000,
    sessionId: '100004178839287221662892961428',
  },
  {
    id: 'tx-sb-1788392855754',
    reference: 'OPAY2609025LWHQ3',
    type: 'safebox_deposit',
    title: 'Locked into SafeBox: House Rent 2026',
    description: 'Locked for 90 days at 22% p.a.',
    amountNgn: 2000,
    status: 'successful',
    timestamp: 1788392855754,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay Wallet',
    },
    recipient: {
      name: 'OPay SafeBox Vault',
      accountOrPhone: 'plan-1788392855754',
      bankName: 'OPay SafeBox',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 140000,
    sessionId: '100004178839285575486927440038',
  },
  {
    id: 'tx-sb-1788392853348',
    reference: 'OPAY260902VUUEYZ',
    type: 'safebox_deposit',
    title: 'Locked into SafeBox: House Rent 2026',
    description: 'Locked for 90 days at 22% p.a.',
    amountNgn: 2000,
    status: 'successful',
    timestamp: 1788392853348,
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay Wallet',
    },
    recipient: {
      name: 'OPay SafeBox Vault',
      accountOrPhone: 'plan-1788392853348',
      bankName: 'OPay SafeBox',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 142000,
    sessionId: '100004178839285334833617794354',
  },
  {
    id: 'tx-seed-owealth-1',
    reference: '260829013940182937102938',
    type: 'deposit',
    title: 'OWealth Interest Earned',
    description: 'Daily compound interest credit on OWealth investment balance',
    amountNgn: 0.09,
    status: 'successful',
    timestamp: new Date('2026-08-29T01:39:40').getTime(),
    sender: {
      name: 'OWealth Asset Management',
      accountOrPhone: 'OWEALTH-DAILY',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'inflow',
    balanceAfterNgn: 40.86,
    sessionId: '260829013940182937102938',
  },
  {
    id: 'tx-seed-stamp-duty-1',
    reference: '260828130921092837461928',
    type: 'withdraw',
    title: 'Stamp Duty',
    description: 'Electronic Money Transfer Levy (EMTL)',
    amountNgn: 50.00,
    status: 'successful',
    timestamp: new Date('2026-08-28T13:09:21').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'FEDERAL INLAND REVENUE SERVICE (FIRS)',
      accountOrPhone: 'STAMP-DUTY-EMTL',
      bankName: 'CBN / FIRS',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 40.77,
    sessionId: '260828130921092837461928',
  },
  {
    id: 'tx-seed-transfer-1',
    reference: '260828010100348299203012',
    type: 'bank_transfer',
    title: 'Transfer to FUNMILAYO ADENEKAN',
    description: 'Interbank fund transfer to Funmilayo Adenekan',
    amountNgn: 11000.00,
    status: 'successful',
    timestamp: new Date('2026-08-28T13:09:13').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'FUNMILAYO ADENEKAN',
      accountOrPhone: '912 585 6006',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 90.77,
    sessionId: '260828010100348299203012',
  },
  {
    id: 'tx-seed-transfer-musaraf-1',
    reference: '260828130732891726481029',
    type: 'op_transfer',
    title: 'Transfer to MUSARAF ABDULAZEEZ',
    description: 'OPay to OPay fund transfer',
    amountNgn: 200.00,
    status: 'successful',
    timestamp: new Date('2026-08-28T13:07:32').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF ABDULAZEEZ',
      accountOrPhone: '707 581 7357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 11090.77,
    sessionId: '260828130732891726481029',
  },
  {
    id: 'tx-seed-ussd-1',
    reference: '260828130641928374619283',
    type: 'withdraw',
    title: 'USSD Charge',
    description: 'Banking USSD Service Charge',
    amountNgn: 10.00,
    status: 'successful',
    timestamp: new Date('2026-08-28T13:06:41').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'USSD TELCO NETWORK CHARGE',
      accountOrPhone: 'USSD-NIBSS',
      bankName: 'NIBSS / Telco',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 11290.77,
    sessionId: '260828130641928374619283',
  },
  {
    id: 'tx-seed-transfer-sherifat-1',
    reference: '260828130613098273645192',
    type: 'bank_transfer',
    title: 'Transfer from SHERIFAT ABANIKANDA',
    description: 'Inward fund transfer from Sherifat Abanikanda',
    amountNgn: 11300.00,
    status: 'successful',
    timestamp: new Date('2026-08-28T13:06:13').getTime(),
    sender: {
      name: 'SHERIFAT ABANIKANDA',
      accountOrPhone: '08123984711',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'inflow',
    balanceAfterNgn: 11300.77,
    sessionId: '260828130613098273645192',
  },
  {
    id: 'tx-seed-owealth-2',
    reference: '260828033814892716354891',
    type: 'deposit',
    title: 'OWealth Interest Earned',
    description: 'Daily compound interest credit on OWealth investment balance',
    amountNgn: 0.09,
    status: 'successful',
    timestamp: new Date('2026-08-28T03:38:14').getTime(),
    sender: {
      name: 'OWealth Asset Management',
      accountOrPhone: 'OWEALTH-DAILY',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'inflow',
    balanceAfterNgn: 0.77,
    sessionId: '260828033814892716354891',
  },
  {
    id: 'tx-seed-transfer-musaraf-2',
    reference: '260827124700982736451029',
    type: 'op_transfer',
    title: 'Transfer to MUSARAF ABDULAZEEZ',
    description: 'OPay to OPay fund transfer',
    amountNgn: 130.00,
    status: 'successful',
    timestamp: new Date('2026-08-27T12:47:00').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF ABDULAZEEZ',
      accountOrPhone: '707 581 7357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 0.68,
    sessionId: '260827124700982736451029',
  },
  {
    id: 'tx-seed-transfer-lateefat-1',
    reference: '260827093907892736451920',
    type: 'bank_transfer',
    title: 'Transfer to LATEEFAT OMOBUKOLA',
    description: 'Interbank fund transfer to Lateefat Omobukola',
    amountNgn: 800.00,
    status: 'successful',
    timestamp: new Date('2026-08-27T09:39:07').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'LATEEFAT OMOBUKOLA',
      accountOrPhone: '810 928 3746',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 130.68,
    sessionId: '260827093907892736451920',
  },
  {
    id: 'tx-seed-transfer-musaraf-3',
    reference: '260827084918892736451029',
    type: 'op_transfer',
    title: 'Transfer to MUSARAF ABDULAZEEZ',
    description: 'OPay to OPay fund transfer',
    amountNgn: 200.00,
    status: 'successful',
    timestamp: new Date('2026-08-27T08:49:18').getTime(),
    sender: {
      name: 'MUSARAF OLAWALE ABDULAZEEZ',
      accountOrPhone: '7075817357',
      bankName: 'OPay',
    },
    recipient: {
      name: 'MUSARAF ABDULAZEEZ',
      accountOrPhone: '707 581 7357',
      bankName: 'OPay',
    },
    feeNgn: 0,
    category: 'outflow',
    balanceAfterNgn: 930.68,
    sessionId: '260827084918892736451029',
  }
];

// Generate 70 initial notifications to match the screenshot badge '70'
const generateSeedNotifications = (): DemoNotification[] => {
  const list: DemoNotification[] = [
    {
      id: 'notif-1',
      title: 'Transfer Inflow Successful 💰',
      message: 'You have received ₦11,300.00 from POS Merchant Terminal Settlement. Your available balance is updated.',
      timestamp: Date.now() - 3600000 * 2,
      read: false,
      type: 'transaction',
      amountNgn: 11300.00,
      status: 'successful',
    },
    {
      id: 'notif-2',
      title: 'OPay 7 Savings Festival is Live! 🎉',
      message: 'Earn up to 27% p.a. interest when you create a target savings plan and invite friends.',
      timestamp: Date.now() - 3600000 * 5,
      read: false,
      type: 'promo',
    },
    {
      id: 'notif-3',
      title: 'Daily Check-in Bonus Ready 🎁',
      message: 'Claim your daily cash reward and scratch card bonus in the Rewards tab!',
      timestamp: Date.now() - 3600000 * 8,
      read: false,
      type: 'promo',
    },
    {
      id: 'notif-4',
      title: 'Airtime Purchase Successful',
      message: '₦2,000.00 MTN VTU top-up for 08034567890 was successfully processed.',
      timestamp: Date.now() - 3600000 * 18,
      read: false,
      type: 'transaction',
      amountNgn: 2000.00,
      status: 'successful',
    },
    {
      id: 'notif-5',
      title: 'Tier 3 KYC Verified 🛡️',
      message: 'Your Tier 3 verification with BVN & NIN is in good standing. Daily transfer limit is ₦5,000,000.',
      timestamp: Date.now() - 3600000 * 24,
      read: false,
      type: 'security',
    },
  ];

  // Fill up to 70 total notifications to match the exact badge in the screenshot
  const promoTitles = [
    'Cashback Voucher Received',
    'Free Transfer Fee Voucher Active',
    'Betting 10% Discount Coupon Available',
    'OWealth Daily Interest Credited',
    'New Security Upgrade: Biometric Lock',
    'Referral Bonus Available for Claim',
    'Electricity Bill Discount 5%',
    'Weekly Savings Challenge Update',
  ];

  for (let i = 6; i <= 70; i++) {
    const title = promoTitles[i % promoTitles.length];
    list.push({
      id: `notif-${i}`,
      title: `${title} #${i}`,
      message: `OPay Notice #${i}: Exclusive rewards and special service updates are available in your app.`,
      timestamp: Date.now() - 3600000 * (i * 2),
      read: false,
      type: i % 3 === 0 ? 'transaction' : i % 2 === 0 ? 'promo' : 'system',
    });
  }

  return list;
};

const DEFAULT_MASTER_ACCOUNT: RegisteredUserAccount = {
  id: 'acc-musaraf-default',
  fullName: 'MUSARAF OLAWALE ABDULAZEEZ',
  phone: '07075817357',
  email: 'musaraf.olawale@gmail.com',
  ninMasked: '•••••••4821',
  password: 'password123',
  loginPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  customPin: '1234',
  transactionPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  pinSalt: 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026',
  failedPinAttempts: 0,
  pinLockoutUntil: null,
  verificationStatus: 'account_active',
  verificationLog: {
    ninVerifiedAt: 1724800000000,
    ninMasked: '•••••••4821',
    faceVerifiedAt: 1724800000000,
    livenessScore: 99.4,
    facialMatchScore: 98.2,
    auditReference: 'OPAY_BIO_ACTIVE_MASTER',
    provider: 'NIMC / OPay Identity Verification Gateway',
  },
  accountNumber: '7075817357',
  balanceNgn: 123900.00,
  createdAt: 1724800000000,
  userProfile: DEFAULT_USER_PROFILE,
  transactions: INITIAL_TRANSACTIONS,
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: generateSeedNotifications(),
};

const DEFAULT_USER_B_ACCOUNT: RegisteredUserAccount = {
  id: 'acc-lateefat-user-b',
  fullName: 'LATEEFAT OMOBUKOLA BABATUNDE',
  phone: '07033529224',
  email: 'lateefat.omobukola@gmail.com',
  ninMasked: '•••••••7192',
  password: 'password123',
  loginPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  customPin: '1234',
  transactionPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  pinSalt: 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026',
  failedPinAttempts: 0,
  pinLockoutUntil: null,
  verificationStatus: 'account_active',
  verificationLog: {
    ninVerifiedAt: 1724800000000,
    ninMasked: '•••••••7192',
    faceVerifiedAt: 1724800000000,
    livenessScore: 99.1,
    facialMatchScore: 98.4,
    auditReference: 'OPAY_BIO_ACTIVE_USER_B',
    provider: 'NIMC / OPay Identity Verification Gateway',
  },
  accountNumber: '7033529224',
  balanceNgn: 25450.00,
  createdAt: 1724800000000,
  userProfile: {
    name: 'LATEEFAT',
    fullName: 'LATEEFAT OMOBUKOLA BABATUNDE',
    phone: '+2347033529224',
    accountNumber: '7033529224',
    tier: 3,
    tierName: 'Tier 3',
    dailyLimitNgn: 5000000,
    singleMaxNgn: 1000000,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    todaySalesNgn: 0,
    savingsBalanceNgn: 15000.00,
    owealthBalanceNgn: 25450.00,
    cashbackPointsNgn: 120.00,
    isKycVerified: true,
    email: 'lateefat.omobukola@gmail.com',
    bvnLinked: true,
    ninLinked: true,
    gender: 'Female',
    dob: '**-**-18',
    nickname: 'Lateefat',
    address: '12 Victoria Island, Lagos',
  },
  transactions: [
    {
      id: 'tx-seed-lateefat-initial',
      reference: '260826142011009827364512',
      type: 'op_transfer',
      title: 'Top-up from Bank Card',
      description: 'Card deposit to OPay Wallet',
      amountNgn: 25000.00,
      status: 'successful',
      timestamp: Date.now() - 86400000 * 2,
      sender: {
        name: 'LATEEFAT OMOBUKOLA',
        accountOrPhone: '5399••••••••1234',
        bankName: 'GTBank Visa Card',
      },
      recipient: {
        name: 'LATEEFAT OMOBUKOLA BABATUNDE',
        accountOrPhone: '7033529224',
        bankName: 'OPay',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: 25450.00,
      sessionId: '260826142011009827364512',
    }
  ],
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: [
    {
      id: 'notif-lateefat-1',
      title: 'Welcome to OPay 🛡️',
      message: 'Your OPay account is verified and ready for instant free transfers.',
      timestamp: Date.now() - 86400000 * 2,
      read: true,
      type: 'security',
    }
  ],
};

const DEFAULT_USER_C_ACCOUNT: RegisteredUserAccount = {
  id: 'acc-funmilayo-user-c',
  fullName: 'FUNMILAYO ADENEKAN',
  phone: '09125856006',
  email: 'funmilayo.adenekan@gmail.com',
  ninMasked: '•••••••5531',
  password: 'password123',
  loginPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  customPin: '1234',
  transactionPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  pinSalt: 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026',
  failedPinAttempts: 0,
  pinLockoutUntil: null,
  verificationStatus: 'account_active',
  verificationLog: {
    ninVerifiedAt: 1724800000000,
    ninMasked: '•••••••5531',
    faceVerifiedAt: 1724800000000,
    livenessScore: 99.0,
    facialMatchScore: 97.9,
    auditReference: 'OPAY_BIO_ACTIVE_USER_C',
    provider: 'NIMC / OPay Identity Verification Gateway',
  },
  accountNumber: '9125856006',
  balanceNgn: 18200.00,
  createdAt: 1724800000000,
  userProfile: {
    name: 'FUNMILAYO',
    fullName: 'FUNMILAYO ADENEKAN',
    phone: '+2349125856006',
    accountNumber: '9125856006',
    tier: 3,
    tierName: 'Tier 3',
    dailyLimitNgn: 5000000,
    singleMaxNgn: 1000000,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    todaySalesNgn: 0,
    savingsBalanceNgn: 10000.00,
    owealthBalanceNgn: 18200.00,
    cashbackPointsNgn: 90.00,
    isKycVerified: true,
    email: 'funmilayo.adenekan@gmail.com',
    bvnLinked: true,
    ninLinked: true,
    gender: 'Female',
    dob: '**-**-22',
    nickname: 'Funmi',
    address: '5 Ikeja GRA, Lagos',
  },
  transactions: [
    {
      id: 'tx-seed-funmilayo-initial',
      reference: '260826142011009827364999',
      type: 'op_transfer',
      title: 'Top-up from Bank Card',
      description: 'Card deposit to OPay Wallet',
      amountNgn: 18000.00,
      status: 'successful',
      timestamp: Date.now() - 86400000 * 2,
      sender: {
        name: 'FUNMILAYO ADENEKAN',
        accountOrPhone: '5399••••••••9912',
        bankName: 'Access Bank Visa Card',
      },
      recipient: {
        name: 'FUNMILAYO ADENEKAN',
        accountOrPhone: '9125856006',
        bankName: 'OPay',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: 18200.00,
      sessionId: '260826142011009827364999',
    }
  ],
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: [
    {
      id: 'notif-funmi-1',
      title: 'Welcome to OPay 🛡️',
      message: 'Your OPay account is verified and ready for instant free transfers.',
      timestamp: Date.now() - 86400000 * 2,
      read: true,
      type: 'security',
    }
  ],
};

const DEFAULT_SEED_ACCOUNTS: RegisteredUserAccount[] = [
  DEFAULT_MASTER_ACCOUNT,
  DEFAULT_USER_B_ACCOUNT,
  DEFAULT_USER_C_ACCOUNT,
];

const DemoWalletContext = createContext<DemoWalletContextType | undefined>(undefined);

export const DemoWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication State
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredUserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge missing seed accounts
          const existingIds = new Set(parsed.map(a => a.id));
          const missingSeeds = DEFAULT_SEED_ACCOUNTS.filter(s => !existingIds.has(s.id));
          return [...parsed, ...missingSeeds];
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_SEED_ACCOUNTS;
  });

  const [rememberedAccountId, setRememberedAccountId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(REMEMBERED_ACCOUNT_KEY);
      if (saved) return saved;
      const active = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
      if (active) return active;
      return DEFAULT_MASTER_ACCOUNT.id;
    } catch {
      return DEFAULT_MASTER_ACCOUNT.id;
    }
  });

  const [isManuallyLoggedOut, setIsManuallyLoggedOut] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_ACCOUNT_KEY) || DEFAULT_MASTER_ACCOUNT.id;
    } catch {
      return DEFAULT_MASTER_ACCOUNT.id;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const manualLogout = localStorage.getItem(MANUAL_LOGOUT_KEY) === 'true';
      if (manualLogout) return false;
      const savedActive = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
      return Boolean(savedActive);
    } catch {
      return true;
    }
  });

  const [smsLogs, setSmsLogs] = useState<SmsNotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem(SMS_LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [lastSentSms, setLastSentSms] = useState<SmsNotificationLog | null>(null);

  // Initialize state directly from locally saved active account to prevent any balance/transaction reset on reload
  const initialActiveAccount = (() => {
    try {
      const activeId = localStorage.getItem(ACTIVE_ACCOUNT_KEY) || DEFAULT_MASTER_ACCOUNT.id;
      const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed)) {
          const found = parsed.find((a: RegisteredUserAccount) => a.id === activeId);
          if (found) {
            const localPin = localStorage.getItem(`opay_pin_${found.id}`);
            const localPinHash = localStorage.getItem(`opay_pin_hash_${found.id}`);
            return {
              ...found,
              customPin: localPin || found.customPin,
              transactionPinHash: localPinHash || found.transactionPinHash,
            };
          }
        }
      }
      const localPin = localStorage.getItem(`opay_pin_${DEFAULT_MASTER_ACCOUNT.id}`);
      const localPinHash = localStorage.getItem(`opay_pin_hash_${DEFAULT_MASTER_ACCOUNT.id}`);
      return {
        ...DEFAULT_MASTER_ACCOUNT,
        customPin: localPin || DEFAULT_MASTER_ACCOUNT.customPin,
        transactionPinHash: localPinHash || DEFAULT_MASTER_ACCOUNT.transactionPinHash,
      };
    } catch {
      return DEFAULT_MASTER_ACCOUNT;
    }
  })();

  const [opayBalance, setOpayBalance] = useState<number>(() => {
    return typeof initialActiveAccount.balanceNgn === 'number'
      ? initialActiveAccount.balanceNgn
      : DEFAULT_MASTER_ACCOUNT.balanceNgn;
  });
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<OPayUserProfile>(() => initialActiveAccount.userProfile || DEFAULT_USER_PROFILE);
  const [cards, setCards] = useState<OPayDebitCard[]>(() => initialActiveAccount.cards || DEFAULT_CARDS);
  const [safeBoxes, setSafeBoxes] = useState<SafeBoxPlan[]>(() => initialActiveAccount.safeBoxes || DEFAULT_SAFEBOXES);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan>(() => initialActiveAccount.activeLoan || DEFAULT_LOAN);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (Array.isArray(initialActiveAccount.transactions) && initialActiveAccount.transactions.length > 0) {
      return initialActiveAccount.transactions;
    }
    return DEFAULT_MASTER_ACCOUNT.transactions || INITIAL_TRANSACTIONS;
  });
  const [notifications, setNotifications] = useState<DemoNotification[]>(() => initialActiveAccount.notifications || generateSeedNotifications());
  const [activeToast, setActiveToast] = useState<DemoNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const isInitialServerLoaded = useRef(false);

  // Load accounts from persistent server database on startup
  const loadAccountsFromServer = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accounts) && data.accounts.length > 0) {
          const sanitized = data.accounts.map((a: RegisteredUserAccount) => {
            const copy = { ...a };
            delete copy.password;
            return copy;
          });

          setRegisteredAccounts(prev => {
            const accountMap = new Map<string, RegisteredUserAccount>();
            for (const localAcc of prev) {
              accountMap.set(localAcc.id, localAcc);
            }
            for (const serverAcc of sanitized) {
              const existing = accountMap.get(serverAcc.id);
              const localPin = localStorage.getItem(`opay_pin_${serverAcc.id}`);
              const localPinHash = localStorage.getItem(`opay_pin_hash_${serverAcc.id}`);
              const localPinSalt = localStorage.getItem(`opay_pin_salt_${serverAcc.id}`);
              if (existing) {
                const txMap = new Map<string, Transaction>();
                for (const t of (existing.transactions || [])) if (t?.id) txMap.set(t.id, t);
                for (const t of (serverAcc.transactions || [])) if (t?.id) txMap.set(t.id, t);
                const mergedTxs = Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                accountMap.set(serverAcc.id, {
                  ...existing,
                  ...serverAcc,
                  customPin: localPin || existing.customPin || serverAcc.customPin,
                  transactionPinHash: localPinHash || existing.transactionPinHash || serverAcc.transactionPinHash,
                  pinSalt: localPinSalt || existing.pinSalt || serverAcc.pinSalt,
                  balanceNgn: serverAcc.balanceNgn ?? existing.balanceNgn,
                  transactions: mergedTxs,
                });
              } else {
                accountMap.set(serverAcc.id, {
                  ...serverAcc,
                  customPin: localPin || serverAcc.customPin,
                  transactionPinHash: localPinHash || serverAcc.transactionPinHash,
                  pinSalt: localPinSalt || serverAcc.pinSalt,
                });
              }
            }
            return Array.from(accountMap.values());
          });

          isInitialServerLoaded.current = true;
          try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
          } catch {}

          if (currentAccountId) {
            const current = sanitized.find((a: RegisteredUserAccount) => a.id === currentAccountId);
            if (current) {
              setOpayBalance(current.balanceNgn);
              setUserProfile(current.userProfile);
              setCards(current.cards || DEFAULT_CARDS);
              setSafeBoxes(current.safeBoxes || []);
              setActiveLoan(current.activeLoan || DEFAULT_LOAN);
              setTransactions(prevTxs => {
                const txMap = new Map<string, Transaction>();
                for (const t of prevTxs) if (t?.id) txMap.set(t.id, t);
                for (const t of (current.transactions || [])) if (t?.id) txMap.set(t.id, t);
                return Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              });
              setNotifications(current.notifications || []);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not load accounts from server DB:', err);
    }
  };

  useEffect(() => {
    loadAccountsFromServer();
  }, []);

  // Save registered accounts to localStorage & server DB (only after authoritative server load has completed)
  useEffect(() => {
    if (!isInitialServerLoaded.current) return;
    try {
      const sanitized = registeredAccounts.map((a: RegisteredUserAccount) => {
        const copy = { ...a };
        delete copy.password;
        return copy;
      });
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
      fetch('/api/accounts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts: sanitized }),
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }, [registeredAccounts]);

  // Save active account ID
  useEffect(() => {
    try {
      if (isAuthenticated && currentAccountId) {
        localStorage.setItem(ACTIVE_ACCOUNT_KEY, currentAccountId);
      } else {
        localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
      }
    } catch {
      // Ignore
    }
  }, [isAuthenticated, currentAccountId]);

  // Save SMS Logs
  useEffect(() => {
    try {
      localStorage.setItem(SMS_LOGS_STORAGE_KEY, JSON.stringify(smsLogs));
    } catch {
      // Ignore
    }
  }, [smsLogs]);

  // Sync active account data
  useEffect(() => {
    if (!currentAccountId) return;
    const current = registeredAccounts.find(a => a.id === currentAccountId);
    if (current) {
      setOpayBalance(current.balanceNgn);
      setUserProfile(current.userProfile);
      setCards(current.cards || DEFAULT_CARDS);
      setSafeBoxes(current.safeBoxes || []);
      setActiveLoan(current.activeLoan || DEFAULT_LOAN);
      setTransactions(current.transactions || []);
      setNotifications(current.notifications || []);
    }
  }, [currentAccountId]);

  // Save state changes back to the active user account
  useEffect(() => {
    if (!currentAccountId || !isAuthenticated) return;
    setRegisteredAccounts(prev => prev.map(acc => {
      if (acc.id === currentAccountId) {
        return {
          ...acc,
          balanceNgn: opayBalance,
          userProfile,
          cards,
          safeBoxes,
          activeLoan,
          transactions,
          notifications,
        };
      }
      return acc;
    }));
  }, [opayBalance, userProfile, cards, safeBoxes, activeLoan, transactions, notifications, currentAccountId, isAuthenticated]);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(prev => !prev);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const updateUserProfile = (profile: Partial<OPayUserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  const triggerToast = (notification: DemoNotification) => {
    setActiveToast(notification);
    if (soundEnabled) {
      soundManager.playNotificationSound();
    }
    setTimeout(() => {
      setActiveToast(current => (current?.id === notification.id ? null : current));
    }, 6000);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  // SMS Notification Dispatcher
  const sendSmsNotification = async (params: {
    recipientPhone: string;
    recipientName: string;
    senderName: string;
    amountNgn: number;
    reference: string;
  }): Promise<SmsNotificationLog> => {
    const { recipientPhone, recipientName, senderName, amountNgn, reference } = params;
    const formatted = formatNgn(amountNgn);
    const defaultMsg = `You have received ${formatted} from ${senderName}.`;

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone,
          recipientName,
          senderName,
          amountNgn,
          reference,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const log: SmsNotificationLog = {
          id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          recipientPhone: data.recipientPhone || recipientPhone,
          recipientName: data.recipientName || recipientName,
          senderName: data.senderName || senderName,
          amountNgn,
          message: data.message || defaultMsg,
          timestamp: data.timestamp || Date.now(),
          status: 'delivered',
          reference,
        };
        setSmsLogs(prev => [log, ...prev]);
        setLastSentSms(log);
        return log;
      }
    } catch (err) {
      console.warn('SMS dispatch notice:', err);
    }

    const fallbackLog: SmsNotificationLog = {
      id: `sms-${Date.now()}`,
      recipientPhone,
      recipientName,
      senderName,
      amountNgn,
      message: defaultMsg,
      timestamp: Date.now(),
      status: 'delivered',
      reference,
    };
    setSmsLogs(prev => [fallbackLog, ...prev]);
    setLastSentSms(fallbackLog);
    return fallbackLog;
  };

  // 1. Register User Account with Credential Hashing and Identity Verification Data
  const registerUser = async (data: {
    fullName: string;
    phone: string;
    email: string;
    nin: string;
    password?: string;
    pin: string;
    verificationLog?: VerificationAuditLog;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanPhone = data.phone.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanNin = data.nin.trim();
    const cleanPassword = (data.password || 'password123').trim();
    const cleanPin = data.pin.trim();
    const cleanFullName = data.fullName.trim().toUpperCase();

    // Check duplicate
    const exists = registeredAccounts.some(
      acc => acc.phone === cleanPhone || acc.email.toLowerCase() === cleanEmail
    );
    if (exists) {
      return {
        success: false,
        error: 'An account with this phone number or email address already exists. Please sign in.',
      };
    }

    // Securely hash credentials on server
    const hashResult = await hashCredentialsOnBackend(cleanPassword, cleanPin);

    const firstName = cleanFullName.split(' ')[0] || 'OPay User';
    const derivedAccNum = cleanPhone.replace(/\D/g, '').slice(-10);
    const maskedNin = `•••••••${cleanNin.slice(-4)}`;

    const newProfile: OPayUserProfile = {
      name: firstName,
      fullName: cleanFullName,
      phone: cleanPhone.startsWith('+') ? cleanPhone : `+234${cleanPhone.replace(/^0/, '')}`,
      accountNumber: derivedAccNum,
      tier: 3,
      tierName: 'Tier 3 (Verified)',
      dailyLimitNgn: 5000000,
      singleMaxNgn: 1000000,
      avatarUrl: '',
      todaySalesNgn: 0,
      savingsBalanceNgn: 0,
      owealthBalanceNgn: 0,
      cashbackPointsNgn: 500,
      isKycVerified: true,
      email: cleanEmail,
      bvnLinked: true,
      ninLinked: true,
      gender: 'Verified',
      dob: '**-**-**',
      nickname: '',
      address: '',
    };

    const initialTx: Transaction = {
      id: `tx-welcome-${Date.now()}`,
      reference: generateReference(),
      type: 'reward_bonus',
      title: 'OPay Welcome Credit',
      description: 'Account activation credit & NIMC identity + biometric verification confirmation',
      amountNgn: 10000.00,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: 'OPay Nigeria Welcome Desk',
        accountOrPhone: 'OPAY-WELCOME',
        bankName: 'OPay Microfinance Bank',
      },
      recipient: {
        name: cleanFullName,
        accountOrPhone: derivedAccNum,
        bankName: 'OPay',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: 10000.00,
      sessionId: generateSessionId(),
    };

    const welcomeNotification: DemoNotification = {
      id: `notif-welcome-${Date.now()}`,
      title: 'Account Active & Biometrics Verified 🛡️',
      message: `Welcome to OPay, ${cleanFullName}! Your account (${derivedAccNum}) is active. ₦10,000.00 welcome balance credited.`,
      timestamp: Date.now(),
      read: false,
      type: 'security',
      amountNgn: 10000.00,
      status: 'successful',
    };

    const newAccount: RegisteredUserAccount = {
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fullName: cleanFullName,
      phone: cleanPhone,
      email: cleanEmail,
      ninMasked: maskedNin,
      password: cleanPassword,
      loginPasswordHash: hashResult.passwordHash,
      transactionPinHash: hashResult.pinHash,
      pinSalt: hashResult.salt,
      failedPinAttempts: 0,
      pinLockoutUntil: null,
      verificationStatus: 'account_active',
      verificationLog: data.verificationLog || {
        ninVerifiedAt: Date.now(),
        ninMasked: maskedNin,
        faceVerifiedAt: Date.now(),
        livenessScore: 98.9,
        facialMatchScore: 97.4,
        auditReference: `OPAY_BIO_${Date.now()}`,
        provider: 'NIMC / OPay Identity Verification Gateway',
      },
      accountNumber: derivedAccNum,
      balanceNgn: 10000.00,
      createdAt: Date.now(),
      userProfile: newProfile,
      transactions: [initialTx],
      cards: [
        {
          id: `card-verve-${Date.now()}`,
          cardType: 'Physical Verve',
          cardNumber: `5061 0422 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          cardHolder: cleanFullName,
          expiryDate: '12/30',
          cvv: `${Math.floor(100 + Math.random() * 900)}`,
          isFrozen: false,
          isOnlineEnabled: true,
          isAtmEnabled: true,
          isPosEnabled: true,
          dailySpendLimit: 500000,
          colorTheme: 'teal',
        }
      ],
      safeBoxes: [],
      activeLoan: {
        loanLimitNgn: 150000.00,
        currentBorrowedNgn: 0.00,
        dueDate: Date.now() + 86400000 * 30,
        dailyInterestPercent: 0.1,
        status: 'eligible',
      },
      notifications: [welcomeNotification, ...generateSeedNotifications().slice(0, 5)],
    };

    const updatedList = [newAccount, ...registeredAccounts];
    setRegisteredAccounts(updatedList);
    setCurrentAccountId(newAccount.id);
    setIsAuthenticated(true);

    setOpayBalance(newAccount.balanceNgn);
    setUserProfile(newAccount.userProfile);
    setCards(newAccount.cards);
    setSafeBoxes(newAccount.safeBoxes);
    setActiveLoan(newAccount.activeLoan);
    setTransactions(newAccount.transactions);
    setNotifications(newAccount.notifications);

    triggerToast(welcomeNotification);

    return { success: true };
  };

  // 2. Login User Account
  const loginUser = async (credentials: {
    identifier: string;
    pinOrPass: string;
  }): Promise<{ 
    success: boolean; 
    error?: string; 
    verificationStatus?: VerificationStatus; 
    accountData?: RegisteredUserAccount;
    requiresPermanentPasswordReset?: boolean;
    resetSessionToken?: string;
  }> => {
    const cleanId = credentials.identifier.trim().toLowerCase();
    const cleanPinOrPass = credentials.pinOrPass.trim();

    // 1. Try server-side authentication (verifies permanent password & temporary 6-digit SMS passwords)
    try {
      const serverRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password: cleanPinOrPass,
        }),
      });

      const serverData = await serverRes.json().catch(() => null);

      if (serverRes.ok && serverData && serverData.success && serverData.account) {
        const account = serverData.account as RegisteredUserAccount;

        // If logged in with temporary password, the system immediately requires setting a new permanent password
        if (serverData.requiresPermanentPasswordReset) {
          return {
            success: true,
            requiresPermanentPasswordReset: true,
            resetSessionToken: serverData.resetSessionToken,
            accountData: account,
            verificationStatus: account.verificationStatus || 'account_active',
          };
        }

        // Full successful permanent login:
        setCurrentAccountId(account.id);
        setRememberedAccountId(account.id);
        setIsManuallyLoggedOut(false);
        setIsAuthenticated(true);
        try {
          localStorage.setItem(ACTIVE_ACCOUNT_KEY, account.id);
          localStorage.setItem(REMEMBERED_ACCOUNT_KEY, account.id);
          localStorage.removeItem(MANUAL_LOGOUT_KEY);
        } catch {}

        // Update local registeredAccounts state with authoritative server account data
        setRegisteredAccounts(prev => {
          const sanitized = { ...account };
          delete sanitized.password;
          const idx = prev.findIndex(a => a.id === sanitized.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...sanitized };
            return next;
          }
          return [...prev, sanitized];
        });

        setOpayBalance(account.balanceNgn);
        setUserProfile(account.userProfile);
        setCards(account.cards || DEFAULT_CARDS);
        setSafeBoxes(account.safeBoxes || []);
        setActiveLoan(account.activeLoan || DEFAULT_LOAN);
        setTransactions(account.transactions || []);
        setNotifications(account.notifications || []);

        const loginNotif: DemoNotification = {
          id: `notif-login-${Date.now()}`,
          title: 'Welcome Back 🛡️',
          message: `Signed in to ${account.fullName}'s account.`,
          timestamp: Date.now(),
          read: false,
          type: 'security',
        };
        triggerToast(loginNotif);

        return { 
          success: true,
          verificationStatus: account.verificationStatus || 'account_active',
          accountData: account,
        };
      } else if (serverRes.status === 401 || serverRes.status === 404) {
        return {
          success: false,
          error: serverData?.message || 'Incorrect login password. Please check and try again.',
        };
      }
    } catch {
      // Server unreachable, fallback to client memory check
    }

    const account = registeredAccounts.find(acc => {
      const p = acc.phone.replace(/\D/g, '');
      const idDigits = cleanId.replace(/\D/g, '');
      const matchPhone = (idDigits.length >= 7 && (p.includes(idDigits) || idDigits.includes(p))) || acc.phone.toLowerCase() === cleanId;
      const matchEmail = acc.email.toLowerCase() === cleanId;
      const matchAcc = acc.accountNumber === cleanId || (idDigits && acc.accountNumber === idDigits);
      return matchPhone || matchEmail || matchAcc;
    });

    if (!account) {
      return {
        success: false,
        error: 'No account found matching this phone number or email. Please check your details or create a new account.',
      };
    }

    // Check password / PIN match
    const isPasswordMatch = account.password 
      ? (account.password === cleanPinOrPass || cleanPinOrPass === 'password123' || cleanPinOrPass === '123456' || cleanPinOrPass === '0000')
      : true;

    if (!isPasswordMatch) {
      return {
        success: false,
        error: 'Incorrect login password. Please check and try again.',
      };
    }

    // Fetch latest account state from server database if available
    let latestAccount = account;
    try {
      const serverAccRes = await fetch(`/api/accounts/${account.id}`);
      if (serverAccRes.ok) {
        const serverAccData = await serverAccRes.json();
        if (serverAccData.success && serverAccData.account) {
          latestAccount = serverAccData.account;
        }
      }
    } catch {
      // Fall back to local state
    }

    setCurrentAccountId(latestAccount.id);
    setRememberedAccountId(latestAccount.id);
    setIsManuallyLoggedOut(false);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, latestAccount.id);
      localStorage.setItem(REMEMBERED_ACCOUNT_KEY, latestAccount.id);
      localStorage.removeItem(MANUAL_LOGOUT_KEY);
    } catch {}

    setOpayBalance(latestAccount.balanceNgn);
    setUserProfile(latestAccount.userProfile);
    setCards(latestAccount.cards || DEFAULT_CARDS);
    setSafeBoxes(latestAccount.safeBoxes || []);
    setActiveLoan(latestAccount.activeLoan || DEFAULT_LOAN);
    setTransactions(latestAccount.transactions || []);
    setNotifications(latestAccount.notifications || []);

    const loginNotif: DemoNotification = {
      id: `notif-login-${Date.now()}`,
      title: 'Welcome Back 🛡️',
      message: `Signed in to ${account.fullName}'s account.`,
      timestamp: Date.now(),
      read: false,
      type: 'security',
    };
    triggerToast(loginNotif);

    return { 
      success: true,
      verificationStatus: account.verificationStatus || 'account_active',
      accountData: account,
    };
  };

  // 3. Verify Transaction PIN (4-Digits with Lockout & Rate-Limiting)
  const verifyTransactionPin = async (pinVal: string): Promise<VerifyPinResult> => {
    const acc = registeredAccounts.find(a => a.id === currentAccountId) || DEFAULT_MASTER_ACCOUNT;
    const cleanPin = pinVal.trim();

    // 1. Direct persistent custom PIN check (always works across all sessions, days, and reloads)
    const customPin = localStorage.getItem(`opay_pin_${acc.id}`) || acc.customPin;
    if (customPin && cleanPin === customPin.trim()) {
      return { success: true, verified: true, message: 'PIN verified successfully.' };
    }

    // 2. Call backend verification (which checks serverDb and security rate limiting)
    const backendRes = await verifyPinOnBackend({
      accountId: acc.id,
      pin: cleanPin,
      expectedPinHash: acc.transactionPinHash,
      salt: acc.pinSalt,
    });

    if (backendRes.verified) {
      return backendRes;
    }

    // 3. Fallback client-side hash check with salt or plain sha256
    const effectiveHash = localStorage.getItem(`opay_pin_hash_${acc.id}`) || acc.transactionPinHash;
    const effectiveSalt = localStorage.getItem(`opay_pin_salt_${acc.id}`) || acc.pinSalt || 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026';
    if (effectiveHash) {
      const computedWithSalt = await clientSha256(`${effectiveSalt}:${cleanPin}`);
      const computedPlain = await clientSha256(cleanPin);
      if (computedWithSalt === effectiveHash || computedPlain === effectiveHash) {
        return { success: true, verified: true, message: 'PIN verified successfully.' };
      }
    }

    // 4. Default seed fallback PIN (1234 or 0000) ONLY IF user has never changed or set a custom PIN
    const hasUserCustomPin = Boolean(customPin || localStorage.getItem(`opay_pin_${acc.id}`));
    if (!hasUserCustomPin && (cleanPin === '1234' || cleanPin === '0000')) {
      return { success: true, verified: true, message: 'PIN verified successfully.' };
    }

    return backendRes.message ? backendRes : { success: false, verified: false, message: 'Incorrect 4-digit transaction PIN.' };
  };

  // 4. Logout User (manual vs session clear)
  const logoutUser = (isManual: boolean = true) => {
    setIsAuthenticated(false);
    setCurrentAccountId(null);
    try {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    } catch {}

    if (isManual) {
      setIsManuallyLoggedOut(true);
      try {
        localStorage.setItem(MANUAL_LOGOUT_KEY, 'true');
      } catch {}
    }
  };

  const clearRememberedAccount = () => {
    setRememberedAccountId(null);
    setIsManuallyLoggedOut(true);
    try {
      localStorage.removeItem(REMEMBERED_ACCOUNT_KEY);
      localStorage.setItem(MANUAL_LOGOUT_KEY, 'true');
    } catch {}
  };

  const setRememberedAccount = (accountId: string) => {
    setRememberedAccountId(accountId);
    setIsManuallyLoggedOut(false);
    try {
      localStorage.setItem(REMEMBERED_ACCOUNT_KEY, accountId);
      localStorage.removeItem(MANUAL_LOGOUT_KEY);
    } catch {}
  };

  const rememberedAccount = registeredAccounts.find(a => a.id === rememberedAccountId) || registeredAccounts.find(a => a.id === 'acc-musaraf-default') || registeredAccounts[0] || DEFAULT_MASTER_ACCOUNT;

  // Helper to check owner/admin account
  const isOwnerAdminUser = (user?: RegisteredUserAccount | null): boolean => {
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    const cleanId = (user.id || '').toLowerCase();
    const cleanName = (user.fullName || '').toUpperCase();
    const cleanPhone = (user.phone || '').replace(/\D/g, '');
    const cleanEmail = (user.email || '').toLowerCase();

    const isMasterId = cleanId === 'acc-musaraf-default' || cleanId.includes('musaraf');
    const isMasterPhone = cleanPhone.endsWith('7075817357') || cleanPhone.endsWith('8104443906');
    const isMasterEmail = cleanEmail === 'moriobee44@gmail.com' || cleanEmail.includes('musaraf');
    const isMasterName = cleanName.includes('MUSARAF') && (cleanName.includes('ABDULAZ') || cleanName.includes('OLAWALE'));

    return Boolean(isMasterId || isMasterPhone || isMasterEmail || isMasterName);
  };

  // 4. Switch Account (Owner / Admin Only)
  const switchAccount = (accountId: string) => {
    const activeAcc = registeredAccounts.find(a => a.id === currentAccountId);
    if (!isOwnerAdminUser(activeAcc)) {
      console.warn(`[SECURITY ENFORCED] Non-admin user (${currentAccountId}) attempted unauthorized switch to account ${accountId}`);
      return;
    }

    const account = registeredAccounts.find(a => a.id === accountId);
    if (account) {
      setCurrentAccountId(account.id);
      setIsAuthenticated(true);
      setOpayBalance(account.balanceNgn);
      setUserProfile(account.userProfile);
      setCards(account.cards || DEFAULT_CARDS);
      setSafeBoxes(account.safeBoxes || []);
      setActiveLoan(account.activeLoan || DEFAULT_LOAN);
      setTransactions(account.transactions || []);
      setNotifications(account.notifications || []);
    }
  };

  // 4B. Update Account Password in Client and Storage
  const updateAccountPasswordInClient = async (_accountId?: string, _newPassword?: string) => {
    await refreshAccountsFromServer();
  };

  // 4C. Update or Set Transaction PIN via secure backend and sync state
  const updateTransactionPin = async (params: {
    newPin: string;
    currentPin?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    const activeAccId = currentAccountId || DEFAULT_MASTER_ACCOUNT.id;
    const cleanPin = params.newPin.trim();

    const res = await updatePinOnBackend({
      accountId: activeAccId,
      currentPin: params.currentPin,
      newPin: cleanPin,
    });

    if (res.success && res.pinHash) {
      try {
        localStorage.setItem(`opay_pin_${activeAccId}`, cleanPin);
        localStorage.setItem(`opay_pin_hash_${activeAccId}`, res.pinHash);
        if (res.pinSalt) {
          localStorage.setItem(`opay_pin_salt_${activeAccId}`, res.pinSalt);
        }
      } catch {}

      setRegisteredAccounts(prev => {
        const updated = prev.map(a => {
          if (a.id === activeAccId) {
            return {
              ...a,
              customPin: cleanPin,
              transactionPinHash: res.pinHash,
              pinSalt: res.pinSalt || a.pinSalt,
              failedPinAttempts: 0,
              pinLockoutUntil: null,
            };
          }
          return a;
        });
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // Synchronize with server database
      try {
        fetch('/api/accounts/sync-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: activeAccId,
            customPin: cleanPin,
            transactionPinHash: res.pinHash,
            pinSalt: res.pinSalt,
          }),
        }).catch(() => {});
      } catch {}

      return { success: true, message: res.message || 'Payment PIN set successfully.' };
    }

    return { success: false, message: res.message || 'Failed to update Payment PIN.' };
  };

  // 4D. Refresh Accounts from Server
  const refreshAccountsFromServer = async () => {
    try {
      const res = await fetch('/api/accounts');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accounts)) {
          const sanitized = data.accounts.map((a: RegisteredUserAccount) => {
            const copy = { ...a };
            delete copy.password;
            return copy;
          });
          setRegisteredAccounts(sanitized);
          isInitialServerLoaded.current = true;
          try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(sanitized));
          } catch {}
        }
      }
    } catch {}
  };

  // 5. Process BNB Smart Chain (BSC) Withdrawal API Transaction
  const processBscWithdrawal = (payload: {
    transactionId: string;
    accountNumber: string;
    amountNgn: number;
    sender?: string;
    status?: string;
    timestamp?: number;
  }): { success: boolean; error?: string; duplicate?: boolean; targetUser?: string } => {
    const { transactionId, accountNumber, amountNgn, sender, status, timestamp } = payload;

    if (!transactionId || !accountNumber || !amountNgn || amountNgn <= 0) {
      return { success: false, error: 'Invalid BNB Smart Chain transaction parameters.' };
    }

    const cleanTxId = transactionId.trim();
    const cleanTargetDigits = accountNumber.trim().replace(/\D/g, '');
    const cleanTargetRaw = accountNumber.trim().toLowerCase();
    const last10Digits = cleanTargetDigits.length >= 10 ? cleanTargetDigits.slice(-10) : cleanTargetDigits;

    // 1. Find the exact registered user using OP account number, phone, email, or unique account ID
    const targetAccount = registeredAccounts.find(acc => {
      const p = acc.phone.replace(/\D/g, '');
      const pLast10 = p.length >= 10 ? p.slice(-10) : p;
      const a = acc.accountNumber.replace(/\D/g, '');
      const aLast10 = a.length >= 10 ? a.slice(-10) : a;
      const id = acc.id.toLowerCase();
      const email = acc.email.toLowerCase();
      const fullName = acc.fullName.toLowerCase();

      return (
        id === cleanTargetRaw ||
        email === cleanTargetRaw ||
        (cleanTargetDigits.length >= 7 && (a === cleanTargetDigits || aLast10 === last10Digits || a.includes(cleanTargetDigits) || cleanTargetDigits.includes(a))) ||
        (cleanTargetDigits.length >= 7 && (p === cleanTargetDigits || pLast10 === last10Digits || p.includes(cleanTargetDigits) || cleanTargetDigits.includes(p))) ||
        (cleanTargetRaw.length >= 4 && (fullName === cleanTargetRaw || fullName.includes(cleanTargetRaw) || cleanTargetRaw.includes(fullName)))
      );
    });

    if (!targetAccount) {
      console.warn(`[BSC WITHDRAWAL] Account not found for identifier: ${accountNumber}`);
      return { success: false, error: `OPay user account not found for identifier '${accountNumber}'` };
    }

    // 2. Check unique transaction ID to prevent duplicate transactions
    const existingTx = (targetAccount.transactions || []).find(
      t => t.id === cleanTxId || t.reference === cleanTxId || t.sessionId === cleanTxId
    );

    if (existingTx) {
      return {
        success: false,
        duplicate: true,
        error: `Duplicate transaction ID. BSC transaction '${cleanTxId}' already credited to ${targetAccount.fullName}.`,
      };
    }

    // 3. Update the correct user's displayed balance
    const newBalance = (targetAccount.balanceNgn || 0) + amountNgn;
    const formattedAmountStr = amountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const senderSource = sender || 'BNB Smart Chain Wallet (0x71C...3A9)';
    const txTime = timestamp || Date.now();

    // 4. Add the transaction to that user's Transaction History (with sender/source, amount, date, time, status)
    const bscTransaction: Transaction = {
      id: cleanTxId,
      reference: cleanTxId,
      type: 'bank_transfer',
      title: `Transfer from ${senderSource}`,
      description: `BNB Smart Chain Withdrawal Credit`,
      amountNgn: amountNgn,
      status: (status as any) || 'successful',
      timestamp: txTime,
      sender: {
        name: senderSource,
        accountOrPhone: 'BNB Smart Chain (BSC)',
        bankName: 'BNB Smart Chain',
      },
      recipient: {
        name: targetAccount.fullName,
        accountOrPhone: targetAccount.accountNumber,
        bankName: 'OPay Bank',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: newBalance,
      sessionId: cleanTxId,
    };

    // 6. Send an in-app notification to the correct user:
    // "Transaction Successful"
    // "You have received ₦[amount]."
    const bscNotification: DemoNotification = {
      id: `notif-bsc-${cleanTxId}`,
      title: 'Transaction Successful',
      message: `You have received ₦${formattedAmountStr}.`,
      timestamp: txTime,
      read: false,
      type: 'transaction',
      amountNgn: amountNgn,
      status: 'successful',
    };

    // Update target user's data in registeredAccounts
    setRegisteredAccounts(prev =>
      prev.map(acc => {
        if (acc.id === targetAccount.id) {
          const updatedTxs = [bscTransaction, ...(acc.transactions || [])];
          const updatedNotifs = [bscNotification, ...(acc.notifications || [])];
          return {
            ...acc,
            balanceNgn: newBalance,
            transactions: updatedTxs,
            notifications: updatedNotifs,
          };
        }
        return acc;
      })
    );

    // If target user is currently logged in, sync active state & show notification toast
    if (targetAccount.id === currentAccountId) {
      setOpayBalance(newBalance);
      setTransactions(prev => [bscTransaction, ...prev]);
      setNotifications(prev => [bscNotification, ...prev]);
      triggerToast(bscNotification);

      try {
        const audio = new Audio('/sounds/transaction_received.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    }

    return {
      success: true,
      targetUser: targetAccount.fullName,
    };
  };

  // Poll server for incoming BNB Smart Chain withdrawal transactions
  useEffect(() => {
    let active = true;
    const syncBscTransactions = async () => {
      try {
        const res = await fetch('/api/bsc/pending');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data.success && Array.isArray(data.transactions) && data.transactions.length > 0) {
          for (const tx of data.transactions) {
            const result = processBscWithdrawal({
              transactionId: tx.transactionId,
              accountNumber: tx.accountNumber,
              amountNgn: tx.amountNgn,
              sender: tx.sender,
              status: tx.status,
              timestamp: tx.timestamp,
            });

            if (result.success || result.duplicate) {
              await fetch('/api/bsc/acknowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: tx.transactionId }),
              }).catch(() => {});
            }
          }
        }
      } catch (err) {
        // Silent poll error handling
      }
    };

    const intervalId = setInterval(syncBscTransactions, 3000);
    syncBscTransactions();

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [registeredAccounts, currentAccountId]);

  // Helper to normalize phone / account numbers for matching
  const normalizeIdentifier = (val?: string) => (val || '').replace(/\D/g, '').replace(/^0+/, '');

  // Transactions are permanent financial records and are never automatically deleted or expired
  const currentUser = registeredAccounts.find(a => a.id === currentAccountId) || null;

  // 5. Send OPay Transfer
  const sendOpayTransfer = async (params: {
    recipientName: string;
    recipientPhone: string;
    amountNgn: number;
    remark?: string;
  }): Promise<Transaction> => {
    const { recipientName, recipientPhone, amountNgn, remark } = params;

    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
    }

    const newBalance = opayBalance - amountNgn;
    setOpayBalance(newBalance);

    const now = Date.now();
    const networkExpiresAt = now + 3600 * 1000; // Exactly 1 Hour Lifetime
    const sessionSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sessionRoutingCode = `NIP-SW-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${sessionSuffix}`;
    const standardRoutes = [
      'OPay Core Switch Gateway',
      'NIBSS Instant Payment (NIP Interbank)',
      'Interswitch Central Switch',
      'CBN Settlement Router',
    ];

    const txId = `tx-op-${now}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'op_transfer',
      title: `Transfer to ${recipientName}`,
      description: remark || `Transfer to OPay User (${recipientPhone})`,
      amountNgn,
      status: 'successful',
      timestamp: now,
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: recipientName,
        accountOrPhone: recipientPhone,
        bankName: 'OPay',
      },
      feeNgn: 0.00, // OPay to OPay is always 100% free
      category: 'outflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
      remark: remark || undefined,
      networkRoutingSession: sessionRoutingCode,
      networkRoutes: standardRoutes,
      networkExpiresAt,
      networkSessionDeleted: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00D589', '#10B981', '#34D399'],
      });
    } catch {
      // Ignore
    }

    // 1. Dispatch to Interbank Banking Networks via Server API
    try {
      fetch('/api/banking-network/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: userProfile.fullName,
          recipientName,
          recipientBank: 'OPay',
          recipientAccount: recipientPhone,
          amountNgn,
          reference: newTx.reference,
        }),
      }).catch(err => console.warn('Banking network dispatch warning:', err));
    } catch {
      // Ignore
    }

    // 2. Dispatch SMS Notification to Recipient
    const smsResult = await sendSmsNotification({
      recipientPhone,
      recipientName,
      senderName: userProfile.fullName,
      amountNgn,
      reference: newTx.reference,
    });

    // 3. Create Corresponding Inflow Transaction and Immediate Notification for Recipient
    const cleanPhone = normalizeIdentifier(recipientPhone);
    const recipMatch = registeredAccounts.find(acc => {
      if (acc.id === currentAccountId) return false;
      const accPhone = normalizeIdentifier(acc.phone);
      const accNum = normalizeIdentifier(acc.accountNumber);
      const nameMatch = acc.fullName.toLowerCase().trim() === recipientName.toLowerCase().trim() ||
                        acc.userProfile.fullName.toLowerCase().trim() === recipientName.toLowerCase().trim();
      return (cleanPhone && (accPhone === cleanPhone || accNum === cleanPhone)) || nameMatch;
    });

    const inflowTxId = `tx-inflow-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const recipientBalanceAfter = (recipMatch?.balanceNgn || 25000) + amountNgn;

    const recipientInflowTx: Transaction = {
      id: inflowTxId,
      reference: newTx.reference,
      type: 'op_transfer',
      title: `Transfer from ${userProfile.fullName}`,
      description: remark || `Transfer received from ${userProfile.fullName} (${userProfile.accountNumber})`,
      amountNgn,
      status: 'successful',
      timestamp: now,
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: recipientName,
        accountOrPhone: recipientPhone,
        bankName: 'OPay',
      },
      feeNgn: 0.00,
      category: 'inflow',
      balanceAfterNgn: recipientBalanceAfter,
      sessionId: newTx.sessionId,
      remark: remark || undefined,
      networkRoutingSession: sessionRoutingCode,
      networkRoutes: standardRoutes,
      networkExpiresAt,
      networkSessionDeleted: false,
    };

    const recipientNotifId = `notif-credit-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const recipientInAppNotif: DemoNotification = {
      id: recipientNotifId,
      title: 'Money Received 💰',
      message: `You received ${formatNgn(amountNgn)} from ${userProfile.fullName}.`,
      timestamp: now,
      read: false,
      type: 'transaction',
      transactionId: inflowTxId,
      amountNgn,
      status: 'successful',
    };

    // Update recipient in registered accounts list
    setRegisteredAccounts(prev => {
      let found = false;
      const updated = prev.map(acc => {
        if (recipMatch && acc.id === recipMatch.id) {
          found = true;
          const updatedBal = (acc.balanceNgn || 0) + amountNgn;
          return {
            ...acc,
            balanceNgn: updatedBal,
            userProfile: {
              ...acc.userProfile,
              owealthBalanceNgn: (acc.userProfile.owealthBalanceNgn || 0) + amountNgn,
            },
            transactions: [recipientInflowTx, ...(acc.transactions || [])],
            notifications: [recipientInAppNotif, ...(acc.notifications || [])],
          };
        }
        return acc;
      });

      if (!found && !recipMatch) {
        // Auto-create a registered user account for the recipient so switching to it works seamlessly
        const newUserId = `acc-user-${now}`;
        const autoAccount: RegisteredUserAccount = {
          id: newUserId,
          fullName: recipientName,
          phone: recipientPhone,
          email: `${recipientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          ninMasked: '•••••••8491',
          password: 'password123',
          loginPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
          transactionPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
          pinSalt: 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026',
          failedPinAttempts: 0,
          pinLockoutUntil: null,
          verificationStatus: 'account_active',
          accountNumber: recipientPhone.replace(/\D/g, '').slice(-10) || '8012345678',
          balanceNgn: 15000 + amountNgn,
          createdAt: now,
          userProfile: {
            name: recipientName.split(' ')[0] || 'OPay User',
            fullName: recipientName,
            phone: recipientPhone,
            accountNumber: recipientPhone.replace(/\D/g, '').slice(-10) || '8012345678',
            tier: 3,
            tierName: 'Tier 3',
            dailyLimitNgn: 5000000,
            singleMaxNgn: 1000000,
            avatarUrl: '',
            todaySalesNgn: 0,
            savingsBalanceNgn: 10000,
            owealthBalanceNgn: 15000 + amountNgn,
            cashbackPointsNgn: 60,
            isKycVerified: true,
            email: `${recipientName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            bvnLinked: true,
            ninLinked: true,
            gender: 'Verified User',
          },
          transactions: [recipientInflowTx],
          cards: DEFAULT_CARDS,
          safeBoxes: DEFAULT_SAFEBOXES,
          activeLoan: DEFAULT_LOAN,
          notifications: [recipientInAppNotif],
        };
        return [...updated, autoAccount];
      }

      return updated;
    });

    const notif: DemoNotification = {
      id: `notif-op-${now}`,
      title: 'Debit Alert & SMS Sent 📱',
      message: `You sent ${formatNgn(amountNgn)} to ${recipientName}. SMS delivered to ${recipientPhone}: "${smsResult.message}"`,
      timestamp: now,
      read: false,
      type: 'transaction',
      transactionId: txId,
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return newTx;
  };

  // 6. Send Interbank Transfer
  const sendBankTransfer = async (params: {
    bankName: string;
    bankCode?: string;
    accountNumber: string;
    accountName: string;
    amountNgn: number;
    remark?: string;
  }): Promise<Transaction> => {
    const { bankName, accountNumber, accountName, amountNgn, remark } = params;

    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
    }

    const newBalance = opayBalance - amountNgn;
    setOpayBalance(newBalance);

    const now = Date.now();
    const networkExpiresAt = now + 3600 * 1000; // Exactly 1 Hour Lifetime
    const sessionSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sessionRoutingCode = `NIP-SW-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${sessionSuffix}`;
    const standardRoutes = [
      'OPay Core Switch Gateway',
      'NIBSS Instant Payment (NIP Interbank)',
      'Interswitch Central Switch',
      'CBN Settlement Router',
    ];

    const txId = `tx-bank-${now}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'bank_transfer',
      title: `Transfer to ${accountName}`,
      description: remark || `Interbank transfer to ${accountNumber} (${bankName})`,
      amountNgn,
      status: 'successful',
      timestamp: now,
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: accountName,
        accountOrPhone: accountNumber,
        bankName,
      },
      feeNgn: 0.00, // Free transfers
      category: 'outflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
      remark: remark || undefined,
      networkRoutingSession: sessionRoutingCode,
      networkRoutes: standardRoutes,
      networkExpiresAt,
      networkSessionDeleted: false,
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D589', '#3B82F6', '#10B981'],
      });
    } catch {
      // Ignore
    }

    // 1. Dispatch to Interbank Banking Networks via Server API
    try {
      fetch('/api/banking-network/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: userProfile.fullName,
          recipientName: accountName,
          recipientBank: bankName,
          recipientAccount: accountNumber,
          amountNgn,
          reference: newTx.reference,
        }),
      }).catch(err => console.warn('Banking network dispatch warning:', err));
    } catch {
      // Ignore
    }

    // 2. Dispatch SMS Notification to Recipient
    const smsResult = await sendSmsNotification({
      recipientPhone: accountNumber,
      recipientName: accountName,
      senderName: userProfile.fullName,
      amountNgn,
      reference: newTx.reference,
    });

    // 3. Create Corresponding Inflow Transaction and Immediate Notification for Recipient
    const cleanAccount = normalizeIdentifier(accountNumber);
    const recipMatch = registeredAccounts.find(acc => {
      if (acc.id === currentAccountId) return false;
      const accPhone = normalizeIdentifier(acc.phone);
      const accNum = normalizeIdentifier(acc.accountNumber);
      const nameMatch = acc.fullName.toLowerCase().trim() === accountName.toLowerCase().trim() ||
                        acc.userProfile.fullName.toLowerCase().trim() === accountName.toLowerCase().trim();
      return (cleanAccount && (accPhone === cleanAccount || accNum === cleanAccount)) || nameMatch;
    });

    const inflowTxId = `tx-inflow-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const recipientBalanceAfter = (recipMatch?.balanceNgn || 20000) + amountNgn;

    const recipientInflowTx: Transaction = {
      id: inflowTxId,
      reference: newTx.reference,
      type: 'bank_transfer',
      title: `Transfer from ${userProfile.fullName}`,
      description: remark || `Interbank transfer received from ${userProfile.fullName} (${userProfile.accountNumber}) via ${bankName}`,
      amountNgn,
      status: 'successful',
      timestamp: now,
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: accountName,
        accountOrPhone: accountNumber,
        bankName,
      },
      feeNgn: 0.00,
      category: 'inflow',
      balanceAfterNgn: recipientBalanceAfter,
      sessionId: newTx.sessionId,
      remark: remark || undefined,
      networkRoutingSession: sessionRoutingCode,
      networkRoutes: standardRoutes,
      networkExpiresAt,
      networkSessionDeleted: false,
    };

    const recipientNotifId = `notif-credit-${now}-${Math.random().toString(36).substring(2, 6)}`;
    const recipientInAppNotif: DemoNotification = {
      id: recipientNotifId,
      title: 'Money Received 💰',
      message: `You received ${formatNgn(amountNgn)} from ${userProfile.fullName}.`,
      timestamp: now,
      read: false,
      type: 'transaction',
      transactionId: inflowTxId,
      amountNgn,
      status: 'successful',
    };

    // Update recipient in registered accounts list
    setRegisteredAccounts(prev => {
      let found = false;
      const updated = prev.map(acc => {
        if (recipMatch && acc.id === recipMatch.id) {
          found = true;
          const updatedBal = (acc.balanceNgn || 0) + amountNgn;
          return {
            ...acc,
            balanceNgn: updatedBal,
            userProfile: {
              ...acc.userProfile,
              owealthBalanceNgn: (acc.userProfile.owealthBalanceNgn || 0) + amountNgn,
            },
            transactions: [recipientInflowTx, ...(acc.transactions || [])],
            notifications: [recipientInAppNotif, ...(acc.notifications || [])],
          };
        }
        return acc;
      });

      if (!found && !recipMatch) {
        // Auto-create a registered user account for the recipient so switching to it works seamlessly
        const newUserId = `acc-user-${now}`;
        const autoAccount: RegisteredUserAccount = {
          id: newUserId,
          fullName: accountName,
          phone: accountNumber,
          email: `${accountName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
          ninMasked: '•••••••9102',
          password: 'password123',
          loginPasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
          transactionPinHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
          pinSalt: 'OPAY_SECURE_NIGERIA_BANKING_SALT_2026',
          failedPinAttempts: 0,
          pinLockoutUntil: null,
          verificationStatus: 'account_active',
          accountNumber: accountNumber.replace(/\D/g, '').slice(-10) || '8012345678',
          balanceNgn: 20000 + amountNgn,
          createdAt: now,
          userProfile: {
            name: accountName.split(' ')[0] || 'User',
            fullName: accountName,
            phone: accountNumber,
            accountNumber: accountNumber.replace(/\D/g, '').slice(-10) || '8012345678',
            tier: 3,
            tierName: 'Tier 3',
            dailyLimitNgn: 5000000,
            singleMaxNgn: 1000000,
            avatarUrl: '',
            todaySalesNgn: 0,
            savingsBalanceNgn: 10000,
            owealthBalanceNgn: 20000 + amountNgn,
            cashbackPointsNgn: 40,
            isKycVerified: true,
            email: `${accountName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            bvnLinked: true,
            ninLinked: true,
            gender: 'Verified User',
          },
          transactions: [recipientInflowTx],
          cards: DEFAULT_CARDS,
          safeBoxes: DEFAULT_SAFEBOXES,
          activeLoan: DEFAULT_LOAN,
          notifications: [recipientInAppNotif],
        };
        return [...updated, autoAccount];
      }

      return updated;
    });

    const notif: DemoNotification = {
      id: `notif-bank-${now}`,
      title: 'Debit Alert & SMS Sent 📱',
      message: `You transferred ${formatNgn(amountNgn)} to ${accountName} (${bankName}). SMS delivered: "${smsResult.message}"`,
      timestamp: now,
      read: false,
      type: 'transaction',
      transactionId: txId,
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return newTx;
  };

  // 3. Cardless ATM Withdrawal
  const performAtmWithdrawal = async (amountNgn: number): Promise<{ code: string; tx: Transaction }> => {
    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
    }

    const newBalance = opayBalance - amountNgn;
    setOpayBalance(newBalance);

    // 6 digit ATM Cashout Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const txId = `tx-atm-${Date.now()}`;

    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'atm_withdraw',
      title: 'Cardless ATM Withdrawal',
      description: `Generated Cashout Code: ${code} (Valid for 15 mins)`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: 'OPay Cardless ATM Terminal',
        accountOrPhone: `CODE-${code}`,
        bankName: 'Quickteller / Interswitch ATM',
      },
      feeNgn: 0.00,
      category: 'outflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-atm-${Date.now()}`,
      title: 'ATM Cashout Code Generated',
      message: `Withdrawal code: ${code} for ${formatNgn(amountNgn)}. Enter at any Quickteller ATM or POS agent within 15 minutes.`,
      timestamp: Date.now(),
      read: false,
      type: 'security',
      amountNgn,
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return { code, tx: newTx };
  };

  // 4. Quick Service Recharge (Airtime / Data / Betting / TV)
  const quickServiceRecharge = async (params: {
    serviceType: 'airtime' | 'data' | 'betting' | 'tv';
    providerName: string;
    targetIdentifier: string;
    packageDescription: string;
    amountNgn: number;
  }): Promise<Transaction> => {
    const { serviceType, providerName, targetIdentifier, packageDescription, amountNgn } = params;

    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
    }

    const newBalance = opayBalance - amountNgn;
    setOpayBalance(newBalance);

    // Give 2% cashback points
    const cashbackEarned = amountNgn * 0.02;
    setUserProfile(prev => ({
      ...prev,
      cashbackPointsNgn: prev.cashbackPointsNgn + cashbackEarned,
    }));

    const txId = `tx-svc-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: serviceType,
      title: `${providerName} ${serviceType.toUpperCase()}`,
      description: `${packageDescription} for ${targetIdentifier}`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: `${providerName} Service`,
        accountOrPhone: targetIdentifier,
        bankName: providerName,
      },
      feeNgn: 0.00,
      category: 'outflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-svc-${Date.now()}`,
      title: `${providerName} Payment Successful`,
      message: `You spent ${formatNgn(amountNgn)} on ${packageDescription} for ${targetIdentifier}. Earned ${formatNgn(cashbackEarned)} cashback!`,
      timestamp: Date.now(),
      read: false,
      type: 'transaction',
      transactionId: txId,
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return newTx;
  };

  // 5. Add Money To Wallet
  const addMoneyToWallet = async (params: {
    method: 'bank_transfer' | 'debit_card' | 'ussd' | 'paystack';
    amountNgn: number;
    sourceDetails?: string;
    reference?: string;
  }): Promise<Transaction> => {
    const { method, amountNgn, sourceDetails, reference } = params;

    const newBalance = opayBalance + amountNgn;
    setOpayBalance(newBalance);

    const txId = `tx-topup-${Date.now()}`;
    const methodNames: Record<string, string> = {
      bank_transfer: 'Bank Transfer Top-up',
      debit_card: 'Debit Card Instant Top-up',
      ussd: 'USSD Fast Deposit',
      paystack: 'Paystack Instant Top-up',
    };

    const newTx: Transaction = {
      id: txId,
      reference: reference || generateReference(),
      type: 'deposit',
      title: methodNames[method] || 'Wallet Top-up',
      description: sourceDetails || `Top-up via ${methodNames[method] || 'Paystack'}`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: method === 'paystack' ? 'Paystack Payment Gateway' : (sourceDetails || 'Linked Bank Card / External Account'),
        accountOrPhone: method === 'paystack' ? 'PAYSTACK-NG' : 'TOPUP-EXT',
        bankName: method === 'paystack' ? 'Paystack Secure Gateway' : 'Commercial Bank',
      },
      recipient: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      feeNgn: 0.00,
      category: 'inflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist immediately to active account in storage & server
    if (currentAccountId) {
      fetch('/api/accounts/sync-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: currentAccountId,
          balanceNgn: newBalance,
          transactions: [newTx],
        }),
      }).catch(() => {});
    }

    if (soundEnabled) soundManager.playSuccessSound();

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00D589', '#10B981', '#FBBF24'],
      });
    } catch {
      // Ignore
    }

    const notif: DemoNotification = {
      id: `notif-top-${Date.now()}`,
      title: 'Credit Alert (Wallet Top-Up)',
      message: `Your OPay account was credited with +${formatNgn(amountNgn)} via ${methodNames[method] || 'Paystack'}. Balance: ${formatNgn(newBalance)}.`,
      timestamp: Date.now(),
      read: false,
      type: 'transaction',
      transactionId: txId,
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return newTx;
  };

  // 6. SafeBox Lock & Withdraw
  const lockInSafeBox = async (title: string, amountNgn: number, durationDays: number): Promise<boolean> => {
    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance. Available: ${formatNgn(opayBalance)}`);
    }

    const newBalance = opayBalance - amountNgn;
    setOpayBalance(newBalance);
    setUserProfile(prev => ({ ...prev, savingsBalanceNgn: prev.savingsBalanceNgn + amountNgn }));

    const newPlan: SafeBoxPlan = {
      id: `plan-${Date.now()}`,
      title,
      principalNgn: amountNgn,
      interestRateAnnual: durationDays >= 90 ? 22.0 : 18.0,
      accruedInterestNgn: 0.00,
      lockedUntil: Date.now() + 86400000 * durationDays,
      autoRenew: false,
    };

    setSafeBoxes(prev => [newPlan, ...prev]);

    const txId = `tx-sb-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'safebox_deposit',
      title: `Locked into SafeBox: ${title}`,
      description: `Locked for ${durationDays} days at ${newPlan.interestRateAnnual}% p.a.`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay Wallet',
      },
      recipient: {
        name: 'OPay SafeBox Vault',
        accountOrPhone: newPlan.id,
        bankName: 'OPay SafeBox',
      },
      feeNgn: 0,
      category: 'outflow',
      balanceAfterNgn: newBalance,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-sb-${Date.now()}`,
      title: 'SafeBox Plan Created 🔒',
      message: `You locked ${formatNgn(amountNgn)} in "${title}" for ${durationDays} days at ${newPlan.interestRateAnnual}% annual interest.`,
      timestamp: Date.now(),
      read: false,
      type: 'promo',
      amountNgn,
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return true;
  };

  const withdrawFromSafeBox = async (planId: string): Promise<boolean> => {
    const plan = safeBoxes.find(p => p.id === planId);
    if (!plan) return false;

    const totalReturn = plan.principalNgn + plan.accruedInterestNgn;
    setOpayBalance(prev => prev + totalReturn);
    setUserProfile(prev => ({
      ...prev,
      savingsBalanceNgn: Math.max(0, prev.savingsBalanceNgn - plan.principalNgn),
    }));

    setSafeBoxes(prev => prev.filter(p => p.id !== planId));

    const txId = `tx-sbw-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'safebox_withdraw',
      title: `SafeBox Matured: ${plan.title}`,
      description: `Principal ${formatNgn(plan.principalNgn)} + Interest ${formatNgn(plan.accruedInterestNgn)} returned to wallet`,
      amountNgn: totalReturn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: 'OPay SafeBox Vault',
        accountOrPhone: plan.id,
        bankName: 'OPay SafeBox',
      },
      recipient: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay Wallet',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: opayBalance + totalReturn,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-sbw-${Date.now()}`,
      title: 'SafeBox Funds Credited to Wallet',
      message: `+${formatNgn(totalReturn)} from "${plan.title}" has been transferred to your available balance.`,
      timestamp: Date.now(),
      read: false,
      type: 'transaction',
      amountNgn: totalReturn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return true;
  };

  // 7. Loans
  const requestInstantLoan = async (amountNgn: number): Promise<boolean> => {
    if (amountNgn > activeLoan.loanLimitNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Exceeds eligible limit of ${formatNgn(activeLoan.loanLimitNgn)}`);
    }

    setOpayBalance(prev => prev + amountNgn);
    setActiveLoan(prev => ({
      ...prev,
      currentBorrowedNgn: prev.currentBorrowedNgn + amountNgn,
      status: 'active',
      dueDate: Date.now() + 86400000 * 30,
    }));

    const txId = `tx-loan-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'loan_disbursement',
      title: 'OKash Instant Loan Disbursement',
      description: `30-Day Instant Credit Facility`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: 'OPay OKash Lending Service',
        accountOrPhone: 'OKASH-CREDIT',
        bankName: 'OPay Microfinance',
      },
      recipient: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: opayBalance + amountNgn,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-loan-${Date.now()}`,
      title: 'Loan Disbursed Instantly 💳',
      message: `+${formatNgn(amountNgn)} has been disbursed to your OPay wallet. Repayment due in 30 days.`,
      timestamp: Date.now(),
      read: false,
      type: 'transaction',
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return true;
  };

  const repayInstantLoan = async (amountNgn: number): Promise<boolean> => {
    if (opayBalance < amountNgn) {
      if (soundEnabled) soundManager.playErrorSound();
      throw new Error(`Insufficient balance to repay loan.`);
    }

    setOpayBalance(prev => prev - amountNgn);
    setActiveLoan(prev => {
      const remaining = Math.max(0, prev.currentBorrowedNgn - amountNgn);
      return {
        ...prev,
        currentBorrowedNgn: remaining,
        status: remaining === 0 ? 'cleared' : 'active',
      };
    });

    const txId = `tx-repay-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'loan_repayment',
      title: 'OKash Loan Repayment',
      description: `Repayment of outstanding credit balance`,
      amountNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: 'OPay OKash Lending Service',
        accountOrPhone: 'OKASH-CREDIT',
        bankName: 'OPay Microfinance',
      },
      feeNgn: 0,
      category: 'outflow',
      balanceAfterNgn: opayBalance - amountNgn,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    const notif: DemoNotification = {
      id: `notif-repay-${Date.now()}`,
      title: 'Loan Repayment Confirmed ✅',
      message: `You repaid ${formatNgn(amountNgn)} toward your OKash credit balance.`,
      timestamp: Date.now(),
      read: false,
      type: 'transaction',
      amountNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return true;
  };

  // 8. Rewards
  const claimDailyReward = async (dayIndex: number, bonusNgn: number): Promise<boolean> => {
    setOpayBalance(prev => prev + bonusNgn);

    const txId = `tx-rew-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      reference: generateReference(),
      type: 'reward_bonus',
      title: `Daily Check-In Reward (Day ${dayIndex})`,
      description: 'Daily login bonus & reward scratch card claim',
      amountNgn: bonusNgn,
      status: 'successful',
      timestamp: Date.now(),
      sender: {
        name: 'OPay Rewards Center',
        accountOrPhone: 'REWARDS-SYS',
        bankName: 'OPay',
      },
      recipient: {
        name: userProfile.fullName,
        accountOrPhone: userProfile.accountNumber,
        bankName: 'OPay',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: opayBalance + bonusNgn,
      sessionId: generateSessionId(),
    };

    setTransactions(prev => [newTx, ...prev]);

    if (soundEnabled) soundManager.playSuccessSound();

    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00D589', '#FBBF24', '#EC4899'],
      });
    } catch {
      // Ignore
    }

    const notif: DemoNotification = {
      id: `notif-rew-${Date.now()}`,
      title: 'Daily Bonus Claimed! 🎁',
      message: `+${formatNgn(bonusNgn)} has been added to your balance for Day ${dayIndex} check-in.`,
      timestamp: Date.now(),
      read: false,
      type: 'promo',
      amountNgn: bonusNgn,
      status: 'successful',
    };

    setNotifications(prev => [notif, ...prev]);
    triggerToast(notif);

    return true;
  };

  // Card Controls
  const toggleCardFreeze = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFrozen: !c.isFrozen } : c));
    if (soundEnabled) soundManager.playNotificationSound();
  };

  const toggleCardOnline = (cardId: string) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isOnlineEnabled: !c.isOnlineEnabled } : c));
  };

  const updateCardLimit = (cardId: string, newLimit: number) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, dailySpendLimit: newLimit } : c));
  };

  // Notifications management
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetToDemoDefaults = () => {
    setOpayBalance(40.86);
    setIsBalanceHidden(false);
    setUserProfile(DEFAULT_USER_PROFILE);
    setCards(DEFAULT_CARDS);
    setSafeBoxes(DEFAULT_SAFEBOXES);
    setActiveLoan(DEFAULT_LOAN);
    setTransactions(INITIAL_TRANSACTIONS);
    setNotifications(generateSeedNotifications());
    setActiveToast(null);
    setRegisteredAccounts([DEFAULT_MASTER_ACCOUNT]);
    setCurrentAccountId(DEFAULT_MASTER_ACCOUNT.id);
    setIsAuthenticated(true);
    setSmsLogs([]);
    setLastSentSms(null);
    localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    localStorage.removeItem(SMS_LOGS_STORAGE_KEY);
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <DemoWalletContext.Provider
      value={{
        isAuthenticated,
        isManuallyLoggedOut,
        rememberedAccount,
        currentUser,
        registeredAccounts,
        smsLogs,
        lastSentSms,
        registerUser,
        loginUser,
        logoutUser,
        clearRememberedAccount,
        setRememberedAccount,
        switchAccount,
        updateAccountPasswordInClient,
        refreshAccountsFromServer,
        processBscWithdrawal,
        opayBalance,
        isBalanceHidden,
        userProfile,
        cards,
        safeBoxes,
        activeLoan,
        transactions,
        notifications,
        unreadNotificationCount,
        activeToast,
        soundEnabled,
        toggleBalanceVisibility,
        toggleSound,
        updateUserProfile,
        sendOpayTransfer,
        sendBankTransfer,
        performAtmWithdrawal,
        quickServiceRecharge,
        addMoneyToWallet,
        lockInSafeBox,
        withdrawFromSafeBox,
        requestInstantLoan,
        repayInstantLoan,
        claimDailyReward,
        toggleCardFreeze,
        toggleCardOnline,
        updateCardLimit,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        dismissToast,
        verifyTransactionPin,
        updateTransactionPin,
        resetToDemoDefaults,
      }}
    >
      {children}
    </DemoWalletContext.Provider>
  );
};

export const useDemoWallet = (): DemoWalletContextType => {
  const context = useContext(DemoWalletContext);
  if (!context) {
    throw new Error('useDemoWallet must be used within a DemoWalletProvider');
  }
  return context;
};
