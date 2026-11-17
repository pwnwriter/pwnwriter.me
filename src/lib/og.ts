import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

// ---- one-time font loading --------------------------------------------------
// the same faces the site uses: Hanken Grotesk for words, Departure Mono for
// labels. satori wants static files, hence @fontsource/hanken-grotesk next to
// the variable one.
const hanken = (weight: number) =>
  readFile(
    join(
      dirname(require.resolve("@fontsource/hanken-grotesk/package.json")),
      "files",
      `hanken-grotesk-latin-${weight}-normal.woff`,
    ),
  );

const departure = () =>
  readFile(join(process.cwd(), "public", "fonts", "DepartureMono-Regular.woff"));

async function loadFonts() {
  const [regular, medium, bold, mono] = await Promise.all([
    hanken(400),
    hanken(500),
    hanken(700),
    departure(),
  ]);
  return [
    { name: "Hanken Grotesk", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Hanken Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Departure Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

let fonts: Awaited<ReturnType<typeof loadFonts>> | null = null;

// ---- palette (evergarden summer, the site's light theme) --------------------
const rp = {
  base: "#f1f1f3",
  high: "#25262c",
  low: "#5e606b",
  subtle: "#737581",
  muted: "#737581",
  line: "rgba(69, 83, 85, 0.16)",
  accent: "#627d91",
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
  home: "Nabeen / pwnwriter",
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

function markup(input: OgInput): Node {
  const title = clamp(input.title, 84);
  const long = title.length >= 48;
  const titleSize = title.length < 24 ? 88 : long ? 56 : 70;
  const desc = input.description ? clamp(input.description, long ? 96 : 108) : "";

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
      fontFamily: "Hanken Grotesk",
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

      h("div", { display: "flex", height: 1, background: rp.line }),

      h("div", { display: "flex", justifyContent: "space-between", marginTop: 22 }, [
        h("div", mono(20, rp.accent, { letterSpacing: 4 }), label.toUpperCase()),
        h("div", mono(20, rp.muted), meta),
      ]),
    ],
  );
}

function homeMarkup(media: {portrait:string;wosa:string;whoami:string}):Node {
 const badge=(name:string,logo:string)=>h('div',{display:'flex',alignItems:'center',gap:10,padding:'10px 15px',border:'1px solid #d5d8e1',borderRadius:12,background:'#e9ebf1',fontSize:25,color:rp.high},[h('img',{borderRadius:6},undefined,{src:logo,width:28,height:28}),h('span',{display:'flex'},name)]);
 return h('div',{display:'flex',flexDirection:'column',width:WIDTH,height:HEIGHT,padding:'58px 72px',background:rp.base,color:rp.high,fontFamily:'Hanken Grotesk'},[
  h('div',{display:'flex',alignItems:'center',justifyContent:'space-between'},[
   h('div',{display:'flex',alignItems:'center',gap:18},[h('img',{borderRadius:20,objectFit:'cover',objectPosition:'25% 70%',border:'3px solid #fafafc'},undefined,{src:media.portrait,width:76,height:76}),h('div',{display:'flex',flexDirection:'column',gap:6},[h('span',{fontSize:23},'Nabeen / pwnwriter'),h('span',mono(16,rp.muted),'MD, USA')])]),
   h('span',mono(18,rp.muted),'pwnwriter.me')
  ]),
  h('div',{display:'flex',flexDirection:'column',flexGrow:1,justifyContent:'center',gap:16},[
   h('div',{fontSize:68,letterSpacing:-2,lineHeight:1.1},'Hey, I’m Nabeen.'),
   h('div',{display:'flex',alignItems:'baseline',gap:10,fontSize:30,color:rp.subtle},[h('span',{},'22, a'),h('span',{color:rp.accent},'tinkerer at heart.' )]),
   h('div',{fontSize:29,lineHeight:1.45,color:rp.subtle,maxWidth:900},'I do security research and build interfaces.'),
  ]),
  h('div',{display:'flex',alignItems:'center',gap:14,paddingBottom:30},[h('span',{fontSize:22,color:rp.muted,marginRight:4},'Recent work'),badge('wosa.study',media.wosa),badge('whoami.cards',media.whoami)]),
  h('div',{display:'flex',justifyContent:'space-between',borderTop:'1px solid #d7d8df',paddingTop:20},[h('span',mono(17,rp.muted),'LINUX · RUST · NIX'),h('span',mono(17,rp.accent),'@pwnwriter')]),
 ]);
}

// ---- public API -------------------------------------------------------------
export async function generateOg(input: OgInput): Promise<Buffer> {
  fonts ??= await loadFonts();
  let tree=markup(input);
  if(input.kind==='home'&&!input.label){
    const [portrait,wosa,whoami]=await Promise.all([
      readFile(join(process.cwd(),'src/assets/sf-golden-gate.jpg')),
      readFile(join(process.cwd(),'public/images/previews/wosa-logo.svg')),
      readFile(join(process.cwd(),'public/images/previews/whoami-logo.svg')),
    ]);
    tree=homeMarkup({portrait:`data:image/jpeg;base64,${portrait.toString('base64')}`,wosa:`data:image/svg+xml;base64,${wosa.toString('base64')}`,whoami:`data:image/svg+xml;base64,${whoami.toString('base64')}`});
  }
  const svg = await satori(tree as any, { width: WIDTH, height: HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
}
