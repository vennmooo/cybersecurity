import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb,
  Phone, Heart, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import type { ScenarioStationData, ScenarioTask } from '@/types';

interface Props {
  data: ScenarioStationData;
  stationNumber: number;
  accent: 'cyan' | 'purple';
  onComplete: (score: number, mainCorrect: boolean) => void;
  onBack: () => void;
  existingScore: number | null;
  existingMainCorrect: boolean | null;
}

export function ScenarioStation({
  data,
  stationNumber,
  accent,
  onComplete,
  onBack,
  existingScore,
  existingMainCorrect,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [claimed, setClaimed] = useState(existingScore !== null);

  const accentColor = accent === 'cyan' ? 'cyan' : 'purple';
  const Icon = data.stationId === 'phonecall' ? Phone : Heart;

  function toggle(taskId: string, key: string) {
    if (checked[taskId]) return;
    setAnswers((prev) => {
      const set = new Set(prev[taskId] ?? []);
      // single-choice: replace
      const task = data.tasks.find((t) => t.id === taskId);
      if (task?.type === 'single') {
        set.clear();
      }
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, [taskId]: set };
    });
  }

  function checkTask(taskId: string) {
    if (checked[taskId]) return;
    setChecked((prev) => ({ ...prev, [taskId]: true }));
  }

  function taskScore(task: ScenarioTask): number {
    const sel = answers[task.id] ?? new Set<string>();
    if (task.type === 'single') {
      return sel.size > 0 && task.correct.includes([...sel][0]) ? task.points : 0;
    }
    const correctHits = task.correct.filter((k) => sel.has(k)).length;
    const wrongHits = [...sel].filter((k) => !task.correct.includes(k)).length;
    const raw = correctHits * task.points - wrongHits * 3;
    return Math.max(0, Math.min(task.points * task.correct.length, raw));
  }

  const totalEarned = data.tasks.reduce((sum, t) => sum + taskScore(t), 0);
  const maxPossible = data.tasks.reduce((sum, t) => sum + t.points * (t.type === 'single' ? 1 : t.correct.length), 0);
  const allChecked = data.tasks.every((t) => checked[t.id]);
  const mainTask = data.tasks[0];
  const mainCorrect =
    (answers[mainTask.id]?.size ?? 0) > 0 &&
    mainTask.correct.includes([...(answers[mainTask.id] ?? [])][0]);

  function handleFinish() {
    setClaimed(true);
    onComplete(totalEarned, mainCorrect);
  }

  const accentClasses: Record<string, { text: string; border: string; bg: string; shadow: string }> = {
    cyan: {
      text: 'text-cyber-cyan',
      border: 'border-cyber-cyan/40',
      bg: 'bg-cyber-cyan/15',
      shadow: 'shadow-neon-cyan',
    },
    purple: {
      text: 'text-cyber-purple',
      border: 'border-cyber-purple/40',
      bg: 'bg-cyber-purple/15',
      shadow: 'shadow-neon-purple',
    },
  };
  const ac = accentClasses[accentColor];

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="cyber-btn-ghost mb-5 inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <ChevronLeft className="w-4 h-4" /> Назад к меню
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-xl ${ac.bg} border ${ac.border} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${ac.text}`} />
          </div>
          <div>
            <span className="text-xs font-mono text-cyber-muted">Станция {stationNumber}</span>
            <h1 className={`text-2xl sm:text-3xl font-black uppercase ${ac.text} ${accentColor === 'cyan' ? 'neon-text-cyan' : 'neon-text-purple'}`}>
              {data.title}
            </h1>
          </div>
        </div>
        <p className="text-cyber-muted mb-5">{data.subtitle}</p>

        {/* Score badge */}
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-cyber-muted uppercase tracking-wide">Заработано баллов</span>
          <span className={`text-2xl font-black font-display ${ac.text}`}>
            {claimed ? (existingScore ?? totalEarned) : totalEarned}
            <span className="text-sm text-cyber-muted"> / {maxPossible}</span>
          </span>
        </div>

        {/* Story card */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-cyber-border">
            <AlertTriangle className={`w-5 h-5 ${ac.text}`} />
            <h2 className="font-display font-semibold uppercase tracking-wide text-white">Ситуация</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">{data.story}</p>
          {data.callerLine && (
            <div className={`p-4 rounded-xl ${ac.bg} border ${ac.border}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${ac.text} shrink-0 mt-0.5`} />
                <p className="text-gray-200 italic leading-relaxed">«{data.callerLine}»</p>
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-6">
          {data.tasks.map((task, idx) => {
            const sel = answers[task.id] ?? new Set<string>();
            const isDone = checked[task.id];
            const canCheck = task.type === 'single' ? sel.size > 0 : sel.size > 0;

            return (
              <div key={task.id} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded ${ac.bg} ${ac.border} border ${ac.text}`}>
                    {task.type === 'single' ? 'Выбери один ответ' : 'Отметь все верные'}
                  </span>
                  <span className="text-xs text-cyber-muted ml-auto">
                    {task.type === 'single' ? `${task.points} баллов` : `${task.points} × ${task.correct.length} признаков`}
                  </span>
                </div>

                <p className="text-white font-medium mb-4 leading-relaxed">
                  {idx + 1}. {task.question}
                </p>

                <div className="space-y-2">
                  {task.options.map((opt) => {
                    const isSelected = sel.has(opt.key);
                    const isCorrect = task.correct.includes(opt.key);
                    const showResult = isDone;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => toggle(task.id, opt.key)}
                        disabled={isDone}
                        className={`w-full text-left p-3 rounded-lg border text-sm flex items-start gap-3 transition-all ${
                          showResult
                            ? isSelected
                              ? isCorrect
                                ? 'bg-cyber-green/10 border-cyber-green/50 text-white'
                                : 'bg-cyber-red/10 border-cyber-red/50 text-white'
                              : isCorrect
                              ? 'bg-cyber-red/5 border-cyber-red/30 text-gray-400'
                              : 'bg-cyber-bg/40 border-cyber-border text-gray-400'
                            : isSelected
                            ? `${ac.bg} border-current ${ac.text} text-white`
                            : 'bg-cyber-bg/40 border-cyber-border text-gray-300 hover:border-cyber-cyan/50'
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">
                          {showResult ? (
                            isSelected ? (
                              isCorrect ? <CheckCircle2 className="w-5 h-5 text-cyber-green" /> : <XCircle className="w-5 h-5 text-cyber-red" />
                            ) : isCorrect ? (
                              <XCircle className="w-5 h-5 text-cyber-red/70" />
                            ) : (
                              <span className="block w-5 h-5 rounded border border-cyber-border" />
                            )
                          ) : (
                            <span className={`block w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected ? `${ac.bg} border-current` : 'border-cyber-border'
                            }`}>
                              {isSelected && task.type === 'single' && <span className={`w-2.5 h-2.5 rounded-full ${ac.text} bg-current`} />}
                              {isSelected && task.type === 'multi' && <CheckCircle2 className={`w-4 h-4 ${ac.text}`} />}
                            </span>
                          )}
                        </span>
                        <span className="leading-relaxed">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>

                {!isDone && (
                  <button
                    onClick={() => checkTask(task.id)}
                    disabled={!canCheck}
                    className={`w-full mt-4 py-3 rounded-lg font-display font-semibold uppercase tracking-wider transition-all ${
                      canCheck
                        ? accentColor === 'cyan' ? 'cyber-btn-primary' : 'cyber-btn-purple'
                        : 'bg-cyber-bg/40 border border-cyber-border text-cyber-muted cursor-not-allowed'
                    }`}
                  >
                    Проверить ответ
                  </button>
                )}

                {isDone && (
                  <div className="mt-4 p-4 rounded-xl bg-cyber-teal/5 border border-cyber-teal/30 animate-fade-in">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-cyber-teal shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-cyber-teal mb-1">Разбор</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{task.explanation}</p>
                        <p className="text-xs text-cyber-muted mt-2">
                          За это задание: <span className={ac.text}>{taskScore(task)}</span> из{' '}
                          {task.points * (task.type === 'single' ? 1 : task.correct.length)} баллов
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Finish */}
        {allChecked && (
          <div className="glass-card p-5 mt-6 animate-slide-up border-cyber-green/40">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-cyber-green" />
              <h3 className="font-display font-semibold text-lg text-cyber-green">
                Станция пройдена!
              </h3>
            </div>
            <p className="text-cyber-muted text-sm mb-4">
              Ты заработал <span className={ac.text + ' font-bold'}>{totalEarned}</span> баллов из {maxPossible}.
            </p>
            <button
              onClick={handleFinish}
              className={`w-full flex items-center justify-center gap-2 ${accentColor === 'cyan' ? 'cyber-btn-primary' : 'cyber-btn-purple'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              Завершить станцию <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!allChecked && (
          <div className="flex items-center gap-2 text-xs text-cyber-muted mt-4 justify-center">
            <AlertTriangle className="w-4 h-4" />
            Ответь на все вопросы, чтобы завершить станцию
          </div>
        )}
      </div>
    </div>
  );
}
