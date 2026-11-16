import { useMemo, useState } from 'react';
import { KeyRound, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

interface Props {
  onComplete: (score: number, earned: boolean) => void;
  onBack: () => void;
  existingScore: number | null;
}

const MAX_BONUS = 20;

interface StrengthResult {
  level: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  trackColor: string;
  tips: string[];
  metCriteria: boolean[];
}

function evaluatePassword(pw: string): StrengthResult & { score: number } {
  const criteria = [
    { check: pw.length >= 12, label: 'Длина не менее 12 символов' },
    { check: /[A-ZА-Я]/.test(pw), label: 'Заглавные буквы' },
    { check: /[a-zа-я]/.test(pw), label: 'Строчные буквы' },
    { check: /[0-9]/.test(pw), label: 'Цифры' },
    { check: /[^A-Za-zА-Яа-я0-9]/.test(pw), label: 'Специальные символы' },
  ];

  const metCount = criteria.filter((c) => c.check).length;
  const tips = criteria.filter((c) => !c.check).map((c) => c.label);

  let level: StrengthResult['level'] = 0;
  let score = 0;

  if (pw.length === 0) {
    level = 0;
  } else if (metCount <= 1) {
    level = 1;
  } else if (metCount === 2) {
    level = 2;
  } else if (metCount === 3) {
    level = 3;
  } else if (metCount === 4) {
    level = 4;
  } else {
    level = 5;
  }

  // bonus for length beyond 12
  const lengthBonus = pw.length >= 16 ? 1 : 0;
  const rawScore = (metCount + lengthBonus) * 4;
  score = Math.min(MAX_BONUS, rawScore);

  const labels = ['—', 'Очень слабый', 'Слабый', 'Средний', 'Надёжный', 'Очень надёжный'];
  const colors = ['text-gray-500', 'text-cyber-red', 'text-cyber-amber', 'text-cyber-amber', 'text-cyber-teal', 'text-cyber-green'];
  const trackColors = ['bg-gray-700', 'bg-cyber-red', 'bg-cyber-red', 'bg-cyber-amber', 'bg-cyber-teal', 'bg-cyber-green'];

  return {
    level,
    label: labels[level],
    color: colors[level],
    trackColor: trackColors[level],
    tips,
    metCriteria: criteria.map((c) => c.check),
    score,
  };
}

export function PasswordStation({ onComplete, onBack, existingScore }: Props) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(existingScore !== null && existingScore > 0);

  const result = useMemo(() => evaluatePassword(password), [password]);
  const isReliable = result.level >= 4;

  function handleClaim() {
    if (claimed || !isReliable) return;
    setClaimed(true);
    onComplete(result.score, true);
  }

  function handleSkip() {
    onComplete(existingScore ?? 0, false);
  }

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="cyber-btn-ghost mb-5 inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <ChevronLeft className="w-4 h-4" /> Назад к меню
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-cyber-purple/15 border border-cyber-purple/40 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-cyber-purple" />
          </div>
          <div>
            <span className="text-xs font-mono text-cyber-muted">Бонусное задание</span>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-cyber-purple neon-text-purple">
              Создай надёжный пароль
            </h1>
          </div>
        </div>
        <p className="text-cyber-muted mb-6">
          Придумай пароль и проверь его надёжность. Проверка выполняется только
          в твоём браузере — пароль никуда не отправляется и не сохраняется.
        </p>

        <div className="glass-card p-6">
          {/* Privacy note */}
          <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
            <ShieldCheck className="w-4 h-4 text-cyber-green shrink-0" />
            <span className="text-xs text-cyber-green">
              Локальная проверка. Пароль не покидает ваш браузер.
            </span>
          </div>

          {/* Password input */}
          <label className="block text-sm font-medium text-cyber-muted mb-2">Введите пароль</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Например: K!ber_Sh13ld#2026"
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-cyber-bg/60 border border-cyber-border rounded-lg pl-11 pr-12 py-3 text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-cyber-purple/30 focus:border-cyber-purple transition-all"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-cyan transition-colors"
              aria-label="Показать пароль"
            >
              {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Strength meter */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-cyber-muted">Надёжность:</span>
              <span className={`text-sm font-display font-bold ${result.color}`}>
                {result.label}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i <= result.level ? result.trackColor : 'bg-cyber-border/40'
                  } ${i <= result.level ? 'shadow-sm' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Criteria checklist */}
          <div className="mt-5 space-y-2">
            {[
              'Длина не менее 12 символов',
              'Заглавные буквы',
              'Строчные буквы',
              'Цифры',
              'Специальные символы',
            ].map((label, i) => {
              const met = result.metCriteria[i];
              return (
                <div key={label} className="flex items-center gap-2 text-sm">
                  {met ? (
                    <CheckCircle2 className="w-4 h-4 text-cyber-green" />
                  ) : (
                    <XCircle className="w-4 h-4 text-cyber-muted" />
                  )}
                  <span className={met ? 'text-cyber-green' : 'text-gray-400'}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          {result.tips.length > 0 && password.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-cyber-amber/5 border border-cyber-amber/20">
              <p className="text-xs font-semibold text-cyber-amber mb-1">Рекомендации по улучшению:</p>
              <ul className="text-xs text-gray-400 list-disc list-inside space-y-0.5">
                {result.tips.map((t) => (
                  <li key={t}>Добавить: {t}</li>
                ))}
                {password.length < 16 && <li>Используй 16+ символов для максимальной надёжности</li>}
              </ul>
            </div>
          )}

          {/* Bonus score */}
          <div className="mt-5 p-4 rounded-xl bg-cyber-bg/60 border border-cyber-border flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-cyber-muted">Бонусные баллы</p>
              <p className="text-2xl font-black font-display text-cyber-purple neon-text-purple">
                {isReliable && !claimed ? `+${result.score}` : claimed ? `+${existingScore ?? result.score}` : '0'}
              </p>
            </div>
            {claimed ? (
              <span className="flex items-center gap-2 text-cyber-green text-sm">
                <CheckCircle2 className="w-5 h-5" /> Зачтено
              </span>
            ) : isReliable ? (
              <button onClick={handleClaim} className="cyber-btn-purple text-sm py-2">
                Получить баллы
              </button>
            ) : (
              <span className="text-xs text-cyber-muted">Достигни уровня «Надёжный»</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleSkip} className="cyber-btn-ghost flex-1">
            {claimed ? 'Готово' : 'Пропустить'}
          </button>
          <button
            onClick={() => onComplete(claimed ? (existingScore ?? 0) : 0, claimed)}
            className="cyber-btn-primary flex-1 flex items-center justify-center gap-2"
          >
            К результатам <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
