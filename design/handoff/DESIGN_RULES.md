# Investment Cockpit — chosen design system: 14c (in Design System Options.dc.html)

Terminal-dense "Gunmetal Ember", cold-steel greys, light headline cards. Supersedes the brief's "Polar Night".

- Ground #000000. Panel #060A0F, raised #111821, border #202A36. Ink #EAF0F7, ink2 #B8C4D3, muted #8693A6.
- Brand Ember orange #E8590C (index numbers, active, signature line, primary button; on-brand text #FFFFFF). Model-source tint #FF9A5C.
- Semantic (dark): up #22C55E, down #EF4444, watch #FFB84D, link #3B82F6.
- Light headline cards (posture, quotes): bg #E8ECF1, ink #0A0F16, ink2 #2E3947, muted #536071, border #C5CEDA, raised #D3DBE5, header strip #DAE0E8, index #A93D08, up #0A7A42, down #C01E2D, watch #855600, link #1C5BA8.
- Type: Barlow Condensed 700 italic uppercase for display/council names; IBM Plex Mono for ALL UI text and figures.
- Shape: radius 0 everywhere. Panels padding 10px 12px with a raised header strip (uppercase, .08em tracking, mono index).
- Elements (from 9b): tick-bar gauges (90×10, 2px gaps), 5-step posture selector (Defensive · Cautious · Neutral · Leaning in · Aggressive), stripe state tags (3px left bar), 52-week range rails on data cells, command line under ticker (no blinking cursor).
- Motion (8a): panels rise 10px/480ms cubic-bezier(0.23,1,0.32,1) staggered 55ms; gauges/steps reveal; ticker 70s marquee pauses on hover; value flashes green/red; reduced-motion = final state.
- No amber-on-black terminal look, no F-key bar.

## Open layout (approved, see Council Home Open.dc.html — supersedes "everything in a panel")
- Fewer boxes. Default section = no bg/border; header row = mono index (orange) + uppercase label, then a 1px #EAF0F7 rule under it. Rows split by 1px #202A36 hairlines. Columns separated by 40px gaps; page padding 28px 32px.
- Keep boxes only where they earn it: light headline cards (posture), charts, tags, buttons, inputs, tooltips, form steps. Quotes: 2px orange left rule, no card.
- Big section titles may use Barlow (e.g. "The council" 40px).
- Nav: active tab = filled #111821 block (inset 0 0 0 200px), no orange underline (avoid double line with the 2px signature line). Same for sub-tabs directly under the signature line.
- Plots: line on black, faint top-down fade, 2 faint gridlines, events as orange dots with short labels (no full-height dashed lines). Regime strip = grey labeled segments (G↑ I↓ …), current one orange; never green/red for regimes. Add "You are here" 2×2 map where regime matters. Label plots "ILLUSTRATIVE SHAPE — NOT DATA" until real data.
- Tooltips: dotted orange underline, #111821 box with 2px orange top, on hover + focus.
- Artboard labels: light text on black chip.
