import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface BiometricPromptModalProps {
  language: Language;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({
  language,
  onSuccess,
  onCancel,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFingerprintTap = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 400);
    }, 600);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col justify-end p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white">
            {getTranslation(language, 'biometricPromptTitle')}
          </h3>
          <p className="text-[11px] text-slate-400">
            {getTranslation(language, 'biometricPromptDesc')}
          </p>
        </div>

        {/* Sensor Area */}
        <div className="py-4">
          <button
            onClick={handleFingerprintTap}
            className={`w-20 h-20 mx-auto rounded-3xl border-2 flex items-center justify-center transition-all ${
              success
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-105'
                : isVerifying
                ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-indigo-400 hover:scale-105'
            }`}
          >
            {success ? (
              <CheckCircle2 className="w-10 h-10 animate-in zoom-in" />
            ) : (
              <Fingerprint className="w-10 h-10" />
            )}
          </button>
          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            {success ? 'Identity Verified!' : isVerifying ? 'Scanning biometric...' : getTranslation(language, 'biometricBypassForDemo')}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            {getTranslation(language, 'cancel')}
          </button>
          <button
            onClick={onSuccess}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {getTranslation(language, 'unlockWithPin')}
          </button>
        </div>
      </div>
    </div>
  );
};
