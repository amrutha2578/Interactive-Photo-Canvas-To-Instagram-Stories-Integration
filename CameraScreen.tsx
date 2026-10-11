import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Camera">;

export default function CameraScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>We need camera access to take your photo.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9, skipProcessing: false });
      if (photo?.uri) {
        navigation.navigate("Editor", { photoUri: photo.uri });
      }
    } catch (e) {
      console.warn("Capture failed", e);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
        >
          <Text style={styles.iconBtnText}>Flip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.shutter, isCapturing && styles.shutterDisabled]}
          onPress={takePhoto}
          disabled={isCapturing}
        >
          {isCapturing ? <ActivityIndicator color="#fff" /> : <View style={styles.shutterInner} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#000" },
  permissionText: { color: "#fff", textAlign: "center", marginBottom: 16, fontSize: 16 },
  primaryBtn: { backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  primaryBtnText: { fontWeight: "600" },
  topBar: { position: "absolute", top: 56, right: 20 },
  iconBtn: { backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  iconBtnText: { color: "#fff", fontWeight: "600" },
  bottomBar: { position: "absolute", bottom: 48, width: "100%", alignItems: "center" },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDisabled: { opacity: 0.6 },
  shutterInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" },
});
