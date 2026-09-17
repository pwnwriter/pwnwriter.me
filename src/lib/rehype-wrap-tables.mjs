// Wrap every markdown <table> in a horizontally scrollable container so wide
// tables (long inline code, many columns) can scroll on their own instead of
// blowing past the article column and off the edge of the page.
//
// Note: we replace the table in place and then continue WITHOUT descending into
// the new wrapper. Recursing into it would find the same table again and wrap
// it forever, corrupting the tree (and silently emptying the whole document).
export default function rehypeWrapTables() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!Array.isArray(node.children)) return;

  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];

    if (child.type === "element" && child.tagName === "table") {
      node.children[i] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["table-scroll"],
          role: "region",
          ariaLabel: "table, scroll horizontally to see more",
          tabIndex: 0,
        },
        children: [child],
      };
      continue; // skip the wrapper we just made; don't re-wrap the table
    }

    walk(child);
  }
}
