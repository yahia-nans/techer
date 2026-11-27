import React from 'react';
import { Language, RouterLightsState, UI_TEXT } from '../data/scenarios';

interface RouterUnitProps {
  lights: RouterLightsState;
  isRebooting: boolean;
  rebootSecondsLeft: number;
  isCheckingLine: boolean;
  lang: Language;
}

export const RouterUnit: React.FC<RouterUnitProps> = ({
  lights,
  isRebooting,
  rebootSecondsLeft,
  isCheckingLine,
  lang,
}) => {
  const t = UI_TEXT[lang];

  const getLedVisual = (state: string) => {
    switch (state) {
      case 'green':
        return { bg: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]', anim: '' };
      case 'blink_green':
        return { bg: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]', anim: 'animate-led-fast' };
      case 'amber':
        return { bg: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]', anim: '' };
      case 'blink_amber':
        return { bg: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]', anim: 'animate-led-slow' };
      case 'red':
        return { bg: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]', anim: '' };
      case 'red_blink':
        return { bg: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)]', anim: 'animate-led-fast' };
      default:
        return { bg: 'bg-slate-700', anim: '' };
    }
  };

  const activeLights: RouterLightsState = isRebooting
    ? rebootSecondsLeft > 7
      ? { power: 'off', dsl: 'off', internet: 'off', los: 'off', wifi: 'off' }
      : rebootSecondsLeft > 4
      ? { power: 'amber', dsl: 'off', internet: 'off', los: 'off', wifi: 'off' }
      : { power: 'green', dsl: 'blink_amber', internet: 'off', los: lights.los, wifi: 'green' }
    : lights;

  const leds = [
    { key: 'power', label: t.ledPower, state: activeLights.power },
    { key: 'dsl', label: t.ledDsl, state: activeLights.dsl },
    { key: 'internet', label: t.ledInternet, state: activeLights.internet },
    { key: 'los', label: t.ledLos, state: activeLights.los },
    { key: 'wifi', label: t.ledWifi, state: activeLights.wifi },
  ];

  const progressPct = isRebooting ? Math.min(100, Math.max(0, ((10 - rebootSecondsLeft) / 10) * 100)) : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-600">{t.routerUnitTitle}</span>
        <span className="text-[11px] font-mono-tabular text-slate-400">HG8245-EG</span>
      </div>

      {/* Router Chassis */}
      <div className="relative pt-4">
        {/* Antennas */}
        <div className="absolute top-0 inset-x-8 flex justify-between pointer-events-none">
          <div className="w-2 h-5 bg-slate-800 rounded-t-sm" />
          <div className="w-2 h-5 bg-slate-800 rounded-t-sm" />
        </div>

        <div className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-3 text-slate-200">
          <div className="grid grid-cols-5 gap-2 text-center">
            {leds.map((led) => {
              const visual = getLedVisual(led.state);
              return (
                <div key={led.key} className="flex flex-col items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${visual.bg} ${visual.anim}`} />
                  <span className="text-[10px] font-mono-tabular tracking-tight text-slate-400">
                    {led.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Mini-State Progress */}
      {isRebooting && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-amber-700">
            <span className="truncate">{t.rebootingBanner}</span>
            <span className="font-mono-tabular shrink-0">{rebootSecondsLeft}s</span>
          </div>
          <div className="h-2 w-full rounded-sm bg-amber-100 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-transform duration-150 origin-left"
              style={{ transform: `scaleX(${progressPct / 100})` }}
            />
          </div>
        </div>
      )}

      {isCheckingLine && !isRebooting && (
        <div className="mt-3 rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-medium text-blue-800">
          {t.checkingLineBanner}
        </div>
      )}
    </div>
  );
};
