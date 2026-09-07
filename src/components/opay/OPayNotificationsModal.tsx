import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { DemoNotification } from '../../types';
import { formatTimestamp, formatNgn } from '../../utils/formatters';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ArrowDownLeft, 
  Sparkles, 
  ShieldAlert, 
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { OPayReceiptModal } from './OPayReceiptModal';

interface OPayNotificationsModalProps {
  onClose: () => void;
}

export const OPayNotificationsModal: React.FC<OPayNotificationsModalProps> = ({ onClose }) => {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotification,
    transactions 
  } = useDemoWallet();

  const [activeFilter, setActiveFilter] = useState<'all' | 'transaction' | 'promo' | 'system'>('all');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const selectedTransaction = transactions.find(t => t.id === selectedTxId) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="opay-notifications-modal"
        className="relative flex h-[90vh] sm:h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[#14171C] border border-slate-800 shadow-2xl text-slate-100 my-auto"
      >
        {/* Header with Top-Left Back Button */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3.5 bg-[#1B1E24] shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="notifications-back-btn"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              aria-label="Go Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-[#00D589]">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">Notifications</h2>
              <p className="text-[10px] text-slate-400">
                {unreadNotificationCount} unread alert{unreadNotificationCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={markAllNotificationsAsRead}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-slate-700 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-800/60 bg-[#171A21] px-4 py-2 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`rounded-full px-3 py-1 font-semibold transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#00D589] text-[#0B3322]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('transaction')}
            className={`rounded-full px-3 py-1 font-semibold transition-colors ${
              activeFilter === 'transaction'
                ? 'bg-[#00D589] text-[#0B3322]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveFilter('promo')}
            className={`rounded-full px-3 py-1 font-semibold transition-colors ${
              activeFilter === 'promo'
                ? 'bg-[#00D589] text-[#0B3322]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Promos
          </button>
          <button
            onClick={() => setActiveFilter('system')}
            className={`rounded-full px-3 py-1 font-semibold transition-colors ${
              activeFilter === 'system'
                ? 'bg-[#00D589] text-[#0B3322]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System
          </button>
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
              <Bell className="h-10 w-10 stroke-[1.5] mb-2 opacity-30" />
              <p className="text-sm font-medium">No notifications in this category</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isTransaction = notif.type === 'transaction';
              const isPromo = notif.type === 'promo';

              return (
                <div
                  key={notif.id}
                  id={`notif-item-${notif.id}`}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.transactionId) {
                      setSelectedTxId(notif.transactionId);
                    }
                  }}
                  className={`relative rounded-2xl p-3.5 border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-[#181B22] border-slate-800/60 text-slate-300'
                      : 'bg-[#1D222C] border-emerald-500/40 text-white shadow-md'
                  }`}
                >
                  {!notif.read && (
                    <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}

                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isTransaction
                          ? 'bg-emerald-500/20 text-[#00D589]'
                          : isPromo
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {isTransaction ? (
                        <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                      ) : isPromo ? (
                        <Sparkles className="h-4 w-4" />
                      ) : (
                        <Info className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1 pr-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white leading-tight">
                          {notif.title}
                        </h4>
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-slate-300">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {formatTimestamp(notif.timestamp)}
                        </span>
                        {notif.transactionId && (
                          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5 hover:underline">
                            View Receipt <ChevronRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/80 bg-[#161920] p-3 text-center text-[11px] text-slate-500">
          Real-time Transaction & Security Alerts
        </div>

        {/* Receipt submodal if user clicked transaction notification */}
        {selectedTransaction && (
          <OPayReceiptModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTxId(null)}
          />
        )}
      </div>
    </div>
  );
};
