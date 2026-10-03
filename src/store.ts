import AsyncStorage from "@react-native-async-storage/async-storage";
import { parseLace, type LaceState } from "./lace";

const KEY = "hold-the-lace-v1";

export async function loadLace(): Promise<LaceState> {
  const raw = await AsyncStorage.getItem(KEY);
  return parseLace(raw);
}

export async function saveLace(state: LaceState): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(state));
}
