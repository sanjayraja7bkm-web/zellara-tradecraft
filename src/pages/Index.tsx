import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Plus, Download, Upload, BarChart3, BookOpen, Activity, CalendarDays, Sun, Moon } from "lucide-react";
import { Trade, getTrades, saveTrades, addTrade, deleteTrade, updateTrade, calculateStats, exportTradesToCSV, importTradesFromCSV } from "@/lib/trades";
import StatsOverview from "@/components/StatsOverview";
import TradeTable from "@/components/TradeTable";
import EquityCurve from "@/components/EquityCurve";
import AddTradeModal from "@/components/AddTradeModal";
import CalendarHeatMap from "@/components/CalendarHeatMap";
import TradeFilters, { TradeFilterState, defaultFilters, applyFilters } from "@/components/TradeFilters";
import { toast } from "sonner";

type Tab = 'dashboard' | 'journal' | 'analytics' | 'calendar';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </button>
  );
}

export default function Index() {
  const [trades, setTrades] = useState<Trade[]>(getTrades);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = calculateStats(trades);
  const refresh = useCallback(() => setTrades(getTrades()), []);

  const handleAdd = (trade: Omit<Trade, 'id'>) => {
    if (editTrade) { updateTrade(editTrade.id, trade); toast.success('Trade updated'); }
    else { addTrade(trade); toast.success('Trade added'); }
    setEditTrade(null);
    refresh();
  };

  const handleDelete = (id: string) => { deleteTrade(id); toast.success('Trade deleted'); refresh(); };
  const handleEdit = (trade: Trade) => { setEditTrade(trade); setModalOpen(true); };

  const handleExport = () => {
    const csv = exportTradesToCSV(trades);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `trades-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Trades exported');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imported = importTradesFromCSV(ev.target?.result as string);
      saveTrades([...getTrades(), ...imported]);
      refresh();
      toast.success(`Imported ${imported.length} trades`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={15} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={15} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={15} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={15} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <Activity size={13} className="text-background" />
            </div>
            <h1 className="text-[15px] font-semibold tracking-tight">TradeVault</h1>
          </div>

          <nav className="flex items-center gap-0.5 bg-muted/60 rounded-xl p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-300 ${
                  tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
              <Upload size={14} /> Import
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200">
              <Download size={14} /> Export
            </button>
            <button onClick={() => { setEditTrade(null); setModalOpen(true); }} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity duration-200">
              <Plus size={15} /> New Trade
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <StatsOverview stats={stats} />
              <EquityCurve trades={trades} />
              <div>
                <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-3">Recent Trades</h2>
                <TradeTable trades={trades.slice(-10)} onDelete={handleDelete} onEdit={handleEdit} />
              </div>
            </div>
          )}
          {tab === 'journal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">All Trades · {trades.length}</h2>
              </div>
              <TradeTable trades={trades} onDelete={handleDelete} onEdit={handleEdit} />
            </div>
          )}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <StatsOverview stats={stats} />
              <EquityCurve trades={trades} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Largest Win', value: `$${stats.largestWin.toFixed(2)}`, type: 'profit' as const },
                  { label: 'Largest Loss', value: `$${stats.largestLoss.toFixed(2)}`, type: 'loss' as const },
                  { label: 'Win Streak', value: stats.winStreak, type: 'profit' as const },
                  { label: 'Lose Streak', value: stats.loseStreak, type: 'loss' as const },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.04, ease: [0.16, 1, 0.3, 1] }} className="surface-card p-5">
                    <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2">{s.label}</p>
                    <p className={`text-2xl font-semibold font-mono tracking-tight ${s.type === 'profit' ? 'text-profit' : 'text-loss'}`}>{s.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          {tab === 'calendar' && (
            <CalendarHeatMap trades={trades} />
          )}
        </motion.div>
      </main>

      <AddTradeModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTrade(null); }} onSave={handleAdd} editTrade={editTrade} />
    </div>
  );
}
