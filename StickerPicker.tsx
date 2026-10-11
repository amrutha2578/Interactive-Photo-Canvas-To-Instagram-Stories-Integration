import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { STICKERS } from "../data/stickers";
import type { StickerItem } from "../types";

interface Props {
  onPick: (item: StickerItem) => void;
}

export default function StickerPicker({ onPick }: Props) {
  return (
    <View style={styles.tray}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {STICKERS.map((s) => (
          <TouchableOpacity key={s.id} style={styles.item} onPress={() => onPick(s)}>
            {s.assetUri ? (
              <Image source={{ uri: s.assetUri }} style={styles.thumbImage} />
            ) : (
              <Text style={styles.thumbGlyph}>{s.glyph}</Text>
            )}
            <Text style={styles.label} numberOfLines={1}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tray: { paddingVertical: 10, backgroundColor: "rgba(0,0,0,0.55)" },
  row: { paddingHorizontal: 12, alignItems: "center" },
  item: { alignItems: "center", marginHorizontal: 8, width: 56 },
  thumbGlyph: { fontSize: 30 },
  thumbImage: { width: 36, height: 36 },
  label: { color: "#fff", fontSize: 10, marginTop: 2 },
});
