# Contributing a starter

A good starter teaches one idea through a believable example. It shows the shape of an
architecture or pattern in a realistic, fictional system: a clinic booking appointments, a bank
moving money, a lakehouse refining ride data. Not a real company's system, and not boxes named
`Service A`.

## What a starter carries

- **Real names and technologies.** Elements are named as people say them (`Orders API`,
  `fulfilment` queue) and each has one `technology` (`Spring Boot 3`, `PostgreSQL 16`, `Kafka`) so
  its logo shows, and a one-sentence description.
- **The details that make the idea concrete**: replicas where instances matter, a reply on the
  main calls, conditions on branches, cadence on data connectors, `deadLetters` with its attempts,
  linked compensating actions in a saga.
- **Flows**: the main path, and a variant for the failure or alternative path the pattern exists
  for. Every step plays a connector (the check below refuses steps that only spotlight shapes).
- **A few notes** (3–6): a decision, a risk, an open question, a short code snippet such as an
  event payload. Attach each to what it is about.
- **Depth where it teaches something**: one drill-down view inside the container whose internals
  are the point (the modules of a modular monolith, the ports of a hexagonal core).
- **About 15 elements at most** on the top view of an architecture, data or pattern starter. A whole
  system in `examples` can hold more, grouped into domain boundaries.

## Add or change a starter

Every starter here is also built from a `spec.json` beside it, with Draft Canvas's own layout and
checks: see [tools/README.md](tools/README.md), and [tools/LAYOUT.md](tools/LAYOUT.md) for how a
starter is laid out. To change one, edit its spec and rebuild, or draw in Draft Canvas and update
the spec to match, so the next rebuild keeps your change.

1. Draw it in Draft Canvas, or write its `spec.json`, and add at least one **Flow** that walks
   through it. Use only the shape kinds Draft Canvas already has.
2. Save it as `<id>.draftcanvas` in `starters/<category>/<id>/`. Categories:
   - `architectures`: how a whole system is organised.
   - `data`: how data moves and is refined.
   - `patterns`: one recurring problem, drawn at its own scope.
   - `examples`: whole systems and worked examples.
3. Add `starter.json` beside it:

   ```json
   {
     "id": "my-starter",
     "name": "My Starter",
     "category": "pattern",
     "summary": "One line, under 120 characters, about what it shows",
     "aliases": ["other names people search for"],
     "tags": ["topic words"],
     "useWhen": ["When this starter fits, one line each (up to 4)"],
     "watchOutFor": ["Its trade-offs, one line each (up to 4)"],
     "featured": false,
     "order": 100
   }
   ```

   `featured` starters appear on an empty canvas; keep that set to about five. `order` sorts
   starters within their category.
4. Write `README.md`: what it shows, when to use it, what to watch out for, and its flows. The
   app shows `useWhen` and `watchOutFor` from `starter.json` beside the preview.
5. Draw the pictures and check the starter against the app (needs a Draft Canvas checkout beside
   this one):

   ```bash
   cd ../draft-canvas
   npx tsx scripts/starters/render.ts --repo ../draft-canvas-starters
   STARTERS_DIR=../draft-canvas-starters npx vitest run tests/starter-files.test.ts
   ```

   The check fails on overlapping shapes, connector kinks that **Straighten connectors** would
   remove, captions that don't fit, and flow steps that name a missing connector.
6. Run `npm run catalog` and commit everything, `catalog.json` included.

Keep each file at the oldest format version that can hold it, so released apps open it. Format 29
adds only portals and held shapes: a file saved by a newer build that uses neither can say
`"version": 28`. The catalog records each file's `formatVersion`, and an older app shows a newer
file as needing an update.

Changing a starter changes its SHA-256, so apps that load the gallery show it as **Updated**.
Keep element ids readable (`api`, `queue`, `submit`) and stable across changes: agents refer to
starter elements by id.

## Add or change a style pack

A style pack is a style and a drawing for every kind of shape. It changes how a diagram looks and
nothing about what it means, so the first rule is that each drawing still reads as the thing it
stands for: a queue is something things pass through, a data store something that holds them.

- **Original artwork only.** No names, characters, logos or marks that belong to a game, a film, a
  company or anyone else. A pack can be set in a kind of world (pirates, fantasy, a night city); it
  cannot be a particular one. `pack.json` says who drew it and what it may be used under.
- **Every kind of shape.** Each service, data store, queue, actor, component and artifact kind and
  the junction has a drawing, or the pack says on purpose that it keeps the app's own. The check
  below fails a pack with a gap, and fails every pack when Draft Canvas gains a kind.
- **One object per kind.** A cache and a SQL database are different things from the pack's world
  (a powder keg and a ledger, a potion and a tome), told apart by their outline alone. One
  container with a different small mark inside for each kind does not read on a diagram.
- **Bold and simple.** A drawing is shown about 60 pixels across. A few shapes and a heavy line
  read; fine detail does not.
- **Follow the diagram's colours.** Paint a part in one of the app's light-theme colours and it
  follows the diagram: the shape's own fill, line, name or accent colour (so it follows a recolour
  and the pack's palette), or one of the seven named colours. `tools/styles/kit.ts` has them as
  `F`, `L`, `T`, `C`, `K` and `A(colour, role)`. Any other colour is kept as it is, everywhere.
- **Illustrate, in a few tones.** A drawing is a little object with volume, not an outline: a
  base tone, a shade (a part painted in the line colour at low opacity), a highlight on the lit
  edge, and a spot colour or two from the pack's own short palette. Light comes from the top left
  in every drawing. Most of each drawing still follows the shape's colour, so a recolour shows.
- **A backdrop, if the world has one.** `art/backdrop.svg` is one tile, repeated on the canvas
  behind the diagram, a unit to a canvas pixel. It must join itself on all four sides, avoid an
  obvious beat when it repeats, and stay quiet: every shape, name and label on top of it has to
  read. A pack with both a light and a dark scheme paints it in the diagram's text colour at low
  opacity, so it follows the theme.
- **Leave room for the name.** The plain Service, the API, the plain Component and the junction
  have their name inside and are stretched to whatever size the shape is: draw a frame with a calm
  middle and ornament only at its edges, not a picture. Keep the API's bottom-right corner clear
  for its tag. Everything else is a picture with its name beneath.

A drawing is an SVG file, `styles/<id>/art/<type>--<kind>.svg` (`database--cache.svg`,
`service--load-balancer.svg`, `ellipse.svg` for the junction, `backdrop.svg` for the canvas), drawn in any editor. Only shapes and
their fills and strokes are kept: text, images, gradients, filters, style sheets and anything that
refers outside the file are left out, and the build fails on a drawing that has them.
`style.json` holds the rest of the style: its hand, line weight, corners, connectors and colours,
as a Draft Canvas style without `shapes[...].art` or `assets`.

The packs here are drawn by `tools/styles/packs/<id>.ts`, which writes their `art/` and
`style.json`; change the definition, not the files it writes. A pack drawn by hand has no
definition, and its files are the source.

Build and check (needs a Draft Canvas checkout beside this one):

```bash
cd ../draft-canvas
npx tsx ../draft-canvas-starters/tools/styles/build.ts            # or one pack: build.ts cute
STARTERS_DIR=../draft-canvas-starters npx vitest run tests/style-packs.test.ts
```

The build writes `<id>.draftstyle`, `preview.svg`, `preview-dark.svg` and `sheet.svg`. Look at
`sheet.svg`: every kind should be told from its neighbours at a glance. Then run `npm run catalog`
and commit everything.

## Checks

CI runs `npm run catalog:check`, and against the app's `main` the starter check and the style pack
check above, and `tools/styles/build.ts --check`, which fails when a pack was not rebuilt.
