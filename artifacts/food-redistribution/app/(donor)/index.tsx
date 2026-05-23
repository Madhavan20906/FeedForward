import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { PLATFORM_ANALYTICS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const STATUS_COLORS: Record<string, string> = {
  delivered: "#22C55E",
  in_transit: "#F97316",
  matched: "#3B82F6",
  pending: "#F59E0B",
  cancelled: "#EF4444",
};
const STATUS_LABELS: Record<string, string> = {
  delivered: "Delivered",
  in_transit: "In Transit",
  matched: "Matched",
  pending: "Pending",
  cancelled: "Cancelled",
};

export default function DonorHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, donations } = useApp();
  const donateScale = useRef(new Animated.Value(1)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isBusiness = user?.role === "business_donor";

  const pressDonate = () => {
    Animated.sequence([
      Animated.timing(donateScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(donateScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start(() => router.push("/(donor)/donate"));
  };

  // donations already includes mock data as initial state — no need to spread MOCK_DONATIONS again
  const recentDonations = donations.slice(0, 5);
  const totalMeals = donations.filter(d => d.status === "delivered").reduce((sum, d) => sum + (d.mealsServed ?? d.servingCapacity), 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Header */}
      <LinearGradient colors={["#22C55E18", "#08080800"]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good afternoon,</Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>
              {user?.username ?? user?.name?.split(" ")[0] ?? "Donor"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="bell" size={20} color={colors.foreground} />
              <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
            </Pressable>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{(user?.name ?? "U")[0]}</Text>
            </View>
          </View>
        </View>
        {isBusiness && (
          <View style={[styles.businessBadge, { backgroundColor: "#F97316" + "22", borderColor: "#F97316" + "44" }]}>
            <Feather name="award" size={14} color="#F97316" />
            <Text style={[styles.businessBadgeText, { color: "#F97316" }]}>
              Zero Food Waste Partner — Platinum Tier
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Meals Donated", value: totalMeals > 0 ? totalMeals.toLocaleString() : "1,840", icon: "users" as const, color: colors.primary },
            { label: "CO₂ Saved", value: "3.68kg", icon: "wind" as const, color: "#3B82F6" },
            { label: "Donations", value: donations.length.toString(), icon: "package" as const, color: "#F97316" },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "22" }]}>
                <Feather name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Donate CTA */}
        <Animated.View style={{ transform: [{ scale: donateScale }] }}>
          <Pressable onPress={pressDonate}>
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.donateCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <View>
                <Text style={styles.ctaTitle}>Donate Food Now</Text>
                <Text style={styles.ctaSubtitle}>
                  {isBusiness ? "Upload bulk surplus food" : "Share your surplus with communities"}
                </Text>
              </View>
              <View style={styles.ctaArrow}>
                <Feather name="arrow-right" size={22} color="#fff" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Platform Stats */}
        <View style={[styles.liveStats, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.liveHeader}>
            <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.liveTitle, { color: colors.foreground }]}>Platform Live Stats</Text>
          </View>
          <View style={styles.liveRow}>
            {[
              { val: PLATFORM_ANALYTICS.activeNGOs.toString(), label: "Active NGOs", color: colors.primary },
              { val: PLATFORM_ANALYTICS.activeDonors.toLocaleString(), label: "Donors Today", color: "#F97316" },
              { val: (PLATFORM_ANALYTICS.mealsServed / 1000).toFixed(0) + "K", label: "Meals Served", color: "#3B82F6" },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={[styles.liveDivider, { backgroundColor: colors.border }]} />}
                <View style={styles.liveStat}>
                  <Text style={[styles.liveValue, { color: item.color }]}>{item.val}</Text>
                  <Text style={[styles.liveLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Recent Donations */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Donations</Text>
            <Pressable><Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text></Pressable>
          </View>
          {recentDonations.map((d, index) => (
            <View
              key={`recent-${d.id}-${index}`}
              style={[styles.donationCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.donationIcon, { backgroundColor: d.category === "veg" ? colors.primary + "22" : "#F97316" + "22" }]}>
                <Feather name="package" size={18} color={d.category === "veg" ? colors.primary : "#F97316"} />
              </View>
              <View style={styles.donationInfo}>
                <Text style={[styles.donationName, { color: colors.foreground }]}>{d.foodName}</Text>
                <Text style={[styles.donationMeta, { color: colors.mutedForeground }]}>
                  {d.quantity} {d.unit}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[d.status] + "22" }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[d.status] }]}>
                  {STATUS_LABELS[d.status]}
                </Text>
              </View>
            </View>
          ))}
          {recentDonations.length === 0 && (
            <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No donations yet — tap Donate Now!</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  userName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#000" },
  businessBadge: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  businessBadgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  body: { paddingHorizontal: 16, paddingTop: 8 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  donateCta: { borderRadius: 20, paddingVertical: 22, paddingHorizontal: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  ctaTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  ctaSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  ctaArrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  liveStats: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 16 },
  liveHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  liveRow: { flexDirection: "row", justifyContent: "space-around" },
  liveStat: { alignItems: "center" },
  liveValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  liveLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  liveDivider: { width: 1, marginHorizontal: 8 },
  recentSection: { marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 14, fontFamily: "Inter_500Medium" },
  donationCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
  donationIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  donationInfo: { flex: 1 },
  donationName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  donationMeta: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emptyCard: { borderRadius: 14, borderWidth: 1, padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
