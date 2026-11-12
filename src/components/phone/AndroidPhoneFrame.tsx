import React, { useRef, useState } from 'react';
import { SimulatedScreen, AppSettings, TotpAccount, Language } from '../../types';
import { MainAppView } from './MainAppView';
import { MockBrowserLogin, MockCryptoApp, MockHomeScreen } from './MockApps';
import { FloatingBubble } from './FloatingBubble';
import { FloatingCard } from './FloatingCard';
import { OverlayPermissionModal } from './OverlayPermissionModal';
import { BiometricPromptModal } from './BiometricPromptModal';
import { Wifi, Signal, Battery, Smartphone, Shield, Layers } from 'lucide-react';

interface AndroidPhoneFrameProps {
  accounts: TotpAccount[];
  settings: AppSettings;
  currentTime: number;
  activeScreen: SimulatedScreen;
  lastCopiedCode: string;
  onSelectScreen: (screen: SimulatedScreen) => void;
  onUpdateAccounts: (accounts: TotpAccount[]) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onCopySuccess: (code: string) => void;
}

export const AndroidPhoneFrame: React.FC<AndroidPhoneFrameProps> = ({
  accounts,
  settings,
  currentTime,
  activeScreen,
  lastCopiedCode,
  onSelectScreen,
  onUpdateAccounts,
  onUpdateSettings,
  onCopySuccess,
}) => {
  const [isBubbleExpanded, setIsBubbleExpanded] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [isLockedByBiometric, setIsLockedByBiometric] = useState(false);

  // Phone viewport dimensions for snap physics
  const phoneWidth = 360;
  const phoneHeight = 700;

  // Screen Switching Handler
  const handleSwitchToScreen = (screen: SimulatedScreen) => {
    if (screen === 'main_app' && settings.biometricEnabled && isLockedByBiometric) {
      setShowBiometricModal(true);
      return;
    }
    onSelectScreen(screen);
  };

  const handleBiometricSuccess = () => {
    setShowBiometricModal(false);
    setIsLockedByBiometric(false);
    onSelectScreen('main_app');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Device Frame */}
      <div
        style={{ width: `${phoneWidth}px`, height: `${phoneHeight}px` }}
        className="relative bg-black rounded-[44px] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700/80 ring-1 ring-slate-600/40 select-none overflow-hidden"
      >
        {/* Inner Screen Container */}
        <div className="relative w-full h-full rounded-[36px] bg-slate-950 overflow-hidden flex flex-col">
          {/* Android Status Bar */}
          <div className="h-7 px-5 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-30 text-[11px] text-slate-300 font-medium">
            <span>14:17</span>

            {/* Front Camera Punch Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-slate-300" />
              <Wifi className="w-3 h-3 text-slate-300" />
              <div className="flex items-center gap-0.5 font-mono text-[10px]">
                <Battery className="w-3.5 h-3.5 text-slate-300" />
                <span>98%</span>
              </div>
            </div>
          </div>

          {/* Active Screen View */}
          <div className="flex-1 relative overflow-hidden">
            {activeScreen === 'main_app' && (
              <MainAppView
                accounts={accounts}
                settings={settings}
                currentTime={currentTime}
                onUpdateAccounts={onUpdateAccounts}
                onUpdateSettings={onUpdateSettings}
                onCopySuccess={onCopySuccess}
                onShowPermissionGuide={() => setShowPermissionModal(true)}
                onShowBiometricPrompt={() => setShowBiometricModal(true)}
              />
            )}

            {activeScreen === 'browser_login' && (
              <MockBrowserLogin
                onOpenBubble={() => setIsBubbleExpanded(true)}
                lastCopiedCode={lastCopiedCode}
              />
            )}

            {activeScreen === 'crypto_app' && (
              <MockCryptoApp
                onOpenBubble={() => setIsBubbleExpanded(true)}
                lastCopiedCode={lastCopiedCode}
              />
            )}

            {activeScreen === 'home_screen' && (
              <MockHomeScreen onLaunch2FA={() => handleSwitchToScreen('main_app')} />
            )}

            {/* The Draggable 56dp Floating Bubble & 300dp Expandable Window */}
            {settings.bubbleEnabled && settings.overlayPermissionGranted && (
              <FloatingBubble
                containerWidth={phoneWidth - 20}
                containerHeight={phoneHeight - 40}
                isExpanded={isBubbleExpanded}
                onToggleExpand={() => setIsBubbleExpanded(!isBubbleExpanded)}
                childrenWhenExpanded={
                  <FloatingCard
                    accounts={accounts}
                    language={settings.language}
                    currentTime={currentTime}
                    onClose={() => setIsBubbleExpanded(false)}
                    onOpenMainApp={() => {
                      setIsBubbleExpanded(false);
                      handleSwitchToScreen('main_app');
                    }}
                    onQuickAdd={() => {
                      setIsBubbleExpanded(false);
                      handleSwitchToScreen('main_app');
                    }}
                    onCopySuccess={onCopySuccess}
                  />
                }
              />
            )}

            {/* Overlay Permission Setup Modal */}
            {showPermissionModal && (
              <OverlayPermissionModal
                language={settings.language}
                granted={settings.overlayPermissionGranted}
                onToggleGranted={(val) => {
                  onUpdateSettings({ overlayPermissionGranted: val });
                }}
                onClose={() => setShowPermissionModal(false)}
              />
            )}

            {/* Biometric Prompt Dialog */}
            {showBiometricModal && (
              <BiometricPromptModal
                language={settings.language}
                onSuccess={handleBiometricSuccess}
                onCancel={() => setShowBiometricModal(false)}
              />
            )}
          </div>

          {/* Android Gesture Pill Navigation Bar */}
          <div
            onClick={() => handleSwitchToScreen('home_screen')}
            className="h-4 bg-slate-950 flex items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors z-30"
            title="Tap to return to Android Home Screen"
          >
            <div className="w-24 h-1 rounded-full bg-slate-600 hover:bg-slate-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
