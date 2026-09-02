// Open-source contributions shown on the /stuff oss tab. Pulled from my github
// pull requests (author:pwnwriter) and curated down to the notable ones. The
// full, unabridged list lives behind the "all 89 pull requests" link.

// Curated fallback numbers, used verbatim if the build-time github fetch fails
// (offline build, rate limit, api hiccup) so a build never breaks.
export const ossSummary = {
  merged: 62,
  projects: 33,
  total: 89,
  contributions: 3817, // lifetime contributions (commits + prs + reviews)
  span: "2022 to now",
  allUrl: "https://github.com/pulls?q=is%3Apr+author%3Apwnwriter",
};

export type OssStats = {
  merged: number;
  projects: number;
  total: number;
  contributions: number;
  live: boolean; // true when numbers came from github, false = fell back
};

// Runs at build time (called from the /stuff frontmatter). Pulls every PR i've
// authored, counts merged ones and distinct external projects, and returns the
// curated fallback on any failure.
export async function fetchOssStats(user = "pwnwriter"): Promise<OssStats> {
  const fallback: OssStats = {
    merged: ossSummary.merged,
    projects: ossSummary.projects,
    total: ossSummary.total,
    contributions: ossSummary.contributions,
    live: false,
  };

  // lifetime contributions (commits/prs/reviews on the graph), summed across
  // every year. its own try/catch so a hiccup here doesn't sink the pr stats.
  let contributions = ossSummary.contributions;
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=all`,
      { headers: { "User-Agent": `${user}.me-build` } },
    );
    if (res.ok) {
      const data = await res.json();
      const totals = Object.values(data.total ?? {}) as number[];
      const sum = totals.reduce((n, v) => n + (v || 0), 0);
      if (sum > 0) contributions = sum;
    }
  } catch {
    /* keep the fallback contributions count */
  }

  try {
    const headers = {
      "User-Agent": `${user}.me-build`,
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    };

    const items: { html_url: string; pull_request?: { merged_at?: string } }[] =
      [];
    let total = 0;

    // paginate defensively (100/page) in case the pile grows past one page
    for (let page = 1; page <= 5; page++) {
      const url =
        "https://api.github.com/search/issues?q=" +
        encodeURIComponent(`type:pr author:${user}`) +
        `&per_page=100&page=${page}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`github ${res.status}`);
      const data = await res.json();
      total = data.total_count ?? total;
      const batch = data.items ?? [];
      items.push(...batch);
      if (items.length >= total || batch.length === 0) break;
    }

    if (!items.length) return fallback;

    const merged = items.filter((i) => i.pull_request?.merged_at).length;
    const projects = new Set(
      items
        .map((i) => i.html_url.split("/").slice(3, 5).join("/"))
        .filter((repo) => !repo.startsWith(`${user}/`)),
    ).size;

    return {
      merged,
      projects,
      total: total || items.length,
      contributions,
      live: true,
    };
  } catch {
    return { ...fallback, contributions };
  }
}

export type Contribution = {
  repo: string; // "getzola/zola"
  url: string; // pr link, or a filtered pr list for multi-pr repos
  lang?: string;
  desc: string; // what the project is
  what: string; // what i did
  count?: number; // merged prs, when more than one
};

// notable merged work, roughly by how well-known the project is
export const highlights: Contribution[] = [
  {
    repo: "getzola/zola",
    url: "https://github.com/getzola/zola/pull/2023",
    lang: "Rust",
    desc: "a fast static site generator",
    what: "added sites to the official showcase",
  },
  {
    repo: "huggingface/candle",
    url: "https://github.com/huggingface/candle/pull/3800",
    lang: "Rust",
    desc: "a minimalist ml framework",
    what: "proposed reproducible nix dev shells for rust, pyo3, and wasm",
  },
  {
    repo: "lycheeverse/lychee",
    url: "https://github.com/lycheeverse/lychee/pull/1458",
    lang: "Rust",
    desc: "an async link checker",
    what: "show the help menu when run with no args",
  },
  {
    repo: "spider-rs/spider",
    url: "https://github.com/spider-rs/spider/pull/265",
    lang: "Rust",
    desc: "the fastest web crawler",
    what: "trigger the help page on missing arguments",
  },
  {
    repo: "nix-community/home-manager",
    url: "https://github.com/nix-community/home-manager/pull/5953",
    lang: "Nix",
    desc: "declarative dotfiles for nix",
    what: "fixed the pls perm argument passing",
  },
  {
    repo: "mfontanini/presenterm",
    url: "https://github.com/mfontanini/presenterm/pulls?q=author%3Apwnwriter",
    lang: "Rust",
    desc: "markdown slideshows in the terminal",
    what: "release ci, an mdbook docs site, aur packages, and a demo talk",
    count: 4,
  },
  {
    repo: "mufeedvh/code2prompt",
    url: "https://github.com/mufeedvh/code2prompt/pulls?q=author%3Apwnwriter",
    lang: "Rust",
    desc: "turn a codebase into an llm prompt",
    what: "install docs, a help menu, and clippy cleanups",
    count: 3,
  },
  {
    repo: "cestef/rwalk",
    url: "https://github.com/cestef/rwalk/pulls?q=author%3Apwnwriter",
    lang: "Rust",
    desc: "a fast directory fuzzer",
    what: "reproducible nix builds and a nix install method",
    count: 2,
  },
  {
    repo: "Magic-JD/is-fast",
    url: "https://github.com/Magic-JD/is-fast/pull/16",
    lang: "Rust",
    desc: "read stackoverflow from the terminal",
    what: "fixed the test suite and nix build",
  },
  {
    repo: "metis-os/heliumbar",
    url: "https://github.com/metis-os/heliumbar/pulls?q=author%3Apwnwriter",
    lang: "Rust",
    desc: "a status bar for hyprland",
    what: "wrote the working bar and the hyprland workspace modules",
    count: 7,
  },
  {
    repo: "brianaung/compl.nvim",
    url: "https://github.com/brianaung/compl.nvim/pull/1",
    lang: "Lua",
    desc: "a minimal neovim completion plugin",
    what: "a nix devshell for all systems",
  },
];

// packages i added to nixpkgs (init at ...)
export const nixpkgs: { name: string; url: string }[] = [
  { name: "kanha", url: "https://github.com/NixOS/nixpkgs/pull/333493" },
  { name: "x4", url: "https://github.com/NixOS/nixpkgs/pull/346736" },
  { name: "rwalk", url: "https://github.com/NixOS/nixpkgs/pull/366586" },
  { name: "is-fast", url: "https://github.com/NixOS/nixpkgs/pull/388004" },
  { name: "box-cli", url: "https://github.com/NixOS/nixpkgs/pull/535650" },
];
