import React, { useState, useRef } from 'react';
import { Transaction } from '../../types';
import { 
  formatNgn, 
  formatFullOpayDate, 
  formatPhoneWithSpaces, 
  formatMaskedOpayPhone,
  formatOpayTransactionNumber 
} from '../../utils/formatters';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { 
  ChevronLeft, 
  ChevronRight,
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  User, 
  Image as ImageIcon, 
  FileText,
  Headphones,
  Share2
} from 'lucide-react';

interface OPayReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onTransferAgain?: (tx: Transaction) => void;
  onViewRecords?: () => void;
  initialMode?: 'details' | 'share';
}

export const OPayReceiptModal: React.FC<OPayReceiptModalProps> = ({ 
  transaction, 
  onClose,
  onTransferAgain,
  onViewRecords,
  initialMode = 'details'
}) => {
  const { userProfile } = useDemoWallet();
  const [viewMode, setViewMode] = useState<'details' | 'share'>(initialMode);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const receiptCardRef = useRef<HTMLDivElement | null>(null);

  if (!transaction) return null;

  // 24-digit official transaction number
  const txNumber = formatOpayTransactionNumber(transaction.reference, transaction.timestamp);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyTxNumber = () => {
    navigator.clipboard.writeText(txNumber).catch(() => {});
    setCopied(true);
    showToast('Transaction No. copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReportIssue = () => {
    showToast(`Support inquiry opened for #${txNumber.slice(-6)}`);
  };

  // Recipient details
  const rawRecipientName = transaction.recipient?.name || 'nurudeen onidanla jimoh';
  const recipientName = rawRecipientName;
  const recipientBank = transaction.recipient?.bankName || 'OPay';
  const recipientRawPhone = transaction.recipient?.accountOrPhone || '7048452742';
  const recipientPhoneFormatted = formatPhoneWithSpaces(recipientRawPhone);
  const recipientPhoneMasked = formatMaskedOpayPhone(recipientRawPhone);

  // Sender details
  const senderFullName = userProfile?.fullName || transaction.sender?.name || 'MUSARAF OLAWALE ABDULAZEEZ';
  const senderBank = transaction.sender?.bankName || 'OPay';
  const senderRawPhone = userProfile?.phone || transaction.sender?.accountOrPhone || '7075817357';
  const senderPhoneMasked = formatMaskedOpayPhone(senderRawPhone);

  // Date formatting: "Sep 2nd, 2026 20:02:37"
  const formattedDate = formatFullOpayDate(transaction.timestamp);

  // Download / Share as Image
  const handleShareAsImage = async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 750;
      canvas.height = 1100;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Background
      ctx.fillStyle = '#111317';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Receipt Card
      const cardX = 40;
      const cardY = 60;
      const cardW = 670;
      const cardH = 920;
      const radius = 24;

      ctx.fillStyle = '#1C1E22';
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, radius);
      ctx.fill();

      // Card Header
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('OPay', cardX + 40, cardY + 70);

      ctx.fillStyle = '#8E929C';
      ctx.font = '500 24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('Transaction Receipt', cardX + cardW - 40, cardY + 70);

      // Amount (Emerald green)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00D589';
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText(`₦${transaction.amountNgn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, cardX + cardW / 2, cardY + 170);

      // Status
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('Successful', cardX + cardW / 2, cardY + 220);

      // Date
      ctx.fillStyle = '#8E929C';
      ctx.font = '20px sans-serif';
      ctx.fillText(formattedDate, cardX + cardW / 2, cardY + 260);

      // Dashed Line
      ctx.strokeStyle = '#32363F';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(cardX + 40, cardY + 300);
      ctx.lineTo(cardX + cardW - 40, cardY + 300);
      ctx.stroke();
      ctx.setLineDash([]);

      // Row 1: Recipient
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8E929C';
      ctx.font = '22px sans-serif';
      ctx.fillText('Recipient Details', cardX + 40, cardY + 360);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(recipientName, cardX + cardW - 40, cardY + 360);
      ctx.fillStyle = '#8E929C';
      ctx.font = '20px sans-serif';
      ctx.fillText(`${recipientBank} | ${recipientPhoneMasked}`, cardX + cardW - 40, cardY + 395);

      // Row 2: Sender
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8E929C';
      ctx.font = '22px sans-serif';
      ctx.fillText('Sender Details', cardX + 40, cardY + 470);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(senderFullName, cardX + cardW - 40, cardY + 470);
      ctx.fillStyle = '#8E929C';
      ctx.font = '20px sans-serif';
      ctx.fillText(`${senderBank} | ${senderPhoneMasked}`, cardX + cardW - 40, cardY + 505);

      // Row 3: Transaction No.
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8E929C';
      ctx.font = '22px sans-serif';
      ctx.fillText('Transaction No.', cardX + 40, cardY + 580);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px monospace';
      ctx.fillText(txNumber, cardX + cardW - 40, cardY + 580);

      // Dashed Line
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(cardX + 40, cardY + 630);
      ctx.lineTo(cardX + cardW - 40, cardY + 630);
      ctx.stroke();
      ctx.setLineDash([]);

      // Regulatory Text
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8E929C';
      ctx.font = '18px sans-serif';
      const disclaimer = 'Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.';
      
      // Wrap text
      const words = disclaimer.split(' ');
      let line = '';
      let textY = cardY + 680;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > (cardW - 80) && n > 0) {
          ctx.fillText(line, cardX + 40, textY);
          line = words[n] + ' ';
          textY += 28;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, cardX + 40, textY);

      // Export as PNG
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `OPay_Receipt_${txNumber}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showToast('Receipt downloaded as image');
    } catch (e) {
      showToast('Receipt saved to clipboard');
    }
  };

  // Share as PDF
  const handleShareAsPdf = () => {
    window.print();
    showToast('Opening print dialog for PDF...');
  };

  return (
    <div 
      id="opay-receipt-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 sm:p-4 backdrop-blur-sm overflow-hidden select-none animate-in fade-in duration-150"
    >
      {/* Toast message notification */}
      {toastMessage && (
        <div className="fixed top-6 z-60 rounded-full bg-slate-900/95 px-4 py-2 text-xs font-semibold text-white shadow-2xl border border-slate-700 flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-3.5 w-3.5 text-[#00D589]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative flex flex-col w-full max-w-[430px] h-full sm:h-[92vh] sm:rounded-[36px] bg-[#111317] text-white shadow-2xl border-0 sm:border border-slate-800/80 overflow-hidden">
        
        {/* ============================================================ */}
        {/* SCREEN 1: TRANSACTION DETAILS (IMG_2680.png)                 */}
        {/* ============================================================ */}
        {viewMode === 'details' && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Navigation Bar: <   Transaction Details   User Icon */}
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111317] border-b border-transparent z-10">
              <button
                id="details-back-btn"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200 hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
              </button>

              <h1 className="text-base font-bold text-white tracking-tight">
                Transaction Details
              </h1>

              <div className="flex h-9 w-9 items-center justify-center">
                {/* Profile outline icon in emerald green matching IMG_2680 */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-[1.5px] border-[#00D589] text-[#00D589]">
                  <User className="h-4 w-4 stroke-[2.2]" />
                </div>
              </div>
            </header>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2 space-y-3 pb-8 scrollbar-none">
              
              {/* Card 1: Top Summary Card (IMG_2680.png) */}
              <div 
                id="tx-details-top-card"
                className="rounded-[20px] bg-[#1C1E22] p-5 pt-6 pb-6 flex flex-col items-center justify-center text-center shadow-md border border-white/[0.04]"
              >
                {/* White circle with OPay emerald green logo inside */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg mb-3.5">
                  <svg viewBox="0 0 36 36" className="h-7 w-7" fill="none">
                    {/* Emerald Teal OPay circular ring with signature opening */}
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="11" 
                      stroke="#00D589" 
                      strokeWidth="4.5" 
                      strokeDasharray="56 16"
                      strokeLinecap="round"
                      transform="rotate(-55 18 18)"
                    />
                    <circle cx="24.5" cy="11.5" r="2.2" fill="#00D589" />
                  </svg>
                </div>

                {/* Subtitle: Transfer to nurudeen onidanla jimoh */}
                <div className="text-[13px] font-normal text-slate-300 max-w-[300px] truncate leading-tight">
                  Transfer to {recipientName}
                </div>

                {/* Big Amount: ₦500.00 */}
                <div className="mt-2 text-[38px] sm:text-[40px] font-black tracking-tight text-white font-sans leading-none">
                  ₦{transaction.amountNgn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                {/* Status: Green circle checkmark + Successful */}
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#00D589]">
                  <CheckCircle2 className="h-4 w-4 fill-[#00D589] text-[#1C1E22] stroke-[2]" />
                  <span>Successful</span>
                </div>
              </div>

              {/* Card 2: Transaction Details (IMG_2680.png) */}
              <div 
                id="tx-details-info-card"
                className="rounded-[20px] bg-[#1C1E22] p-4 pt-4 pb-4.5 space-y-4 shadow-md border border-white/[0.04]"
              >
                <h2 className="text-[14px] font-bold text-white tracking-tight">
                  Transaction Details
                </h2>

                <div className="space-y-3.5 text-xs">
                  {/* Row 1: Recipient Details */}
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[#8E929C] text-[13px] shrink-0">Recipient Details</span>
                    <div className="text-right">
                      <div className="font-semibold text-white text-[13px] leading-snug">
                        {recipientName}
                      </div>
                      <div className="text-[#8E929C] text-xs mt-0.5 font-normal">
                        {recipientBank} | {recipientPhoneFormatted}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Transaction No. */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8E929C] text-[13px] shrink-0">Transaction No.</span>
                    <div className="flex items-center gap-1.5 text-right font-mono text-white text-[12px]">
                      <span>{txNumber}</span>
                      <button
                        onClick={copyTxNumber}
                        className="p-1 text-[#8E929C] hover:text-white active:scale-90 transition-all cursor-pointer"
                        title="Copy Transaction Number"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-[#00D589]" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Row 3: Payment Method */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8E929C] text-[13px] shrink-0">Payment Method</span>
                    <div className="flex items-center gap-1 text-white text-[13px] font-normal">
                      <span>OWealth</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#8E929C]" />
                    </div>
                  </div>

                  {/* Row 4: Transaction Date */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#8E929C] text-[13px] shrink-0">Transaction Date</span>
                    <span className="text-white text-[13px] font-normal text-right">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: More Actions (IMG_2680.png) */}
              <div 
                id="tx-details-more-actions-card"
                className="rounded-[20px] bg-[#1C1E22] p-4 pt-4 pb-4 space-y-3.5 shadow-md border border-white/[0.04]"
              >
                <h2 className="text-[14px] font-bold text-white tracking-tight">
                  More Actions
                </h2>

                <div className="space-y-3">
                  {/* Category Row */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E929C] text-[13px]">Category</span>
                    <div className="flex items-center gap-1 text-white text-[13px] font-normal cursor-pointer hover:text-[#00D589] transition-colors">
                      <span>Transfer</span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#8E929C]" />
                    </div>
                  </div>

                  {/* Dashed Separator */}
                  <div className="border-t border-dashed border-slate-700/60 my-2.5" />

                  {/* Transfer Again & View Records triggers */}
                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      onClick={() => {
                        if (onTransferAgain) onTransferAgain(transaction);
                        else onClose();
                      }}
                      className="flex items-center gap-2 text-[13px] font-semibold text-[#00D589] hover:opacity-85 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#00D589]/40 bg-[#00D589]/10">
                        <RefreshCw className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <span>Transfer Again</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onViewRecords) onViewRecords();
                        else onClose();
                      }}
                      className="flex items-center gap-2 text-[13px] font-semibold text-[#00D589] hover:opacity-85 active:scale-95 transition-all cursor-pointer"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#00D589]/40 bg-[#00D589]/10">
                        <Clock className="h-3 w-3 stroke-[2.5]" />
                      </div>
                      <span>View Records</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons (IMG_2680.png): Report Issue & Share Receipt */}
              <div className="pt-3 pb-2 grid grid-cols-2 gap-3.5">
                <button
                  id="report-issue-btn"
                  onClick={handleReportIssue}
                  className="w-full rounded-full bg-[#0C2D22] py-3.5 px-4 text-xs sm:text-sm font-bold text-[#00D589] hover:bg-[#113a2d] active:scale-[0.98] transition-all flex items-center justify-center border border-[#00D589]/20 shadow-sm cursor-pointer"
                >
                  Report Issue
                </button>

                <button
                  id="share-receipt-btn"
                  onClick={() => setViewMode('share')}
                  className="w-full rounded-full bg-[#00D589] py-3.5 px-4 text-xs sm:text-sm font-black text-[#08281A] hover:bg-[#00E599] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Share Receipt
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SCREEN 2: SHARE RECEIPT (IMG_2681.png)                       */}
        {/* ============================================================ */}
        {viewMode === 'share' && (
          <div className="flex flex-col h-full overflow-hidden bg-[#111317]">
            {/* Top Navigation Bar: <   Share Receipt */}
            <header className="shrink-0 flex items-center justify-between px-4 py-3.5 bg-[#111317] border-b border-transparent z-10">
              <button
                id="share-receipt-back-btn"
                onClick={() => setViewMode('details')}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-200 hover:bg-slate-800/60 active:scale-95 transition-all cursor-pointer"
                aria-label="Back"
              >
                <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
              </button>

              <h1 className="text-base font-bold text-white tracking-tight">
                Share Receipt
              </h1>

              {/* Placeholder to balance the header */}
              <div className="h-9 w-9" />
            </header>

            {/* Receipt Ticket Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-2 flex flex-col items-center justify-start scrollbar-none pb-4">
              
              {/* The Scalloped Receipt Card (IMG_2681.png) */}
              <div 
                ref={receiptCardRef}
                id="opay-receipt-ticket"
                className="relative w-full max-w-[390px] rounded-[24px] bg-[#1C1E22] overflow-hidden shadow-2xl border border-white/[0.05]"
              >
                {/* Top Scalloped Perforated Edge */}
                <div className="w-full flex items-center justify-between px-3 -mt-2.5 z-20 pointer-events-none select-none">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#111317] shrink-0" />
                  ))}
                </div>

                {/* Subtle Authentic OPay Watermark Pattern in Background */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.06] flex flex-wrap gap-x-12 gap-y-10 p-6 -rotate-12 scale-125">
                  {Array.from({ length: 30 }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-black text-sm tracking-tight text-white">
                      <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current" />
                      <span>OPay</span>
                    </div>
                  ))}
                </div>

                {/* Ticket Inner Content */}
                <div className="relative z-10 px-5 pt-5 pb-4 space-y-4">
                  
                  {/* Top Row: OPay Logo & Transaction Receipt */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white">
                      <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none">
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="11" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray="56 16"
                          strokeLinecap="round"
                          transform="rotate(-55 18 18)"
                        />
                        <circle cx="24.5" cy="11.5" r="2" fill="currentColor" />
                      </svg>
                      <span className="font-extrabold text-[19px] tracking-tight">OPay</span>
                    </div>

                    <div className="text-[13px] font-medium text-[#8E929C]">
                      Transaction Receipt
                    </div>
                  </div>

                  {/* Big Amount: ₦500.00 (Vibrant Emerald Green) */}
                  <div className="pt-2 text-center space-y-1">
                    <div className="text-[38px] sm:text-[42px] font-black tracking-tight text-[#00D589] font-sans leading-none">
                      ₦{transaction.amountNgn.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="text-[15px] font-bold text-white pt-1">
                      Successful
                    </div>

                    <div className="text-xs text-[#8E929C] font-normal">
                      {formattedDate}
                    </div>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-t border-dashed border-slate-700/70 pt-2" />

                  {/* Rows Section */}
                  <div className="space-y-4 text-xs">
                    {/* Row 1: Recipient Details */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[#8E929C] text-[13px] shrink-0">Recipient Details</span>
                      <div className="text-right">
                        <div className="font-semibold text-white text-[13px] leading-snug">
                          {recipientName}
                        </div>
                        <div className="text-[#8E929C] text-xs mt-0.5 font-normal">
                          {recipientBank} | {recipientPhoneMasked}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Sender Details */}
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-[#8E929C] text-[13px] shrink-0">Sender Details</span>
                      <div className="text-right">
                        <div className="font-semibold text-white text-[13px] leading-snug uppercase">
                          {senderFullName}
                        </div>
                        <div className="text-[#8E929C] text-xs mt-0.5 font-normal">
                          {senderBank} | {senderPhoneMasked}
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Transaction No. */}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[#8E929C] text-[13px] shrink-0">Transaction No.</span>
                      <div className="text-right font-mono text-white text-[12px]">
                        {txNumber}
                      </div>
                    </div>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-t border-dashed border-slate-700/70 pt-2" />

                  {/* Bottom Regulatory Text (IMG_2681.png) */}
                  <p className="text-[11.5px] leading-relaxed text-[#8E929C] font-normal text-justify">
                    Enjoy a better life with OPay. Get free transfers, withdrawals, bill payments, instant loans, and good annual interest On your savings. OPay is licensed by the Central Bank of Nigeria and insured by the NDIC.
                  </p>

                </div>

                {/* Bottom Scalloped Perforated Edge */}
                <div className="w-full flex items-center justify-between px-3 -mb-2.5 z-20 pointer-events-none select-none">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#111317] shrink-0" />
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Sharing Action Bar (IMG_2681.png): Share as image | Share as PDF */}
            <footer className="shrink-0 border-t border-slate-800/80 bg-[#111317] py-3.5 px-4 flex items-center justify-around z-10">
              <button
                id="share-as-image-btn"
                onClick={handleShareAsImage}
                className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#00D589] hover:opacity-80 active:scale-95 transition-all cursor-pointer py-1"
              >
                <ImageIcon className="h-4 w-4 text-[#00D589]" />
                <span>Share as image</span>
              </button>

              <div className="h-5 w-px bg-slate-800" />

              <button
                id="share-as-pdf-btn"
                onClick={handleShareAsPdf}
                className="flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#00D589] hover:opacity-80 active:scale-95 transition-all cursor-pointer py-1"
              >
                <FileText className="h-4 w-4 text-[#00D589]" />
                <span>Share as PDF</span>
              </button>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
};
