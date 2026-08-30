// Bookshelf shown on /stuff/bookshelf - books, papers, and writeups worth
// keeping. `status` can flag what you're on now ("reading"). Edit freely.

export type Book = {
  title: string;
  author?: string;
  note?: string;
  url?: string;
  status?: string; // e.g. "reading"
};
export type ShelfGroup = { label: string; items: Book[] };

export const bookshelf: ShelfGroup[] = [
  {
    label: "books",
    items: [
      { title: "The Pragmatic Programmer", author: "Hunt & Thomas", note: "the one i reread and quietly steal habits from" },
      { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", note: "the systems bible", status: "reading" },
      { title: "The Rust Programming Language", author: "Klabnik & Nichols", note: "borrow-checker bootcamp" },
    ],
  },
  {
    label: "papers worth keeping",
    items: [
      { title: "Reflections on Trusting Trust", author: "Ken Thompson", url: "https://dl.acm.org/doi/10.1145/358198.358210", note: "the compiler-backdoor classic" },
      { title: "Smashing the Stack for Fun and Profit", author: "Aleph One", url: "http://phrack.org/issues/49/14.html", note: "where a lot of us started" },
    ],
  },
  {
    label: "writeups i learned from",
    items: [
      { title: "LiveOverflow: binary exploitation", url: "https://liveoverflow.com", note: "watch, pause, try, repeat" },
    ],
  },
];
