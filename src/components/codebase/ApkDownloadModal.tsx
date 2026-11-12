import React from 'react';
import {
  Download,
  X,
  Smartphone,
  Cpu,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PackageCheck,
  FileCode,
} from 'lucide-react';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadZip: () => void;
  onDownloadApk: () => void;
  isExportingZip: boolean;
  isGeneratingApk: boolean;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
  onDownloadZip,
  onDownloadApk,
  isExportingZip,
  isGeneratingApk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-900/40">
              <PackageCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Direct APK Release
                </span>
                <span className="text-xs text-slate-400">অ্যান্ড্রয়েড APK প্যাকেজ</span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                সরাসরি APK ফাইল ডাউনলোড ও ইনস্টল
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRIMARY ACTION: Download Direct APK File */}
        <div className="p-5 bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 border-2 border-amber-500/60 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-base font-bold text-white">
                  Floating2FA-release.apk
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                সরাসরি ইনস্টলেবল অ্যান্ড্রয়েড প্যাকেজ ফাইল (.apk)। নিচের বাটনে চাপ দিলেই ফোনে ডাউনলোড শুরু হয়ে যাবে।
              </p>
            </div>
          </div>

          <button
            onClick={onDownloadApk}
            disabled={isGeneratingApk}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-xl shadow-orange-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>
              {isGeneratingApk
                ? 'প্যাকেজ তৈরি হচ্ছে...'
                : 'Download Floating2FA-release.apk (সরাসরি ডাউনলোড)'}
            </span>
          </button>

          <div className="text-[11px] text-amber-200/80 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40 flex items-start gap-2">
            <span className="font-bold">⚠️ টিপস:</span>
            <span>
              প্লে-স্টোরের বাইরের ফাইল হওয়ায় ফোন ইনস্টল করার সময় <strong>"Unknown Sources / Install Unknown Apps"</strong> অনুমতি চাইতে পারে। <strong>"Settings &gt; Allow"</strong> বা <strong>"Install anyway"</strong> দিলেই এটি ফোনে ইনস্টল হয়ে যাবে।
            </span>
          </div>
        </div>

        {/* Alternative: Full Project Source ZIP */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <div className="text-xs font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>সম্পূর্ণ Android Studio প্রজেক্ট সোর্স কোড (.ZIP)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kotlin, Jetpack Compose, Hilt, Room এবং GitHub Actions সহ সম্পূর্ণ কোডবেস।
            </p>
          </div>

          <button
            onClick={onDownloadZip}
            disabled={isExportingZip}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingZip ? 'ডাউনলোড হচ্ছে...' : 'Download Project ZIP'}</span>
          </button>
        </div>

        {/* Installation Guidelines */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ইনস্টল করার অন্যান্য সহজ বিকল্প:
          </h4>

          {/* Option A: Direct Web App on Phone */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">
                ফোনে কোনো ঝামেলা ছাড়াই এখনই অ্যাপ চালান (Web APK):
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                আপনার অ্যান্ড্রয়েড ফোনের <strong>Chrome ব্রাউজারে</strong> এই পেইজটি ওপেন করে উপরের ৩-ডট (⋮) মেনু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen"</strong> এ চাপ দিন। মুহূর্তেই ফোনে সাধারণ অ্যাপের মতো আইকন চলে আসবে!
              </p>
            </div>
          </div>

          {/* Option B: Free Cloud Build with GitHub Actions */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Cloud className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">
                GitHub Actions দিয়ে ক্লাউডে ফ্রি অটোপাইলট বিল্ড:
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                প্রজেক্ট জিপ ফাইলটি আপনার GitHub রিপোসিটরিতে আপলোড করলে ভেতরে থাকা <code className="text-emerald-300">.github/workflows/build-apk.yml</code> স্বয়ংক্রিয়ভাবে ক্লাউডে ৯০ সেকেন্ডে আসল <strong className="text-white">app-debug.apk</strong> তৈরি করে দেবে।
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
