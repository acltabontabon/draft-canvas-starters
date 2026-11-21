# Starter tools

Every starter can be drawn by hand in Draft Canvas. These tools are another way: each starter has a
`spec.json` beside it, and the tools turn it into the `.draftcanvas` file and its pictures with Draft
Canvas's own layout, validation and renderer. Rebuilding an unchanged spec writes the same bytes.

They run from a Draft Canvas checkout beside this one, which they load the app from:

```bash
cd ../draft-canvas
npm ci
```

## Build a starter

```bash
npx tsx ../draft-canvas-starters/tools/build.ts ../draft-canvas-starters/starters/examples/food-delivery/spec.json
```

`build.ts` composes the spec with the app's `create_diagram` pipeline, applies the spec's layout
fields, reads the result back through the app's validator and writes `<folder>.draftcanvas` beside
the spec. It then holds every view to the gallery's check (`tests/starter-files.test.ts` in the
app): no overlapping shapes, no kink **Straighten connectors** would remove, every caption whole,
every flow step on a connector. A failure names the shapes and how far to move them:

```
✗ music-streaming: gate fails: kinks events(dx=0,dy=21)
```

It also prints the app's own advice and review (a queue with no dead-letter path, a store with two
owners). `--dump` lists every shape's box; `--verbose` adds the app's report on its own layout,
before the spec's placement. Pass several specs, or `starters/*/*/spec.json`, to build them all.

The file stays at format 28, which released apps open, unless it uses portals or held shapes,
which need 29.

## Draw the pictures

```bash
npx tsx ../draft-canvas-starters/tools/render.ts [id...]
npx tsx ../draft-canvas-starters/tools/render.ts --png /tmp/review --views food-delivery
```

Writes `preview.svg` and `preview-dark.svg` beside each starter, as the app's
`scripts/starters/render.ts` does. `--png <dir>` also saves PNGs to look at, and `--views` adds one
for every drill-down view (`<id>--<owner>.png`). Look at light, dark and every drill-down against
[LAYOUT.md](LAYOUT.md) before committing.

## Take a screenshot in the editor

```bash
npx tsx ../draft-canvas-starters/tools/screenshot.ts \
  ../draft-canvas-starters/starters/examples/food-delivery/food-delivery.draftcanvas food-delivery.png \
  --theme dark --size 1600x1100 --no-sequences
```

Opens the starter in the real editor and frames the diagram under the breadcrumb, at twice the
window size: for a README or a release note. `--no-sequences` frames the architecture only.

The browser tools use Playwright's Chromium from the app checkout; set `CHROMIUM_PATH` to use
another. Each starts its own dev server (ports 5396 and 5397; change them with `--port`).

## The spec

A spec is a `create_diagram` request, the same JSON an agent sends Draft Canvas: `title`, `level`,
`layout`, `nodes`, `relationships`, `groups`, `flows`, `notes` and `sequences`. Ask the app's MCP
server for `get_capabilities` with `tool: "create_diagram"` for every field. Then, applied in this
order after the app has laid it out:

| Field | What it does |
| --- | --- |
| `_openPoints` | Open points, as the file stores them: `{id, kind, context, targets: [{kind: "node" \| "edge", id}]}`. |
| `_clearRoutes` | `true` drops the layout's connector pins and bends, so connectors route from where the shapes end up. |
| `_patch` | `{nodes: {id: {...}}, edges: {id: {...}}}`: fields set on shapes and connectors in any view (`portal`, `held`, `cadence`, `sourceAnchor`, `waypoints`, `parentId`…). `null` removes a field; `dx`/`dy` move a shape. |
| `_centers` | `{id: [x, y]}`: top-view shapes placed by their centre, so shapes on one row or column are exactly level. |
| `_place` with `early: true` | Placements that boundaries should be fitted around (see below). |
| `_fitGroups` | `{}` or `{pad, header}`: every boundary refitted around what it holds, innermost first. Use `header: 80` when portal stubs sit near boundary headers. |
| `_alignRows`, `_alignCols` | Lists of boundary ids that share their top and bottom (rows) or left and right (columns) edges. |
| `_place` | `{id, of, side, gap, align, dx, dy, width, height, exclude}`: puts a label, card or sequence `above`, `below`, `left` or `right` of shapes (`of` is an id, a list of ids, or `"@all"`), aligned `start`, `center` or `end`. |
| `_ink` | Sketch strokes: `{shape: "ellipse" \| "underline", of, pad, tool: "pen" \| "highlighter", color, size}`. |

Ids are the starter's own and stay stable: agents and people refer to starter elements by id.
