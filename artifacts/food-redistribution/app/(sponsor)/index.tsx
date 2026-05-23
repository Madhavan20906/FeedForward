import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SPONSOR_STATS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect } from "react-native-svg";

const { width } = Dimensions.get("window");

const ESG_METRICS = [
  { label: "Environmental", score: 94, color: "#22C55E" },
  { label: "Social", score: 88, color: "#3B82F6" },
  { label: "Governance", score: 91, color: "#8B5CF6" },
];

const IMPACT_MONTHS = [
  { month: "Nov", deliveries: 142 },
  { month: "Dec", deliveries: 198 },
  { month: "Jan", deliveries: 167 },
  { month: "Feb", deliveries: 234 },
  { month: "Mar", deliveries: 289 },
  { month: "Apr", deliveries: 312 },
  { month: "May", deliveries: 354 },
];

export default function SponsorDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { switchRole } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const chartW = width - 64;
  const maxVal = Math.max(...IMPACT_MONTHS.map(d => d.deliveries));
  const barW = (chartW / IMPACT_MONTHS.length) - 8;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
    >
      {/* Header */}
      <LinearGradient colors={["#F59E0B22", "#08080800"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>CSR Portal</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>{SPONSOR_STATS.companyName}</Text>
          </View>
          <View style={[styles.tierBadge, { backgroundColor: "#F59E0B22", borderColor: "#F59E0B44" }]}>
            <Feather name="award" size={14} color="#F59E0B" />
            <Text style={[styles.tierText, { color: "#F59E0B" }]}>Platinum</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* ESG Score */}
        <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.esgCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.esgLeft}>
            <Text style={styles.esgLabel}>Overall ESG Score</Text>
            <Text style={styles.esgScore}>{SPONSOR_STATS.esgScore}</Text>
            <Text style={styles.esgSub}>/ 100 · Industry Top 5%</Text>
          </View>
          <View style={styles.esgRight}>
            {ESG_METRICS.map(m => (
              <View key={m.label} style={styles.esgMetricRow}>
                <Text style={styles.esgMetricLabel}>{m.label[0]}</Text>
                <View style={styles.esgMetricBarWrap}>
                  <View style={[styles.esgMetricBar, { width: `${m.score}%`, backgroundColor: "#fff" }]} />
                </View>
                <Text style={styles.esgMetricScore}>{m.score}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Deliveries Sponsored", value: SPONSOR_STATS.deliveriesSponsored.toLocaleString(), icon: "truck" as const, color: "#22C55E" },
            { label: "Meals Enabled", value: SPONSOR_STATS.mealsEnabled.toLocaleString(), icon: "users" as const, color: "#3B82F6" },
            { label: "CO₂ Offset (kg)", value: SPONSOR_STATS.co2Offset.toString(), icon: "wind" as const, color: "#22C55E" },
            { label: "Reach (people)", value: (SPONSOR_STATS.visibilityReach / 1000000).toFixed(1) + "M", icon: "eye" as const, color: "#8B5CF6" },
          ].map(stat => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + "22" }]}>
                <Feather name={stat.icon} size={16} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Sponsored Deliveries</Text>
          <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Monthly trend</Text>
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Svg width={chartW} height={100 + 20}>
              {IMPACT_MONTHS.map((d, i) => {
                const bH = (d.deliveries / maxVal) * 100;
                const x = i * (chartW / IMPACT_MONTHS.length) + 4;
                const y = 100 - bH;
                return (
                  <React.Fragment key={d.month}>
                    <Rect x={x} y={y} width={barW} height={bH} rx={5} fill={i === 6 ? "#F59E0B" : "#F59E0B55"} />
                  </React.Fragment>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* CSR Benefits */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your CSR Benefits</Text>
        {[
          { icon: "award" as const, title: "Brand Visibility", desc: "Logo on 2.4M impressions across donor & NGO screens", color: "#F59E0B" },
          { icon: "file-text" as const, title: "ESG Reporting", desc: "Auto-generated quarterly sustainability reports", color: "#3B82F6" },
          { icon: "trending-up" as const, title: "Impact Analytics", desc: "Real-time dashboard with all sponsored delivery metrics", color: "#22C55E" },
          { icon: "users" as const, title: "Community Credit", desc: "Government CSR certification via NITI Aayog linkage", color: "#8B5CF6" },
        ].map(b => (
          <View key={b.title} style={[styles.benefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.benefitIcon, { backgroundColor: b.color + "22" }]}>
              <Feather name={b.icon} size={20} color={b.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.benefitTitle, { color: colors.foreground }]}>{b.title}</Text>
              <Text style={[styles.benefitDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
            </View>
          </View>
        ))}

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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  tierBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  tierText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  body: { paddingHorizontal: 16 },
  esgCard: { borderRadius: 20, padding: 22, marginBottom: 16, flexDirection: "row", alignItems: "center" },
  esgLeft: { flex: 1 },
  esgLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  esgScore: { fontSize: 52, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 58 },
  esgSub: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)" },
  esgRight: { width: 140, gap: 10 },
  esgMetricRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  esgMetricLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff", width: 16 },
  esgMetricBarWrap: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3 },
  esgMetricBar: { height: 6, borderRadius: 3, opacity: 0.9 },
  esgMetricScore: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff", width: 24, textAlign: "right" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 14 },
  benefitCard: { flexDirection: "row", alignItems: "flex-start", gap: 14, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 10 },
  benefitIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  benefitTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  benefitDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  switchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14, marginTop: 8 },
  switchText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
