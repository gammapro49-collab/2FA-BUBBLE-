import React from 'react';
import { ShieldCheck, ArrowLeft, Check, Layers } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface OverlayPermissionModalProps {
  language: Language;
  granted: boolean;
  onToggleGranted: (granted: boolean) => void;
  onClose: () => void;
}

export const OverlayPermissionModal: React.FC<OverlayPermissionModalProps> = ({
  language,
  granted,
  onToggleGranted,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col justify-end p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Android System Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-300">
              Android System Settings
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 font-mono">ACTION_MANAGE_OVERLAY</span>
        </div>

        {/* Permission Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {getTranslation(language, 'overlayPermissionRequired')}
            </h3>
            <p className="text-[11px] text-slate-400">
              Floating 2FA (com.floating2fa.app)
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
          {getTranslation(language, 'overlayPermissionDesc')}
          <span className="block mt-1 text-[11px] text-slate-500">
            Required for WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY and Foreground Service.
          </span>
        </p>

        {/* Android Setting Toggle */}
        <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-200">
            Allow display over other apps
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={granted}
              onChange={(e) => onToggleGranted(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Confirm & Return to App</span>
        </button>
      </div>
    </div>
  );
};
