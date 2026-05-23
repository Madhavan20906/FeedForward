import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { NGO_REQUESTS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const URGENCY_COLORS: Record<string, string> = { high: "#EF4444", medium: "#F59E0B", low: "#22C55E", critical: "#DC2626" };

export default function NGOHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"pending" | "accepted">("pending");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pending = NGO_REQUESTS.filter(r => r.status === "pending");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Header */}
      <LinearGradient
        colors={["#3B82F622", "#08080800"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>NGO Portal</Text>
            <Text style={[styles.orgName, { color: colors.foreground }]}>
              {user?.organization ?? "Akshaya Patra Foundation"}
            </Text>
          </View>
          <View style={[styles.onlineBadge, { backgroundColor: "#22C55E22", borderColor: "#22C55E44" }]}>
            <View style={[styles.onlineDot, { backgroundColor: "#22C55E" }]} />
            <Text style={[styles.onlineText, { color: "#22C55E" }]}>Online</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Pending", value: pending.length.toString(), color: "#F59E0B" },
            { label: "Today", value: "7", color: "#3B82F6" },
            { label: "Served", value: "840", color: "#22C55E" },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statPill, { backgroundColor: stat.color + "22", borderColor: stat.color + "44" }]}>
              <Text style={[styles.statPillValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[styles.statPillLabel, { color: stat.color }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          {(["pending", "accepted"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.card }]}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.foreground : colors.mutedForeground, fontFamily: activeTab === tab ? "Inter_700Bold" : "Inter_400Regular" }]}>
                {tab === "pending" ? `Pending (${pending.length})` : "Accepted"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Requests */}
        {activeTab === "pending" ? (
          pending.map(req => (
            <Pressable
              key={req.id}
              onPress={() => router.push({ pathname: "/(ngo)/request", params: { id: req.id } })}
              style={[styles.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Urgency indicator */}
              <View style={[styles.urgencyBar, { backgroundColor: URGENCY_COLORS[req.urgency] ?? "#F59E0B" }]} />

              <View style={styles.requestBody}>
                <View style={styles.requestHeader}>
                  <View style={[styles.donorTypeIcon, { backgroundColor: req.donorType === "Business" ? "#F97316" + "22" : colors.primary + "22" }]}>
                    <Feather name={req.donorType === "Business" ? "briefcase" : "home"} size={16} color={req.donorType === "Business" ? "#F97316" : colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.donorName, { color: colors.foreground }]}>{req.donorName}</Text>
                    <Text style={[styles.donorType, { color: colors.mutedForeground }]}>{req.donorType} Donor · {req.createdAt}</Text>
                  </View>
                  <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[req.urgency] + "22" }]}>
                    <Text style={[styles.urgencyText, { color: URGENCY_COLORS[req.urgency] }]}>
                      {req.urgency.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.foodName, { color: colors.foreground }]}>{req.foodName}</Text>
                <Text style={[styles.foodMeta, { color: colors.mutedForeground }]}>{req.quantity} · {req.category}</Text>

                <View style={styles.requestStats}>
                  <View style={styles.requestStat}>
                    <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.requestStatText, { color: colors.mutedForeground }]}>{req.distance}</Text>
                  </View>
                  <View style={styles.requestStat}>
                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.requestStatText, { color: colors.mutedForeground }]}>ETA {req.eta}</Text>
                  </View>
                  <View style={styles.requestStat}>
                    <Feather name="activity" size={12} color={colors.primary} />
                    <Text style={[styles.requestStatText, { color: colors.primary }]}>Score: {req.freshnessScore}%</Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Pressable style={[styles.declineBtn, { borderColor: colors.destructive + "44" }]}>
                    <Feather name="x" size={16} color={colors.destructive} />
                    <Text style={[styles.declineBtnText, { color: colors.destructive }]}>Decline</Text>
                  </Pressable>
                  <Pressable
                    style={styles.acceptBtn}
                    onPress={() => router.push({ pathname: "/(ngo)/request", params: { id: req.id } })}
                  >
                    <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.acceptBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                      <Feather name="check" size={16} color="#fff" />
                      <Text style={styles.acceptBtnText}>Review & Accept</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No active deliveries</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Accepted requests will appear here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  orgName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  onlineBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10 },
  statPill: { flex: 1, borderRadius: 12, borderWidth: 1, paddingVertical: 10, alignItems: "center", gap: 2 },
  statPillValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statPillLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  tabs: { flexDirection: "row", borderRadius: 14, borderWidth: 1, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabText: { fontSize: 14 },
  requestCard: { borderRadius: 18, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  urgencyBar: { height: 4 },
  requestBody: { padding: 16 },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  donorTypeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  donorName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  donorType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  urgencyText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  foodName: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 3 },
  foodMeta: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  requestStats: { flexDirection: "row", gap: 16, marginBottom: 14 },
  requestStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  requestStatText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  requestActions: { flexDirection: "row", gap: 10 },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1, paddingVertical: 12 },
  declineBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  acceptBtn: { flex: 2, borderRadius: 12, overflow: "hidden" },
  acceptBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  acceptBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
