import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../api';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ type: 'bot', text: 'Hi! I am your AI Financial Assistant. Tell me what you just bought, or ask me a question.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/api/ai-chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error('Failed to connect to AI');
      
      const data = await res.json();
      setMessages(prev => [...prev, { type: 'bot', text: data.reply || data.error }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: "Sorry, I encountered an error connecting to the brain." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .ai-markdown p { margin: 0 0 0.5rem 0; }
        .ai-markdown p:last-child { margin: 0; }
        .ai-markdown ul { margin: 0; padding-left: 1.5rem; }
        .ai-markdown strong { color: inherit; }
      `}</style>
      
      {/* Floating Button */}
      <button 
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--grad-primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          zIndex: 1000,
          animation: 'pulseGlow 2.5s infinite',
          transition: 'transform 0.3s var(--ease-bounce)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={28} /> : <Bot size={32} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
            style={{
              position: 'fixed',
              bottom: '150px',
              left: '20px',
              width: 'calc(100vw - 40px)',
              maxWidth: '350px',
              height: '500px',
              maxHeight: 'calc(100vh - 180px)',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1000,
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--text-primary)',
              fontWeight: 700
            }}>
              <Bot size={24} color="var(--accent-primary)" />
              AI Financial Assistant
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.type === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: msg.type === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.75rem 1rem',
                  borderRadius: '1rem',
                  borderBottomRightRadius: msg.type === 'user' ? 0 : '1rem',
                  borderBottomLeftRadius: msg.type === 'bot' ? 0 : '1rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {msg.type === 'user' ? (
                    msg.text
                  ) : (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      className="ai-markdown"
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: '1rem', borderBottomLeftRadius: 0, display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)' }} />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)' }} />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)' }} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid var(--glass-border)',
              display: 'flex',
              gap: '0.5rem',
              background: 'var(--bg-glass-md)'
            }}>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="e.g. Spent $5 on coffee..."
              style={{
                flex: 1,
                background: 'var(--bg-glass-md)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem 1rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button onClick={sendMessage} style={{
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              padding: '0 1rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Send size={20} />
            </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
