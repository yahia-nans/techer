import React from 'react';
import { Award, RotateCcw, Star } from 'lucide-react';
import { getAgentRank, Language, UI_TEXT } from '../data/scenarios';
import { TicketRecord } from '../types/game';

interface ShiftSummaryModalProps {
  open: boolean;
  lang: Language;
  tickets: TicketRecord[];
  csat: number;
  score: number;
  bestStreak: number;
  rebootsOrdered: number;
  idsVerified: number;
  onPlayAgain: () => void;
  onBackToTitle: () => void;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
  open,
  lang,
  tickets,
  csat,
  score,
  bestStreak,
  rebootsOrdered,
  idsVerified,
  onPlayAgain,
  onBackToTitle,
}) => {
  if (!open) return null;
  const t = UI_TEXT[lang];

  const resolvedCount = tickets.filter((x) => x.status === 'resolved').length;
  const droppedCount = tickets.filter((x) => x.status === 'dropped').length;
  const rank = getAgentRank(csat, resolvedCount);

  const funniestNote =
    rebootsOrdered >= 4
      ? lang === 'ar'
        ? `طلبت "اطفي الراوتر ١٠ ثواني" ${rebootsOrdered} مرات — روح موظف خدمة العملاء الحقيقي تلبّستك!`
        : `You ordered a "10-Second Router Reboot" ${rebootsOrdered} times — pure Egyptian ISP muscle memory!`
      : droppedCount === 0 && resolvedCount > 0
      ? lang === 'ar'
        ? 'ولا عميل قفل السكة في وشك! تستاهل بونص شاي بالنعناع من الإدارة.'
        : 'Zero angry hang-ups all shift! Management owes you a fresh glass of mint tea.'
      : lang === 'ar'
      ? `تم التعامل مع ${tickets.length} مكالمة في هذه الوردية. كل نداء وله حكاية في تيلي-مصر!`
      : `Handled ${tickets.length} wild calls this shift. Another normal night at Tele-Masr 111!`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-emerald-400">{t.brandTitle}</div>
            <h2 className="text-2xl font-extrabold">{t.summaryTitle}</h2>
          </div>
          <div className="text-end">
            <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xl tabular-nums">
              <Star className="w-5 h-5 fill-amber-400" />
              <span>{csat.toFixed(1)}</span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5 flex items-center justify-end gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>{rank[lang]}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">{t.summaryScore}</div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-1">{score}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">{t.summaryResolved}</div>
              <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">{resolvedCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">{t.summaryDropped}</div>
              <div className="text-2xl font-extrabold text-rose-600 tabular-nums mt-1">{droppedCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-xs text-slate-500">{t.summaryBestStreak}</div>
              <div className="text-2xl font-extrabold text-blue-700 tabular-nums mt-1">{bestStreak}x</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-slate-600">{t.summaryCalls}</span>
              <span className="font-bold tabular-nums">{tickets.length}</span>
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-slate-600">{t.summaryReboots}</span>
              <span className="font-bold tabular-nums">{rebootsOrdered}</span>
            </div>
            <div className="rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-slate-600">{t.summaryIds}</span>
              <span className="font-bold tabular-nums">{idsVerified}</span>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-medium text-amber-900">
            {funniestNote}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToTitle}
            className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            {t.summaryBackTitle}
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.summaryPlayAgain}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
