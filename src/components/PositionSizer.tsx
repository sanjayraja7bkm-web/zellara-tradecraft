import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Target, DollarSign, Hash, TrendingUp, Shield } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type Direction = 'long' | 'short';

function AnimatedValue({ value, prefix = '', suffix = '', className = '' }: { value: number; prefix?: string; suffix?: string; className?: string }) {
  return (
    <motion.span
      key={value.toFixed(2)}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {prefix}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}
    </motion.span>
  );
}

export default function PositionSizer() {
  const [accountSize, setAccountSize] = useState<string>('10000');
  const [riskPercent, setRiskPercent] = useState<string>('1');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [direction, setDirection] = useState<Direction>('long');
  const isMobile = useIsMobile();

  const calc = useMemo(() => {
    const acc = parseFloat(accountSize) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const entry = parseFloat(entryPrice) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;

    const riskPerShare = Math.abs(entry - sl);
    const dollarRisk = acc * (risk / 100);
    const positionSize = riskPerShare > 0 ? Math.floor(dollarRisk / riskPerShare) : 0;
    const totalValue = positionSize * entry;

    let rr = 0;
    if (tp > 0 && riskPerShare > 0) {
      const reward = direction === 'long' ? tp - entry : entry - tp;
      rr = reward / riskPerShare;
    }

    const potentialProfit = tp > 0 ? positionSize * Math.abs(tp - entry) : 0;

    return { riskPerShare, dollarRisk, positionSize, totalValue, rr, potentialProfit, isValid: entry > 0 && sl > 0 && riskPerShare > 0 };
  }, [accountSize, riskPercent, entryPrice, stopLoss, takeProfit, direction]);

  const inputClass = "w-full bg-transparent text-foreground text-base md:text-sm font-mono placeholder:text-muted-foreground/40 focus:outline-none";

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Position Sizer</h2>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Calculate optimal position size based on risk</p>
        </div>
        {/* Direction toggle */}
        <div className="flex items-center gap-0.5 bg-muted/60 rounded-xl p-1">
          <button
            onClick={() => setDirection('long')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              direction === 'long' ? 'bg-background text-profit shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowUpRight size={13} /> Long
          </button>
          <button
            onClick={() => setDirection('short')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              direction === 'short' ? 'bg-background text-loss shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowDownRight size={13} /> Short
          </button>
        </div>
      </div>

      <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 md:gap-6`}>
        {/* Inputs */}
        <div className="space-y-3">
          <div className="surface-card p-4 md:p-5 space-y-4">
            <h3 className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-3">Trade Parameters</h3>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-medium">Account Size</label>
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <DollarSign size={14} className="text-muted-foreground/50" />
                <input
                  type="number"
                  value={accountSize}
                  onChange={e => setAccountSize(e.target.value)}
                  placeholder="10,000"
                  className={inputClass}
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-medium">Risk Percentage</label>
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Shield size={14} className="text-muted-foreground/50" />
                <input
                  type="number"
                  value={riskPercent}
                  onChange={e => setRiskPercent(e.target.value)}
                  placeholder="1"
                  className={inputClass}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-xs text-muted-foreground/50">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-medium">Entry Price</label>
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <TrendingUp size={14} className="text-muted-foreground/50" />
                <input
                  type="number"
                  value={entryPrice}
                  onChange={e => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-medium">Stop Loss</label>
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <ArrowDownRight size={14} className="text-loss/50" />
                <input
                  type="number"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-medium">Take Profit <span className="text-muted-foreground/40">(optional)</span></label>
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Target size={14} className="text-profit/50" />
                <input
                  type="number"
                  value={takeProfit}
                  onChange={e => setTakeProfit(e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {calc.isValid ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3"
              >
                {/* Primary result */}
                <div className="surface-card p-5 md:p-6 text-center">
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2">Position Size</p>
                  <div className="flex items-center justify-center gap-2">
                    <Hash size={20} className="text-muted-foreground/40" />
                    <AnimatedValue value={calc.positionSize} className="text-3xl md:text-4xl font-semibold font-mono tracking-tight text-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-1.5">shares / units</p>
                </div>

                {/* Secondary results grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="surface-card p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Dollar Risk</p>
                    <AnimatedValue value={calc.dollarRisk} prefix="$" className="text-lg font-semibold font-mono tracking-tight text-loss" />
                  </div>
                  <div className="surface-card p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Risk / Share</p>
                    <AnimatedValue value={calc.riskPerShare} prefix="$" className="text-lg font-semibold font-mono tracking-tight text-foreground" />
                  </div>
                  <div className="surface-card p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Total Value</p>
                    <AnimatedValue value={calc.totalValue} prefix="$" className="text-lg font-semibold font-mono tracking-tight text-foreground" />
                  </div>
                  {calc.rr > 0 ? (
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Risk : Reward</p>
                      <AnimatedValue value={calc.rr} suffix="R" className={`text-lg font-semibold font-mono tracking-tight ${calc.rr >= 1 ? 'text-profit' : 'text-loss'}`} />
                    </div>
                  ) : (
                    <div className="surface-card p-4">
                      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Risk : Reward</p>
                      <span className="text-lg font-semibold font-mono tracking-tight text-muted-foreground/40">—</span>
                    </div>
                  )}
                </div>

                {calc.potentialProfit > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="surface-card p-4 flex items-center justify-between"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Potential Profit</p>
                    <AnimatedValue value={calc.potentialProfit} prefix="+$" className="text-lg font-semibold font-mono tracking-tight text-profit" />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="surface-card p-8 md:p-12 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
                  <Target size={20} className="text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground/60">Enter entry price and stop loss to calculate position size</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
