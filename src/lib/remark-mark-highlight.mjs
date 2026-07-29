export default function remarkMarkHighlight() {
  return (tree) => {
    transformChildren(tree);
  };
}

function transformChildren(parent) {
  if (!parent || !Array.isArray(parent.children)) return;

  for (let index = 0; index < parent.children.length; index += 1) {
    const child = parent.children[index];

    if (child.type === "text") {
      const replacement = splitHighlightText(child.value);
      if (replacement.length > 1) {
        parent.children.splice(index, 1, ...replacement);
        index += replacement.length - 1;
      }
      continue;
    }

    transformChildren(child);
  }
}

function splitHighlightText(value) {
  const parts = [];
  const pattern = /==([^=\n]+)==/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      parts.push({ type: "text", value: value.slice(cursor, match.index) });
    }

    parts.push({
      type: "mark",
      data: { hName: "mark" },
      children: [{ type: "text", value: match[1] }],
    });

    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) {
    parts.push({ type: "text", value: value.slice(cursor) });
  }

  return parts.length ? parts : [{ type: "text", value }];
}
