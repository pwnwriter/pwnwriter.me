const INTERNAL_HOSTS = new Set(["pwnwriter.me", "www.pwnwriter.me"]);

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== "element" || node.tagName !== "a") return;

      const href = node.properties?.href;
      if (typeof href !== "string") return;

      const url = toExternalUrl(href);
      if (!url) return;

      node.properties.target = "_blank";
      node.properties.rel = ["noopener", "noreferrer", "external"];
      node.properties.dataExternal = "";
      node.properties.dataDomain = url.hostname.replace(/^www\./, "");
    });
  };
}

function visit(node, callback) {
  callback(node);

  if (!Array.isArray(node.children)) return;

  for (const child of node.children) {
    visit(child, callback);
  }
}

function toExternalUrl(href) {
  let url;

  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;
  if (INTERNAL_HOSTS.has(url.hostname)) return null;

  return url;
}
