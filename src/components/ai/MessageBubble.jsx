import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';

/**
 * Renders AI markdown-style text: **bold**, bullet lines, newlines.
 */
const FormattedText = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Bullet points
        if (line.startsWith('- ') || line.startsWith('• ')) {
          const content = line.slice(2);
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
              <span>{renderInline(content)}</span>
            </div>
          );
        }

        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
};

const renderInline = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    // Inline code
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-dark-100 dark:bg-dark-700 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const MessageBubble = ({ message, currentUser }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-dark-100 dark:bg-dark-800'
          : isError
            ? 'bg-red-500/10 text-red-500'
            : 'bg-gradient-to-br from-orange-400 to-primary-500 text-white'
      }`}>
        {isUser ? (
          currentUser?.photoURL
            ? <img src={currentUser.photoURL} alt="You" className="w-full h-full rounded-full object-cover" />
            : <User size={14} />
        ) : isError ? (
          <AlertCircle size={14} />
        ) : (
          <Bot size={14} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-dark-900 text-white dark:bg-primary-600 dark:text-white rounded-tr-sm'
          : isError
            ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-tl-sm'
            : 'bg-dark-50 dark:bg-dark-800/70 border border-dark-100 dark:border-dark-700/60 text-dark-800 dark:text-dark-100 rounded-tl-sm'
      }`}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <FormattedText text={message.content} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
