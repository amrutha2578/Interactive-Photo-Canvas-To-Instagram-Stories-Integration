# IG Canvas → Instagram Stories

An Expo / React Native (TypeScript) feature: capture a photo → draw + place
status stickers on a canvas → add a caption → send straight into Instagram
Stories (not the OS share sheet).

## Flow

```
CameraScreen  →  EditorScreen (draw + stickers, exported via view-shot)
              →  CaptionScreen (caption baked onto image, Share / Export / Discard)
```

| Screen | File | Responsibility |
|---|---|---|
| Camera | `src/screens/CameraScreen.tsx` | `expo-camera` live preview + capture |
| Editor | `src/screens/EditorScreen.tsx` | Freehand drawing (`DrawingCanvas`) + draggable stickers (`DraggableSticker`, `StickerPicker`) over the photo, composited with `react-native-view-shot` |
| Caption | `src/screens/CaptionScreen.tsx` | Preview, caption input, bakes caption into final PNG, Share / Export / Discard actions |
| — | `src/utils/shareToInstagram.ts` | Opens Instagram Stories directly via `react-native-share`'s `INSTAGRAM_STORIES` target |

## Requirements coverage

- **Camera capture** — `CameraScreen` (`expo-camera`, permission flow, flip camera, shutter).
- **Canvas drawing** — `DrawingCanvas` renders freehand strokes as SVG paths over the captured photo, togglable via a Draw/Stickers mode switch.
- **Stickers from the Figma library** — `src/data/stickers.ts` + `StickerPicker` + `DraggableSticker` (pan/pinch/rotate/double-tap-to-remove). See **Sticker assets** below — the actual Figma artwork isn't pulled in automatically because the file requires an authenticated Figma session.
- **Export or discard** — `EditorScreen` has Discard (confirm → back to Camera) and Next (exports the composited canvas); `CaptionScreen` has Export (save to device library via `expo-media-library`) and Discard.
- **Caption input** — `CaptionScreen`'s `TextInput`, baked into the final exported image before sharing (see below for why).
- **Open Instagram Stories directly (not the share sheet)** — `shareToInstagram.ts`.
- **Smooth transition** — Instagram-installed check before navigating away, loading spinners during image composition/export, and a fallback to the App/Play Store if Instagram isn't installed instead of a dead deep link.

## Sticker assets — Figma file

`https://www.figma.com/design/Ul8AkOtTiNQa6uHNumE0xI/Project-Status-Stickers`
needs an authenticated Figma session (or a personal access token against the
Figma REST API) to export images, which this environment doesn't have. So the
sticker list in `src/data/stickers.ts` ships with a placeholder set matching
the file's apparent theme (On Track / At Risk / Delayed / Done / In Review /
Blocked), rendered as emoji glyphs so the full interaction model (pick → drag
→ pinch → rotate → remove → bake into export) is real and working end to end.

To swap in the actual artwork:
1. In Figma, select each sticker frame → **Export** as PNG (2x/3x) or SVG.
2. Drop the files into `assets/stickers/<id>.png`.
3. In `src/data/stickers.ts`, set `assetUri` for that entry (e.g.
   `assetUri: require("../../assets/stickers/on-track.png")`).

   Or pull them programmatically with a Figma personal access token:
   `GET https://api.figma.com/v1/images/Ul8AkOtTiNQa6uHNumE0xI?ids=<node-ids>`
   with header `X-Figma-Token: <token>`.

`DraggableSticker` and `StickerPicker` already prefer `assetUri` (rendering
an `<Image>`) and fall back to the glyph, so no other code changes are
needed.

## Instagram Stories deep link — how it stays out of the share sheet

Instagram's official "Sharing to Stories" mechanism isn't a generic share
intent — it's a direct handoff:

- **iOS**: the image (and optional sticker/attribution link) is written to
  `UIPasteboard` under Instagram-specific keys, then the app opens the
  `instagram-stories://share` URL scheme. iOS never shows
  `UIActivityViewController` because no `UIDocumentInteractionController` /
  `UIActivityViewController` is ever invoked — it's a direct pasteboard +
  custom URL scheme handoff.
- **Android**: an explicit `Intent` is built with
  `setPackage("com.instagram.android")` (not `Intent.createChooser`), type
  `image/*`, and the asset attached as a `content://` URI via FileProvider
  under the `interactive_asset_uri` extra. Because the target package is
  set explicitly on the intent, Android launches Instagram's Stories
  composer directly instead of the system chooser.

`src/utils/shareToInstagram.ts` wraps `react-native-share`'s
`Share.Social.INSTAGRAM_STORIES` option, which implements both platform
paths, plus:
- `isInstagramInstalled()` — checks `Linking.canOpenURL` first so we never
  fire a deep link into a void.
- A store fallback (App Store / Play Store) if Instagram isn't installed.

### Required native setup

- **Facebook App ID**: create an app at developers.facebook.com, add the
  "Instagram Stories" product, and put the ID in
  `FACEBOOK_APP_ID` in `src/utils/shareToInstagram.ts`. Instagram rejects
  the deep link without a registered app ID.
- **iOS** `Info.plist` — already wired via `app.json`'s
  `ios.infoPlist.LSApplicationQueriesSchemes: ["instagram-stories", "instagram"]`,
  required so `canOpenURL` is allowed to check for those schemes.
- **Android 11+** package visibility — the `react-native-share` Expo config
  plugin (declared in `app.json` under `plugins`) adds the required
  `<queries><package android:name="com.instagram.android"/></queries>`
  entry to `AndroidManifest.xml` so `canOpenURL`/the explicit intent can see
  Instagram is installed.
- Because the caption has no first-class "preloaded text" parameter in
  Instagram's Stories API, `CaptionScreen` bakes the caption onto the
  exported PNG (and optionally could be passed again as a separate
  transparent `stickerImage` via `shareToInstagramStories`) rather than
  relying on IG to render arbitrary text.

## Setup

```bash
npm install
npx expo prebuild   # generates native ios/android projects (needed for react-native-share)
npx expo run:ios    # or: npx expo run:android
```

`react-native-share`, `expo-camera`, and gesture/reanimated all require a
dev-client / prebuilt native build — this won't fully work inside Expo Go.

## Known trade-offs / next steps

- Sticker artwork is a placeholder set (see above) pending real Figma export access.
- Undo/redo for strokes and per-sticker z-ordering aren't implemented but would slot into `EditorScreen`'s `paths`/`stickers` state.
- `FACEBOOK_APP_ID` is a placeholder and must be replaced with a real app ID before Instagram will accept the deep link in production.
