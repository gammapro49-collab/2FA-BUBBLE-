import React from 'react';
import {
  Smartphone,
  Layers,
  Settings,
  ShieldAlert,
  BatteryCharging,
  Cpu,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const ManualStepsGuide: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Open Project in Android Studio',
      icon: <Cpu className="w-5 h-5 text-indigo-400" />,
      content:
        'Download the ZIP using the button above and extract it. Open Android Studio (Ladybug 2024.2+ or Hedgehog 2023.1.1+), select "Open", and choose the extracted folder. Android Studio will automatically invoke Gradle Sync and download dependencies (Jetpack Compose BOM, Material 3, Hilt 2.50, Room 2.6.1, CameraX, and ML Kit).',
    },
    {
      step: '2',
      title: 'Grant "Display over other apps" Permission',
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      content:
        'The floating bubble relies on SYSTEM_ALERT_WINDOW. On first launch, the app prompts you or you can manually navigate to: Device Settings > Apps > Special app access > Display over other apps > Floating 2FA > Turn ON. Without this, Android will prevent WindowManager from creating TYPE_APPLICATION_OVERLAY views.',
    },
    {
      step: '3',
      title: 'OEM Background & Floating Window Permissions (MIUI / HyperOS / Vivo / Oppo)',
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
      content:
        'Custom Android skins (especially Xiaomi MIUI/HyperOS, Realme, Oppo ColorOS, Vivo Funtouch) have an extra security gate: Go to Settings > Apps > Manage Apps > Floating 2FA > Other Permissions > Enable "Display pop-up windows while running in the background". Also set Battery Saver to "No restrictions" so the Foreground Service notification is never prematurely killed.',
    },
    {
      step: '4',
      title: 'Camera Permission for QR Code Scanner',
      icon: <Smartphone className="w-5 h-5 text-emerald-400" />,
      content:
        'To scan 2FA QR codes using CameraX and ML Kit Barcode Scanning, grant Camera permission when prompted on first scan, or manually in App Info > Permissions > Camera > "Allow only while using the app".',
    },
    {
      step: '5',
      title: 'Run on Physical Device or Emulator',
      icon: <BatteryCharging className="w-5 h-5 text-blue-400" />,
      content:
        'Enable "USB Debugging" under Developer Options on your physical phone, plug it in via USB, and click Run (Shift + F10). If using an emulator, select an AVD running API 26 or higher (e.g., Pixel 8 with Google Play Services).',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Android Studio & Device Setup Guide</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
              Manual Steps
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Follow these essential steps to deploy and test the native Android Kotlin application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((s) => (
          <div
            key={s.step}
            className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Step {s.step}
                </div>
                <h4 className="text-xs font-bold text-white">{s.title}</h4>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed pl-1">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
