import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { vineSvg } from "~/lib/og-vine";

const require = createRequire(import.meta.url);

// ---- one-time font loading --------------------------------------------------
// the same faces the site uses: Newsreader for words, Departure Mono for labels.
// satori wants static files, hence @fontsource/newsreader next to the variable one.
const newsreader = (weight: number) =>
  readFile(
    join(
      dirname(require.resolve("@fontsource/newsreader/package.json")),
      "files",
      `newsreader-latin-${weight}-normal.woff`,
    ),
  );

const departure = () =>
  readFile(join(process.cwd(), "public", "fonts", "DepartureMono-Regular.woff"));

async function loadFonts() {
  const [light, regular, mono] = await Promise.all([newsreader(300), newsreader(400), departure()]);
  return [
    { name: "Newsreader", data: light, weight: 300 as const, style: "normal" as const },
    { name: "Newsreader", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Departure Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

let fonts: Awaited<ReturnType<typeof loadFonts>> | null = null;

// ---- palette (evergarden summer, the site's light theme) --------------------
const rp = {
  base: "#f5efe6",
  high: "#2b3034",
  low: "#455355",
  subtle: "#576869",
  muted: "#829084",
  line: "rgba(69, 83, 85, 0.16)",
  accent: "#91a77a",
};

export type OgKind = "home" | "note" | "syndication" | "section" | "tag";

// the path shown top-left, the way the site header shows where you are
const trail: Record<OgKind, (label?: string) => string> = {
  home: () => "~",
  note: () => "~/notes",
  syndication: () => "~/syndications",
  section: (label) => `~/${label ?? ""}`,
  tag: () => "~/notes/tags",
};

const kindLabel: Record<OgKind, string> = {
  home: "pwn::musings",
  note: "note",
  syndication: "syndication",
  section: "index",
  tag: "tag",
};

const clamp = (s: string, max: number) =>
  s.length <= max ? s : `${s.slice(0, max).replace(/\s+\S*$/, "")}…`;

export interface OgInput {
  title: string;
  description?: string;
  kind: OgKind;
  label?: string;
  chips?: string[];
}

// tiny hyperscript for satori's element tree (avoids HTML string parsing)
type Node = { type: string; props: Record<string, unknown> };
const h = (
  type: string,
  style: Record<string, unknown>,
  children?: unknown,
  extra: Record<string, unknown> = {},
): Node => ({ type, props: { style, ...extra, ...(children !== undefined ? { children } : {}) } });

const mono = (size: number, color: string, extra: Record<string, unknown> = {}) => ({
  display: "flex",
  fontFamily: "Departure Mono",
  fontSize: size,
  color,
  ...extra,
});

// ---- template ---------------------------------------------------------------
// the same grammar as the pages: a mono trail up top, serif words in the middle,
// then the vine, a hairline, and a mono label line underneath.
const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 80;
const INNER = WIDTH - PAD * 2;
const VINE_H = 104;

function markup(input: OgInput): Node {
  const title = clamp(input.title, 84);
  const long = title.length >= 48;
  const titleSize = title.length < 24 ? 88 : long ? 56 : 70;
  const desc = input.description ? clamp(input.description, long ? 96 : 108) : "";

  const vine = vineSvg(input.title, {
    width: INNER,
    height: VINE_H,
    ink: rp.low,
    paper: rp.base,
    nose: rp.accent,
  });
  const vineSrc = `data:image/svg+xml;base64,${Buffer.from(vine).toString("base64")}`;

  // sections and the home card are labelled by kind; everything else by its own label
  const label =
    input.kind === "section" || input.kind === "home"
      ? kindLabel[input.kind]
      : (input.label ?? kindLabel[input.kind]);
  const meta = (input.chips ?? []).slice(0, 3).join("  ·  ").toLowerCase();

  return h(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      width: WIDTH,
      height: HEIGHT,
      padding: `${PAD - 14}px ${PAD}px ${PAD - 22}px`,
      background: rp.base,
      color: rp.high,
      fontFamily: "Newsreader",
    },
    [
      h("div", { display: "flex", justifyContent: "space-between" }, [
        h("div", mono(24, rp.subtle), trail[input.kind](input.label)),
        h("div", mono(24, rp.muted), "pwnwriter.me"),
      ]),

      h(
        "div",
        { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 20 },
        [
          h(
            "div",
            {
              display: "flex",
              fontWeight: 400,
              fontSize: titleSize,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              color: rp.high,
            },
            title,
          ),
          ...(desc
            ? [
                h(
                  "div",
                  {
                    display: "flex",
                    maxWidth: 900,
                    fontWeight: 300,
                    fontSize: 30,
                    lineHeight: 1.4,
                    color: rp.subtle,
                  },
                  desc,
                ),
              ]
            : []),
        ],
      ),

      h("img", { display: "flex" }, undefined, { src: vineSrc, width: INNER, height: VINE_H }),
      h("div", { display: "flex", height: 1, background: rp.line }),

      h("div", { display: "flex", justifyContent: "space-between", marginTop: 22 }, [
        h("div", mono(20, rp.accent, { letterSpacing: 4 }), label.toUpperCase()),
        h("div", mono(20, rp.muted), meta),
      ]),
    ],
  );
}

// ---- public API -------------------------------------------------------------
export async function generateOg(input: OgInput): Promise<Buffer> {
  fonts ??= await loadFonts();
  const svg = await satori(markup(input) as any, { width: WIDTH, height: HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
}
