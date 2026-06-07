'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mic, MicOff, Sparkles, RotateCcw, ChevronRight } from 'lucide-react'
import api from '@/services/api'

interface Message {
  id: string
  from: 'user' | 'bot'
  text: string
  at: number
}

interface Props {
  restaurantId: string
  restaurantName: string
  restaurantSlug: string
  gold: string
  phone?: string
}

const QUICK_CHIPS = [
  { label: '🍽️ Menu dekho', msg: 'Show me your menu categories' },
  { label: '🔥 Aaj ke deals', msg: 'What are today\'s special deals?' },
  { label: '📅 Table book karo', msg: 'How do I book a table?' },
  { label: '⏰ Opening hours', msg: 'What are your opening hours?' },
]

function TypingDots({ gold }: { gold: string }) {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
          style={{ width: 7, height: 7, borderRadius: '50%', background: gold }}
        />
      ))}
    </div>
  )
}

export default function RestaurantChat({ restaurantId, restaurantName, restaurantSlug, gold, phone }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [listening, setListening] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Welcome message on open
  useEffect(() => {
    if (!open || messages.length > 0) return
    setTimeout(() => {
      setMessages([{
        id: 'welcome',
        from: 'bot',
        text: `Namaste! 🙏 Main ${restaurantName} ka AI assistant hoon. Menu, deals, table booking, ya kuch bhi — poochho! Kaise help kar sakta hoon aapki?`,
        at: Date.now(),
      }])
    }, 400)
  }, [open, messages.length, restaurantName])

  // Focus input when open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  // Setup speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'hi-IN'
    recognitionRef.current = rec
  }, [])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setShowChips(false)
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text: trimmed, at: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setSending(true)
    setTyping(true)

    try {
      const data = await api.post<{ reply: string }>('/chat/restaurant', {
        message: trimmed,
        restaurantId,
        restaurantSlug,
      })
      setTyping(false)
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        from: 'bot',
        text: data?.reply || 'Thodi der mein try karein. 🙏',
        at: Date.now(),
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setTyping(false)
      setMessages(prev => [...prev, {
        id: `e-${Date.now()}`,
        from: 'bot',
        text: 'Abhi network issue hai. Thodi der mein dobara try karein ya call karein. 🙏',
        at: Date.now(),
      }])
    } finally {
      setSending(false)
    }
  }

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) return
    if (listening) { rec.stop(); setListening(false); return }
    try {
      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript as string
        setInput(prev => prev ? prev + ' ' + transcript : transcript)
      }
      rec.onerror = () => setListening(false)
      rec.onend = () => setListening(false)
      rec.start()
      setListening(true)
    } catch { setListening(false) }
  }

  const resetChat = () => {
    setMessages([])
    setShowChips(true)
    setSending(false)
    setTyping(false)
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, ${gold}, #b8860b)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 0 ${gold}66`,
        }}
        animate={{ boxShadow: [`0 0 0 0 ${gold}66`, `0 0 0 12px ${gold}00`] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {open
          ? <X size={22} color="#000" />
          : <Sparkles size={22} color="#000" />
        }
      </motion.button>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              position: 'fixed', bottom: 160, right: 20, zIndex: 50,
              width: 360, maxWidth: 'calc(100vw - 32px)',
              background: 'linear-gradient(160deg, #111111, #0d0d0d)',
              border: `1px solid ${gold}44`,
              borderRadius: 24,
              boxShadow: `0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px ${gold}22, inset 0 1px 0 ${gold}18`,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              padding: '14px 16px',
              background: `linear-gradient(135deg, ${gold}18, ${gold}08)`,
              borderBottom: `1px solid ${gold}22`,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              {/* AI Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${gold}, #b8860b)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 12px ${gold}55`,
              }}>
                <Sparkles size={18} color="#000" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#ffffff', fontSize: 13, fontWeight: 700, margin: 0, letterSpacing: 0.3 }}>
                  {restaurantName}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}
                  />
                  <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 500 }}>AI Assistant • Online</span>
                </div>
              </div>

              <button
                onClick={resetChat}
                title="Reset chat"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4, borderRadius: 6, display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Messages ── */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '16px 14px', maxHeight: 320,
              display: 'flex', flexDirection: 'column', gap: 10,
              scrollbarWidth: 'thin', scrollbarColor: `${gold}22 transparent`,
            }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                  {m.from === 'bot' && (
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${gold}, #b8860b)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={12} color="#000" />
                    </div>
                  )}
                  <div style={{ maxWidth: '75%' }}>
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: m.from === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: m.from === 'user'
                        ? `linear-gradient(135deg, ${gold}, #b8860b)`
                        : '#1e1e1e',
                      color: m.from === 'user' ? '#000' : '#f0f0f0',
                      fontSize: 13, lineHeight: 1.55,
                      border: m.from === 'bot' ? `1px solid #2a2a2a` : 'none',
                      fontWeight: m.from === 'user' ? 600 : 400,
                    }}>
                      {m.text}
                    </div>
                    <p style={{ color: '#555', fontSize: 10, margin: '3px 6px 0', textAlign: m.from === 'user' ? 'right' : 'left' }}>
                      {formatTime(m.at)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${gold}, #b8860b)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Sparkles size={12} color="#000" />
                  </div>
                  <div style={{ background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: '18px 18px 18px 4px' }}>
                    <TypingDots gold={gold} />
                  </div>
                </div>
              )}

              {/* Quick Chips — show after welcome */}
              {showChips && messages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 4 }}
                >
                  {QUICK_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => sendMessage(chip.msg)}
                      style={{
                        background: `${gold}14`, border: `1px solid ${gold}44`,
                        color: gold, fontSize: 11, fontWeight: 600,
                        padding: '5px 10px', borderRadius: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 0.3,
                      }}
                    >
                      {chip.label}
                      <ChevronRight size={10} />
                    </button>
                  ))}
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Input Bar ── */}
            <div style={{
              padding: '10px 12px',
              borderTop: `1px solid ${gold}18`,
              background: '#0a0a0a',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                placeholder="Kuch bhi poochho..."
                style={{
                  flex: 1, background: '#141414', border: `1px solid #2a2a2a`,
                  borderRadius: 12, padding: '9px 14px', color: '#f0f0f0',
                  fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={toggleMic}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: listening ? `1px solid ${gold}` : '1px solid #2a2a2a',
                  background: listening ? `${gold}18` : 'transparent',
                  color: listening ? gold : '#666', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={sending || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 36, height: 36, borderRadius: '50%', border: 'none',
                  background: input.trim() ? `linear-gradient(135deg, ${gold}, #b8860b)` : '#1e1e1e',
                  color: input.trim() ? '#000' : '#444', cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={14} />
              </motion.button>
            </div>

            {/* ── Footer hint ── */}
            {phone && (
              <div style={{ padding: '6px 14px 10px', textAlign: 'center' }}>
                <a href={`tel:${phone}`} style={{ color: '#555', fontSize: 11 }}>
                  📞 Call: <span style={{ color: gold, fontWeight: 600 }}>{phone}</span>
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
