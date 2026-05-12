import { useState, useRef, useCallback } from 'react';
import { sendMessageToGroq, buildUserContext, getErrorMessage, isGroqConfigured } from '../services/groqService';
import { useFirestore } from './useFirestore';

const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'ai',
  content: isGroqConfigured()
    ? "Hi there! 👋 I'm your **FocusFlow AI Coach**, powered by Groq's lightning-fast LLaMA model.\n\nI can help you **prioritize tasks**, plan **focus sessions**, review your **goals**, and keep you **motivated**. What would you like to work on today?"
    : "Hi there! 👋 I'm your **FocusFlow AI Coach**.\n\nTo enable AI responses, add your `VITE_GROQ_API_KEY` to the `.env` file and restart the dev server. Get a free key at **console.groq.com**.",
};

export const useAIChat = () => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  // Load user data for context injection
  const { data: tasks } = useFirestore('tasks');
  const { data: sessions } = useFirestore('focusSessions');
  const { data: goals } = useFirestore('goals');

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || isStreaming) return;

    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    setError(null);

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: userText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const context = buildUserContext(tasks, sessions, goals);

      // Build history excluding the streaming placeholder
      const history = [...messages, userMessage];

      let finalContent = '';
      await sendMessageToGroq(
        history,
        context,
        (chunk, accumulated) => {
          setStreamingContent(accumulated);
          finalContent = accumulated;
        },
        controller.signal
      );

      // Commit the final message
      const aiMessage = {
        id: Date.now() + 1,
        role: 'ai',
        content: finalContent,
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg) {
        setError(msg);
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'ai',
          content: `⚠️ ${msg}`,
          isError: true,
        }]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [messages, isStreaming, tasks, sessions, goals]);

  const clearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([INITIAL_MESSAGE]);
    setStreamingContent('');
    setIsStreaming(false);
    setError(null);
  }, []);

  const cancelStream = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return {
    messages,
    streamingContent,
    isStreaming,
    error,
    sendMessage,
    clearChat,
    cancelStream,
  };
};
