// Movies + shows shown on the /stuff movies tab. `status` can flag a tag
// ("rewatch"). Reuses the bookshelf list style. Edit freely.

export type Movie = {
  title: string;
  year?: string;
  note?: string;
  url?: string;
  status?: string;
};
export type MovieGroup = { label: string; items: Movie[] };

export const movies: MovieGroup[] = [
  {
    label: "on my mind lately",
    items: [
      { title: "Blade Runner 2049", year: "2017", note: "every frame is a wallpaper" },
      { title: "The Social Network", year: "2010", note: "the dialogue moves like a compiler" },
    ],
  },
  {
    label: "comfort rewatches",
    items: [
      { title: "The Matrix", year: "1999", note: "the one that started the terminal obsession", status: "rewatch" },
      { title: "Interstellar", year: "2014", note: "cries in gravitational time dilation" },
    ],
  },
  {
    label: "shows",
    items: [
      { title: "Mr. Robot", year: "2015", note: "the only hacking that looks real on screen" },
      { title: "Silicon Valley", year: "2014", note: "too accurate to be comfortable" },
    ],
  },
];
