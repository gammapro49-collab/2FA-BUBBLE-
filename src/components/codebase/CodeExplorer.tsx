import React, { useState } from 'react';
import { androidProjectFiles } from '../../data/androidProjectFiles';
import { generateAndDownloadAndroidZip } from '../../utils/zipExporter';
import { AndroidFile } from '../../types';
import {
  Download,
  Copy,
  Check,
  FileCode,
  Folder,
  Search,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(androidProjectFiles[0]);
  const [copied, setCopied] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredFiles = androidProjectFiles.filter((f) =>
    f.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    f.path.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleCopy = () => {
    navigator.clipboard?.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExporting(true);
    try {
      await generateAndDownloadAndroidZip();
    } finally {
      setIsExporting(false);
    }
  };

  // Group files by category
  const categories: { key: AndroidFile['category']; label: string }[] = [
    { key: 'manifest', label: 'Manifest & Permissions' },
    { key: 'kotlin_service', label: 'Floating Service & WindowManager' },
    { key: 'kotlin_data', label: 'Keystore Crypto, TOTP & Room' },
    { key: 'kotlin_ui', label: 'Jetpack Compose Material 3 UI' },
    { key: 'gradle', label: 'Gradle Build Scripts' },
    { key: 'res', label: 'Resources & Localization (EN/BN)' },
    { key: 'docs', label: 'Documentation & Guide' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Top Banner */}
      <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Native Android Project
            </span>
            <span className="text-xs text-slate-400 font-mono">Kotlin • Jetpack Compose • Min SDK 26</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Floating 2FA - Full Android Source Code
          </h2>
        </div>

        {/* 1-Click ZIP Exporter Button */}
        <button
          onClick={handleDownloadZip}
          disabled={isExporting}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating ZIP...' : 'Download Android Studio Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Main Split View: File Tree + Code Viewer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: File Tree Browser */}
        <div className="w-full md:w-72 bg-slate-950/70 border-r border-slate-800 flex flex-col overflow-hidden">
          {/* File Search */}
          <div className="p-3 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter files..."
                className="w-full bg-slate-900 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Tree List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
            {categories.map((cat) => {
              const filesInCat = filteredFiles.filter((f) => f.category === cat.key);
              if (filesInCat.length === 0) return null;

              return (
                <div key={cat.key} className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                    <Folder className="w-3 h-3 text-indigo-400" />
                    <span>{cat.label}</span>
                  </div>

                  <div className="space-y-0.5">
                    {filesInCat.map((file) => {
                      const isSelected = selectedFile.path === file.path;
                      return (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600/30 text-indigo-200 font-medium border border-indigo-500/40'
                              : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                          }`}
                        >
                          <FileCode
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isSelected ? 'text-indigo-400' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate text-xs">{file.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {/* File Header */}
          <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-slate-400 font-mono text-[11px] truncate">
                {selectedFile.path}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded">
                {selectedFile.language}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 text-xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Highlighted Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            <pre className="flex">
              {/* Line Numbers */}
              <span className="select-none text-slate-400 pr-4 text-right border-r border-slate-800 mr-4">
                {selectedFile.content.split('\n').map((_, i) => (
                  <span key={i} className="block leading-5">
                    {i + 1}
                  </span>
                ))}
              </span>

              {/* Code */}
              <code className="flex-1 overflow-x-auto text-slate-200 leading-5">
                {selectedFile.content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
