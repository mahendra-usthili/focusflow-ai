import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot, RotateCcw, StopCircle, Zap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useAIChat } from '../../hooks/useAIChat';
import { isGroqConfigured, SUGGESTED_PROMPTS } from '../../services/groqService';
import MessageBubble from './MessageBubble';

// Typing dots animation shown while waiting for first token
const TypingIndicator = () => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-primary-500 text-white flex items-center justify-center flex-shrink-0">
      <Bot size={14} />
    </div>
    <div className="bg-dark-50 dark:bg-dark-800/70 border border-dark-100 dark:border-dark-700/60 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// Streaming bubble shows partial response in real time
const StreamingBubble = ({ content }) => (
  <div className="flex gap-3">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-primary-500 text-white flex items-center justify-center flex-shrink-0">
      <Bot size={14} />
    </div>
    <div className="max-w-[78%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-dark-50 dark:bg-dark-800/70 border border-dark-100 dark:border-dark-700/60 text-dark-800 dark:text-dark-100">
      <span>{content}</span>
      <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle" />
    </div>
  </div>
);

const AIPanel = () => {
  const { isAIPanelOpen, closeAIPanel } = useAppContext();
  const { currentUser } = useAuth();
  const {
    messages,
    streamingContent,
    isStreaming,
    sendMessage,
    clearChat,
    cancelStream,
  } = useAIChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const configured = isGroqConfigured();

  // Auto-scroll on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when panel opens
  useEffect(() => {
    if (isAIPanelOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isAIPanelOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestedPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const showSuggestions = messages.length <= 1 && !isStreaming;

  return (
    <AnimatePresence>
      {isAIPanelOpen && (
        <>
          {/* Mobile Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAIPanel}
            className="fixed inset-0 bg-dark-900/20 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 w-full md:w-[420px] h-screen bg-white/95 dark:bg-dark-900/95 backdrop-blur-2xl border-l border-dark-200 dark:border-dark-700/80 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="h-20 px-5 flex items-center justify-between border-b border-dark-100 dark:border-dark-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
                  <Sparkles className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base leading-tight text-dark-900 dark:text-white">AI Coach</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-500 animate-pulse' : 'bg-dark-400'}`} />
                    <p className="text-[10px] uppercase tracking-widest text-dark-500 font-semibold">
                      {configured ? 'Groq · LLaMA 3.3' : 'Not Configured'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  title="Clear chat"
                  className="w-9 h-9 rounded-xl text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 flex items-center justify-center transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={closeAIPanel}
                  className="w-9 h-9 rounded-xl text-dark-400 hover:text-dark-700 dark:hover:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar">
              {/* Message bubbles */}
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} currentUser={currentUser} />
              ))}

              {/* Streaming partial response */}
              {isStreaming && streamingContent && (
                <StreamingBubble content={streamingContent} />
              )}

              {/* Typing indicator (before first token arrives) */}
              {isStreaming && !streamingContent && (
                <TypingIndicator />
              )}

              {/* Suggested prompts shown on fresh chat */}
              <AnimatePresence>
                {showSuggestions && configured && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="pt-2"
                  >
                    <p className="text-xs text-dark-400 font-semibold uppercase tracking-wider mb-3 text-center">
                      Quick prompts
                    </p>
                    <div className="flex flex-col gap-2">
                      {SUGGESTED_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium bg-dark-50 dark:bg-dark-800/70 border border-dark-100 dark:border-dark-700/50 text-dark-700 dark:text-dark-200 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-200 flex items-center gap-2"
                        >
                          <Zap size={13} className="text-primary-500 flex-shrink-0" />
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-5 pb-5 pt-3 border-t border-dark-100 dark:border-dark-800 bg-white/50 dark:bg-dark-900/50 flex-shrink-0">
              <form onSubmit={handleSend} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={configured ? "Ask your AI coach anything..." : "Configure VITE_GROQ_API_KEY to start..."}
                  disabled={!configured || isStreaming}
                  rows={1}
                  className="w-full bg-dark-50 dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-900 dark:text-white rounded-2xl py-3.5 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '52px', maxHeight: '120px', overflowY: 'auto' }}
                />

                {/* Send / Stop button */}
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={cancelStream}
                    className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                    title="Stop generating"
                  >
                    <StopCircle size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim() || !configured}
                    className={`absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-xl transition-all ${
                      input.trim() && configured
                        ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
                        : 'text-dark-300 dark:text-dark-600 bg-transparent cursor-not-allowed'
                    }`}
                  >
                    <Send size={16} className={input.trim() && configured ? 'ml-0.5' : ''} />
                  </button>
                )}
              </form>

              <p className="text-[10px] text-center text-dark-400 mt-2.5 font-medium">
                {configured
                  ? 'AI responses may not always be accurate · Press Enter to send'
                  : 'Get a free API key at console.groq.com'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIPanel;
