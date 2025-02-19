const themes = {
  everforest: [
    'light',
    'dark'
  ],
  gruvbox: [
    "light",
    "dark"
  ],
  night: [
    'solis',
    'spaceduck',
    'gotham',
    'dracula'
  ],
  nord: [
    'light',
    'dark'
  ],
  one: [
    'light',
    'dark'
  ],
  tokyo: [
    'night',
    'night-light'
  ],
  catppuccin: [
    'latte',
    'frappe',
    'macchiato',
    'mocha'
  ],
}

const defaultThemes = {
  light: "gruvbox-light",
  dark: "night-spaceduck"
}

const prefersDark = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

let theme = localStorage.theme || (prefersDark ? defaultThemes.dark : defaultThemes.light);

document.documentElement.dataset.theme = theme;

const q = document.querySelector.bind(document);

function updateThemeSelector() {
  // Create selector element
  let html = `<details><summary for="showThemeSelector">theme: <span id="currentTheme">${theme}</span></summary>`;
  for (var id of Object.keys(themes)) {
    if (themes[id].length) {
      html += `<li><details${theme.split('-')[0] === id ? ' open' : ''}><summary>${id}</summary>`;
    } else {
      html += `<li><a${theme === id ? ' class="current"' : ''}  href="javascript:setTheme('${id}')">${id}</a></li>`;
    }
    for (var variant of themes[id]) {
      html += ` <li><a${theme === id + '-' + variant ? ' class="current"' : ''} href="javascript:setTheme('${id}-${variant}')">${variant}</a></li>`;
    }
    if (themes[id].length) html += `</details></li>`;
  }

  html += `</details>`;

  q('#themeSelector').innerHTML = html;

  // get colors
  const colors = {
    fill: getComputedStyle(q('.main-background'))['backgroundColor'],
    stroke: getComputedStyle(q('.main-background'))['color']
  }

  document.querySelector('meta[name="theme-color"]').setAttribute("content", colors.fill);

}

function setTheme(id) {
  localStorage.setItem('theme', id);
  document.documentElement.dataset.theme = id;
  theme = id;
  updateThemeSelector();
}
