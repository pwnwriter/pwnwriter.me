// Blogroll / bookmarks shown on /stuff/bookmarks. Peak personal-web energy:
// the people and pages worth someone else's feed reader. Edit freely.

export type Bookmark = { title: string; url: string; note?: string };
export type BookmarkGroup = { label: string; items: Bookmark[] };

export const bookmarks: BookmarkGroup[] = [
  {
    label: "people i read",
    items: [
      { title: "Julia Evans (b0rk)", url: "https://jvns.ca", note: "the zines that made systems finally click" },
      { title: "Xe Iaso", url: "https://xeiaso.net", note: "nix, go, and unusually sharp writing" },
      { title: "fasterthanli.me", url: "https://fasterthanli.me", note: "rust, deep and patient" },
    ],
  },
  {
    label: "nix & systems",
    items: [
      { title: "nix.dev", url: "https://nix.dev", note: "the docs that should have shipped first" },
      { title: "NixOS & Flakes Book", url: "https://nixos-and-flakes.thiscute.world", note: "the flakes explainer i send everyone" },
    ],
  },
  {
    label: "security",
    items: [
      { title: "HackTricks", url: "https://book.hacktricks.xyz", note: "the pentest field manual" },
      { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", note: "still the best web-appsec labs" },
    ],
  },
  {
    label: "tabs i never close",
    items: [
      { title: "explainshell", url: "https://explainshell.com", note: "decode any command's flags" },
      { title: "caniuse", url: "https://caniuse.com" },
    ],
  },
];
