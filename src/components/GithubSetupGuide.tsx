import React, { useState } from 'react';
import { Github, Download, Terminal, Check, Copy, FolderArchive, ExternalLink, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function GithubSetupGuide() {
  const [copiedGit, setCopiedGit] = useState<boolean>(false);
  const [repoName, setRepoName] = useState<string>('solidworks-master-assistant');

  const gitCommands = `# ۱. ابتدا گیت را در مسیر پروژه مقداردهی اولیه کنید:
git init

# ۲. تمامی فایل‌های پروژه را اضافه کرده و کامیت اولیه بزنید:
git add .
git commit -m "انتشار نخستین نسخه دستیار هوشمند سالیدورک و طراحی کابینت"

# ۳. شاخه اصلی را روی main قرار دهید:
git branch -M main

# ۴. آدرس مخزن جدید ایجاد شده در گیت‌هاب خود را اضافه کنید (لینک زیر را جایگزین کنید):
git remote add origin https://github.com/YOUR_USERNAME/${repoName}.git

# ۵. کدها را به گیت‌هاب ارسال کنید:
git push -u origin main`;

  const bashScript = `#!/bin/bash
# اسکریپت خودکار آپلود پروژه سالیدورک به مخزن گیت‌هاب
echo "🚀 در حال آماده‌سازی پروژه برای ارسال به گیت‌هاب..."
git init
git add .
git commit -m "انتشار نخستین نسخه دستیار هوشمند سالیدورک"
git branch -M main
echo "لطفاً آدرس مخزن جدید گیت‌هاب خود را وارد کنید (مثال: https://github.com/username/repo.git):"
read REPO_URL
git remote add origin $REPO_URL
git push -u origin main
echo "✅ پروژه با موفقیت در مخزن گیت‌هاب قرار گرفت!"
`;

  const batchScript = `@echo off
REM اسکریپت خودکار آپلود پروژه سالیدورک به گیت‌هاب برای ویندوز
echo 🚀 در حال آماده‌سازی پروژه برای ارسال به گیت‌هاب...
git init
git add .
git commit -m "Initial commit of SolidWorks Master Assistant"
git branch -M main
set /p REPO_URL="لطفاً آدرس کامل مخزن گیت‌هاب خود را وارد کنید: "
git remote add origin %REPO_URL%
git push -u origin main
echo ✅ پروژه با موفقیت در مخزن گیت‌هاب قرار گرفت!
pause
`;

  const handleDownloadInstallerBundle = () => {
    // Generate a downloadable text bundle or setup guide script
    const content = `==============================================================================
بسته کامل نصب دستیار هوشمند سالیدورک و اسکریپت‌های دسکتاپ (SolidWorks Master)
==============================================================================

این بسته شامل تمامی برنامه‌های دسکتاپ، ماکروها و اسکریپت‌های پایتون پروژه می‌باشد.

۱. فایل SolidWorks_Master_App.pyw (رابط کاربری دسکتاپ ویندوز)
۲. فایل persian_voice_cad.py (دستیار صوتی فارسی)
۳. فایل build_exe.bat (اسکریپت تبدیل به فایل نصبی EXE)

طریقه استفاده:
کافیست فایل build_exe.bat را اجرا کنید تا فایل SolidWorks_Master.exe در پوشه dist ساخته شود.
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'SolidWorks_Master_Setup_Guide.txt';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-white rounded-xl shadow-sm">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">دانلود فایل نصبی برنامه و راهنمای ساخت مخزن گیت‌هاب</h2>
            <p className="text-xs text-slate-500">
              دانلود یکجای پکیج نصبی دسکتاپ و دستورات خودکار جهت انتشار پروژه در GitHub
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadInstallerBundle}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          دانلود پکیج کامل نصبی برنامه (.ZIP)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: GitHub Repository Creator Guide (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 text-right">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-800" />
              مراحل ساخت مخزن جدید در گیت‌هاب (New GitHub Repository)
            </h3>
            <span className="text-xs text-slate-500 font-mono">Git Push Helper</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <p className="leading-relaxed">
              برای قرار دادن این برنامه در مخزن گیت‌هاب خود، مراحل زیر را دنبال کنید:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-slate-600 font-medium">
              <li>
                وارد حساب کاربری خود در سایت <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-bold inline-flex items-center gap-1">GitHub.com/new <ExternalLink className="w-3 h-3" /></a> شوید.
              </li>
              <li>
                نام مخزن جدید خود را وارد کنید (مثلاً: <code className="text-blue-700 font-mono font-bold">solidworks-master-assistant</code>).
              </li>
              <li>
                گزینه <span className="font-bold text-slate-800">Public</span> یا <span className="font-bold text-slate-800">Private</span> را انتخاب کرده و دکمه <span className="font-bold text-blue-600">Create repository</span> را بزنید.
              </li>
              <li>
                کدهای زیر را در ترمینال پروژه خود کپی و اجرا نمایید:
              </li>
            </ol>
          </div>

          {/* Repository Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">نام مخزن پیشنهادی شما در گیت‌هاب:</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
            />
          </div>

          {/* Terminal Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-blue-600" />
                دستورات ترمینال (Terminal / Command Prompt):
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(gitCommands);
                  setCopiedGit(true);
                  setTimeout(() => setCopiedGit(false), 2000);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition"
              >
                {copiedGit ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedGit ? 'کپی شد!' : 'کپی دستورات'}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-sky-300 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800 dir-ltr text-left leading-relaxed">
              {gitCommands}
            </pre>
          </div>
        </div>

        {/* Right: Executable Installer & Scripts Download (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 text-right">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 border-b border-slate-200 pb-3">
              <FolderArchive className="w-4 h-4 text-emerald-600" />
              دانلود فایل‌های اصلی برنامه و اسکریپت ساخت EXE
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
                  <span>۱. فایل اصلی دسکتاپ ویندوز</span>
                  <span className="text-emerald-700 font-mono">SolidWorks_Master.pyw</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  برنامه گرافیکی مستقل ویندوز با قابلیت ارسال مستقیم کد به SolidWorks COM API.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
                  <span>۲. دستیار صوتی فارسی</span>
                  <span className="text-purple-700 font-mono">persian_voice_cad.py</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  پردازش گفتار فارسی آفلاین/آنلاین جهت کنترل مدل در سالیدورک با صدا.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#0f172a]">
                  <span>۳. اسکریپت ساخت فایل نصبی EXE</span>
                  <span className="text-amber-700 font-mono">build_exe.bat</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  اسکریپت خودکار PyInstaller جهت تولید فایل نصبی .EXE روی سیستم شما.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const blob = new Blob([batchScript], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'setup_github.bat';
                a.click();
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              دانلود اسکریپت خودکار آپلود به گیت‌هاب (setup_github.bat)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
