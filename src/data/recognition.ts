// Wins, placements, and rooms i got invited into. Keep this newest first:
// the home page shows the top two, /recognition lists them all.
// `href` points at the write-up when there is one.

export type Recognition = {
  title: string;
  where?: string;
  year?: number;
  result: string;
  note?: string;
  href?: string;
  featured?: boolean;
};

export const recognition: Recognition[] = [
  {
    title: "Maryland Air Cyber Showdown CTF",
    where: "Towson University",
    year: 2026,
    result: "1st place",
    note: "team TU-2026-Team-08, 20,951 points. every flag came out of a pure nix shell.",
    href: "/notes/notes-cyber-showdown-nix",
    featured: true,
  },
  {
    title: "HopHacks",
    where: "Johns Hopkins University",
    year: 2026,
    result: "2nd place",
    featured: true,
  },
  {
    title: "Black Hat USA",
    where: "Las Vegas",
    year: 2026,
    result: "scholarship",
    note: "got into the room on a scholarship.",
    href: "/syndications/summer-scholarships",
    featured: true,
  },
  {
    title: "MorganHacks",
    where: "Morgan State University",
    year: 2026,
    result: "best use of elevenlabs",
    note: "built inventoryAi with the team over two mostly sleepless days.",
    href: "/syndications/morganhacks-26",
    featured: true,
  },
  {
    title: "OWASP CTF",
    year: 2023,
    result: "1st place",
  },
  {
    title: "OWASP Kathmandu 0x03",
    where: "Kathmandu",
    year: 2023,
    result: "speaker",
    note: "presented haylxon, my screenshot and recon cli.",
    href: "/notes/owasp-talk",
  },
  {
    title: "eJPT",
    where: "INE",
    result: "certified",
    note: "eLearnSecurity Junior Penetration Tester.",
  },
];
