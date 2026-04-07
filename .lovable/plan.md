

## Position Sizing Calculator

### What We're Building
A new "Tools" tab (or adding to an existing tab) with a built-in position sizing calculator. The user enters account size, risk percentage, entry price, and stop loss -- the calculator instantly shows position size (shares/units), dollar risk, and potential reward targets.

### Plan

**1. Create `src/components/PositionSizer.tsx`**
- Clean card-based UI with 4 input fields: Account Size, Risk %, Entry Price, Stop Loss
- Real-time calculation (no submit button needed) showing:
  - **Risk per share** = |Entry - Stop Loss|
  - **Dollar risk** = Account Size x Risk%
  - **Position size** = Dollar Risk / Risk per share
  - **Total position value** = Position Size x Entry Price
- Optional: direction toggle (Long/Short) and take-profit field to show R:R preview
- Smooth number animations using framer-motion
- Apple-inspired minimal styling matching existing `surface-card` pattern

**2. Add a "Tools" tab to `src/pages/Index.tsx`**
- New tab with a wrench/calculator icon alongside Dashboard, Journal, Analytics, Calendar
- Update the `Tab` type and `tabs` array
- Render `PositionSizer` inside the tools tab content
- Update mobile bottom nav to include the new tab

### Design Notes
- All calculations are instant (onChange), no form submission
- Input validation: prevent negative values, zero stop loss distance
- Results animate in smoothly with motion transitions
- Responsive: stacks vertically on mobile, 2-column grid on desktop

