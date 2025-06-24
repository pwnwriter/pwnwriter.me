import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeUrls from 'rehype-urls';
import rehypeStringify from 'rehype-stringify';

// todo: maybe use prism theme for codeblocks

// info: https://docs.astro.build/en/guides/rss/
export async function get(context) {
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

	const posts = await getCollection('posts');
	return rss({
    title: 'pwn::musings',
		description: 'notes from pwn::musings',
		// info: https://docs.astro.build/en/reference/api-reference/#contextsite
		site: baseUrl,
		items: posts.map((post) => ({
			...post.data,
			title: post.data.title,
			pubDate: post.data.pubDate,
			link: `/notes/${post.slug}/`,
			content: String(
				`<img src="${post.data.cover.src.src.replace('/src', baseUrl)}" alt="${
					post.data.cover.alt
				}"/>\n${parse(post.body)}`
			),
		})),
    customData: `<image><url>${baseUrl}/favicon-lg.png</url><title>pwn::musings logo: a simple tree icon formed by light lines on a dark background</title><link>${baseUrl}</link></image>`,
	});
}
