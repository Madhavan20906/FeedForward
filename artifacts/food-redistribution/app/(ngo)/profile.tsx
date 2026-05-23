import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NGOProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, switchRole } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLogout = async () => {
    await logout();
    router.replace("/onboarding");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={["#3B82F622", "#2563EB08"]} style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: "#3B82F6" }]}>
          <Feather name="heart" size={28} color="#fff" />
        </View>
        <Text style={[styles.orgName, { color: colors.foreground }]}>{user?.organization ?? "Akshaya Patra Foundation"}</Text>
        <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email ?? "ngo@demo.com"}</Text>
        <View style={[styles.verifiedBadge, { backgroundColor: "#3B82F622", borderColor: "#3B82F644" }]}>
          <Feather name="shield" size={14} color="#3B82F6" />
          <Text style={[styles.verifiedText, { color: "#3B82F6" }]}>Government Verified NGO</Text>
        </View>
      </LinearGradient>

      <View style={styles.switchSection}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SWITCH ROLE (DEMO)</Text>
        {([
          { role: "individual_donor", label: "Individual Donor", color: "#22C55E" },
          { role: "admin", label: "Admin Panel", color: "#8B5CF6" },
          { role: "sponsor", label: "Sponsor Dashboard", color: "#F59E0B" },
        ] as const).map(item => (
          <Pressable
            key={item.role}
            onPress={async () => {
              await switchRole(item.role as Parameters<typeof switchRole>[0]);
              if (item.role === "admin") router.replace("/(admin)");
              else if (item.role === "sponsor") router.replace("/(sponsor)");
              else router.replace("/(donor)");
            }}
            style={[styles.switchBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.switchBtnText, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="arrow-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.destructive + "44" }]}>
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  profileHeader: { borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 24, gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  orgName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  userEmail: { fontSize: 14, fontFamily: "Inter_400Regular" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 },
  verifiedText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  switchSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 12 },
  switchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
  switchBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingVertical: 16 },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
