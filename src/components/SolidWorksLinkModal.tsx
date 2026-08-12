import React, { useState } from 'react';
import { generatePythonDesktopAppScript, generateBuildExeBat } from '../utils/pythonInstallerBuilder';
import { 
  Link2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  FolderArchive
} from 'lucide-react';

interface SolidWorksLinkModalProps {
  isSwConnected: boolean;
  onConnectSw: () => void;
}

export const SolidWorksLinkModal: React.FC<SolidWorksLinkModalProps> = ({
  isSwConnected,
  onConnectSw,
}) => {
  const [copiedApp, setCopiedApp] = useState<boolean>(false);
  const [copiedBat, setCopiedBat] = useState<boolean>(false);

  const pythonScript = generatePythonDesktopAppScript();
  const batScript = generateBuildExeBat();

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0f172a]">اتصال به SolidWorks و تولید فایل نصبی دسکتاپ (.EXE)</h2>
              <p className="text-xs text-slate-500">
                برنامه مستقل ویندوز به همراه اسکریپت PyInstaller جهت خروجی فایل EXE دسکتاپ
              </p>
            </div>
          </div>

          <button
            onClick={onConnectSw}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
              isSwConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-sm'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            {isSwConnected ? 'اتصال برقرار است ✅' : '🔗 تست اتصال به SolidWorks COM API'}
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
          {isSwConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="text-slate-700">
            {isSwConnected
              ? 'سالیدورک فعال روی سیستم شما شناسایی شد. دستورات به صورت مستقیم ارسال می‌شوند.'
              : 'برای اتصال مستقیم COM API، نرم‌افزار SolidWorks را روی سیستم خود باز نگه دارید یا فایل EXE دسکتاپ زیر را بسازید.'}
          </div>
        </div>
      </div>

      {/* Exe Installer Builder Kit */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-blue-600" />
            پکیج ساخت فایل نصبی مستقل ویندوز (Python Tkinter + PyInstaller)
          </h3>
          <button
            onClick={() => {
              handleDownload('SolidWorks_Master_App.pyw', pythonScript);
              handleDownload('build_exe.bat', batScript);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            دانلود پکیج کامل سورس و اسکریپت EXE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File 1: Python Desktop GUI App */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-blue-600" />
                سورس کد برنامه دسکتاپ (SolidWorks_Master_App.pyw)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pythonScript);
                    setCopiedApp(true);
                    setTimeout(() => setCopiedApp(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  {copiedApp ? 'کپی شد' : 'کپی'}
                </button>
                <button
                  onClick={() => handleDownload('SolidWorks_Master_App.pyw', pythonScript)}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  دانلود pyw
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-xl max-h-72 overflow-y-auto border border-slate-800 dir-ltr text-left">
              {pythonScript}
            </pre>
          </div>

          {/* File 2: Build Exe Batch Script */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-amber-600" />
                اسکریپت ساخت فایل EXE (build_exe.bat)
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(batScript);
                    setCopiedBat(true);
                    setTimeout(() => setCopiedBat(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                >
                  {copiedBat ? 'کپی شد' : 'کپی'}
                </button>
                <button
                  onClick={() => handleDownload('build_exe.bat', batScript)}
                  className="px-2.5 py-1 bg-amber-600 text-white rounded hover:bg-amber-700"
                >
                  دانلود bat
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 text-amber-300 font-mono text-[11px] rounded-xl max-h-72 overflow-y-auto border border-slate-800 dir-ltr text-left">
              {batScript}
            </pre>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <h4 className="font-bold text-[#0f172a]">طریقه ساخت فایل EXE در ۳ گام ساده:</h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>فایل‌های <code className="text-blue-700 font-semibold">SolidWorks_Master_App.pyw</code> و <code className="text-amber-700 font-semibold">build_exe.bat</code> را دانلود کنید.</li>
            <li>هر دو فایل را در یک پوشه قرار دهید و روی <code className="text-amber-700 font-semibold">build_exe.bat</code> دبل کلیک کنید.</li>
            <li>برنامه به صورت خودکار پایتون و PyInstaller را تنظیم کرده و فایل نصبی مستقل <code className="text-emerald-700 font-semibold">SolidWorks_Master.exe</code> را در پوشه dist تولید می‌کند!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
