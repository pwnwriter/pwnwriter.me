// Projects shown on /projects — curated by hand (unlike photos, which are
// auto-discovered). Add a project by appending an object below and dropping its
// media into  public/projects/<slug>/  (self-hosted images + mp4 videos).
//
// Each project's `media` list is what opens in the viewer — mix images and
// videos freely. `cover` is what shows on the card (defaults to media[0]).

export type MediaItem =
  | { kind: "image"; src: string; alt?: string }
  | { kind: "video"; src: string; poster?: string; alt?: string };

export type Project = {
  slug: string;
  name: string;
  blurb: string;
  tech: string[];
  year?: string;
  repo?: string;
  demo?: string;
  cover?: MediaItem; // card thumbnail; falls back to media[0]
  media: MediaItem[]; // gallery shown in the viewer (images + videos)
};

export const projects: Project[] = [
  {
    slug: "setup",
    name: "the setup",
    blurb:
      "the corner i actually work from",
    tech: ["desk", "monitor-arm", "mechanical-kb"], // it's a rice, not a repo — tweak these
    year: "2026",
    cover: {
      kind: "video",
      src: "/projects/setup/demo.mp4",
      poster: "/projects/setup/cover.png",
    },
    media: [
      {
        kind: "video",
        src: "/projects/setup/demo.mp4",
        poster: "/projects/setup/cover.png",
        alt: "a slow pan across my desk setup",
      },
    ],
  },
  {
    slug: "tes-chat",
    name: "tes.chat",
    blurb:
      "Ask a transfer-credit database anything in plain English. Reads transcripts and maps equivalencies across 180+ unis and 20k+ courses.",
    tech: ["ai", "llm", "rag"], // guessed the stack — correct these
    year: "2025",
    // repo: "https://github.com/pwnwriter/tes-chat",
    // demo: "https://tes.chat",
    cover: {
      kind: "video",
      src: "/projects/tes-chat/demo.mp4",
      poster: "/projects/tes-chat/cover.png",
    },
    media: [
      {
        kind: "video",
        src: "/projects/tes-chat/demo.mp4",
        poster: "/projects/tes-chat/cover.png",
        alt: "tes.chat demo",
      },
      {
        kind: "image",
        src: "/projects/tes-chat/cover.png",
        alt: "tes.chat answering a transfer-evaluation query",
      },
    ],
  },
  {
    slug: "eipi-boo",
    name: "eipi.boo",
    blurb: "🫶🏼 2d world of anonymous confession cards, over ssh.",
    tech: ["rust", "ssh", "tui"],
    year: "2025",
    // repo: "https://github.com/pwnwriter/eipi-boo",
    // demo: "ssh eipi.boo",
    media: [
      {
        kind: "image",
        src: "/projects/eipi-boo/cover.png",
        alt: "eipi.boo confession TUI over SSH",
      },
    ],
  },
  {
    slug: "haylxon",
    name: "haylxon",
    blurb: "Blazing-fast tool to grab screenshots of your domain list right from the terminal.",
    tech: ["rust", "tokio", "headless-chrome"],
    year: "2024",
    repo: "https://github.com/pwnwriter/haylxon",
    cover: {
      kind: "video",
      src: "/projects/haylxon/demo.mp4",
      poster: "/projects/haylxon/cover.png",
    },
    media: [
      {
        kind: "video",
        src: "/projects/haylxon/demo.mp4",
        poster: "/projects/haylxon/cover.png",
        alt: "haylxon capturing screenshots from a remote browser",
      },
      {
        kind: "image",
        src: "/projects/haylxon/cover.png",
        alt: "haylxon CLI output",
      },
    ],
  },
];
