import React, { useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import ViewShot from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import { shareToInstagramStories } from "../utils/shareToInstagram";

type Props = NativeStackScreenProps<RootStackParamList, "Caption">;

export default function CaptionScreen({ route, navigation }: Props) {
  const { editedUri } = route.params;
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState<"share" | "export" | null>(null);
  const finalShotRef = useRef<ViewShot>(null);

  // Instagram's Stories share API does not accept a plain-text caption
  // parameter — the only way to "preload" a caption onto the story is to
  // bake it into the image itself (or pass it as a transparent sticker
  // image). We composite the photo + caption here and export that as the
  // final PNG that gets handed to Instagram / saved to the library.
  const composeFinalImage = async (): Promise<string> => {
    if (!finalShotRef.current?.capture) throw new Error("capture ref missing");
    return finalShotRef.current.capture();
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      const finalUri = await composeFinalImage();
      await shareToInstagramStories({ imageUri: finalUri });
    } catch (e: any) {
      Alert.alert("Couldn't open Instagram Stories", e?.message ?? "Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleExport = async () => {
    setBusy("export");
    try {
      const finalUri = await composeFinalImage();
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow photo library access to save your edit.");
        return;
      }
      await MediaLibrary.saveToLibraryAsync(finalUri);
      Alert.alert("Saved", "Your edited photo was saved to your library.");
    } catch (e) {
      Alert.alert("Export failed", "Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleDiscard = () => {
    Alert.alert("Discard this photo?", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ViewShot ref={finalShotRef} options={{ format: "png", quality: 1 }} style={styles.preview}>
        <Image source={{ uri: editedUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        {!!caption && (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionOverlayText}>{caption}</Text>
          </View>
        )}
      </ViewShot>

      <View style={styles.footer}>
        <TextInput
          style={styles.input}
          placeholder="Write a caption…"
          placeholderTextColor="#999"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={200}
        />

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleDiscard} disabled={!!busy}>
            <Text style={styles.secondaryBtnText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleExport} disabled={!!busy}>
            {busy === "export" ? <ActivityIndicator /> : <Text style={styles.secondaryBtnText}>Export</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.igBtn} onPress={handleShare} disabled={!!busy}>
            {busy === "share" ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.igBtnText}>Share to IG Stories</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  preview: { flex: 1 },
  captionOverlay: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    padding: 12,
  },
  captionOverlayText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { backgroundColor: "#111", padding: 16, paddingBottom: Platform.OS === "ios" ? 28 : 16 },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    minHeight: 48,
    maxHeight: 96,
    marginBottom: 12,
  },
  actionsRow: { flexDirection: "row", alignItems: "center" },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2a2a2a",
    marginRight: 10,
  },
  secondaryBtnText: { color: "#fff", fontWeight: "600" },
  igBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E1306C",
  },
  igBtnText: { color: "#fff", fontWeight: "700" },
});
