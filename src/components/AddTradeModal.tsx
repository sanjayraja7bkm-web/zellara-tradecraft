import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Trade } from "@/lib/trades";

interface AddTradeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (trade: Omit<Trade, 'id'>) => void;
  editTrade?: Trade | null;
}

const defaultForm = {
  symbol: '', direction: 'LONG' as const, entryPrice: '', exitPrice: '', quantity: '', entryDate: new Date().toISOString().split('T')[0], exitDate: new Date().toISOString().split('T')[0], fees: '0', notes: '', tags: '', setup: '',
};

export default function AddTradeModal({ open, onClose, onSave, editTrade }: AddTradeModalProps) {
  const [form, setForm] = useState(() => editTrade ? {
    symbol: editTrade.symbol, direction: editTrade.direction, entryPrice: String(editTrade.entryPrice), exitPrice: String(editTrade.exitPrice), quantity: String(editTrade.quantity), entryDate: editTrade.entryDate, exitDate: editTrade.exitDate, fees: String(editTrade.fees), notes: editTrade.notes, tags: editTrade.tags.join(', '), setup: editTrade.setup,
  } : defaultForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      symbol: form.symbol.toUpperCase(),
      direction: form.direction,
      entryPrice: parseFloat(form.entryPrice) || 0,
      exitPrice: parseFloat(form.exitPrice) || 0,
      quantity: parseFloat(form.quantity) || 0,
      entryDate: form.entryDate,
      exitDate: form.exitDate,
      fees: parseFloat(form.fees) || 0,
      notes: form.notes,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      setup: form.setup,
    });
    setForm(defaultForm);
    onClose();
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-muted border border-border/50 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/40";
  const labelClass = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5";

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editTrade ? 'Edit Trade' : 'Add Trade'}</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Symbol</label>
                  <input className={inputClass} placeholder="AAPL" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} required />
                </div>
                <div>
                  <label className={labelClass}>Direction</label>
                  <div className="flex gap-2">
                    {(['LONG', 'SHORT'] as const).map(d => (
                      <button key={d} type="button" onClick={() => setForm(f => ({ ...f, direction: d }))}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${form.direction === d ? (d === 'LONG' ? 'bg-profit-subtle text-profit' : 'bg-loss-subtle text-loss') : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Entry Price</label><input type="number" step="any" className={inputClass} placeholder="0.00" value={form.entryPrice} onChange={e => setForm(f => ({ ...f, entryPrice: e.target.value }))} required /></div>
                <div><label className={labelClass}>Exit Price</label><input type="number" step="any" className={inputClass} placeholder="0.00" value={form.exitPrice} onChange={e => setForm(f => ({ ...f, exitPrice: e.target.value }))} required /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Quantity</label><input type="number" step="any" className={inputClass} placeholder="100" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required /></div>
                <div><label className={labelClass}>Fees</label><input type="number" step="any" className={inputClass} placeholder="0.00" value={form.fees} onChange={e => setForm(f => ({ ...f, fees: e.target.value }))} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Entry Date</label><input type="date" className={inputClass} value={form.entryDate} onChange={e => setForm(f => ({ ...f, entryDate: e.target.value }))} required /></div>
                <div><label className={labelClass}>Exit Date</label><input type="date" className={inputClass} value={form.exitDate} onChange={e => setForm(f => ({ ...f, exitDate: e.target.value }))} required /></div>
              </div>

              <div><label className={labelClass}>Setup</label><input className={inputClass} placeholder="Breakout, Reversal..." value={form.setup} onChange={e => setForm(f => ({ ...f, setup: e.target.value }))} /></div>
              <div><label className={labelClass}>Tags (comma separated)</label><input className={inputClass} placeholder="swing, tech, earnings" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
              <div><label className={labelClass}>Notes</label><textarea className={`${inputClass} resize-none h-20`} placeholder="Trade notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

              <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                <Plus size={18} />
                {editTrade ? 'Update Trade' : 'Add Trade'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
