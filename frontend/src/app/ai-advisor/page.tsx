'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, Zap } from 'lucide-react';
import { fetchFromAPI } from '@/lib/api';

const SAMPLE_PROMPTS = [
  'Why did I spend more this month?',
  'What can I reduce to save ₹10,000?',
  'Predict next month expenses in ₹.',
  'Where am I wasting money?',
  'What is my top expense driver?',
];

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am **Vyora AI**, your personal financial advisor. I have analyzed your income streams, budget caps, and historical expenditure trends in Indian Rupees (₹).\n\nHow can I optimize your financial health today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const newMsgs = [...messages, { sender: 'user' as const, text: userPrompt }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const res = await fetchFromAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (res.success && res.answer) {
        setMessages([...newMsgs, { sender: 'ai', text: res.answer }]);
      } else {
        setMessages([...newMsgs, { sender: 'ai', text: 'Apologies, I encountered an issue analyzing the ledger. Please try again.' }]);
      }
    } catch (err) {
      console.error('AI chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Gemini AI Financial Advisor <Sparkles className="w-5 h-5 text-purple-400" />
        </h1>
        <p className="text-xs text-slate-400 mt-1">Natural language financial intelligence powered by Google Gemini API & statistical forecasting models (INR ₹).</p>
      </div>

      {/* Preset Recommendation Pills */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3 text-purple-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="glass-card rounded-2xl p-6 flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 font-medium">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Gemini AI is analyzing your ledger & calculating linear trajectory...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="mt-4 flex items-center gap-3 pt-3 border-t border-slate-800"
        >
          <input
            type="text"
            placeholder="Ask Gemini AI any financial question (e.g. 'Can I save ₹10,000 next month?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
