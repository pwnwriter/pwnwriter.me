import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { formatDate } from "~/lib/utils";

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts");
  const syndications = await getCollection("syndications");

  posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  syndications.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const lines = [
    "# pwnwriter.me",
    "",
    "> Personal site of Nabeen Tiwaree (pwnwriter) — cybersecurity student, open-source contributor, minimalist.",
    "",
    "## Pages",
    "",
    "- [Home](https://pwnwriter.me/)",
    "- [About](https://pwnwriter.me/about)",
    "- [Notes](https://pwnwriter.me/notes)",
    "- [Syndications](https://pwnwriter.me/syndications)",
    "- [Photos](https://pwnwriter.me/photos)",
    "- [RSS](https://pwnwriter.me/rss.xml)",
    "- [Full LLM content](https://pwnwriter.me/llms-full.txt)",
    "",
    "## Notes",
    "",
    ...posts.map(
      (p) =>
        `- [${p.data.title}](https://pwnwriter.me/notes/${p.slug}) (${formatDate(p.data.pubDate)})`,
    ),
    "",
    "## Syndications",
    "",
    ...syndications.map(
      (s) =>
        `- [${s.data.title}](https://pwnwriter.me/syndications/${s.slug}) (${formatDate(s.data.pubDate)})`,
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
