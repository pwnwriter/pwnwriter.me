import { defineCollection, z } from 'astro:content';

const postCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.date().transform((val) => new Date(val)),
      modDate: z.date().transform((val) => new Date(val)),
      tags: z.array(z.string()),
      cover: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
      links: z
        .array(z.object({ name: z.string(), url: z.string() }))
        .optional(),
    }),
});

const syndicationCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date().transform((val) => new Date(val)),
    modDate: z.date().transform((val) => new Date(val)),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  posts: postCollection,
  syndications: syndicationCollection,
};
