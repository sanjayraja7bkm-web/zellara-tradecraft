import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Download, Upload, BarChart3, BookOpen, Activity, CalendarDays } from "lucide-react";
import { Trade, getTrades, saveTrades, addTrade, deleteTrade, updateTrade, calculateStats, exportTradesToCSV, importTradesFromCSV } from "@/lib/trades";
import StatsOverview from "@/components/StatsOverview";
import TradeTable from "@/components/TradeTable";
import EquityCurve from "@/components/EquityCurve";
import AddTradeModal from "@/components/AddTradeModal";
import CalendarHeatMap from "@/components/CalendarHeatMap";
import { toast } from "sonner";

type Tab = 'dashboard' | 'journal' | 'analytics' | 'calendar';

export default function Index() {
  const [trades, setTrades] = useState<Trade[]>(getTrades);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = calculateStats(trades);

  const refresh = useCallback(() => setTrades(getTrades()), []);

  const handleAdd = (trade: Omit<Trade, 'id'>) => {
    if (editTrade) {
      updateTrade(editTrade.id, trade);
      toast.success('Trade updated');
    } else {
      addTrade(trade);
      toast.success('Trade added');
    }
    setEditTrade(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteTrade(id);
    toast.success('Trade deleted');
    refresh();
  };

  const handleEdit = (trade: Trade) => {
    setEditTrade(trade);
    setModalOpen(true);
  };

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
      const existing = getTrades();
      saveTrades([...existing, ...imported]);
      refresh();
      toast.success(`Imported ${imported.length} trades`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity size={16} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity size={16} className="text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TradeVault</h1>
          </div>

          <nav className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Upload size={14} /> Import
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Download size={14} /> Export
            </button>
            <button onClick={() => { setEditTrade(null); setModalOpen(true); }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all">
              <Plus size={16} /> Add Trade
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <StatsOverview stats={stats} />
              <EquityCurve trades={trades} />
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Recent Trades</h2>
                <TradeTable trades={trades.slice(-10)} onDelete={handleDelete} onEdit={handleEdit} />
              </div>
            </div>
          )}
          {tab === 'journal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Trades ({trades.length})</h2>
              </div>
              <TradeTable trades={trades} onDelete={handleDelete} onEdit={handleEdit} />
            </div>
          )}
          {tab === 'analytics' && (
            <div className="space-y-6">
              <StatsOverview stats={stats} />
              <EquityCurve trades={trades} />
              {/* Extended stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Largest Win', value: `$${stats.largestWin.toFixed(2)}`, type: 'profit' as const },
                  { label: 'Largest Loss', value: `$${stats.largestLoss.toFixed(2)}`, type: 'loss' as const },
                  { label: 'Win Streak', value: stats.winStreak, type: 'profit' as const },
                  { label: 'Lose Streak', value: stats.loseStreak, type: 'loss' as const },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }} className="glass-card rounded-xl p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-xl font-bold font-mono ${s.type === 'profit' ? 'text-profit' : 'text-loss'}`}>{s.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <AddTradeModal open={modalOpen} onClose={() => { setModalOpen(false); setEditTrade(null); }} onSave={handleAdd} editTrade={editTrade} />
    </div>
  );
}
