import { useColorScheme } from "react-native";
import { useContext } from "react";
import colors from "@/constants/colors";
import { AppContext } from "@/context/AppContext";

export function useColors() {
  const ctx = useContext(AppContext);
  const system = useColorScheme();
  const pref = ctx?.themePreference ?? "dark";
  const scheme = pref === "system" ? system : pref;
  const palette = scheme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
