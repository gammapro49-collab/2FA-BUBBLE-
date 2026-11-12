/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { initialAccounts } from './data/initialAccounts';
import { TotpAccount, AppSettings, SimulatedScreen } from './types';
import { AndroidPhoneFrame } from './components/phone/AndroidPhoneFrame';
import { CodeExplorer } from './components/codebase/CodeExplorer';
import { ManualStepsGuide } from './components/codebase/ManualStepsGuide';
import { ApkDownloadModal } from './components/codebase/ApkDownloadModal';
import { generateAndDownloadAndroidZip } from './utils/zipExporter';
import { generateAndDownloadApk } from './utils/apkGenerator';
import { getTranslation } from './i18n/translations';
import {
  Shield,
  Smartphone,
  Code2,
  Download,
  Layers,
  Chrome,
  Coins,
  Home,
  CheckCircle2,
  Sparkles,
  Info,
  Globe,
  HelpCircle,
  PackageCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'codebase' | 'manual_steps'>('simulator');
  const [showApkModal, setShowApkModal] = useState(false);
  const [isGeneratingApk, setIsGeneratingApk] = useState(false);

  // Accounts state persisted in localStorage
  const [accounts, setAccounts] = useState<TotpAccount[]>(() => {
    try {
      const saved = localStorage.getItem('floating_2fa_accounts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return initialAccounts;
  });

  // Settings state persisted in localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('floating_2fa_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignored
    }
    return {
      language: 'en',
      bubbleEnabled: true,
      biometricEnabled: false,
      darkMode: true,
      vibrationEnabled: true,
      overlayPermissionGranted: true,
      bubbleSizeDp: 56,
      bubbleAlpha: 1.0,
    };
  });

  // Simulated host screen inside the Android phone frame
  const [activeScreen, setActiveScreen] = useState<SimulatedScreen>('browser_login');

  // Global 1-second interval ticker for live TOTP generation
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Last copied 2FA code for easy pasting inside demo apps
  const [lastCopiedCode, setLastCopiedCode] = useState<string>('');
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const [isExportingZip, setIsExportingZip] = useState(false);

  // Sync accounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('floating_2fa_accounts', JSON.stringify(accounts));
    } catch {
      // Ignored
    }
  }, [accounts]);

  // Sync settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('floating_2fa_settings', JSON.stringify(settings));
    } catch {
      // Ignored
    }
  }, [settings]);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleCopySuccess = (code: string) => {
    setLastCopiedCode(code);
    setCopyToast(code);
    setTimeout(() => {
      setCopyToast(null);
    }, 2500);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      await generateAndDownloadAndroidZip();
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleDownloadApk = async () => {
    setIsGeneratingApk(true);
    try {
      await generateAndDownloadApk();
    } finally {
      setIsGeneratingApk(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Floating 2FA
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Android Native • Kotlin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Draggable 56dp Floating Bubble Overlay • Jetpack Compose • RFC 6238 TOTP
              </p>
            </div>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'simulator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Interactive Phone Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('codebase')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'codebase'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Android Studio Codebase</span>
            </button>
            <button
              onClick={() => setActiveTab('manual_steps')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'manual_steps'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Setup & Permissions Guide</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Direct APK Release File Download Button */}
            <button
              onClick={handleDownloadApk}
              disabled={isGeneratingApk}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-orange-950/40 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingApk ? 'তৈরি হচ্ছে...' : 'Download APK (.apk)'}</span>
            </button>

            <button
              onClick={() => setShowApkModal(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Smartphone className="w-4 h-4" />
              <span>ইনস্টল গাইড</span>
            </button>

            {/* Download Android Studio Project (.ZIP) */}
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingZip ? '...' : 'Project ZIP'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 flex flex-col">
        {/* ================= SIMULATOR VIEW ================= */}
        {activeTab === 'simulator' && (
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
            {/* Left: Device Simulator */}
            <div className="flex-shrink-0">
              <AndroidPhoneFrame
                accounts={accounts}
                settings={settings}
                currentTime={currentTime}
                activeScreen={activeScreen}
                lastCopiedCode={lastCopiedCode}
                onSelectScreen={setActiveScreen}
                onUpdateAccounts={setAccounts}
                onUpdateSettings={handleUpdateSettings}
                onCopySuccess={handleCopySuccess}
              />
            </div>

            {/* Right: Interactive Guide & Live Controls */}
            <div className="flex-1 max-w-xl space-y-4">
              {/* Host App Switcher Card */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                    <h2 className="text-sm font-bold text-white">
                      {getTranslation(settings.language, 'switchHostApp')}
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Test overlay on top of any app
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveScreen('browser_login')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      activeScreen === 'browser_login'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Chrome className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Chrome: 2FA Login</div>
                      <div className="text-[10px] text-slate-400">
                        Copy code from bubble & paste here!
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveScreen('crypto_app')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      activeScreen === 'crypto_app'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Binance Crypto App</div>
                      <div className="text-[10px] text-slate-400">
                        Quick withdrawal authorization demo
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveScreen('home_screen')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      activeScreen === 'home_screen'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Home className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Android Home Screen</div>
                      <div className="text-[10px] text-slate-400">
                        Launcher with widget & bubble at edge
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveScreen('main_app')}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      activeScreen === 'main_app'
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <Shield className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-white">Floating 2FA Main App</div>
                      <div className="text-[10px] text-slate-400">
                        Full-screen Material 3 account manager
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Feature Highlights Card */}
              <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How Floating 2FA Works in Android</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <span className="font-semibold text-white">56dp Draggable Bubble: </span>
                      Managed via <code className="text-indigo-300">FloatingBubbleService</code> and{' '}
                      <code className="text-indigo-300">WindowManager</code> with{' '}
                      <code className="text-indigo-300">TYPE_APPLICATION_OVERLAY</code>. Drag it anywhere;
                      on release it smoothly snaps to the nearest screen edge.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <span className="font-semibold text-white">300dp Expandable Overlay: </span>
                      Tapping the bubble expands a Jetpack Compose card overlay. Codes turn red in
                      the last 5 seconds. Tap any code to copy to clipboard with haptic feedback.
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <span className="font-semibold text-white">Keystore Encrypted Storage: </span>
                      Secrets are encrypted with hardware-backed AES-GCM 256 keys via{' '}
                      <code className="text-emerald-300">AndroidKeyStore</code> before saving in Room
                      SQLite database.
                    </div>
                  </div>
                </div>

                {/* Quick Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Language:</span>
                    <button
                      onClick={() =>
                        handleUpdateSettings({
                          language: settings.language === 'en' ? 'bn' : 'en',
                        })
                      }
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg font-bold border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{settings.language === 'en' ? 'English (EN)' : 'বাংলা (Bengali)'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Bubble Overlay:</span>
                    <button
                      onClick={() =>
                        handleUpdateSettings({ bubbleEnabled: !settings.bubbleEnabled })
                      }
                      className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                        settings.bubbleEnabled
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {settings.bubbleEnabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= CODEBASE VIEW ================= */}
        {activeTab === 'codebase' && (
          <div className="flex-1 h-[750px]">
            <CodeExplorer />
          </div>
        )}

        {/* ================= MANUAL STEPS GUIDE VIEW ================= */}
        {activeTab === 'manual_steps' && (
          <div className="space-y-6">
            <ManualStepsGuide />
          </div>
        )}
      </main>

      {/* APK Download & Installation Guide Modal */}
      <ApkDownloadModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        onDownloadZip={handleDownloadZip}
        onDownloadApk={handleDownloadApk}
        isExportingZip={isExportingZip}
        isGeneratingApk={isGeneratingApk}
      />

      {/* Floating Copied Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-bottom duration-200 z-50">
          <CheckCircle2 className="w-4 h-4" />
          <span>Code {copyToast} copied to clipboard!</span>
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-400">
        <p>
          Floating 2FA • Native Android Architecture (Hilt, Jetpack Compose Material 3, Room, Android Keystore, CameraX + ML Kit) • Min SDK 26
        </p>
      </footer>
    </div>
  );
}
