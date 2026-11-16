import { useState } from 'react';
import {
  Mail, AlertTriangle, CheckCircle2, XCircle, ChevronRight, ChevronLeft,
  Search, Lightbulb, ShieldAlert, Inbox,
} from 'lucide-react';
import type { SignKey } from '@/types';
import { PHISHING_MESSAGES, SIGNS } from '@/data/quest';

interface Props {
  onComplete: (score: number, correctCount: number) => void;
  onBack: () => void;
  existingScore: number | null;
}

const POINTS_PER_MESSAGE = 15; // 5 messages * 15 = 75 max for correct signs
const BONUS_ALL_CORRECT = 25;  // +25 if all 5 fully correct => 100 total

export function PhishingStation({ onComplete, onBack, existingScore }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selected, setSelected] = useState<Record<number, Set<SignKey>>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [earnedScore, setEarnedScore] = useState<number>(existingScore ?? 0);

  const allChecked = PHISHING_MESSAGES.every((m) => checked[m.id]);

  function toggleSign(msgId: number, key: SignKey) {
    if (checked[msgId]) return;
    setSelected((prev) => {
      const set = new Set(prev[msgId] ?? []);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...prev, [msgId]: set };
    });
  }

  function checkAnswer(msgId: number) {
    if (checked[msgId]) return;
    setChecked((prev) => ({ ...prev, [msgId]: true }));

    let newPoints = earnedScore;
    PHISHING_MESSAGES.forEach((m) => {
      // only count messages already checked plus this new one
      const isThisOrPrior = m.id === msgId || checked[m.id];
      if (!isThisOrPrior) return;
    });
    // Recompute from scratch to avoid double counting
    const updatedChecked = { ...checked, [msgId]: true };
    newPoints = computeScore(updatedChecked);
    setEarnedScore(newPoints);
  }

  function computeScore(checkedMap: Record<number, boolean>): number {
    let score = 0;
    let fullyCorrect = 0;
    for (const m of PHISHING_MESSAGES) {
      if (!checkedMap[m.id]) continue;
      const sel = selected[m.id] ?? new Set<SignKey>();
      const correct = m.correctSigns.filter((k) => sel.has(k)).length;
      const wrong = [...sel].filter((k) => !m.correctSigns.includes(k)).length;
      // points: +3 per correct sign, -2 per wrong, min 0, capped at POINTS_PER_MESSAGE
      const raw = correct * 3 - wrong * 2;
      const msgScore = Math.max(0, Math.min(POINTS_PER_MESSAGE, raw));
      score += msgScore;
      if (correct === m.correctSigns.length && wrong === 0) fullyCorrect++;
    }
    if (fullyCorrect === PHISHING_MESSAGES.length) score += BONUS_ALL_CORRECT;
    // scale: max possible = 75 + 25 = 100
    return Math.min(100, score);
  }

  function handleFinish() {
    const correctCount = PHISHING_MESSAGES.filter((m) => {
      const sel = selected[m.id] ?? new Set<SignKey>();
      return (
        m.correctSigns.every((k) => sel.has(k)) &&
        [...sel].every((k) => m.correctSigns.includes(k))
      );
    }).length;
    onComplete(earnedScore, correctCount);
  }

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="cyber-btn-ghost mb-5 inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <ChevronLeft className="w-4 h-4" /> Назад к меню
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center">
            <Search className="w-6 h-6 text-cyber-cyan" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyber-muted">Станция 1</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-cyber-cyan neon-text-cyan">
              Фишинг-детектив
            </h1>
          </div>
        </div>
        <p className="text-cyber-muted mb-6 max-w-2xl">
          На рабочем столе детектива — 5 подозрительных сообщений. Изучи каждое,
          выбери минимум 3 признака мошенничества и нажми «Проверить ответ».
        </p>

        {/* Score badge */}
        <div className="glass-card p-4 mb-6 flex items-center justify-between">
          <span className="text-sm text-cyber-muted uppercase tracking-wide">Заработано баллов</span>
          <span className="text-2xl font-black font-display text-cyber-cyan neon-text-cyan">{earnedScore}</span>
        </div>

        {/* Detective desk — message cards */}
        <div className="glass-card p-5 sm:p-6 mb-6 relative overflow-hidden">
          <div className="scanline">
            <div className="absolute inset-x-0 h-16 bg-gradient-to-b from-cyber-cyan/10 to-transparent animate-scan" />
          </div>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyber-border">
            <Inbox className="w-5 h-5 text-cyber-teal" />
            <h2 className="font-display font-semibold uppercase tracking-wide text-cyber-teal">
              Входящие сообщения
            </h2>
            <span className="ml-auto text-xs font-mono text-cyber-muted">
              {Object.values(checked).filter(Boolean).length} / {PHISHING_MESSAGES.length} проверено
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PHISHING_MESSAGES.map((msg) => {
              const isOpen = openIdx === msg.id;
              const isDone = checked[msg.id];
              return (
                <button
                  key={msg.id}
                  onClick={() => setOpenIdx(isOpen ? null : msg.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-cyber-green/5 border-cyber-green/40'
                      : isOpen
                      ? 'bg-cyber-cyan/10 border-cyber-cyan shadow-neon-cyan'
                      : 'bg-cyber-bg/40 border-cyber-border hover:border-cyber-cyan/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-cyber-green/20' : 'bg-cyber-cyan/15'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-cyber-green" />
                      ) : (
                        <Mail className="w-5 h-5 text-cyber-cyan" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-mono text-cyber-muted">Сообщение {msg.id}</p>
                      <p className="text-sm font-semibold text-white truncate">{msg.title}</p>
                      <p className="text-xs text-cyber-muted truncate">{msg.sender}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Open message detail */}
        {openIdx !== null && (() => {
          const msg = PHISHING_MESSAGES.find((m) => m.id === openIdx)!;
          const sel = selected[msg.id] ?? new Set<SignKey>();
          const isDone = checked[msg.id];
          const minSelected = sel.size >= 3;

          return (
            <div className="glass-card p-5 sm:p-6 animate-slide-up">
              {/* Email mockup */}
              <div className="rounded-xl bg-cyber-bg/80 border border-cyber-border overflow-hidden mb-5">
                <div className="px-4 py-3 bg-cyber-surface/60 border-b border-cyber-border flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyber-muted" />
                  <span className="text-xs font-mono text-cyber-muted">{msg.date}</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex gap-2 text-sm">
                    <span className="text-cyber-muted shrink-0">От:</span>
                    <span className="text-cyber-amber font-mono break-all">{msg.sender}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="text-cyber-muted shrink-0">Тема:</span>
                    <span className="text-white font-semibold">{msg.subject}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="text-cyber-muted shrink-0">Ссылка:</span>
                    <span className="text-cyber-cyan font-mono break-all">{msg.link}</span>
                  </div>
                  <div className="pt-3 border-t border-cyber-border/50 text-gray-300 leading-relaxed">
                    {msg.body}
                  </div>
                </div>
              </div>

              {/* Sign selection */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-cyber-amber" />
                  <h3 className="font-display font-semibold uppercase tracking-wide text-cyber-amber">
                    Отметь признаки подделки
                  </h3>
                  <span className="ml-auto text-xs text-cyber-muted">
                    выбрано: {sel.size} {sel.size < 3 && '(минимум 3)'}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  {SIGNS.map((opt) => {
                    const isSelected = sel.has(opt.key);
                    const isCorrect = msg.correctSigns.includes(opt.key);
                    const showResult = isDone;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => toggleSign(msg.id, opt.key)}
                        disabled={isDone}
                        className={`text-left p-3 rounded-lg border text-sm flex items-start gap-3 transition-all ${
                          showResult
                            ? isSelected
                              ? isCorrect
                                ? 'bg-cyber-green/10 border-cyber-green/50 text-white'
                                : 'bg-cyber-red/10 border-cyber-red/50 text-white'
                              : isCorrect
                              ? 'bg-cyber-red/5 border-cyber-red/30 text-gray-400'
                              : 'bg-cyber-bg/40 border-cyber-border text-gray-400'
                            : isSelected
                            ? 'bg-cyber-cyan/15 border-cyber-cyan text-white'
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
                              isSelected ? 'bg-cyber-cyan border-cyber-cyan' : 'border-cyber-border'
                            }`}>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-cyber-bg" />}
                            </span>
                          )}
                        </span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Check button */}
              {!isDone && (
                <button
                  onClick={() => checkAnswer(msg.id)}
                  disabled={!minSelected}
                  className={`w-full py-3 rounded-lg font-display font-semibold uppercase tracking-wider transition-all ${
                    minSelected
                      ? 'cyber-btn-primary'
                      : 'bg-cyber-bg/40 border border-cyber-border text-cyber-muted cursor-not-allowed'
                  }`}
                >
                  Проверить ответ
                </button>
              )}

              {/* Result explanation */}
              {isDone && (
                <div className="mt-4 p-4 rounded-xl bg-cyber-teal/5 border border-cyber-teal/30 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-cyber-teal shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-cyber-teal mb-1">Разбор от детектива</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{msg.explanation}</p>
                      <p className="text-xs text-cyber-muted mt-2">
                        Правильные признаки: {msg.correctSigns.length}. Вы выбрали верно: {
                          msg.correctSigns.filter((k) => sel.has(k)).length
                        }.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nav to next message */}
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-cyber-border">
                <button
                  onClick={() => setOpenIdx(openIdx > 1 ? openIdx - 1 : PHISHING_MESSAGES.length)}
                  className="cyber-btn-ghost text-sm py-2 px-3 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-xs font-mono text-cyber-muted">{msg.id} / {PHISHING_MESSAGES.length}</span>
                <button
                  onClick={() => setOpenIdx(openIdx < PHISHING_MESSAGES.length ? openIdx + 1 : 1)}
                  className="cyber-btn-ghost text-sm py-2 px-3 flex items-center gap-1"
                >
                  Далее <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Finish section */}
        {allChecked && (
          <div className="glass-card p-5 mt-6 animate-slide-up border-cyber-green/40">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-6 h-6 text-cyber-green" />
              <h3 className="font-display font-semibold text-lg text-cyber-green">
                Все сообщения проверены!
              </h3>
            </div>
            <p className="text-cyber-muted text-sm mb-4">
              Ты заработал <span className="text-cyber-cyan font-bold">{earnedScore}</span> баллов на этой станции.
              Теперь откроется бонусное задание — создание надёжного пароля.
            </p>
            <button
              onClick={handleFinish}
              className="cyber-btn-primary w-full flex items-center justify-center gap-2"
            >
              Перейти к бонусному заданию <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!allChecked && (
          <div className="flex items-center gap-2 text-xs text-cyber-muted mt-4 justify-center">
            <AlertTriangle className="w-4 h-4" />
            Проверь все {PHISHING_MESSAGES.length} сообщений, чтобы завершить станцию
          </div>
        )}
      </div>
    </div>
  );
}
