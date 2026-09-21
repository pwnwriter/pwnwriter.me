// What i'm actually good at, grouped, and where to see each one in use.
// A skill with no proof is just a word, so every group links to the work.

export type Proof = { label: string; href: string };
export type SkillGroup = { label: string; items: string[]; proof: Proof[] };

export const skills: SkillGroup[] = [
  {
    label: "languages",
    items: ["Rust", "C", "Go", "Python", "Lua", "Bash", "TypeScript"],
    proof: [
      { label: "haylxon", href: "/projects#haylxon" },
      { label: "eipi.boo", href: "/projects#eipi-boo" },
      { label: "hysp", href: "/projects#hysp" },
    ],
  },
  {
    label: "security",
    items: ["pwn", "reversing", "web recon", "pentesting", "hardening"],
    proof: [
      { label: "ctf write-up", href: "/notes/notes-cyber-showdown-nix" },
      { label: "haylxon", href: "/projects#haylxon" },
    ],
  },
  {
    label: "nix & linux",
    items: ["Nix / NixOS", "packaging", "reproducible builds", "self-hosting"],
    proof: [
      { label: "nixpkgs", href: "/stuff#oss" },
      { label: "metis linux", href: "/projects#metis" },
      { label: "the setup", href: "/projects#setup" },
    ],
  },
  {
    label: "infra & ci",
    items: ["AWS", "Nginx", "Kubernetes", "GitHub Actions", "GitLab CI", "Jenkins"],
    proof: [{ label: "homelab notes", href: "/notes/tags/homelab" }],
  },
  {
    label: "ai",
    items: ["LLM apps", "RAG", "data ingestion", "search"],
    proof: [{ label: "tes.chat", href: "/projects#tes-chat" }],
  },
];

export type Job = {
  org: string;
  role: string;
  where: string;
  span: string;
  points: string[];
};

export const experience: Job[] = [
  {
    org: "Nest Nepal",
    role: "DevSecOps engineer, previously intern",
    where: "Kathmandu, Nepal",
    span: "2022 to 2024",
    points: [
      "moved server configuration to nix, so machines stayed consistent and deploys stopped being snowflake fixes.",
      "built a rust api handler that cut load time and reduced server overhead.",
      "designed github pipelines that cut downtime by about 30% by catching failures earlier.",
      "owned production ops on aws ec2 and nginx: hardening, maintenance, incident cleanup.",
    ],
  },
];
