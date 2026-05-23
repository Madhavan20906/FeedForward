import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { UserRole } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ROLES = [
  {
    id: "individual_donor" as UserRole,
    title: "Individual Donor",
    subtitle: "Household surplus, leftover meals, home-cooked food",
    icon: "home" as const,
    gradient: ["#22C55E", "#16A34A"] as [string, string],
    tag: "Most Popular",
  },
  {
    id: "business_donor" as UserRole,
    title: "Business Donor",
    subtitle: "Restaurants, hotels, caterers, bakeries, supermarkets",
    icon: "briefcase" as const,
    gradient: ["#F97316", "#EA580C"] as [string, string],
    tag: "Enterprise",
  },
  {
    id: "ngo" as UserRole,
    title: "NGO / Shelter",
    subtitle: "Receive food donations, manage distribution to communities",
    icon: "heart" as const,
    gradient: ["#3B82F6", "#2563EB"] as [string, string],
    tag: "Verified",
  },
  {
    id: "sponsor" as UserRole,
    title: "CSR Sponsor",
    subtitle: "Support logistics, gain ESG visibility & impact reports",
    icon: "award" as const,
    gradient: ["#8B5CF6", "#7C3AED"] as [string, string],
    tag: "Premium",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { switchRole } = useApp();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const scaleAnims = useRef(ROLES.map(() => new Animated.Value(1))).current;

  const onPress = (role: UserRole, index: number) => {
    setSelected(role);
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!selected) return;
    await switchRole(selected);
    router.replace("/login");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#22C55E22", "#08080800"]}
        style={[styles.headerGlow, { paddingTop: topPad + 24 }]}
      >
        <View style={styles.logoRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={20} color="#000" />
          </View>
          <Text style={[styles.logoText, { color: colors.foreground }]}>FeedForward</Text>
        </View>
        <Text style={[styles.headline, { color: colors.foreground }]}>
          End food waste.{"\n"}Feed communities.
        </Text>
        <Text style={[styles.subheadline, { color: colors.mutedForeground }]}>
          AI-powered food redistribution & smart logistics platform
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
          SELECT YOUR ROLE
        </Text>

        {ROLES.map((role, index) => {
          const isSelected = selected === role.id;
          return (
            <Animated.View
              key={role.id}
              style={{ transform: [{ scale: scaleAnims[index] }] }}
            >
              <Pressable
                onPress={() => onPress(role.id, index)}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isSelected ? "#111111" : colors.card,
                    borderColor: isSelected ? role.gradient[0] : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                <LinearGradient
                  colors={role.gradient}
                  style={styles.iconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Feather name={role.icon} size={22} color="#fff" />
                </LinearGradient>
                <View style={styles.roleInfo}>
                  <View style={styles.roleTitleRow}>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>
                      {role.title}
                    </Text>
                    <View style={[styles.tag, { backgroundColor: role.gradient[0] + "22" }]}>
                      <Text style={[styles.tagText, { color: role.gradient[0] }]}>
                        {role.tag}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.roleSubtitle, { color: colors.mutedForeground }]}>
                    {role.subtitle}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkmark, { backgroundColor: role.gradient[0] }]}>
                    <Feather name="check" size={14} color="#fff" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.continueBtn,
            { opacity: pressed || !selected ? 0.7 : 1 },
          ]}
        >
          <LinearGradient
            colors={selected ? ["#22C55E", "#16A34A"] : ["#444", "#333"]}
            style={styles.continueBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
            <Feather name="arrow-right" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>

        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>
          Demo prototype — academic engineering project
        </Text>
        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { paddingHorizontal: 24, paddingBottom: 28 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 24 },
  logoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  headline: { fontSize: 32, fontFamily: "Inter_700Bold", lineHeight: 40, marginBottom: 10 },
  subheadline: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 14, marginLeft: 4 },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roleInfo: { flex: 1 },
  roleTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  roleTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  tagText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  roleSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtn: { marginTop: 8, marginBottom: 16, borderRadius: 16, overflow: "hidden" },
  continueBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  continueBtnText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  footerNote: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 8 },
});
