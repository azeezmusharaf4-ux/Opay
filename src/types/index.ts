export type TransactionStatus = 'pending' | 'processing' | 'successful' | 'failed';

export type TransactionType = 
  | 'op_transfer'        // Transfer to OPay user
  | 'bank_transfer'      // Transfer to Other Nigerian Bank
  | 'deposit'            // Add money / Top up
  | 'atm_withdraw'       // ATM / POS Cardless Cashout
  | 'withdraw'           // Levy / Charge / Withdrawal
  | 'airtime'            // Airtime recharge
  | 'data'               // Mobile data bundle
  | 'betting'            // Sports betting wallet funding
  | 'tv'                 // TV subscription
  | 'safebox_deposit'    // SafeBox lock deposit
  | 'safebox_withdraw'   // SafeBox withdrawal to wallet
  | 'loan_disbursement'  // Instant loan payout
  | 'loan_repayment'     // Loan repayment
  | 'reward_bonus'       // Daily bonus / referral cash
  | 'card_payment';      // OPay Debit Card spend

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  title: string;
  description: string;
  amountNgn: number;
  status: TransactionStatus;
  timestamp: number;
  sender: {
    name: string;
    accountOrPhone: string;
    bankName?: string;
  };
  recipient: {
    name: string;
    accountOrPhone: string;
    bankName?: string;
  };
  feeNgn: number;
  failureReason?: string;
  category: 'inflow' | 'outflow';
  balanceAfterNgn?: number;
  sessionId?: string;
  remark?: string;
  networkRoutingSession?: string;
  networkRoutes?: string[];
  networkExpiresAt?: number;
  networkSessionDeleted?: boolean;
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'transaction' | 'system' | 'security' | 'promo';
  transactionId?: string;
  amountNgn?: number;
  status?: TransactionStatus;
}

export interface OPayUserProfile {
  name: string;
  fullName: string;
  phone: string;
  accountNumber: string;
  tier: number;
  tierName: string;
  dailyLimitNgn: number;
  singleMaxNgn: number;
  avatarUrl: string;
  todaySalesNgn: number;
  savingsBalanceNgn: number;
  owealthBalanceNgn: number;
  cashbackPointsNgn: number;
  isKycVerified: boolean;
  email: string;
  bvnLinked: boolean;
  ninLinked: boolean;
  role?: 'owner' | 'admin' | 'user';
  nickname?: string;
  gender?: string;
  dob?: string;
  address?: string;
}

export interface OPayDebitCard {
  id: string;
  cardType: 'Virtual Visa' | 'Physical Verve';
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  isFrozen: boolean;
  isOnlineEnabled: boolean;
  isAtmEnabled: boolean;
  isPosEnabled: boolean;
  dailySpendLimit: number;
  colorTheme: 'teal' | 'gold' | 'black';
}

export interface SafeBoxPlan {
  id: string;
  title: string;
  principalNgn: number;
  interestRateAnnual: number;
  accruedInterestNgn: number;
  lockedUntil: number;
  autoRenew: boolean;
}

export interface ActiveLoan {
  loanLimitNgn: number;
  currentBorrowedNgn: number;
  dueDate: number;
  dailyInterestPercent: number;
  status: 'eligible' | 'active' | 'cleared';
}

export type VerificationStatus = 
  | 'registration_started'
  | 'identity_pending'
  | 'face_liveness_pending'
  | 'verification_successful'
  | 'verification_failed'
  | 'account_active';

export interface VerificationAuditLog {
  ninVerifiedAt?: number;
  ninMasked?: string;
  ninToken?: string;
  faceVerifiedAt?: number;
  livenessScore?: number;
  facialMatchScore?: number;
  auditReference?: string;
  provider?: string;
  failureReason?: string;
}

export interface SmsNotificationLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  senderName: string;
  amountNgn: number;
  message: string;
  timestamp: number;
  status: 'sent' | 'delivered';
  reference: string;
}

export interface RegisteredUserAccount {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role?: 'owner' | 'admin' | 'user';
  ninMasked: string; // e.g. "•••••••4821" - never show raw NIN publicly
  ninHash?: string;
  password?: string; // Legacy fallback or password placeholder
  loginPasswordHash?: string; // Hashed login password
  passwordSalt?: string; // Cryptographic salt for password
  tempPassword?: string; // 6-digit temporary recovery password sent by SMS
  tempPasswordExpiresAt?: number; // Expiration timestamp for temporary password (10 min)
  mustResetPassword?: boolean; // When true, forces user to set a new permanent password immediately upon login
  customPin?: string; // Stored user custom 4-digit PIN for permanent transfer authorization
  transactionPinHash?: string; // Hashed 4-digit transaction PIN
  pinSalt?: string; // Cryptographic salt
  failedPinAttempts?: number;
  pinLockoutUntil?: number | null;
  verificationStatus: VerificationStatus;
  verificationLog?: VerificationAuditLog;
  accountNumber: string;
  balanceNgn: number;
  createdAt: number;
  userProfile: OPayUserProfile;
  transactions: Transaction[];
  cards: OPayDebitCard[];
  safeBoxes: SafeBoxPlan[];
  activeLoan: ActiveLoan;
  notifications: DemoNotification[];
}

export type MainTabType = 'home' | 'rewards' | 'finance' | 'cards' | 'me';
