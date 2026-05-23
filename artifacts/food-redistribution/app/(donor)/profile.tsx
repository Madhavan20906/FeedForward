import { useColors } from "@/hooks/useColors";
import { useApp, type ThemePreference } from "@/context/AppContext";
import { DONOR_ANALYTICS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: "moon" | "sun" | "monitor" }[] = [
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "light", label: "Light", icon: "sun" },
  { value: "system", label: "System", icon: "monitor" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, themePreference, setThemePreference, donations } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive", onPress: async () => {
          await logout();
          router.replace("/onboarding");
        }
      },
    ]);
  };

  const deliveredCount = donations.filter(d => d.status === "delivered").length;
  const totalMeals = donations.filter(d => d.status === "delivered")
    .reduce((sum, d) => sum + (d.mealsServed ?? d.servingCapacity), 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient colors={["#22C55E22", "#16A34A08"]} style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{(user?.username ?? user?.name ?? "U")[0].toUpperCase()}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.foreground }]}>
          @{user?.username ?? "user"}
        </Text>
        {user?.name && user.name !== user.username && (
          <Text style={[styles.userFullName, { color: colors.mutedForeground }]}>{user.name}</Text>
        )}
        <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>
        <View style={[styles.rankBadge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Feather name="award" size={14} color={colors.primary} />
          <Text style={[styles.rankText, { color: colors.primary }]}>{DONOR_ANALYTICS.rank}</Text>
        </View>
      </LinearGradient>

      {/* Live Stats (from real donation data) */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{donations.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Donations</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{totalMeals.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Meals Fed</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: "#F97316" }]}>{deliveredCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Delivered</Text>
        </View>
      </View>

      {/* Account Details */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: "#22C55E22" }]}>
            <Feather name="at-sign" size={16} color="#22C55E" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Username</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>@{user?.username ?? "—"}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: "#3B82F622" }]}>
            <Feather name="user" size={16} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Full Name</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{user?.name ?? "—"}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <View style={[styles.infoIcon, { backgroundColor: "#F9731622" }]}>
            <Feather name="mail" size={16} color="#F97316" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{user?.email ?? "—"}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
          <View style={[styles.infoIcon, { backgroundColor: "#8B5CF622" }]}>
            <Feather name="calendar" size={16} color="#8B5CF6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{user?.joinedAt ?? "—"}</Text>
          </View>
        </View>
      </View>

      {/* Appearance / Theme */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.themeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setThemePreference(opt.value)}
                style={[
                  styles.themeBtn,
                  {
                    backgroundColor: themePreference === opt.value ? colors.primary : colors.surfaceElevated,
                    borderColor: themePreference === opt.value ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={opt.icon}
                  size={18}
                  color={themePreference === opt.value ? "#000" : colors.mutedForeground}
                />
                <Text style={[styles.themeBtnText, {
                  color: themePreference === opt.value ? "#000" : colors.foreground,
                }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.themeHint, { color: colors.mutedForeground }]}>
            Choose your preferred theme. "System" follows device settings.
          </Text>
        </View>
      </View>

      {/* Settings */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SETTINGS</Text>
        {([
          { icon: "bell" as const, label: "Notifications", color: "#F97316" },
          { icon: "shield" as const, label: "Privacy & Security", color: "#3B82F6" },
          { icon: "map-pin" as const, label: "Saved Addresses", color: "#8B5CF6" },
          { icon: "help-circle" as const, label: "Help & Support", color: "#EF4444" },
          { icon: "info" as const, label: "About FeedForward", color: "#888" },
        ]).map((item) => (
          <Pressable
            key={item.label}
            style={[styles.menuItem, { borderBottomColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color + "22" }]}>
              <Feather name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      {/* Role info (read-only, no auto-login) */}
      <View style={[styles.roleInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="shield" size={16} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.roleInfoTitle, { color: colors.foreground }]}>Signed in as {user?.role?.replace("_", " ")}</Text>
          <Text style={[styles.roleInfoSub, { color: colors.mutedForeground }]}>
            To switch roles, sign out and log in with a different account.
          </Text>
        </View>
      </View>

      {/* Logout */}
      <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.destructive + "44" }]}>
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        FeedForward v1.0.0 · Academic Engineering Prototype
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  profileHeader: { borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16, gap: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  avatarText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#000" },
  userName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  userFullName: { fontSize: 15, fontFamily: "Inter_400Regular" },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6, marginTop: 6 },
  rankText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsCard: { flexDirection: "row", justifyContent: "space-around", borderRadius: 16, borderWidth: 1, paddingVertical: 18, paddingHorizontal: 8, marginBottom: 20 },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statDivider: { width: 1, alignSelf: "stretch" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 3 },
  infoValue: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  themeCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  themeRow: { flexDirection: "row", gap: 10 },
  themeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  themeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  themeHint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 16, borderBottomWidth: 1 },
  menuIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  roleInfoCard: { flexDirection: "row", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16, alignItems: "flex-start" },
  roleInfoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3, textTransform: "capitalize" },
  roleInfoSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingVertical: 16, marginBottom: 20 },
  logoutText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  version: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
