# Contributing a starter

A good starter is small, generic and teaches one idea. It shows the shape of an architecture or
pattern, not a particular company's system.

## Add or change a starter

1. Draw it in Draft Canvas, and add at least one **Flow** that walks through it. Use generic names
   (`Capability A Service`, `Read Store`), and only the shape kinds Draft Canvas already has.
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
     "featured": false,
     "order": 100
   }
   ```

   `featured` starters appear on an empty canvas; keep that set to about five. `order` sorts
   starters within their category.
4. Write `README.md`: what it shows, when to use it, what to watch out for, and its flows.
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

Changing a starter changes its SHA-256, so apps that load the gallery show it as **Updated**.
Keep element ids readable (`api`, `queue`, `submit`) and stable across changes: agents refer to
starter elements by id.

## Checks

CI runs `npm run catalog:check` and the Draft Canvas check above against the app's `main`.
