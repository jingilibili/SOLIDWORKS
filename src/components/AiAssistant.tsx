import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Code, Terminal, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  source?: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: 'سلام! من دستیار هوشمند سالیدورک (SolidWorks CAD Master) هستم.\nچطور می‌توانم در طراحی پارامتریک، ماکرونویسی، استانداردهای کابینت‌سازی یا تراشکاری CNC به شما کمک کنم؟',
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'نحوه ساخت جدول برش (Cut List) برای کابینت MDF چگونه است؟',
    'چگونه ماکروی سالیدورک را به کلید میانبر متصل کنم؟',
    'حل خطای Zero Thickness Geometry هنگام اکسترود',
    'استاندارد بادخور درب‌های کابینت و جای لولا گازور 35mm',
    'کد پایتون برای اتصال به SolidWorks COM API',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/solidworks/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: 'کاربر در حال استفاده از دستیار جامع سالیدورک است.',
        }),
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.text || 'پاسخی دریافت نشد.',
        source: data.source,
        time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: 'خطا در ارتباط با سرور. مطمئن شوید برنامه به صورت صحیح اجرا شده است.',
          time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              پاسخگوی تخصصی هوش مصنوعی سالیدورک
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                CAD Persian AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              پاسخگوی تمام سوالات فنی مدلسازی، شیت متال، ساختار کابینت، تراشکاری و ماکرونویسی
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs space-y-2 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                <div className={`text-[10px] font-mono flex items-center justify-end ${isUser ? 'text-blue-100' : 'text-slate-400'}`}>
                  {msg.time}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              در حال تحلیل سوال و تولید پاسخ مهندسی سالیدورک...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions Chips */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-[11px] text-slate-500 shrink-0 font-medium">سوالات پیشنهادی:</span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] rounded-lg whitespace-nowrap transition border border-slate-200 shadow-sm"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          placeholder="سوال خود را درباره سالیدورک بپرسید..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputPrompt.trim()}
          className={`p-2.5 rounded-xl transition ${
            inputPrompt.trim() && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4 rotate-180" />
        </button>
      </div>
    </div>
  );
};
