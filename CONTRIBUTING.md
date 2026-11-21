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
- **About 15 elements at most** on the top view.

## Add or change a starter

1. Draw it in Draft Canvas, and add at least one **Flow** that walks through it. Use only the
   shape kinds Draft Canvas already has.
2. Save it as `<id>.draftcanvas` in `starters/<category>/<id>/`. Categories:
   - `architectures`: how a whole system is organised.
   - `data`: how data moves and is refined.
   - `patterns`: one recurring problem, drawn at its own scope.
   - `examples`: small worked examples.
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

## Checks

CI runs `npm run catalog:check` and the Draft Canvas check above against the app's `main`.
