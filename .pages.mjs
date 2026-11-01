import { readFileSync, writeFileSync } from "node:fs";
const edit = (p, pairs) => {
  let s = readFileSync(p, "utf8");
  for (const [from, to] of pairs) {
    if (!s.includes(from)) throw new Error(`not found in ${p}: ${from.slice(0, 70)}`);
    s = s.replace(from, to);
  }
  writeFileSync(p, s);
};

// layout: no reveal script, no top padding games
let L = readFileSync("src/layouts/Layout.astro", "utf8");
L = L.replace(/\n\t\t<script>\n\t\t\t\/\/ fade-up on scroll[\s\S]*?\n\t\t<\/script>/, "");
L = L.replace('<main class="relative flex-1 pt-md sm:pt-lg">', '<main class="relative flex-1 pt-6 sm:pt-10">');
writeFileSync("src/layouts/Layout.astro", L);

// post: the outline is gone; the column is the whole page
edit("src/layouts/Post.astro", [
  ["import Toc from '~/components/toc.astro';\n", ""],
  ["const toc = (Astro.props.headings ?? []).filter((h) => h.depth === 2 || h.depth === 3);\n", ""],
  ["\t\t{toc.length > 2 && <Toc items={toc} />}\n", ""],
]);

// projects: a plain list, name bold, a line of description, links under
let P = readFileSync("src/pages/projects/index.astro", "utf8");
P = P.replace(`      <p class="page-lede">
        {projects.length} tools, experiments, and systems i kept poking at
        until they became useful enough to keep around.
      </p>`, `      <p class="page-lede">
        tools, experiments, and systems i kept poking at until they became
        useful enough to keep around.
      </p>`);
P = P.slice(0, P.indexOf("<style>")) + `<style>
  .project {
    display: block;
    padding: 1.6rem 0;
    border-top: 1px solid var(--line);
    scroll-margin-top: 4rem;
  }

  .project:last-child {
    border-bottom: 1px solid var(--line);
  }

  .pr-side {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.35rem;
  }

  .pr-name {
    margin: 0;
    font-size: inherit;
    font-weight: 400;
    line-height: 1.4;
  }

  .pr-name button {
    border: 0;
    background: none;
    padding: 0;
    color: var(--f-high);
    font-size: 1.15rem;
    font-weight: 650;
    text-align: left;
    transition: color 0.15s ease;
  }

  .pr-name button:hover {
    color: var(--accent);
  }

  .pr-side .meta {
    margin: 0;
    flex: none;
  }

  .pr-summary {
    margin: 0;
    color: var(--f-high);
    font-size: 1.02rem;
    line-height: 1.55;
  }

  .pr-blurb {
    margin: 0.4rem 0 0;
    color: var(--f-low);
    font-size: 0.96rem;
    line-height: 1.6;
  }

  .pr-media {
    margin-top: 1.1rem;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--b-med);
    aspect-ratio: 16 / 10;
    cursor: zoom-in;
  }

  .pr-media :is(img, video) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  .pr-details {
    margin-top: 0.9rem;
  }

  .pr-details summary {
    width: fit-content;
    cursor: pointer;
    color: var(--f-low);
    font-size: 0.9rem;
    transition: color 0.15s ease;
  }

  .pr-details summary:hover {
    color: var(--f-high);
  }

  .pr-details ul {
    margin: 0.5rem 0 0;
    padding-left: 1.1rem;
    color: var(--f-low);
    font-size: 0.92rem;
    line-height: 1.6;
    list-style: disc;
  }

  .pr-details li::marker {
    color: var(--f-mute);
  }

  .pr-foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.4rem 1.5rem;
    margin-top: 0.9rem;
    text-transform: none;
  }

  .pr-links {
    display: flex;
    gap: 1rem;
  }

  .pr-links a {
    color: var(--f-high);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .pr-links a:hover {
    color: var(--accent);
  }
</style>

` + P.slice(P.indexOf("<script>"));
writeFileSync("src/pages/projects/index.astro", P);

// recognition: a quiet list; the photos sit beside the entries that have them
let R = readFileSync("src/pages/recognition.astro", "utf8");
R = R.slice(0, R.indexOf("    <ol")) + `    <ol role="list" class="wall">
      {
        recognition.map((item) => {
          const Tag = item.href ? "a" : "div";
          const context = [item.where, item.year].filter(Boolean).join(", ");
          const pic = item.photo ?? item.image;
          return (
            <li class="entry">
              <Tag class="rec" href={item.href}>
                <span class="rec-main">
                  <span class="rec-result">{item.result}</span>
                  <span class="rec-title">{item.title}</span>
                  <span class="rec-sum">{[context, item.note].filter(Boolean).join(". ")}</span>
                </span>
                {pic && (
                  <span class="rec-pic">
                    <img
                      src={pic.src}
                      alt={pic.alt}
                      style={"focus" in pic && pic.focus ? \`object-position: \${pic.focus}\` : undefined}
                      loading="lazy"
                    />
                  </span>
                )}
              </Tag>
            </li>
          );
        })
      }
    </ol>
  </Wrapper>
</Layout>

<style>
  .wall {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry {
    border-top: 1px solid var(--line);
  }

  .entry:last-child {
    border-bottom: 1px solid var(--line);
  }

  .rec {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 7.5rem;
    gap: 1.25rem;
    align-items: start;
    padding: 1.4rem 0;
    color: inherit;
    text-decoration: none;
  }

  .rec-main {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .rec-result {
    color: var(--f-high);
    font-size: 1.15rem;
    font-weight: 650;
    text-transform: lowercase;
    transition: color 0.15s ease;
  }

  a.rec:hover .rec-result {
    color: var(--accent);
  }

  .rec-title {
    color: var(--f-high);
    font-size: 1rem;
  }

  .rec-sum {
    margin-top: 0.25rem;
    color: var(--f-mute);
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .rec-pic {
    grid-column: 2;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: #fff;
  }

  .rec-pic img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 480px) {
    .rec {
      grid-template-columns: 1fr;
    }

    .rec-pic {
      grid-column: 1;
      width: 9rem;
    }
  }
</style>
`;
writeFileSync("src/pages/recognition.astro", R);

// the vine reads the page ground
edit("src/components/vine.astro", [
  ['      paper = cs.getPropertyValue("--background").trim() || paper;', '      paper = cs.getPropertyValue("--background").trim() || paper;'],
]);

// stuff: small label style and pill tabs already fit; just the lede
edit("src/pages/stuff/index.astro", [
  [`  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0 0 1.5rem;
  }`, `  .tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0 0 1.25rem;
  }`],
  [`    border: 0;
    border-radius: 999px;
    background: var(--b-med);
    padding: 0.42rem 1rem;
    color: var(--f-low);
    font-size: 0.86rem;
    font-weight: 500;`, `    border: 1px solid var(--line);
    border-radius: 999px;
    background: transparent;
    padding: 0.3rem 0.85rem;
    color: var(--f-low);
    font-size: 0.86rem;
    font-weight: 500;`],
  [`  .tab[aria-selected="true"] {
    color: var(--on-accent);
    background: var(--accent-ink);
  }`, `  .tab[aria-selected="true"] {
    color: var(--on-accent);
    background: var(--f-high);
    border-color: var(--f-high);
  }`],
  ["    font-family: var(--font-display);", "    font-weight: 600;"],
  ["    font-family: var(--font-display);", "    font-weight: 600;"],
  ["    font-family: var(--font-display);", "    font-weight: 600;"],
]);

// photos: two columns in the narrow measure
edit("src/pages/photos/index.astro", [
  ["  .photo-masonry {\n    columns: 3;\n    column-gap: 1.25rem;\n  }", "  .photo-masonry {\n    columns: 2;\n    column-gap: 1rem;\n  }"],
]);

// share card: light, the column, hanken grotesk
let O = readFileSync("src/lib/og.ts", "utf8");
O = O.replace(/font\("@fontsource\/instrument-serif", "instrument-serif-latin-400-normal\.woff"\),\n\s*font\("@fontsource\/instrument-serif", "instrument-serif-latin-400-italic\.woff"\),\n\s*font\("@fontsource\/instrument-sans", "instrument-sans-latin-400-normal\.woff"\),\n\s*font\("@fontsource\/instrument-sans", "instrument-sans-latin-500-normal\.woff"\),/,
  `font("@fontsource/hanken-grotesk", "hanken-grotesk-latin-400-normal.woff"),
    font("@fontsource/hanken-grotesk", "hanken-grotesk-latin-500-normal.woff"),
    font("@fontsource/hanken-grotesk", "hanken-grotesk-latin-600-normal.woff"),
    font("@fontsource/hanken-grotesk", "hanken-grotesk-latin-600-normal.woff"),`);
O = O.replace(/\{ name: "Instrument Serif", data: serif, weight: 400 as const, style: "normal" as const \},\n\s*\{ name: "Instrument Serif", data: serifItalic, weight: 400 as const, style: "italic" as const \},\n\s*\{ name: "Instrument Sans", data: sans, weight: 400 as const, style: "normal" as const \},\n\s*\{ name: "Instrument Sans", data: sansMedium, weight: 500 as const, style: "normal" as const \},/,
  `{ name: "Hanken Grotesk", data: serif, weight: 400 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: serifItalic, weight: 500 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: sans, weight: 600 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: sansMedium, weight: 700 as const, style: "normal" as const },`);
O = O.replace(`const eg = {
  base: "#171c1f",
  paper: "#1e2528",
  high: "#f8f9e8",
  low: "#adc9bc",
  muted: "#7f958d",
  line: "rgba(173, 201, 188, 0.14)",
  accent: "#cbe3b3",
  leaf: "#cbe3b3",
};`, `const eg = {
  base: "#fbf9f4",
  paper: "#fbf9f4",
  high: "#2b3034",
  low: "#576869",
  muted: "#829084",
  line: "#e8e2d6",
  accent: "#74a48b",
  leaf: "#74a48b",
};`);
O = O.replace('fontFamily: "Instrument Sans",', 'fontFamily: "Hanken Grotesk",');
O = O.replace('h("div", { display: "flex", fontFamily: "Instrument Serif", fontSize: titleSize, lineHeight: 1.02, letterSpacing: -1.5, color: eg.high }, title),',
              'h("div", { display: "flex", fontWeight: 700, fontSize: Math.round(titleSize * 0.82), lineHeight: 1.08, letterSpacing: -2, color: eg.high }, title),');
O = O.replace('boxShadow: "0 0 0 1px rgba(173,201,188,0.12), 0 24px 60px -28px rgba(0,0,0,0.6)",', 'boxShadow: "0 0 0 1px #e8e2d6",');
writeFileSync("src/lib/og.ts", O);
