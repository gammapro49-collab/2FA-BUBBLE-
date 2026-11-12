import React, { useState } from 'react';
import { TotpAccount, Language } from '../../types';
import { generateTotp, formatOtpCode, getRemainingTime } from '../../utils/totp';
import { getTranslation } from '../../i18n/translations';
import { X, ExternalLink, Copy, Check, Search, Shield, Plus } from 'lucide-react';

interface FloatingCardProps {
  accounts: TotpAccount[];
  language: Language;
  currentTime: number;
  onClose: () => void;
  onOpenMainApp: () => void;
  onQuickAdd: () => void;
  onCopySuccess: (code: string) => void;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  accounts,
  language,
  currentTime,
  onClose,
  onOpenMainApp,
  onQuickAdd,
  onCopySuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { remaining, progress, isUrgent } = getRemainingTime(currentTime);

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.accountName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (acc: TotpAccount) => {
    const code = generateTotp(acc.secret, currentTime, acc.period, acc.digits);
    navigator.clipboard?.writeText(code);
    setCopiedId(acc.id);
    onCopySuccess(code);

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  // SVG circular countdown
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="w-[305px] max-h-[460px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Animated Circular Timer */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r={radius}
                className="text-slate-700/60"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="16"
                cy="16"
                r={radius}
                className={`transition-all duration-300 ${
                  isUrgent ? 'text-rose-500' : 'text-indigo-400'
                }`}
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span
              className={`absolute text-[11px] font-bold font-mono ${
                isUrgent ? 'text-rose-400 animate-pulse' : 'text-indigo-200'
              }`}
            >
              {remaining}
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <span>{getTranslation(language, 'floatingCardTitle')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400">
              {isUrgent ? (
                <span className="text-rose-400 font-medium">
                  {getTranslation(language, 'codeExpiresSoon')}
                </span>
              ) : (
                <span>{getTranslation(language, 'tapToCopy')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onQuickAdd}
            title={getTranslation(language, 'quickAdd')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenMainApp}
            title={getTranslation(language, 'openFullApp')}
            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title={getTranslation(language, 'collapse')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Search */}
      {accounts.length > 2 && (
        <div className="px-3 pt-2 pb-1 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')}
              className="w-full bg-slate-800/70 text-xs text-slate-200 pl-8 pr-2 py-1.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Accounts List */}
      <div className="overflow-y-auto p-2.5 space-y-2 flex-1 max-h-[320px] scrollbar-thin scrollbar-thumb-slate-700">
        {filteredAccounts.length === 0 ? (
          <div className="py-8 text-center px-4">
            <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">{getTranslation(language, 'noAccounts')}</p>
            <button
              onClick={onQuickAdd}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-lg transition-colors font-medium"
            >
              + {getTranslation(language, 'addAccount')}
            </button>
          </div>
        ) : (
          filteredAccounts.map((acc) => {
            const rawCode = generateTotp(acc.secret, currentTime, acc.period, acc.digits);
            const formatted = formatOtpCode(rawCode);
            const isCopied = copiedId === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => handleCopy(acc)}
                className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-950/40 border-emerald-500/60'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: acc.color || '#4F46E5' }}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-300 truncate">
                        {acc.issuer}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {acc.accountName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`font-mono text-base font-bold tracking-wider transition-colors ${
                        isUrgent
                          ? 'text-rose-400'
                          : isCopied
                          ? 'text-emerald-400'
                          : 'text-indigo-300 group-hover:text-white'
                      }`}
                    >
                      {formatted}
                    </div>

                    <div
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-slate-400 group-hover:text-indigo-300 group-hover:bg-indigo-950/40'
                      }`}
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar inside card bottom */}
                <div className="mt-2 w-full bg-slate-700/40 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isUrgent ? 'bg-rose-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>56dp WindowManager Overlay</span>
        <span className="font-mono">{remaining}s left</span>
      </div>
    </div>
  );
};
