import { useState, useRef, useEffect } from 'react';
import API from '../lib/api';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hey! I'm ElectroBot ⚡ — ask me about stations, range, or bookings." }
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    try {
      const { data } = await API.post('/ai/chat', { message: text });
      setMessages((m) => [...m, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages((m) => [...m, { from: 'bot', text: '⚠️ Something went wrong — try again.' }]);
    }
  };

  const voice = () => {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) return alert('Voice input not supported in this browser');
    const r = new Rec();
    r.lang = 'en-US'; r.interimResults = false;
    setListening(true);
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
  };

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-bolt-400 to-neon-green text-ink-900 shadow-glow-lg grid place-items-center text-2xl hover:scale-110 transition animate-float">
        {open ? '✕' : '⚡'}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] card glass-strong rounded-2xl overflow-hidden flex flex-col" style={{ height: 480 }}>
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-bolt-400 to-neon-green grid place-items-center text-ink-900 font-bold">E</div>
              <div>
                <div className="font-display font-semibold text-sm">ElectroBot</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Online
                </div>
              </div>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 p-4 space-y-3 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === 'user'
                    ? 'bg-gradient-to-br from-bolt-400 to-bolt-600 text-ink-900'
                    : 'bg-white/5 border border-white/10'
                }`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-white/10 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(input)}
              placeholder="Ask anything..." className="input !py-2" />
            <button onClick={voice} className={`btn-ghost !px-3 ${listening ? 'text-rose-400' : ''}`} title="Voice input">🎤</button>
            <button onClick={() => send(input)} className="btn-primary !px-3">→</button>
          </div>
        </div>
      )}
    </>
  );
}
