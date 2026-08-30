// The /stuff uses tab: machines + the tools i actually run, all declared in
// nix (github.com/pwnwriter/nix). Pulled from that config; edit freely.

export type Device = {
  name: string; // hostname
  kind: string; // laptop | desktop | homelab | vps
  role: string;
  specs?: string;
  os: string;
};

export type UseItem = { name: string; note?: string };
export type UseGroup = { label: string; items: UseItem[] };

export const devices: Device[] = [
  { name: "whiterose", kind: "laptop", role: "daily driver", specs: "MacBook · Apple Silicon", os: "macOS · nix-darwin" },
  { name: "darlene", kind: "desktop", role: "the heavy lifting", specs: "Mac Mini · Apple Silicon", os: "macOS · nix-darwin" },
  { name: "dom", kind: "homelab", role: "self-hosts everything", specs: "x86_64 · Intel", os: "NixOS" },
  { name: "elliot", kind: "vps", role: "reachable from anywhere", specs: "x86_64", os: "Linux · home-manager" },
];

export const software: UseGroup[] = [
  {
    label: "editor & terminal",
    items: [
      { name: "Neovim", note: "yes, it's neovim (neovide when i want a window)" },
      { name: "Ghostty", note: "terminal. no tmux, just splits" },
      { name: "Lilex Nerd Font", note: "everywhere a monospace goes" },
    ],
  },
  {
    label: "shell",
    items: [
      { name: "Zsh + Starship", note: "a prompt that tells me where i am" },
      { name: "zoxide", note: "cd, but it remembers" },
      { name: "eza · bat · fd · ripgrep", note: "the coreutils i actually reach for" },
      { name: "fzf", note: "fuzzy everything" },
      { name: "yazi", note: "file manager in the terminal" },
      { name: "bottom", note: "for when something's on fire" },
      { name: "direnv · just", note: "per-project envs and task running" },
    ],
  },
  {
    label: "languages",
    items: [
      { name: "Rust", note: "the one i keep coming back to" },
      { name: "Go", note: "when it just needs to ship" },
      { name: "Zig", note: "for the curiosity" },
    ],
  },
  {
    label: "nix",
    items: [
      { name: "NixOS + nix-darwin", note: "every machine above, declared" },
      { name: "home-manager", note: "one dotfiles set across every host" },
      { name: "Determinate Nix + flakes", note: "how it all builds" },
      { name: "agenix", note: "secrets, safe in a public repo" },
    ],
  },
  {
    label: "version control & keys",
    items: [
      { name: "git + jujutsu (jj)", note: "jj on top of git, mostly" },
      { name: "GnuPG + pass", note: "keys and passwords" },
      { name: "OpenSSH", note: "the glue between all four machines" },
    ],
  },
];
