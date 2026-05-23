import { useColors } from "@/hooks/useColors";
import { PLATFORM_ANALYTICS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NGOAnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const stats = [
    { label: "Requests Accepted", value: "284", icon: "check-circle" as const, color: "#3B82F6" },
    { label: "People Fed", value: "42,800", icon: "users" as const, color: colors.primary },
    { label: "Tonnes Saved", value: "8.4", icon: "package" as const, color: "#F97316" },
    { label: "Avg Response", value: "6 min", icon: "clock" as const, color: "#8B5CF6" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>NGO Analytics</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Akshaya Patra Foundation</Text>

      <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.impactBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.bannerLabel}>Total Community Impact</Text>
        <Text style={styles.bannerValue}>42,800</Text>
        <Text style={styles.bannerUnit}>People Fed This Year</Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + "22" }]}>
              <Feather name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {[
        { label: "Acceptance rate", value: "94.2%", pct: 94 },
        { label: "On-time delivery", value: "97.8%", pct: 98 },
        { label: "Donor satisfaction", value: "4.9/5.0", pct: 98 },
        { label: "Community reach", value: "88%", pct: 88 },
      ].map(item => (
        <View key={item.label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.metricHeader}>
            <Text style={[styles.metricLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Text style={[styles.metricValue, { color: "#3B82F6" }]}>{item.value}</Text>
          </View>
          <View style={[styles.metricBar, { backgroundColor: colors.border }]}>
            <View style={[styles.metricProgress, { backgroundColor: "#3B82F6", width: `${item.pct}%` }]} />
          </View>
        </View>
      ))}

      <View style={[styles.recognitionCard, { backgroundColor: colors.card, borderColor: "#F59E0B44" }]}>
        <Feather name="award" size={20} color="#F59E0B" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.recognitionTitle, { color: colors.foreground }]}>Top NGO of the Month</Text>
          <Text style={[styles.recognitionSub, { color: colors.mutedForeground }]}>
            Recognized by FeedForward platform for highest community impact
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  impactBanner: { borderRadius: 20, padding: 24, alignItems: "center", marginBottom: 16, gap: 4 },
  bannerLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  bannerValue: { fontSize: 44, fontFamily: "Inter_700Bold", color: "#fff" },
  bannerUnit: { fontSize: 14, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metricCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  metricHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  metricLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  metricValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  metricBar: { height: 6, borderRadius: 3 },
  metricProgress: { height: 6, borderRadius: 3 },
  recognitionCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 4 },
  recognitionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  recognitionSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
