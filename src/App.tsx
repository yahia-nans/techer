import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  Headphones,
  HelpCircle,
  History,
  IdCard,
  Mic,
  MicOff,
  Pause,
  PhoneCall,
  PhoneForwarded,
  PhoneOff,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Smile,
  Star,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';
import { soundEngine } from './audio/soundEngine';
import { voiceEngine } from './audio/voiceEngine';
import { AudioSetupModal, MicPermissionState } from './components/AudioSetupModal';
import { CallerAvatar } from './components/CallerAvatar';
import { HowToPlayModal } from './components/HowToPlayModal';
import { RouterUnit } from './components/RouterUnit';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { TicketHistoryDrawer } from './components/TicketHistoryDrawer';
import { ShiftMode, TitleScreen } from './components/TitleScreen';
import {
  ActionId,
  ACTIONS,
  BilingualText,
  CallerMood,
  CallerScenario,
  LINE_STATUS_LABELS,
  Language,
  MOOD_LABELS,
  RouterLightsState,
  SCENARIOS,
  UI_TEXT,
} from './data/scenarios';
import { parseSpeechIntent } from './nlp/intentParser';
import { GameState, TicketRecord, TranscriptMessage } from './types/game';

function shuffleScenarios(list: CallerScenario[], avoidId?: string): CallerScenario[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (avoidId && arr.length > 1 && arr[0].id === avoidId) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

function formatClock(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [shiftMode, setShiftMode] = useState<ShiftMode>('standard');
  const [muted, setMuted] = useState(false);

  // Audio / Voice Setup State
  const [audioSetupOpen, setAudioSetupOpen] = useState(false);
  const [pendingStartShift, setPendingStartShift] = useState(false);
  const [hasCompletedAudioSetup, setHasCompletedAudioSetup] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micState, setMicState] = useState<MicPermissionState>(() =>
    voiceEngine.isSttSupported() ? 'pending' : 'unsupported'
  );
  const [isCallerSpeaking, setIsCallerSpeaking] = useState(false);
  const [lastCallerLine, setLastCallerLine] = useState<BilingualText | null>(null);

  // Mic / Speech Recognition Live State
  const [isListening, setIsListening] = useState(false);
  const [continuousMic, setContinuousMic] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalHeardText, setFinalHeardText] = useState('');
  const [recognizedIntents, setRecognizedIntents] = useState<ActionId[]>([]);
  const [unrecognizedHint, setUnrecognizedHint] = useState(false);
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');

  const [guideOpen, setGuideOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Shift Metrics
  const [shiftTime, setShiftTime] = useState<number>(150);
  const [score, setScore] = useState<number>(0);
  const [csat, setCsat] = useState<number>(4.6);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [rebootsOrdered, setRebootsOrdered] = useState<number>(0);
  const [idsVerified, setIdsVerified] = useState<number>(0);

  // Scenario Queue & Active Call State
  const [queue, setQueue] = useState<CallerScenario[]>(() => shuffleScenarios(SCENARIOS));
  const [currentScenario, setCurrentScenario] = useState<CallerScenario>(SCENARIOS[0]);
  const [patience, setPatience] = useState<number>(80);
  const [mood, setMood] = useState<CallerMood>('impatient');
  const [lights, setLights] = useState<RouterLightsState>(SCENARIOS[0].initialLights);
  const [idRevealed, setIdRevealed] = useState<boolean>(false);
  const [lineChecked, setLineChecked] = useState<boolean>(false);
  const [deescalateCount, setDeescalateCount] = useState<number>(0);
  const [callElapsedSec, setCallElapsedSec] = useState<number>(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [callOutcome, setCallOutcome] = useState<'active' | 'resolved' | 'dropped'>('active');
  const [outcomePoints, setOutcomePoints] = useState<number>(0);
  const [outcomeCsatDelta, setOutcomeCsatDelta] = useState<number>(0);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // Mini-animation states
  const [isRebooting, setIsRebooting] = useState<boolean>(false);
  const [rebootSecondsLeft, setRebootSecondsLeft] = useState<number>(10);
  const [isCheckingLine, setIsCheckingLine] = useState<boolean>(false);

  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const rebootTimerRef = useRef<number | null>(null);
  const lineTimerRef = useRef<number | null>(null);
  const speakDelayRef = useRef<number | null>(null);
  const spaceHoldActiveRef = useRef<boolean>(false);
  const micPressTimeRef = useRef<number>(0);
  const continuousMicRef = useRef<boolean>(false);

  useEffect(() => {
    continuousMicRef.current = continuousMic;
  }, [continuousMic]);

  const t = UI_TEXT[lang];

  // Sync HTML dir & lang
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [transcript, callOutcome]);

  const clearActionTimers = useCallback(() => {
    if (rebootTimerRef.current) {
      window.clearInterval(rebootTimerRef.current);
      rebootTimerRef.current = null;
    }
    if (lineTimerRef.current) {
      window.clearTimeout(lineTimerRef.current);
      lineTimerRef.current = null;
    }
    if (speakDelayRef.current) {
      window.clearTimeout(speakDelayRef.current);
      speakDelayRef.current = null;
    }
    setIsRebooting(false);
    setIsCheckingLine(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearActionTimers();
      voiceEngine.stopSpeaking();
      voiceEngine.stopListening();
    };
  }, [clearActionTimers]);

  const speakCallerLine = useCallback(
    (line: BilingualText, callerMood: CallerMood, callerPatience: number, delayMs = 0) => {
      setLastCallerLine(line);
      if (!voiceEnabled || muted || !voiceEngine.isTtsSupported()) {
        return;
      }

      if (speakDelayRef.current) {
        window.clearTimeout(speakDelayRef.current);
      }

      const runSpeak = () => {
        // Pause continuous listening briefly while TTS plays so speaker audio doesn't loop into mic
        const shouldResumeMic = continuousMicRef.current && voiceEngine.isListening();
        if (shouldResumeMic) {
          voiceEngine.stopListening();
        }

        voiceEngine.speak(line[lang], lang, callerMood, callerPatience, {
          onStart: () => setIsCallerSpeaking(true),
          onEnd: () => {
            setIsCallerSpeaking(false);
            if (shouldResumeMic && continuousMicRef.current) {
              startMicRef.current?.(true);
            }
          },
        });
      };

      if (delayMs > 0) {
        speakDelayRef.current = window.setTimeout(runSpeak, delayMs);
      } else {
        runSpeak();
      }
    },
    [lang, muted, voiceEnabled]
  );

  const toggleLanguage = useCallback(() => {
    soundEngine.playClick();
    voiceEngine.stopSpeaking();
    setIsCallerSpeaking(false);
    const wasListening = voiceEngine.isListening();
    if (wasListening) {
      voiceEngine.stopListening();
    }
    setLang((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      if (wasListening && continuousMicRef.current) {
        window.setTimeout(() => {
          startMicRef.current?.(true, next);
        }, 120);
      }
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (next) {
        voiceEngine.stopSpeaking();
        setIsCallerSpeaking(false);
      } else {
        soundEngine.playClick();
      }
      return next;
    });
  }, []);

  const toggleVoiceOutput = useCallback(() => {
    soundEngine.playClick();
    setVoiceEnabled((prev) => {
      const next = !prev;
      if (!next) {
        voiceEngine.stopSpeaking();
        setIsCallerSpeaking(false);
      }
      return next;
    });
  }, []);

  const loadCaller = useCallback(
    (scenario: CallerScenario) => {
      clearActionTimers();
      voiceEngine.stopSpeaking();
      setIsCallerSpeaking(false);
      setCurrentScenario(scenario);
      setPatience(scenario.initialPatience);
      setMood(scenario.initialMood);
      setLights(scenario.initialLights);
      setIdRevealed(false);
      setLineChecked(false);
      setDeescalateCount(0);
      setCallElapsedSec(0);
      setCallOutcome('active');
      setOutcomePoints(0);
      setOutcomeCsatDelta(0);
      setShakeCard(false);
      setInterimTranscript('');
      setFinalHeardText('');
      setRecognizedIntents([]);
      setUnrecognizedHint(false);
      setTranscript([
        {
          id: `open-${Date.now()}`,
          sender: 'caller',
          text: scenario.openingLine,
          timestamp: '00:00',
        },
      ]);
      soundEngine.playIncomingRing();
      speakCallerLine(scenario.openingLine, scenario.initialMood, scenario.initialPatience, 280);
    },
    [clearActionTimers, speakCallerLine]
  );

  const launchNewShift = useCallback(() => {
    soundEngine.playClick();
    const shuffled = shuffleScenarios(SCENARIOS);
    const initialDuration = shiftMode === 'quick' ? 90 : shiftMode === 'standard' ? 150 : 0;
    setShiftTime(initialDuration);
    setScore(0);
    setCsat(4.6);
    setStreak(0);
    setBestStreak(0);
    setTickets([]);
    setRebootsOrdered(0);
    setIdsVerified(0);
    setHistoryOpen(false);
    setGuideOpen(false);
    setQueue(shuffled.slice(1));
    setGameState('PLAYING');
    loadCaller(shuffled[0]);
  }, [loadCaller, shiftMode]);

  const handleRequestStartShift = useCallback(() => {
    soundEngine.playClick();
    if (!hasCompletedAudioSetup) {
      setPendingStartShift(true);
      setAudioSetupOpen(true);
    } else {
      launchNewShift();
    }
  }, [hasCompletedAudioSetup, launchNewShift]);

  const appendMessage = useCallback(
    (sender: TranscriptMessage['sender'], text: BilingualText, elapsed: number) => {
      setTranscript((prev) => [
        ...prev,
        {
          id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender,
          text,
          timestamp: formatClock(elapsed),
        },
      ]);
    },
    []
  );

  const finalizeCall = useCallback(
    (
      status: 'resolved' | 'dropped',
      scenario: CallerScenario,
      elapsedSec: number,
      currentPatience: number,
      usedId: boolean,
      usedLine: boolean,
      fixedLights?: RouterLightsState
    ) => {
      clearActionTimers();
      setCallOutcome(status);

      if (status === 'resolved') {
        soundEngine.playSuccessChime();
        setMood('calm');
        if (fixedLights) setLights(fixedLights);

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));

        const basePts = 150;
        const patienceBonus = Math.round(currentPatience * 0.8);
        const diagBonus = (usedId ? 25 : 0) + (usedLine ? 25 : 0);
        const streakBonus = (nextStreak - 1) * 35;
        const totalEarned = basePts + patienceBonus + diagBonus + streakBonus;

        const csatGain = currentPatience >= 60 ? 0.2 : 0.1;
        setOutcomePoints(totalEarned);
        setOutcomeCsatDelta(csatGain);
        setScore((prev) => prev + totalEarned);
        setCsat((prev) => Math.min(5.0, Math.round((prev + csatGain) * 10) / 10));

        setTickets((prev) => [
          {
            id: `t-${Date.now()}`,
            scenario,
            status: 'resolved',
            pointsEarned: totalEarned,
            csatDelta: csatGain,
            summary: scenario.victoryLogSummary,
            timeTakenSec: Math.round(elapsedSec),
          },
          ...prev,
        ]);
      } else {
        soundEngine.playHangupAlert();
        setMood('furious');
        setShakeCard(true);
        window.setTimeout(() => setShakeCard(false), 380);
        setStreak(0);

        const penalty = -50;
        const csatDrop = -0.4;
        setOutcomePoints(penalty);
        setOutcomeCsatDelta(csatDrop);
        setScore((prev) => Math.max(0, prev + penalty));
        setCsat((prev) => Math.max(1.0, Math.round((prev + csatDrop) * 10) / 10));

        appendMessage('caller', scenario.hangupLine, elapsedSec);
        speakCallerLine(scenario.hangupLine, 'furious', 0, 260);

        setTickets((prev) => [
          {
            id: `t-${Date.now()}`,
            scenario,
            status: 'dropped',
            pointsEarned: penalty,
            csatDelta: csatDrop,
            summary: {
              en: `Caller hung up before issue was resolved (${LINE_STATUS_LABELS[scenario.lineStatus].en}).`,
              ar: `أغلق العميل الخط قبل حل المشكلة (${LINE_STATUS_LABELS[scenario.lineStatus].ar}).`,
            },
            timeTakenSec: Math.round(elapsedSec),
          },
          ...prev,
        ]);
      }
    },
    [appendMessage, clearActionTimers, speakCallerLine, streak]
  );

  // Main Simulation Tick (200ms)
  useEffect(() => {
    if (gameState !== 'PLAYING' || guideOpen || historyOpen || audioSetupOpen) return;

    const interval = window.setInterval(() => {
      const dt = 0.2;

      setShiftTime((prev) => {
        if (shiftMode === 'endless') {
          return prev + dt;
        }
        return Math.max(0, prev - dt);
      });

      if (callOutcome === 'active') {
        setCallElapsedSec((prev) => prev + dt);

        if (!isRebooting && !isCheckingLine) {
          setPatience((prev) => {
            const moodMultiplier = mood === 'furious' ? 1.25 : mood === 'calm' ? 0.75 : 1.0;
            return Math.max(0, prev - currentScenario.decayPerSec * moodMultiplier * dt);
          });
        }
      }
    }, 200);

    return () => window.clearInterval(interval);
  }, [
    audioSetupOpen,
    callOutcome,
    currentScenario.decayPerSec,
    gameState,
    guideOpen,
    historyOpen,
    isCheckingLine,
    isRebooting,
    mood,
    shiftMode,
  ]);

  // Trigger shift summary cleanly when timed shift hits 0
  useEffect(() => {
    if (gameState === 'PLAYING' && shiftMode !== 'endless' && shiftTime <= 0) {
      clearActionTimers();
      voiceEngine.stopSpeaking();
      voiceEngine.stopListening();
      setContinuousMic(false);
      setIsCallerSpeaking(false);
      setGameState('SHIFT_SUMMARY');
    }
  }, [clearActionTimers, gameState, shiftMode, shiftTime]);

  // Trigger hangup cleanly once patience reaches 0
  useEffect(() => {
    if (gameState === 'PLAYING' && callOutcome === 'active' && patience <= 0) {
      finalizeCall('dropped', currentScenario, callElapsedSec, 0, idRevealed, lineChecked);
    }
  }, [
    callElapsedSec,
    callOutcome,
    currentScenario,
    finalizeCall,
    gameState,
    idRevealed,
    lineChecked,
    patience,
  ]);

  const handleNextCall = useCallback(() => {
    soundEngine.playClick();
    let nextQueue = [...queue];
    if (nextQueue.length === 0) {
      nextQueue = shuffleScenarios(SCENARIOS, currentScenario.id);
    }
    const [nextCaller, ...rest] = nextQueue;
    setQueue(rest);
    loadCaller(nextCaller);
  }, [currentScenario.id, loadCaller, queue]);

  const applyPatienceDelta = useCallback((delta: number, nextMood?: CallerMood) => {
    if (nextMood) setMood(nextMood);
    setPatience((prev) => Math.min(100, Math.max(0, prev + delta)));
  }, []);

  const executeAction = useCallback(
    (
      actionId: ActionId,
      options?: {
        customAgentText?: BilingualText;
        skipAgentBubble?: boolean;
        preCalmed?: boolean;
      }
    ) => {
      if (gameState !== 'PLAYING' || callOutcome !== 'active' || isRebooting || isCheckingLine) {
        return;
      }

      const actionDef = ACTIONS.find((a) => a.id === actionId);
      if (!actionDef) return;

      if (!options?.skipAgentBubble) {
        appendMessage('agent', options?.customAgentText ?? actionDef.agentLine, callElapsedSec);
      }

      switch (actionId) {
        case 'ask_id': {
          soundEngine.playClick();
          const effectivelyCalmed = options?.preCalmed || deescalateCount > 0;
          if (currentScenario.refusesIdInitially && !effectivelyCalmed && !idRevealed) {
            soundEngine.playWarning();
            const reply = currentScenario.idRefusalLine ?? currentScenario.idResponse;
            appendMessage('caller', reply, callElapsedSec);
            speakCallerLine(reply, 'furious', Math.max(0, patience - 8), 80);
            applyPatienceDelta(-8, 'furious');
            return;
          }
          if (!idRevealed) {
            setIdRevealed(true);
            setIdsVerified((n) => n + 1);
            setScore((s) => s + 25);
          }
          appendMessage('caller', currentScenario.idResponse, callElapsedSec);
          speakCallerLine(currentScenario.idResponse, mood, patience, 80);
          break;
        }

        case 'deescalate': {
          soundEngine.playDeescalate();
          const gain = deescalateCount === 0 ? 22 : deescalateCount === 1 ? 8 : 0;
          setDeescalateCount((c) => c + 1);
          if (deescalateCount === 0) setScore((s) => s + 30);
          appendMessage('caller', currentScenario.deescalateLine, callElapsedSec);
          const nextPatience = Math.min(100, patience + gain);
          applyPatienceDelta(gain, 'calm');
          speakCallerLine(currentScenario.deescalateLine, 'calm', nextPatience, 80);
          break;
        }

        case 'check_line': {
          soundEngine.playDiagnosticBeep();
          setIsCheckingLine(true);
          lineTimerRef.current = window.setTimeout(() => {
            setIsCheckingLine(false);
            setLineChecked(true);
            setScore((s) => (lineChecked ? s : s + 25));
            appendMessage('system', currentScenario.lineCheckSummary, callElapsedSec);
          }, 1100);
          break;
        }

        case 'restart_router': {
          soundEngine.playClick();
          setRebootsOrdered((r) => r + 1);
          setIsRebooting(true);
          setRebootSecondsLeft(10);

          let remaining = 10;
          rebootTimerRef.current = window.setInterval(() => {
            remaining -= 1;
            soundEngine.playRebootTick(remaining);
            setRebootSecondsLeft(remaining);

            if (remaining <= 0) {
              if (rebootTimerRef.current) {
                window.clearInterval(rebootTimerRef.current);
                rebootTimerRef.current = null;
              }
              setIsRebooting(false);
              soundEngine.playRebootComplete();

              const succeeds =
                currentScenario.trueCause === 'restart_router' ||
                currentScenario.alsoAccepts?.includes('restart_router');

              if (succeeds) {
                const reply =
                  currentScenario.restartSuccessLine ?? currentScenario.politeCloseReadyLine;
                appendMessage('caller', reply, callElapsedSec);
                speakCallerLine(reply, 'calm', patience, 120);
                finalizeCall(
                  'resolved',
                  currentScenario,
                  callElapsedSec,
                  patience,
                  idRevealed,
                  lineChecked,
                  currentScenario.fixedLights
                );
              } else {
                soundEngine.playWarning();
                appendMessage('caller', currentScenario.restartFailLine, callElapsedSec);
                const penalty = currentScenario.alreadyRestartedBeforeCall
                  ? -24
                  : currentScenario.lineStatus === 'red_los'
                  ? -16
                  : -10;
                const nextPatience = Math.max(0, patience + penalty);
                applyPatienceDelta(penalty, 'furious');
                if (nextPatience > 0) {
                  speakCallerLine(currentScenario.restartFailLine, 'furious', nextPatience, 120);
                }
              }
            }
          }, 300);
          break;
        }

        case 'reset_port': {
          soundEngine.playDiagnosticBeep();
          const succeeds =
            currentScenario.trueCause === 'reset_port' ||
            currentScenario.alsoAccepts?.includes('reset_port');

          appendMessage('caller', currentScenario.portResetLine, callElapsedSec);
          if (succeeds) {
            speakCallerLine(currentScenario.portResetLine, 'calm', patience, 80);
            finalizeCall(
              'resolved',
              currentScenario,
              callElapsedSec,
              patience,
              idRevealed,
              lineChecked,
              currentScenario.fixedLights
            );
          } else {
            soundEngine.playWarning();
            const nextPatience = Math.max(0, patience - 14);
            applyPatienceDelta(-14, 'impatient');
            if (nextPatience > 0) {
              speakCallerLine(currentScenario.portResetLine, 'impatient', nextPatience, 80);
            }
          }
          break;
        }

        case 'explain_billing': {
          soundEngine.playClick();
          const succeeds =
            currentScenario.trueCause === 'explain_billing' ||
            currentScenario.alsoAccepts?.includes('explain_billing');

          appendMessage('caller', currentScenario.billingExplainLine, callElapsedSec);
          if (succeeds) {
            speakCallerLine(currentScenario.billingExplainLine, 'calm', patience, 80);
            finalizeCall(
              'resolved',
              currentScenario,
              callElapsedSec,
              patience,
              idRevealed,
              lineChecked,
              currentScenario.fixedLights
            );
          } else {
            soundEngine.playWarning();
            const nextPatience = Math.max(0, patience - 16);
            applyPatienceDelta(-16, 'furious');
            if (nextPatience > 0) {
              speakCallerLine(currentScenario.billingExplainLine, 'furious', nextPatience, 80);
            }
          }
          break;
        }

        case 'dispatch_tech': {
          soundEngine.playClick();
          const succeeds =
            currentScenario.trueCause === 'dispatch_tech' ||
            currentScenario.alsoAccepts?.includes('dispatch_tech');

          appendMessage('caller', currentScenario.dispatchTechLine, callElapsedSec);
          if (succeeds) {
            speakCallerLine(currentScenario.dispatchTechLine, 'calm', patience, 80);
            finalizeCall(
              'resolved',
              currentScenario,
              callElapsedSec,
              patience,
              idRevealed,
              lineChecked,
              currentScenario.fixedLights
            );
          } else {
            soundEngine.playWarning();
            const nextPatience = Math.max(0, patience - 18);
            applyPatienceDelta(-18, 'furious');
            if (nextPatience > 0) {
              speakCallerLine(currentScenario.dispatchTechLine, 'furious', nextPatience, 80);
            }
          }
          break;
        }

        case 'polite_close': {
          soundEngine.playClick();
          const canClose =
            currentScenario.trueCause === 'polite_close' && (lineChecked || idRevealed);

          if (canClose) {
            appendMessage('caller', currentScenario.politeCloseReadyLine, callElapsedSec);
            speakCallerLine(currentScenario.politeCloseReadyLine, 'calm', patience, 80);
            finalizeCall(
              'resolved',
              currentScenario,
              callElapsedSec,
              patience,
              idRevealed,
              lineChecked,
              currentScenario.fixedLights
            );
          } else {
            soundEngine.playWarning();
            appendMessage('caller', currentScenario.politeClosePrematureLine, callElapsedSec);
            const nextPatience = Math.max(0, patience - 18);
            applyPatienceDelta(-18, 'furious');
            if (nextPatience > 0) {
              speakCallerLine(currentScenario.politeClosePrematureLine, 'furious', nextPatience, 80);
            }
          }
          break;
        }
      }
    },
    [
      appendMessage,
      applyPatienceDelta,
      callElapsedSec,
      callOutcome,
      currentScenario,
      deescalateCount,
      finalizeCall,
      gameState,
      idRevealed,
      isCheckingLine,
      isRebooting,
      lineChecked,
      mood,
      patience,
      speakCallerLine,
    ]
  );

  // Process spoken or typed agent text with Egyptian colloquial & English intent parser
  const processSpokenOrTyped = useCallback(
    (rawText: string) => {
      const cleaned = rawText.trim();
      if (!cleaned || gameState !== 'PLAYING' || callOutcome !== 'active') return;
      if (isRebooting || isCheckingLine) return;

      const parsed = parseSpeechIntent(cleaned, lang);
      setFinalHeardText(cleaned);
      setInterimTranscript('');

      if (parsed.intents.length === 0) {
        setRecognizedIntents([]);
        setUnrecognizedHint(true);
        return;
      }

      setUnrecognizedHint(false);
      setRecognizedIntents(parsed.intents);

      // Show the player's actual spoken/typed message in transcript
      const agentMessage: BilingualText = {
        en: cleaned,
        ar: cleaned,
      };
      appendMessage('agent', agentMessage, callElapsedSec);

      // Compound intent handling: if deescalate + another technical intent are both spoken,
      // apply calm empathy first, then execute the technical action!
      const hasDeescalate = parsed.intents.includes('deescalate');
      const technicalIntents = parsed.intents.filter((id) => id !== 'deescalate');

      if (hasDeescalate && technicalIntents.length > 0) {
        const gain = deescalateCount === 0 ? 22 : deescalateCount === 1 ? 8 : 0;
        setDeescalateCount((c) => c + 1);
        if (deescalateCount === 0) setScore((s) => s + 30);
        applyPatienceDelta(gain, 'calm');
        soundEngine.playDeescalate();

        executeAction(technicalIntents[0], {
          skipAgentBubble: true,
          preCalmed: true,
        });
      } else {
        executeAction(parsed.intents[0], { skipAgentBubble: true });
      }
    },
    [
      appendMessage,
      applyPatienceDelta,
      callElapsedSec,
      callOutcome,
      deescalateCount,
      executeAction,
      gameState,
      isCheckingLine,
      isRebooting,
      lang,
    ]
  );

  const processSpeechRef = useRef(processSpokenOrTyped);
  useEffect(() => {
    processSpeechRef.current = processSpokenOrTyped;
  }, [processSpokenOrTyped]);

  const startMic = useCallback(
    (continuousMode: boolean, overrideLang?: Language) => {
      setMicErrorMsg(null);
      setInterimTranscript('');
      const targetLang = overrideLang ?? lang;

      if (!voiceEngine.isSttSupported()) {
        setMicState('unsupported');
        setMicErrorMsg(UI_TEXT[targetLang].micErrorUnsupported);
        setContinuousMic(false);
        return;
      }

      // Stop TTS while user speaks
      voiceEngine.stopSpeaking();
      setIsCallerSpeaking(false);

      soundEngine.playClick();
      voiceEngine.startListening(targetLang, continuousMode, {
        onInterim: (text) => {
          setInterimTranscript(text);
        },
        onFinal: (text) => {
          setInterimTranscript('');
          processSpeechRef.current(text);
        },
        onError: (code) => {
          setContinuousMic(false);
          if (code === 'not-allowed' || code === 'service-not-allowed') {
            setMicState('denied');
            setMicErrorMsg(UI_TEXT[targetLang].micErrorNotAllowed);
          } else if (code === 'unsupported') {
            setMicState('unsupported');
            setMicErrorMsg(UI_TEXT[targetLang].micErrorUnsupported);
          } else {
            setMicErrorMsg(UI_TEXT[targetLang].micErrorGeneric);
          }
        },
        onListeningChange: (listening) => {
          setIsListening(listening);
          if (listening) {
            setMicState('granted');
          }
        },
      });
    },
    [lang]
  );

  const startMicRef = useRef<((c: boolean, l?: Language) => void) | null>(null);
  useEffect(() => {
    startMicRef.current = startMic;
  }, [startMic]);

  const stopMic = useCallback(() => {
    voiceEngine.stopListening();
    setIsListening(false);
    setContinuousMic(false);
  }, []);

  const handleToggleContinuousMic = useCallback(() => {
    if (continuousMic || isListening) {
      stopMic();
    } else {
      setContinuousMic(true);
      startMic(true);
    }
  }, [continuousMic, isListening, startMic, stopMic]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const msg = textInput;
    setTextInput('');
    processSpokenOrTyped(msg);
  };

  // Global keyboard shortcuts (including Hold Spacebar for Push-to-Talk!)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (gameState === 'TITLE_MENU') {
        if (e.key === 'Enter' && !audioSetupOpen && !guideOpen) {
          e.preventDefault();
          handleRequestStartShift();
        } else if (e.key.toLowerCase() === 'l') {
          toggleLanguage();
        }
        return;
      }

      if (e.key.toLowerCase() === 'l') {
        toggleLanguage();
        return;
      }

      if (gameState === 'PLAYING' || gameState === 'PAUSED') {
        if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
          e.preventDefault();
          if (audioSetupOpen) {
            setAudioSetupOpen(false);
          } else if (guideOpen) {
            setGuideOpen(false);
          } else if (historyOpen) {
            setHistoryOpen(false);
          } else {
            setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
          }
          return;
        }

        if (gameState === 'PLAYING' && !guideOpen && !historyOpen && !audioSetupOpen) {
          // Hold Spacebar for Push-to-Talk
          if (e.code === 'Space' && !e.repeat && callOutcome === 'active') {
            e.preventDefault();
            if (!spaceHoldActiveRef.current) {
              spaceHoldActiveRef.current = true;
              setContinuousMic(false);
              startMic(true);
            }
            return;
          }

          if (e.key.toLowerCase() === 'n' && callOutcome !== 'active') {
            e.preventDefault();
            handleNextCall();
            return;
          }

          const idx = ['1', '2', '3', '4', '5', '6', '7', '8'].indexOf(e.key);
          if (idx !== -1 && ACTIONS[idx]) {
            e.preventDefault();
            executeAction(ACTIONS[idx].id);
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && spaceHoldActiveRef.current) {
        spaceHoldActiveRef.current = false;
        voiceEngine.stopListening();
        setIsListening(false);
      }
    };

    const onBlur = () => {
      if (spaceHoldActiveRef.current) {
        spaceHoldActiveRef.current = false;
        voiceEngine.stopListening();
        setIsListening(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    audioSetupOpen,
    callOutcome,
    executeAction,
    gameState,
    guideOpen,
    handleNextCall,
    handleRequestStartShift,
    historyOpen,
    startMic,
    toggleLanguage,
  ]);

  const resolvedCount = useMemo(
    () => tickets.filter((x) => x.status === 'resolved').length,
    [tickets]
  );
  const droppedCount = useMemo(
    () => tickets.filter((x) => x.status === 'dropped').length,
    [tickets]
  );

  const actionIcon = (id: ActionId) => {
    switch (id) {
      case 'ask_id':
        return <IdCard className="w-4 h-4 shrink-0" />;
      case 'restart_router':
        return <RefreshCw className="w-4 h-4 shrink-0" />;
      case 'check_line':
        return <Activity className="w-4 h-4 shrink-0" />;
      case 'deescalate':
        return <Smile className="w-4 h-4 shrink-0" />;
      case 'reset_port':
        return <Wrench className="w-4 h-4 shrink-0" />;
      case 'explain_billing':
        return <CreditCard className="w-4 h-4 shrink-0" />;
      case 'dispatch_tech':
        return <PhoneForwarded className="w-4 h-4 shrink-0" />;
      case 'polite_close':
        return <ShieldCheck className="w-4 h-4 shrink-0" />;
    }
  };

  if (gameState === 'TITLE_MENU') {
    return (
      <>
        <TitleScreen
          lang={lang}
          onToggleLang={toggleLanguage}
          shiftMode={shiftMode}
          onSelectMode={(m) => {
            soundEngine.playClick();
            setShiftMode(m);
          }}
          onStartShift={handleRequestStartShift}
          muted={muted}
          onToggleMute={toggleMute}
          onOpenGuide={() => {
            soundEngine.playClick();
            setGuideOpen(true);
          }}
        />
        <HowToPlayModal open={guideOpen} onClose={() => setGuideOpen(false)} lang={lang} />
        <AudioSetupModal
          open={audioSetupOpen}
          lang={lang}
          micState={micState}
          onUpdateMicState={setMicState}
          isPreShift={pendingStartShift}
          onClose={() => {
            setAudioSetupOpen(false);
            setPendingStartShift(false);
          }}
          onComplete={(withAudio) => {
            setHasCompletedAudioSetup(true);
            setVoiceEnabled(withAudio);
            setAudioSetupOpen(false);
            if (pendingStartShift) {
              setPendingStartShift(false);
              launchNewShift();
            }
          }}
        />
      </>
    );
  }

  const patienceColor =
    patience > 55 ? 'bg-emerald-600' : patience > 28 ? 'bg-amber-500' : 'bg-rose-600';
  const patienceTextColor =
    patience > 55 ? 'text-emerald-700' : patience > 28 ? 'text-amber-700' : 'text-rose-700';

  const moodTone =
    mood === 'calm'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : mood === 'confused'
      ? 'text-blue-700 bg-blue-50 border-blue-200'
      : mood === 'impatient'
      ? 'text-amber-800 bg-amber-50 border-amber-200'
      : mood === 'sarcastic'
      ? 'text-slate-700 bg-slate-100 border-slate-300'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  const diagActions = ACTIONS.filter((a) => a.group === 'diagnostic');
  const resActions = ACTIONS.filter((a) => a.group === 'resolution');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Top Game HUD Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-2.5">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand + Live Shift Metrics */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono-tabular font-bold text-xs">
                111
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-extrabold text-slate-900 leading-none">
                  {t.brandTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t.brandSubtitle}</div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500 hidden lg:inline">{t.shiftTimer}</span>
                <span
                  className={`font-mono-tabular font-bold ${
                    shiftMode !== 'endless' && shiftTime <= 20 ? 'text-rose-600' : 'text-slate-900'
                  }`}
                >
                  {formatClock(shiftTime)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-slate-500 hidden lg:inline">{t.csatLabel}</span>
                <span className="font-mono-tabular font-bold text-slate-900">
                  {csat.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-mono-tabular font-bold text-slate-900">{score}</span>
                <span className="text-slate-500 hidden sm:inline">{t.scoreLabel}</span>
                {streak >= 2 && (
                  <span className="font-mono-tabular font-bold text-blue-700">· {streak}x</span>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 tabular-nums">
                <span>
                  {resolvedCount} {t.resolvedLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {droppedCount} {t.droppedLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right HUD Controls */}
          <div className="flex items-center gap-2">
            {shiftMode === 'endless' && (
              <button
                type="button"
                onClick={() => {
                  clearActionTimers();
                  voiceEngine.stopSpeaking();
                  stopMic();
                  setGameState('SHIFT_SUMMARY');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {t.endShiftNowBtn}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setPendingStartShift(false);
                setAudioSetupOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">{t.audioSetupBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setGameState((s) => (s === 'PLAYING' ? 'PAUSED' : 'PLAYING'));
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {gameState === 'PAUSED' ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {gameState === 'PAUSED' ? t.resumeBtn : t.pauseBtn}
              </span>
            </button>

            <button
              type="button"
              onClick={launchNewShift}
              title={t.restartShiftBtn}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t.restartShiftBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setHistoryOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.historyBtn}</span>
              <span className="font-mono-tabular text-slate-500">({tickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setGuideOpen(true);
              }}
              aria-label={t.howToPlayBtn}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? t.unmuteBtn : t.muteBtn}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.langToggle}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 3-Column Support Desk */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Column 1: Caller Card, Router Hardware & Telemetry */}
        <section className="lg:col-span-4 space-y-4">
          <div
            className={`rounded-xl border border-slate-200 bg-white p-4 space-y-4 ${
              shakeCard ? 'animate-shake' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CallerAvatar
                  style={currentScenario.avatar}
                  mood={mood}
                  accentColor={currentScenario.accentColor}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.incomingCallLabel}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 truncate">
                    {currentScenario.name[lang]}
                  </h2>
                  <p className="text-xs text-slate-500 truncate">{currentScenario.role[lang]}</p>
                </div>
              </div>

              <div
                className={`shrink-0 px-2.5 py-1 rounded-md border text-xs font-semibold ${moodTone}`}
              >
                {MOOD_LABELS[mood][lang]}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">{t.patienceLabel}</span>
                <span className={`font-mono-tabular ${patienceTextColor}`}>
                  {Math.round(patience)}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-sm bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-150 ${patienceColor}`}
                  style={{ width: `${Math.max(0, Math.min(100, patience))}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">{t.lineStatusLabel}</span>
              <span className="font-semibold text-slate-800 text-end">
                {LINE_STATUS_LABELS[currentScenario.lineStatus][lang]}
              </span>
            </div>
          </div>

          <RouterUnit
            lights={lights}
            isRebooting={isRebooting}
            rebootSecondsLeft={rebootSecondsLeft}
            isCheckingLine={isCheckingLine}
            lang={lang}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-700">{t.accountSnapshotTitle}</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">{t.nationalIdLabel}</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {idRevealed ? currentScenario.nationalId : t.unverifiedText}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">{t.packageLabel}</span>
                <span className="font-semibold text-slate-800">
                  {idRevealed ? currentScenario.packageTier[lang] : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">{t.billingLabel}</span>
                <span
                  className={`font-semibold ${
                    idRevealed && currentScenario.lineStatus === 'billing_hold'
                      ? 'text-rose-700'
                      : 'text-slate-800'
                  }`}
                >
                  {idRevealed ? currentScenario.billingStatus[lang] : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">{t.quotaLabel}</span>
                <span
                  className={`font-semibold ${
                    idRevealed && currentScenario.lineStatus === 'quota_exhausted'
                      ? 'text-amber-700'
                      : 'text-slate-800'
                  }`}
                >
                  {idRevealed ? currentScenario.quotaText[lang] : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-100">
                <span className="text-slate-500">{t.attenuationLabel}</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {lineChecked ? currentScenario.attenuationDb : t.notScannedText}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-slate-500">{t.snrLabel}</span>
                <span className="font-mono-tabular font-semibold text-slate-900">
                  {lineChecked ? currentScenario.snrDb : t.notScannedText}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Column 2: Headset Status + Live Transcript + Voice & Text Input Console */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          {/* Headset & Speaker Bar + Transcript */}
          <div className="rounded-xl border border-slate-200 bg-white flex flex-col h-[400px] lg:h-[440px] overflow-hidden">
            {/* Headset / Speaker Audio Output Bar */}
            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-end gap-0.5 h-4 shrink-0" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className={`w-1 rounded-sm ${
                        isCallerSpeaking
                          ? 'bg-emerald-400 animate-voice-wave h-full'
                          : 'bg-slate-600 h-1.5'
                      }`}
                      style={{
                        animationDelay: isCallerSpeaking ? `${bar * 110}ms` : undefined,
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold truncate">
                  {!voiceEnabled || muted
                    ? t.voiceMutedLabel
                    : isCallerSpeaking
                    ? t.callerSpeakingLabel
                    : t.speakerReadyLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={!lastCallerLine}
                  onClick={() => {
                    if (lastCallerLine) {
                      speakCallerLine(lastCallerLine, mood, patience, 0);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-[11px] font-semibold text-slate-200 transition-colors whitespace-nowrap"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.repeatLineBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleVoiceOutput}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors whitespace-nowrap ${
                    voiceEnabled && !muted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {t.voiceToggleLabel}
                </button>
              </div>
            </div>

            {/* Transcript Header */}
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.transcriptTitle}</span>
              </div>
              <span className="text-xs font-mono-tabular text-slate-500">
                {formatClock(callElapsedSec)}
              </span>
            </div>

            {/* Transcript Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
              {transcript.map((msg) => {
                const isAgent = msg.sender === 'agent';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="animate-message-in rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs text-blue-900"
                    >
                      <div className="flex items-center justify-between gap-2 font-bold mb-1">
                        <span>{t.systemLabel}</span>
                        <span className="font-mono-tabular text-[11px] text-blue-700">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="leading-relaxed">{msg.text[lang]}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`animate-message-in flex flex-col ${
                      isAgent ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed border ${
                        isAgent
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-900 border-slate-200'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between gap-3 text-[11px] mb-1 ${
                          isAgent ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        <span className="font-semibold">
                          {isAgent ? t.agentLabel : currentScenario.name[lang]}
                        </span>
                        <span className="font-mono-tabular">{msg.timestamp}</span>
                      </div>
                      <p>{msg.text[lang]}</p>
                    </div>
                  </div>
                );
              })}

              {callOutcome !== 'active' && (
                <div
                  className={`animate-message-in rounded-xl border p-4 space-y-3 ${
                    callOutcome === 'resolved'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-extrabold text-sm">
                      {callOutcome === 'resolved' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <PhoneOff className="w-5 h-5 text-rose-600" />
                      )}
                      <span>
                        {callOutcome === 'resolved' ? t.callResolvedTag : t.callDroppedTag}
                      </span>
                    </div>
                    <div className="text-xs font-mono-tabular font-bold">
                      {outcomePoints >= 0 ? `+${outcomePoints}` : outcomePoints} pts ·{' '}
                      {outcomeCsatDelta >= 0
                        ? `+${outcomeCsatDelta.toFixed(1)}`
                        : outcomeCsatDelta.toFixed(1)}
                      ★
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed opacity-90">
                    {callOutcome === 'resolved'
                      ? currentScenario.victoryLogSummary[lang]
                      : currentScenario.hangupLine[lang]}
                  </p>

                  <button
                    type="button"
                    onClick={handleNextCall}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{t.nextCallBtn} (N)</span>
                  </button>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>
          </div>

          {/* Microphone Push-to-Talk, Live STT Transcript & Text Fallback */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                {isListening ? (
                  <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4 text-blue-600" />
                )}
                <span>{t.liveTranscriptLabel}</span>
              </div>

              <span
                className={`text-[11px] font-semibold ${
                  isListening ? 'text-rose-600' : 'text-slate-500'
                }`}
              >
                {isListening ? t.micListeningLabel : t.micHoldLabel}
              </span>
            </div>

            {/* Mic Control Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={callOutcome !== 'active' || micState === 'unsupported'}
                onMouseDown={() => {
                  if (callOutcome !== 'active') return;
                  if (isListening && !continuousMic) {
                    voiceEngine.stopListening();
                    setIsListening(false);
                    micPressTimeRef.current = 0;
                    return;
                  }
                  micPressTimeRef.current = Date.now();
                  setContinuousMic(false);
                  startMic(false);
                }}
                onMouseUp={() => {
                  if (continuousMic || micPressTimeRef.current === 0) return;
                  const heldMs = Date.now() - micPressTimeRef.current;
                  if (heldMs >= 320) {
                    voiceEngine.stopListening();
                    setIsListening(false);
                  }
                }}
                onMouseLeave={() => {
                  if (!continuousMic && isListening && micPressTimeRef.current > 0) {
                    const heldMs = Date.now() - micPressTimeRef.current;
                    if (heldMs >= 320) {
                      voiceEngine.stopListening();
                      setIsListening(false);
                    }
                  }
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (callOutcome !== 'active') return;
                  if (isListening && !continuousMic) {
                    voiceEngine.stopListening();
                    setIsListening(false);
                    micPressTimeRef.current = 0;
                    return;
                  }
                  micPressTimeRef.current = Date.now();
                  setContinuousMic(false);
                  startMic(false);
                }}
                onTouchEnd={() => {
                  if (continuousMic || micPressTimeRef.current === 0) return;
                  const heldMs = Date.now() - micPressTimeRef.current;
                  if (heldMs >= 320) {
                    voiceEngine.stopListening();
                    setIsListening(false);
                  }
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors select-none ${
                  isListening && !continuousMic
                    ? 'bg-rose-600 text-white shadow-inner'
                    : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-45 text-white'
                }`}
              >
                <Mic className="w-4 h-4 shrink-0" />
                <span className="truncate">{t.micHoldLabel}</span>
              </button>

              <button
                type="button"
                disabled={callOutcome !== 'active' || micState === 'unsupported'}
                onClick={handleToggleContinuousMic}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  continuousMic && isListening
                    ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 disabled:opacity-45'
                }`}
              >
                {continuousMic && isListening ? (
                  <MicOff className="w-4 h-4 shrink-0" />
                ) : (
                  <Radio className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">
                  {continuousMic && isListening ? t.micStopListenBtn : t.micToggleListenBtn}
                </span>
              </button>
            </div>

            {/* Live Speech-to-Text Box & Intent Highlight */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 min-h-[74px]">
              {interimTranscript ? (
                <p className="text-xs font-medium text-blue-700 italic">{interimTranscript}</p>
              ) : finalHeardText ? (
                <p className="text-xs font-semibold text-slate-900">“{finalHeardText}”</p>
              ) : (
                <p className="text-xs text-slate-400">{t.liveTranscriptPlaceholder}</p>
              )}

              {recognizedIntents.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200 text-[11px]">
                  <span className="font-semibold text-slate-500">{t.recognizedIntentLabel}:</span>
                  {recognizedIntents.map((intentId) => {
                    const def = ACTIONS.find((a) => a.id === intentId);
                    return (
                      <span
                        key={intentId}
                        className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold"
                      >
                        {def ? def.label[lang] : intentId}
                      </span>
                    );
                  })}
                </div>
              )}

              {unrecognizedHint && (
                <p className="text-[11px] font-medium text-amber-700 pt-1 border-t border-slate-200">
                  {t.noIntentDetected}
                </p>
              )}

              {micErrorMsg && (
                <p className="text-[11px] font-medium text-rose-700 pt-1 border-t border-slate-200">
                  {micErrorMsg}
                </p>
              )}
            </div>

            {/* Text Input Fallback */}
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={textInput}
                disabled={callOutcome !== 'active' || isRebooting || isCheckingLine}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={t.textFallbackPlaceholder}
                className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={
                  !textInput.trim() || callOutcome !== 'active' || isRebooting || isCheckingLine
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-45 text-white text-xs font-bold transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendBtn}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Column 3: Support Desk Quick Action Cards */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">{t.actionsTitle}</h3>
            {callOutcome !== 'active' && (
              <button
                type="button"
                onClick={handleNextCall}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors whitespace-nowrap"
              >
                {t.nextCallBtn}
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500">{t.diagnosticsGroup}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {diagActions.map((action) => {
                const disabled = callOutcome !== 'active' || isRebooting || isCheckingLine;
                const isDoneBadge =
                  (action.id === 'ask_id' && idRevealed) ||
                  (action.id === 'check_line' && lineChecked);

                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => executeAction(action.id)}
                    className={`group text-start w-full rounded-xl border px-3.5 py-3 transition-all flex items-center justify-between gap-3 ${
                      disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : 'bg-white border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isDoneBadge
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}
                      >
                        {actionIcon(action.id)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {action.label[lang]}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {action.sublabel[lang]}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-[11px] font-bold text-slate-400 shrink-0">
                      [{action.shortcut}]
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500">{t.resolutionGroup}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {resActions.map((action) => {
                const disabled = callOutcome !== 'active' || isRebooting || isCheckingLine;
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => executeAction(action.id)}
                    className={`group text-start w-full rounded-xl border px-3.5 py-2.5 transition-all flex items-center justify-between gap-3 ${
                      disabled
                        ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                        : 'bg-slate-50/70 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/50 active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-emerald-700 group-hover:border-emerald-300 flex items-center justify-center shrink-0">
                        {actionIcon(action.id)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {action.label[lang]}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {action.sublabel[lang]}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono-tabular text-[11px] font-bold text-slate-400 shrink-0">
                      [{action.shortcut}]
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {callOutcome === 'active' && patience <= 30 && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 flex items-center gap-2 text-xs font-semibold text-rose-800">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>
                {lang === 'ar'
                  ? 'تحذير: صبر العميل على وشك الانتهاء! هدّيه أو حل المشكلة بسرعة.'
                  : 'Warning: Caller patience critical! De-escalate or resolve immediately.'}
              </span>
            </div>
          )}
        </section>
      </main>

      {/* Pause Overlay Modal */}
      {gameState === 'PAUSED' && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/65"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-6 text-center space-y-4 shadow-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">{t.pausedTitle}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{t.pausedDesc}</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setGameState('PLAYING');
                }}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
              >
                {t.resumeBtn}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearActionTimers();
                  voiceEngine.stopSpeaking();
                  stopMic();
                  setGameState('SHIFT_SUMMARY');
                }}
                className="w-full py-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-colors"
              >
                {t.endShiftNowBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawers & Modals */}
      <AudioSetupModal
        open={audioSetupOpen}
        lang={lang}
        micState={micState}
        onUpdateMicState={setMicState}
        isPreShift={pendingStartShift}
        onClose={() => {
          setAudioSetupOpen(false);
          setPendingStartShift(false);
        }}
        onComplete={(withAudio) => {
          setHasCompletedAudioSetup(true);
          setVoiceEnabled(withAudio);
          setAudioSetupOpen(false);
          setPendingStartShift(false);
        }}
      />
      <HowToPlayModal open={guideOpen} onClose={() => setGuideOpen(false)} lang={lang} />
      <TicketHistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        tickets={tickets}
        lang={lang}
      />
      <ShiftSummaryModal
        open={gameState === 'SHIFT_SUMMARY'}
        lang={lang}
        tickets={tickets}
        csat={csat}
        score={score}
        bestStreak={bestStreak}
        rebootsOrdered={rebootsOrdered}
        idsVerified={idsVerified}
        onPlayAgain={launchNewShift}
        onBackToTitle={() => {
          clearActionTimers();
          voiceEngine.stopSpeaking();
          stopMic();
          setGameState('TITLE_MENU');
        }}
      />
    </div>
  );
}
