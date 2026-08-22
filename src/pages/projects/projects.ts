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
  summary: string;
  blurb: string;
  highlights?: string[];
  tech: string[];
  year?: string;
  archived?: boolean; // shows an "archived" tag on the card
  status?: string;
  repo?: string;
  demo?: string;
  readMore?: string;
  reddit?: string; // link to a showcase/discussion post
  cover?: MediaItem; // card thumbnail; falls back to media[0]
  media: MediaItem[]; // gallery shown in the viewer (images + videos)
};

export const projects: Project[] = [
  {
    slug: "tes-chat",
    name: "tes.chat",
    summary:
      "natural-language course-equivalency explorer for college transfer planning.",
    blurb:
      "indexed transfer-equivalency information so students could ask about courses and transcripts without digging through catalogs by hand.",
    highlights: [
      "covered 180+ universities and 20k+ courses in the local project data",
      "used retrieval/llm flow to ground answers in collected equivalency records",
      "supported transcript-style course extraction and transfer-evaluation queries",
    ],
    tech: ["AI/LLM", "RAG", "Data ingestion", "Search"],
    year: "2026",
    status: "offline",
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
    slug: "haylxon",
    name: "haylxon",
    summary:
      "high-performance screenshot and web reconnaissance cli written in rust.",
    blurb:
      "drives local or remote chromium over cdp with async concurrency, reusable tab pools, and bulk url input.",
    highlights: [
      "tokio-based parallel execution with configurable tabs and tab pooling",
      "supports files/stdin, full-page screenshots, js injection, proxies, invalid certs, ndjson, and html reports",
      "my github actions hyperfine benchmark: 5 urls / 4 tabs in 1.81s vs gowitness at 26.29s",
    ],
    tech: ["Rust", "Tokio", "CDP", "Chromium", "CLI"],
    year: "2023-present",
    repo: "https://github.com/pwnwriter/haylxon",
    readMore: "/notes/haylxon-remote-pooling",
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
  {
    slug: "eipi-boo",
    name: "eipi.boo",
    summary: "anonymous confession board that runs over ssh.",
    blurb:
      "not a website: users connect from a terminal and post/read confession cards through an ssh-native interface.",
    highlights: [
      "rust network application exposed through ssh instead of a browser ui",
      "terminal-first interaction model: no account signup, no web form",
      "shipped publicly as `ssh eipi.boo` with a small project page",
    ],
    tech: ["Rust", "SSH", "Terminal UI", "Networking"],
    year: "2026",
    demo: "https://eipi.boo",
    readMore: "/syndications/eipi-boo-ssh",
    media: [
      {
        kind: "image",
        src: "/projects/eipi-boo/cover.png",
        alt: "eipi.boo confession TUI over SSH",
      },
    ],
  },
  {
    slug: "metis",
    name: "metis linux",
    summary: "minimal x86_64 linux distribution and package ecosystem.",
    blurb:
      "an archived systems project around building a small linux distribution, package repos, releases, and desktop environments.",
    highlights: [
      "built around core package repositories, iso releases, and x86_64 linux packaging",
      "included dwm and hyprland environments plus distro-specific tooling",
      "paired with hysp for userspace package installation experiments",
    ],
    tech: ["Linux", "Shell", "C", "Lua", "Packaging"],
    year: "2022-2025",
    archived: true,
    status: "archived / no longer maintained",
    repo: "https://github.com/metis-os",
    reddit: "https://www.reddit.com/r/artixlinux/s/LEqgAx2gqS",
    cover: {
      kind: "video",
      src: "/projects/metis/demo.mp4",
      poster: "/projects/metis/cover.png",
    },
    media: [
      {
        kind: "video",
        src: "/projects/metis/demo.mp4",
        poster: "/projects/metis/cover.png",
        alt: "metis linux desktop rice",
      },
      {
        kind: "image",
        src: "/projects/metis/cover.png",
        alt: "metis linux desktop",
      },
    ],
  },
  {
    slug: "hysp",
    name: "hysp",
    summary:
      "rust package manager for installing portable tooling in userspace.",
    blurb:
      "fetches statically compiled tool binaries from package metadata without requiring root access.",
    highlights: [
      "single rust binary with install/remove/search/health package lifecycle commands",
      "uses package metadata, configurable/self-hostable sources, and sha verification",
      "designed for unix/linux environments where security tooling is missing or stale",
    ],
    tech: ["Rust", "CLI", "Linux", "Package manager"],
    year: "2023-2024",
    archived: true,
    status: "archived / no longer maintained",
    repo: "https://github.com/pwnwriter/hysp",
    reddit: "https://www.reddit.com/r/unixporn/s/crLwv641dI",
    cover: {
      kind: "image",
      src: "/projects/hysp/showcase.webp",
      alt: "hysp installing a package on a catppuccin rice",
    },
    media: [
      {
        kind: "image",
        src: "/projects/hysp/showcase.webp",
        alt: "hysp installing a package on a catppuccin rice",
      },
      {
        kind: "image",
        src: "/projects/hysp/cover.png",
        alt: "hysp — harmonizing your system",
      },
    ],
  },
  {
    slug: "setup",
    name: "the setup",
    summary: "the linux-heavy workspace i actually build from.",
    blurb:
      "nix-based daily environment, terminal workflow, mechanical keyboard, and hardware setup tuned for long coding sessions.",
    highlights: [
      "nix/nixos-centered development workflow",
      "terminal and neovim first; reproducible tools over manual setup",
    ],
    tech: ["Nix", "NixOS", "Neovim", "Linux"],
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
];
