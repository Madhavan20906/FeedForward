import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { MOCK_NGOS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
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

const BADGES = [
  { icon: "heart", label: "Community Hero", color: "#EF4444" },
  { icon: "wind", label: "Green Guardian", color: "#22C55E" },
  { icon: "zap", label: "Impact Maker", color: "#F97316" },
];

export default function SuccessScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentDonation, addDonation } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const selectedNGO = MOCK_NGOS.find(n => n.id === currentDonation.selectedNGOId) ?? MOCK_NGOS[0];
  const servings = currentDonation.servingCapacity ?? 20;
  const co2Saved = (servings * 0.002).toFixed(2);
  const waterSaved = servings * 30;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    addDonation({
      id: "don_" + Date.now(),
      foodName: currentDonation.foodName ?? "Food Donation",
      quantity: currentDonation.quantity ?? 10,
      unit: currentDonation.unit ?? "servings",
      category: (currentDonation.category as "veg" | "non-veg" | "beverage" | "bakery" | "dairy") ?? "veg",
      status: "delivered",
      freshnessScore: currentDonation.freshnessScore ?? 90,
      urgency: (currentDonation.urgency as "low" | "medium" | "high" | "critical") ?? "medium",
      servingCapacity: servings,
      preparedAt: currentDonation.preparedAt ?? "Today",
      expiryEstimate: currentDonation.expiryEstimate ?? "6 hours",
      ngoName: selectedNGO.name,
      riderName: "Ravi Kumar",
      createdAt: new Date().toISOString(),
      mealsServed: servings,
    });

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#22C55E20", "#16A34A08", "#08080800"]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconSection}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: bounceAnim }] }}>
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.successIcon}>
              <Feather name="check" size={52} color="#fff" />
            </LinearGradient>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, alignItems: "center" }}>
            <Text style={[styles.title, { color: colors.foreground }]}>Food Delivered!</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Your donation reached {selectedNGO.name}
            </Text>
          </Animated.View>
        </View>

        {/* Impact Stats */}
        <Animated.View style={[styles.impactCard, { opacity: fadeAnim, backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.impactTitle, { color: colors.foreground }]}>Your Impact Today</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactStat}>
              <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.impactStatIcon}>
                <Feather name="users" size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.impactValue, { color: colors.foreground }]}>{servings}</Text>
              <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>People Fed</Text>
            </View>
            <View style={[styles.impactDivider, { backgroundColor: colors.border }]} />
            <View style={styles.impactStat}>
              <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.impactStatIcon}>
                <Feather name="wind" size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.impactValue, { color: colors.foreground }]}>{co2Saved} kg</Text>
              <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>CO₂ Saved</Text>
            </View>
            <View style={[styles.impactDivider, { backgroundColor: colors.border }]} />
            <View style={styles.impactStat}>
              <LinearGradient colors={["#F97316", "#EA580C"]} style={styles.impactStatIcon}>
                <Feather name="droplet" size={18} color="#fff" />
              </LinearGradient>
              <Text style={[styles.impactValue, { color: colors.foreground }]}>{waterSaved}L</Text>
              <Text style={[styles.impactLabel, { color: colors.mutedForeground }]}>Water Saved</Text>
            </View>
          </View>
        </Animated.View>

        {/* Delivery Receipt */}
        <Animated.View style={[styles.receiptCard, { opacity: fadeAnim, backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Food donated</Text>
            <Text style={[styles.receiptValue, { color: colors.foreground }]}>{currentDonation.foodName ?? "Food Donation"}</Text>
          </View>
          <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Received by</Text>
            <Text style={[styles.receiptValue, { color: colors.foreground }]}>{selectedNGO.name}</Text>
          </View>
          <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Delivery by</Text>
            <Text style={[styles.receiptValue, { color: colors.foreground }]}>Ravi Kumar (NGO Volunteer)</Text>
          </View>
          <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Freshness score</Text>
            <Text style={[styles.receiptValue, { color: colors.primary }]}>{currentDonation.freshnessScore ?? 90}%</Text>
          </View>
          <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Cost to donor</Text>
            <Text style={[styles.receiptValue, { color: colors.primary }]}>Free (sponsored)</Text>
          </View>
        </Animated.View>

        {/* Badges */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.badgesTitle, { color: colors.foreground }]}>Badges Earned</Text>
          <View style={styles.badges}>
            {BADGES.map((badge) => (
              <View key={badge.label} style={[styles.badge, { backgroundColor: badge.color + "22", borderColor: badge.color + "44" }]}>
                <View style={[styles.badgeIcon, { backgroundColor: badge.color }]}>
                  <Feather name={badge.icon as keyof typeof Feather.glyphMap} size={14} color="#fff" />
                </View>
                <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Share Certificate */}
        <Animated.View style={[styles.shareCard, { opacity: fadeAnim, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="award" size={18} color={colors.primary} />
          <Text style={[styles.shareText, { color: colors.foreground }]}>
            Your sustainability certificate has been generated!
          </Text>
          <Pressable style={[styles.shareBtn, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share Certificate</Text>
          </Pressable>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/(donor)/donate")} style={styles.donateAgainBtn}>
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.donateAgainGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Feather name="plus" size={20} color="#fff" />
              <Text style={styles.donateAgainText}>Donate Again</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(donor)")}
            style={[styles.homeBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <Feather name="home" size={18} color={colors.foreground} />
            <Text style={[styles.homeBtnText, { color: colors.foreground }]}>Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  iconSection: { alignItems: "center", marginBottom: 32, gap: 16 },
  successIcon: {
    width: 110, height: 110, borderRadius: 34,
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 30, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },
  impactCard: { borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 16 },
  impactTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 20, textAlign: "center" },
  impactGrid: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  impactStat: { alignItems: "center", gap: 8, flex: 1 },
  impactStatIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  impactValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  impactLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  impactDivider: { width: 1, height: 60 },
  receiptCard: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 20 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  receiptLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "right", flex: 1, marginLeft: 16 },
  receiptDivider: { height: 1 },
  badgesTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  badge: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  badgeIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  shareCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 24,
  },
  shareText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  shareBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  actions: { gap: 12 },
  donateAgainBtn: { borderRadius: 16, overflow: "hidden" },
  donateAgainGradient: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18,
  },
  donateAgainText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  homeBtn: {
    borderRadius: 16, borderWidth: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16,
  },
  homeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
