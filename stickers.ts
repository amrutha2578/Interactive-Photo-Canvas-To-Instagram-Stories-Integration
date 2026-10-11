import { StickerItem } from "../types";

/**
 * The Figma file "Project Status Stickers"
 * (https://www.figma.com/design/Ul8AkOtTiNQa6uHNumE0xI/Project-Status-Stickers)
 * requires an authenticated Figma session / API token to pull image assets,
 * which isn't available in this environment. The six entries below mirror
 * the status set the file is named for (On Track / At Risk / Delayed / Done /
 * In Review / Blocked) so the picker, placement, and export pipeline are all
 * fully wired up.
 *
 * To swap in the real artwork once you have it:
 *   1. In Figma, select each sticker frame -> Export as PNG (2x/3x) or SVG.
 *   2. Drop the files into `assets/stickers/<id>.png`.
 *   3. Set `assetUri: require("../../assets/stickers/<id>.png")` below
 *      (or fetch programmatically via the Figma REST `images` endpoint if
 *      you have a personal access token: GET /v1/images/:file_key).
 * DraggableSticker already prefers `assetUri` (renders an <Image>) and
 * falls back to the `glyph` text when it's unset, so no other code changes
 * are needed after step 3.
 */
export const STICKERS: StickerItem[] = [
  { id: "on-track", label: "On Track", glyph: "🟢" },
  { id: "at-risk", label: "At Risk", glyph: "🟡" },
  { id: "delayed", label: "Delayed", glyph: "🔴" },
  { id: "done", label: "Done", glyph: "✅" },
  { id: "in-review", label: "In Review", glyph: "👀" },
  { id: "blocked", label: "Blocked", glyph: "⛔" },
];
