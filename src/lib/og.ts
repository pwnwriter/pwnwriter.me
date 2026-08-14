import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// ---- one-time asset loading (fonts + avatar) --------------------------------
const fontFile = (pkg: string, file: string) =>
  readFile(join(dirname(require.resolve(`${pkg}/package.json`)), "files", file));

const avatarFile = () =>
  readFile(join(process.cwd(), "public", "favicon.png"));

let assets: {
  fonts: Awaited<ReturnType<typeof loadAssets>>["fonts"];
  avatar: string;
} | null = null;

async function loadAssets() {
  const [gelasio, gelasioBold, caveat, avatar] = await Promise.all([
    fontFile("@fontsource/gelasio", "gelasio-latin-400-normal.woff"),
    fontFile("@fontsource/gelasio", "gelasio-latin-700-normal.woff"),
    fontFile("@fontsource/caveat", "caveat-latin-700-normal.woff"),
    avatarFile(),
  ]);
  return {
    fonts: [
      { name: "Gelasio", data: gelasio, weight: 400 as const, style: "normal" as const },
      { name: "Gelasio", data: gelasioBold, weight: 700 as const, style: "normal" as const },
      { name: "Caveat", data: caveat, weight: 700 as const, style: "normal" as const },
    ],
    avatar: `data:image/png;base64,${avatar.toString("base64")}`,
  };
}

// ---- palette / per-section flavour (Rosé Pine Dawn) -------------------------
const rp = {
  base: "#faf4ed",
  overlay: "#f2e9e1",
  text: "#575279",
  subtle: "#797593",
  muted: "#9893a5",
};

export type OgKind = "home" | "note" | "syndication" | "about" | "section" | "tag";

const flavour: Record<OgKind, { accent: string; label: string }> = {
  home: { accent: "#907aa9", label: "~" }, // iris
  note: { accent: "#56949f", label: "note" }, // foam
  syndication: { accent: "#b4637a", label: "syndication" }, // love
  about: { accent: "#ea9d34", label: "about" }, // gold
  section: { accent: "#907aa9", label: "index" }, // iris
  tag: { accent: "#d7827e", label: "tag" }, // rose
};

const hexToRgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
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

// ---- template ---------------------------------------------------------------
function markup(input: OgInput, avatar: string): Node {
  const { accent, label: defLabel } = flavour[input.kind];
  const label = input.label ?? defLabel;
  const title = clamp(input.title, 92);
  const desc = input.description ? clamp(input.description, 150) : "";
  const titleSize = title.length < 32 ? 78 : title.length < 64 ? 62 : 50;

  const chips = (input.chips ?? []).slice(0, 4).map((c) =>
    h(
      "div",
      {
        display: "flex",
        padding: "8px 16px",
        borderRadius: 999,
        background: rp.overlay,
        color: rp.subtle,
        fontSize: 24,
      },
      c,
    ),
  );

  return h(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      width: 1200,
      height: 630,
      position: "relative",
      background: rp.base,
      color: rp.text,
      fontFamily: "Gelasio",
      padding: "66px 74px",
    },
    [
      // accent side bar + soft glow
      h("div", { display: "flex", position: "absolute", top: 0, left: 0, width: 14, height: 630, background: accent }),
      h("div", {
        display: "flex",
        position: "absolute",
        top: -120,
        right: -120,
        width: 420,
        height: 420,
        borderRadius: 999,
        background: hexToRgba(accent, 0.12),
      }),

      // header row: label pill + wordmark
      h("div", { display: "flex", alignItems: "center", gap: 18 }, [
        h(
          "div",
          {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "9px 22px",
            borderRadius: 999,
            background: hexToRgba(accent, 0.16),
            border: `1px solid ${hexToRgba(accent, 0.5)}`,
          },
          [
            h("div", { display: "flex", width: 12, height: 12, borderRadius: 999, background: accent }),
            h("div", { display: "flex", color: accent, fontSize: 28, fontWeight: 700 }, label),
          ],
        ),
        h("div", { display: "flex", fontFamily: "Caveat", fontSize: 34, color: rp.muted }, "pwnwriter.me"),
      ]),

      // title + description
      h(
        "div",
        { display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", gap: 22 },
        [
          h("div", { display: "flex", fontWeight: 700, fontSize: titleSize, lineHeight: 1.12, color: rp.text }, title),
          ...(desc ? [h("div", { display: "flex", fontSize: 30, lineHeight: 1.45, color: rp.subtle }, desc)] : []),
        ],
      ),

      // footer: avatar + name + chips
      h("div", { display: "flex", alignItems: "center", justifyContent: "space-between" }, [
        h("div", { display: "flex", alignItems: "center", gap: 18 }, [
          h("div", { display: "flex", padding: 3, borderRadius: 22, background: accent }, [
            h("img", { width: 90, height: 90, borderRadius: 19 }, undefined, { src: avatar }),
          ]),
          h("div", { display: "flex", flexDirection: "column" }, [
            h("div", { display: "flex", fontWeight: 700, fontSize: 30, color: rp.text }, "Nabeen Tiwaree"),
            h("div", { display: "flex", fontFamily: "Caveat", fontSize: 34, color: accent }, "Coffee. Code. Pwn."),
          ]),
        ]),
        h("div", { display: "flex", alignItems: "center", gap: 12 }, chips),
      ]),
    ],
  );
}

// ---- public API -------------------------------------------------------------
export async function generateOg(input: OgInput): Promise<Buffer> {
  assets ??= await loadAssets();
  const svg = await satori(markup(input, assets.avatar) as any, {
    width: 1200,
    height: 630,
    fonts: assets.fonts,
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
    .render()
    .asPng();
  return png;
}
