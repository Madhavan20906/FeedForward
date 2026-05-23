import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MOCK_COMMUNITY_DONATIONS, type CommunityDonation } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Donation } from "@/data/mockData";

const { width } = Dimensions.get("window");

const STATUS_COLORS: Record<string, string> = {
  delivered: "#22C55E",
  in_transit: "#F97316",
  matched: "#3B82F6",
  pending: "#F59E0B",
  cancelled: "#EF4444",
};
const STATUS_LABELS: Record<string, string> = {
  delivered: "Delivered ✓",
  in_transit: "In Transit",
  matched: "Matched",
  pending: "Pending",
  cancelled: "Cancelled",
};

function formatDate(isoStr: string) {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(isoStr: string) {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diff = Math.floor((now - then) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function MyDonationCard({ donation }: { donation: Donation }) {
  const colors = useColors();
  const sc = STATUS_COLORS[donation.status] ?? colors.primary;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.catDot, { backgroundColor: sc + "22" }]}>
          <Feather name="package" size={18} color={sc} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{donation.foodName}</Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
            {donation.quantity} {donation.unit} · {donation.servingCapacity} people
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: sc + "22" }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[donation.status]}</Text>
        </View>
      </View>
      {donation.ngoName && (
        <View style={styles.cardRow}>
          <Feather name="heart" size={12} color={colors.mutedForeground} />
          <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>NGO: {donation.ngoName}</Text>
        </View>
      )}
      <View style={styles.cardRow}>
        <Feather name="cpu" size={12} color={colors.primary} />
        <Text style={[styles.cardRowText, { color: colors.primary }]}>AI Score: {donation.freshnessScore}%</Text>
        <View style={{ flex: 1 }} />
        <Feather name="calendar" size={12} color={colors.mutedForeground} />
        <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>{formatDate(donation.createdAt)}</Text>
      </View>
      {donation.status === "delivered" && (
        <View style={[styles.impactRow, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" }]}>
          <Feather name="users" size={13} color={colors.primary} />
          <Text style={[styles.impactText, { color: colors.primary }]}>
            Fed {donation.mealsServed ?? donation.servingCapacity} people · Saved ~{((donation.mealsServed ?? donation.servingCapacity) * 0.5).toFixed(1)} kg CO₂
          </Text>
        </View>
      )}
    </View>
  );
}

function CommunityCard({ item }: { item: CommunityDonation }) {
  const colors = useColors();
  const sc = STATUS_COLORS[item.status] ?? colors.primary;
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.avatarLetter, { color: colors.primary }]}>{item.donorName[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.foodName}</Text>
          <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
            by {item.donorUsername} · {item.city}
          </Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: sc + "22" }]}>
          <Text style={[styles.statusText, { color: sc }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Feather name="package" size={12} color={colors.mutedForeground} />
        <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>
          {item.quantity} {item.unit} · {item.servingCapacity} servings
        </Text>
        <View style={{ flex: 1 }} />
        <Feather name="clock" size={12} color={colors.mutedForeground} />
        <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>{timeAgo(item.createdAt)}</Text>
      </View>
      <View style={styles.cardRow}>
        <Feather name="heart" size={12} color="#EF4444" />
        <Text style={[styles.cardRowText, { color: colors.mutedForeground }]}>{item.ngoName}</Text>
        <View style={{ flex: 1 }} />
        <Feather name="cpu" size={12} color={colors.primary} />
        <Text style={[styles.cardRowText, { color: colors.primary }]}>{item.freshnessScore}%</Text>
      </View>
      {item.status === "delivered" && item.mealsServed && (
        <View style={[styles.impactRow, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" }]}>
          <Feather name="award" size={13} color={colors.primary} />
          <Text style={[styles.impactText, { color: colors.primary }]}>
            🎉 {item.mealsServed} meals served!
          </Text>
        </View>
      )}
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, donations } = useApp();
  const [tab, setTab] = useState<"mine" | "community">("mine");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalMeals = donations.filter(d => d.status === "delivered").reduce((sum, d) => sum + (d.mealsServed ?? d.servingCapacity), 0);
  const totalDelivered = donations.filter(d => d.status === "delivered").length;
  const communityMeals = MOCK_COMMUNITY_DONATIONS.filter(d => d.status === "delivered").reduce((s, d) => s + (d.mealsServed ?? 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#22C55E18", "#080808"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Donation History</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Signed in as <Text style={{ color: colors.primary }}>@{user?.username ?? "you"}</Text>
        </Text>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: colors.primary }]}>{donations.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>My Donations</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: "#F97316" }]}>{totalMeals.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Meals Fed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statVal, { color: "#3B82F6" }]}>{totalDelivered}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completed</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[styles.tabRow, { backgroundColor: colors.surfaceElevated }]}>
          <Pressable
            onPress={() => setTab("mine")}
            style={[styles.tabBtn, tab === "mine" && { backgroundColor: colors.primary }]}
          >
            <Feather name="user" size={14} color={tab === "mine" ? "#000" : colors.mutedForeground} />
            <Text style={[styles.tabBtnText, { color: tab === "mine" ? "#000" : colors.mutedForeground }]}>
              My Contributions
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab("community")}
            style={[styles.tabBtn, tab === "community" && { backgroundColor: colors.primary }]}
          >
            <Feather name="globe" size={14} color={tab === "community" ? "#000" : colors.mutedForeground} />
            <Text style={[styles.tabBtnText, { color: tab === "community" ? "#000" : colors.mutedForeground }]}>
              Community Feed
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "mine" ? (
          <>
            {donations.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="inbox" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No donations yet</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                  Your donation history will appear here once you make your first contribution.
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.listLabel, { color: colors.mutedForeground }]}>
                  {donations.length} total · sorted by most recent
                </Text>
                {donations.map((d, i) => (
                  <MyDonationCard key={`mine-${d.id}-${i}`} donation={d} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            <View style={[styles.communityBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33" }]}>
              <Feather name="globe" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
                  Community Impact Today
                </Text>
                <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
                  {MOCK_COMMUNITY_DONATIONS.length} donations · {communityMeals.toLocaleString()} meals served across India
                </Text>
              </View>
            </View>
            <Text style={[styles.listLabel, { color: colors.mutedForeground }]}>
              Latest from the FeedForward community
            </Text>
            {MOCK_COMMUNITY_DONATIONS.map(item => (
              <CommunityCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  tabRow: { flexDirection: "row", borderRadius: 14, padding: 4, marginBottom: 0 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listContent: { paddingHorizontal: 16, paddingTop: 14 },
  listLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 10, paddingHorizontal: 2 },
  communityBanner: { flexDirection: "row", gap: 10, borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 12, alignItems: "flex-start" },
  bannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 3 },
  bannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  catDot: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 18, fontFamily: "Inter_700Bold" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  cardMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardRowText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  impactRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 8, marginTop: 2 },
  impactText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  empty: { borderRadius: 18, borderWidth: 1, padding: 36, alignItems: "center", gap: 12, marginTop: 20 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
