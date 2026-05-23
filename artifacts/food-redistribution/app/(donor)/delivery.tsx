import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type Phase = "choose" | "checking_ngo" | "ngo_found" | "ngo_unavailable" | "choose_ride";

const RIDE_OPTIONS = [
  {
    id: "rapido",
    name: "Rapido Bike",
    tagline: "Fastest, affordable bike delivery",
    icon: "zap" as const,
    color: "#FFD600",
    textColor: "#000",
    eta: "8–12 min",
    price: "₹35–55",
    tag: "Cheapest",
  },
  {
    id: "ola_auto",
    name: "Ola Auto",
    tagline: "Comfortable auto-rickshaw",
    icon: "navigation" as const,
    color: "#4CAF50",
    textColor: "#fff",
    eta: "10–16 min",
    price: "₹55–80",
    tag: "Popular",
  },
  {
    id: "uber_go",
    name: "Uber Go",
    tagline: "Reliable cab for bulky donations",
    icon: "truck" as const,
    color: "#000000",
    textColor: "#fff",
    eta: "12–18 min",
    price: "₹80–120",
    tag: "Most Space",
  },
  {
    id: "namma_yatri",
    name: "Namma Yatri",
    tagline: "Local auto — zero commission",
    icon: "map-pin" as const,
    color: "#F97316",
    textColor: "#fff",
    eta: "10–15 min",
    price: "₹45–70",
    tag: "Local",
  },
];

export default function DeliveryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setCurrentDonation, currentDonation } = useApp();
  const [phase, setPhase] = useState<Phase>("choose");
  const [selectedRide, setSelectedRide] = useState<string | null>(null);
  const checkingAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useFocusEffect(
    useCallback(() => {
      setPhase("choose");
      setSelectedRide(null);
      checkingAnim.stopAnimation();
      checkingAnim.setValue(0);
    }, [])
  );

  const ngoName = (currentDonation as Record<string, unknown>).selectedNGOName as string | undefined ?? "Akshaya Patra Foundation";

  const handleNGOVolunteer = () => {
    setPhase("checking_ngo");
    // Animate checking dots
    Animated.loop(
      Animated.timing(checkingAnim, { toValue: 1, duration: 800, useNativeDriver: true })
    ).start();
    // Simulate check — 60% chance NGO has volunteer
    setTimeout(() => {
      const hasVolunteer = Math.random() > 0.4;
      if (hasVolunteer) {
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase("ngo_found");
        setCurrentDonation({ deliveryMethod: "ngo_volunteer" } as never);
        setTimeout(() => router.push("/(donor)/tracking"), 2000);
      } else {
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPhase("ngo_unavailable");
      }
    }, 3500);
  };

  const handleConfirmRide = () => {
    if (!selectedRide) return;
    setCurrentDonation({ deliveryMethod: selectedRide } as never);
    router.push("/(donor)/tracking");
  };

  // ── Phase: Checking NGO availability ──
  if (phase === "checking_ngo") {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#22C55E18", "#08080800"]} style={StyleSheet.absoluteFillObject} />
        <View style={[styles.checkingIcon, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
          <Animated.View style={{ transform: [{ rotate: checkingAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
            <Feather name="loader" size={36} color={colors.primary} />
          </Animated.View>
        </View>
        <Text style={[styles.checkingTitle, { color: colors.foreground }]}>Checking Availability</Text>
        <Text style={[styles.checkingSub, { color: colors.mutedForeground }]}>
          Contacting {ngoName} for a volunteer rider...
        </Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[styles.dot, { backgroundColor: colors.primary, opacity: checkingAnim.interpolate({ inputRange: [0, 0.33 * (i + 1), 1], outputRange: [0.3, 1, 0.3] }) }]}
            />
          ))}
        </View>
      </View>
    );
  }

  // ── Phase: NGO Volunteer Found ──
  if (phase === "ngo_found") {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#22C55E22", "#16A34A08"]} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.successIconBig}>
          <Feather name="user-check" size={44} color="#fff" />
        </LinearGradient>
        <Text style={[styles.foundTitle, { color: colors.foreground }]}>Volunteer Assigned!</Text>
        <Text style={[styles.foundName, { color: colors.primary }]}>Ravi Kumar</Text>
        <Text style={[styles.foundSub, { color: colors.mutedForeground }]}>
          NGO volunteer rider from {ngoName}
        </Text>
        <View style={styles.riderStats}>
          <View style={[styles.riderStat, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="star" size={14} color={colors.primary} />
            <Text style={[styles.riderStatText, { color: colors.primary }]}>4.9 rating</Text>
          </View>
          <View style={[styles.riderStat, { backgroundColor: "#3B82F622" }]}>
            <Feather name="package" size={14} color="#3B82F6" />
            <Text style={[styles.riderStatText, { color: "#3B82F6" }]}>342 deliveries</Text>
          </View>
        </View>
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Opening live tracker...</Text>
      </View>
    );
  }

  // ── Phase: NGO Unavailable — show ride options ──
  if (phase === "ngo_unavailable" || phase === "choose_ride") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable onPress={() => setPhase("choose")}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Choose Ride</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
          {phase === "ngo_unavailable" && (
            <View style={[styles.alertCard, { backgroundColor: "#F59E0B18", borderColor: "#F59E0B44" }]}>
              <Feather name="alert-triangle" size={18} color="#F59E0B" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertTitle, { color: colors.foreground }]}>No Volunteers Available</Text>
                <Text style={[styles.alertSub, { color: colors.mutedForeground }]}>
                  {ngoName} currently has no available riders. Book a ride to deliver your food.
                </Text>
              </View>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {phase === "ngo_unavailable" ? "Book a Ride Instead" : "Choose Your Ride Service"}
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Delivery cost will be reimbursed by TechCorp CSR sponsorship
          </Text>

          {RIDE_OPTIONS.map(opt => (
            <Pressable
              key={opt.id}
              onPress={() => setSelectedRide(opt.id)}
              style={[
                styles.rideCard,
                {
                  backgroundColor: selectedRide === opt.id ? colors.card : colors.surfaceElevated,
                  borderColor: selectedRide === opt.id ? opt.color : colors.border,
                  borderWidth: selectedRide === opt.id ? 2 : 1,
                },
              ]}
            >
              <View style={[styles.rideBrand, { backgroundColor: opt.color }]}>
                <Feather name={opt.icon} size={22} color={opt.textColor} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rideTitleRow}>
                  <Text style={[styles.rideName, { color: colors.foreground }]}>{opt.name}</Text>
                  <View style={[styles.rideTag, { backgroundColor: opt.color + "22" }]}>
                    <Text style={[styles.rideTagText, { color: opt.color === "#FFD600" ? "#856404" : opt.color }]}>{opt.tag}</Text>
                  </View>
                </View>
                <Text style={[styles.rideTagline, { color: colors.mutedForeground }]}>{opt.tagline}</Text>
                <View style={styles.rideMeta}>
                  <View style={styles.rideMetaItem}>
                    <Feather name="clock" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.rideMetaText, { color: colors.mutedForeground }]}>{opt.eta}</Text>
                  </View>
                  <View style={styles.rideMetaItem}>
                    <Feather name="tag" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.rideMetaText, { color: colors.mutedForeground }]}>{opt.price}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.radio, { borderColor: selectedRide === opt.id ? opt.color : colors.border }]}>
                {selectedRide === opt.id && <View style={[styles.radioInner, { backgroundColor: opt.color }]} />}
              </View>
            </Pressable>
          ))}

          {selectedRide && (
            <View style={[styles.sponsorNote, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
              <Feather name="award" size={14} color={colors.primary} />
              <Text style={[styles.sponsorNoteText, { color: colors.primary }]}>
                This ride is sponsored by TechCorp CSR — you pay ₹0
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            onPress={handleConfirmRide}
            style={[styles.confirmBtn, { opacity: selectedRide ? 1 : 0.5 }]}
            disabled={!selectedRide}
          >
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.confirmBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Feather name="navigation" size={20} color="#fff" />
              <Text style={styles.confirmBtnText}>Confirm & Track Live</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Phase: Choose delivery type ──
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(donor)')}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Delivery Method</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.progressWrap, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: "71%" }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* NGO info */}
        <View style={[styles.ngoInfo, { backgroundColor: colors.card, borderColor: colors.primary + "44", borderWidth: 1.5 }]}>
          <LinearGradient colors={["#22C55E22", "#16A34A08"]} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.ngoInfoIcon, { backgroundColor: colors.primary + "33" }]}>
            <Feather name="heart" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ngoInfoLabel, { color: colors.mutedForeground }]}>Confirmed NGO</Text>
            <Text style={[styles.ngoInfoName, { color: colors.foreground }]}>{ngoName}</Text>
          </View>
          <View style={[styles.confirmedBadge, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="check" size={12} color={colors.primary} />
            <Text style={[styles.confirmedText, { color: colors.primary }]}>Confirmed</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Who arranges delivery?</Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          The NGO can send their own volunteer, or you can book a ride service
        </Text>

        {/* Option 1: NGO Volunteer */}
        <Pressable onPress={handleNGOVolunteer} style={({ pressed }) => [styles.choiceCard, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2, opacity: pressed ? 0.9 : 1 }]}>
          <LinearGradient colors={["#22C55E18", "#16A34A08"]} style={StyleSheet.absoluteFillObject} />
          <View style={[styles.choiceIcon, { backgroundColor: colors.primary }]}>
            <Feather name="user" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.choiceTitleRow}>
              <Text style={[styles.choiceTitle, { color: colors.foreground }]}>NGO Volunteer</Text>
              <View style={[styles.choiceTag, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.choiceTagText, { color: colors.primary }]}>Free</Text>
              </View>
            </View>
            <Text style={[styles.choiceSub, { color: colors.mutedForeground }]}>
              {ngoName} sends their own trained volunteer rider
            </Text>
            <View style={styles.choiceMeta}>
              <View style={styles.choiceMetaItem}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.choiceMetaText, { color: colors.mutedForeground }]}>15–25 min ETA</Text>
              </View>
              <View style={styles.choiceMetaItem}>
                <Feather name="shield" size={12} color={colors.primary} />
                <Text style={[styles.choiceMetaText, { color: colors.primary }]}>NGO Verified</Text>
              </View>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={colors.primary} />
        </Pressable>

        {/* Option 2: Ride Service */}
        <Pressable
          onPress={() => setPhase("choose_ride")}
          style={({ pressed }) => [styles.choiceCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5, opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={[styles.choiceIcon, { backgroundColor: "#3B82F6" }]}>
            <Feather name="navigation" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.choiceTitleRow}>
              <Text style={[styles.choiceTitle, { color: colors.foreground }]}>Book a Ride</Text>
              <View style={[styles.choiceTag, { backgroundColor: "#3B82F622" }]}>
                <Text style={[styles.choiceTagText, { color: "#3B82F6" }]}>CSR Sponsored</Text>
              </View>
            </View>
            <Text style={[styles.choiceSub, { color: colors.mutedForeground }]}>
              Rapido, Ola, Uber or Namma Yatri — cost covered by sponsorship
            </Text>
            <View style={styles.rideIconsRow}>
              {[
                { color: "#FFD600", label: "R" },
                { color: "#4CAF50", label: "O" },
                { color: "#000000", label: "U" },
                { color: "#F97316", label: "N" },
              ].map(r => (
                <View key={r.label} style={[styles.rideIconPill, { backgroundColor: r.color }]}>
                  <Text style={[styles.rideIconPillText, { color: r.label === "R" ? "#000" : "#fff" }]}>{r.label}</Text>
                </View>
              ))}
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
        </Pressable>

        <View style={[styles.aiNote, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="cpu" size={14} color={colors.primary} />
          <Text style={[styles.aiNoteText, { color: colors.mutedForeground }]}>
            AI Recommendation: NGO Volunteer is optimal — zero logistics cost maximises food impact
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  progressWrap: { height: 4 },
  progressBar: { height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  checkingIcon: { width: 96, height: 96, borderRadius: 30, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  checkingTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  checkingSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  successIconBig: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  foundTitle: { fontSize: 26, fontFamily: "Inter_700Bold" },
  foundName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  foundSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  riderStats: { flexDirection: "row", gap: 10 },
  riderStat: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  riderStatText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  alertCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20 },
  alertTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  alertSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  sectionTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 18, lineHeight: 20 },
  rideCard: { borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  rideBrand: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rideTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  rideName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  rideTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  rideTagText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  rideTagline: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  rideMeta: { flexDirection: "row", gap: 14 },
  rideMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  rideMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  sponsorNote: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  sponsorNoteText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  confirmBtn: { borderRadius: 16, overflow: "hidden" },
  confirmBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  confirmBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  ngoInfo: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 16, marginBottom: 24, overflow: "hidden" },
  ngoInfoIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  ngoInfoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  ngoInfoName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  confirmedBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  confirmedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  choiceCard: { borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 16, overflow: "hidden" },
  choiceIcon: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  choiceTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  choiceTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  choiceTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  choiceTagText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  choiceSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 10, lineHeight: 18 },
  choiceMeta: { flexDirection: "row", gap: 14 },
  choiceMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  choiceMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  rideIconsRow: { flexDirection: "row", gap: 6 },
  rideIconPill: { width: 28, height: 28, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rideIconPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  aiNote: { flexDirection: "row", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "flex-start", marginTop: 4 },
  aiNoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
