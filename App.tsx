import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./src/types";
import CameraScreen from "./src/screens/CameraScreen";
import EditorScreen from "./src/screens/EditorScreen";
import CaptionScreen from "./src/screens/CaptionScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="Editor" component={EditorScreen} options={{ animation: "fade" }} />
        <Stack.Screen name="Caption" component={CaptionScreen} options={{ animation: "slide_from_right" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
