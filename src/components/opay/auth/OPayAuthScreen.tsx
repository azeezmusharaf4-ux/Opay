import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Mail, 
  User, 
  CreditCard, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  KeyRound,
  Shield,
  ChevronLeft,
  X,
  HelpCircle,
  Delete,
  MessageSquare,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useDemoWallet } from '../../../context/DemoWalletContext';
import { validatePasswordStrength, validateTransactionPin } from '../../../utils/security';
import { OPayIdentityVerificationModal } from './OPayIdentityVerificationModal';
import { VerificationAuditLog, VerificationStatus, RegisteredUserAccount } from '../../../types';

interface OPayAuthScreenProps {
  onLogin: (credentials: { identifier: string; pinOrPass: string }) => Promise<{ 
    success: boolean; 
    error?: string; 
    verificationStatus?: VerificationStatus;
    accountData?: any;
  }>;
  onRegister: (data: {
    fullName: string;
    phone: string;
    email: string;
    nin: string;
    password: string; // Login password
    pin: string; // 4-digit transaction PIN
    verificationLog?: VerificationAuditLog;
  }) => Promise<{ success: boolean; error?: string }>;
  existingAccountsCount: number;
  onQuickDemoLogin?: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register' | 'welcome_back' | 'forgot_password';
}

export const OPayAuthScreen: React.FC<OPayAuthScreenProps> = ({
  onLogin,
  onRegister,
  existingAccountsCount,
  onQuickDemoLogin,
  onClose,
  initialMode = 'login',
}) => {
  const { 
    rememberedAccount, 
    isManuallyLoggedOut, 
    registeredAccounts,
    setRememberedAccount,
    updateAccountPasswordInClient,
    refreshAccountsFromServer
  } = useDemoWallet();

  // Determine starting mode based on remembered account
  const determineStartMode = (): 'welcome_back' | 'full_login' | 'register' | 'forgot_password' => {
    if (initialMode === 'forgot_password') return 'forgot_password';
    if (initialMode === 'register') return 'register';
    if (initialMode === 'welcome_back' && rememberedAccount) return 'welcome_back';
    if (rememberedAccount) return 'welcome_back';
    return 'full_login';
  };

  const [activeMode, setActiveMode] = useState<'welcome_back' | 'full_login' | 'register' | 'forgot_password'>(determineStartMode);

  // Welcome back state
  const [welcomePassword, setWelcomePassword] = useState('');
  const [showWelcomePassword, setShowWelcomePassword] = useState(false);

  // Full login state (IMG_2487.png)
  const [loginStep, setLoginStep] = useState<1 | 2>(1); // 1: Identifier, 2: Password
  const [loginIdentifier, setLoginIdentifier] = useState(rememberedAccount?.phone || '07075817357');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot Password flow state (Step 1: Phone -> Step 2: New Password -> Step 3: Success)
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: New Password, 3: Success
  const [forgotPhone, setForgotPhone] = useState(rememberedAccount?.phone || '07075817357');
  const [forgotAccountName, setForgotAccountName] = useState('');
  const [forgotMaskedPhone, setForgotMaskedPhone] = useState('');
  const [forgotAccountId, setForgotAccountId] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regNin, setRegNin] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');
  const [showRegNin, setShowRegNin] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Identity Verification Flow State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<{
    fullName: string;
    phone: string;
    email: string;
    nin: string;
    password: string;
    pin: string;
  } | null>(null);

  // Success message after registration
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Help modal state
  const [showHelpToast, setShowHelpToast] = useState(false);

  // Format Nigerian phone numbers with space (e.g. 0707 581 7357)
  const formatDisplayPhone = (rawPhone: string) => {
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
    }
    if (clean.length === 10) {
      return `0${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return rawPhone;
  };

  const handleKeypadPress = (val: string) => {
    setLoginError(null);
    if (val === '⌫') {
      setWelcomePassword(prev => prev.slice(0, -1));
    } else if (val === 'C') {
      setWelcomePassword('');
    } else if (welcomePassword.length < 6) {
      setWelcomePassword(prev => prev + val);
    }
  };

  // Open Forgot Password Flow
  const handleOpenForgotPassword = (prefillPhone?: string) => {
    setForgotError(null);
    setForgotSuccessMsg(null);
    setForgotStep(1);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    if (prefillPhone) {
      setForgotPhone(prefillPhone);
    } else if (rememberedAccount?.phone) {
      setForgotPhone(rememberedAccount.phone);
    } else if (loginIdentifier) {
      setForgotPhone(loginIdentifier);
    }
    setActiveMode('forgot_password');
  };

  // Step 1: Verify phone number belongs to an existing account
  const handleForgotVerifyPhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);
    setForgotSuccessMsg(null);

    const cleanInput = forgotPhone.trim();
    if (!cleanInput) {
      setForgotError('Please enter the phone number registered with your account.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanInput }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.exists) {
        setForgotError(data.message || 'No account found matching this phone number. Please check the number and try again.');
        return;
      }

      setForgotPhone(data.phone || cleanInput);
      setForgotMaskedPhone(data.maskedPhone || cleanInput);
      setForgotAccountName(data.fullName || '');
      setForgotAccountId(data.accountId || '');
      setForgotStep(2);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Failed to verify phone number. Please check your connection.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 2: Create & confirm new password directly
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const cleanNewPass = forgotNewPassword.trim();
    const cleanConfirmPass = forgotConfirmPassword.trim();

    if (!cleanNewPass || cleanNewPass.length < 6) {
      setForgotError('Password must be at least 6 characters or digits long.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setForgotError('The new password and confirmation do not match.');
      return;
    }

    setIsForgotLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone.trim(),
          accountId: forgotAccountId,
          newPassword: cleanNewPass,
          confirmPassword: cleanConfirmPass,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setForgotError(data.message || 'Failed to update password. Please try again.');
        return;
      }

      // Synchronize in client context & remember this account
      if (data.accountId) {
        setRememberedAccount(data.accountId);
        updateAccountPasswordInClient(data.accountId, cleanNewPass);
      }
      await refreshAccountsFromServer();

      const activePhone = data.phone || forgotPhone.trim();
      setLoginIdentifier(activePhone);
      setLoginPassword(cleanNewPass);
      setWelcomePassword(cleanNewPass);
      setForgotStep(3);
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Error updating password.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleDirectLoginAfterReset = async () => {
    setIsForgotLoading(true);
    setForgotError(null);
    try {
      const targetPhone = loginIdentifier || forgotPhone.trim() || rememberedAccount?.phone || '07075817357';
      const targetPass = loginPassword || forgotNewPassword.trim() || welcomePassword;

      const result = await onLogin({
        identifier: targetPhone,
        pinOrPass: targetPass,
      });

      if (result.success) {
        onClose?.();
        return;
      }

      setForgotError(result.error || 'Failed to sign in with new password. Please try again.');
    } catch (err: unknown) {
      setForgotError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsForgotLoading(false);
    }
  };


  const handleWelcomeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    if (!welcomePassword) {
      setLoginError('Please enter your login password.');
      return;
    }

    setIsLoggingIn(true);
    const identifier = rememberedAccount?.phone || rememberedAccount?.userProfile.accountNumber || loginIdentifier || '07075817357';
    try {
      const result = await onLogin({
        identifier,
        pinOrPass: welcomePassword,
      });

      if (result.success && result.requiresPermanentPasswordReset) {
        setForgotPhone(result.accountData?.phone || identifier);
        setForgotAccountName(result.accountData?.fullName || '');
        setForgotAccountId(result.accountData?.id || '');
        setForgotStep(2);
        setActiveMode('forgot_password');
        return;
      }

      if (result.success) {
        onClose?.();
        return;
      }

      if (!result.success) {
        setLoginError(result.error || 'Incorrect login password. Please try again.');
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFullLoginNext = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setLoginError('Please enter your Mobile No. or Email.');
      return;
    }

    // Advance to password step if identifier provided
    setLoginStep(2);
  };

  const handleFullLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setLoginError('Please enter your registered phone number or email.');
      setLoginStep(1);
      return;
    }

    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await onLogin({
        identifier: cleanId,
        pinOrPass: loginPassword,
      });

      if (result.success && result.requiresPermanentPasswordReset) {
        setForgotPhone(result.accountData?.phone || cleanId);
        setForgotAccountName(result.accountData?.fullName || '');
        setForgotAccountId(result.accountData?.id || '');
        setForgotStep(2);
        setActiveMode('forgot_password');
        return;
      }

      if (result.success) {
        onClose?.();
        return;
      }

      if (!result.success) {
        setLoginError(result.error || 'Invalid login credentials. Please check your details.');
      }
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const cleanName = regFullName.trim();
    const cleanPhone = regPhone.replace(/\D/g, '');
    const cleanEmail = regEmail.trim();
    const cleanNin = regNin.replace(/\D/g, '');
    const cleanPass = regPassword.trim();
    const cleanPin = regPin.trim();

    if (!cleanName || cleanName.length < 3) {
      setRegError('Please enter your full legal name as it appears on your official ID.');
      return;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setRegError('Please enter a valid 10 or 11-digit Nigerian phone number.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (cleanPass.length < 6) {
      setRegError('Login password must be at least 6 characters with letters and numbers.');
      return;
    }

    if (cleanPin.length !== 4) {
      setRegError('Transaction PIN must be exactly 4 numeric digits.');
      return;
    }

    if (cleanPin !== regPinConfirm.trim()) {
      setRegError('The 4-digit transaction PIN confirmation does not match.');
      return;
    }

    const payload = {
      fullName: cleanName.toUpperCase(),
      phone: cleanPhone.startsWith('0') ? cleanPhone : `0${cleanPhone}`,
      email: cleanEmail.toLowerCase(),
      nin: cleanNin,
      password: cleanPass,
      pin: cleanPin,
    };

    setPendingRegistrationData(payload);
    setShowVerificationModal(true);
  };

  const handleVerificationCompleted = async (auditLog: VerificationAuditLog) => {
    if (!pendingRegistrationData) return;

    setIsRegistering(true);
    try {
      const result = await onRegister({
        ...pendingRegistrationData,
        nin: pendingRegistrationData.nin,
        verificationLog: auditLog,
      });

      if (result.success) {
        setShowVerificationModal(false);
        setRegSuccessMessage('Identity verified & account activated! Entering dashboard...');
      } else {
        setRegError(result.error || 'Failed to complete account activation.');
        setShowVerificationModal(false);
      }
    } catch (err: unknown) {
      setRegError(err instanceof Error ? err.message : 'Account activation failed.');
      setShowVerificationModal(false);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div 
      id="opay-auth-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111317] p-3 sm:p-4 overflow-y-auto select-none"
    >
      {/* Toast Notification */}
      {showHelpToast && (
        <div className="fixed top-6 z-60 rounded-full bg-slate-800/95 px-4 py-2 text-xs font-semibold text-white shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <HelpCircle className="h-4 w-4 text-[#00D589]" />
          <span>24/7 Helpline: 0700 8888 328 | support@opaydigital.com</span>
        </div>
      )}

      <div className="relative flex flex-col w-full max-w-md my-auto rounded-3xl bg-[#16181E] border border-slate-800/90 text-white shadow-2xl overflow-hidden min-h-[580px]">
        
        {/* Top Header: Back button on left, Help link on right matching IMG_2487 & IMG_2489 */}
        <header className="shrink-0 flex items-center justify-between px-5 py-4 bg-[#16181E] border-b border-slate-800/40 z-10">
          <button
            type="button"
            onClick={() => {
              if (activeMode === 'forgot_password') {
                if (forgotStep === 2) {
                  setForgotStep(1);
                  setForgotError(null);
                } else if (forgotStep === 3) {
                  setForgotStep(2);
                  setForgotError(null);
                } else {
                  if (rememberedAccount && !isManuallyLoggedOut) {
                    setActiveMode('welcome_back');
                  } else {
                    setActiveMode('full_login');
                  }
                  setForgotError(null);
                }
              } else if (activeMode === 'welcome_back') {
                setActiveMode('full_login');
                setLoginStep(1);
              } else if (activeMode === 'full_login' && loginStep === 2) {
                setLoginStep(1);
              } else if (activeMode === 'register') {
                setActiveMode('full_login');
              } else if (onClose) {
                onClose();
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-slate-800 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>

          <button
            type="button"
            onClick={() => setShowHelpToast(!showHelpToast)}
            className="text-sm font-semibold text-[#00D589] hover:underline flex items-center gap-1 cursor-pointer"
          >
            Help
          </button>
        </header>

        {/* Dynamic View Content */}
        <div className="flex-1 px-6 py-5 flex flex-col justify-between overflow-y-auto">
          
          {/* ========================================================= */}
          {/* VIEW 1: "WELCOME BACK!" SCREEN matching IMG_2489.png       */}
          {/* ========================================================= */}
          {activeMode === 'welcome_back' && (
            <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-200">
              <div className="space-y-4">
                {/* 1. User Avatar & Remembered Phone */}
                <div className="flex flex-col items-center text-center space-y-2 pt-2">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-2 border-[#00D589]/50 p-0.5 bg-[#0D261C] shadow-[0_0_20px_rgba(0,213,137,0.25)] overflow-hidden">
                      {rememberedAccount?.userProfile?.avatarUrl ? (
                        <img 
                          src={rememberedAccount.userProfile.avatarUrl} 
                          alt={rememberedAccount.fullName}
                          className="h-full w-full object-cover rounded-full"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#0D261C] text-[#00D589] font-black text-2xl">
                          {rememberedAccount?.fullName?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remembered Phone Number */}
                  <div className="text-sm font-semibold text-slate-300 tracking-wider font-mono">
                    {formatDisplayPhone(rememberedAccount?.phone || '07075817357')}
                  </div>
                </div>

                {/* 2. Headline: Welcome back! */}
                <div className="space-y-1 text-left pt-1">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Welcome back!
                  </h1>
                  <p className="text-xs text-slate-300 font-medium">
                    Enter your 6-digit Password to log in
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-900/60 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* 3. Password Input Field matching IMG_2489 */}
                <form onSubmit={handleWelcomeSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors p-1">
                      <input
                        type={showWelcomePassword ? 'text' : 'password'}
                        autoFocus
                        value={welcomePassword}
                        onChange={(e) => {
                          setWelcomePassword(e.target.value);
                          setLoginError(null);
                        }}
                        placeholder="Enter your password"
                        className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none tracking-widest font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWelcomePassword(!showWelcomePassword)}
                        className="pr-4 text-slate-400 hover:text-white transition-colors"
                        aria-label="Toggle password visibility"
                      >
                        {showWelcomePassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>

                    {/* Forgot Password link on right */}
                    <div className="flex justify-between items-center pt-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveMode('full_login')}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        Switch Account
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenForgotPassword(rememberedAccount?.phone)}
                        className="font-medium text-[#00D589] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  {/* 4. Green Pill Button: Log in */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {isLoggingIn ? (
                      <span>Logging in...</span>
                    ) : (
                      <span>Log in</span>
                    )}
                  </button>
                </form>

                {/* Touch Keypad for mobile/desktop convenience */}
                <div className="pt-2">
                  <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeypadPress(key)}
                        className="h-11 rounded-xl bg-[#1D212A] hover:bg-slate-700/80 active:scale-95 text-white font-bold text-base transition-colors flex items-center justify-center shadow-sm"
                      >
                        {key === '⌫' ? <Delete className="h-4 w-4 text-slate-300" /> : key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Regulatory Footer */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Shield className="h-4 w-4 text-[#00D589]" />
                <span>Protected by OPay End-to-End Encryption</span>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: FULL LOGIN SCREEN matching IMG_2487.png           */}
          {/* ========================================================= */}
          {activeMode === 'full_login' && (
            <div className="flex-1 flex flex-col justify-between space-y-6 animate-in fade-in duration-200">
              <div className="space-y-6">
                
                {/* 1. OPay Emblem Logo */}
                <div className="flex flex-col items-start pt-1 space-y-3">
                  <div className="inline-flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-[#0D261C] border border-[#00D589]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,213,137,0.2)]">
                      <svg className="h-6 w-6" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="50" r="34" stroke="#00D589" strokeWidth="16" />
                        <rect x="12" y="44.5" width="24" height="11" rx="2" fill="#FFFFFF" />
                      </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight text-white font-mono">OPay</span>
                  </div>

                  {/* Headline: Log in to your account */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Log in to your account
                  </h1>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-900/60 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Step 1: Phone / Email Entry */}
                {loginStep === 1 && (
                  <form onSubmit={handleFullLoginNext} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Enter your Mobile No./Email
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors">
                        <input
                          type="text"
                          autoFocus
                          value={loginIdentifier}
                          onChange={(e) => {
                            setLoginIdentifier(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="e.g. 07075817357"
                          className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none font-medium"
                        />
                      </div>

                      {/* Sub-text under input matching IMG_2487 */}
                      <div className="pt-1 text-xs text-slate-400">
                        <span>Lost Your Mobile Number, </span>
                        <button
                          type="button"
                          onClick={() => setShowHelpToast(true)}
                          className="font-medium text-[#00D589] hover:underline cursor-pointer"
                        >
                          Change Now
                        </button>
                      </div>
                    </div>

                    {/* Green Pill Button: NEXT */}
                    <button
                      type="submit"
                      className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg shadow-emerald-950/40 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>NEXT</span>
                    </button>

                    {/* Don't have an account? Click here to Sign Up */}
                    <div className="text-center pt-2 text-xs text-slate-400">
                      <span>Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => setActiveMode('register')}
                        className="font-semibold text-[#00D589] hover:underline cursor-pointer"
                      >
                        Click here to Sign Up
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Password Entry after NEXT */}
                {loginStep === 2 && (
                  <form onSubmit={handleFullLoginSubmit} className="space-y-4">
                    <div className="rounded-xl bg-[#121419] p-3 border border-slate-800 text-xs">
                      <span className="text-slate-400 block">Account Identifier</span>
                      <span className="font-mono text-white font-bold">{loginIdentifier}</span>
                      <button
                        type="button"
                        onClick={() => setLoginStep(1)}
                        className="text-[11px] text-[#00D589] font-semibold ml-2 hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Enter your Login Password
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          autoFocus
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError(null);
                          }}
                          placeholder="Enter your password"
                          className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="pr-4 text-slate-400 hover:text-white"
                        >
                          {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      
                      {/* Forgot Password link */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenForgotPassword(loginIdentifier)}
                          className="text-xs font-medium text-[#00D589] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoggingIn ? <span>Signing In...</span> : <span>Log In</span>}
                    </button>
                  </form>
                )}
              </div>

              {/* Regulatory Footer matching IMG_2487 */}
              <div className="pt-6 border-t border-slate-800/60 text-center text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-center gap-1.5 font-medium text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-[#00D589]" />
                  <span>Licensed by the CBN and insured by the NDIC</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: REGISTRATION FLOW                                 */}
          {/* ========================================================= */}
          {activeMode === 'register' && (
            <div className="flex-1 space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Create OPay Account
                </h1>
                <p className="text-xs text-slate-400">
                  Register and complete identity verification for full access
                </p>
              </div>

              {regError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-900/60 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccessMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 p-3 text-xs text-emerald-300 border border-emerald-900/60 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D589]" />
                  <span>{regSuccessMessage}</span>
                </div>
              )}

              <form onSubmit={handleRegisterInitiate} className="space-y-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name (as on official ID)
                  </label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. ADEOLA OLUMIDE JOHNSON"
                    className="w-full rounded-xl bg-[#1A1D24] p-3 text-sm text-white border border-slate-700 focus:border-[#00D589] focus:outline-none uppercase placeholder-slate-500"
                    required
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="08012345678"
                      className="w-full rounded-xl bg-[#1A1D24] p-3 text-sm text-white border border-slate-700 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@email.com"
                      className="w-full rounded-xl bg-[#1A1D24] p-3 text-sm text-white border border-slate-700 focus:border-[#00D589] focus:outline-none lowercase placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* NIN */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    NIN (National Identity Number)
                  </label>
                  <input
                    type={showRegNin ? 'text' : 'password'}
                    value={regNin}
                    onChange={(e) => setRegNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="Enter 11-digit NIN"
                    className="w-full rounded-xl bg-[#1A1D24] p-3 text-sm text-white border border-slate-700 focus:border-[#00D589] focus:outline-none font-mono placeholder-slate-500"
                    required
                  />
                </div>

                {/* Login Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Create 6-Digit Password
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create login password"
                    className="w-full rounded-xl bg-[#1A1D24] p-3 text-sm text-white border border-slate-700 focus:border-[#00D589] focus:outline-none placeholder-slate-500"
                    required
                  />
                </div>

                {/* 4-digit PIN */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Create 4-Digit Transaction PIN
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="PIN"
                      className="w-full rounded-xl bg-[#1A1D24] p-2.5 text-center text-sm font-mono font-bold text-[#00D589] border border-slate-700 focus:border-[#00D589] focus:outline-none"
                      required
                    />
                    <input
                      type="password"
                      maxLength={4}
                      value={regPinConfirm}
                      onChange={(e) => setRegPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Confirm PIN"
                      className="w-full rounded-xl bg-[#1A1D24] p-2.5 text-center text-sm font-mono font-bold text-[#00D589] border border-slate-700 focus:border-[#00D589] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full rounded-full bg-[#00D589] py-3.5 text-sm font-bold text-[#072418] hover:bg-[#00E599] transition-all cursor-pointer mt-3"
                >
                  Continue to Identity & Face Verification
                </button>

                <div className="text-center pt-2 text-xs text-slate-400">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setActiveMode('full_login')}
                    className="font-semibold text-[#00D589] hover:underline"
                  >
                    Log In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: FORGOT PASSWORD FLOW                              */}
          {/* ========================================================= */}
          {activeMode === 'forgot_password' && (
            <div className="flex-1 flex flex-col justify-between space-y-4 animate-in fade-in duration-200">
              <div className="space-y-4">
                
                {/* Header title */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#0D261C] border border-[#00D589]/40 flex items-center justify-center text-[#00D589]">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold text-[#00D589] uppercase tracking-wider">Password Recovery</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {forgotStep === 1 && 'Find Your Account'}
                    {forgotStep === 2 && 'Create New Password'}
                    {forgotStep === 3 && 'Password Changed'}
                  </h1>
                  <p className="text-xs text-slate-300 font-medium">
                    {forgotStep === 1 && 'Enter the registered mobile number associated with your OPay account.'}
                    {forgotStep === 2 && `Enter and confirm your new 6-digit password for ${forgotAccountName ? forgotAccountName : 'your account'}.`}
                    {forgotStep === 3 && 'Your account password has been updated. You can now log in with your new password.'}
                  </p>
                </div>

                {/* Error Banner */}
                {forgotError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-950/60 p-3 text-xs text-red-300 border border-red-900/60 animate-in fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {/* Success Banner */}
                {forgotSuccessMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 p-3 text-xs text-emerald-300 border border-emerald-900/60 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00D589]" />
                    <span>{forgotSuccessMsg}</span>
                  </div>
                )}

                {/* STEP 1: Phone Number Input */}
                {forgotStep === 1 && (
                  <form onSubmit={handleForgotVerifyPhone} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Registered Mobile Number
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors">
                        <div className="pl-4 pr-2 text-xs font-bold text-[#00D589] border-r border-slate-700/80 py-3.5 flex items-center gap-1">
                          <span>🇳🇬 +234</span>
                        </div>
                        <input
                          type="tel"
                          autoFocus
                          value={forgotPhone}
                          onChange={(e) => {
                            setForgotPhone(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="e.g. 07075817357"
                          className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 pt-1">
                        We will verify that this phone number belongs to an existing OPay account.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg shadow-emerald-950/40 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isForgotLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Verifying Account...</span>
                        </div>
                      ) : (
                        <span>Verify & Continue</span>
                      )}
                    </button>

                    <div className="text-center pt-2 text-xs text-slate-400">
                      <span>Remembered your password? </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (rememberedAccount && !isManuallyLoggedOut) {
                            setActiveMode('welcome_back');
                          } else {
                            setActiveMode('full_login');
                          }
                        }}
                        className="font-semibold text-[#00D589] hover:underline cursor-pointer"
                      >
                        Back to Log In
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2: Create & Confirm New Password */}
                {forgotStep === 2 && (
                  <form onSubmit={handleForgotResetPassword} className="space-y-4">
                    {/* Account preview card */}
                    <div className="rounded-xl bg-[#121419] p-3 border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Verified Account</span>
                        <span className="font-semibold text-white">
                          {forgotAccountName || 'Account Found'}
                        </span>
                        <span className="font-mono text-slate-400 text-[11px] block">
                          {forgotMaskedPhone || forgotPhone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep(1);
                          setForgotError(null);
                        }}
                        className="text-[11px] text-[#00D589] font-semibold hover:underline"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        New 6-Digit Password
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors">
                        <input
                          type={showForgotNewPassword ? 'text' : 'password'}
                          autoFocus
                          value={forgotNewPassword}
                          onChange={(e) => {
                            setForgotNewPassword(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="Enter new 6-digit password"
                          className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                          className="pr-4 text-slate-400 hover:text-white"
                        >
                          {showForgotNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Confirm New Password
                      </label>
                      <div className="relative flex items-center rounded-2xl bg-[#1A1D24] border border-slate-700/80 focus-within:border-[#00D589] transition-colors">
                        <input
                          type={showForgotConfirmPassword ? 'text' : 'password'}
                          value={forgotConfirmPassword}
                          onChange={(e) => {
                            setForgotConfirmPassword(e.target.value);
                            setForgotError(null);
                          }}
                          placeholder="Re-enter new password"
                          className="w-full bg-transparent py-3.5 px-4 text-base text-white placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                          className="pr-4 text-slate-400 hover:text-white"
                        >
                          {showForgotConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#121419] p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#00D589]" />
                        <span>Security Requirement</span>
                      </div>
                      <p>Use at least 6 digits/characters that you can remember. Do not share your password with anyone.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={isForgotLoading}
                      className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isForgotLoading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Updating Password...</span>
                        </div>
                      ) : (
                        <span>Confirm & Change Password</span>
                      )}
                    </button>

                    <div className="text-center pt-1 text-xs text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('full_login');
                          setLoginStep(2);
                        }}
                        className="font-semibold text-slate-400 hover:text-white cursor-pointer"
                      >
                        Cancel & Return to Log In
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 3: Success Screen */}
                {forgotStep === 3 && (
                  <div className="space-y-6 text-center py-4 animate-in fade-in">
                    <div className="h-20 w-20 rounded-full bg-[#0D261C] border-2 border-[#00D589] text-[#00D589] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,213,137,0.3)] animate-in zoom-in-50">
                      <CheckCircle className="h-10 w-10" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-white">Password Changed Successfully!</h2>
                      <p className="text-xs text-slate-300 max-w-xs mx-auto">
                        Your account password has been permanently updated. You can now use your new password to log in at any time.
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2.5 pt-2">
                      <button
                        type="button"
                        disabled={isForgotLoading}
                        onClick={handleDirectLoginAfterReset}
                        className="w-full rounded-full bg-[#00D589] py-4 text-sm font-black text-[#072418] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg shadow-emerald-950/40 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isForgotLoading ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Logging In...</span>
                          </div>
                        ) : (
                          <span>Log In Now With New Password</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMode('welcome_back');
                          setLoginError(null);
                        }}
                        className="w-full rounded-full bg-[#1A1D24] border border-slate-700/80 py-3 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#222630] transition-colors cursor-pointer"
                      >
                        Go to Welcome Back Screen
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Regulatory Footer */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Shield className="h-4 w-4 text-[#00D589]" />
                <span>Protected by OPay End-to-End Encryption</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Identity Verification & Face Liveness Modal */}
      {showVerificationModal && pendingRegistrationData && (
        <OPayIdentityVerificationModal
          initialStatus="identity_pending"
          userRegistrationData={{
            fullName: pendingRegistrationData.fullName,
            phone: pendingRegistrationData.phone,
            email: pendingRegistrationData.email,
            initialNin: pendingRegistrationData.nin,
          }}
          onVerificationComplete={handleVerificationCompleted}
          onCancel={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
};
