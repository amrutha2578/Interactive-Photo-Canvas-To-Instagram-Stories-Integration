import React from "react";
import { Text, StyleSheet, Image } from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { PlacedSticker } from "../types";

interface Props {
  sticker: PlacedSticker;
  onUpdate: (instanceId: string, patch: Partial<PlacedSticker>) => void;
  onRemove: (instanceId: string) => void;
}

export default function DraggableSticker({ sticker, onUpdate, onRemove }: Props) {
  const translateX = useSharedValue(sticker.x);
  const translateY = useSharedValue(sticker.y);
  const scale = useSharedValue(sticker.scale);
  const rotation = useSharedValue(sticker.rotation);

  const startX = useSharedValue(sticker.x);
  const startY = useSharedValue(sticker.y);
  const startScale = useSharedValue(sticker.scale);
  const startRotation = useSharedValue(sticker.rotation);

  const commit = () => {
    onUpdate(sticker.instanceId, {
      x: translateX.value,
      y: translateY.value,
      scale: scale.value,
      rotation: rotation.value,
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      commit();
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.4, Math.min(4, startScale.value * e.scale));
    })
    .onEnd(() => {
      commit();
    });

  const rotate = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + (e.rotation * 180) / Math.PI;
    })
    .onEnd(() => {
      commit();
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      onRemove(sticker.instanceId);
    });

  const composed = Gesture.Simultaneous(pan, pinch, rotate);
  const gesture = Gesture.Exclusive(doubleTap, composed);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withTiming(scale.value, { duration: 0 }) },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        {sticker.assetUri ? (
          <Image source={{ uri: sticker.assetUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.glyph}>{sticker.glyph}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: { fontSize: 48 },
  image: { width: 80, height: 80 },
});
