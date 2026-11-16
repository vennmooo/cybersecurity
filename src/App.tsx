import { useState, useCallback } from 'react';
import { RegistrationPage } from '@/components/RegistrationPage';
import { QuestMenu } from '@/components/QuestMenu';
import { PhishingStation } from '@/components/PhishingStation';
import { ScenarioStation } from '@/components/ScenarioStation';
import { PasswordStation } from '@/components/PasswordStation';
import { ResultsPage } from '@/components/ResultsPage';
import { StatsPage } from '@/components/StatsPage';
import { CyberBackground } from '@/components/CyberBackground';
import { supabase } from '@/lib/supabase';
import { PHONE_CALL_SCENARIO, ROMANCE_SCAM_SCENARIO, MAX_SCORE, computeStatus } from '@/data/quest';
import type { ParticipantData, Participant, QuestResult } from '@/types';

type View = 'register' | 'menu' | 'phishing' | 'phonecall' | 'romance' | 'password' | 'results' | 'stats';

interface AppState {
  participant: ParticipantData | null;
  participantId: string | null;
  resultId: string | null;
  view: View;
  score: number;
  phishingCorrect: number;
  passwordBonus: boolean;
  phishingScore: number | null;
  phoneCallScore: number | null;
  phoneCallCorrect: boolean | null;
  romanceScore: number | null;
  romanceCorrect: boolean | null;
  passwordScore: number | null;
  completedStations: Record<string, boolean>;
}

const initialState: AppState = {
  participant: null,
  participantId: null,
  resultId: null,
  view: 'register',
  score: 0,
  phishingCorrect: 0,
  passwordBonus: false,
  phishingScore: null,
  phoneCallScore: null,
  phoneCallCorrect: null,
  romanceScore: null,
  romanceCorrect: null,
  passwordScore: null,
  completedStations: {},
};

function totalScore(s: AppState): number {
  return (s.phishingScore ?? 0) + (s.phoneCallScore ?? 0) + (s.romanceScore ?? 0) + (s.passwordScore ?? 0);
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);

  const persistResult = useCallback(
    async (s: AppState) => {
      if (!s.participantId) return;
      const ts = totalScore(s);
      const percentage = Math.round((ts / MAX_SCORE) * 100);
      const status = computeStatus(percentage);

      const payload = {
        total_score: ts,
        max_score: MAX_SCORE,
        percentage,
        status,
        phishing_correct: s.phishingCorrect,
        password_bonus: s.passwordBonus,
        phone_call_score: s.phoneCallScore ?? 0,
        phone_call_correct: s.phoneCallCorrect ?? false,
        romance_scam_score: s.romanceScore ?? 0,
        romance_scam_correct: s.romanceCorrect ?? false,
      };

      if (s.resultId) {
        await supabase.from('quest_results').update(payload).eq('id', s.resultId);
      } else {
        const { data } = await supabase
          .from('quest_results')
          .insert({ participant_id: s.participantId, ...payload })
          .select()
          .maybeSingle();
        if (data) {
          setState((prev) => ({ ...prev, resultId: (data as QuestResult).id }));
        }
      }
    },
    [],
  );

  async function handleRegister(data: ParticipantData) {
    const { data: row, error } = await supabase
      .from('participants')
      .insert({
        institution: data.institution,
        quest_date: data.questDate,
      })
      .select()
      .maybeSingle();

    if (error || !row) {
      setState({
        ...initialState,
        participant: data,
        view: 'menu',
      });
      return;
    }

    setState({
      ...initialState,
      participant: data,
      participantId: (row as Participant).id,
      view: 'menu',
    });
  }

  function handleSelectStation(id: string) {
    const valid: View[] = ['phishing', 'phonecall', 'romance', 'password'];
    if (valid.includes(id as View)) setState((s) => ({ ...s, view: id as View }));
  }

  function handlePhishingComplete(score: number, correctCount: number) {
    setState((s) => {
      const next: AppState = {
        ...s,
        phishingScore: score,
        phishingCorrect: correctCount,
        completedStations: { ...s.completedStations, phishing: true },
        score: score + (s.phoneCallScore ?? 0) + (s.romanceScore ?? 0) + (s.passwordScore ?? 0),
        view: 'menu',
      };
      void persistResult(next);
      return next;
    });
  }

  function handlePhoneCallComplete(score: number, mainCorrect: boolean) {
    setState((s) => {
      const next: AppState = {
        ...s,
        phoneCallScore: score,
        phoneCallCorrect: mainCorrect,
        completedStations: { ...s.completedStations, phonecall: true },
        score: totalScore({ ...s, phoneCallScore: score }),
        view: 'menu',
      };
      void persistResult(next);
      return next;
    });
  }

  function handleRomanceComplete(score: number, mainCorrect: boolean) {
    setState((s) => {
      const next: AppState = {
        ...s,
        romanceScore: score,
        romanceCorrect: mainCorrect,
        completedStations: { ...s.completedStations, romance: true },
        score: totalScore({ ...s, romanceScore: score }),
        view: 'menu',
      };
      void persistResult(next);
      return next;
    });
  }

  function handlePasswordComplete(score: number, earned: boolean) {
    setState((s) => {
      const next: AppState = {
        ...s,
        passwordScore: score,
        passwordBonus: earned,
        completedStations: { ...s.completedStations, password: true },
        score: totalScore({ ...s, passwordScore: score }),
        view: 'menu',
      };
      void persistResult(next);
      return next;
    });
  }

  function handleBackToMenu() {
    setState((s) => ({ ...s, view: 'menu' }));
  }

  function handleShowResults() {
    setState((s) => ({ ...s, view: 'results' }));
  }

  function handleRestart() {
    setState(initialState);
  }

  function handleShowStats() {
    setState((s) => ({ ...s, view: 'stats' }));
  }

  return (
    <>
      <CyberBackground />

      {state.view === 'register' && <RegistrationPage onSubmit={handleRegister} onShowStats={handleShowStats} />}

      {state.view === 'menu' && state.participant && (
        <QuestMenu
          participant={state.participant}
          score={state.score}
          completedStations={state.completedStations}
          onSelectStation={handleSelectStation}
          onShowResults={handleShowResults}
        />
      )}

      {state.view === 'phishing' && (
        <PhishingStation
          onComplete={handlePhishingComplete}
          onBack={handleBackToMenu}
          existingScore={state.phishingScore}
        />
      )}

      {state.view === 'phonecall' && (
        <ScenarioStation
          data={PHONE_CALL_SCENARIO}
          stationNumber={2}
          accent="cyan"
          onComplete={handlePhoneCallComplete}
          onBack={handleBackToMenu}
          existingScore={state.phoneCallScore}
          existingMainCorrect={state.phoneCallCorrect}
        />
      )}

      {state.view === 'romance' && (
        <ScenarioStation
          data={ROMANCE_SCAM_SCENARIO}
          stationNumber={3}
          accent="purple"
          onComplete={handleRomanceComplete}
          onBack={handleBackToMenu}
          existingScore={state.romanceScore}
          existingMainCorrect={state.romanceCorrect}
        />
      )}

      {state.view === 'password' && (
        <PasswordStation
          onComplete={handlePasswordComplete}
          onBack={handleBackToMenu}
          existingScore={state.passwordScore}
        />
      )}

      {state.view === 'results' && state.participant && (
        <ResultsPage
          participant={state.participant}
          totalScore={state.score}
          phishingCorrect={state.phishingCorrect}
          passwordBonus={state.passwordBonus}
          phoneCallScore={state.phoneCallScore ?? 0}
          phoneCallCorrect={state.phoneCallCorrect ?? false}
          romanceScore={state.romanceScore ?? 0}
          romanceCorrect={state.romanceCorrect ?? false}
          onBackToMenu={handleBackToMenu}
          onRestart={handleRestart}
        />
      )}

      {state.view === 'stats' && <StatsPage onBack={handleRestart} />}
    </>
  );
}
