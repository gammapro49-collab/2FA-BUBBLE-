import React, { useState } from 'react';
import { TotpAccount, Language, AppSettings } from '../../types';
import { generateTotp, formatOtpCode, getRemainingTime, parseOtpAuthUri } from '../../utils/totp';
import { getTranslation } from '../../i18n/translations';
import { exportEncryptedBackup, importEncryptedBackup } from '../../utils/crypto';
import {
  Search,
  Plus,
  Settings as SettingsIcon,
  Copy,
  Check,
  Trash2,
  Edit2,
  Shield,
  QrCode,
  Key,
  Camera,
  Fingerprint,
  Layers,
  Download,
  Upload,
  Globe,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MainAppViewProps {
  accounts: TotpAccount[];
  settings: AppSettings;
  currentTime: number;
  onUpdateAccounts: (accounts: TotpAccount[]) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onCopySuccess: (code: string) => void;
  onShowPermissionGuide: () => void;
  onShowBiometricPrompt: () => void;
}

export const MainAppView: React.FC<MainAppViewProps> = ({
  accounts,
  settings,
  currentTime,
  onUpdateAccounts,
  onUpdateSettings,
  onCopySuccess,
  onShowPermissionGuide,
  onShowBiometricPrompt,
}) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'add' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deleted account undo buffer
  const [deletedAccount, setDeletedAccount] = useState<{ account: TotpAccount; index: number } | null>(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  // Add / Edit Account Form State
  const [editingAccount, setEditingAccount] = useState<TotpAccount | null>(null);
  const [addMode, setAddMode] = useState<'qr' | 'manual'>('qr');
  const [issuerInput, setIssuerInput] = useState('');
  const [accountNameInput, setAccountNameInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  const [colorInput, setColorInput] = useState('#4F46E5');
  const [formError, setFormError] = useState('');

  // Backup state
  const [backupPassword, setBackupPassword] = useState('');
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

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

    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(50);
    }

    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  const handleDelete = (id: string) => {
    const index = accounts.findIndex((a) => a.id === id);
    if (index !== -1) {
      const removed = accounts[index];
      setDeletedAccount({ account: removed, index });
      setShowUndoSnackbar(true);
      onUpdateAccounts(accounts.filter((a) => a.id !== id));

      setTimeout(() => {
        setShowUndoSnackbar(false);
      }, 4500);
    }
  };

  const handleUndo = () => {
    if (deletedAccount) {
      const newAccounts = [...accounts];
      newAccounts.splice(deletedAccount.index, 0, deletedAccount.account);
      onUpdateAccounts(newAccounts);
      setDeletedAccount(null);
      setShowUndoSnackbar(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setIssuerInput('');
    setAccountNameInput('');
    setSecretInput('');
    setColorInput('#4F46E5');
    setFormError('');
    setAddMode('qr');
    setCurrentTab('add');
  };

  const handleOpenEdit = (acc: TotpAccount) => {
    setEditingAccount(acc);
    setIssuerInput(acc.issuer);
    setAccountNameInput(acc.accountName);
    setSecretInput(acc.secret);
    setColorInput(acc.color || '#4F46E5');
    setFormError('');
    setAddMode('manual');
    setCurrentTab('add');
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuerInput.trim() || !accountNameInput.trim()) {
      setFormError('Please enter issuer and account name');
      return;
    }

    const cleanSecret = secretInput.replace(/[\s-]/g, '').toUpperCase();
    if (!/^[A-Z2-7]{8,}$/.test(cleanSecret)) {
      setFormError('Invalid Base32 secret key (A-Z, 2-7, min 8 chars)');
      return;
    }

    if (editingAccount) {
      // Update
      const updated = accounts.map((a) =>
        a.id === editingAccount.id
          ? {
              ...a,
              issuer: issuerInput.trim(),
              accountName: accountNameInput.trim(),
              secret: cleanSecret,
              color: colorInput,
            }
          : a
      );
      onUpdateAccounts(updated);
    } else {
      // Create new
      const newAcc: TotpAccount = {
        id: `acc-${Date.now()}`,
        issuer: issuerInput.trim(),
        accountName: accountNameInput.trim(),
        secret: cleanSecret,
        digits: 6,
        period: 30,
        algorithm: 'SHA1',
        color: colorInput,
        createdAt: Date.now(),
      };
      onUpdateAccounts([newAcc, ...accounts]);
    }

    setCurrentTab('home');
  };

  // Sample QR Scenarios for testing
  const handleSimulateScan = (uri: string) => {
    const parsed = parseOtpAuthUri(uri);
    if (parsed) {
      setIssuerInput(parsed.issuer);
      setAccountNameInput(parsed.accountName);
      setSecretInput(parsed.secret);
      setAddMode('manual');
      setFormError('');
    }
  };

  // Backup Export
  const handleExportBackup = async () => {
    if (!backupPassword) {
      setBackupStatus('Please set a backup password');
      return;
    }
    try {
      const encrypted = await exportEncryptedBackup(accounts, backupPassword);
      const blob = new Blob([encrypted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `floating-2fa-backup-${new Date().toISOString().slice(0, 10)}.enc`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatus(getTranslation(settings.language, 'exportSuccess'));
    } catch {
      setBackupStatus('Export failed');
    }
  };

  // Backup Import
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !backupPassword) {
      setBackupStatus('Enter the password first, then select file');
      return;
    }
    try {
      const text = await file.text();
      const restored = await importEncryptedBackup(text, backupPassword);
      onUpdateAccounts(restored);
      setBackupStatus(getTranslation(settings.language, 'importSuccess'));
    } catch {
      setBackupStatus(getTranslation(settings.language, 'invalidPassword'));
    }
  };

  // Circular timer SVG parameters
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden relative">
      {/* Material 3 Top App Bar */}
      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          {currentTab !== 'home' ? (
            <button
              onClick={() => setCurrentTab('home')}
              className="p-1 rounded-full text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}

          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              {currentTab === 'home' && getTranslation(settings.language, 'appName')}
              {currentTab === 'add' && (editingAccount ? getTranslation(settings.language, 'editAccount') : getTranslation(settings.language, 'addAccount'))}
              {currentTab === 'settings' && getTranslation(settings.language, 'settings')}
            </h1>
            <p className="text-[10px] text-slate-400">
              {currentTab === 'home' && getTranslation(settings.language, 'appTagline')}
              {currentTab !== 'home' && 'Jetpack Compose Material 3'}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-1.5">
          {currentTab === 'home' && (
            <>
              {/* Language toggle */}
              <button
                onClick={() =>
                  onUpdateSettings({
                    language: settings.language === 'en' ? 'bn' : 'en',
                  })
                }
                title="Toggle Language"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg border border-slate-700 transition-colors"
              >
                {settings.language === 'en' ? 'বাংলা' : 'EN'}
              </button>

              {/* Biometric quick lock */}
              {settings.biometricEnabled && (
                <button
                  onClick={onShowBiometricPrompt}
                  title="Lock App"
                  className="p-1.5 rounded-lg text-indigo-400 hover:bg-slate-800"
                >
                  <Fingerprint className="w-4 h-4" />
                </button>
              )}

              {/* Settings button */}
              <button
                onClick={() => setCurrentTab('settings')}
                title={getTranslation(settings.language, 'settings')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* ===================== HOME TAB ===================== */}
        {currentTab === 'home' && (
          <div className="p-3.5 space-y-3.5">
            {/* Live Sync Timer Bar */}
            <div className="p-3 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-8 h-8 transform -rotate-90">
                    <circle
                      cx="16"
                      cy="16"
                      r={radius}
                      className="text-slate-800"
                      strokeWidth="3"
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
                      strokeWidth="3"
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
                  <div className="text-xs font-semibold text-slate-200">
                    RFC 6238 TOTP Cycle
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {remaining} {getTranslation(settings.language, 'secondsRemaining')}
                  </div>
                </div>
              </div>

              {/* Floating Bubble Status Pill */}
              <div
                onClick={onShowPermissionGuide}
                className="cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5 bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>56dp Bubble</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getTranslation(settings.language, 'searchPlaceholder')}
                className="w-full bg-slate-900 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Accounts List */}
            {filteredAccounts.length === 0 ? (
              <div className="py-12 text-center px-4 space-y-2">
                <Shield className="w-10 h-10 text-slate-700 mx-auto" />
                <h3 className="text-xs font-semibold text-slate-300">
                  {getTranslation(settings.language, 'noAccounts')}
                </h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  {getTranslation(settings.language, 'noAccountsDesc')}
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white rounded-xl shadow-lg transition-colors"
                >
                  + {getTranslation(settings.language, 'addAccount')}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAccounts.map((acc) => {
                  const code = generateTotp(acc.secret, currentTime, acc.period, acc.digits);
                  const formattedCode = formatOtpCode(code);
                  const isCopied = copiedId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className={`p-3 rounded-2xl border transition-all duration-200 ${
                        isCopied
                          ? 'bg-emerald-950/40 border-emerald-500/50'
                          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/80 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: acc.color || '#4F46E5' }}
                          />
                          <div>
                            <div className="text-xs font-bold text-white tracking-wide">
                              {acc.issuer}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {acc.accountName}
                            </div>
                          </div>
                        </div>

                        {/* Card Options */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            title="Edit"
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(acc.id)}
                            title="Delete"
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Large Monospace Code & Copy */}
                      <div
                        onClick={() => handleCopy(acc)}
                        className="mt-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-between cursor-pointer group hover:border-indigo-500/40 transition-colors"
                      >
                        <span
                          className={`font-mono text-2xl font-bold tracking-wider transition-colors ${
                            isUrgent
                              ? 'text-rose-400 animate-pulse'
                              : isCopied
                              ? 'text-emerald-400'
                              : 'text-indigo-300 group-hover:text-white'
                          }`}
                        >
                          {formattedCode}
                        </span>

                        <div
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span className="text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Countdown Line */}
                      <div className="mt-2.5 w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isUrgent ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== ADD / EDIT TAB ===================== */}
        {currentTab === 'add' && (
          <div className="p-4 space-y-4">
            {/* Mode Selector */}
            {!editingAccount && (
              <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddMode('qr')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    addMode === 'qr'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{getTranslation(settings.language, 'scanQrCode')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('manual')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    addMode === 'manual'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>{getTranslation(settings.language, 'manualEntry')}</span>
                </button>
              </div>
            )}

            {/* QR Scanner Mode */}
            {addMode === 'qr' && !editingAccount && (
              <div className="space-y-4">
                {/* Simulated Camera Viewfinder */}
                <div className="relative aspect-square max-w-[260px] mx-auto rounded-3xl bg-slate-900 border-2 border-dashed border-indigo-500/60 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
                  <div className="absolute inset-8 border-2 border-indigo-400 rounded-2xl pointer-events-none animate-pulse" />
                  <Camera className="w-10 h-10 text-indigo-400 mb-2" />
                  <span className="text-xs font-medium text-slate-200">
                    CameraX + ML Kit Viewfinder
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 max-w-[180px]">
                    {getTranslation(settings.language, 'cameraPermissionNotice')}
                  </span>
                </div>

                {/* Instant Sample QR Codes for easy 1-click testing */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Quick-Test QR Codes (Tap to Auto-Scan)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleSimulateScan(
                          'otpauth://totp/Google:user%40google.com?secret=JBSWY3DPEHPK3PXP&issuer=Google'
                        )
                      }
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-blue-400">Google QR</div>
                      <div className="text-[10px] text-slate-400">JBSWY3DPEHP...</div>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateScan(
                          'otpauth://totp/GitHub:octocat?secret=KVKFKRCTJVZGK4TU&issuer=GitHub'
                        )
                      }
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-purple-400">GitHub QR</div>
                      <div className="text-[10px] text-slate-400">KVKFKRCTJVZ...</div>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateScan(
                          'otpauth://totp/Binance:trader?secret=NBSWY3DPEB3W64TMMQ======&issuer=Binance'
                        )
                      }
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-amber-400">Binance QR</div>
                      <div className="text-[10px] text-slate-400">NBSWY3DPEB3...</div>
                    </button>
                    <button
                      onClick={() =>
                        handleSimulateScan(
                          'otpauth://totp/AWS:admin?secret=MZXW6YTBOI======&issuer=AWS'
                        )
                      }
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
                    >
                      <div className="text-xs font-bold text-orange-400">AWS Cloud QR</div>
                      <div className="text-[10px] text-slate-400">MZXW6YTBOI...</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry Form */}
            {(addMode === 'manual' || editingAccount) && (
              <form onSubmit={handleSaveAccount} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium">
                    {getTranslation(settings.language, 'issuer')}
                  </label>
                  <input
                    type="text"
                    value={issuerInput}
                    onChange={(e) => setIssuerInput(e.target.value)}
                    placeholder="e.g. Google, GitHub, Binance"
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">
                    {getTranslation(settings.language, 'accountName')}
                  </label>
                  <input
                    type="text"
                    value={accountNameInput}
                    onChange={(e) => setAccountNameInput(e.target.value)}
                    placeholder="e.g. user@gmail.com"
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">
                    {getTranslation(settings.language, 'secretKey')}
                  </label>
                  <input
                    type="text"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value.toUpperCase())}
                    placeholder="JBSWY3DPEHPK3PXP"
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500">
                    RFC 4648 Base32 alphabet (A-Z, 2-7)
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium">Color Badge</label>
                  <div className="flex gap-2 mt-1">
                    {['#4F46E5', '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'].map(
                      (c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setColorInput(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-transform ${
                            colorInput === c ? 'scale-125 ring-2 ring-white' : 'opacity-80'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                {formError && (
                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentTab('home')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300 transition-colors"
                  >
                    {getTranslation(settings.language, 'cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl text-white shadow-lg shadow-indigo-900/30 transition-colors"
                  >
                    {getTranslation(settings.language, 'save')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ===================== SETTINGS TAB ===================== */}
        {currentTab === 'settings' && (
          <div className="p-4 space-y-4">
            {/* Overlay Bubble Toggle */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {getTranslation(settings.language, 'bubbleOverlay')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {getTranslation(settings.language, 'bubbleOverlayDesc')}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.bubbleEnabled}
                  onChange={(e) => onUpdateSettings({ bubbleEnabled: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Permission wizard trigger */}
              <button
                onClick={onShowPermissionGuide}
                className="w-full mt-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded-xl flex items-center justify-between transition-colors"
              >
                <span>{getTranslation(settings.language, 'overlayPermissionRequired')}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {settings.overlayPermissionGranted ? 'Granted' : 'Check'} →
                </span>
              </button>
            </div>

            {/* Biometric Lock Toggle */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {getTranslation(settings.language, 'biometricLock')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {getTranslation(settings.language, 'biometricLockDesc')}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.biometricEnabled}
                onChange={(e) => onUpdateSettings({ biometricEnabled: e.target.checked })}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {/* Language Settings */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{getTranslation(settings.language, 'language')}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdateSettings({ language: 'en' })}
                  className={`py-2 text-xs rounded-xl border font-medium transition-colors ${
                    settings.language === 'en'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => onUpdateSettings({ language: 'bn' })}
                  className={`py-2 text-xs rounded-xl border font-medium transition-colors ${
                    settings.language === 'bn'
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  বাংলা (Bengali)
                </button>
              </div>
            </div>

            {/* Encrypted Backup & Restore */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="text-xs font-bold text-white">
                {getTranslation(settings.language, 'backupRestore')}
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                {getTranslation(settings.language, 'exportPasswordDesc')}
              </div>

              <input
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder={getTranslation(settings.language, 'password')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportBackup}
                  className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{getTranslation(settings.language, 'exportBackup')}</span>
                </button>

                <label className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{getTranslation(settings.language, 'importBackup')}</span>
                  <input
                    type="file"
                    accept=".enc,.json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

              {backupStatus && (
                <div className="text-[10px] text-indigo-300 font-medium">{backupStatus}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (+) on Home screen */}
      {currentTab === 'home' && (
        <button
          onClick={handleOpenAdd}
          className="absolute right-4 bottom-5 w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
          title={getTranslation(settings.language, 'addAccount')}
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Swipe-to-delete Undo Snackbar */}
      {showUndoSnackbar && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900 border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex items-center justify-between z-30 animate-in slide-in-from-bottom duration-200">
          <span className="text-xs text-slate-200">
            {getTranslation(settings.language, 'accountDeleted')}
          </span>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-xs text-amber-400 font-bold hover:underline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{getTranslation(settings.language, 'undo')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
