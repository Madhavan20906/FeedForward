import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { getRouteWaypoints } from "@/utils/generateNGOs";
import LiveMap from "@/components/LiveMap";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
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

const STATUSES = [
  "Rider Assigned",
  "Rider En Route to Pickup",
  "Rider Arrived at Pickup",
  "Food Collected",
  "In Transit to NGO",
  "Almost at NGO",
  "Delivered",
];
const ETAS = ["22 min", "18 min", "14 min", "11 min", "8 min", "4 min", "Arrived!"];

export default function TrackingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentDonation } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [stepIndex, setStepIndex] = useState(0);
  const [userCoords, setUserCoords] = useState({ latitude: 13.0478, longitude: 80.2089 });
  const [ngoCoords, setNgoCoords] = useState({ latitude: 13.0628, longitude: 80.2219 });
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([]);
  const [riderCoords, setRiderCoords] = useState({ latitude: 13.0478, longitude: 80.2089 });
  const [riderRouteIndex, setRiderRouteIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const isDelivered = stepIndex >= STATUSES.length - 1;

  // Refs for cleanup
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMounted = useRef(true);

  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      setStepIndex(0);
      setRoute([]);
      setRiderRouteIndex(0);
      progressAnim.setValue(0);
      setUserCoords({ latitude: 13.0478, longitude: 80.2089 });
      setNgoCoords({ latitude: 13.0628, longitude: 80.2219 });
      setRiderCoords({ latitude: 13.0478, longitude: 80.2089 });

      initMap();

      return () => {
        isMounted.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        progressAnim.stopAnimation();
      };
    }, [])
  );

  const initMap = async () => {
    let lat = 13.0478, lng = 80.2089;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
    } catch {}

    if (!isMounted.current) return;

    const cd = currentDonation as Record<string, unknown>;
    const ngoLat = (cd.selectedNGOLat as number | undefined) ?? lat + 0.016;
    const ngoLng = (cd.selectedNGOLng as number | undefined) ?? lng + 0.014;

    const donor = { latitude: lat, longitude: lng };
    const ngo = { latitude: ngoLat, longitude: ngoLng };
    const waypoints = getRouteWaypoints(lat, lng, ngoLat, ngoLng, 20);

    setUserCoords(donor);
    setNgoCoords(ngo);
    setRoute(waypoints);
    setRiderCoords(donor);
    startTracking(waypoints);
  };

  const startTracking = (waypoints: { latitude: number; longitude: number }[]) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const totalSteps = STATUSES.length - 1;
    let step = 0;
    intervalRef.current = setInterval(() => {
      if (!isMounted.current) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        return;
      }
      step++;
      setStepIndex(step);
      const wpIdx = Math.round((step / totalSteps) * (waypoints.length - 1));
      const wp = waypoints[Math.min(wpIdx, waypoints.length - 1)];
      setRiderCoords(wp);
      setRiderRouteIndex(wpIdx);

      Animated.timing(progressAnim, {
        toValue: step / totalSteps,
        duration: 2000,
        useNativeDriver: false,
      }).start();

      if (step >= totalSteps) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }, 4000);
  };

  const progressPercent = Math.round((stepIndex / (STATUSES.length - 1)) * 100);
  const cd = currentDonation as Record<string, unknown>;
  const ngoName = (cd.selectedNGOName as string | undefined) ?? "Akshaya Patra Foundation";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(donor)')}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.liveDotIndicator, { backgroundColor: isDelivered ? colors.primary : "#EF4444" }]} />
          <Text style={[styles.navTitle, { color: colors.foreground }]}>
            {isDelivered ? "Delivered!" : "Live Tracking"}
          </Text>
        </View>
        <Pressable style={[styles.shareBtn, { backgroundColor: colors.surfaceElevated }]}>
          <Feather name="share-2" size={18} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.mapWrap}>
          <LiveMap
            progress={progressAnim}
            userCoords={userCoords}
            ngoCoords={ngoCoords}
            riderCoords={riderCoords}
            route={route}
            riderRouteIndex={riderRouteIndex}
            userLabel="You"
            ngoLabel="NGO"
          />
        </View>

        <View style={styles.body}>
          <View style={[styles.statusCard, {
            backgroundColor: isDelivered ? colors.primary : colors.card,
            borderColor: isDelivered ? colors.primary : colors.border,
          }]}>
            <View>
              <Text style={[styles.statusText, { color: isDelivered ? "#fff" : colors.foreground }]}>
                {STATUSES[stepIndex]}
              </Text>
              <Text style={[styles.etaText, { color: isDelivered ? "rgba(255,255,255,0.8)" : colors.mutedForeground }]}>
                {ETAS[stepIndex] === "Arrived!" ? "🎉 Successfully delivered!" : `ETA: ${ETAS[stepIndex]}`}
              </Text>
            </View>
            <Text style={[styles.progressPct, { color: isDelivered ? "#fff" : colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>

          <View style={[styles.trackBar, { backgroundColor: colors.border }]}>
            <Animated.View style={[styles.trackProgress, {
              backgroundColor: colors.primary,
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            }]} />
          </View>

          <View style={[styles.riderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.riderAvatar, { backgroundColor: "#F97316" + "22" }]}>
              <Text style={{ fontSize: 22 }}>🏍️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.riderName, { color: colors.foreground }]}>Ravi Kumar</Text>
              <View style={styles.riderMeta}>
                <Feather name="star" size={12} color={colors.warning} />
                <Text style={[styles.riderRating, { color: colors.mutedForeground }]}>4.9 · NGO Volunteer Rider</Text>
              </View>
            </View>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary + "22" }]}>
              <Feather name="phone" size={18} color={colors.primary} />
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated }]}>
              <Feather name="message-circle" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          <View style={[styles.destCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.destIcon, { backgroundColor: "#3B82F622" }]}>
              <Feather name="map-pin" size={18} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.destLabel, { color: colors.mutedForeground }]}>Delivering to</Text>
              <Text style={[styles.destName, { color: colors.foreground }]}>{ngoName}</Text>
            </View>
          </View>

          <Text style={[styles.timelineTitle, { color: colors.foreground }]}>Journey Timeline</Text>
          <View style={styles.timeline}>
            {STATUSES.map((s, i) => {
              const done = i <= stepIndex;
              const active = i === stepIndex;
              return (
                <View key={i} style={styles.timelineRow}>
                  <View style={styles.tlDotCol}>
                    <View style={[
                      styles.tlDot,
                      {
                        backgroundColor: done ? colors.primary : colors.surfaceElevated,
                        borderColor: active ? colors.primary : "transparent",
                        borderWidth: active ? 3 : 0,
                      },
                    ]}>
                      {done && !active && <Feather name="check" size={10} color="#fff" />}
                    </View>
                    {i < STATUSES.length - 1 && (
                      <View style={[styles.tlLine, { backgroundColor: done ? colors.primary : colors.border }]} />
                    )}
                  </View>
                  <Text style={[
                    styles.tlLabel,
                    {
                      color: done ? colors.foreground : colors.mutedForeground,
                      fontFamily: active ? "Inter_700Bold" : "Inter_400Regular",
                      marginBottom: i < STATUSES.length - 1 ? 20 : 0,
                    },
                  ]}>
                    {s}{active ? <Text style={{ color: colors.primary }}> ← now</Text> : null}
                  </Text>
                </View>
              );
            })}
          </View>

          {isDelivered && (
            <Pressable onPress={() => router.push("/(donor)/success")} style={styles.impactBtn}>
              <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.impactBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Feather name="award" size={20} color="#fff" />
                <Text style={styles.impactBtnText}>View Impact Report</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveDotIndicator: { width: 8, height: 8, borderRadius: 4 },
  navTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  shareBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  mapWrap: { margin: 16, borderRadius: 20, overflow: "hidden" },
  body: { paddingHorizontal: 20 },
  statusCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 12 },
  statusText: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 3 },
  etaText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  progressPct: { fontSize: 28, fontFamily: "Inter_700Bold" },
  trackBar: { height: 6, borderRadius: 3, marginBottom: 16 },
  trackProgress: { height: 6, borderRadius: 3 },
  riderCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  riderAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  riderName: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  riderMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  riderRating: { fontSize: 13, fontFamily: "Inter_400Regular" },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  destCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  destIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  destLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  destName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  timelineTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 14 },
  timeline: { marginBottom: 24 },
  timelineRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tlDotCol: { alignItems: "center" },
  tlDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tlLine: { width: 2, height: 20, marginTop: 2 },
  tlLabel: { fontSize: 15, paddingTop: 3 },
  impactBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 8 },
  impactBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  impactBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});