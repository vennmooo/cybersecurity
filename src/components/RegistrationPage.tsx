import { useState } from 'react';
import { ShieldCheck, Lock, Building2, Calendar, ChevronRight, AlertCircle, BarChart3 } from 'lucide-react';
import type { ParticipantData } from '@/types';

interface Props {
  onSubmit: (data: ParticipantData) => void;
  onShowStats: () => void;
}

export function RegistrationPage({ onSubmit, onShowStats }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<ParticipantData>({
    fullName: '',
    institution: '',
    groupClass: '',
    team: '',
    questDate: today,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.institution.trim().length < 3) e.institution = 'Введите название организации (минимум 3 символа)';
    if (!form.questDate) e.questDate = 'Выберите дату';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    onSubmit(form);
  }

  const fieldClass = (key: string) =>
    `w-full bg-cyber-bg/60 border rounded-lg px-4 py-3 pl-11 text-gray-100 placeholder-gray-500 transition-all focus:outline-none focus:ring-2 ${
      errors[key]
        ? 'border-cyber-red focus:ring-cyber-red/30'
        : 'border-cyber-border focus:border-cyber-cyan focus:ring-cyber-cyan/30'
    }`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-xl">
        {/* Hero header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-5 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/40 shadow-neon-cyan animate-float">
            <ShieldCheck className="w-11 h-11 text-cyber-cyan" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-cyber-cyan neon-text-cyan leading-tight">
            Кибербезопасность
          </h1>
          <p className="mt-2 text-xl sm:text-2xl font-display font-bold text-cyber-teal neon-text-teal">
            Стань цифровым детективом!
          </p>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto leading-relaxed">
            Пройди испытания, научись распознавать интернет-угрозы, проверь свои навыки
            цифровой безопасности и набери максимальное количество баллов!
          </p>
        </div>

        {/* Registration card */}
        <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 shadow-card animate-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-cyber-border">
            <Lock className="w-5 h-5 text-cyber-teal" />
            <h2 className="text-lg font-display font-semibold uppercase tracking-wide text-cyber-teal">
              Регистрация участника
            </h2>
          </div>

          <div className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1.5">
                Дата прохождения
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
                <input
                  type="date"
                  value={form.questDate}
                  onChange={(e) => setForm({ ...form, questDate: e.target.value })}
                  className={fieldClass('questDate')}
                />
              </div>
              {errors.questDate && (
                <p className="mt-1.5 text-sm text-cyber-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.questDate}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-cyber-muted mb-1.5">
                Образовательное учреждение (организация) <span className="text-cyber-red">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
                <input
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="Колледж информационных технологий"
                  className={fieldClass('institution')}
                />
              </div>
              {errors.institution && (
                <p className="mt-1.5 text-sm text-cyber-red flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.institution}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="cyber-btn-primary w-full mt-7 flex items-center justify-center gap-2 text-lg"
          >
            Начать квест
            <ChevronRight className="w-5 h-5" />
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Нажимая «Начать квест», вы соглашаетесь на обработку данных участника
            в образовательных целях.
          </p>
        </form>

        {/* Organizer access */}
        <div className="text-center mt-5">
          <button
            onClick={onShowStats}
            className="text-sm text-cyber-muted hover:text-cyber-purple transition-colors inline-flex items-center gap-1.5"
          >
            <BarChart3 className="w-4 h-4" />
            Панель организатора
          </button>
        </div>
      </div>
    </div>
  );
}
