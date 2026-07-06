import { useApp } from "@/context/AppContext";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, activeRole } = useApp();

  // Still reading session from AsyncStorage — show nothing (splash is still visible)
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#080808", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  // Session restored — not logged in → go to onboarding
  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  // Logged in → go to correct role dashboard
  if (activeRole === "ngo") return <Redirect href="/(ngo)" />;
  if (activeRole === "admin") return <Redirect href="/(admin)" />;
  if (activeRole === "sponsor") return <Redirect href="/(sponsor)" />;
  return <Redirect href="/(donor)" />;
}