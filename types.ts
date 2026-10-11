export type RootStackParamList = {
  Camera: undefined;
  Editor: { photoUri: string };
  Caption: { editedUri: string };
};

export interface StickerItem {
  id: string;
  label: string;
  // Placeholder glyph until the real PNG/SVG exported from the Figma
  // "Project Status Stickers" file is dropped into assets/stickers/.
  glyph: string;
  assetUri?: string; // set once real exported asset is available
}

export interface PlacedSticker extends StickerItem {
  instanceId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number; // degrees
}

export interface DrawPath {
  id: string;
  d: string; // svg path data
  color: string;
  strokeWidth: number;
}
