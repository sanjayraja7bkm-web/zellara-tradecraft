import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayClick = (dateStr: string) => {
    setSelectedDay(selectedDay === dateStr ? null : dateStr);
    if (dailyPnL[dateStr] && onDayClick) onDayClick(dateStr, dailyPnL[dateStr].trades);
  };

  const monthTrades = useMemo(() => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return trades.filter(t => t.exitDate.startsWith(prefix));
  }, [trades, year, month]);

  const monthPnL = monthTrades.reduce((s, t) => s + getPnL(t), 0);
  const monthWins = monthTrades.filter(t => getPnL(t) > 0).length;
  const monthWinRate = monthTrades.length > 0 ? (monthWins / monthTrades.length) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="surface-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Calendar</h3>
          <p className="text-xl font-semibold tracking-tight mt-1">{monthName}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-6 mr-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Trades</p>
              <p className="font-semibold font-mono mt-0.5">{monthTrades.length}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">P&L</p>
              <p className={`font-semibold font-mono mt-0.5 ${monthPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                {monthPnL >= 0 ? '+' : ''}${monthPnL.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Win Rate</p>
              <p className={`font-semibold font-mono mt-0.5 ${monthWinRate >= 50 ? 'text-profit' : 'text-loss'}`}>
                {monthWinRate.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"><ChevronLeft size={16} /></button>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted transition-colors duration-200 text-muted-foreground hover:text-foreground"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = dailyPnL[dateStr];
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isSelected = dateStr === selectedDay;

          const intensity = data ? Math.min(Math.abs(data.pnl) / maxAbsPnL, 1) : 0;
          const bgOpacity = data ? 0.06 + intensity * 0.18 : 0;

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleDayClick(dateStr)}
              className={`relative rounded-xl p-2.5 min-h-[76px] flex flex-col items-start transition-all duration-300 ${
                isSelected ? 'ring-2 ring-foreground/10' : ''
              } ${isToday ? 'ring-1 ring-foreground/10' : ''} ${
                data ? 'cursor-pointer' : 'cursor-default'
              }`}
              style={{
                backgroundColor: data
                  ? `hsla(${data.pnl >= 0 ? '152, 60%, 40%' : '0, 60%, 52%'}, ${bgOpacity})`
                  : 'hsl(var(--muted) / 0.4)',
              }}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{day}</span>
              {data && (
                <>
                  <span className={`text-xs font-semibold font-mono mt-auto ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {data.pnl >= 0 ? '+' : ''}{data.pnl.toFixed(0)}
                  </span>
                  <span className="text-[9px] text-muted-foreground/70">{data.trades.length} trade{data.trades.length > 1 ? 's' : ''}</span>
                </>
              )}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay && dailyPnL[selectedDay] && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ ease: [0.16, 1, 0.3, 1] }} className="mt-5 border-t border-border pt-5 overflow-hidden">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-3">{selectedDay}</h4>
            <div className="space-y-2">
              {dailyPnL[selectedDay].trades.map(t => {
                const pnl = getPnL(t);
                return (
                  <div key={t.id} className="flex items-center justify-between text-xs surface-inset px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{t.symbol}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.direction === 'LONG' ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss'}`}>{t.direction}</span>
                      {t.setup && <span className="text-muted-foreground">{t.setup}</span>}
                    </div>
                    <span className={`font-mono font-semibold ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
