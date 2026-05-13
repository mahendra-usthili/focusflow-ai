/**
 * FocusFlow AI Service Layer
 * Handles all Groq API communication with streaming, error handling, and retries.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 30000;

// Validate API key on module load
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const isGroqConfigured = () => {
  return !!GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here';
};

/**
 * The system prompt that turns the AI into a FocusFlow productivity coach.
 */
const SYSTEM_PROMPT = `You are FocusFlow AI — a premium, intelligent productivity coach built into the FocusFlow AI Suite.

Your personality:
- Warm, encouraging, and professional
- Concise and actionable — avoid long walls of text
- Data-driven when analyzing tasks, goals, and focus sessions
- Supportive coach-style communication

Your capabilities:
- Task prioritization and planning
- Focus session recommendations (Pomodoro technique)
- Goal breakdown into milestones
- Daily productivity reviews
- Motivation and accountability
- Time management strategies
- Burnout prevention
- Work-life balance advice

Response formatting:
- Use bullet points for lists
- Use **bold** for key actions or terms
- Keep responses under 200 words unless the user asks for detail
- End with a brief follow-up question or suggestion when appropriate

You have access to context about the user's productivity data when provided. Use it to give personalized advice.`;

/**
 * Send a message to Groq and get a streaming response.
 * @param {Array} messages - Full conversation history [{role, content}]
 * @param {Object} context - Optional user context (tasks, goals, focus)
 * @param {Function} onChunk - Called with each text chunk as it streams
 * @param {AbortSignal} signal - Optional abort signal for cancellation
 */
export const sendMessageToGroq = async (messages, context = null, onChunk, signal) => {
  if (!isGroqConfigured()) {
    throw new Error('GROQ_NOT_CONFIGURED');
  }

  // Build the messages array with system prompt + context injection
  let systemContent = SYSTEM_PROMPT;
  if (context) {
    systemContent += `\n\n--- CURRENT USER CONTEXT ---\n${JSON.stringify(context, null, 2)}\n--- END CONTEXT ---`;
  }

  const apiMessages = [
    { role: 'system', content: systemContent },
    ...messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }))
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Merge with any external signal
  const combinedSignal = signal || controller.signal;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        max_tokens: MAX_TOKENS,
        temperature: 0.7,
        stream: true,
      }),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 401) throw new Error('INVALID_API_KEY');
      if (response.status === 429) throw new Error('RATE_LIMIT');
      if (response.status >= 500) throw new Error('GROQ_SERVER_ERROR');
      throw new Error(errorBody?.error?.message || `HTTP_${response.status}`);
    }

    // Read the SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || '';
            if (text) {
              fullText += text;
              onChunk(text, fullText);
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    }

    return fullText;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('REQUEST_CANCELLED');
    throw err;
  }
};

/**
 * Build a user context object from Firestore data to inject into the AI prompt.
 */
export const buildUserContext = (tasks = [], sessions = [], goals = []) => {
  const activeTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => {
    if (!t.completed || !t.updatedAt?.seconds) return false;
    const d = new Date(t.updatedAt.seconds * 1000);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.createdAt?.seconds * 1000 || s.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const focusMinutesToday = Math.round(todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60);

  const activeGoals = goals.filter(g => {
    if (!g.milestones?.length) return true;
    return g.milestones.some(m => !m.completed);
  });

  return {
    date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    tasks: {
      total: tasks.length,
      active: activeTasks.length,
      completedToday: completedToday.length,
      highPriority: activeTasks.filter(t => t.priority === 'high').map(t => t.title),
    },
    focus: {
      sessionsToday: todaySessions.length,
      minutesToday: focusMinutesToday,
    },
    goals: {
      total: goals.length,
      active: activeGoals.length,
      activeGoalTitles: activeGoals.slice(0, 3).map(g => g.title),
    },
  };
};

/**
 * Generate a structured daily plan using user data and preferences.
 * Returns a JSON-parsable plan with time blocks, reasoning, and recommendations.
 */
export const generateDailyPlan = async (tasks, focusSessions, goals, preferences = null) => {
  if (!isGroqConfigured()) {
    throw new Error('GROQ_NOT_CONFIGURED');
  }

  const context = buildUserContext(tasks, focusSessions, goals);
  const detailedContext = {
    ...context,
    preferences: preferences || {
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      focusDuration: 50,
      breakDuration: 10,
      productivityStyle: 'balanced'
    },
    activeTasks: tasks.filter(t => !t.completed).map(t => ({
      title: t.title,
      priority: t.priority,
      category: t.category,
      isStarred: t.isStarred || false,
      isPinned: t.isPinned || false,
      dueDate: t.dueDate || null
    })),
    recentGoals: goals.slice(0, 5).map(g => ({ title: g.title, progress: g.milestones?.filter(m => m.completed).length / g.milestones?.length }))
  };

  const plannerPrompt = `As FocusFlow AI, generate a HIGH-FIDELITY Daily Productivity Plan based on the provided user context and preferences.
  
  USER PREFERENCES:
  - Wake up: ${detailedContext.preferences.wakeUpTime}
  - Sleep: ${detailedContext.preferences.sleepTime}
  - Focus Duration: ${detailedContext.preferences.focusDuration}m
  - Break Duration: ${detailedContext.preferences.breakDuration}m
  - Style: ${detailedContext.preferences.productivityStyle}

  FORMAT REQUIREMENTS:
  - Respond ONLY with a valid JSON object.
  - Structure:
    {
      "plan": [
        {
          "id": "unique_string",
          "time": "HH:MM - HH:MM",
          "title": "Block Title",
          "duration": "Xm",
          "category": "Work/Health/etc",
          "priority": "high/medium/low",
          "reasoning": "Brief reasoning",
          "isCompleted": false,
          "isPinned": false,
          "isStarred": false
        }
      ],
      "recommendations": ["Tip 1", "Tip 2"],
      "focusAdvice": "Strategy"
    }

  PRIORITIZATION RULES:
  1. Respect the wake-up and sleep times strictly.
  2. Overdue tasks must be handled in the first morning block.
  3. Pinned tasks take absolute priority.
  4. Use the preferred focus/break durations to structure the blocks.
  5. Apply the "${detailedContext.preferences.productivityStyle}" style:
     - balanced: Regular focus/break intervals.
     - intense: Longer deep work focus, shorter breaks.
     - relaxed: Shorter focus, more flexible breaks.`;

  const messages = [
    { role: 'system', content: plannerPrompt },
    { role: 'user', content: `Generate my daily plan based on this data: ${JSON.stringify(detailedContext)}` }
  ];

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 2048,
        temperature: 0.5, // Lower temperature for more consistent JSON
        stream: false,
      }),
    });

    if (!response.ok) throw new Error('PLANNER_API_ERROR');
    
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    // Attempt to parse JSON from the response (in case AI adds markdown blocks)
    try {
      const jsonStr = content.match(/\{[\s\S]*\}/)?.[0] || content;
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI plan:', content);
      throw new Error('INVALID_AI_RESPONSE');
    }
  } catch (err) {
    console.error('Daily Planner Error:', err);
    throw err;
  }
};

/**
 * Get friendly error message for the UI.
 */
export const getErrorMessage = (error) => {
  switch (error.message) {
    case 'GROQ_NOT_CONFIGURED':
      return "The AI Assistant isn't configured yet. Add your VITE_GROQ_API_KEY to the .env file to enable it.";
    case 'INVALID_API_KEY':
      return "Your Groq API key appears to be invalid. Please check your .env file and restart the dev server.";
    case 'RATE_LIMIT':
      return "You've hit the rate limit. Please wait a moment before sending another message.";
    case 'GROQ_SERVER_ERROR':
      return "Groq's servers are temporarily unavailable. Please try again in a moment.";
    case 'REQUEST_CANCELLED':
      return null; // Silently ignore cancellations
    default:
      return "Something went wrong connecting to the AI. Please try again.";
  }
};

export const SUGGESTED_PROMPTS = [
  "Help me prioritize my tasks for today",
  "Create a focus plan for the next 2 hours",
  "Review my goals and suggest next steps",
  "Give me a productivity tip to stay focused",
  "How can I improve my work habits?",
];
