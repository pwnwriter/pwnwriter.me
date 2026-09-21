// A still version of the footer vine (src/components/vine.astro) for share
// cards: same strands, leaves, and cat, fully grown, emitted as an SVG string.
// Seeded by the card's title so every page gets its own plant, like the site.

const TAU = Math.PI * 2;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const n = (v: number) => v.toFixed(1);

export interface VineOptions {
  width: number;
  height: number;
  ink: string;
  paper: string;
  nose: string;
}

export function vineSvg(seedText: string, { width: W, height: H, ink, paper, nose }: VineOptions) {
  const rand = mulberry32(hash(seedText));
  const between = (lo: number, hi: number) => lo + rand() * (hi - lo);
  // the card is about 1.7x the width of the site column, so scale the plant up
  const k = H / 88;

  const strands = [24, 42].map((base, layer) => ({
    base: base * k,
    a1: (layer ? 8 : 6) * k,
    a2: (layer ? 3.2 : 2.4) * k,
    k1: (TAU * between(1.0, 1.5)) / W,
    k2: (TAU * between(2.3, 3.3)) / W,
    p1: between(0, TAU),
    p2: between(0, TAU),
  }));
  const strandY = (s: (typeof strands)[number], x: number) =>
    s.base + s.a1 * Math.sin(x * s.k1 + s.p1) + s.a2 * Math.sin(x * s.k2 + s.p2);

  const catX = W * between(0.24, 0.76);
  const flip = catX < W / 2 ? 1 : -1;

  const parts: string[] = [];

  strands.forEach((s, layer) => {
    let d = "";
    for (let x = 0; x <= W; x += 6) d += `${x ? "L" : "M"}${n(x)} ${n(strandY(s, x))}`;
    parts.push(
      `<path d="${d}" fill="none" stroke="${ink}" stroke-opacity="${layer ? 0.5 : 0.26}"/>`,
    );

    let x = between(6, 18) * k;
    while (x < W - 6) {
      const y = strandY(s, x);
      const len = (layer ? between(24, 40) : between(14, 22)) * k;
      const splay = between(0.16, 0.42);
      const angles =
        rand() < 0.72
          ? [Math.PI / 2 - splay, Math.PI / 2 + splay * between(0.7, 1.2)]
          : [Math.PI / 2 + between(-0.3, 0.3)];
      const crowding = layer === 1 && Math.abs(x - catX) < 24 * k;

      (crowding ? [] : angles).forEach((ang, i) => {
        const l = len * (i ? between(0.78, 1) : 1);
        const w = l * between(0.42, 0.56);
        const deg = (ang * 180) / Math.PI;
        parts.push(
          `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(deg)})">` +
            `<path d="M0 0Q${n(l * 0.42)} ${n(-w)} ${n(l)} 0Q${n(l * 0.42)} ${n(w)} 0 0Z" fill="${ink}" fill-opacity="${layer ? 0.1 : 0.05}" stroke="${ink}" stroke-opacity="${layer ? 0.55 : 0.28}"/>` +
            `<path d="M0 0H${n(l * 0.9)}" stroke="${ink}" stroke-opacity="${layer ? 0.3 : 0.16}"/>` +
            `</g>`,
        );
      });

      x += (layer ? between(22, 36) : between(26, 42)) * k;
    }
  });

  // the cat, sitting on the ground line. opaque paper first so leaves pass behind
  const shape = (d: string) =>
    `<path d="${d}" fill="${paper}"/><path d="${d}" fill="${ink}" fill-opacity="0.1" stroke="${ink}" stroke-opacity="0.7" stroke-linejoin="round"/>`;
  const whiskers = [-1, 1]
    .map((s) => `M${s * 5} -23.6L${s * 13} -25.2M${s * 5} -22.6L${s * 13} -21.8`)
    .join("");
  parts.push(
    `<g transform="translate(${n(catX)} ${n(H - 0.5)}) scale(${n(1.18 * k)})" stroke-width="${n(1 / 1.18)}">` +
      `<path transform="scale(${flip} 1)" d="M8 -2.5C17 -1 23 -3 22 -10Q21.5 -14.5 18 -13" fill="none" stroke="${ink}" stroke-opacity="0.6" stroke-width="2.4" stroke-linecap="round"/>` +
      shape("M-6 -20C-12 -14 -12.5 -4 -10 0L10 0C12.5 -4 12 -14 6 -20Z") +
      `<path d="M-3 -10V0M3 -10V0" stroke="${ink}" stroke-opacity="0.4"/>` +
      shape("M-8.5 -26L-8 -38L-3 -33.5Q0 -34.5 3 -33.5L8 -38L8.5 -26C8.5 -20 4 -18 0 -18C-4 -18 -8.5 -20 -8.5 -26Z") +
      `<ellipse cx="-3.3" cy="-27" rx="1.1" ry="1.6" fill="${ink}" fill-opacity="0.85"/>` +
      `<ellipse cx="3.3" cy="-27" rx="1.1" ry="1.6" fill="${ink}" fill-opacity="0.85"/>` +
      `<path d="M-1.1 -24H1.1L0 -22.7Z" fill="${nose}"/>` +
      `<path d="${whiskers}" stroke="${ink}" stroke-opacity="0.32"/>` +
      `</g>`,
  );

  // fade both ends, the way the css mask does on the site
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" stroke-width="${n(k)}" stroke-linecap="round">` +
    `<defs><linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset="0.14" stop-color="#fff"/><stop offset="0.86" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>` +
    `<mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask></defs>` +
    `<g mask="url(#m)">${parts.join("")}</g></svg>`
  );
}
