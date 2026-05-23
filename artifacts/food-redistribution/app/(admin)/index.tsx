import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ADMIN_STATS, PLATFORM_ANALYTICS, NGO_REQUESTS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STAT_CARDS = [
  { label: "Total Donors", value: "3,421", icon: "users" as const, color: "#22C55E", change: "+47 today" },
  { label: "Active NGOs", value: "284", icon: "heart" as const, color: "#3B82F6", change: "+2 today" },
  { label: "Total Donations", value: "24,681", icon: "package" as const, color: "#F97316", change: "+312 today" },
  { label: "Success Rate", value: "97.3%", icon: "trending-up" as const, color: "#8B5CF6", change: "+0.2%" },
  { label: "Pending Verify", value: "12", icon: "alert-circle" as const, color: "#F59E0B", change: "3 flagged" },
  { label: "New Today", value: "47", icon: "user-plus" as const, color: "#EF4444", change: "registrations" },
];

const RECENT_ACTIVITY = [
  { type: "donation", text: "Spice Garden donated 120 portions of Veg Thali", time: "2 min ago", color: "#22C55E" },
  { type: "ngo", text: "Robin Hood Army accepted a new request", time: "5 min ago", color: "#3B82F6" },
  { type: "flag", text: "Flagged: Suspicious donation from anonymous user", time: "18 min ago", color: "#EF4444" },
  { type: "sponsor", text: "TechCorp CSR sponsored 10 deliveries", time: "32 min ago", color: "#8B5CF6" },
  { type: "ngo", text: "New NGO verified: Hope Foundation Mumbai", time: "1 hour ago", color: "#3B82F6" },
  { type: "donation", text: "Individual donor Rahul donated 40 meals", time: "1.5 hrs ago", color: "#22C55E" },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { switchRole } = useApp();
  const [tab, setTab] = useState<"overview" | "activity">("overview");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Header */}
      <LinearGradient colors={["#8B5CF622", "#08080800"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>Admin Panel</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Control Center</Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: "#8B5CF622", borderColor: "#8B5CF644" }]}>
            <Feather name="shield" size={14} color="#8B5CF6" />
            <Text style={[styles.adminBadgeText, { color: "#8B5CF6" }]}>Super Admin</Text>
          </View>
        </View>

        {/* Platform Health */}
        <View style={[styles.healthCard, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <View style={[styles.healthDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.healthText, { color: colors.primary }]}>
            Platform Healthy · {PLATFORM_ANALYTICS.mealsServed.toLocaleString()} total meals served
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STAT_CARDS.map(card => (
            <View key={card.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statCardHeader}>
                <View style={[styles.statIcon, { backgroundColor: card.color + "22" }]}>
                  <Feather name={card.icon} size={16} color={card.color} />
                </View>
                <Text style={[styles.statChange, { color: card.color }]}>{card.change}</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{card.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { icon: "check-circle" as const, label: "Verify NGOs", color: "#3B82F6", count: 5 },
            { icon: "alert-triangle" as const, label: "Review Flags", color: "#EF4444", count: 3 },
            { icon: "user-check" as const, label: "Approve Donors", color: "#22C55E", count: 12 },
            { icon: "settings" as const, label: "Platform Config", color: "#8B5CF6", count: 0 },
          ].map(action => (
            <Pressable key={action.label} style={[styles.quickAction, { backgroundColor: colors.card, borderColor: action.count > 0 ? action.color + "44" : colors.border }]}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + "22" }]}>
                <Feather name={action.icon} size={20} color={action.color} />
              </View>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{action.label}</Text>
              {action.count > 0 && (
                <View style={[styles.quickActionBadge, { backgroundColor: action.color }]}>
                  <Text style={styles.quickActionBadgeText}>{action.count}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {(["overview", "activity"] as const).map(t => (
            <Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && { backgroundColor: colors.card }]}>
              <Text style={[styles.tabText, { color: tab === t ? colors.foreground : colors.mutedForeground, fontFamily: tab === t ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {t === "overview" ? "Overview" : "Activity Feed"}
              </Text>
            </Pressable>
          ))}
        </View>

        {tab === "overview" ? (
          <>
            {/* NGO Pending Requests */}
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>LIVE DONATION REQUESTS</Text>
            {NGO_REQUESTS.slice(0, 3).map(req => (
              <View key={req.id} style={[styles.reqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.reqLeft}>
                  <Text style={[styles.reqFood, { color: colors.foreground }]}>{req.foodName}</Text>
                  <Text style={[styles.reqMeta, { color: colors.mutedForeground }]}>{req.donorName} · {req.distance} · {req.createdAt}</Text>
                </View>
                <View style={[styles.reqScore, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={[styles.reqScoreText, { color: colors.primary }]}>{req.freshnessScore}%</Text>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={[styles.subTitle, { color: colors.mutedForeground }]}>RECENT ACTIVITY</Text>
            {RECENT_ACTIVITY.map((act, i) => (
              <View key={i} style={[styles.activityItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.actDot, { backgroundColor: act.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actText, { color: colors.foreground }]}>{act.text}</Text>
                  <Text style={[styles.actTime, { color: colors.mutedForeground }]}>{act.time}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Switch Role */}
        <Pressable
          onPress={async () => { await switchRole("individual_donor"); router.replace("/(donor)"); }}
          style={[styles.switchBtn, { borderColor: colors.border }]}
        >
          <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>Switch to Donor View</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  adminBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  healthCard: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  healthDot: { width: 8, height: 8, borderRadius: 4 },
  healthText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, gap: 4 },
  statCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statChange: { fontSize: 11, fontFamily: "Inter_500Medium" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  quickAction: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 8, position: "relative" },
  quickActionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  quickActionBadge: { position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickActionBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  tabs: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 14 },
  subTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 10 },
  reqCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  reqLeft: { flex: 1 },
  reqFood: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  reqMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  reqScore: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  reqScoreText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  activityItem: { flexDirection: "row", gap: 12, paddingVertical: 14, borderBottomWidth: 1, alignItems: "flex-start" },
  actDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  actText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginBottom: 3 },
  actTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  switchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14, marginTop: 16 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
