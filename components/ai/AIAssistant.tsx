'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Bot, User as UserIcon } from 'lucide-react';
import { PaymentException } from '@/types';
import { aiApi } from '@/lib/api/ai';

interface AIAssistantProps {
  exception: PaymentException;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ exception }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your InsureFlow AI Assistant. Ask me anything about exception ${exception.exceptionNumber} or click a suggested prompt below.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (questionText?: string) => {
    const query = questionText || input;
    if (!query.trim()) return;

    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsTyping(true);

    const res = await aiApi.chatWithAI(exception.id, query);
    setIsTyping(false);

    const answer = res.success ? (res.data?.message || 'No response generated.') : 'AI service unavailable.';
    const aiMsg: Message = { id: `a-${Date.now()}`, sender: 'ai', text: answer };
    setMessages((prev) => [...prev, aiMsg]);
  };

  const presetQuestions = [
    'Why was this exception created?',
    'What should I investigate first?',
    'Summarize this exception.',
    'What should I verify before resolving it?',
  ];

  return (
    <div className="p-5 rounded-xl border border-purple-500/30 bg-slate-900/90 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-500/20 pb-3">
        <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white tracking-tight">AI Investigation Assistant</h3>
          <p className="text-[10px] text-purple-300">Instant Q&A powered by BillingCenter context</p>
        </div>
      </div>

      {/* Suggested Preset Prompt Pills */}
      <div className="flex flex-wrap gap-1.5">
        {presetQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isTyping}
            className="px-2.5 py-1 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-medium border border-purple-500/30 transition-colors disabled:opacity-50 text-left"
          >
            ✨ {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="h-48 overflow-y-auto space-y-3 p-2 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'ai' && (
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3" />
              </div>
            )}
            <div
              className={`p-2.5 rounded-lg max-w-[85%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5">
                <UserIcon className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="text-xs text-purple-400 font-mono flex items-center gap-1.5 p-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI is reasoning...
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this payment exception..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
