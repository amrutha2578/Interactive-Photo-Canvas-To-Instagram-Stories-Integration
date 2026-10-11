import { Linking, Platform } from "react-native";
import Share from "react-native-share";

/**
 * Opens Instagram Stories directly with `imageUri` preloaded as the
 * background image, skipping the OS share sheet entirely.
 *
 * How it avoids the native share modal:
 *  - iOS: Instagram's Stories API is driven by UIPasteboard + the
 *    `instagram-stories://share` URL scheme. `react-native-share`'s
 *    `Share.Social.INSTAGRAM_STORIES` option writes the image straight to
 *    Instagram's pasteboard keys and calls that scheme itself, so no
 *    `UIActivityViewController` is ever shown.
 *  - Android: it fires an explicit `Intent` targeted at
 *    `com.instagram.android` (package set directly on the intent, not
 *    `ACTION_CHOOSER`), with the asset passed as `interactive_asset_uri`
 *    via a FileProvider content:// URI. Because the target package is
 *    set explicitly, Android launches Instagram's own Stories camera
 *    composer instead of the system chooser.
 *
 * `FACEBOOK_APP_ID` must be a valid Facebook App ID that has the
 * "Instagram Stories" / "Sharing to Stories" product added in the
 * Facebook/Instagram developer console (developers.facebook.com) — IG
 * rejects the deep link without it.
 */
const FACEBOOK_APP_ID = "YOUR_FACEBOOK_APP_ID"; // set from developers.facebook.com

export interface StoriesShareOptions {
  imageUri: string; // local file:// or content:// uri of the final composed image
  attributionUrl?: string; // optional "swipe up" / sticker link back to your app
  stickerImageUri?: string; // optional transparent PNG overlay (e.g. caption rendered as a sticker)
}

export async function isInstagramInstalled(): Promise<boolean> {
  try {
    const scheme = Platform.OS === "ios" ? "instagram-stories://share" : "instagram://story-camera";
    return await Linking.canOpenURL(scheme);
  } catch {
    return false;
  }
}

export async function shareToInstagramStories({
  imageUri,
  attributionUrl,
  stickerImageUri,
}: StoriesShareOptions): Promise<void> {
  const installed = await isInstagramInstalled();
  if (!installed) {
    const storeUrl =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/instagram/id389801252"
        : "market://details?id=com.instagram.android";
    await Linking.openURL(storeUrl);
    throw new Error("Instagram is not installed; redirected to the store.");
  }

  await Share.shareSingle({
    social: Share.Social.INSTAGRAM_STORIES,
    appId: FACEBOOK_APP_ID,
    backgroundImage: imageUri,
    ...(stickerImageUri ? { stickerImage: stickerImageUri } : {}),
    ...(attributionUrl ? { attributionURL: attributionUrl } : {}),
  });
}
