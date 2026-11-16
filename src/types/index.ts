export interface Participant {
  id: string;
  full_name: string;
  institution: string;
  group_class: string;
  team?: string | null;
  quest_date: string;
  created_at?: string;
}

export interface QuestResult {
  id: string;
  participant_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  status: string;
  phishing_correct: number;
  password_bonus: boolean;
  created_at?: string;
}

export interface ParticipantData {
  fullName?: string;
  institution: string;
  groupClass?: string;
  team?: string;
  questDate: string;
}

export type SignKey =
  | 'sender'
  | 'errors'
  | 'domain'
  | 'urgent'
  | 'password'
  | 'attachment';

export interface SignOption {
  key: SignKey;
  label: string;
}

export interface PhishingMessage {
  id: number;
  title: string;
  sender: string;
  subject: string;
  body: string;
  link: string;
  date: string;
  correctSigns: SignKey[];
  explanation: string;
}

export interface Station {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  status: 'locked' | 'available' | 'completed';
  maxScore: number;
}

export interface ScenarioOption {
  key: string;
  label: string;
}

export interface ScenarioTask {
  id: string;
  type: 'single' | 'multi';
  question: string;
  options: ScenarioOption[];
  correct: string[];
  explanation: string;
  points: number;
}

export interface ScenarioStationData {
  stationId: string;
  title: string;
  subtitle: string;
  story: string;
  callerLine?: string;
  tasks: ScenarioTask[];
}
