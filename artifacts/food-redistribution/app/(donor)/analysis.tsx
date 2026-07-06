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
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CircularProgress({ score, color }: { score: number; color: string }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1800,
      useNativeDriver: false,
    }).start(() => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color + "30"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

function computeAIAnalysis(donation: ReturnType<typeof useApp>["currentDonation"]) {
  const q = donation.questionnaire as Record<string, boolean> | undefined;

  // Genuine noise: last 2 digits of ms → −9 to +9 swing so identical answers still vary
  const noise = ((Date.now() % 100) % 19) - 9;

  // Base score
  let score = 55 + noise;

  // Q1: refrigeration — biggest safety signal
  if (q?.refrigerated === true) score += 16;
  else if (q?.refrigerated === false) score -= 6;

  // Q2: untouched / not partially served
  if (q?.untouched === true) score += 12;
  else if (q?.untouched === false) score -= 4;

  // Q3: vegetarian (lower contamination risk)
  if (q?.vegetarian === true) score += 5;
  else if (q?.vegetarian === false) score -= 1;

  // Q4: can serve 50+ people
  if (q?.servings === true) score += 4;

  // Q5: urgent pickup
  if (q?.urgentPickup === true) score += 3;
  else if (q?.urgentPickup === false) score += 1;

  // Q6: transport (self-deliver = higher care)
  if (q?.transportNeeded === false) score += 4;

  // Prep time
  if (donation.preparedAt?.includes("Just now")) score += 9;
  else if (donation.preparedAt?.includes("30 min")) score += 6;
  else if (donation.preparedAt?.includes("1 hour")) score += 3;
  else if (donation.preparedAt?.includes("2 hour")) score -= 1;
  else if (donation.preparedAt?.includes("3 hour")) score -= 4;

  // Expiry window
  if (donation.expiryEstimate?.includes("2 hours")) score -= 5;
  else if (donation.expiryEstimate?.includes("12 hours") || donation.expiryEstimate?.includes("24 hours")) score += 3;

  score = Math.min(97, Math.max(42, Math.round(score)));

  const urgency = q?.urgentPickup ? "high" : score > 85 ? "medium" : "low";
  const pickupWindow = score > 90 ? 90 : score > 80 ? 120 : score > 70 ? 180 : 240;
  const safeUntil = new Date(Date.now() + pickupWindow * 60 * 1000);
  const safeUntilStr = safeUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return { score, urgency, pickupWindow, safeUntilStr };
}

export default function AnalysisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentDonation, setCurrentDonation } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [analysis, setAnalysis] = useState(() => computeAIAnalysis(currentDonation));
  const fadeIn = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const scoreColor = analysis.score >= 85 ? colors.primary : analysis.score >= 70 ? colors.warning : colors.destructive;

  useFocusEffect(
    useCallback(() => {
      setAccepted(false);
      setAnalysis(computeAIAnalysis(currentDonation));
      fadeIn.setValue(0);
      setTimeout(() => {
        Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }, 400);
    }, [currentDonation])
  );

  const handleAccept = () => {
    setCurrentDonation({ freshnessScore: analysis.score, urgency: analysis.urgency as never });
    setAccepted(true);
    setTimeout(() => router.push("/(donor)/matching"), 500);
  };

  const urgencyColors = { high: "#EF4444", medium: colors.warning, low: colors.primary };
  const urgencyLabels = { high: "High Urgency", medium: "Medium Priority", low: "Low Priority" };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(donor)')}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Food Analysis</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.progressWrap, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: "43%" }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.aiHeader, { backgroundColor: colors.surfaceElevated, borderColor: colors.primary + "44" }]}>
          <View style={[styles.aiIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="cpu" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aiTitle, { color: colors.foreground }]}>AI Freshness Analysis</Text>
            <Text style={[styles.aiSubtitle, { color: colors.mutedForeground }]}>
              Rule-based scoring · Not a medical certification
            </Text>
          </View>
          <View style={[styles.aiBadge, { backgroundColor: colors.primary + "22" }]}>
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>BETA</Text>
          </View>
        </View>

        <Animated.View style={[styles.scoreSection, { opacity: fadeIn }]}>
          <View style={styles.scoreRing}>
            <CircularProgress score={analysis.score} color={scoreColor} />
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
              <View style={styles.scoreCenter}>
                <Text style={[styles.scoreNumber, { color: scoreColor }]}>{analysis.score}%</Text>
                <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Freshness</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.scoreTitle, { color: colors.foreground }]}>
            {analysis.score >= 85 ? "Excellent Condition" : analysis.score >= 70 ? "Good Condition" : "Acceptable Condition"}
          </Text>
          <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>
            Pickup recommended within {analysis.pickupWindow} minutes (before {analysis.safeUntilStr})
          </Text>
        </Animated.View>

        <Animated.View style={[styles.cards, { opacity: fadeIn }]}>
          <View style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: (urgencyColors as Record<string, string>)[analysis.urgency] + "22" }]}>
              <Feather name="alert-circle" size={18} color={(urgencyColors as Record<string, string>)[analysis.urgency]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Urgency Level</Text>
              <Text style={[styles.cardValue, { color: (urgencyColors as Record<string, string>)[analysis.urgency] }]}>
                {(urgencyLabels as Record<string, string>)[analysis.urgency]}
              </Text>
            </View>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="users" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Estimated Servings</Text>
              <Text style={[styles.cardValue, { color: colors.foreground }]}>
                {currentDonation.servingCapacity ?? 20} people
              </Text>
            </View>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#3B82F6" + "22" }]}>
              <Feather name="clock" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>Safe Until</Text>
              <Text style={[styles.cardValue, { color: "#3B82F6" }]}>{analysis.safeUntilStr} today</Text>
            </View>
          </View>

          <View style={[styles.analysisCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#8B5CF6" + "22" }]}>
              <Feather name="zap" size={18} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>AI Recommendation</Text>
              <Text style={[styles.cardValue, { color: "#8B5CF6" }]}>
                {analysis.score >= 85 ? "Prioritize Immediate Pickup" : "Schedule Within Window"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={[styles.disclaimer, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "44" }]}>
          <Feather name="alert-triangle" size={14} color={colors.warning} />
          <Text style={[styles.disclaimerText, { color: colors.mutedForeground }]}>
            This AI score is an assistive recommendation only. Both donor and NGO digitally acknowledge food handling responsibility.
          </Text>
        </View>

        <View style={[styles.ackCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="file-text" size={16} color={colors.foreground} />
          <Text style={[styles.ackText, { color: colors.foreground }]}>
            By continuing, you confirm that this food is safe for consumption and you accept responsibility for its preparation and storage.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleAccept} style={[styles.acceptBtn, { opacity: accepted ? 0.7 : 1 }]}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.acceptBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.acceptBtnText}>Accept & Find NGOs</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  progressWrap: { height: 4 },
  progressBar: { height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 28 },
  aiIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aiTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  aiSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  aiBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  aiBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  scoreSection: { alignItems: "center", marginBottom: 28 },
  scoreRing: { position: "relative", alignItems: "center", justifyContent: "center" },
  scoreCenter: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  scoreNumber: { fontSize: 36, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  scoreTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 6 },
  scoreDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  cards: { gap: 10, marginBottom: 20 },
  analysisCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1, padding: 16 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 3 },
  cardValue: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  disclaimer: { flexDirection: "row", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12, alignItems: "flex-start" },
  disclaimerText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  ackCard: { flexDirection: "row", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "flex-start" },
  ackText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  acceptBtn: { borderRadius: 16, overflow: "hidden" },
  acceptBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  acceptBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});