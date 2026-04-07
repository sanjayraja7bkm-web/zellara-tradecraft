

## Add Leverage & Forex/XAUUSD Lot Calculations to Position Sizer

### What Changes

**1. Add Instrument Type selector** (Stock / Forex / XAUUSD)
- Segmented toggle at the top alongside the Long/Short toggle
- Each instrument type changes how position size is calculated and displayed

**2. Add Leverage input field**
- New input in Trade Parameters section (default: 1x for stocks, 100x for forex)
- Leverage reduces required margin: `margin = totalValue / leverage`
- Show "Required Margin" in results

**3. Forex lot size calculation**
- Standard forex: 1 lot = 100,000 units of base currency
- `pipValue` based on pair type (JPY pairs = 0.01, others = 0.0001)
- `lotSize = dollarRisk / (slPips * pipValuePerLot)`
- Display result in **lots** (+ mini lots & micro lots breakdown)

**4. XAUUSD (Gold) specific calculation**
- 1 lot = 100 oz, pip = $0.01, so $1 move = $100/lot
- `lotSize = dollarRisk / (slPoints * 100)`
- Display in lots with point-based risk

**5. Updated results display**
- Stocks: show shares (current behavior) + required margin with leverage
- Forex: show lots / mini lots / micro lots + pip risk + margin
- XAUUSD: show lots + point risk + margin

### File Changes

**`src/components/PositionSizer.tsx`** — single file edit:
- Add `instrumentType` state: `'stock' | 'forex' | 'xauusd'`
- Add `leverage` state (string, default varies by instrument)
- Add instrument selector UI (segmented control matching existing style)
- Add leverage input field in the parameters card
- Refactor `calc` useMemo to branch by instrument type
- Update results section to show lots instead of shares for forex/gold, add margin display

