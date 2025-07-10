import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeUrls from 'rehype-urls';
import rehypeStringify from 'rehype-stringify';

export async function GET(context) {
  const baseUrl = import.meta.env.DEV
    ? 'http://localhost:3000'
    : context.site.origin;

  const parse = (data) =>
    unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeUrls, (url) => {
        return url.href.startsWith('/') ? baseUrl + url.href : url.href;
      })
      .use(rehypeStringify)
      .processSync(data);

  // fetch both collections
  const posts = await getCollection('posts');
  const syndications = await getCollection('syndications');

  // merge & sort by pubDate desc
  const allItems = [...posts, ...syndications].sort(
    (a, b) => b.data.pubDate - a.data.pubDate
  );

  return rss({
    title: 'pwn::musings & syndications',
    description: 'Posts and syndications feed',
    site: baseUrl,
    items: allItems.map((item) => {
      // fallback link: check which collection
      const link = item.collection === 'posts'
        ? `/notes/${item.slug}/`
        : `/syndications/${item.slug}/`;

      const coverHTML =
        item.data.cover?.src?.src
          ? `<img src="${item.data.cover.src.src.replace('/src', baseUrl)}" alt="${item.data.cover.alt}"/>\n`
          : '';

      return {
        title: item.data.title,
        pubDate: item.data.pubDate,
        link,
        content: String(`${coverHTML}${parse(item.body)}`),
      };
    }),
    customData: `<image><url>${baseUrl}/favicon-lg.png</url><title>pwn::musings logo: a simple tree icon formed by light lines on a dark background</title><link>${baseUrl}</link></image>`,
  });
}
