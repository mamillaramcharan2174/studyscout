import React from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  ChevronUp,
  ChevronDown,
  User,
  Bot,
  HelpCircle,
  Loader2,
  X,
} from 'lucide-react';
import { FollowUpMessage, Citation } from '../types';

interface FollowUpChatProps {
  messages: FollowUpMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectCitation: (citation: Citation) => void;
  allSources: Citation[];
  hasReport: boolean;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectCitation,
  allSources,
  hasReport,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputText, setInputText] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  const quickPrompts = [
    'Explain the conflicting findings in simple terms',
    'What did the uploaded document specifically report?',
    'What are the critical limitations of these findings?',
    'Can you summarize finding #1 in 2 sentences?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const findCitation = (idx: number) => allSources.find((s) => s.citationIndex === idx);

  const renderCitedText = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const cIdx = parseInt(match[1], 10);
        const cit = findCitation(cIdx);
        return (
          <button
            key={i}
            onClick={() => cit && onSelectCitation(cit)}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-950 dark:hover:bg-teal-900 dark:text-teal-300 transition-colors"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  if (!hasReport) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-lg w-full no-print">
      {/* Floating Pill Toggle (when collapsed) */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="ml-auto flex items-center gap-2.5 px-4 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-500/25 transition-all transform hover:scale-105"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold">Ask Follow-up Questions</span>
          {messages.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-teal-700 font-bold text-[10px] flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      ) : (
        /* Expanded Chat Panel */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[520px] max-h-[80vh] animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Research Assistant Follow-Up
                </h3>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                  Grounded in Research Report & Sources
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.length === 0 ? (
              <div className="text-center py-8 px-4 space-y-3">
                <Sparkles className="w-6 h-6 text-teal-500 mx-auto" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Ask any follow-up question regarding the research findings, methodology, uploaded documents, or conflicting evidence.
                </p>

                {/* Quick Starters */}
                <div className="space-y-1.5 pt-2 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Suggested Questions:
                  </span>
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(prompt)}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none whitespace-pre-line font-sans'
                    }`}
                  >
                    {renderCitedText(msg.content)}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Assistant retrieving evidence from research context...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask follow-up or request clarification..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-xl text-white transition-all ${
                !inputText.trim() || isLoading
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 shadow-sm'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
