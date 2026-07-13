// Builds the pop-up Porsche 911 GT3 RS and wires it to the ".porsche-egg"
// trigger words. Clicking / hovering / pressing Enter drives the car across
// the screen (see PorscheEasterEgg.astro for the overlay styles) while
// playVroom() plays the engine.

import { playVroom } from "./engine-sound";

// one forged center-lock wheel, centered at (cx, 96)
const wheel = (cx: number): string => {
  const spokes = Array.from({ length: 10 }, (_, i) => i * 36)
    .map((a) => {
      const r = (a * Math.PI) / 180;
      const x2 = (cx + 11 * Math.sin(r)).toFixed(1);
      const y2 = (96 - 11 * Math.cos(r)).toFixed(1);
      return `<line x1="${cx}" y1="96" x2="${x2}" y2="${y2}" stroke="#cfcfcf" stroke-width="2"/>`;
    })
    .join("");
  return `
    <g class="wheel">
      <circle cx="${cx}" cy="96" r="20" fill="#141414"/>
      <circle cx="${cx}" cy="96" r="20" fill="none" stroke="#000" stroke-width="1"/>
      <circle cx="${cx}" cy="96" r="12.5" fill="#2b2b2b"/>
      ${spokes}
      <circle cx="${cx}" cy="96" r="4.2" fill="#d5001c"/>
    </g>`;
};

// Porsche 911 GT3 RS — driving right, nose leading; swan-neck wing at the rear
const CAR_SVG = `
  <svg viewBox="0 0 260 132" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:100%;height:auto;overflow:visible">
    <text x="150" y="16" font-family="Caveat, cursive" font-size="20" style="fill: var(--accent)">vroooom vrom vrm vroom!</text>

    <!-- exhaust puffs trailing the rear (left) -->
    <g class="puff"><circle cx="10" cy="96" r="6" fill="rgba(150,150,150,0.45)"/></g>
    <g class="puff" style="animation-delay:.2s"><circle cx="20" cy="100" r="4" fill="rgba(150,150,150,0.4)"/></g>

    <!-- ground shadow -->
    <ellipse cx="140" cy="118" rx="120" ry="6" fill="rgba(0,0,0,0.2)"/>

    <!-- GT3 RS swan-neck rear wing -->
    <rect x="40" y="34" width="8" height="35" rx="2.5" fill="#1c1c1c"/>
    <rect x="42" y="39" width="4" height="24" rx="2" fill="#d5001c" opacity="0.85"/>
    <path fill="#242424" d="M44 38 L106 36 C112 36 112 47 106 47 L44 49 C39 49 39 46 39 43 C39 40 40 38 44 38 Z"/>
    <path fill="#000" opacity="0.28" d="M44 46 L106 44 L106 47 L44 49 Z"/>
    <path fill="none" stroke="#1c1c1c" stroke-width="5.5" stroke-linecap="round" d="M66 66 C62 55 65 45 78 40"/>
    <path fill="none" stroke="#1c1c1c" stroke-width="5.5" stroke-linecap="round" d="M96 66 C93 55 98 46 104 41"/>

    <!-- body -->
    <path fill="#f3f3f3" stroke="#b7b7b7" stroke-width="1.4" d="M50 98 C44 96 44 86 44 76 C44 70 46 67 52 66 L100 61 C112 60 120 55 132 49 C140 45 150 44 156 48 C166 55 176 59 190 62 C210 65 226 67 233 74 C239 78 238 84 232 86 C240 88 240 96 232 98 L214 98 A20 20 0 0 0 176 98 L98 98 A20 20 0 0 0 60 98 Z"/>

    <!-- black side skirt + front splitter -->
    <rect x="98" y="93" width="78" height="6" fill="#1a1a1a"/>
    <path fill="#1a1a1a" d="M224 96 L252 95 L252 99 L226 100 Z"/>

    <!-- greenhouse + B-pillar + door seam -->
    <path fill="#1c2026" d="M104 61 C116 59 124 54 132 49 C141 45 151 44 157 49 C163 54 168 58 174 61 Z"/>
    <path stroke="#f3f3f3" stroke-width="3.5" d="M133 50 L133 61"/>
    <path stroke="rgba(0,0,0,0.16)" stroke-width="1.3" fill="none" d="M156 51 L156 95"/>

    <!-- mirror, headlight, fender vents, taillight -->
    <path fill="#1a1a1a" d="M158 47 q9 -4 10 1 q-1 3 -10 2 Z"/>
    <circle cx="222" cy="72" r="5" fill="#eef4ff" stroke="#c9c9c9" stroke-width="1"/>
    <path stroke="#1c1c1c" stroke-width="1.6" fill="none" d="M205 76 l7 -4 M207 80 l7 -4 M209 84 l7 -4"/>
    <rect x="43" y="73" width="6" height="4" rx="1" fill="#d5001c"/>

    ${wheel(79)}
    ${wheel(196)}
  </svg>`;

let playing = false;

// drive one GT3 RS across the screen (guarded so it can't stack up)
function launchPorsche(): void {
  if (playing) return;
  playing = true;
  playVroom();

  const car = document.createElement("div");
  car.className = "porsche-run";
  car.innerHTML = CAR_SVG;
  document.body.appendChild(car);

  const done = () => {
    if (car.isConnected) car.remove();
    playing = false;
  };
  car.addEventListener("animationend", (e) => {
    if ((e as AnimationEvent).animationName === "porsche-drive") done();
  });
  // safety net in case animationend never fires
  setTimeout(done, 4400);
}

// bind every ".porsche-egg" trigger word on the page
export function initPorscheEgg(): void {
  document.querySelectorAll<HTMLElement>(".porsche-egg").forEach((el) => {
    el.addEventListener("click", launchPorsche);
    el.addEventListener("mouseenter", launchPorsche);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        launchPorsche();
      }
    });
  });
}
