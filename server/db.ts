import fs from 'fs';
import path from 'path';
import { 
  RegisteredUserAccount, 
  Transaction, 
  DemoNotification, 
  OPayUserProfile, 
  OPayDebitCard, 
  SafeBoxPlan, 
  ActiveLoan 
} from '../src/types';
import { PaystackService } from './paystack';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  accounts: RegisteredUserAccount[];
  processedBscTxIds: string[];
}

const DEFAULT_CARDS: OPayDebitCard[] = [
  {
    id: 'card-1',
    cardType: 'Virtual Visa',
    cardNumber: '5399 •••• •••• 4821',
    cardHolder: 'MUSARAF OLAWALE ABDULAZEEZ',
    expiryDate: '08/29',
    cvv: '•••',
    isFrozen: false,
    isOnlineEnabled: true,
    isAtmEnabled: true,
    isPosEnabled: true,
    dailySpendLimit: 500000,
    colorTheme: 'teal',
  },
  {
    id: 'card-2',
    cardType: 'Physical Verve',
    cardNumber: '5061 •••• •••• 1092',
    cardHolder: 'MUSARAF OLAWALE ABDULAZEEZ',
    expiryDate: '12/28',
    cvv: '•••',
    isFrozen: false,
    isOnlineEnabled: true,
    isAtmEnabled: true,
    isPosEnabled: true,
    dailySpendLimit: 1000000,
    colorTheme: 'black',
  },
];

const DEFAULT_SAFEBOXES: SafeBoxPlan[] = [
  {
    id: 'safe-1',
    title: 'Target Savings - Car Fund',
    principalNgn: 15000.00,
    interestRateAnnual: 15.0,
    accruedInterestNgn: 450.00,
    lockedUntil: Date.now() + 86400000 * 45,
    autoRenew: true,
  },
];

const DEFAULT_LOAN: ActiveLoan = {
  loanLimitNgn: 500000.00,
  currentBorrowedNgn: 0.00,
  dueDate: Date.now() + 86400000 * 30,
  dailyInterestPercent: 0.1,
  status: 'eligible',
};

const DEFAULT_MASTER_ACCOUNT: RegisteredUserAccount = {
  id: 'acc-musaraf-default',
  fullName: 'MUSARAF OLAWALE ABDULAZEEZ',
  phone: '07075817357',
  email: 'moriobee44@gmail.com',
  role: 'owner',
  ninMasked: '•••••••4821',
  password: '123456',
  loginPasswordHash: 'b4c3e02e03c5cba0340c285a2304b23588baef29507c49527abfc4c447d36561',
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
  userProfile: {
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
    email: 'moriobee44@gmail.com',
    bvnLinked: true,
    ninLinked: true,
    role: 'owner',
    gender: 'Male',
    dob: '**-**-95',
    nickname: 'Musaraf',
    address: '10 Allen Avenue, Ikeja, Lagos State',
  },
  transactions: [],
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: [],
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
  transactions: [],
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: [],
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
  transactions: [],
  cards: DEFAULT_CARDS,
  safeBoxes: DEFAULT_SAFEBOXES,
  activeLoan: DEFAULT_LOAN,
  notifications: [],
};

const SEED_ACCOUNTS: RegisteredUserAccount[] = [
  DEFAULT_MASTER_ACCOUNT,
  DEFAULT_USER_B_ACCOUNT,
  DEFAULT_USER_C_ACCOUNT,
];

class ServerDatabase {
  private db: DatabaseSchema = {
    accounts: [],
    processedBscTxIds: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.accounts)) {
          this.db = parsed;
          if (!Array.isArray(this.db.processedBscTxIds)) {
            this.db.processedBscTxIds = [];
          }
          // Ensure seed accounts exist if missing
          const existingIds = new Set(this.db.accounts.map(a => a.id));
          let added = false;
          for (const seed of SEED_ACCOUNTS) {
            if (!existingIds.has(seed.id)) {
              this.db.accounts.push(seed);
              added = true;
            }
          }
          if (added) this.save();
          return;
        }
      }

      // Initialize with seed accounts
      this.db = {
        accounts: SEED_ACCOUNTS,
        processedBscTxIds: [],
      };
      this.save();
    } catch (err) {
      console.error('Failed to initialize server database:', err);
      this.db = {
        accounts: SEED_ACCOUNTS,
        processedBscTxIds: [],
      };
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save server database to disk:', err);
    }
  }

  public getAccounts(): RegisteredUserAccount[] {
    return this.db.accounts;
  }

  public getAccount(id: string): RegisteredUserAccount | undefined {
    return this.db.accounts.find(a => a.id === id);
  }

  public findAccountByIdentifier(identifier: string): RegisteredUserAccount | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const last10Digits = digits.length >= 10 ? digits.slice(-10) : digits;

    return this.db.accounts.find(acc => {
      const p = acc.phone.replace(/\D/g, '');
      const pLast10 = p.length >= 10 ? p.slice(-10) : p;
      const a = acc.accountNumber.replace(/\D/g, '');
      const aLast10 = a.length >= 10 ? a.slice(-10) : a;
      const id = acc.id.toLowerCase();
      const email = acc.email.toLowerCase();
      const fullName = acc.fullName.toLowerCase();

      return (
        id === clean ||
        email === clean ||
        (digits.length >= 7 && (a === digits || aLast10 === last10Digits || a.includes(digits) || digits.includes(a))) ||
        (digits.length >= 7 && (p === digits || pLast10 === last10Digits || p.includes(digits) || digits.includes(p))) ||
        (clean.length >= 4 && (fullName === clean || fullName.includes(clean) || clean.includes(fullName)))
      );
    });
  }

  public saveAccount(account: RegisteredUserAccount) {
    const idx = this.db.accounts.findIndex(a => a.id === account.id);
    if (idx !== -1) {
      this.db.accounts[idx] = account;
    } else {
      this.db.accounts.push(account);
    }
    this.save();
  }

  public saveAccounts(accounts: RegisteredUserAccount[]) {
    if (!Array.isArray(accounts) || accounts.length === 0) return;

    for (const incoming of accounts) {
      const existingIdx = this.db.accounts.findIndex(a => a.id === incoming.id);
      if (existingIdx !== -1) {
        const existing = this.db.accounts[existingIdx];

        // Merge transactions so that we NEVER delete any transaction that exists
        const existingTxs = existing.transactions || [];
        const incomingTxs = incoming.transactions || [];
        const txMap = new Map<string, Transaction>();
        for (const t of existingTxs) {
          if (t && t.id) txMap.set(t.id, t);
        }
        for (const t of incomingTxs) {
          if (t && t.id) txMap.set(t.id, t);
        }
        const mergedTxs = Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Merge client updates (cards, safeboxes, transactions) while preserving credentials and updating PIN when provided
        const effectivePinHash = incoming.transactionPinHash || existing.transactionPinHash;
        const effectivePinSalt = incoming.pinSalt || existing.pinSalt;
        const effectiveCustomPin = incoming.customPin || existing.customPin;

        this.db.accounts[existingIdx] = {
          ...incoming,
          transactions: mergedTxs,
          loginPasswordHash: incoming.loginPasswordHash || existing.loginPasswordHash,
          passwordSalt: incoming.passwordSalt || existing.passwordSalt,
          pinSalt: effectivePinSalt,
          transactionPinHash: effectivePinHash,
          customPin: effectiveCustomPin,
          failedPinAttempts: 0,
          pinLockoutUntil: null,
          tempPassword: existing.tempPassword,
          tempPasswordExpiresAt: existing.tempPasswordExpiresAt,
        };
        delete this.db.accounts[existingIdx].password;
      } else {
        const newAcc = { ...incoming };
        delete newAcc.password;
        this.db.accounts.push(newAcc);
      }
    }
    this.save();
  }

  public updateAccountBalanceAndTransactions(
    accountId: string, 
    balanceNgn?: number, 
    transactions?: Transaction[],
    extra?: { customPin?: string; transactionPinHash?: string; pinSalt?: string }
  ): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    if (typeof balanceNgn === 'number') {
      account.balanceNgn = balanceNgn;
    }
    if (Array.isArray(transactions)) {
      const existingTxs = account.transactions || [];
      const txMap = new Map<string, Transaction>();
      for (const t of existingTxs) {
        if (t && t.id) txMap.set(t.id, t);
      }
      for (const t of transactions) {
        if (t && t.id) txMap.set(t.id, t);
      }
      account.transactions = Array.from(txMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    if (extra?.customPin) {
      account.customPin = extra.customPin;
    }
    if (extra?.transactionPinHash) {
      account.transactionPinHash = extra.transactionPinHash;
    }
    if (extra?.pinSalt) {
      account.pinSalt = extra.pinSalt;
    }
    this.saveAccount(account);
    return true;
  }

  public updateAccountPassword(accountId: string, newPasswordHash: string, salt?: string): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    delete account.password;
    account.loginPasswordHash = newPasswordHash;
    if (salt) {
      account.passwordSalt = salt;
    }
    account.tempPassword = undefined;
    account.tempPasswordExpiresAt = undefined;
    account.mustResetPassword = false;
    this.saveAccount(account);
    return true;
  }

  public updateAccountPin(accountId: string, newPinHash: string, salt?: string, plainPin?: string): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    account.transactionPinHash = newPinHash;
    if (salt) {
      account.pinSalt = salt;
    }
    if (plainPin) {
      account.customPin = plainPin;
    }
    account.failedPinAttempts = 0;
    account.pinLockoutUntil = null;
    this.saveAccount(account);
    return true;
  }

  public setTempPassword(accountId: string, tempPassword: string, expiresAt: number): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    account.tempPassword = tempPassword;
    account.tempPasswordExpiresAt = expiresAt;
    this.saveAccount(account);
    return true;
  }

  public clearTempPassword(accountId: string): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    account.tempPassword = undefined;
    account.tempPasswordExpiresAt = undefined;
    this.saveAccount(account);
    return true;
  }

  public setMustResetPassword(accountId: string, mustReset: boolean): boolean {
    const account = this.getAccount(accountId);
    if (!account) return false;
    account.mustResetPassword = mustReset;
    this.saveAccount(account);
    return true;
  }


  /**
   * Process and permanently save an outgoing transfer (OPay or Bank Transfer)
   */
  public async executeTransfer(params: {
    senderId: string;
    type: 'op_transfer' | 'bank_transfer';
    recipientName: string;
    recipientPhoneOrAccount: string;
    bankName: string;
    bankCode?: string;
    amountNgn: number;
    remark?: string;
  }): Promise<{ success: boolean; transaction?: Transaction; error?: string }> {
    const { senderId, type, recipientName, recipientPhoneOrAccount, bankName, bankCode, amountNgn, remark } = params;

    const sender = this.getAccount(senderId);
    if (!sender) {
      return { success: false, error: 'Sender user account not found.' };
    }

    if (sender.balanceNgn < amountNgn) {
      return { success: false, error: `Insufficient balance. Available balance: ₦${sender.balanceNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` };
    }

    const now = Date.now();
    const reference = `26${Math.floor(Math.random() * 89999999999999 + 10000000000000)}`;
    const sessionId = `260${now}${Math.floor(Math.random() * 8999 + 1000)}`;

    let status: 'successful' | 'pending' | 'failed' | 'reversed' = 'successful';
    let providerMsg = '';

    // If real Paystack API is configured for interbank transfer
    if (type === 'bank_transfer' && PaystackService.isConfigured() && bankCode && bankCode !== '999992') {
      try {
        const recipRes = await PaystackService.createTransferRecipient({
          name: recipientName,
          accountNumber: recipientPhoneOrAccount,
          bankCode,
        });

        if (recipRes.success && recipRes.recipientCode) {
          const xferRes = await PaystackService.initiateTransfer({
            amountNgn,
            recipientCode: recipRes.recipientCode,
            reason: remark || 'OPay Bank Transfer',
            reference,
          });

          if (xferRes.status === 'completed' || xferRes.status === 'pending') {
            status = xferRes.status === 'completed' ? 'successful' : 'pending';
          } else {
            status = 'failed';
            providerMsg = xferRes.message || 'Payment provider transfer failed.';
          }
        } else {
          status = 'failed';
          providerMsg = recipRes.message || 'Could not verify recipient with payment provider.';
        }
      } catch (err: unknown) {
        status = 'failed';
        providerMsg = err instanceof Error ? err.message : 'Transfer failed at payment provider gateway.';
      }
    }

    if (status === 'failed') {
      const failedTx: Transaction = {
        id: `tx-${now}-${Math.random().toString(36).substring(2, 6)}`,
        reference,
        type,
        title: `Transfer to ${recipientName}`,
        description: remark || `${type === 'op_transfer' ? 'OPay Transfer' : 'Bank Transfer'} to ${recipientPhoneOrAccount} (${bankName})`,
        amountNgn,
        status: 'failed',
        failureReason: providerMsg || 'Transfer declined by receiving bank gateway.',
        timestamp: now,
        sender: {
          name: sender.fullName,
          accountOrPhone: sender.accountNumber,
          bankName: 'OPay',
        },
        recipient: {
          name: recipientName,
          accountOrPhone: recipientPhoneOrAccount,
          bankName,
        },
        feeNgn: 0,
        category: 'outflow',
        balanceAfterNgn: sender.balanceNgn,
        sessionId,
      };

      sender.transactions = [failedTx, ...(sender.transactions || [])];
      this.saveAccount(sender);

      return {
        success: false,
        transaction: failedTx,
        error: providerMsg || 'Transfer was not confirmed by real payment provider.',
      };
    }

    // Permanent Balance Deduction on Sender Account
    const newSenderBalance = sender.balanceNgn - amountNgn;
    sender.balanceNgn = newSenderBalance;
    sender.userProfile.owealthBalanceNgn = Math.max(0, (sender.userProfile.owealthBalanceNgn || 0) - amountNgn);

    const outgoingTx: Transaction = {
      id: `tx-${now}-${Math.random().toString(36).substring(2, 6)}`,
      reference,
      type,
      title: `Transfer to ${recipientName}`,
      description: remark || `${type === 'op_transfer' ? 'OPay Transfer' : 'Bank Transfer'} to ${recipientPhoneOrAccount} (${bankName})`,
      amountNgn,
      status: status as any,
      timestamp: now,
      sender: {
        name: sender.fullName,
        accountOrPhone: sender.accountNumber,
        bankName: 'OPay',
      },
      recipient: {
        name: recipientName,
        accountOrPhone: recipientPhoneOrAccount,
        bankName,
      },
      feeNgn: 0,
      category: 'outflow',
      balanceAfterNgn: newSenderBalance,
      sessionId,
      remark: remark || undefined,
    };

    sender.transactions = [outgoingTx, ...(sender.transactions || [])];

    // Notification for sender
    const senderNotif: DemoNotification = {
      id: `notif-${now}-${Math.random().toString(36).substring(2, 6)}`,
      title: 'Debit Alert 💸',
      message: `You sent ₦${amountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })} to ${recipientName}. New balance: ₦${newSenderBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      timestamp: now,
      read: false,
      type: 'transaction',
      transactionId: outgoingTx.id,
      amountNgn,
      status: status as any,
    };
    sender.notifications = [senderNotif, ...(sender.notifications || [])];

    // Check if recipient is a registered user account in the server DB
    const recipientAcc = this.findAccountByIdentifier(recipientPhoneOrAccount);
    if (recipientAcc && recipientAcc.id !== sender.id) {
      const newRecipBalance = recipientAcc.balanceNgn + amountNgn;
      recipientAcc.balanceNgn = newRecipBalance;
      recipientAcc.userProfile.owealthBalanceNgn = (recipientAcc.userProfile.owealthBalanceNgn || 0) + amountNgn;

      const incomingTx: Transaction = {
        id: `tx-inflow-${now}-${Math.random().toString(36).substring(2, 6)}`,
        reference,
        type,
        title: `Transfer from ${sender.fullName}`,
        description: remark || `Received from ${sender.fullName} (${sender.accountNumber})`,
        amountNgn,
        status: 'successful',
        timestamp: now,
        sender: {
          name: sender.fullName,
          accountOrPhone: sender.accountNumber,
          bankName: 'OPay',
        },
        recipient: {
          name: recipientName,
          accountOrPhone: recipientPhoneOrAccount,
          bankName,
        },
        feeNgn: 0,
        category: 'inflow',
        balanceAfterNgn: newRecipBalance,
        sessionId,
      };

      const recipNotif: DemoNotification = {
        id: `notif-inflow-${now}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Transaction Successful',
        message: `You have received ₦${amountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}.`,
        timestamp: now,
        read: false,
        type: 'transaction',
        transactionId: incomingTx.id,
        amountNgn,
        status: 'successful',
      };

      recipientAcc.transactions = [incomingTx, ...(recipientAcc.transactions || [])];
      recipientAcc.notifications = [recipNotif, ...(recipientAcc.notifications || [])];
      this.saveAccount(recipientAcc);
    }

    // Save sender account changes permanently to disk
    this.saveAccount(sender);

    return {
      success: true,
      transaction: outgoingTx,
    };
  }

  /**
   * Process incoming BNB Smart Chain (BSC) withdrawal directly on the server DB
   */
  public processBscWithdrawal(params: {
    transactionId: string;
    accountNumber: string;
    amountNgn: number;
    sender?: string;
    status?: string;
    timestamp?: number;
  }): { success: boolean; duplicate?: boolean; error?: string; targetUser?: string; transaction?: Transaction } {
    const { transactionId, accountNumber, amountNgn, sender, status, timestamp } = params;

    const cleanTxId = transactionId.trim();

    // Check deduplication index
    if (this.db.processedBscTxIds.includes(cleanTxId)) {
      return {
        success: false,
        duplicate: true,
        error: `Duplicate transaction ID. BSC transaction '${cleanTxId}' was already credited.`,
      };
    }

    const target = this.findAccountByIdentifier(accountNumber);
    if (!target) {
      return {
        success: false,
        error: `OPay account not found for identifier '${accountNumber}'`,
      };
    }

    const newBalance = target.balanceNgn + amountNgn;
    const formattedAmount = amountNgn.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const senderSource = sender || 'BNB Smart Chain Wallet (0x71C...3A9)';
    const txTime = timestamp || Date.now();

    const bscTx: Transaction = {
      id: cleanTxId,
      reference: cleanTxId,
      type: 'bank_transfer',
      title: `Transfer from ${senderSource}`,
      description: `BNB Smart Chain Withdrawal Credit`,
      amountNgn,
      status: (status as any) || 'successful',
      timestamp: txTime,
      sender: {
        name: senderSource,
        accountOrPhone: 'BNB Smart Chain (BSC)',
        bankName: 'BNB Smart Chain',
      },
      recipient: {
        name: target.fullName,
        accountOrPhone: target.accountNumber,
        bankName: 'OPay Bank',
      },
      feeNgn: 0,
      category: 'inflow',
      balanceAfterNgn: newBalance,
      sessionId: cleanTxId,
    };

    const bscNotif: DemoNotification = {
      id: `notif-bsc-${cleanTxId}`,
      title: 'Transaction Successful',
      message: `You have received ₦${formattedAmount}.`,
      timestamp: txTime,
      read: false,
      type: 'transaction',
      amountNgn,
      status: 'successful',
    };

    target.balanceNgn = newBalance;
    target.userProfile.owealthBalanceNgn = (target.userProfile.owealthBalanceNgn || 0) + amountNgn;
    target.transactions = [bscTx, ...(target.transactions || [])];
    target.notifications = [bscNotif, ...(target.notifications || [])];

    this.db.processedBscTxIds.push(cleanTxId);
    this.saveAccount(target);

    return {
      success: true,
      targetUser: target.fullName,
      transaction: bscTx,
    };
  }
}

export const serverDb = new ServerDatabase();
