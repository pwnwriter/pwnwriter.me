// Wallpapers shown on the /stuff wallpapers tab.
//
// Originals live in public/wallpapers/ (the `file` download); lightweight
// jpeg previews live in public/wallpapers/thumbs/ (the `thumb`). To add one,
// drop the image in public/wallpapers/, make a thumb, and append an entry.
// A `colors` gradient is the fallback when there's no file yet.

export type Wallpaper = {
  name: string;
  file?: string; // full-res download
  thumb?: string; // lighter preview; falls back to `file`
  colors?: [string, string]; // gradient placeholder when there's no file
  tag?: string;
  size?: string;
};

export const wallpapers: Wallpaper[] = [
  { name: "rosé pine dawn", tag: "rosé pine", size: "1536×1024", file: "/wallpapers/rose-pine-dawn.png", thumb: "/wallpapers/thumbs/rose-pine-dawn.jpg" },
  { name: "rosé pine", tag: "rosé pine", size: "1536×1024", file: "/wallpapers/rose-pine.png", thumb: "/wallpapers/thumbs/rose-pine.jpg" },
  { name: "rosé pine contours", tag: "rosé pine", size: "3456×2234", file: "/wallpapers/rose_pine_contourline.png", thumb: "/wallpapers/thumbs/rose_pine_contourline.jpg" },
  { name: "rainy cabin", tag: "minecraft", size: "3840×2160", file: "/wallpapers/MC_dark_house_rain.png", thumb: "/wallpapers/thumbs/MC_dark_house_rain.jpg" },
  { name: "snow hills, sunset", tag: "minecraft", size: "1920×1080", file: "/wallpapers/MC_snow_hills_sunset.png", thumb: "/wallpapers/thumbs/MC_snow_hills_sunset.jpg" },
  { name: "snow mountain range", tag: "minecraft", size: "1920×1080", file: "/wallpapers/MC_snow_mountain_range.jpg", thumb: "/wallpapers/thumbs/MC_snow_mountain_range.jpg" },
  { name: "kyora, autumn", tag: "scenery", size: "4147×2765", file: "/wallpapers/kyora-autumn.png", thumb: "/wallpapers/thumbs/kyora-autumn.jpg" },
  { name: "dreamy", tag: "abstract", size: "1280×640", file: "/wallpapers/dreamy.png", thumb: "/wallpapers/thumbs/dreamy.jpg" },
];
