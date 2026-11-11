# Draft Canvas starters

Ready-made architecture diagrams for [Draft Canvas](https://github.com/acltabontabon/draft-canvas).
Each starter is an ordinary `.draftcanvas` file: open it, change anything, and it's yours.

Draft Canvas lists these under **Starters**, but only after you choose to load them. Loading
reads this repository from GitHub; nothing about your own diagrams is sent. When a starter here
changes, the app marks it **Updated** the next time you refresh. Diagrams you already made from
it stay as they are.

## Gallery

<!-- gallery:start -->

### Architectures

| Starter | Shows |
| --- | --- |
| [Monolith](starters/architectures/monolith/) | One application, built and deployed as a unit |
| [Modular Monolith](starters/architectures/modular-monolith/) | One deployable, explicitly encapsulated modules inside |
| [Microservices](starters/architectures/microservices/) | Independently deployed services, each owning its data |
| [Event-Driven](starters/architectures/event-driven/) | Pub/sub: a topic fanning out to per-subscriber queues |
| [Hexagonal](starters/architectures/hexagonal/) | Adapters around a core that owns its ports |
| [Backend for Frontend](starters/architectures/bff/) | A backend per frontend, over shared capabilities |
| [CQRS](starters/architectures/cqrs/) | Distinct command and query paths, async read projection |

### Data architectures

| Starter | Shows |
| --- | --- |
| [Medallion](starters/data/medallion/) | Refine raw data into validated, business-ready datasets |
| [Kappa](starters/data/kappa/) | Process live and historical data through one durable stream |
| [Change Data Capture](starters/data/cdc/) | Capture committed changes once, fan out to derived views |

### Patterns

| Starter | Shows |
| --- | --- |
| [Saga – Orchestration](starters/patterns/saga-orchestration/) | Local transactions and compensation, one coordinator |
| [Saga – Choreography](starters/patterns/saga-choreography/) | Local transactions chained by events, with no coordinator |
| [Transactional Outbox](starters/patterns/transactional-outbox/) | Persist state and event intent atomically, publish after |

### Examples

| Starter | Shows |
| --- | --- |
| [Order processing](starters/examples/order-processing/) | Follow an order from the API through a queue to storage |

<!-- gallery:end -->

## Using a starter without the app's gallery

Download any `.draftcanvas` file and open it in Draft Canvas (**Import** on the web, **Open** on
desktop), or drop it on the canvas.

## How this repository is organised

```
catalog.json              generated index the app reads first (do not edit by hand)
catalog.schema.json       its shape
starters/
  architectures/<id>/     how a whole system is organised
  data/<id>/              how data moves and is refined
  patterns/<id>/          one recurring design problem, at its own scope
  examples/<id>/          small worked examples
    <id>.draftcanvas      the diagram
    starter.json          name, summary, search words, order
    README.md             what it shows, when to use it, what to watch out for
    preview.svg           light picture, drawn by Draft Canvas
    preview-dark.svg      dark picture
scripts/catalog.mjs       builds catalog.json and the table above
```

A folder is one starter, so adding one never touches another. The app finds files only through
`catalog.json`, which records each file's SHA-256: an app that already has a copy downloads a
starter again only when it changed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Starters are licensed under [Apache-2.0](LICENSE), like
Draft Canvas.
