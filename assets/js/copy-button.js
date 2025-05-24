const copyButtonLabel = "copy";

let blocks = document.querySelectorAll("pre");

blocks.forEach((block) => {
  if (navigator.clipboard) {
    // Create the container div and add the "language" class
    let container = document.createElement("div");
    container.className = "language";

    // Get the language name from the data-lang attribute or class
    let language = block.getAttribute("data-lang") || block.className.match(/language-(\w+)/)?.[1] || "txt";

    // Create language label
    let languageLabel = document.createElement("span");
    languageLabel.innerText = language;

    // Create copy button
    let button = document.createElement("button");
    button.innerText = copyButtonLabel;

    // Append language label and copy button to the container
    container.appendChild(languageLabel);
    container.appendChild(button);

    // Insert the container div above the <pre> element
    block.parentNode.insertBefore(container, block);

    // Add click event to copy button
    button.addEventListener("click", async () => {
      await copyCode(block);
      button.innerText = "copied!";
      setTimeout(() => (button.innerText = copyButtonLabel), 2000);
    });
  }
});

async function copyCode(block) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);
}

