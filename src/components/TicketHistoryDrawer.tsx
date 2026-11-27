import React from 'react';
import { CheckCircle2, PhoneOff, X } from 'lucide-react';
import { Language, UI_TEXT } from '../data/scenarios';
import { TicketRecord } from '../types/game';

interface TicketHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  tickets: TicketRecord[];
  lang: Language;
}

export const TicketHistoryDrawer: React.FC<TicketHistoryDrawerProps> = ({
  open,
  onClose,
  tickets,
  lang,
}) => {
  if (!open) return null;
  const t = UI_TEXT[lang];
  const isRtl = lang === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50" role="dialog" aria-modal="true">
      <div
        className={`w-full max-w-md h-full bg-white text-slate-900 shadow-2xl flex flex-col border-slate-200 ${
          isRtl ? 'border-e' : 'border-s'
        }`}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-base text-slate-900">{t.historyDrawerTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-sm text-slate-500">{t.historyEmpty}</div>
          ) : (
            tickets.map((item) => {
              const isResolved = item.status === 'resolved';
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900">
                      {item.scenario.name[lang]}
                    </div>
                    <div
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        isResolved ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isResolved ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <PhoneOff className="w-3.5 h-3.5" />
                      )}
                      <span>{isResolved ? t.callResolvedTag : t.callDroppedTag}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.summary[lang]}</p>
                  <div className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-500 pt-1 border-t border-slate-200">
                    <span>
                      {item.pointsEarned >= 0 ? `+${item.pointsEarned}` : item.pointsEarned} pts
                    </span>
                    <span>
                      CSAT {item.csatDelta >= 0 ? `+${item.csatDelta.toFixed(1)}` : item.csatDelta.toFixed(1)}★
                    </span>
                    <span>{item.timeTakenSec}s</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
