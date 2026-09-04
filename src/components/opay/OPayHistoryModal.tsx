import React, { useState } from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { Transaction } from '../../types';
import { formatNgn, formatHistoryRowDate } from '../../utils/formatters';
import { 
  ChevronLeft, 
  ChevronDown, 
  Building2, 
  ArrowUp, 
  ArrowDown, 
  Percent, 
  Smartphone, 
  Download, 
  Check, 
  X,
  PieChart,
  Filter
} from 'lucide-react';
import { OPayReceiptModal } from './OPayReceiptModal';

interface OPayHistoryModalProps {
  onClose: () => void;
}

export const OPayHistoryModal: React.FC<OPayHistoryModalProps> = ({ onClose }) => {
  const { transactions } = useDemoWallet();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'transfer' | 'inflow' | 'outflow' | 'bills' | 'interest'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'successful' | 'processing' | 'failed'>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Aug');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleDownloadStatement = () => {
    // Generate simple statement CSV
    const headers = 'Date,Reference,Title,Type,Amount (NGN),Status\n';
    const rows = transactions.map(t => 
      `"${formatHistoryRowDate(t.timestamp)}","${t.reference}","${t.title}","${t.type}","${t.category === 'inflow' ? '+' : '-'}${t.amountNgn}","${t.status}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OPay_Statement_${selectedMonth}_2026.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Transaction statement downloaded successfully');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Category filter
    if (categoryFilter === 'inflow' && tx.category !== 'inflow') return false;
    if (categoryFilter === 'outflow' && tx.category !== 'outflow') return false;
    if (categoryFilter === 'transfer' && tx.type !== 'op_transfer' && tx.type !== 'bank_transfer') return false;
    if (categoryFilter === 'bills' && tx.type !== 'airtime' && tx.type !== 'data' && tx.type !== 'withdraw') return false;
    if (categoryFilter === 'interest' && !tx.title.toLowerCase().includes('interest')) return false;

    // Status filter
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;

    return true;
  });

  // Calculate In and Out totals for the month dynamically from transactions
  const computedIn = transactions.filter((t) => t.category === 'inflow').reduce((sum, t) => sum + t.amountNgn, 0);
  const computedOut = transactions.filter((t) => t.category === 'outflow').reduce((sum, t) => sum + t.amountNgn, 0);
  const totalIn = computedIn > 0 ? computedIn : 75369.66;
  const totalOut = computedOut > 0 ? computedOut : 75332.86;

  // Render appropriate icon matching reference screenshot
  const renderTxIcon = (tx: Transaction) => {
    const titleLower = tx.title.toLowerCase();

    // 1. OWealth Interest -> Lavender circle with purple %
    if (titleLower.includes('owealth') || titleLower.includes('interest')) {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAE2FB] text-[#7C3AED] shadow-sm">
          <Percent className="h-5 w-5 stroke-[2.5]" />
        </div>
      );
    }

    // 2. USSD Charge -> White circle with green SIM/phone icon
    if (titleLower.includes('ussd') || tx.type === 'airtime' || tx.type === 'data') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#00D589] shadow-sm">
          <Smartphone className="h-5 w-5 stroke-[2.5]" />
        </div>
      );
    }

    // 3. Store/Merchant/Bank Outflow transfers like Funmilayo Adenekan or Lateefat -> White circle with black building
    if (titleLower.includes('funmilayo') || titleLower.includes('lateefat') || tx.recipient.bankName !== 'OPay') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#161922] shadow-sm">
          <Building2 className="h-5 w-5 stroke-[2]" />
        </div>
      );
    }

    // 4. Inflow Transfer -> White circle with green arrow down
    if (tx.category === 'inflow') {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#00D589] shadow-sm">
          <ArrowDown className="h-5 w-5 stroke-[2.5]" />
        </div>
      );
    }

    // 5. Outflow Transfer / Stamp duty -> White circle with green arrow up
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#00D589] shadow-sm">
        <ArrowUp className="h-5 w-5 stroke-[2.5]" />
      </div>
    );
  };

  // Truncate title matching the mobile reference if long
  const formatDisplayTitle = (title: string) => {
    if (title.length > 28) {
      return `${title.slice(0, 25)}...`;
    }
    return title;
  };

  return (
    <div 
      id="opay-transactions-screen"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150 overflow-hidden"
    >
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 z-60 rounded-full bg-slate-800/95 px-4 py-2 text-xs font-semibold text-white shadow-xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-3.5 w-3.5 text-[#00D589]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div 
        className="relative flex flex-col w-full max-w-md h-full sm:h-[92vh] sm:rounded-3xl bg-[#111317] text-white shadow-2xl border-0 sm:border border-slate-800/80 overflow-hidden"
      >
        {/* 1. Header Bar matching reference: Left Chevron, Center "Transactions", Right Green "Download" */}
        <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111317] border-b border-slate-800/40 z-20">
          <button
            id="close-transactions-back-btn"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>

          <h1 className="text-base font-bold text-slate-100 tracking-tight">
            Transactions
          </h1>

          <button
            id="download-statement-btn"
            onClick={handleDownloadStatement}
            className="text-sm font-semibold text-[#00D589] hover:opacity-80 transition-opacity px-1"
          >
            Download
          </button>
        </header>

        {/* 2. Top Filter Pills matching IMG_2419.jpeg exactly: All Categories ▾ | All Status ▾ */}
        <div className="shrink-0 px-4 pt-2 pb-2.5 grid grid-cols-2 gap-3 relative z-30">
          {/* Category Dropdown Pill */}
          <div className="relative">
            <button
              id="filter-category-dropdown-btn"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowStatusDropdown(false);
              }}
              className="w-full flex items-center justify-between rounded-xl bg-[#1A1D23] px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-300 border border-slate-800/80 hover:border-slate-700 hover:text-white transition-all shadow-sm active:scale-[0.99]"
            >
              <span className="truncate font-medium text-slate-200">
                {categoryFilter === 'all'
                  ? 'All Categories'
                  : categoryFilter === 'transfer'
                  ? 'Transfers'
                  : categoryFilter === 'inflow'
                  ? 'Inflow'
                  : categoryFilter === 'outflow'
                  ? 'Outflow'
                  : categoryFilter === 'interest'
                  ? 'OWealth Interest'
                  : 'Bills & Charges'}
              </span>
              <span className="text-[9px] text-slate-400 shrink-0 ml-1.5 opacity-90">▼</span>
            </button>

            {showCategoryDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowCategoryDropdown(false)} 
                />
                <div className="absolute left-0 top-full mt-1.5 w-48 rounded-2xl bg-[#1B1E24] p-1.5 border border-slate-700 shadow-2xl z-40 space-y-0.5 text-xs">
                  {[
                    { key: 'all', label: 'All Categories' },
                    { key: 'transfer', label: 'Transfers' },
                    { key: 'inflow', label: 'Inflow' },
                    { key: 'outflow', label: 'Outflow' },
                    { key: 'interest', label: 'OWealth Interest' },
                    { key: 'bills', label: 'Bills & Charges' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setCategoryFilter(item.key as any);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                        categoryFilter === item.key 
                          ? 'bg-[#00D589] text-[#082E1E] font-bold' 
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {categoryFilter === item.key && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Status Dropdown Pill */}
          <div className="relative">
            <button
              id="filter-status-dropdown-btn"
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowCategoryDropdown(false);
              }}
              className="w-full flex items-center justify-between rounded-xl bg-[#1A1D23] px-3.5 py-2.5 text-xs sm:text-[13px] text-slate-300 border border-slate-800/80 hover:border-slate-700 hover:text-white transition-all shadow-sm active:scale-[0.99]"
            >
              <span className="truncate font-medium text-slate-200">
                {statusFilter === 'all'
                  ? 'All Status'
                  : statusFilter === 'successful'
                  ? 'Successful'
                  : statusFilter === 'processing'
                  ? 'Processing'
                  : 'Failed'}
              </span>
              <span className="text-[9px] text-slate-400 shrink-0 ml-1.5 opacity-90">▼</span>
            </button>

            {showStatusDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setShowStatusDropdown(false)} 
                />
                <div className="absolute right-0 top-full mt-1.5 w-40 rounded-2xl bg-[#1B1E24] p-1.5 border border-slate-700 shadow-2xl z-40 space-y-0.5 text-xs">
                  {[
                    { key: 'all', label: 'All Status' },
                    { key: 'successful', label: 'Successful' },
                    { key: 'processing', label: 'Processing' },
                    { key: 'failed', label: 'Failed' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => {
                        setStatusFilter(item.key as any);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                        statusFilter === item.key 
                          ? 'bg-[#00D589] text-[#082E1E] font-bold' 
                          : 'text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <span>{item.label}</span>
                      {statusFilter === item.key && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. Main Transaction Card Container matching reference */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-12 scrollbar-none">
          <div 
            id="transactions-list-card"
            className="rounded-2xl bg-[#1B1E24] p-4 sm:p-5 border border-slate-800/60 shadow-sm"
          >
            {/* Card Header: Aug ▾ | In ₦75,369.66  Out ₦75,332.86 | Analysis */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/60">
              <div className="space-y-0.5">
                {/* Month selector */}
                <div 
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="flex items-center gap-1 text-sm font-bold text-white cursor-pointer hover:text-slate-300 transition-colors inline-flex"
                >
                  <span>{selectedMonth}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* In and Out statement amounts */}
                <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
                  <span>In <span className="font-sans font-semibold text-white">{formatNgn(totalIn)}</span></span>
                  <span>Out <span className="font-sans font-semibold text-white">{formatNgn(totalOut)}</span></span>
                </div>
              </div>

              {/* Analysis Pill Button */}
              <button
                id="spending-analysis-btn"
                onClick={() => setShowAnalysisModal(true)}
                className="rounded-full bg-[#133F32] px-3.5 py-1.5 text-xs font-bold text-[#00D589] border border-[#00D589]/20 hover:bg-[#1a4f40] active:scale-95 transition-all shadow-sm"
              >
                Analysis
              </button>
            </div>

            {/* Month Dropdown if opened */}
            {showMonthDropdown && (
              <div className="my-2 p-2 rounded-xl bg-[#14171C] border border-slate-700 flex gap-2 overflow-x-auto text-xs">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      setShowMonthDropdown(false);
                    }}
                    className={`px-3 py-1 rounded-full whitespace-nowrap ${
                      selectedMonth === m ? 'bg-[#00D589] text-[#082E1E] font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {/* Transaction Rows List matching reference screenshot */}
            <div className="divide-y divide-slate-800/40">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Filter className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <span>No transactions matching selected filters</span>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isInflow = tx.category === 'inflow';
                  const isPositive = isInflow || tx.amountNgn === 0.09;

                  return (
                    <div
                      key={tx.id}
                      id={`tx-item-${tx.id}`}
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between py-3.5 cursor-pointer hover:bg-slate-800/30 rounded-xl px-1.5 transition-colors group"
                    >
                      {/* Left: Icon + Title & Timestamp */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {renderTxIcon(tx)}

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs sm:text-[13px] font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                            {formatDisplayTitle(tx.title)}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {formatHistoryRowDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Successful badge */}
                      <div className="text-right shrink-0">
                        <div 
                          className={`text-xs sm:text-[13px] font-bold tracking-tight font-sans ${
                            isPositive ? 'text-[#00D589]' : 'text-white'
                          }`}
                        >
                          {isPositive ? `+${formatNgn(tx.amountNgn)}` : `-${formatNgn(tx.amountNgn)}`}
                        </div>
                        <div className="text-[11px] font-medium text-[#00D589] mt-0.5">
                          Successful
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Analytics Breakdown Modal */}
        {showAnalysisModal && (
          <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#181B22] p-5 border border-slate-800 shadow-2xl text-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-[#00D589]" />
                  <h3 className="text-sm font-bold text-white">
                    {selectedMonth} 2026 Spending Analysis
                  </h3>
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="rounded-full p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#121419] p-3 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Total Inflow</div>
                    <div className="text-base font-extrabold text-[#00D589] mt-1">{formatNgn(totalIn)}</div>
                  </div>
                  <div className="rounded-2xl bg-[#121419] p-3 border border-slate-800">
                    <div className="text-slate-400 text-[11px]">Total Outflow</div>
                    <div className="text-base font-extrabold text-white mt-1">{formatNgn(totalOut)}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-slate-400 text-[11px] font-semibold">Breakdown by Channel</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-[#121419] p-2.5 rounded-xl">
                      <span className="text-slate-300">Bank Transfers</span>
                      <span className="font-bold text-white">₦65,200.00 (86.5%)</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#121419] p-2.5 rounded-xl">
                      <span className="text-slate-300">Airtime & Bills</span>
                      <span className="font-bold text-white">₦10,072.86 (13.4%)</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#121419] p-2.5 rounded-xl">
                      <span className="text-slate-300">OWealth Interest Yield</span>
                      <span className="font-bold text-[#00D589]">+₦60.00</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="w-full rounded-full bg-[#00D589] py-3 text-xs font-bold text-[#082E1E] hover:bg-emerald-400"
                >
                  Close Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Receipt Details Modal matching IMG_2414.png */}
        {selectedTx && (
          <OPayReceiptModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
            onViewRecords={() => setSelectedTx(null)}
          />
        )}
      </div>
    </div>
  );
};
