import React, { useMemo, useRef, useState } from "react";
import { StyleSheet, View, PanResponder, GestureResponderEvent } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { DrawPath } from "../types";

interface Props {
  enabled: boolean; // only capture touches in "draw" mode, so stickers stay draggable in "sticker" mode
  color: string;
  strokeWidth: number;
  paths: DrawPath[];
  onPathsChange: (paths: DrawPath[]) => void;
}

export default function DrawingCanvas({ enabled, color, strokeWidth, paths, onPathsChange }: Props) {
  const currentPoints = useRef<string>("");
  const [liveD, setLiveD] = useState<string>("");

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          const { locationX, locationY } = e.nativeEvent;
          currentPoints.current = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setLiveD(currentPoints.current);
        },
        onPanResponderMove: (e: GestureResponderEvent) => {
          const { locationX, locationY } = e.nativeEvent;
          currentPoints.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
          setLiveD(currentPoints.current);
        },
        onPanResponderRelease: () => {
          if (currentPoints.current) {
            onPathsChange([
              ...paths,
              { id: `${Date.now()}`, d: currentPoints.current, color, strokeWidth },
            ]);
          }
          currentPoints.current = "";
          setLiveD("");
        },
      }),
    [enabled, color, strokeWidth, paths, onPathsChange]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={enabled ? "auto" : "none"} {...panResponder.panHandlers}>
      <Svg style={StyleSheet.absoluteFill}>
        {paths.map((p) => (
          <Path key={p.id} d={p.d} stroke={p.color} strokeWidth={p.strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {!!liveD && <Path d={liveD} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </Svg>
    </View>
  );
}
