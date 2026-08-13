import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  HardDrive, 
  Sparkles, 
  Database,
  Layers
} from 'lucide-react';
import { 
  exportAppFullBackup, 
  importAppFullBackup, 
  updateDefaultLibrariesToLatest 
} from '../utils/backupSystem';
import { 
  generatePythonDesktopAppScript, 
  generateBuildExeBat, 
  generateOfflineReadmeText 
} from '../utils/pythonInstallerBuilder';

interface BackupSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupSystemModal: React.FC<BackupSystemModalProps> = ({ isOpen, onClose }) => {
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  // Export Full JSON Backup
  const handleExportBackup = () => {
    const { jsonData, filename } = exportAppFullBackup();
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'success',
      message: `فایل پشتیبان کامل (${filename}) با موفقیت دانلود شد.`
    });
  };

  // Import JSON Backup File
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = importAppFullBackup(content, restoreMode);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.messagePersian
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.messagePersian
        });
      }
    };
    reader.readAsText(file);
  };

  // Update Libraries to Latest Factory Defaults
  const handleUpdateLibraries = () => {
    setIsUpdating(true);
    setTimeout(() => {
      const res = updateDefaultLibrariesToLatest();
      setIsUpdating(false);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.messagePersian
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.messagePersian
        });
      }
    }, 600);
  };

  // Download Installer Builder & Python Package
  const handleDownloadInstallerPackage = () => {
    const pyScript = generatePythonDesktopAppScript();
    const batScript = generateBuildExeBat();
    const readmeText = generateOfflineReadmeText();

    // Download Python File
    const downloadBlob = (content: string, fileName: string, type: string) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    };

    downloadBlob(pyScript, 'SolidWorks_Master_App.pyw', 'text/x-python');
    setTimeout(() => downloadBlob(batScript, 'build_exe_installer.bat', 'application/x-bat'), 300);
    setTimeout(() => downloadBlob(readmeText, 'README_OFFLINE_INSTALL.txt', 'text/plain;charset=utf-8'), 600);

    setFeedback({
      type: 'success',
      message: 'پکیج ساخت فایل نصبی مستقل و راهنمای اجرای آفلاین با موفقیت دانلود شد.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 text-right">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">مدیریت پشتیبان‌گیری، بازیابی و پکیج نصب آفلاین</h2>
              <p className="text-xs text-slate-300">
                پشتیبان‌گیری کامل از مدل‌ها و سناریوهای ذخیره‌شده، به‌روزرسانی کتابخانه‌ها و ساخت فایل نصبی ویندوز
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-700">
          {/* Status Feedback Banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-center gap-2 font-bold ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Section 1: Backup & Export */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-600" />
                ۱. خروجی و پشتیبان‌گیری از تمام کتابخانه‌ها (Export Backup)
              </h3>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                فرمت JSON
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              ذخیره جامع تمام مدل‌های سفارشی تعاریف‌شده در استودیوها، سناریوهای متراژ، کتابخانه یونیت‌ها و ضرایب بادخور یادگیری هوشمند در یک فایل پشتیبان.
            </p>

            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              دانلود فایل پشتیبان کامل (SolidWorks_Master_Backup.json)
            </button>
          </div>

          {/* Section 2: Restore & Import */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                ۲. بازیابی و وارد کردن فایل بکاپ (Import Backup File)
              </h3>
            </div>

            <div className="flex items-center gap-4 py-1">
              <span className="font-bold text-slate-800">حالت وارد کردن:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="restoreMode"
                  checked={restoreMode === 'merge'}
                  onChange={() => setRestoreMode('merge')}
                  className="accent-blue-600"
                />
                <span>ادغام با داده‌های موجود (ترکیب)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-rose-700">
                <input
                  type="radio"
                  name="restoreMode"
                  checked={restoreMode === 'replace'}
                  onChange={() => setRestoreMode('replace')}
                  className="accent-rose-600"
                />
                <span>جایگزینی کامل (پاکسازی و بازنویسی)</span>
              </label>
            </div>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                انتخاب و وارد کردن فایل بکاپ (.json)
              </label>
            </div>
          </div>

          {/* Section 3: Update Libraries */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                ۳. به روزرسانی کتابخانه یونیت‌ها و ضرایب به استاندارد ۲۰۲۶
              </h3>
            </div>
            <p className="text-slate-600">
              بروزرسانی استانداردهای لولا گازور، ساچمه ریل، یونیت جزیره و ضرایب بادخور به آخرین مقادیر کارخانه‌ای.
            </p>

            <button
              onClick={handleUpdateLibraries}
              disabled={isUpdating}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              به روزرسانی اتوماتیک کتابخانه‌ها و یونیت‌ها
            </button>
          </div>

          {/* Section 4: Standalone Offline Installer Builder */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-4 rounded-xl space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                ۴. دانلود پکیج ساخت فایل نصبی مستقل و اجرای ۱۰۰٪ آفلاین
              </h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 font-mono">
                Windows .EXE Builder
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              دانلود مستقیم فایل‌های سورس پایتون (`SolidWorks_Master_App.pyw`)، فایل بات ساخت نصبی (`build_exe_installer.bat`) و دفترچه راهنمای کامل جهت تولید فایل EXE مستقل برای کارگاه و سیستم‌های بدون اینترنت.
            </p>

            <button
              onClick={handleDownloadInstallerPackage}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 border border-blue-400/30"
            >
              <Download className="w-4 h-4" />
              دانلود پکیج کامل فایل نصبی و راهنمای ویندوز (.EXE Installer Package)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
