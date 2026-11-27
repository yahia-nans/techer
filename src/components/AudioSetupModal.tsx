import React, { useState } from 'react';
import { CheckCircle2, Headphones, Mic, MicOff, Volume2, X, AlertCircle } from 'lucide-react';
import { Language, UI_TEXT } from '../data/scenarios';
import { voiceEngine } from '../audio/voiceEngine';

export type MicPermissionState = 'pending' | 'granted' | 'denied' | 'unsupported';

interface AudioSetupModalProps {
  open: boolean;
  lang: Language;
  micState: MicPermissionState;
  onUpdateMicState: (state: MicPermissionState) => void;
  onComplete: (withAudio: boolean) => void;
  onClose: () => void;
  isPreShift?: boolean;
}

export const AudioSetupModal: React.FC<AudioSetupModalProps> = ({
  open,
  lang,
  micState,
  onUpdateMicState,
  onComplete,
  onClose,
  isPreShift = false,
}) => {
  const [testingSpeaker, setTestingSpeaker] = useState(false);
  const [requestingMic, setRequestingMic] = useState(false);

  if (!open) return null;

  const t = UI_TEXT[lang];
  const ttsSupported = voiceEngine.isTtsSupported();
  const sttSupported = voiceEngine.isSttSupported();
  const activeVoiceName = voiceEngine.getAvailableVoiceSummary(lang);

  const handleTestSpeaker = () => {
    setTestingSpeaker(true);
    voiceEngine.speak(t.testSpeakerPhrase, lang, 'calm', 90, {
      onStart: () => setTestingSpeaker(true),
      onEnd: () => setTestingSpeaker(false),
    });
  };

  const handleRequestMic = async () => {
    if (!sttSupported) {
      onUpdateMicState('unsupported');
      return;
    }
    setRequestingMic(true);
    const res = await voiceEngine.requestMicPermission();
    setRequestingMic(false);
    if (res.granted) {
      onUpdateMicState('granted');
    } else if (res.error === 'unsupported') {
      onUpdateMicState('unsupported');
    } else {
      onUpdateMicState('denied');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="audio-setup-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-extrabold text-base">
            <Headphones className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 id="audio-setup-title">{t.audioModalTitle}</h2>
          </div>
          {!isPreShift && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{t.audioModalDesc}</p>

          {/* Speaker / TTS Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.speakerSectionTitle}</span>
              </div>
              <span
                className={`text-xs font-semibold ${
                  ttsSupported ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {ttsSupported ? t.speakerSupported : t.speakerUnsupported}
              </span>
            </div>

            {activeVoiceName && (
              <div className="text-xs font-mono-tabular text-slate-500 truncate">
                {activeVoiceName}
              </div>
            )}

            {ttsSupported && (
              <button
                type="button"
                onClick={handleTestSpeaker}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span>{testingSpeaker ? t.callerSpeakingLabel : t.testSpeakerBtn}</span>
              </button>
            )}
          </div>

          {/* Microphone / STT Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                {micState === 'granted' ? (
                  <Mic className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>{t.micSectionTitle}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {micState === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.micGranted}</span>
                </span>
              ) : micState === 'denied' ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.micDenied}</span>
                </span>
              ) : !sttSupported || micState === 'unsupported' ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.micUnsupported}</span>
                </span>
              ) : (
                <span className="text-slate-600">{t.micPending}</span>
              )}
            </div>

            {sttSupported && micState !== 'granted' && (
              <button
                type="button"
                disabled={requestingMic}
                onClick={handleRequestMic}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-bold transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t.enableMicBtn}</span>
              </button>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onComplete(false)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            {t.continueTextOnlyBtn}
          </button>

          <button
            type="button"
            onClick={() => onComplete(true)}
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
          >
            {isPreShift ? t.continueWithAudioBtn : t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
