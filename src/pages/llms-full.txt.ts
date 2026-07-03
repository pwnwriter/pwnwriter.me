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

  const sections: string[] = [
    "# pwnwriter.me — full content",
    "",
    "> Personal site of Nabeen Tiwaree (pwnwriter) — cybersecurity student based in Miami, FL. Interests: open-source, Nix/NixOS, Rust, DevOps, minimalism.",
    "",
    "---",
    "",
    "## About",
    "",
    "I am Nabeen Tiwaree. Online I go by pwnwriter.",
    "",
    "I'm a student who loves minimalism, open-source, and occasionally playing cricket. I enjoy digging into how things work under the hood and breaking software.",
    "",
    "- Pronouns: He/him",
    "- Location: Miami, FL",
    "- Contact: hi@pwnwriter.me / x.com/pwnwriter",
    "- GitHub: github.com/pwnwriter",
    "",
  ];

  // Notes
  sections.push("---", "", "## Notes", "");

  for (const post of posts) {
    const tags = post.data.tags.map((t) => `#${t}`).join(" ");
    sections.push(
      `### ${post.data.title}`,
      "",
      `**Date:** ${formatDate(post.data.pubDate)} | **Tags:** ${tags}`,
      `**URL:** https://pwnwriter.me/notes/${post.slug}`,
      "",
      post.body ?? "",
      "",
      "---",
      "",
    );
  }

  // Syndications
  sections.push("## Syndications", "");

  for (const syn of syndications) {
    const tags = (syn.data.tags || []).map((t) => `#${t}`).join(" ");
    sections.push(
      `### ${syn.data.title}`,
      "",
      `**Date:** ${formatDate(syn.data.pubDate)}${tags ? ` | **Tags:** ${tags}` : ""}`,
      `**URL:** https://pwnwriter.me/syndications/${syn.slug}`,
      "",
      syn.body ?? "",
      "",
      "---",
      "",
    );
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
