import React from 'react';
import { X, Key, Shield, Info, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<AppSettings>(settings);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Agent Configuration & API Keys
              </h2>
              <p className="text-xs text-slate-500">
                Optional: Supply custom API keys or use the built-in Intelligent Engine.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-teal-900 dark:text-teal-200 leading-relaxed">
              <strong>Zero Config Ready:</strong> StudyScout is fully functional out of the box with its built-in Native Function Calling Agent Engine, live Wikipedia API, and CrossRef academic paper search. Keys below are entirely optional!
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={formData.geminiKey || ''}
              onChange={(e) => setFormData({ ...formData, geminiKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Enables Gemini 1.5 Flash/Pro plan decomposition and native function calling.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Brave Search API Key
            </label>
            <input
              type="password"
              placeholder="BSAc..."
              value={formData.braveKey || ''}
              onChange={(e) => setFormData({ ...formData, braveKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Used for live real-time web search if provided.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tavily Search API Key
            </label>
            <input
              type="password"
              placeholder="tvly-..."
              value={formData.tavilyKey || ''}
              onChange={(e) => setFormData({ ...formData, tavilyKey: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-mono"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Alternative research search engine.
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-400" />
              Stored locally in browser session
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium flex items-center gap-1.5 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Saved!
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
