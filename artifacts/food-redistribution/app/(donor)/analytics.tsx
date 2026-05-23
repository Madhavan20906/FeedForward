import { useColors } from "@/hooks/useColors";
import { DONOR_ANALYTICS, PLATFORM_ANALYTICS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Rect, Text as SvgText, Line } from "react-native-svg";

const { width } = Dimensions.get("window");

function BarChart({ data, color }: { data: { month: string; meals: number }[]; color: string }) {
  const chartWidth = width - 64;
  const chartHeight = 120;
  const maxVal = Math.max(...data.map(d => d.meals));
  const barWidth = (chartWidth / data.length) - 10;

  return (
    <Svg width={chartWidth} height={chartHeight + 24}>
      {data.map((d, i) => {
        const barH = (d.meals / maxVal) * chartHeight;
        const x = i * (chartWidth / data.length) + 5;
        const y = chartHeight - barH;
        return (
          <React.Fragment key={d.month}>
            <Rect x={x} y={y} width={barWidth} height={barH} rx={6} fill={color + "88"} />
            <SvgText x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize="10" fill={color + "aa"}>
              {d.month}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function WeeklyBar({ data, color }: { data: number[]; color: string }) {
  const chartWidth = width - 64;
  const chartHeight = 80;
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const maxVal = Math.max(...data);
  const barWidth = (chartWidth / data.length) - 8;

  return (
    <Svg width={chartWidth} height={chartHeight + 24}>
      {data.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = i * (chartWidth / data.length) + 4;
        const y = chartHeight - barH;
        return (
          <React.Fragment key={i}>
            <Rect x={x} y={y} width={barWidth} height={barH} rx={5} fill={i === 6 ? color : color + "55"} />
            <SvgText x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize="11" fill={color + "88"}>
              {days[i]}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const stats = [
    { label: "Total Donations", value: DONOR_ANALYTICS.totalDonations.toString(), icon: "package" as const, color: colors.primary },
    { label: "Meals Served", value: DONOR_ANALYTICS.mealsServed.toLocaleString(), icon: "users" as const, color: "#F97316" },
    { label: "CO₂ Saved", value: `${DONOR_ANALYTICS.co2Saved} kg`, icon: "wind" as const, color: "#3B82F6" },
    { label: "Water Saved", value: `${(DONOR_ANALYTICS.waterSaved / 1000).toFixed(1)}K L`, icon: "droplet" as const, color: "#8B5CF6" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>My Impact</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Your sustainability contribution tracker
      </Text>

      {/* Rank Card */}
      <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.rankCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.rankLeft}>
          <Text style={styles.rankLabel}>Your Status</Text>
          <Text style={styles.rankValue}>{DONOR_ANALYTICS.rank}</Text>
          <View style={styles.rankBadges}>
            {DONOR_ANALYTICS.badgesEarned.map(b => (
              <View key={b} style={styles.rankBadge}>
                <Feather name="award" size={10} color="#fff" />
                <Text style={styles.rankBadgeText}>{b}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.rankIconWrap}>
          <Feather name="award" size={48} color="rgba(255,255,255,0.3)" />
        </View>
      </LinearGradient>

      {/* Weekly Goal */}
      <View style={[styles.goalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.goalHeader}>
          <Text style={[styles.goalTitle, { color: colors.foreground }]}>Weekly Goal</Text>
          <Text style={[styles.goalPct, { color: colors.primary }]}>{DONOR_ANALYTICS.weeklyProgress}%</Text>
        </View>
        <View style={[styles.goalBar, { backgroundColor: colors.border }]}>
          <View style={[styles.goalProgress, { backgroundColor: colors.primary, width: `${DONOR_ANALYTICS.weeklyProgress}%` }]} />
        </View>
        <Text style={[styles.goalLabel, { color: colors.mutedForeground }]}>
          {DONOR_ANALYTICS.weeklyProgress}/{DONOR_ANALYTICS.weeklyGoal} meals this week
        </Text>
      </View>

      {/* Stats Grid */}
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

      {/* Monthly Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>Monthly Meals Saved</Text>
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Last 7 months</Text>
        <View style={styles.chartWrap}>
          <BarChart data={PLATFORM_ANALYTICS.monthlyImpact} color={colors.primary} />
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.chartTitle, { color: colors.foreground }]}>This Week's Donations</Text>
        <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Platform-wide activity</Text>
        <View style={styles.chartWrap}>
          <WeeklyBar data={PLATFORM_ANALYTICS.weeklyDonations} color="#F97316" />
        </View>
      </View>

      {/* Platform Stats */}
      <View style={[styles.platformCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.platformHeader}>
          <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.platformTitle, { color: colors.foreground }]}>Platform Overview</Text>
        </View>
        {[
          { label: "Total meals served", value: PLATFORM_ANALYTICS.mealsServed.toLocaleString(), color: colors.primary },
          { label: "Active NGOs", value: PLATFORM_ANALYTICS.activeNGOs.toString(), color: "#3B82F6" },
          { label: "Total donors", value: PLATFORM_ANALYTICS.activeDonors.toLocaleString(), color: "#F97316" },
          { label: "CO₂ saved (tons)", value: PLATFORM_ANALYTICS.co2Saved.toString(), color: "#22C55E" },
          { label: "Total donations", value: PLATFORM_ANALYTICS.totalDonations.toLocaleString(), color: "#8B5CF6" },
        ].map((item, index) => (
          <View key={item.label}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.platformRow}>
              <Text style={[styles.platformLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.platformValue, { color: item.color }]}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 24 },
  rankCard: { borderRadius: 20, padding: 22, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rankLeft: { flex: 1 },
  rankLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  rankValue: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 12 },
  rankBadges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  rankBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
  rankIconWrap: {},
  goalCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  goalTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  goalPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  goalBar: { height: 8, borderRadius: 4, marginBottom: 8 },
  goalProgress: { height: 8, borderRadius: 4 },
  goalLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "flex-start", gap: 8 },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14 },
  chartTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 16 },
  chartWrap: { alignItems: "center" },
  platformCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 8 },
  platformHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  platformTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  platformRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
  platformLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  platformValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  divider: { height: 1 },
});
