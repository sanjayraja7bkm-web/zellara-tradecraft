import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { Trade, getPnL, getCumulativePnL, calculateStats } from "@/lib/trades";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-lg px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color }}>
          {p.name}: ${Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export default function EquityCurve({ trades }: { trades: Trade[] }) {
  const data = getCumulativePnL(trades);
  const stats = calculateStats(trades);

  const dailyPnL = trades
    .sort((a, b) => a.exitDate.localeCompare(b.exitDate))
    .map(t => ({ date: t.exitDate, pnl: getPnL(t), symbol: t.symbol }));

  const setupStats = trades.reduce((acc, t) => {
    const setup = t.setup || 'Other';
    if (!acc[setup]) acc[setup] = { wins: 0, losses: 0, pnl: 0 };
    const pnl = getPnL(t);
    if (pnl >= 0) acc[setup].wins++; else acc[setup].losses++;
    acc[setup].pnl += pnl;
    return acc;
  }, {} as Record<string, { wins: number; losses: number; pnl: number }>);

  const pieData = [
    { name: 'Wins', value: Math.round(stats.winRate), fill: 'hsl(160, 84%, 45%)' },
    { name: 'Losses', value: Math.round(100 - stats.winRate), fill: 'hsl(0, 72%, 55%)' },
  ];

  if (trades.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(160, 84%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cumulative" name="Cumulative P&L" stroke="hsl(160, 84%, 45%)" fill="url(#profitGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-5 flex flex-col items-center justify-center">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Win / Loss</h3>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex gap-4 text-xs mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-profit" /> Wins {stats.winRate.toFixed(0)}%</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-loss" /> Losses {(100 - stats.winRate).toFixed(0)}%</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Daily P&L</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyPnL}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
              {dailyPnL.map((d, i) => <Cell key={i} fill={d.pnl >= 0 ? 'hsl(160, 84%, 45%)' : 'hsl(0, 72%, 55%)'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Setup Performance</h3>
        <div className="space-y-3">
          {Object.entries(setupStats).map(([setup, data]) => {
            const total = data.wins + data.losses;
            const wr = (data.wins / total) * 100;
            return (
              <div key={setup} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{setup}</span>
                  <span className={`font-mono ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>${data.pnl.toFixed(0)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-profit transition-all" style={{ width: `${wr}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground">{data.wins}W / {data.losses}L ({wr.toFixed(0)}%)</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
