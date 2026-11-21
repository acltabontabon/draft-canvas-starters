# Draft Canvas starters

Ready-made architecture diagrams for [Draft Canvas](https://github.com/acltabontabon/draft-canvas).
Each starter is an ordinary `.draftcanvas` file: open it, change anything, and it's yours.

Every starter is a worked example in a realistic, fictional system: named services with their
technologies, a main flow and its failure path to present, notes on the decisions and risks, and a
drill-down view where the internals are the point. Rename the parts and keep the shape.

Two whole systems show everything Draft Canvas can draw on one canvas: a
[video streaming platform](starters/examples/video-streaming/) and a
[music streaming service](starters/examples/music-streaming/). Each has nested boundaries,
junctions, styled text, sketch ink, portals, native sequence diagrams, drill-down views, and a
flow for each journey through it.

Draft Canvas lists these under **Starters**, but only after you choose to load them. Loading
reads this repository from GitHub; nothing about your own diagrams is sent. When a starter here
changes, the app marks it **Updated** the next time you refresh. Diagrams you already made from
it stay as they are.

## Gallery

<!-- gallery:start -->

### Architectures

| Starter | Shows |
| --- | --- |
| [Monolith](starters/architectures/monolith/) | A clinic's booking site, staff screens and API in one Django app, deployed as one unit behind NGINX |
| [Modular Monolith](starters/architectures/modular-monolith/) | A course platform as one Spring Boot deployable with Catalog, Enrollment, Billing and Notifications modules |
| [Microservices](starters/architectures/microservices/) | A food-delivery platform: services behind Kong, each owning its data, talking by gRPC and Kafka events |
| [Event-Driven](starters/architectures/event-driven/) | One event, many reactions: a topic fans out to a queue per subscriber, with a dead-letter queue for failures |
| [Hexagonal](starters/architectures/hexagonal/) | A bank's transfers core owns its ports; REST, a job, JPA, Kafka and a fraud vendor plug in as adapters |
| [Backend for Frontend](starters/architectures/bff/) | Web, mobile and TV each get a backend shaped for their screens, over shared platform APIs |
| [CQRS](starters/architectures/cqrs/) | A bank's payments write events on one side; projections build balances and searchable history on the other |

### Data architectures

| Starter | Shows |
| --- | --- |
| [Medallion](starters/data/medallion/) | A ride-hailing lakehouse refines raw trips into Bronze, Silver and Gold, and quarantines bad rows |
| [Kappa](starters/data/kappa/) | Card fraud scoring from one durable log: live scoring, and a full replay to rebuild with new rules |
| [Change Data Capture](starters/data/cdc/) | A marketplace streams committed listing changes from PostgreSQL to search, cache and warehouse |

### Patterns

| Starter | Shows |
| --- | --- |
| [Saga – Orchestration](starters/patterns/saga-orchestration/) | One orchestrator books a trip step by step, and cancels the done steps in reverse when the card is declined |
| [Saga – Choreography](starters/patterns/saga-choreography/) | A food order moves through payment and kitchen by events alone, and unwinds by events when a restaurant says no |
| [Transactional Outbox](starters/patterns/transactional-outbox/) | A bank transfer and its event commit in one transaction; Debezium publishes it after, and consumers drop duplicates |

### Examples

| Starter | Shows |
| --- | --- |
| [Video streaming platform](starters/examples/video-streaming/) | A whole streaming service: devices, edge, playback, discovery, data and an ISP-hosted video edge |
| [Music streaming service](starters/examples/music-streaming/) | A whole music service: playback from a CDN, an AI DJ, weekly mixes, royalties and artist releases |
| [Order processing](starters/examples/order-processing/) | A shop takes the payment, queues fulfilment, and parks orders the warehouse keeps refusing |

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
