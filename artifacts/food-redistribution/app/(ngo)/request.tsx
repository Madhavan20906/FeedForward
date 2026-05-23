import { useColors } from "@/hooks/useColors";
import { NGO_REQUESTS } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
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
import Svg, { Circle } from "react-native-svg";

export default function RequestReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [accepted, setAccepted] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const req = NGO_REQUESTS.find(r => r.id === id) ?? NGO_REQUESTS[0];
  const score = req.freshnessScore;
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - score / 100);

  if (accepted) {
    return (
      <View style={[styles.container, styles.successView, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#3B82F622", "#2563EB11"]} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.successIcon}>
          <Feather name="check" size={44} color="#fff" />
        </LinearGradient>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Request Accepted!</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
          Assigning volunteer rider to pickup from {req.donorName}
        </Text>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(ngo)')} style={styles.backToRequests}>
          <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.backToRequestsGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.backToRequestsText}>Back to Requests</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(ngo)')}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Review Request</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Donor Info */}
        <View style={[styles.donorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.donorIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name={req.donorType === "Business" ? "briefcase" : "home"} size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.donorName, { color: colors.foreground }]}>{req.donorName}</Text>
            <Text style={[styles.donorType, { color: colors.mutedForeground }]}>{req.donorType} Donor</Text>
          </View>
          <View style={styles.donorStats}>
            <View style={styles.donorStat}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[styles.donorStatText, { color: colors.mutedForeground }]}>{req.distance}</Text>
            </View>
            <View style={styles.donorStat}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={[styles.donorStatText, { color: colors.mutedForeground }]}>{req.eta}</Text>
            </View>
          </View>
        </View>

        {/* Food Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Food Details</Text>
          <Text style={[styles.foodName, { color: colors.foreground }]}>{req.foodName}</Text>
          <Text style={[styles.foodQty, { color: colors.primary }]}>{req.quantity}</Text>
          <View style={styles.foodMeta}>
            {[
              { label: "Prepared", value: req.preparedAt },
              { label: "Expires", value: req.expiryAt },
              { label: "Category", value: req.category.toUpperCase() },
            ].map(item => (
              <View key={item.label} style={[styles.foodMetaChip, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Text style={[styles.foodMetaLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                <Text style={[styles.foodMetaValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* AI Score */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI Freshness Score</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreRing}>
              <Svg width={104} height={104}>
                <Circle cx={52} cy={52} r={radius} stroke={colors.primary + "30"} strokeWidth={8} fill="none" />
                <Circle cx={52} cy={52} r={radius} stroke={colors.primary} strokeWidth={8} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90, 52, 52)" />
              </Svg>
              <View style={StyleSheet.absoluteFillObject}>
                <View style={styles.scoreCenter}>
                  <Text style={[styles.scoreNum, { color: colors.primary }]}>{score}%</Text>
                </View>
              </View>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={[styles.scoreLabel, { color: colors.foreground }]}>
                {score >= 85 ? "Excellent" : score >= 70 ? "Good" : "Acceptable"}
              </Text>
              <Text style={[styles.scoreDesc, { color: colors.mutedForeground }]}>
                Safe for distribution within {req.eta}
              </Text>
              <View style={[styles.urgencyPill, { backgroundColor: "#EF4444" + "22" }]}>
                <View style={[styles.urgencyDot, { backgroundColor: "#EF4444" }]} />
                <Text style={[styles.urgencyLabel, { color: "#EF4444" }]}>{req.urgency.toUpperCase()} PRIORITY</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Questionnaire Summary */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Donor Verification</Text>
          {[
            { label: "Refrigerated/Stored properly", value: req.questionnaire.refrigerated },
            { label: "Untouched / Not partially served", value: req.questionnaire.untouched },
            { label: "Vegetarian food", value: req.questionnaire.vegetarian },
            { label: "Urgent pickup needed", value: req.questionnaire.urgentPickup },
            { label: "Transport assistance needed", value: req.questionnaire.transportNeeded },
          ].map(item => (
            <View key={item.label} style={[styles.qItem, { borderBottomColor: colors.border }]}>
              <Text style={[styles.qLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <View style={[styles.qAnswer, { backgroundColor: item.value ? colors.primary + "22" : colors.destructive + "22" }]}>
                <Feather name={item.value ? "check" : "x"} size={14} color={item.value ? colors.primary : colors.destructive} />
                <Text style={[styles.qAnswerText, { color: item.value ? colors.primary : colors.destructive }]}>
                  {item.value ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={[styles.declineBtn, { borderColor: colors.destructive + "44" }]}>
          <Feather name="x" size={18} color={colors.destructive} />
          <Text style={[styles.declineBtnText, { color: colors.destructive }]}>Decline</Text>
        </Pressable>
        <Pressable onPress={() => setAccepted(true)} style={styles.acceptBtn}>
          <LinearGradient colors={["#3B82F6", "#2563EB"]} style={styles.acceptBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={styles.acceptBtnText}>Accept Donation</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  successView: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  successIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  successSub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  backToRequests: { width: "100%", borderRadius: 16, overflow: "hidden", marginTop: 8 },
  backToRequestsGrad: { alignItems: "center", paddingVertical: 18 },
  backToRequestsText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  donorCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  donorIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  donorName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  donorType: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  donorStats: { gap: 4, alignItems: "flex-end" },
  donorStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  donorStatText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  section: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  foodName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  foodQty: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  foodMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  foodMetaChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  foodMetaLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginBottom: 2 },
  foodMetaValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  scoreRing: { position: "relative", alignItems: "center", justifyContent: "center" },
  scoreCenter: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  scoreNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  scoreLabel: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scoreDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  urgencyPill: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start" },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyLabel: { fontSize: 10, fontFamily: "Inter_700Bold" },
  qItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1 },
  qLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  qAnswer: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  qAnswerText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  bottomBar: { flexDirection: "row", gap: 12, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  declineBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 16 },
  declineBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  acceptBtn: { flex: 2, borderRadius: 14, overflow: "hidden" },
  acceptBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  acceptBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
