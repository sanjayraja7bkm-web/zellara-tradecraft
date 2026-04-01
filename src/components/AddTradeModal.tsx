import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check } from "lucide-react";
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

  const inputClass = "w-full px-4 py-3 rounded-xl bg-muted/60 border border-border/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all duration-200 placeholder:text-muted-foreground/40 font-mono";
  const labelClass = "block text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground mb-2";

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/10 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="surface-elevated p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-xl font-semibold tracking-tight">{editTrade ? 'Edit Trade' : 'New Trade'}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors duration-200 text-muted-foreground"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          form.direction === d
                            ? (d === 'LONG' ? 'bg-profit-subtle text-profit ring-1 ring-profit/20' : 'bg-loss-subtle text-loss ring-1 ring-loss/20')
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}>
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
              <div><label className={labelClass}>Tags</label><input className={inputClass} placeholder="swing, tech, earnings" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} /></div>
              <div><label className={labelClass}>Notes</label><textarea className={`${inputClass} resize-none h-20 font-sans`} placeholder="Trade notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

              <button type="submit" className="w-full py-3.5 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2">
                {editTrade ? <Check size={16} /> : <Plus size={16} />}
                {editTrade ? 'Save Changes' : 'Add Trade'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
