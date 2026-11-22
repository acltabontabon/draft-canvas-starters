import { circle, ellipse, paint, path, poly, rect, scheme, type Kit, type Pack } from '../kit';

/**
 * Professional: the icon set of a polished architecture deck, in quiet slate and navy. Every kind
 * is its own crisp, geometric pictogram on one grid: a soft filled body with an even outline, one
 * solid accent area (a header band, a lid, a badge) and ink for the mark that names the kind.
 * Painted by role only, so it follows the device's light or dark theme and any recolour.
 */

/** Outline, ink and detail weights: the same three everywhere. */
const W = 6;
const I = 5;
const D = 4;

const n = (value: number) => Math.round(value * 10) / 10;
const body = (k: Kit, w = W) => paint(k.F, k.L, w);
const accent = (k: Kit, w = W) => paint(k.C, k.L, w);
const edge = (k: Kit, w = W) => paint('none', k.L, w);
const ink = (k: Kit, w = I) => paint('none', k.T, w);

/** A band with only its top corners rounded: the header of a card, a page or a badge. */
const band = (x: number, y: number, w: number, h: number, r: number) => `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;

/** A card: body, header band, then the outline over both so it stays even. */
const card = (k: Kit, x: number, y: number, w: number, h: number, r: number, head: number) =>
  rect(x, y, w, h, r, paint(k.F)) + path(band(x, y, w, head, r), paint(k.C)) + rect(x, y, w, h, r, edge(k));

/** A cog with flat-topped teeth. */
function gear(cx: number, cy: number, tip: number, root: number, teeth: number): string {
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, a: number) => `${n(cx + r * Math.cos(a))} ${n(cy + r * Math.sin(a))}`;
  let d = '';
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step - Math.PI / 2;
    d += `${i === 0 ? 'M' : `A${root} ${root} 0 0 1 `}${at(root, a - step * 0.3)}L${at(tip, a - step * 0.17)}L${at(tip, a + step * 0.17)}L${at(root, a + step * 0.3)}`;
  }
  return `${d}A${root} ${root} 0 0 1 ${at(root, -Math.PI / 2 - step * 0.3)}Z`;
}

/** A can: the classic data store, `rx` wide, from its lid at `top` to its base at `bottom`. */
const can = (k: Kit, cx: number, rx: number, ry: number, top: number, bottom: number) =>
  path(`M${cx - rx} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${cx + rx} ${bottom}V${top}Z`, body(k)) +
  path(`M${cx - rx} ${(top + bottom) / 2}A${rx} ${ry} 0 0 0 ${cx + rx} ${(top + bottom) / 2}`, edge(k, D)) +
  ellipse(cx, top, rx, ry, accent(k));

/** A message: an envelope `w` by `h`, its flap drawn in `flap`. */
const envelope = (x: number, y: number, w: number, h: number, attrs: string, flap: string) =>
  rect(x, y, w, h, 3, attrs) + path(`M${x + 3} ${y + 4}L${x + w / 2} ${y + h * 0.58}L${x + w - 3} ${y + 4}`, flap);

/** Head and shoulders. */
const bust = (cx: number, head: number, r: number, half: number, top: number, bottom: number, headAttrs: string, torsoAttrs: string) =>
  path(
    `M${cx - half} ${bottom}V${top + half * 0.62}C${cx - half} ${top + half * 0.22} ${cx - half * 0.72} ${top} ${cx - half * 0.36} ${top}H${cx + half * 0.36}C${cx + half * 0.72} ${top} ${cx + half} ${top + half * 0.22} ${cx + half} ${top + half * 0.62}V${bottom}Z`,
    torsoAttrs,
  ) + circle(cx, head, r, headAttrs);

/** A sheet with a folded corner, the fold in the accent. */
const SHEET = 'M16 4H52L76 28V90Q76 96 70 96H16Q10 96 10 90V10Q10 4 16 4Z';
const page = (k: Kit, under = '', sheet = SHEET) => path(sheet, paint(k.F)) + under + path(sheet, edge(k)) + path('M52 4V22Q52 28 58 28H76Z', accent(k));

/** A four-pointed spark. */
const spark = (cx: number, cy: number, r: number) => {
  const a = r * 0.2;
  return `M${cx} ${cy - r}Q${cx + a} ${cy - a} ${cx + r} ${cy}Q${cx + a} ${cy + a} ${cx} ${cy + r}Q${cx - a} ${cy + a} ${cx - r} ${cy}Q${cx - a} ${cy - a} ${cx} ${cy - r}Z`;
};

export const professional: Pack = {
  id: 'professional',
  name: 'Professional',
  summary: 'Crisp duotone pictograms in slate and navy, for documents and slides',
  author: 'Draft Canvas',
  licence: 'Apache-2.0',
  order: 10,
  style: {
    hand: { base: 'clean' },
    general: { shadow: false },
    connectors: { head: 'triangle', colour: 'plain' },
    schemes: {
      light: scheme(
        { canvas: '#f7f8fa', grid: '#e3e6eb', text: '#16202e', textMuted: '#55606f', edge: '#6b7686', edgeText: '#55606f', edgeLabelBg: '#ffffff', codeBg: '#eef0f4', codeBorder: '#dde1e7' },
        {
          neutral: ['#ffffff', '#6b7686', '#16202e', '#4a5565'],
          teal: ['#eef6f5', '#3a7f78', '#184640', '#2f6f68'],
          blue: ['#edf3fa', '#3f6ea0', '#1b3a5e', '#2f5f92'],
          violet: ['#f1eff9', '#6659a0', '#33295f', '#574a90'],
          amber: ['#f9f4e8', '#96762f', '#55400f', '#846526'],
          rose: ['#f9eff0', '#a1626c', '#5e2a33', '#8c4f59'],
          green: ['#eff5ee', '#4f7f4a', '#254623', '#426f3d'],
        },
      ),
      dark: scheme(
        { canvas: '#12161d', grid: '#232a34', text: '#e6eaf0', textMuted: '#9aa5b4', edge: '#7d8898', edgeText: '#aab4c2', edgeLabelBg: '#1a2029', codeBg: '#171c24', codeBorder: '#2a323d' },
        {
          neutral: ['#1b212b', '#7d8898', '#e6eaf0', '#aab4c2'],
          teal: ['#16282a', '#4fa89f', '#cfeeea', '#6fc0b7'],
          blue: ['#17263a', '#5f93cc', '#d4e5f8', '#80ade0'],
          violet: ['#221f3a', '#8f82cf', '#e1dcf8', '#a99de0'],
          amber: ['#2c2616', '#c2a05a', '#f4e7c6', '#d6b877'],
          rose: ['#2f1c20', '#c98793', '#f6dade', '#dba2ac'],
          green: ['#1a2a1b', '#6faa68', '#d6efd3', '#8cc285'],
        },
      ),
    },
  },
  draw: {
    serviceCard: (k, kind) => {
      switch (kind) {
        // A card under a slim header band.
        case 'generic':
          return card(k, 3, 3, 342, 126, 8, 20);
        // The same card, with a two-slot connector standing out of its left edge.
        case 'api':
          return card(k, 13, 3, 332, 126, 8, 20) + rect(3, 44, 28, 44, 5, accent(k)) + path('M12 58H21M12 74H21', paint('none', k.F, I));
      }
    },

    serviceGlyph: (k, kind) => {
      switch (kind) {
        // A cog turning over a conveyor that carries two jobs.
        case 'worker':
          return (
            rect(13, 54, 20, 20, 3, body(k, I)) +
            rect(103, 54, 20, 20, 3, body(k, I)) +
            path(gear(68, 38, 31, 23, 8), body(k)) +
            circle(68, 38, 9, ink(k)) +
            rect(8, 80, 120, 20, 10, accent(k)) +
            circle(24, 90, 3.5, paint(k.F)) +
            circle(68, 90, 3.5, paint(k.F)) +
            circle(112, 90, 3.5, paint(k.F))
          );
        // A cloud, and an arrow leaving it for somewhere else.
        case 'external':
          return (
            path('M36 100C17 100 5 88 5 73C5 59 15 48 29 46C31 29 45 16 63 16C79 16 92 26 97 40C112 41 123 53 123 70C123 87 110 100 93 100Z', body(k)) +
            path('M88 52L128 12', paint('none', k.K, 17)) +
            path('M70 70L128 12M103 9H131V37', ink(k, 7)) +
            circle(70, 70, 8, paint(k.C))
          );
        // A calendar page with a clock set over its corner.
        case 'scheduler':
          return (
            card(k, 8, 14, 92, 82, 8, 24) +
            path('M32 6V22M76 6V22', ink(k, W)) +
            rect(20, 48, 13, 13, 2, paint(k.L)) +
            rect(41, 48, 13, 13, 2, paint(k.L)) +
            rect(20, 69, 13, 13, 2, paint(k.L)) +
            rect(41, 69, 13, 13, 2, paint(k.L)) +
            circle(102, 70, 33, paint(k.K)) +
            circle(102, 70, 26, body(k)) +
            path('M102 54V70L114 78', ink(k))
          );
        // A keystoned arch on a threshold, and an arrow passing through it.
        case 'gateway':
          return (
            path('M4 62H128', ink(k, 7)) +
            path('M30 96V44A38 38 0 0 1 106 44V96H86V44A18 18 0 0 0 50 44V96Z', body(k)) +
            path('M59 6H77L74 26H62Z', accent(k, D)) +
            path('M54 62H82', ink(k, 7)) +
            path('M116 50L130 62L116 74', ink(k, 7)) +
            rect(14, 88, 108, 12, 4, paint(k.C))
          );
        // One node, wired to three.
        case 'load-balancer':
          return (
            path('M42 52H97M72 18V86M72 18H97M72 86H97', ink(k)) +
            rect(6, 34, 36, 36, 6, accent(k)) +
            rect(100, 5, 30, 26, 5, body(k)) +
            rect(100, 39, 30, 26, 5, body(k)) +
            rect(100, 73, 30, 26, 5, body(k))
          );
        // A shield standing between two parties, traffic passing through it both ways.
        case 'proxy':
          return (
            path('M4 38H132M120 27L132 38L120 49M132 68H4M16 57L4 68L16 79', ink(k, W)) +
            path('M68 6L100 16V50C100 74 86 90 68 98C50 90 36 74 36 50V16Z', accent(k)) +
            path('M47 38H89M49 68H87', paint('none', k.F, W))
          );
      }
    },

    database: (k, kind) => {
      switch (kind) {
        // The classic can.
        case 'generic':
          return can(k, 70, 56, 15, 21, 86);
        // A can with a table of rows and columns set over its corner.
        case 'sql':
          return (
            can(k, 54, 46, 13, 19, 82) +
            rect(60, 40, 80, 68, 10, paint(k.K)) +
            card(k, 66, 46, 68, 56, 6, 17) +
            path('M71 63H129M71 82H129M89 63V97M112 63V97', ink(k, D))
          );
        // Loose documents in a pile, the top one in braces.
        case 'nosql':
          return (
            rect(44, 6, 84, 60, 7, accent(k)) +
            rect(28, 22, 84, 60, 7, body(k)) +
            rect(12, 38, 84, 64, 7, body(k)) +
            path('M46 52C40 52 38 54 38 59V64C38 68 36 70 31 70C36 70 38 72 38 76V81C38 86 40 88 46 88', ink(k)) +
            path('M62 52C68 52 70 54 70 59V64C70 68 72 70 77 70C72 70 70 72 70 76V81C70 86 68 88 62 88', ink(k))
          );
        // A memory chip struck by a bolt: fast, and in memory.
        case 'cache':
          return (
            path('M12 34H28M12 54H28M12 74H28M112 34H128M112 54H128M112 74H128M50 5V16M70 5V16M90 5V16M50 92V103M70 92V103M90 92V103', edge(k)) +
            rect(28, 16, 84, 76, 10, body(k)) +
            rect(38, 26, 64, 56, 5, paint(k.C)) +
            poly('80,30 51,59 67,59 60,78 89,49 73,49', paint(k.F))
          );
        // A folder with two files standing in it.
        case 'file-system':
          return (
            path('M10 26Q10 18 18 18H44L56 30H122Q130 30 130 38V92H10Z', accent(k)) +
            rect(60, 12, 42, 50, 4, body(k, I)) +
            rect(76, 5, 42, 56, 4, body(k, I)) +
            path('M87 19H107M87 31H107', ink(k, D)) +
            rect(10, 44, 120, 56, 8, body(k))
          );
        // A bucket with a few different things in it.
        case 'object-storage':
          return (
            ellipse(70, 34, 54, 12, body(k)) +
            circle(43, 26, 14, paint(k.C)) +
            rect(61, 9, 28, 34, 4, body(k, I)) +
            poly('94,42 107,15 120,42', paint(k.T, k.T, 3)) +
            path('M16 34A54 12 0 0 0 124 34L113 92Q112 100 104 100H36Q28 100 27 92Z', body(k)) +
            path('M21 62A50 11 0 0 0 119 62', edge(k, D))
          );
        // Index cards under a large magnifier.
        case 'search-index':
          return (
            rect(22, 7, 84, 60, 6, body(k)) +
            card(k, 8, 21, 84, 68, 6, 18) +
            path('M20 55H52M20 70H44', edge(k, D)) +
            circle(92, 62, 33, paint(k.K)) +
            path('M111 81L127 97', ink(k, 11)) +
            circle(92, 62, 25, paint(k.F, k.T, 7))
          );
        // One table: a header and a grid.
        case 'table':
          return card(k, 8, 10, 124, 88, 7, 24) + path('M8 34H132M8 56H132M8 77H132M49 34V98M91 34V98', ink(k, D)) + rect(8, 10, 124, 88, 7, edge(k));
      }
    },

    queue: (k, kind) => {
      switch (kind) {
        // A pipe of messages waiting in line, the first one on its way out.
        case 'queue':
          return (
            path('M214 5H15Q3 5 3 17V47Q3 59 15 59H214', body(k)) +
            envelope(16, 18, 38, 28, body(k, D), edge(k, D)) +
            envelope(64, 18, 38, 28, body(k, D), edge(k, D)) +
            envelope(112, 18, 38, 28, body(k, D), edge(k, D)) +
            envelope(160, 18, 38, 28, body(k, D), edge(k, D)) +
            envelope(230, 18, 38, 28, accent(k, D), paint('none', k.F, D))
          );
        // One message in, and a copy of it out to each of three readers.
        case 'topic':
          return (
            rect(3, 5, 146, 54, 12, body(k)) +
            envelope(54, 17, 44, 30, accent(k, D), paint('none', k.F, D)) +
            path('M152 32H267M190 10V54M190 10H267M190 54H267M259 3L268 10L259 17M259 25L268 32L259 39M259 47L268 54L259 61', ink(k))
          );
        // A pipe in constant flow.
        case 'stream':
          return (
            rect(3, 5, 270, 54, 12, body(k)) +
            [0.28, 0.4, 0.52, 0.64, 0.76, 0.88, 1]
              .map((opacity, index) => {
                const x = 18 + index * 35;
                return poly(`${x},17 ${x + 14},17 ${x + 28},32 ${x + 14},47 ${x},47 ${x + 14},32`, `${paint(k.C)} fill-opacity="${opacity}"`);
              })
              .join('')
          );
      }
    },

    actor: (k, kind) => {
      switch (kind) {
        // Head and shoulders.
        case 'human':
          return bust(60, 21, 16, 37, 46, 78, body(k), accent(k));
        // Three people, the nearest in front.
        case 'group':
          return (
            bust(24, 31, 11, 20, 50, 78, body(k, I), body(k, I)) +
            bust(96, 31, 11, 20, 50, 78, body(k, I), body(k, I)) +
            bust(60, 22, 14, 29, 46, 78, paint(k.K, k.K, 13), paint(k.K, k.K, 13)) +
            bust(60, 22, 14, 29, 46, 78, body(k), accent(k))
          );
        // An office building: a tower and a wing.
        case 'thirdParty':
          return (
            rect(68, 38, 34, 40, 4, body(k)) +
            card(k, 22, 5, 48, 73, 4, 13) +
            rect(31, 26, 10, 9, 1, paint(k.T)) +
            rect(51, 26, 10, 9, 1, paint(k.T)) +
            rect(31, 42, 10, 9, 1, paint(k.T)) +
            rect(51, 42, 10, 9, 1, paint(k.T)) +
            rect(80, 50, 10, 9, 1, paint(k.T)) +
            rect(40, 60, 12, 18, 0, paint(k.C)) +
            path('M8 78H112', edge(k))
          );
        // A screen on its stand, at a prompt.
        case 'system':
          return card(k, 12, 4, 96, 58, 6, 16) + path('M26 32L35 40L26 48M45 48H62', ink(k)) + path('M60 63V76M38 78H82', edge(k));
        // A phone.
        case 'device':
          return rect(41, 4, 38, 74, 8, body(k)) + rect(47, 13, 26, 46, 3, paint(k.C)) + path('M54 68H66', ink(k, D));
        // A friendly robot head, with a spark of its own.
        case 'agent':
          return (
            path('M60 24V12', edge(k)) +
            circle(60, 9, 5.5, paint(k.L)) +
            rect(11, 40, 12, 20, 4, paint(k.L)) +
            rect(97, 40, 12, 20, 4, paint(k.L)) +
            rect(24, 24, 72, 54, 14, body(k)) +
            circle(46, 46, 6, paint(k.T)) +
            circle(74, 46, 6, paint(k.T)) +
            path('M48 61Q60 69 72 61', ink(k, 4.5)) +
            path(spark(104, 14, 13), paint(k.C))
          );
      }
    },

    // A card with the two lugs of a component on its left edge.
    componentCard: (k) => rect(17, 3, 280, 102, 8, body(k)) + rect(3, 24, 28, 18, 4, accent(k)) + rect(3, 66, 28, 18, 4, accent(k)),

    componentGlyph: (k, kind) => {
      switch (kind) {
        // A packed box, seen from its corner.
        case 'module':
          return path('M60 6L104 30V76L60 100L16 76V30Z', paint(k.F)) + path('M60 6L104 30L60 54L16 30Z', paint(k.C)) + path('M60 6L104 30V76L60 100L16 76V30ZM16 30L60 54L104 30M60 54V100', edge(k));
        // A plug about to meet its socket.
        case 'adapter':
          return (
            path('M3 52H14', edge(k)) +
            path('M48 40H62M48 64H62', ink(k, W)) +
            path('M48 22H34Q14 22 14 42V62Q14 82 34 82H48Z', body(k)) +
            rect(80, 14, 36, 76, 6, accent(k)) +
            path('M91 40H99M91 64H99', paint('none', k.F, W))
          );
        // A block offering an interface: the lollipop others plug into.
        case 'port':
          return rect(6, 12, 54, 80, 6, body(k)) + path('M20 34H46M20 50H38', edge(k, D)) + path('M63 52H86', ink(k, W)) + circle(100, 52, 13, accent(k));
      }
    },

    artifact: (k, kind) => {
      switch (kind) {
        // A page of lines.
        case 'file':
          return page(k) + path('M24 46H62M24 60H62M24 74H46', ink(k));
        // A page of sliders, each set differently.
        case 'config':
          return page(k) + path('M27 40V84M43 40V84M59 40V84', edge(k, D)) + rect(20, 48, 14, 11, 3, paint(k.T)) + rect(36, 68, 14, 11, 3, paint(k.T)) + rect(52, 56, 14, 11, 3, paint(k.T));
        // A page closed over a key.
        case 'secret':
          return (
            page(k, path('M10 44H76V90Q76 96 70 96H16Q10 96 10 90Z', paint(k.C))) +
            circle(30, 70, 9, paint('none', k.F, W)) +
            path('M39 70H65M56 70V80M65 70V78', paint('none', k.F, W))
          );
        // A shorter page, signed, with a ribbon seal hanging off its foot.
        case 'certificate':
          return (
            page(k, '', 'M16 4H52L76 28V78Q76 84 70 84H16Q10 84 10 78V10Q10 4 16 4Z') +
            path('M24 42H54M24 55H34', ink(k)) +
            circle(58, 73, 21, paint(k.K)) +
            path('M49 81L45 99L58 92L71 99L67 81Z', paint(k.C)) +
            circle(58, 73, 14, accent(k)) +
            circle(58, 73, 4.5, paint(k.F))
          );
      }
    },

    // A ring with a port at each point of the compass.
    junction: (k) =>
      circle(50, 50, 38, body(k)) + rect(42, 4, 16, 16, 4, paint(k.C)) + rect(42, 80, 16, 16, 4, paint(k.C)) + rect(4, 42, 16, 16, 4, paint(k.C)) + rect(80, 42, 16, 16, 4, paint(k.C)),
  },
};
