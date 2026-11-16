import { Mail, KeyRound, Lock, Trophy, CheckCircle2, Circle, ChevronRight, Building2, Award, Phone, Heart } from 'lucide-react';
import type { ParticipantData } from '@/types';
import { MAX_SCORE, computeStatus } from '@/data/quest';

interface Props {
  participant: ParticipantData;
  score: number;
  completedStations: Record<string, boolean>;
  onSelectStation: (id: string) => void;
  onShowResults: () => void;
}

export function QuestMenu({ participant, score, completedStations, onSelectStation, onShowResults }: Props) {
  const stations = [
    {
      id: 'phishing',
      number: 1,
      title: 'Фишинг-детектив',
      description: 'Распознай фишинговые письма и мошеннические сообщения',
      icon: Mail,
      maxScore: 100,
      bonus: false,
    },
    {
      id: 'phonecall',
      number: 2,
      title: 'Звонок из поликлиники',
      description: 'Как безопасно вести диалог при подозрительном звонке',
      icon: Phone,
      maxScore: 30,
      bonus: false,
    },
    {
      id: 'romance',
      number: 3,
      title: 'Ловушка доверия',
      description: 'Безопасность на сайтах знакомств и защита фотографий',
      icon: Heart,
      maxScore: 20,
      bonus: false,
    },
    {
      id: 'password',
      number: 4,
      title: 'Создай надёжный пароль',
      description: 'Бонусное задание: проверь надёжность своего пароля',
      icon: KeyRound,
      maxScore: 20,
      bonus: true,
    },
  ];

  const completedCount = Object.values(completedStations).filter(Boolean).length;
  const progress = Math.round((completedCount / stations.length) * 100);
  const percentage = MAX_SCORE > 0 ? Math.round((score / MAX_SCORE) * 100) : 0;
  const allDone = completedCount === stations.length;

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 mb-4">
            <Lock className="w-4 h-4 text-cyber-cyan" />
            <span className="text-sm font-display uppercase tracking-wider text-cyber-cyan">
              Маршрут цифровой безопасности
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-cyber-cyan neon-text-cyan">
            Игровая панель
          </h1>
        </div>

        {/* Participant info + score panel */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyber-teal/15 border border-cyber-teal/40 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-cyber-teal" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-lg text-white truncate">{participant.institution}</p>
                <span className="text-xs px-2 py-0.5 rounded bg-cyber-border/30 border border-cyber-border text-gray-400 inline-block mt-2">
                  {participant.questDate}
                </span>
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="glass-card p-5 flex flex-col items-center justify-center">
            <Trophy className="w-7 h-7 text-cyber-amber mb-1" />
            <p className="text-xs uppercase tracking-wider text-cyber-muted">Общий счёт</p>
            <p className="text-3xl font-black font-display text-cyber-cyan neon-text-cyan">
              {score}
              <span className="text-lg text-cyber-muted"> / {MAX_SCORE}</span>
            </p>
            <p className="text-xs text-cyber-teal mt-0.5">{percentage}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="glass-card p-5 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-display uppercase tracking-wide text-cyber-muted">Прогресс прохождения</span>
            <span className="text-sm text-cyber-cyan font-semibold">
              {completedCount} / {stations.length} станций
            </span>
          </div>
          <div className="h-3 bg-cyber-bg/70 rounded-full overflow-hidden border border-cyber-border">
            <div
              className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-teal rounded-full transition-all duration-700 shadow-neon-cyan"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Статус: <span className="text-cyber-teal">{computeStatus(percentage)}</span>
          </p>
        </div>

        {/* Stations list */}
        <div className="space-y-4">
          {stations.map((s) => {
            const done = completedStations[s.id];
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStation(s.id)}
                className={`group w-full text-left glass-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-cyber-cyan hover:shadow-neon-cyan ${
                  done ? 'border-cyber-green/40' : ''
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    done
                      ? 'bg-cyber-green/15 border border-cyber-green/50'
                      : s.bonus
                      ? 'bg-cyber-purple/15 border border-cyber-purple/40 group-hover:shadow-neon-purple'
                      : 'bg-cyber-cyan/15 border border-cyber-cyan/40 group-hover:shadow-neon-cyan'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-7 h-7 text-cyber-green" />
                  ) : (
                    <Icon className={`w-7 h-7 ${s.bonus ? 'text-cyber-purple' : 'text-cyber-cyan'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyber-muted">Станция {s.number}</span>
                    {s.bonus && (
                      <span className="text-xs px-2 py-0.5 rounded bg-cyber-purple/15 border border-cyber-purple/30 text-cyber-purple uppercase tracking-wide">
                        Бонус
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white truncate">{s.title}</h3>
                  <p className="text-sm text-cyber-muted truncate">{s.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-semibold ${done ? 'text-cyber-green' : 'text-cyber-cyan'}`}>
                    {done ? `${s.maxScore} баллов` : `до ${s.maxScore}`}
                  </span>
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                  ) : (
                    <Circle className="w-5 h-5 text-cyber-muted group-hover:text-cyber-cyan transition-colors" />
                  )}
                  <ChevronRight className="w-5 h-5 text-cyber-muted group-hover:text-cyber-cyan group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Results button */}
        {allDone && (
          <button
            onClick={onShowResults}
            className="cyber-btn-primary w-full mt-6 flex items-center justify-center gap-2 text-lg animate-slide-up"
          >
            <Award className="w-5 h-5" />
            Посмотреть результаты
          </button>
        )}
        {!allDone && completedCount > 0 && (
          <button
            onClick={onShowResults}
            className="cyber-btn-ghost w-full mt-6 flex items-center justify-center gap-2"
          >
            <Award className="w-5 h-5" />
            Перейти к результатам
          </button>
        )}
      </div>
    </div>
  );
}
