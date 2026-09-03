/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DemoWalletProvider, useDemoWallet } from './context/DemoWalletContext';
import { NotificationToast } from './components/common/NotificationToast';
import { OPayApp } from './components/opay/OPayApp';
import { OPayNotificationsModal } from './components/opay/OPayNotificationsModal';
import { OPaySplashScreen } from './components/opay/OPaySplashScreen';
import { OPayAuthScreen } from './components/opay/auth/OPayAuthScreen';

function AppContent() {
  const [showGlobalNotifications, setShowGlobalNotifications] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300 antialiased">
      {/* 1. App Startup Splash Screen matching IMG_2422.png */}
      {showSplash && (
        <OPaySplashScreen 
          duration={2200}
          onFinish={() => setShowSplash(false)} 
        />
      )}

      {/* Floating In-App Toast Notification */}
      <NotificationToast 
        onViewNotification={() => setShowGlobalNotifications(true)} 
      />

      {/* Main Standalone OPay Bank Application Canvas */}
      <main className="flex-1 w-full flex flex-col items-center justify-start sm:py-4">
        <OPayApp />
      </main>

      {/* Global Notifications Modal */}
      {showGlobalNotifications && (
        <OPayNotificationsModal onClose={() => setShowGlobalNotifications(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <DemoWalletProvider>
      <AppContent />
    </DemoWalletProvider>
  );
}

