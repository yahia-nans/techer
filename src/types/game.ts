import { BilingualText, CallerScenario } from '../data/scenarios';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'SHIFT_SUMMARY';

export interface TranscriptMessage {
  id: string;
  sender: 'caller' | 'agent' | 'system';
  text: BilingualText;
  timestamp: string;
}

export interface TicketRecord {
  id: string;
  scenario: CallerScenario;
  status: 'resolved' | 'dropped';
  pointsEarned: number;
  csatDelta: number;
  summary: BilingualText;
  timeTakenSec: number;
}
