# Draft Canvas starters

Ready-made architecture diagrams for [Draft Canvas](https://github.com/acltabontabon/draft-canvas).
Each starter is an ordinary `.draftcanvas` file: open it, change anything, and it's yours.

Every starter is a worked example in a realistic, fictional system: named services with their
technologies, a main flow and its failure path to present, notes on the decisions and risks, and a
drill-down view where the internals are the point. Rename the parts and keep the shape.

Four whole systems show everything Draft Canvas can draw on one canvas: a
[video streaming platform](starters/examples/video-streaming/), a
[music streaming service](starters/examples/music-streaming/), a
[ride-hailing platform](starters/examples/ride-hailing/) and a
[food delivery marketplace](starters/examples/food-delivery/). Each has nested boundaries, a
junction, styled text, sketch ink, portals, a native sequence diagram, drill-down views, and a flow
for each journey through it.

Draft Canvas lists these under **Starters**, but only after you choose to load them. Loading
reads this repository from GitHub; nothing about your own diagrams is sent. When a starter here
changes, the app marks it **Updated** the next time you refresh. Diagrams you already made from
it stay as they are.

## Gallery

<!-- gallery:start -->

### Whole systems and examples

<table>
<tr>
<td width="100%" valign="top">
<a href="starters/examples/video-streaming/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/examples/video-streaming/preview-dark.svg">
  <img width="100%" alt="Video streaming platform starter" src="starters/examples/video-streaming/preview.svg">
</picture>
</a>
<p><a href="starters/examples/video-streaming/"><b>Video streaming platform</b></a><br>
<sub>A whole streaming service: devices, edge, playback, discovery, data and an ISP-hosted video edge</sub></p>
</td>
</tr>
<tr>
<td width="100%" valign="top">
<a href="starters/examples/music-streaming/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/examples/music-streaming/preview-dark.svg">
  <img width="100%" alt="Music streaming service starter" src="starters/examples/music-streaming/preview.svg">
</picture>
</a>
<p><a href="starters/examples/music-streaming/"><b>Music streaming service</b></a><br>
<sub>A whole music service: playback from a CDN, an AI DJ, weekly mixes, royalties and artist releases</sub></p>
</td>
</tr>
<tr>
<td width="100%" valign="top">
<a href="starters/examples/ride-hailing/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/examples/ride-hailing/preview-dark.svg">
  <img width="100%" alt="Ride-hailing platform starter" src="starters/examples/ride-hailing/preview.svg">
</picture>
</a>
<p><a href="starters/examples/ride-hailing/"><b>Ride-hailing platform</b></a><br>
<sub>A whole two-sided marketplace: live driver locations, dispatch, surge, trips, payments and payouts</sub></p>
</td>
</tr>
<tr>
<td width="100%" valign="top">
<a href="starters/examples/food-delivery/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/examples/food-delivery/preview-dark.svg">
  <img width="100%" alt="Food delivery marketplace starter" src="starters/examples/food-delivery/preview.svg">
</picture>
</a>
<p><a href="starters/examples/food-delivery/"><b>Food delivery marketplace</b></a><br>
<sub>A three-sided marketplace: customers, restaurants and couriers, an order saga with refunds, dispatch and payouts</sub></p>
</td>
</tr>
<tr>
<td width="100%" valign="top">
<a href="starters/examples/order-processing/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/examples/order-processing/preview-dark.svg">
  <img width="100%" alt="Order processing starter" src="starters/examples/order-processing/preview.svg">
</picture>
</a>
<p><a href="starters/examples/order-processing/"><b>Order processing</b></a><br>
<sub>A shop takes the payment, queues fulfilment, and parks orders the warehouse keeps refusing</sub></p>
</td>
</tr>
</table>

### Architectures

<table>
<tr>
<td width="50%" valign="top">
<a href="starters/architectures/monolith/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/monolith/preview-dark.svg">
  <img width="100%" alt="Monolith starter" src="starters/architectures/monolith/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/monolith/"><b>Monolith</b></a><br>
<sub>A clinic's booking site, staff screens and API in one Django app, deployed as one unit behind NGINX</sub></p>
</td>
<td width="50%" valign="top">
<a href="starters/architectures/modular-monolith/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/modular-monolith/preview-dark.svg">
  <img width="100%" alt="Modular Monolith starter" src="starters/architectures/modular-monolith/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/modular-monolith/"><b>Modular Monolith</b></a><br>
<sub>A course platform as one Spring Boot deployable with Catalog, Enrollment, Billing and Notifications modules</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="starters/architectures/microservices/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/microservices/preview-dark.svg">
  <img width="100%" alt="Microservices starter" src="starters/architectures/microservices/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/microservices/"><b>Microservices</b></a><br>
<sub>A food-delivery platform: services behind Kong, each owning its data, talking by gRPC and Kafka events</sub></p>
</td>
<td width="50%" valign="top">
<a href="starters/architectures/event-driven/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/event-driven/preview-dark.svg">
  <img width="100%" alt="Event-Driven starter" src="starters/architectures/event-driven/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/event-driven/"><b>Event-Driven</b></a><br>
<sub>One event, many reactions: a topic fans out to a queue per subscriber, with a dead-letter queue for failures</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="starters/architectures/hexagonal/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/hexagonal/preview-dark.svg">
  <img width="100%" alt="Hexagonal starter" src="starters/architectures/hexagonal/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/hexagonal/"><b>Hexagonal</b></a><br>
<sub>A bank's transfers core owns its ports; REST, a job, JPA, Kafka and a fraud vendor plug in as adapters</sub></p>
</td>
<td width="50%" valign="top">
<a href="starters/architectures/bff/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/bff/preview-dark.svg">
  <img width="100%" alt="Backend for Frontend starter" src="starters/architectures/bff/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/bff/"><b>Backend for Frontend</b></a><br>
<sub>Web, mobile and TV each get a backend shaped for their screens, over shared platform APIs</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="starters/architectures/cqrs/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/architectures/cqrs/preview-dark.svg">
  <img width="100%" alt="CQRS starter" src="starters/architectures/cqrs/preview.svg">
</picture>
</a>
<p><a href="starters/architectures/cqrs/"><b>CQRS</b></a><br>
<sub>A bank's payments write events on one side; projections build balances and searchable history on the other</sub></p>
</td>
<td width="50%"></td>
</tr>
</table>

### Data architectures

<table>
<tr>
<td width="50%" valign="top">
<a href="starters/data/medallion/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/data/medallion/preview-dark.svg">
  <img width="100%" alt="Medallion starter" src="starters/data/medallion/preview.svg">
</picture>
</a>
<p><a href="starters/data/medallion/"><b>Medallion</b></a><br>
<sub>A ride-hailing lakehouse refines raw trips into Bronze, Silver and Gold, and quarantines bad rows</sub></p>
</td>
<td width="50%" valign="top">
<a href="starters/data/kappa/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/data/kappa/preview-dark.svg">
  <img width="100%" alt="Kappa starter" src="starters/data/kappa/preview.svg">
</picture>
</a>
<p><a href="starters/data/kappa/"><b>Kappa</b></a><br>
<sub>Card fraud scoring from one durable log: live scoring, and a full replay to rebuild with new rules</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="starters/data/cdc/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/data/cdc/preview-dark.svg">
  <img width="100%" alt="Change Data Capture starter" src="starters/data/cdc/preview.svg">
</picture>
</a>
<p><a href="starters/data/cdc/"><b>Change Data Capture</b></a><br>
<sub>A marketplace streams committed listing changes from PostgreSQL to search, cache and warehouse</sub></p>
</td>
<td width="50%"></td>
</tr>
</table>

### Patterns

<table>
<tr>
<td width="50%" valign="top">
<a href="starters/patterns/saga-orchestration/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/patterns/saga-orchestration/preview-dark.svg">
  <img width="100%" alt="Saga – Orchestration starter" src="starters/patterns/saga-orchestration/preview.svg">
</picture>
</a>
<p><a href="starters/patterns/saga-orchestration/"><b>Saga – Orchestration</b></a><br>
<sub>One orchestrator books a trip step by step, and cancels the done steps in reverse when the card is declined</sub></p>
</td>
<td width="50%" valign="top">
<a href="starters/patterns/saga-choreography/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/patterns/saga-choreography/preview-dark.svg">
  <img width="100%" alt="Saga – Choreography starter" src="starters/patterns/saga-choreography/preview.svg">
</picture>
</a>
<p><a href="starters/patterns/saga-choreography/"><b>Saga – Choreography</b></a><br>
<sub>A food order moves through payment and kitchen by events alone, and unwinds by events when a restaurant says no</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="starters/patterns/transactional-outbox/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="starters/patterns/transactional-outbox/preview-dark.svg">
  <img width="100%" alt="Transactional Outbox starter" src="starters/patterns/transactional-outbox/preview.svg">
</picture>
</a>
<p><a href="starters/patterns/transactional-outbox/"><b>Transactional Outbox</b></a><br>
<sub>A bank transfer and its event commit in one transaction; Debezium publishes it after, and consumers drop duplicates</sub></p>
</td>
<td width="50%"></td>
</tr>
</table>

<!-- gallery:end -->

## Style packs

A style pack changes how every shape and connector is drawn, without changing what any of them
means: a data store drawn as a barrel is still a data store. Each is a small illustrated world: a
drawing for every shape and every kind of it, its own colours, and a backdrop printed on the canvas
behind the diagram. In Draft Canvas, open **Appearance** (`⌘K`, then **Appearance…**), load the
gallery under **Style packs** and choose **Add**: the pack is seen on your diagram at once, and
becomes a style of your own, to change as you like. Open a pack below to see every shape in it.

<!-- styles:start -->

<table>
<tr>
<td width="50%" valign="top">
<a href="styles/professional/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/professional/preview-dark.svg">
  <img width="100%" alt="Professional style pack" src="styles/professional/preview.svg">
</picture>
</a>
<p><a href="styles/professional/"><b>Professional</b></a><br>
<sub>Refined duotone product icons with quiet depth, on a drafting sheet, for documents and slides</sub></p>
</td>
<td width="50%" valign="top">
<a href="styles/geek/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/geek/preview-dark.svg">
  <img width="100%" alt="Geek style pack" src="styles/geek/preview.svg">
</picture>
</a>
<p><a href="styles/geek/"><b>Geek</b></a><br>
<sub>A retro computing lab in glowing phosphor: every shape its own piece of 16-bit pixel hardware</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="styles/arena/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/arena/preview-dark.svg">
  <img width="100%" alt="Arena style pack" src="styles/arena/preview.svg">
</picture>
</a>
<p><a href="styles/arena/"><b>Arena</b></a><br>
<sub>Navy enamel and bevelled gold battle arena: plaques, turrets, cut gems, loot and the lanes between them</sub></p>
</td>
<td width="50%" valign="top">
<a href="styles/high-seas/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/high-seas/preview-dark.svg">
  <img width="100%" alt="High seas style pack" src="styles/high-seas/preview.svg">
</picture>
</a>
<p><a href="styles/high-seas/"><b>High seas</b></a><br>
<sub>A hand-coloured woodcut sea chart: a lighthouse, a ledger, a powder keg, a bottle of messages</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="styles/high-fantasy/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/high-fantasy/preview-dark.svg">
  <img width="100%" alt="High fantasy style pack" src="styles/high-fantasy/preview.svg">
</picture>
</a>
<p><a href="styles/high-fantasy/"><b>High fantasy</b></a><br>
<sub>An illuminated storybook on moss-green vellum, in gold leaf and lapis: keeps, cauldrons, rune stones and an owl</sub></p>
</td>
<td width="50%" valign="top">
<a href="styles/cyberpunk/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/cyberpunk/preview-dark.svg">
  <img width="100%" alt="Cyberpunk style pack" src="styles/cyberpunk/preview.svg">
</picture>
</a>
<p><a href="styles/cyberpunk/"><b>Cyberpunk</b></a><br>
<sub>A neon night city of drones, megatowers and maglev trains, in glowing tube and chrome</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="styles/cute/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/cute/preview-dark.svg">
  <img width="100%" alt="Cute style pack" src="styles/cute/preview.svg">
</picture>
</a>
<p><a href="styles/cute/"><b>Cute</b></a><br>
<sub>A kawaii sticker sheet: a busy bee, a jam jar, a caterpillar queue and bear-eared friends, glossy, die-cut and smiling</sub></p>
</td>
<td width="50%" valign="top">
<a href="styles/weeb/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/weeb/preview-dark.svg">
  <img width="100%" alt="Weeb style pack" src="styles/weeb/preview.svg">
</picture>
</a>
<p><a href="styles/weeb/"><b>Weeb</b></a><br>
<sub>Inked manga under an after-school sky: a shrine gate, a bento box, ramen bowls in line, carp streamers in the wind</sub></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<a href="styles/hardwood/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/hardwood/preview-dark.svg">
  <img width="100%" alt="Hardwood style pack" src="styles/hardwood/preview.svg">
</picture>
</a>
<p><a href="styles/hardwood/"><b>Hardwood</b></a><br>
<sub>Basketball as a bold daylight poster: ball orange, deep ink, white and court teal on warm peach</sub></p>
</td>
<td width="50%" valign="top">
<a href="styles/match-point/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="styles/match-point/preview-dark.svg">
  <img width="100%" alt="Match Point style pack" src="styles/match-point/preview.svg">
</picture>
</a>
<p><a href="styles/match-point/"><b>Match Point</b></a><br>
<sub>A sunlit court as a bold club poster in lemon-lime, bottle green and clay: a ball machine, a scoreboard, a can of balls</sub></p>
</td>
</tr>
</table>

<!-- styles:end -->

To use one without the gallery, download its `.draftstyle` file and choose **Import style…** on
the same page.

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
  examples/<id>/          whole systems and worked examples
    <id>.draftcanvas      the diagram
    spec.json             what tools/build.ts builds the diagram from
    starter.json          name, summary, search words, order
    README.md             what it shows, when to use it, what to watch out for
    preview.svg           light picture, drawn by Draft Canvas
    preview-dark.svg      dark picture
styles/<id>/              one style pack
  <id>.draftstyle         the style the app reads, built by tools/styles/build.ts
  pack.json               name, summary, author, licence, order
  style.json              everything about the style that is not a drawing
  art/<key>.svg           one drawing per kind of shape
  preview.svg             a sample diagram drawn in the pack (and preview-dark.svg)
  sheet.svg               every kind of shape drawn in the pack
scripts/catalog.mjs       builds catalog.json and the galleries above
tools/                    build, picture and screenshot starters with Draft Canvas itself
tools/styles/             draw and build style packs
```

A folder is one starter, so adding one never touches another. The app finds files only through
`catalog.json`, which records each file's SHA-256: an app that already has a copy downloads a
starter again only when it changed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Starters and the style packs here are licensed under
[Apache-2.0](LICENSE), like Draft Canvas. Every pack is original artwork: none uses a name, a
character or a mark that belongs to someone else.
