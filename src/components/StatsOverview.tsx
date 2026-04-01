import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Target, Award, BarChart3 } from "lucide-react";
import { TradeStats } from "@/lib/trades";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  type?: 'profit' | 'loss' | 'neutral';
  delay?: number;
}

function StatCard({ label, value, icon, type = 'neutral', delay = 0 }: StatCardProps) {
  const colorClass = type === 'profit' ? 'text-profit' : type === 'loss' ? 'text-loss' : 'text-foreground';
  const glowClass = type === 'profit' ? 'glow-profit' : type === 'loss' ? 'glow-loss' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-card rounded-xl p-5 ${glowClass} hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-muted-foreground/60">{icon}</span>
      </div>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
    </motion.div>
  );
}

export default function StatsOverview({ stats }: { stats: TradeStats }) {
  const pnlType = stats.totalPnL >= 0 ? 'profit' : 'loss';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard label="Total P&L" value={`$${stats.totalPnL.toFixed(2)}`} icon={<TrendingUp size={18} />} type={pnlType} delay={0} />
      <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={<Target size={18} />} type={stats.winRate >= 50 ? 'profit' : 'loss'} delay={0.05} />
      <StatCard label="Total Trades" value={stats.totalTrades} icon={<Activity size={18} />} delay={0.1} />
      <StatCard label="Profit Factor" value={stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)} icon={<BarChart3 size={18} />} type={stats.profitFactor >= 1 ? 'profit' : 'loss'} delay={0.15} />
      <StatCard label="Avg Win" value={`$${stats.avgWin.toFixed(2)}`} icon={<TrendingUp size={18} />} type="profit" delay={0.2} />
      <StatCard label="Avg Loss" value={`-$${stats.avgLoss.toFixed(2)}`} icon={<TrendingDown size={18} />} type="loss" delay={0.25} />
    </div>
  );
}
