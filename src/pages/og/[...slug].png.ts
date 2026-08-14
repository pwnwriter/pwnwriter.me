import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOg, type OgInput } from "~/lib/og";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// strip markdown to a plain-text excerpt (for notes without a description)
const excerpt = (body: string, max = 150) => {
  const clean = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/^[#>*\-\s]+/gm, "")
    .replace(/[_*~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length <= max ? clean : `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
};

type Entry = { slug: string; props: OgInput };

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("posts");
  const syndications = await getCollection("syndications");

  const entries: Entry[] = [
    { slug: "index", props: { kind: "home", title: "Hi, I'm Nabeen", description: "I break things, fix them, and leave notes so future me has fewer excuses." } },
    { slug: "about", props: { kind: "about", title: "About", description: "Nabeen Tiwaree, also known as pwnwriter." } },
    { slug: "notes", props: { kind: "section", label: "notes", title: "Notes", description: "Things I kept thinking about until writing them down was easier than letting them go." } },
    { slug: "notes/tags", props: { kind: "section", label: "tags", title: "Tags", description: "Browse notes by topic." } },
    { slug: "syndications", props: { kind: "section", label: "syndications", title: "Syndications", description: "Personal updates and reflections." } },
    { slug: "projects", props: { kind: "section", label: "projects", title: "Projects", description: "Things I've built — tools, configs, and experiments." } },
    { slug: "photos", props: { kind: "section", label: "photos", title: "Photos", description: "A small archive of my photos." } },
    { slug: "404", props: { kind: "home", label: "404", title: "Page not found", description: "Definitely a bug." } },
  ];

  for (const p of posts) {
    entries.push({
      slug: `notes/${p.slug}`,
      props: {
        kind: "note",
        title: p.data.title,
        description: p.data.description ?? excerpt(p.body),
        chips: [fmtDate(p.data.pubDate), ...p.data.tags.slice(0, 2).map((t) => `#${t}`)],
      },
    });
  }

  for (const s of syndications) {
    entries.push({
      slug: `syndications/${s.slug}`,
      props: {
        kind: "syndication",
        title: s.data.title,
        chips: [fmtDate(s.data.pubDate), ...(s.data.tags ?? []).slice(0, 2).map((t) => `#${t}`)],
      },
    });
  }

  const tags = [...new Set(posts.flatMap((p) => p.data.tags))];
  for (const tag of tags) {
    const count = posts.filter((p) => p.data.tags.includes(tag)).length;
    entries.push({
      slug: `notes/tags/${tag}`,
      props: {
        kind: "tag",
        label: "tag",
        title: `#${tag}`,
        description: `Notes tagged with #${tag}.`,
        chips: [`${count} note${count === 1 ? "" : "s"}`],
      },
    });
  }

  return entries.map((e) => ({ params: { slug: e.slug }, props: e.props }));
};

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOg(props as OgInput);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
