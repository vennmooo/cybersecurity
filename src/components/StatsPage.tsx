import { useEffect, useState, useMemo } from 'react';
import {
  BarChart3, Users, Trophy, TrendingUp, Award, ChevronLeft,
  Download, RefreshCw, Search, ShieldCheck, KeyRound, Percent,
  Building2, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { MAX_SCORE } from '@/data/quest';

interface ResultRow {
  id: string;
  participant_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  status: string;
  phishing_correct: number;
  password_bonus: boolean;
  created_at: string;
  full_name: string;
  institution: string;
  group_class: string;
  team: string | null;
  quest_date: string;
}

type SortKey = 'institution' | 'total_score' | 'percentage' | 'quest_date';
type SortDir = 'asc' | 'desc';

export function StatsPage({ onBack }: { onBack: () => void }) {
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total_score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [institutionFilter, setInstitutionFilter] = useState<string>('');

  async function loadData() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('quest_results')
      .select(`
        id, participant_id, total_score, max_score, percentage, status,
        phishing_correct, password_bonus, created_at,
        participants!inner ( institution, quest_date )
      `)
      .order('created_at', { ascending: false });

    if (err) {
      setError('Не удалось загрузить данные. Проверьте подключение к базе.');
      setLoading(false);
      return;
    }

    const mapped: ResultRow[] = (data ?? []).map((r: any) => ({
      id: r.id,
      participant_id: r.participant_id,
      total_score: r.total_score,
      max_score: r.max_score,
      percentage: r.percentage,
      status: r.status,
      phishing_correct: r.phishing_correct,
      password_bonus: r.password_bonus,
      created_at: r.created_at,
      full_name: r.participants?.full_name ?? null,
      institution: r.participants?.institution ?? '—',
      group_class: r.participants?.group_class ?? null,
      team: r.participants?.team ?? null,
      quest_date: r.participants?.quest_date ?? '—',
    }));

    setRows(mapped);
    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const institutions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.institution))).sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    let list = rows;
    if (institutionFilter) list = list.filter((r) => r.institution === institutionFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.institution.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'total_score' || sortKey === 'percentage') {
        cmp = (a[sortKey] as number) - (b[sortKey] as number);
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), 'ru');
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [rows, search, institutionFilter, sortKey, sortDir]);

  const stats = useMemo(() => {
    if (rows.length === 0) {
      return { total: 0, avg: 0, max: 0, min: 0, passed: 0, phishingAvg: 0, passwordCount: 0, bestInstitution: '—' };
    }
    const total = rows.length;
    const scores = rows.map((r) => r.total_score);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const passed = rows.filter((r) => r.percentage >= 60).length;
    const phishingAvg = (rows.reduce((a, r) => a + r.phishing_correct, 0) / total).toFixed(1);
    const passwordCount = rows.filter((r) => r.password_bonus).length;
    const best = rows.find((r) => r.total_score === max);
    return { total, avg, max, min, passed, phishingAvg, passwordCount, bestInstitution: best?.institution ?? '—' };
  }, [rows]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'total_score' || key === 'percentage' ? 'desc' : 'asc');
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-cyber-cyan" /> : <ArrowDown className="w-3 h-3 text-cyber-cyan" />;
  }

  function exportCSV() {
    const headers = [
      'Образовательное учреждение', 'Дата прохождения',
      'Баллы', 'Максимум', 'Процент', 'Статус', 'Фишинг (правильных)', 'Бонус-пароль',
    ];
    const lines = filtered.map((r) =>
      [
        r.institution, r.quest_date,
        r.total_score, r.max_score, `${r.percentage}%`, r.status,
        `${r.phishing_correct}/5`, r.password_bonus ? 'да' : 'нет',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(';'),
    );
    const csv = '\uFEFF' + [headers.map((h) => `"${h}"`).join(';'), ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyber_quest_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="cyber-btn-ghost mb-5 inline-flex items-center gap-2 text-sm py-2 px-4"
        >
          <ChevronLeft className="w-4 h-4" /> На главную
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyber-purple/15 border border-cyber-purple/40 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-cyber-purple" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase text-cyber-purple neon-text-purple">
                Статистика организатора
              </h1>
              <p className="text-sm text-cyber-muted">Сводные данные по всем участникам квеста</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void loadData()} className="cyber-btn-ghost text-sm py-2 px-3 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
            </button>
            <button onClick={exportCSV} className="cyber-btn-primary text-sm py-2 px-3 flex items-center gap-2" disabled={rows.length === 0}>
              <Download className="w-4 h-4" /> Экспорт CSV
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard icon={Users} label="Участников" value={stats.total} color="cyan" />
          <SummaryCard icon={Trophy} label="Средний балл" value={stats.avg} color="teal" />
          <SummaryCard icon={Award} label="Лучший результат" value={stats.max} color="amber" />
          <SummaryCard icon={ShieldCheck} label="Прошли (≥60%)" value={stats.passed} color="green" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <SummaryCard icon={Percent} label="Средний %" value={`${rows.length ? Math.round(rows.reduce((a, r) => a + r.percentage, 0) / rows.length) : 0}%`} color="cyan" />
          <SummaryCard icon={TrendingUp} label="Минимальный балл" value={stats.min} color="red" />
          <SummaryCard icon={ShieldCheck} label="Фишинг (ср.)" value={`${stats.phishingAvg}/5`} color="teal" />
          <SummaryCard icon={KeyRound} label="Пароль-бонус" value={stats.passwordCount} color="purple" />
        </div>

        {/* Best participant */}
        {rows.length > 0 && (
          <div className="glass-card p-4 mb-6 flex items-center gap-4 border-cyber-amber/30">
            <Trophy className="w-8 h-8 text-cyber-amber shrink-0" />
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-cyber-muted">Лучший результат</p>
              <p className="font-display font-bold text-white truncate">{stats.bestInstitution}</p>
            </div>
            <span className="ml-auto text-2xl font-black font-display text-cyber-amber neon-text-cyan">
              {stats.max}
            </span>
          </div>
        )}

        {/* Filters */}
        {rows.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по учреждению..."
                className="w-full bg-cyber-bg/60 border border-cyber-border rounded-lg pl-11 pr-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/20 transition-all"
              />
            </div>
            <div className="relative sm:w-64">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-muted" />
              <select
                value={institutionFilter}
                onChange={(e) => setInstitutionFilter(e.target.value)}
                className="w-full bg-cyber-bg/60 border border-cyber-border rounded-lg pl-11 pr-4 py-2.5 text-gray-100 focus:outline-none focus:border-cyber-cyan focus:ring-2 focus:ring-cyber-cyan/20 transition-all appearance-none cursor-pointer"
              >
                <option value="">Все заведения</option>
                {institutions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-5 text-center border-cyber-red/40">
            <p className="text-cyber-red text-sm">{error}</p>
            <button onClick={() => void loadData()} className="cyber-btn-ghost mt-3 text-sm py-2 px-4">
              Попробовать снова
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="glass-card p-10 text-center">
            <RefreshCw className="w-8 h-8 text-cyber-cyan mx-auto animate-spin mb-3" />
            <p className="text-cyber-muted">Загрузка данных...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && rows.length === 0 && (
          <div className="glass-card p-10 text-center">
            <Users className="w-10 h-10 text-cyber-muted mx-auto mb-3" />
            <p className="text-cyber-muted">Пока нет данных участников.</p>
            <p className="text-sm text-gray-500 mt-1">Заполните квест, чтобы увидеть результаты здесь.</p>
          </div>
        )}

        {/* Results table */}
        {!loading && !error && filtered.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyber-border bg-cyber-surface/40">
                    <th className="text-left px-4 py-3 font-display uppercase tracking-wide text-cyber-muted">
                      <button onClick={() => toggleSort('institution')} className="flex items-center gap-1 hover:text-cyber-cyan transition-colors">
                        Заведение {sortIcon('institution')}
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 font-display uppercase tracking-wide text-cyber-muted">
                      <button onClick={() => toggleSort('total_score')} className="flex items-center gap-1 mx-auto hover:text-cyber-cyan transition-colors">
                        Баллы {sortIcon('total_score')}
                      </button>
                    </th>
                    <th className="text-center px-4 py-3 font-display uppercase tracking-wide text-cyber-muted">
                      <button onClick={() => toggleSort('percentage')} className="flex items-center gap-1 mx-auto hover:text-cyber-cyan transition-colors">
                        % {sortIcon('percentage')}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 font-display uppercase tracking-wide text-cyber-muted hidden lg:table-cell">Статус</th>
                    <th className="text-center px-4 py-3 font-display uppercase tracking-wide text-cyber-muted hidden lg:table-cell">Фишинг</th>
                    <th className="text-center px-4 py-3 font-display uppercase tracking-wide text-cyber-muted hidden xl:table-cell">Пароль</th>
                    <th className="text-left px-4 py-3 font-display uppercase tracking-wide text-cyber-muted hidden xl:table-cell">
                      <button onClick={() => toggleSort('quest_date')} className="flex items-center gap-1 hover:text-cyber-cyan transition-colors">
                        Дата {sortIcon('quest_date')}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b border-cyber-border/40 hover:bg-cyber-cyan/5 transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{r.institution}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-cyber-cyan">{r.total_score}</span>
                        <span className="text-cyber-muted text-xs">/{MAX_SCORE}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono font-bold ${
                          r.percentage >= 85 ? 'text-cyber-green' :
                          r.percentage >= 60 ? 'text-cyber-teal' :
                          r.percentage >= 40 ? 'text-cyber-amber' : 'text-cyber-red'
                        }`}>
                          {r.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300 font-mono hidden lg:table-cell">{r.phishing_correct}/5</td>
                      <td className="px-4 py-3 text-center hidden xl:table-cell">
                        {r.password_bonus ? (
                          <span className="text-cyber-green text-xs">✓ да</span>
                        ) : (
                          <span className="text-cyber-muted text-xs">— нет</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono hidden xl:table-cell">{r.quest_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-cyber-border text-xs text-cyber-muted flex justify-between">
              <span>Показано: {filtered.length} из {rows.length}</span>
              <span>Обновлено: {new Date().toLocaleTimeString('ru')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, color,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/10',
    teal: 'text-cyber-teal border-cyber-teal/30 bg-cyber-teal/10',
    amber: 'text-cyber-amber border-cyber-amber/30 bg-cyber-amber/10',
    green: 'text-cyber-green border-cyber-green/30 bg-cyber-green/10',
    red: 'text-cyber-red border-cyber-red/30 bg-cyber-red/10',
    purple: 'text-cyber-purple border-cyber-purple/30 bg-cyber-purple/10',
  };
  return (
    <div className={`glass-card p-4 border ${colorMap[color]}`}>
      <Icon className={`w-5 h-5 mb-2 ${colorMap[color].split(' ')[0]}`} />
      <p className="text-xs uppercase tracking-wide text-cyber-muted">{label}</p>
      <p className={`text-2xl font-black font-display ${colorMap[color].split(' ')[0]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Цифровой детектив': 'bg-cyber-green/15 border-cyber-green/40 text-cyber-green',
    'Стажёр детектива': 'bg-cyber-teal/15 border-cyber-teal/40 text-cyber-teal',
    'Новичок': 'bg-cyber-amber/15 border-cyber-amber/40 text-cyber-amber',
    'Нужна подготовка': 'bg-cyber-red/15 border-cyber-red/40 text-cyber-red',
  };
  const cls = map[status] ?? 'bg-cyber-border/30 border-cyber-border text-gray-400';
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{status}</span>
  );
}
