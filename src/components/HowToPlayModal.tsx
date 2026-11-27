import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Language, UI_TEXT } from '../data/scenarios';

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
  lang: Language;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ open, onClose, lang }) => {
  if (!open) return null;
  const t = UI_TEXT[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 font-bold text-base">
            <HelpCircle className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 id="how-to-title">{t.howToTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{t.howToIntro}</p>
          <ul className="space-y-2.5 text-sm text-slate-800">
            {t.howToRules.map((rule, idx) => (
              <li key={idx} className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 leading-relaxed">
                {rule}
              </li>
            ))}
          </ul>
          <div className="text-xs font-mono-tabular text-slate-500 pt-1">{t.controlsHint}</div>
        </div>

        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
