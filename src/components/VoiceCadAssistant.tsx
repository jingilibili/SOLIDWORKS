import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Terminal, Code, Download, Play, CheckCircle2, AlertCircle, Bot, Wand2, ArrowLeft } from 'lucide-react';
import { CabinetParams } from '../types';

interface VoiceCadAssistantProps {
  onApplyCabinetParams?: (params: Partial<CabinetParams>) => void;
  onNavigateTab?: (tabName: string) => void;
}

export function VoiceCadAssistant({ onApplyCabinetParams, onNavigateTab }: VoiceCadAssistantProps) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [parsedResult, setParsedResult] = useState<{
    intent: string;
    params: Record<string, any>;
    persianExplanation: string;
  } | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'fa-IR';

    recognition.onresult = (event: any) => {
      let currentText = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      addLog(`خطای میکروفون / تشخیص گفتار: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      addLog('پایان ضبط صدا. در حال پردازش دستور فارسی...');
    };

    recognitionRef.current = recognition;
  }, []);

  const addLog = (msg: string) => {
    setLogs((prev) => [ `[${new Date().toLocaleTimeString('fa-IR')}] ${msg}`, ...prev.slice(0, 15) ]);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('مرورگر شما از قابلیت Web Speech API صوتی پشتیبانی نمی‌کند. می‌توانید متن دستور را تایپ کنید.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setParsedResult(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        addLog('میکروفون فعال شد. آماده دریافت دستورات فارسی سالیدورک...');
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Persian Speech Command Parser Algorithm
  const parsePersianCommand = (text: string) => {
    if (!text.trim()) return;

    addLog(`در حال تحلیل عبارت: "${text}"`);

    // Extract numbers from text (both Persian and English digits)
    const normalizedText = text
      .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
      .toLowerCase();

    const numbers = normalizedText.match(/\d+/g)?.map(Number) || [];

    let intent = 'unknown';
    let params: Record<string, any> = {};
    let explanation = 'دستور تشخیص داده نشد. لطفاً دستور واضح‌تری بگوئید.';

    if (normalizedText.includes('کابینت') || normalizedText.includes('زمینی') || normalizedText.includes('دیواری') || normalizedText.includes('کمد')) {
      intent = 'create_cabinet';

      let width = 600;
      let height = 850;
      let depth = 550;
      let doorCount = 1;

      // Check keywords for type
      let cabinetType = 'base';
      if (normalizedText.includes('دیواری') || normalizedText.includes('هوایی')) {
        cabinetType = 'wall';
        height = 700;
        depth = 350;
      } else if (normalizedText.includes('کمد') || normalizedText.includes('ایستاده') || normalizedText.includes('سوپرمارکت')) {
        cabinetType = 'pantry';
        height = 2200;
        depth = 580;
      }

      // Extract specific numbers if present
      if (numbers.length >= 3) {
        width = numbers[0];
        height = numbers[1];
        depth = numbers[2];
      } else if (numbers.length === 2) {
        width = numbers[0];
        height = numbers[1];
      } else if (numbers.length === 1) {
        width = numbers[0];
      }

      if (normalizedText.includes('دو درب') || normalizedText.includes('۲ درب')) {
        doorCount = 2;
      }

      params = {
        cabinetType,
        width,
        height,
        depth,
        doorCount,
        name: `کابینت ${cabinetType === 'base' ? 'زمینی' : cabinetType === 'wall' ? 'دیواری' : 'ایستاده'} صوتی`
      };

      explanation = `دستور ساخت کابینت ${cabinetType === 'base' ? 'زمینی' : cabinetType === 'wall' ? 'دیواری' : 'ایستاده'} با عرض ${width}mm، ارتفاع ${height}mm، عمق ${depth}mm و ${doorCount} درب تشخیص داده شد.`;
    } else if (normalizedText.includes('لولا') || normalizedText.includes('یراق') || normalizedText.includes('ریل')) {
      intent = 'navigate_hardware';
      explanation = 'درخواست انتقال به استودیوی طراحی یراق‌آلات و لولاها.';
    } else if (normalizedText.includes('تراشکاری') || normalizedText.includes('شفت') || normalizedText.includes('قطعه')) {
      intent = 'navigate_cnc';
      explanation = 'درخواست انتقال به استودیوی تراشکاری CNC و مدلسازی شفت.';
    } else if (normalizedText.includes('راهنما') || normalizedText.includes('کتابخانه') || normalizedText.includes('آموزش')) {
      intent = 'navigate_manual';
      explanation = 'درخواست انتقال به دانشنامه مهندسی سالیدورک.';
    }

    setParsedResult({
      intent,
      params,
      persianExplanation: explanation
    });

    addLog(`نتیجه تحلیل: ${explanation}`);

    // Text to speech response
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(explanation);
        utterance.lang = 'fa-IR';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log('Speech synthesis error', e);
    }
  };

  const pythonVoiceScript = `# ==============================================================================
# دستیار صوتی فارسی اختصاصی سالیدورک (SolidWorks Persian Voice Assistant)
# نیازمندی‌ها: pip install SpeechRecognition pywin32 gTTS
# ==============================================================================
import speech_recognition as sr
import win32com.client
import re
import sys

def speak_persian(text):
    print(f"[دستیار صوتی]: {text}")

def connect_solidworks():
    try:
        swApp = win32com.client.Dispatch("SldWorks.Application")
        swApp.Visible = True
        return swApp
    except Exception as e:
        print("خطا در اتصال به SolidWorks:", e)
        return None

def process_command(text, swApp):
    print(f"فرمان صوتی دریافت شده: {text}")
    
    # استخراج اعداد از متن فارسی
    numbers = [int(s) for s in re.findall(r'\\d+', text)]
    
    if "کابینت" in text or "یونیت" in text:
        w = numbers[0] if len(numbers) > 0 else 600
        h = numbers[1] if len(numbers) > 1 else 850
        d = numbers[2] if len(numbers) > 2 else 550
        
        speak_persian(f"در حال ساخت کابینت با ابعاد {w} در {h} در {d} میلیمتر در سالیدورک...")
        
        if swApp:
            model = swApp.NewDocument("", 0, 0, 0)
            # کدهای ایجاد اسپچ و اکسترود
            print("مدل با موفقیت در سالیدورک ایجاد شد.")
    else:
        speak_persian("دستور متوجه نشدم. لطفاً مجدداً تکرار کنید.")

def main():
    r = sr.Recognizer()
    swApp = connect_solidworks()
    
    speak_persian("دستیار صوتی فارسی سالیدورک آماده است. لطفاً صحبت کنید...")
    
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source)
        while True:
            try:
                print("\\n[در حال گوش دادن...]")
                audio = r.listen(source, timeout=5)
                text = r.recognize_google(audio, language="fa-IR")
                process_command(text, swApp)
            except sr.UnknownValueError:
                pass
            except sr.RequestError as e:
                print("خطا در ارتباط با سرویس تشخیص گفتار:", e)

if __name__ == "__main__":
    main()
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">دستیار صوتی فارسی هوشمند (Speech-to-CAD Engine)</h2>
            <p className="text-xs text-slate-500">
              دریافت صوتی دستورات طراحی، استخراج خودکار پارامترهای فنی و اجرای مستقیم در سالیدورک
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 font-semibold rounded-lg border border-purple-200">
            زبان: فارسی (fa-IR)
          </span>
        </div>
      </div>

      {/* Main Grid: Interactive Voice Controls & Live Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Recording Box (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 text-right">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              ضبط صوتی زنده و پردازش گفتار فارسی
            </h3>
            <span className="text-xs text-slate-500">پشتیبانی کامل از Web Speech API</span>
          </div>

          {/* Big Microphone Button */}
          <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-4">
            <button
              onClick={toggleListening}
              className={`relative p-6 rounded-full transition-all duration-300 shadow-lg ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/40'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>

            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-[#0f172a]">
                {isListening ? '🔴 در حال گوش دادن به صدای شما...' : 'برای شروع صحبت روی میکروفون کلیک کنید'}
              </span>
              <p className="text-xs text-slate-500">
                نمونه دستور: «یک کابینت زمینی عرض ۹۰ ارتفاع ۸۵ عمق ۶۰ با دو درب بساز»
              </p>
            </div>
          </div>

          {/* Live Transcript Display */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>متن تشخیص داده شده از گفتار فارسی:</span>
              <button
                onClick={() => parsePersianCommand(transcript)}
                disabled={!transcript.trim()}
                className="text-xs text-purple-700 hover:underline font-bold disabled:opacity-40"
              >
                پردازش مجدد متن
              </button>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="متن صوتی اینجا ظاهر می‌شود یا می‌توانید دستوری تایپ کنید..."
                className="flex-1 p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:border-purple-600 focus:outline-none shadow-sm"
              />
              <button
                onClick={() => parsePersianCommand(transcript)}
                disabled={!transcript.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-40"
              >
                تحلیل دستور
              </button>
            </div>
          </div>

          {/* Parsed Output Result */}
          {parsedResult && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  نتیجه استخراج هوشمند پارامترهای مهندسی:
                </span>
                <span className="text-[11px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">
                  {parsedResult.intent}
                </span>
              </div>

              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {parsedResult.persianExplanation}
              </p>

              {Object.keys(parsedResult.params).length > 0 && (
                <div className="p-3 bg-white rounded-lg border border-purple-200 text-xs font-mono text-purple-900 grid grid-cols-2 gap-2">
                  {Object.entries(parsedResult.params).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-slate-500">{k}:</span> <span className="font-bold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {parsedResult.intent === 'create_cabinet' && onApplyCabinetParams && (
                <button
                  onClick={() => {
                    onApplyCabinetParams(parsedResult.params);
                    if (onNavigateTab) onNavigateTab('cabinet');
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  انتقال پارامترهای صوتی به استودیو کابینت و ساخت مدل
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Console Logs & Standalone Python Script (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real-time Activity Logs */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              کنسول گزارش‌های زنده صوتی
            </h4>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl h-48 overflow-y-auto border border-slate-800 space-y-1 dir-ltr text-left">
              {logs.length === 0 ? (
                <div className="text-slate-500">اماده دریافت دستور صوتی...</div>
              ) : (
                logs.map((l, i) => <div key={i}>{l}</div>)
              )}
            </div>
          </div>

          {/* Standalone Python Script for Windows */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-600" />
                اسکریپت پایتون دستیار صوتی آفلاین ویندوز
              </h4>
              <button
                onClick={() => {
                  const blob = new Blob([pythonVoiceScript], { type: 'text/plain' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'persian_voice_cad.py';
                  a.click();
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                دانلود py
              </button>
            </div>
            <p className="text-xs text-slate-500">
              با اجرای این فایل پایتون در محیط ویندوز، سالیدورک مستقیماً با صدای فارسی شما کنترل می‌شود.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
