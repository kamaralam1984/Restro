'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import api from '@/services/api';

type ChatMessage = {
  id: string;
  from: 'user' | 'bot';
  text: string;
  at: string;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!open || messages.length === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [open, messages]);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    const welcomeTextEn =
      'Hi! I am Restro OS assistant. Ask me about subscription plans, features or how to start. I can help you see which plan fits your restaurant best.';
    const welcomeTextAr =
      'مرحباً! أنا مساعد Restro OS. يمكنك سؤالي عن الباقات، المزايا وطريقة البدء، وسأساعدك لاختيار الخطة الأنسب لمطعمك.';
    const welcome: ChatMessage = {
      id: 'welcome',
      from: 'bot',
      text: lang === 'ar' ? welcomeTextAr : welcomeTextEn,
      at: new Date().toISOString(),
    };
    setMessages([welcome]);
  }, [open, messages.length, lang]);

  // Prepare speech recognition instance
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    recognitionRef.current = rec;
  }, []);

  // Speak helper (text-to-speech)
  const speak = (text: string) => {
    if (typeof window === 'undefined' || !voiceEnabled) return;
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(utter.lang));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      from: 'user',
      text: trimmed,
      at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const data = await api.post<{ reply: string }>('/chat', { message: trimmed, lang });
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        from: 'bot',
        text: data?.reply || 'Sorry, I could not understand. Please try again or use the Contact page.',
        at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      speak(botMsg.text);
    } catch (err: unknown) {
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        from: 'bot',
        text: err instanceof Error ? err.message : 'Chat is temporarily unavailable. Please try again later.',
        at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-xl w-12 h-12 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-28 right-4 z-40 w-80 max-w-[90vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800 bg-slate-950/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold">
                  RO
                </span>
                <div>
                  <p className="text-white text-sm font-semibold">Restro Assistant</p>
                  <p className="text-[11px] text-green-400">
                    {lang === 'ar' ? 'متصل الآن' : 'Online'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-800 rounded-full p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-300'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className={`px-2 py-0.5 rounded-full ${
                    lang === 'ar' ? 'bg-purple-600 text-white' : 'text-slate-300'
                  }`}
                >
                  AR
                </button>
              </div>
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`text-xs px-2 py-1 rounded-full border ${
                  voiceEnabled ? 'border-purple-500 text-purple-300' : 'border-slate-600 text-slate-300'
                }`}
              >
                {voiceEnabled ? 'Voice On' : 'Voice Off'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 px-3 py-2 space-y-2 overflow-y-auto max-h-64">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-xs max-w-[80%] ${
                    m.from === 'user'
                      ? 'bg-purple-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-800 px-3 py-2 flex items-center gap-2 bg-slate-950/80">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'ar' ? 'اسألني عن الباقات أو المزايا...' : 'Ask about plans, features or how to start...'}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={() => {
                const rec = recognitionRef.current;
                if (!rec) return;
                if (listening) {
                  rec.stop();
                  setListening(false);
                  return;
                }
                try {
                  rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
                  rec.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript as string;
                    setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
                  };
                  rec.onerror = () => setListening(false);
                  rec.onend = () => setListening(false);
                  rec.start();
                  setListening(true);
                } catch {
                  setListening(false);
                }
              }}
              className={`p-2 rounded-xl border ${
                listening ? 'border-purple-500 text-purple-300' : 'border-slate-700 text-slate-300'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

