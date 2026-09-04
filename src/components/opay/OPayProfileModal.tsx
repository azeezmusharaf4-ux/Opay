import React, { useState, useRef } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Lock, 
  KeyRound, 
  PiggyBank, 
  Home, 
  ShieldAlert, 
  MessageSquare, 
  ShieldPlus, 
  Clipboard, 
  Sun, 
  ShieldCheck, 
  FileEdit, 
  Power, 
  AlertCircle,
  Check,
  X,
  Copy,
  Camera,
  Upload,
  Image as ImageIcon,
  Shield,
  Search,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface OPayProfileModalProps {
  onClose: () => void;
}

export const OPayProfileModal: React.FC<OPayProfileModalProps> = ({ onClose }) => {
  const { 
    userProfile, 
    updateUserProfile, 
    currentUser, 
    logoutUser,
    registeredAccounts,
    switchAccount,
    updateTransactionPin
  } = useDemoWallet();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);

  // Profile Photo Upload / Camera state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Set / Change Payment PIN state (directly set without previous PIN)
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [pinStep, setPinStep] = useState<'new' | 'confirm'>('new');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [showPinChars, setShowPinChars] = useState(false);

  // Settings states
  const [securityQuestionsSet, setSecurityQuestionsSet] = useState(false);
  const [q1, setQ1] = useState('What was your childhood nickname?');
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState('What is the name of your first school?');
  const [a2, setA2] = useState('');
  
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [clipboardAccessEnabled, setClipboardAccessEnabled] = useState(true);
  const [biometricLoginEnabled, setBiometricLoginEnabled] = useState(true);
  const [biometricPaymentEnabled, setBiometricPaymentEnabled] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  
  // Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState('General');
  const [feedbackText, setFeedbackText] = useState('');
  
  // Profile editing state
  const [copied, setCopied] = useState(false);
  const [editingField, setEditingField] = useState<'nickname' | 'mobile' | 'email' | 'address' | 'avatar' | null>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');

  // Confirmation dialogs
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(userProfile.accountNumber).catch(() => {});
    setCopied(true);
    showToast('OPay Account Number copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwnerOrAdmin = (user?: any): boolean => {
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    const cleanId = (user.id || '').toLowerCase();
    const cleanName = (user.fullName || userProfile?.name || '').toUpperCase();
    const cleanPhone = (user.phone || userProfile?.phone || '').replace(/\D/g, '');
    const cleanEmail = (user.email || userProfile?.email || '').toLowerCase();

    const isMasterId = cleanId === 'acc-musaraf-default' || cleanId.includes('musaraf');
    const isMasterPhone = cleanPhone.endsWith('7075817357') || cleanPhone.endsWith('8104443906');
    const isMasterEmail = cleanEmail === 'moriobee44@gmail.com' || cleanEmail.includes('musaraf');
    const isMasterName = cleanName.includes('MUSARAF') && (cleanName.includes('ABDULAZ') || cleanName.includes('OLAWALE'));

    return Boolean(isMasterId || isMasterPhone || isMasterEmail || isMasterName);
  };

  const filteredAccounts = registeredAccounts.filter(acc => {
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.trim().toLowerCase();
    return (
      acc.fullName.toLowerCase().includes(q) ||
      acc.phone.includes(q) ||
      acc.accountNumber.includes(q) ||
      acc.email.toLowerCase().includes(q)
    );
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    // Read and compress image with canvas to avoid giant payloads
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoPreview(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } } 
      });
      setCameraStream(stream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      showToast('Camera access not available or permission denied.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth || 320;
    const height = videoRef.current.videoHeight || 320;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(dataUrl);
      stopCamera();
    }
  };

  const handleSavePhoto = () => {
    if (!photoPreview) return;
    updateUserProfile({ avatarUrl: photoPreview });
    showToast('Profile photo saved successfully');
    stopCamera();
    setShowPhotoModal(false);
    setPhotoPreview(null);
  };

  const handleClosePhotoModal = () => {
    stopCamera();
    setShowPhotoModal(false);
    setPhotoPreview(null);
  };

  const handleOpenChangePin = () => {
    setPinStep('new');
    setNewPinInput('');
    setConfirmPinInput('');
    setPinError(null);
    setPinLoading(false);
    setShowChangePinModal(true);
  };

  const handlePinDigitPress = (digit: string) => {
    setPinError(null);
    if (pinStep === 'new') {
      if (newPinInput.length < 4) {
        const next = newPinInput + digit;
        setNewPinInput(next);
        if (next.length === 4) {
          // Auto advance to confirm PIN
          setTimeout(() => setPinStep('confirm'), 200);
        }
      }
    } else if (pinStep === 'confirm') {
      if (confirmPinInput.length < 4) {
        const next = confirmPinInput + digit;
        setConfirmPinInput(next);
      }
    }
  };

  const handlePinBackspace = () => {
    setPinError(null);
    if (pinStep === 'new') {
      setNewPinInput(prev => prev.slice(0, -1));
    } else if (pinStep === 'confirm') {
      setConfirmPinInput(prev => prev.slice(0, -1));
    }
  };

  const handleExecuteChangePin = async () => {
    if (newPinInput.length !== 4) {
      setPinError('Payment PIN must be 4 digits.');
      return;
    }

    if (confirmPinInput !== newPinInput) {
      setPinError('PINs do not match. Please re-enter.');
      setConfirmPinInput('');
      return;
    }

    setPinLoading(true);
    setPinError(null);

    const res = await updateTransactionPin({
      newPin: newPinInput,
    });

    setPinLoading(false);

    if (res.success) {
      showToast('Payment PIN changed successfully! You can now use this PIN for all transfers anytime.');
      setShowChangePinModal(false);
      setNewPinInput('');
      setConfirmPinInput('');
    } else {
      setPinError(res.message || 'Failed to update Payment PIN.');
    }
  };

  const handleSaveProfileField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;

    if (editingField === 'nickname') {
      updateUserProfile({ nickname: fieldValue.trim() });
      showToast('Nickname updated');
    } else if (editingField === 'mobile') {
      updateUserProfile({ phone: fieldValue.trim() || userProfile.phone });
      showToast('Mobile number updated');
    } else if (editingField === 'email') {
      updateUserProfile({ email: fieldValue.trim() || userProfile.email });
      showToast('Email address updated');
    } else if (editingField === 'address') {
      updateUserProfile({ address: fieldValue.trim() });
      showToast('Address updated');
    } else if (editingField === 'avatar') {
      if (fieldValue.trim()) {
        updateUserProfile({ avatarUrl: fieldValue.trim() });
        showToast('Profile photo updated');
      }
    }
    setEditingField(null);
  };

  return (
    <div 
      id="opay-settings-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150 overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 z-60 rounded-full bg-[#181B22]/95 px-4 py-2 text-xs font-semibold text-white shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-3.5 w-3.5 text-[#00D589]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        className="relative flex flex-col w-full max-w-md h-full sm:h-[94vh] sm:rounded-3xl bg-[#111215] text-white shadow-2xl border-0 sm:border border-slate-800/80 overflow-hidden"
      >
        {/* ========================================================= */}
        {/* MAIN SETTINGS VIEW (Matching IMG_2599.png & IMG_2600.png)  */}
        {/* ========================================================= */}
        {!activeSubView && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top Navigation Bar: Back arrow on left, Centered 'Settings' */}
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                id="settings-back-btn"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>

              <h1 className="text-[17px] font-bold text-white tracking-tight">
                Settings
              </h1>

              <div className="h-9 w-9" />
            </header>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 pb-10 scrollbar-none">
              
              {/* GROUP 1: My Profile, Payment Settings, Login Settings, Savings Settings */}
              <div 
                id="settings-group-1"
                className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden shadow-sm"
              >
                {/* 1. My Profile */}
                <button
                  id="settings-my-profile-row"
                  onClick={() => setActiveSubView('my_profile')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <User className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      My Profile
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 2. Payment Settings */}
                <button
                  id="settings-payment-settings-row"
                  onClick={() => setActiveSubView('payment_settings')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Lock className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Payment Settings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 3. Login Settings */}
                <button
                  id="settings-login-settings-row"
                  onClick={() => setActiveSubView('login_settings')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <KeyRound className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Login Settings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 4. Savings Settings */}
                <button
                  id="settings-savings-settings-row"
                  onClick={() => setActiveSubView('savings_settings')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <PiggyBank className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Savings Settings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>
              </div>

              {/* GROUP 2: Homepage Settings, Security Questions, SMS Alert Settings, Security Plus, Access to Clipboard, Themes */}
              <div 
                id="settings-group-2"
                className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden shadow-sm"
              >
                {/* 5. Homepage Settings */}
                <button
                  id="settings-homepage-settings-row"
                  onClick={() => setActiveSubView('homepage_settings')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Home className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Homepage Settings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 6. Security Questions */}
                <button
                  id="settings-security-questions-row"
                  onClick={() => setActiveSubView('security_questions')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldAlert className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Security Questions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-medium text-[#F59E0B]">
                      {securityQuestionsSet ? 'Set' : 'Not Set'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                  </div>
                </button>

                {/* 7. SMS Alert Settings */}
                <button
                  id="settings-sms-alerts-row"
                  onClick={() => setActiveSubView('sms_alerts')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <MessageSquare className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      SMS Alert Settings
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 8. Security Plus */}
                <button
                  id="settings-security-plus-row"
                  onClick={() => setActiveSubView('security_plus')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldPlus className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Security Plus
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 9. Access to Clipboard */}
                <button
                  id="settings-clipboard-access-row"
                  onClick={() => setActiveSubView('clipboard_access')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Clipboard className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Access to Clipboard
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 10. Themes */}
                <button
                  id="settings-themes-row"
                  onClick={() => setActiveSubView('themes')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Sun className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Themes
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>
              </div>

              {/* GROUP 3: Security Center, Feedback and Suggestions */}
              <div 
                id="settings-group-3"
                className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden shadow-sm"
              >
                {/* 11. Security Center */}
                <button
                  id="settings-security-center-row"
                  onClick={() => setActiveSubView('security_center')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <ShieldCheck className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Security Center
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>

                {/* 12. Feedback and Suggestions */}
                <button
                  id="settings-feedback-row"
                  onClick={() => setActiveSubView('feedback')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <FileEdit className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      Feedback and Suggestions
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>
              </div>

              {/* GROUP 4: close account */}
              <div 
                id="settings-group-4"
                className="rounded-2xl bg-[#202328] overflow-hidden shadow-sm"
              >
                <button
                  id="settings-close-account-row"
                  onClick={() => setShowCloseAccountModal(true)}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Power className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      close account
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                </button>
              </div>

              {/* GROUP 5: about */}
              <div 
                id="settings-group-5"
                className="rounded-2xl bg-[#202328] overflow-hidden shadow-sm"
              >
                <button
                  id="settings-about-row"
                  onClick={() => setActiveSubView('about')}
                  className="flex w-full items-center justify-between px-4 py-4 hover:bg-[#262A30] active:bg-[#2B2F36] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <AlertCircle className="h-5 w-5 text-[#00D589] stroke-[2.2]" />
                    <span className="text-[14.5px] font-medium text-white">
                      about
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#FF334B] px-2 py-0.5 text-[10px] font-black text-white tracking-wide uppercase shadow-sm">
                      New
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#757983] group-hover:text-slate-200 transition-colors" />
                  </div>
                </button>
              </div>

              {/* Sign Out Button (Matching standalone button at bottom of IMG_2600.png) */}
              <div className="pt-1 pb-4">
                <button
                  id="settings-sign-out-btn"
                  onClick={() => setShowSignOutConfirm(true)}
                  className="w-full rounded-2xl bg-[#202328] hover:bg-[#282C33] active:bg-[#2E333C] py-4 text-center text-[15px] font-semibold text-white transition-all shadow-sm cursor-pointer"
                >
                  Sign Out
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: MY PROFILE                                      */}
        {/* ========================================================= */}
        {activeSubView === 'my_profile' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                My Profile
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-12 scrollbar-none">
              {/* Profile Card */}
              <div className="rounded-2xl bg-[#202328] p-5 flex flex-col items-center shadow-sm">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => {
                    setPhotoPreview(userProfile.avatarUrl || null);
                    setShowPhotoModal(true);
                  }}
                >
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[#00D589]/50 bg-slate-800 shadow-md">
                    {userProfile.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.name} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-700 text-white font-bold text-xl">
                        {userProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex h-7 items-center justify-center bg-black/60 rounded-b-full text-white backdrop-blur-[2px] group-hover:bg-[#00D589]/80 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <h3 className="text-base font-bold text-white tracking-wide uppercase">
                    {userProfile.name}
                  </h3>
                  <button
                    onClick={() => {
                      setPhotoPreview(userProfile.avatarUrl || null);
                      setShowPhotoModal(true);
                    }}
                    className="text-[11px] text-[#00D589] hover:underline font-semibold"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="w-full mt-5 space-y-3.5 pt-3 border-t border-slate-700/40 text-xs sm:text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">OPay Account Number</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-200 font-medium">
                      <span>{userProfile.accountNumber || '7075817357'}</span>
                      <button onClick={copyAccountNumber} className="p-0.5 text-slate-400 hover:text-white cursor-pointer">
                        {copied ? <Check className="h-3.5 w-3.5 text-[#00D589]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Tier</span>
                    <div className="flex items-center gap-1 rounded-full bg-[#E5B54F]/20 border border-[#E5B54F]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#F4C563]">
                      <span>🥉 Tier 3 Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="rounded-2xl bg-[#202328] p-4 space-y-3.5 text-xs sm:text-[13px]">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-400 shrink-0">Full Name</span>
                  <span className="text-right font-medium text-slate-200 uppercase">
                    {userProfile.fullName || 'MUSARAF OLAWALE ABDULAZEEZ'}
                  </span>
                </div>

                <div 
                  onClick={() => {
                    setEditingField('mobile');
                    setFieldValue(userProfile.phone);
                  }}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-slate-400 shrink-0">Mobile Number</span>
                  <div className="flex items-center gap-1 text-slate-200 font-mono">
                    <span>{userProfile.phone || '+2347075817357'}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setEditingField('nickname');
                    setFieldValue(userProfile.nickname || '');
                  }}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-slate-400 shrink-0">Nickname</span>
                  <div className="flex items-center gap-1">
                    <span className={userProfile.nickname ? "text-slate-200 font-medium" : "text-slate-500"}>
                      {userProfile.nickname || 'Enter Nickname'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 shrink-0">Gender</span>
                  <span className="text-slate-200">{userProfile.gender || 'Male'}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 shrink-0">Date of birth</span>
                  <span className="text-slate-200 font-mono">{userProfile.dob || '**-**-13'}</span>
                </div>

                <div 
                  onClick={() => {
                    setEditingField('email');
                    setFieldValue(userProfile.email);
                  }}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-slate-400 shrink-0">Email</span>
                  <div className="flex items-center gap-1 text-slate-200">
                    <span>{userProfile.email || 'a*@gmail.com'}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setEditingField('address');
                    setFieldValue(userProfile.address || '');
                  }}
                  className="flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-slate-400 shrink-0">Address</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-200 truncate max-w-[180px]">
                      {userProfile.address || 'Set Address'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-slate-400 shrink-0">NIN Verification</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-slate-300">{currentUser?.ninMasked || '•••••••4821'}</span>
                    <span className="inline-flex items-center rounded-full bg-[#00D589]/15 px-2 py-0.5 text-[10px] font-bold text-[#00D589] border border-[#00D589]/30">
                      Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin / Owner Account Switching Portal */}
              {isOwnerOrAdmin(currentUser) && (
                <div className="rounded-2xl bg-[#202328] p-4 border border-emerald-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#00D589]" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Owner Switcher
                      </h4>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {registeredAccounts.length} Accounts
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={adminSearchQuery}
                      onChange={(e) => setAdminSearchQuery(e.target.value)}
                      placeholder="Search accounts..."
                      className="w-full rounded-xl bg-[#14171E] py-2 pl-9 pr-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                    {filteredAccounts.map((acc) => {
                      const isCurrent = acc.id === currentUser?.id;
                      return (
                        <button
                          key={acc.id}
                          onClick={() => {
                            if (!isCurrent) {
                              switchAccount(acc.id);
                              showToast(`Switched to ${acc.fullName}`);
                            }
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-[#14382A] border-[#00D589]/50 text-white'
                              : 'bg-[#181B22] border-slate-700/50 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isCurrent ? 'bg-[#00D589] text-[#082E1E]' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {acc.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold truncate">
                                {acc.fullName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {acc.phone} • ₦{(acc.balanceNgn || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-[#00D589]">Active</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: PAYMENT SETTINGS                                */}
        {/* ========================================================= */}
        {activeSubView === 'payment_settings' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Payment Settings
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Payment PIN</div>
                    <div className="text-xs text-slate-400">Used for transaction authorizations</div>
                  </div>
                  <button 
                    id="payment-settings-change-pin-btn"
                    onClick={handleOpenChangePin}
                    className="text-xs font-bold text-[#00D589] hover:underline cursor-pointer bg-[#00D589]/10 px-3 py-1.5 rounded-lg border border-[#00D589]/30"
                  >
                    Set / Change PIN
                  </button>
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Biometric Payment</div>
                    <div className="text-xs text-slate-400">Use Touch ID / Face ID for transfers</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={biometricPaymentEnabled}
                    onChange={(e) => {
                      setBiometricPaymentEnabled(e.target.checked);
                      showToast(e.target.checked ? 'Biometric payment enabled' : 'Biometric payment disabled');
                    }}
                    className="h-5 w-5 accent-[#00D589] rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Single Transaction Limit</div>
                    <div className="text-xs text-slate-400">Tier 3 daily limit: ₦5,000,000</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: LOGIN SETTINGS                                  */}
        {/* ========================================================= */}
        {activeSubView === 'login_settings' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Login Settings
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Change Login Password</div>
                    <div className="text-xs text-slate-400">Regularly update your 6-digit login password</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#757983]" />
                </div>

                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Biometric Login</div>
                    <div className="text-xs text-slate-400">Unlock OPay with Face ID or Fingerprint</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={biometricLoginEnabled}
                    onChange={(e) => {
                      setBiometricLoginEnabled(e.target.checked);
                      showToast(e.target.checked ? 'Biometric login enabled' : 'Biometric login disabled');
                    }}
                    className="h-5 w-5 accent-[#00D589] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: SAVINGS SETTINGS                                */}
        {/* ========================================================= */}
        {activeSubView === 'savings_settings' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Savings Settings
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="p-4">
                  <div className="text-sm font-medium text-white">Daily Interest Notification</div>
                  <div className="text-xs text-slate-400 mt-0.5">Receive alert when daily interest is paid into OWealth</div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-white">Auto-Save Schedule</div>
                  <div className="text-xs text-slate-400 mt-0.5">Manage automated savings deductions for SafeBox</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: HOMEPAGE SETTINGS                               */}
        {/* ========================================================= */}
        {activeSubView === 'homepage_settings' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Homepage Settings
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="p-4">
                  <div className="text-sm font-medium text-white">Quick Actions Customization</div>
                  <div className="text-xs text-slate-400 mt-0.5">Rearrange To OPay, To Bank and Withdraw shortcuts</div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-white">Recent Transactions Widget</div>
                  <div className="text-xs text-slate-400 mt-0.5">Display recent transfer records directly on Home screen</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: SECURITY QUESTIONS                              */}
        {/* ========================================================= */}
        {activeSubView === 'security_questions' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Security Questions
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] p-4 space-y-4">
                <p className="text-xs text-slate-300">
                  Security questions help verify your identity if you ever lose access to your device or forget your password.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Question 1</label>
                  <select 
                    value={q1}
                    onChange={(e) => setQ1(e.target.value)}
                    className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none"
                  >
                    <option>What was your childhood nickname?</option>
                    <option>What city were you born in?</option>
                    <option>What is your mother's maiden name?</option>
                  </select>
                  <input 
                    type="text"
                    value={a1}
                    onChange={(e) => setA1(e.target.value)}
                    placeholder="Enter answer for question 1"
                    className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none mt-2"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300">Question 2</label>
                  <select 
                    value={q2}
                    onChange={(e) => setQ2(e.target.value)}
                    className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none"
                  >
                    <option>What is the name of your first school?</option>
                    <option>What is your favorite food?</option>
                    <option>What was the make of your first car?</option>
                  </select>
                  <input 
                    type="text"
                    value={a2}
                    onChange={(e) => setA2(e.target.value)}
                    placeholder="Enter answer for question 2"
                    className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none mt-2"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!a1.trim() || !a2.trim()) {
                      showToast('Please provide answers for both questions');
                      return;
                    }
                    setSecurityQuestionsSet(true);
                    showToast('Security questions saved successfully');
                    setActiveSubView(null);
                  }}
                  className="w-full rounded-full bg-[#00D589] py-3.5 text-xs font-black text-[#082E1E] hover:bg-emerald-400 transition-colors uppercase tracking-wider cursor-pointer mt-2"
                >
                  Save Security Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: SMS ALERT SETTINGS                              */}
        {/* ========================================================= */}
        {activeSubView === 'sms_alerts' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                SMS Alert Settings
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Debit & Credit SMS Alerts</div>
                    <div className="text-xs text-slate-400">Receive immediate SMS notifications on mobile number</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={smsAlertsEnabled}
                    onChange={(e) => {
                      setSmsAlertsEnabled(e.target.checked);
                      showToast(e.target.checked ? 'SMS alerts enabled' : 'SMS alerts disabled');
                    }}
                    className="h-5 w-5 accent-[#00D589] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: SECURITY PLUS                                   */}
        {/* ========================================================= */}
        {activeSubView === 'security_plus' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Security Plus
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00D589]/15 text-[#00D589]">
                    <ShieldPlus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Security Plus Active</h3>
                    <p className="text-xs text-[#00D589]">Enhanced account fraud prevention</p>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-2">
                  Security Plus monitors abnormal device logins, detects SIM swap attacks, and encrypts your wallet transactions with real-time risk evaluation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: ACCESS TO CLIPBOARD                             */}
        {/* ========================================================= */}
        {activeSubView === 'clipboard_access' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Access to Clipboard
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-white">Smart Clipboard Detection</div>
                    <div className="text-xs text-slate-400">Automatically recognise copied account numbers for fast transfers</div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={clipboardAccessEnabled}
                    onChange={(e) => {
                      setClipboardAccessEnabled(e.target.checked);
                      showToast(e.target.checked ? 'Clipboard access enabled' : 'Clipboard access disabled');
                    }}
                    className="h-5 w-5 accent-[#00D589] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: THEMES                                          */}
        {/* ========================================================= */}
        {activeSubView === 'themes' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Themes
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedTheme('dark');
                    showToast('Dark Theme is selected');
                  }}
                  className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-white">Dark Theme (Default)</div>
                    <div className="text-xs text-slate-400">OPay high-contrast OLED dark experience</div>
                  </div>
                  {selectedTheme === 'dark' && <Check className="h-5 w-5 text-[#00D589]" />}
                </button>

                <button
                  onClick={() => {
                    setSelectedTheme('light');
                    showToast('Theme updated');
                  }}
                  className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-white">System Default</div>
                    <div className="text-xs text-slate-400">Match device system appearance</div>
                  </div>
                  {selectedTheme === 'light' && <Check className="h-5 w-5 text-[#00D589]" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: SECURITY CENTER                                 */}
        {/* ========================================================= */}
        {activeSubView === 'security_center' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Security Center
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] p-5 space-y-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00D589]/15 text-[#00D589] mx-auto">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-white">Security Score: 100%</h3>
                <p className="text-xs text-slate-300">
                  Your OPay account is fully protected by 2FA, biometric authentication, and tier-3 identity verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: FEEDBACK AND SUGGESTIONS                        */}
        {/* ========================================================= */}
        {activeSubView === 'feedback' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                Feedback & Suggestions
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-12 scrollbar-none">
              <div className="rounded-2xl bg-[#202328] p-4 space-y-3">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none"
                >
                  <option>General</option>
                  <option>Transfers & Payments</option>
                  <option>Cards</option>
                  <option>Savings & Loans</option>
                  <option>App Performance</option>
                </select>

                <label className="text-xs font-semibold text-slate-300 pt-2 block">Your Feedback</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  placeholder="Tell us what we can improve..."
                  className="w-full rounded-xl bg-[#14171E] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none resize-none"
                />

                <button
                  onClick={() => {
                    if (!feedbackText.trim()) {
                      showToast('Please type your feedback before submitting');
                      return;
                    }
                    showToast('Thank you for your feedback!');
                    setFeedbackText('');
                    setActiveSubView(null);
                  }}
                  className="w-full rounded-full bg-[#00D589] py-3.5 text-xs font-black text-[#082E1E] hover:bg-emerald-400 transition-colors uppercase tracking-wider cursor-pointer mt-2"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUB-VIEW: ABOUT                                           */}
        {/* ========================================================= */}
        {activeSubView === 'about' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-150">
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111215] border-b border-slate-800/40 z-10">
              <button
                onClick={() => setActiveSubView(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-100 hover:bg-[#202328] transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.2]" />
              </button>
              <h2 className="text-[17px] font-bold text-white tracking-tight">
                About OPay
              </h2>
              <div className="h-9 w-9" />
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-12 scrollbar-none text-center">
              <div className="rounded-2xl bg-[#202328] p-6 space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00E599] to-[#00B876] flex items-center justify-center text-[#062417] text-2xl font-black mx-auto shadow-md">
                  OP
                </div>
                <h3 className="text-base font-bold text-white">OPay App</h3>
                <p className="text-xs text-slate-400">Version 10.14.0 (Build 2026.09)</p>
                <div className="inline-flex items-center gap-1 rounded-full bg-[#FF334B]/15 border border-[#FF334B]/30 px-3 py-0.5 text-[11px] font-bold text-[#FF334B]">
                  Latest Version
                </div>
              </div>

              <div className="rounded-2xl bg-[#202328] divide-y divide-slate-700/20 text-left overflow-hidden text-xs sm:text-[13px]">
                <div className="p-3.5 text-slate-200">User Agreement</div>
                <div className="p-3.5 text-slate-200">Privacy Policy</div>
                <div className="p-3.5 text-slate-200">Licenses & Regulations</div>
              </div>

              <p className="text-[11px] text-slate-500 pt-2">
                Licensed by the Central Bank of Nigeria (CBN) and insured by NDIC.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SIGN OUT CONFIRMATION MODAL                               */}
        {/* ========================================================= */}
        {showSignOutConfirm && (
          <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#1C1F26] p-5 border border-slate-800 shadow-2xl text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center mx-auto">
                <Power className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Sign out of OPay?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  You will need to enter your registered phone number and 6-digit password to log back in.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSignOutConfirm(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-bold text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSignOutConfirm(false);
                    logoutUser(true);
                    onClose();
                  }}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-xs font-black text-white hover:bg-red-500 shadow cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CLOSE ACCOUNT MODAL                                       */}
        {/* ========================================================= */}
        {showCloseAccountModal && (
          <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#1C1F26] p-5 border border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <h3 className="text-sm font-bold text-white">Close Account</h3>
                <button onClick={() => setShowCloseAccountModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before closing your account, please ensure that your account balance is ₦0.00 and all pending transactions or savings deposits are settled.
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowCloseAccountModal(false);
                  showToast('Account closure request submitted for verification');
                }}
                className="w-full rounded-xl bg-red-600/90 py-3 text-xs font-bold text-white hover:bg-red-600 cursor-pointer"
              >
                Confirm Account Closure Request
              </button>
            </div>
          </div>
        )}

        {/* Edit Sub-Modal Drawer */}
        {editingField && (
          <div className="fixed inset-0 z-70 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#181B22] p-5 border border-slate-800 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white capitalize">
                  Edit {editingField}
                </h3>
                <button
                  onClick={() => setEditingField(null)}
                  className="rounded-full p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfileField} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block capitalize">
                    {editingField === 'avatar' ? 'Image URL' : editingField}
                  </label>
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    placeholder={
                      editingField === 'nickname' 
                        ? 'Enter nickname' 
                        : editingField === 'avatar'
                        ? 'Enter photo URL'
                        : `Enter ${editingField}`
                    }
                    className="w-full rounded-xl bg-[#121419] p-3 text-xs text-white border border-slate-700 focus:border-[#00D589] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#00D589] py-3 text-xs font-bold text-[#082E1E] hover:bg-emerald-400 shadow cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PROFILE PHOTO UPLOAD / CAMERA MODAL                       */}
        {/* ========================================================= */}
        {showPhotoModal && (
          <div className="fixed inset-0 z-80 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 animate-in fade-in backdrop-blur-sm">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#181B22] p-5 border border-slate-800 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Profile Photo</h3>
                  <p className="text-xs text-slate-400">Upload or take a new face photo</p>
                </div>
                <button
                  onClick={handleClosePhotoModal}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white bg-slate-800/80 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Hidden file inputs for gallery and camera */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="mt-4 flex flex-col items-center space-y-4">
                {/* Live Camera View or Preview or Avatar */}
                {cameraActive ? (
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#00D589] shadow-lg bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover mirror"
                    />
                  </div>
                ) : (
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-[#00D589]/60 shadow-xl bg-slate-900">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : userProfile.avatarUrl ? (
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-800 text-white text-3xl font-black">
                        {userProfile.name.charAt(0)}
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                {cameraActive ? (
                  <div className="flex items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel Camera
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#00D589] py-3 text-xs font-bold text-[#082E1E] hover:bg-emerald-400 shadow"
                    >
                      <Camera className="h-4 w-4" />
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#202328] hover:bg-[#282C33] border border-slate-700/60 py-3 px-3 text-xs font-semibold text-white transition-all shadow-sm"
                      >
                        <ImageIcon className="h-4 w-4 text-[#00D589]" />
                        <span>Choose Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center justify-center gap-2 rounded-xl bg-[#202328] hover:bg-[#282C33] border border-slate-700/60 py-3 px-3 text-xs font-semibold text-white transition-all shadow-sm"
                      >
                        <Camera className="h-4 w-4 text-[#00D589]" />
                        <span>Take Photo</span>
                      </button>
                    </div>

                    {photoPreview && photoPreview !== userProfile.avatarUrl && (
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(userProfile.avatarUrl || null)}
                          className="flex-1 rounded-xl bg-slate-800 py-3 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={handleSavePhoto}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#00D589] py-3 text-xs font-bold text-[#082E1E] hover:bg-emerald-400 shadow"
                        >
                          <Check className="h-4 w-4" />
                          Save Photo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* CHANGE PAYMENT PIN MODAL                                  */}
        {/* ========================================================= */}
        {showChangePinModal && (
          <div className="fixed inset-0 z-80 flex items-end sm:items-center justify-center bg-black/85 p-0 sm:p-4 animate-in fade-in backdrop-blur-sm">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#181B22] p-5 border border-slate-800 shadow-2xl text-white flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-[#00D589]" />
                  <h3 className="text-base font-bold text-white">Set Payment PIN</h3>
                </div>
                <button
                  onClick={() => setShowChangePinModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white bg-slate-800/80 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Steps indicator (2 steps: Set PIN & Confirm PIN) */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`h-1.5 flex-1 rounded-full ${pinStep === 'new' ? 'bg-[#00D589]' : 'bg-[#00D589]/40'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${pinStep === 'confirm' ? 'bg-[#00D589]' : 'bg-slate-700'}`} />
              </div>

              <div className="text-center mt-4">
                <h4 className="text-sm font-bold text-white">
                  {pinStep === 'new' ? 'Set 4-Digit Payment PIN' : 'Confirm 4-Digit PIN'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {pinStep === 'new' 
                    ? 'Enter a 4-digit PIN for authorizing transfers and payments' 
                    : 'Re-enter your 4-digit PIN to confirm'}
                </p>
              </div>

              {/* PIN Bubbles Display */}
              <div className="flex items-center justify-center gap-4 my-6">
                {[0, 1, 2, 3].map((index) => {
                  const activeInput = pinStep === 'new' ? newPinInput : confirmPinInput;
                  const isFilled = index < activeInput.length;
                  const val = activeInput[index];

                  return (
                    <div
                      key={index}
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 transition-all font-mono font-bold text-lg ${
                        isFilled
                          ? 'border-[#00D589] bg-[#00D589]/15 text-white shadow-[0_0_12px_rgba(0,213,137,0.2)]'
                          : 'border-slate-700 bg-[#121419] text-slate-500'
                      }`}
                    >
                      {isFilled ? (showPinChars ? val : '•') : ''}
                    </div>
                  );
                })}
              </div>

              {/* Show/Hide PIN toggle */}
              <div className="flex items-center justify-center mb-2">
                <button
                  type="button"
                  onClick={() => setShowPinChars(!showPinChars)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPinChars ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{showPinChars ? 'Hide Digits' : 'Show Digits'}</span>
                </button>
              </div>

              {/* Error message */}
              {pinError && (
                <div className="mb-3 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 mt-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handlePinDigitPress(digit)}
                    disabled={pinLoading}
                    className="h-12 rounded-xl bg-[#202328] hover:bg-[#282C33] active:bg-[#2E333C] text-lg font-bold text-white transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    {digit}
                  </button>
                ))}

                {/* Back / Navigation button */}
                <button
                  type="button"
                  onClick={() => {
                    if (pinStep === 'confirm') {
                      setPinStep('new');
                      setConfirmPinInput('');
                    }
                  }}
                  disabled={pinStep === 'new' || pinLoading}
                  className="h-12 rounded-xl bg-[#202328]/60 text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center disabled:opacity-0 cursor-pointer disabled:cursor-default"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => handlePinDigitPress('0')}
                  disabled={pinLoading}
                  className="h-12 rounded-xl bg-[#202328] hover:bg-[#282C33] active:bg-[#2E333C] text-lg font-bold text-white transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handlePinBackspace}
                  disabled={pinLoading}
                  className="h-12 rounded-xl bg-[#202328] hover:bg-[#282C33] text-slate-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  ⌫
                </button>
              </div>

              {/* Confirm action */}
              {pinStep === 'confirm' && confirmPinInput.length === 4 && (
                <button
                  type="button"
                  onClick={handleExecuteChangePin}
                  disabled={pinLoading}
                  className="mt-4 w-full rounded-xl bg-[#00D589] py-3.5 text-sm font-black text-[#082E1E] hover:bg-[#00E599] active:scale-[0.99] transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pinLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Payment PIN...</span>
                    </div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Save Payment PIN</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
