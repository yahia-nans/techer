import React, { useState } from 'react';
import { Globe, HelpCircle, Play, Volume2, VolumeX } from 'lucide-react';
import titleDeskBackdrop from '../assets/images/title_desk_backdrop_1795773094756.jpg';
import companyEmblem from '../assets/images/company_emblem_1795773095514.jpg';
import { Language, UI_TEXT } from '../data/scenarios';

export type ShiftMode = 'quick' | 'standard' | 'endless';

interface TitleScreenProps {
  lang: Language;
  onToggleLang: () => void;
  shiftMode: ShiftMode;
  onSelectMode: (mode: ShiftMode) => void;
  onStartShift: () => void;
  muted: boolean;
  onToggleMute: () => void;
  onOpenGuide: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  lang,
  onToggleLang,
  shiftMode,
  onSelectMode,
  onStartShift,
  muted,
  onToggleMute,
  onOpenGuide,
}) => {
  const t = UI_TEXT[lang];
  const [heroLoaded, setHeroLoaded] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(true);

  const modes: { id: ShiftMode; label: string }[] = [
    { id: 'quick', label: t.modeQuick },
    { id: 'standard', label: t.modeStandard },
    { id: 'endless', label: t.modeEndless },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background Key Art with Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        {heroLoaded ? (
          <img
            src={titleDeskBackdrop}
            alt="Cairo telecom support workstation at night"
            referrerPolicy="no-referrer"
            onError={() => setHeroLoaded(false)}
            className="w-full h-full object-cover opacity-35"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/55" />
      </div>

      {/* Top Controls Row */}
      <div className="relative z-10 flex items-center justify-between gap-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-3">
          {logoLoaded ? (
            <img
              src={companyEmblem}
              alt="Tele-Masr 111 Emblem"
              referrerPolicy="no-referrer"
              onError={() => setLogoLoaded(false)}
              className="w-10 h-10 rounded-lg object-cover border border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">
              111
            </div>
          )}
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            {t.brandTitle}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900/90 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.howToPlayBtn}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? t.unmuteBtn : t.muteBtn}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-900/90 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{muted ? t.unmuteBtn : t.muteBtn}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors whitespace-nowrap"
          >
            <Globe className="w-4 h-4" />
            <span>{t.langToggle}</span>
          </button>
        </div>
      </div>

      {/* Main Title Centerpiece */}
      <div className="relative z-10 max-w-6xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          {/* Bespoke SVG Title Lockup */}
          <div className="space-y-3">
            <svg viewBox="0 0 380 42" className="h-9 w-auto" aria-hidden="true">
              <rect x="0" y="6" width="54" height="30" rx="6" fill="#2563EB" />
              <text
                x="27"
                y="26"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="16"
                fontWeight="800"
                fontFamily="monospace"
              >
                111
              </text>
              <path d="M68 21 H92" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <circle cx="102" cy="21" r="4" fill="#10B981" />
              <circle cx="116" cy="21" r="4" fill="#F59E0B" />
              <circle cx="130" cy="21" r="4" fill="#EF4444" />
            </svg>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight [text-wrap:balance]">
              {t.startTitle}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              {t.startSubtitle}
            </p>
          </div>

          {/* Shift Mode Selector */}
          <div className="space-y-2.5 max-w-xl">
            <div className="text-xs font-semibold text-slate-400">{t.selectShiftMode}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              {modes.map((m) => {
                const active = shiftMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMode(m.id)}
                    className={`px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Start CTA */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              type="button"
              onClick={onStartShift}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-base transition-all shadow-lg shadow-emerald-950/40 whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.startShiftCta}</span>
            </button>
          </div>
        </div>

        {/* Desk Preview Card on Desktop */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-2xl">
            {heroLoaded && (
              <img
                src={titleDeskBackdrop}
                alt="Support desk preview"
                referrerPolicy="no-referrer"
                className="w-full h-72 object-cover"
              />
            )}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>{t.brandSubtitle}</span>
              <span className="font-mono-tabular text-emerald-400">111 · LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Single flat control hint line */}
      <div className="relative z-10 max-w-6xl w-full mx-auto text-xs text-slate-400 font-mono-tabular">
        {t.controlsHint}
      </div>
    </div>
  );
};
