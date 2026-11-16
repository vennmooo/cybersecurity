import { useRef } from 'react';
import {
  Award, Trophy, Download, Printer, RotateCcw, ChevronLeft,
  CheckCircle2, ShieldCheck, Calendar, Building2, RotateCw,
} from 'lucide-react';
import type { ParticipantData } from '@/types';
import { MAX_SCORE, computeStatus } from '@/data/quest';

interface Props {
  participant: ParticipantData;
  totalScore: number;
  phishingCorrect: number;
  passwordBonus: boolean;
  onBackToMenu: () => void;
  onRestart: () => void;
}

export function ResultsPage({
  participant,
  totalScore,
  phishingCorrect,
  passwordBonus,
  onBackToMenu,
  onRestart,
}: Props) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((totalScore / MAX_SCORE) * 100);
  const status = computeStatus(percentage);
  const passed = percentage >= 60;

  // Circular progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  function handlePrint() {
    window.print();
  }

  function handleSavePDF() {
    // Use browser print dialog which allows "Save as PDF"
    window.print();
  }

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBackToMenu}
          className="cyber-btn-ghost mb-5 inline-flex items-center gap-2 text-sm py-2 px-4 print:hidden"
        >
          <ChevronLeft className="w-4 h-4" /> Назад к меню
        </button>

        {/* Celebration header */}
        <div className="text-center mb-8 print:hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl bg-cyber-cyan/10 border border-cyber-cyan/40 shadow-neon-cyan animate-float">
            <Trophy className="w-11 h-11 text-cyber-amber" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-cyber-cyan neon-text-cyan">
            Поздравляем!
          </h1>
          <p className="mt-2 text-xl font-display font-bold text-cyber-teal neon-text-teal">
            Ты стал цифровым детективом!
          </p>
        </div>

        {/* Certificate / result card */}
        <div
          ref={certificateRef}
          className="glass-card p-6 sm:p-8 relative overflow-hidden print:shadow-none print:border-cyber-cyan/40"
        >
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-12 h-12 border-t-2 border-l-2 border-cyber-cyan/50 rounded-tl-xl" />
          <div className="absolute top-3 right-3 w-12 h-12 border-t-2 border-r-2 border-cyber-cyan/50 rounded-tr-xl" />
          <div className="absolute bottom-3 left-3 w-12 h-12 border-b-2 border-l-2 border-cyber-cyan/50 rounded-bl-xl" />
          <div className="absolute bottom-3 right-3 w-12 h-12 border-b-2 border-r-2 border-cyber-cyan/50 rounded-br-xl" />

          <div className="text-center mb-6">
            <Award className="w-12 h-12 text-cyber-amber mx-auto mb-2" />
            <h2 className="text-xl sm:text-2xl font-display font-bold uppercase tracking-wide text-cyber-cyan">
              Сертификат участника
            </h2>
            <p className="text-xs text-cyber-muted mt-1">Квест «Кибербезопасность: стань цифровым детективом»</p>
          </div>

          {/* Circular progress */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100" cy="100" r={radius}
                  fill="none" stroke="#1a3a6b" strokeWidth="12"
                />
                <circle
                  cx="100" cy="100" r={radius}
                  fill="none"
                  stroke={passed ? '#14e8c8' : '#f59e0b'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out', filter: 'drop-shadow(0 0 8px currentColor)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-display text-cyber-cyan neon-text-cyan">
                  {percentage}%
                </span>
                <span className="text-sm text-cyber-muted">результат</span>
              </div>
            </div>
          </div>

          {/* Participant details */}
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            <DetailRow icon={Calendar} label="Дата прохождения" value={participant.questDate} />
            <DetailRow icon={Building2} label="Образовательное учреждение" value={participant.institution} />
          </div>

          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <StatBox label="Набрано" value={totalScore} accent="text-cyber-cyan" />
            <StatBox label="Максимум" value={MAX_SCORE} accent="text-cyber-muted" />
            <StatBox label="Статус" value={status} accent={passed ? 'text-cyber-green' : 'text-cyber-amber'} small />
          </div>

          {/* Breakdown */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-bg/40 border border-cyber-border">
              <span className="text-sm text-gray-300">Фишинг-детектив: правильных сообщений</span>
              <span className="font-mono text-cyber-cyan">{phishingCorrect} / 5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyber-bg/40 border border-cyber-border">
              <span className="text-sm text-gray-300">Бонус: надёжный пароль</span>
              <span className={`font-mono ${passwordBonus ? 'text-cyber-green' : 'text-cyber-muted'}`}>
                {passwordBonus ? 'выполнено' : 'не выполнено'}
              </span>
            </div>
          </div>

          {/* Status badge */}
          <div className={`text-center p-4 rounded-xl border ${
            passed ? 'bg-cyber-green/10 border-cyber-green/40' : 'bg-cyber-amber/10 border-cyber-amber/40'
          }`}>
            <div className="flex items-center justify-center gap-2">
              {passed ? (
                <CheckCircle2 className="w-5 h-5 text-cyber-green" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-cyber-amber" />
              )}
              <span className={`font-display font-bold uppercase tracking-wide ${
                passed ? 'text-cyber-green' : 'text-cyber-amber'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {passed
                ? 'Квест пройден успешно. Ты умеешь распознавать интернет-угрозы!'
                : 'Ты на верном пути. Повтори материалы и попробуй снова!'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid sm:grid-cols-2 gap-3 mt-6 print:hidden">
          <button onClick={handleSavePDF} className="cyber-btn-primary flex items-center justify-center gap-2">
            <Download className="w-5 h-5" /> Сохранить в PDF
          </button>
          <button onClick={handlePrint} className="cyber-btn-purple flex items-center justify-center gap-2">
            <Printer className="w-5 h-5" /> Распечатать сертификат
          </button>
          <button onClick={onBackToMenu} className="cyber-btn-ghost flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" /> Вернуться к заданиям
          </button>
          <button onClick={onRestart} className="cyber-btn-ghost flex items-center justify-center gap-2">
            <RotateCw className="w-5 h-5" /> Новый участник
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-cyber-bg/40 border border-cyber-border">
      <Icon className="w-4 h-4 text-cyber-muted shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-cyber-muted">{label}</p>
        <p className="text-sm text-white truncate">{value}</p>
      </div>
    </div>
  );
}

function StatBox({
  label, value, accent, small,
}: { label: string; value: string | number; accent: string; small?: boolean }) {
  return (
    <div className="p-3 rounded-lg bg-cyber-bg/40 border border-cyber-border text-center">
      <p className="text-xs text-cyber-muted uppercase tracking-wide">{label}</p>
      <p className={`font-display font-bold ${small ? 'text-base' : 'text-2xl'} ${accent}`}>{value}</p>
    </div>
  );
}
