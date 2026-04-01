import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Trade, getPnL } from "@/lib/trades";

interface CalendarHeatMapProps {
  trades: Trade[];
  onDayClick?: (date: string, trades: Trade[]) => void;
}

export default function CalendarHeatMap({ trades, onDayClick }: CalendarHeatMapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const dailyPnL = useMemo(() => {
    const map: Record<string, { pnl: number; trades: Trade[] }> = {};
    trades.forEach(t => {
      const date = t.exitDate;
      if (!map[date]) map[date] = { pnl: 0, trades: [] };
      map[date].pnl += getPnL(t);
      map[date].trades.push(t);
    });
    return map;
  }, [trades]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const maxAbsPnL = useMemo(() => {
    const values = Object.values(dailyPnL).map(d => Math.abs(d.pnl));
    return Math.max(...values, 1);
  }, [dailyPnL]);

  const getColor = (pnl: number) => {
    const intensity = Math.min(Math.abs(pnl) / maxAbsPnL, 1);
    if (pnl > 0) return `hsl(160, 84%, ${45 + (1 - intensity) * 40}%)`;
    if (pnl < 0) return `hsl(0, 72%, ${55 + (1 - intensity) * 35}%)`;
    return 'transparent';
  };

  const getBgOpacity = (pnl: number) => {
    const intensity = Math.min(Math.abs(pnl) / maxAbsPnL, 1);
    return 0.1 + intensity * 0.35;
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(selectedDay === dateStr ? null : dateStr);
    if (dailyPnL[dateStr] && onDayClick) onDayClick(dateStr, dailyPnL[dateStr].trades);
  };

  // Monthly totals
  const monthTrades = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return trades.filter(t => t.exitDate.startsWith(prefix));
  }, [trades, year, month]);

  const monthPnL = monthTrades.reduce((s, t) => s + getPnL(t), 0);
  const monthWins = monthTrades.filter(t => getPnL(t) > 0).length;
  const monthWinRate = monthTrades.length > 0 ? (monthWins / monthTrades.length) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Calendar</h3>
          <p className="text-lg font-bold mt-0.5">{monthName}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Month summary */}
          <div className="flex items-center gap-4 mr-4 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Trades</p>
              <p className="font-bold font-mono">{monthTrades.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">P&L</p>
              <p className={`font-bold font-mono ${monthPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {monthPnL >= 0 ? '+' : ''}${monthPnL.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Win Rate</p>
              <p className={`font-bold font-mono ${monthWinRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                {monthWinRate.toFixed(0)}%
              </p>
            </div>
          </div>
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><ChevronLeft size={18} /></button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dailyPnL[dateStr];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = dateStr === selectedDay;

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(dateStr)}
              className={`relative rounded-lg p-2 min-h-[72px] flex flex-col items-start transition-all border ${
                isSelected ? 'border-primary/60 ring-1 ring-primary/30' : 'border-transparent'
              } ${isToday ? 'ring-1 ring-muted-foreground/20' : ''} ${
                data ? 'cursor-pointer hover:brightness-110' : 'cursor-default'
              }`}
              style={{
                backgroundColor: data ? `${getColor(data.pnl)}` : 'hsl(var(--muted) / 0.3)',
                opacity: data ? 1 : 0.5,
                ...(data ? { backgroundColor: `hsla(${data.pnl >= 0 ? '160, 84%, 45%' : '0, 72%, 55%'}, ${getBgOpacity(data.pnl)})` } : {}),
              }}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{day}</span>
              {data && (
                <>
                  <span className={`text-xs font-bold font-mono mt-auto ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(0)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">{data.trades.length} trade{data.trades.length > 1 ? 's' : ''}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && dailyPnL[selectedDay] && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 border-t border-border/50 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{selectedDay} — {dailyPnL[selectedDay].trades.length} trades</h4>
          <div className="space-y-1.5">
            {dailyPnL[selectedDay].trades.map(t => {
              const pnl = getPnL(t);
              return (
                <div key={t.id} className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{t.symbol}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${t.direction === 'LONG' ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss'}`}>{t.direction}</span>
                    {t.setup && <span className="text-muted-foreground">{t.setup}</span>}
                  </div>
                  <span className={`font-mono font-bold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
