import React, { useRef, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList, DrawPath, PlacedSticker, StickerItem } from "../types";
import DrawingCanvas from "../components/DrawingCanvas";
import DraggableSticker from "../components/DraggableSticker";
import StickerPicker from "../components/StickerPicker";

type Props = NativeStackScreenProps<RootStackParamList, "Editor">;

type Mode = "draw" | "stickers";

const DRAW_COLORS = ["#FFFFFF", "#FF3B30", "#FFD60A", "#34C759", "#0A84FF"];

export default function EditorScreen({ route, navigation }: Props) {
  const { photoUri } = route.params;
  const [mode, setMode] = useState<Mode>("stickers");
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [activeColor, setActiveColor] = useState(DRAW_COLORS[0]);
  const [isExporting, setIsExporting] = useState(false);

  const shotRef = useRef<ViewShot>(null);

  const addSticker = (item: StickerItem) => {
    setStickers((prev) => [
      ...prev,
      {
        ...item,
        instanceId: `${item.id}-${Date.now()}`,
        x: 140,
        y: 260,
        scale: 1,
        rotation: 0,
      },
    ]);
  };

  const updateSticker = (instanceId: string, patch: Partial<PlacedSticker>) => {
    setStickers((prev) => prev.map((s) => (s.instanceId === instanceId ? { ...s, ...patch } : s)));
  };

  const removeSticker = (instanceId: string) => {
    setStickers((prev) => prev.filter((s) => s.instanceId !== instanceId));
  };

  const discard = () => {
    Alert.alert("Discard edits?", "Your drawing and stickers will be lost.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => navigation.popToTop() },
    ]);
  };

  const proceedToCaption = async () => {
    if (!shotRef.current?.capture) return;
    setIsExporting(true);
    try {
      const uri = await shotRef.current.capture();
      navigation.navigate("Caption", { editedUri: uri });
    } catch (e) {
      console.warn("capture failed", e);
      Alert.alert("Couldn't export", "Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={styles.canvas}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <DrawingCanvas
          enabled={mode === "draw"}
          color={activeColor}
          strokeWidth={6}
          paths={paths}
          onPathsChange={setPaths}
        />
        {stickers.map((s) => (
          <DraggableSticker key={s.instanceId} sticker={s} onUpdate={updateSticker} onRemove={removeSticker} />
        ))}
      </ViewShot>

      <View style={styles.topBar}>
        <TouchableOpacity onPress={discard} style={styles.ghostBtn}>
          <Text style={styles.ghostBtnText}>Discard</Text>
        </TouchableOpacity>
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "draw" && styles.modeBtnActive]}
            onPress={() => setMode("draw")}
          >
            <Text style={styles.modeBtnText}>Draw</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "stickers" && styles.modeBtnActive]}
            onPress={() => setMode("stickers")}
          >
            <Text style={styles.modeBtnText}>Stickers</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={proceedToCaption} style={styles.primaryBtn} disabled={isExporting}>
          {isExporting ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Next</Text>}
        </TouchableOpacity>
      </View>

      {mode === "draw" && (
        <View style={styles.colorRow}>
          {DRAW_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setActiveColor(c)}
              style={[styles.swatch, { backgroundColor: c }, activeColor === c && styles.swatchActive]}
            />
          ))}
        </View>
      )}

      {mode === "stickers" && <StickerPicker onPick={addSticker} />}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  canvas: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  ghostBtn: { backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  ghostBtnText: { color: "#fff", fontWeight: "600" },
  primaryBtn: { backgroundColor: "#fff", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 18 },
  primaryBtnText: { fontWeight: "700" },
  modeSwitch: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 18, padding: 3 },
  modeBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  modeBtnActive: { backgroundColor: "#fff" },
  modeBtnText: { color: "#fff", fontWeight: "600" },
  colorRow: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 8,
    borderRadius: 24,
  },
  swatch: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 6 },
  swatchActive: { borderWidth: 2, borderColor: "#fff" },
});
