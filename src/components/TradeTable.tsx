import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit2, TrendingUp, TrendingDown } from "lucide-react";
import { Trade, getPnL } from "@/lib/trades";

interface TradeTableProps {
  trades: Trade[];
  onDelete: (id: string) => void;
  onEdit: (trade: Trade) => void;
}

export default function TradeTable({ trades, onDelete, onEdit }: TradeTableProps) {
  const sorted = [...trades].sort((a, b) => b.exitDate.localeCompare(a.exitDate));

  if (trades.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-12 text-center">
        <Activity className="mx-auto mb-4 text-muted-foreground/30" size={48} />
        <p className="text-muted-foreground text-lg">No trades yet</p>
        <p className="text-muted-foreground/60 text-sm mt-1">Add your first trade to get started</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {['Date', 'Symbol', 'Side', 'Entry', 'Exit', 'Qty', 'Fees', 'P&L', 'Setup', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sorted.map((trade, i) => {
                const pnl = getPnL(trade);
                const isWin = pnl >= 0;
                return (
                  <motion.tr
                    key={trade.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/30 hover:bg-accent/50 transition-colors group"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{trade.exitDate}</td>
                    <td className="px-4 py-3 font-bold">{trade.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isWin ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss'}`}>
                        {trade.direction === 'LONG' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">${trade.entryPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono">${trade.exitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 font-mono">{trade.quantity}</td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">${trade.fees.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-mono font-bold ${isWin ? 'text-profit' : 'text-loss'}`}>
                      {isWin ? '+' : ''}{pnl.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{trade.setup}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(trade)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => onDelete(trade.id)} className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-loss transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

function Activity({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}
