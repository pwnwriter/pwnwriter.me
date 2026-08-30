// Music shown on the /stuff music tab. `status` can flag a small tag ("loop").
// Reuses the bookshelf list style. Edit freely.

export type Track = {
  title: string; // track or album
  artist?: string;
  note?: string;
  url?: string;
  status?: string;
};
export type MusicGroup = { label: string; items: Track[] };

export const music: MusicGroup[] = [
  {
    label: "on repeat",
    items: [
      { title: "Awake", artist: "Tycho", note: "the sound of a good deploy", status: "loop" },
      { title: "Migration", artist: "Bonobo", note: "background hum for long sessions" },
    ],
  },
  {
    label: "coding fuel",
    items: [
      { title: "Minecraft — Volume Alpha", artist: "C418", note: "yes, that one. still perfect" },
      { title: "Music Has the Right to Children", artist: "Boards of Canada", note: "warm static and focus" },
      { title: "Selected Ambient Works 85-92", artist: "Aphex Twin", note: "for the 2am refactors" },
    ],
  },
  {
    label: "when i need a pulse",
    items: [
      { title: "Cross", artist: "Justice", note: "compile faster, allegedly" },
    ],
  },
];
