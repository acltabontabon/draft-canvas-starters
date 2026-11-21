# Layout

How a starter is laid out, so the gallery reads as one set drawn by one careful architect.

The bar: a senior architect would put it in a design review or a talk unchanged.

## Composition
- One reading direction, left to right: people and client apps on the left, the edge/entry next,
  core services in the middle, each service's own store directly right of it (same row, straight
  horizontal line) or directly below it, external systems in one column at the far right (or one
  row at the bottom), async/data/analytics in a lane along the bottom.
- The main flow runs along one straight horizontal spine.
- Balanced whitespace: no empty quadrant, no shape stranded far from what it talks to. The top view
  (without the sequence) should be roughly 3:2 to 16:10, never a thin strip or a tall tower.

## Grid
- Every shape sits on a grid of columns and rows (use `_centers`). Use one column pitch and one row
  pitch per diagram (e.g. 340 and 200), sized so every caption fits.
- Connected shapes on the same row or column are exactly level, so their connectors are straight.
- Peers have the same size (same type and role).
- Every connector is straight or has one elbow. No U-turns, no long detours around the outside, no
  line squeezed between a shape and a boundary edge, no line through a boundary header.
- 0 crossings on the top view. A whole system may keep 1 if removing it costs more than it helps.
- Portals only for a connector that would otherwise cross the whole system (whole systems at most 3,
  small starters at most 1).

## Boundaries
- Draw a boundary only for something real: the system, a domain or bounded context, a deployment or
  a network zone, a transaction scope, or a group of client apps.
- Boundaries in the same row share their top and bottom edges (`_alignRows`); boundaries stacked in
  one column share their left and right edges (`_alignCols`).
- Gaps between sibling boundaries are equal (about 48–64) and never touching or overlapping.
- Equal inner padding (`_fitGroups`); use `{"header": 80}` when portal stubs sit near headers.

## Annotation
- Every starter has a title label (`# Name` + one plain line saying what it shows, `style.role:
  "title"`), placed above the content, left-aligned with the content's left edge.
- Styled cards (tables, checklists, callouts) align to the grid: top-aligned with a row or
  left-aligned with a column, next to what they explain. Never floating in leftover space.
- A handwritten callout sits beside what it annotates, with its ink stroke close to it.
- A sequence diagram sits below the architecture, left-aligned with it, gap ~120.
- Colour: small starters tint at most two boundaries; whole systems three or four. Shapes stay neutral.

## Drill-down views
- Render them (`tools/render.ts --png <dir> --views`) and hold them to the same bar.
  If one comes out bent or crossed, reorder its nodes/relationships so the main path leads, or
  split it; a component view with 5–9 parts reads best.

## Process
- Edit the spec, rebuild (`tools/build.ts`, `--dump` for boxes), render with `--png --views`, and look
  at light, dark and every drill-down until nothing on this list is off. Then re-read the starter's
  README and fix anything the change made untrue.
