import { LogBox } from "react-native";

import "expo-router/entry";
import "react-native-gesture-handler";
import "@react-native-anywhere/polyfill-base64";

LogBox.ignoreLogs([
  /Couldn't determine the version of the native part of Reanimated/,
  /Cannot update a component/,
]);
