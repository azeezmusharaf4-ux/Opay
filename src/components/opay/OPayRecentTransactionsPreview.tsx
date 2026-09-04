import React from 'react';
import { useDemoWallet } from '../../context/DemoWalletContext';
import { Transaction } from '../../types';
import { formatNgn, formatTimestamp } from '../../utils/formatters';
import { Percent, Building2, ArrowUpRight, ArrowDownLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface OPayRecentTransactionsPreviewProps {
  onOpenHistory: () => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const OPayRecentTransactionsPreview: React.FC<OPayRecentTransactionsPreviewProps> = ({
  onOpenHistory,
  onSelectTransaction,
}) => {
  const { transactions, isAuthenticated } = useDemoWallet();

  if (!isAuthenticated) return null;

  const recent = transactions.slice(0, 2);

  if (recent.length === 0) return null;

  return (
    <div 
      id="opay-recent-transactions-card"
      className="rounded-2xl bg-[#1E1F24] p-3 border border-slate-800/60 shadow-sm space-y-1.5"
    >
      <div className="space-y-1.5">
        {recent.map((tx) => {
          const isInflow = tx.category === 'inflow';
          const isInterest = tx.title.toLowerCase().includes('owealth') || tx.title.toLowerCase().includes('interest');

          return (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction(tx)}
              className="flex items-center justify-between rounded-xl bg-[#17181D] p-2 hover:bg-[#25272F] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {/* Icon matching reference */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isInterest
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                      : isInflow
                      ? 'bg-emerald-950/60 text-[#10C986] border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {isInterest ? (
                    <Percent className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : isInflow ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : (
                    <Building2 className="h-3.5 w-3.5 stroke-[2]" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11.5px] font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                    {tx.title}
                  </div>
                  <div className="text-[9.5px] text-slate-400 font-mono">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-[11.5px] font-bold font-mono ${
                    isInflow ? 'text-[#00D589]' : 'text-slate-100'
                  }`}
                >
                  {isInflow ? '+' : '-'}{formatNgn(tx.amountNgn)}
                </div>
                <div className="inline-block text-[9px] font-medium text-[#00D589] bg-[#0A261B] px-1.5 py-0.2 rounded-full mt-0.5">
                  Successful
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
