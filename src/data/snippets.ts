// Snippets / cheatsheet shown on /stuff/snippets - the commands you re-Google
// until your fingers memorize them. Each has a click-to-copy button. Edit away.

export type Snippet = { title: string; note?: string; code: string };
export type SnippetGroup = { label: string; items: Snippet[] };

export const snippets: SnippetGroup[] = [
  {
    label: "nix",
    items: [
      { title: "run something without installing it", code: "nix run nixpkgs#cowsay -- moo" },
      { title: "throwaway shell with tools", note: "they vanish when you exit", code: "nix shell nixpkgs#{ripgrep,fd,jq}" },
      { title: "garbage-collect the store", code: "nix-collect-garbage -d" },
      { title: "what changed in a rebuild", code: "nvd diff /run/current-system result" },
    ],
  },
  {
    label: "nmap",
    items: [
      { title: "quick service + version scan", code: "nmap -sC -sV -oA scan 10.10.11.42" },
      { title: "all ports, fast, then re-scan", code: "nmap -p- --min-rate 5000 -T4 <ip>" },
    ],
  },
  {
    label: "shell",
    items: [
      { title: "run a binary you don't have (nix)", note: "comma installs nothing", code: "comma htop" },
      { title: "serve the current directory", code: "python -m http.server 8000" },
      { title: "which process holds a port", code: "lsof -i :8080" },
    ],
  },
  {
    label: "git",
    items: [
      { title: "undo last commit, keep the changes", code: "git reset --soft HEAD~1" },
      { title: "what changed, by file", code: "git diff --stat" },
    ],
  },
];
