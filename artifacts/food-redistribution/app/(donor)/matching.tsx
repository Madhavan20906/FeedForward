import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { generateNearbyNGOs, type NearbyNGO } from "@/utils/generateNGOs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGrad,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
type Phase = "locating" | "searching" | "notifying" | "accepted" | "exhausted";
const NOTIFY_TIMEOUT_MS = 15000;
const MAP_H = 220;
const MAP_W = width - 40;

function latLngToXY(
  userLat: number, userLng: number,
  ngoLat: number, ngoLng: number,
  mapW: number, mapH: number
) {
  const latDiff = ngoLat - userLat;
  const lngDiff = ngoLng - userLng;
  const scale = 0.075;
  const x = mapW / 2 + (lngDiff / scale) * (mapW / 2 - 24);
  const y = mapH / 2 - (latDiff / scale) * (mapH / 2 - 24);
  return {
    x: Math.max(18, Math.min(mapW - 18, x)),
    y: Math.max(18, Math.min(mapH - 18, y)),
  };
}

function NGOMapView({
  userLat, userLng, ngos, currentIdx, declinedIds, accepted,
}: {
  userLat: number; userLng: number;
  ngos: NearbyNGO[]; currentIdx: number; declinedIds: string[]; accepted: boolean;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const userXY = { x: MAP_W / 2, y: MAP_H / 2 };
  const ngoXYs = ngos.map(ngo => latLngToXY(userLat, userLng, ngo.location.lat, ngo.location.lng, MAP_W, MAP_H));

  return (
    <View style={[styles.mapWrap, { backgroundColor: "#070D1A" }]}>
      <Svg width={MAP_W} height={MAP_H} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGrad id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0D1829" />
            <Stop offset="1" stopColor="#050A12" />
          </SvgGrad>
        </Defs>
        <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#bg)" />

        {/* Grid */}
        {[1, 2, 3].map(i => (
          <React.Fragment key={`g${i}`}>
            <Line x1={0} y1={i * (MAP_H / 4)} x2={MAP_W} y2={i * (MAP_H / 4)} stroke="#152035" strokeWidth={1} />
            <Line x1={i * (MAP_W / 4)} y1={0} x2={i * (MAP_W / 4)} y2={MAP_H} stroke="#152035" strokeWidth={1} />
          </React.Fragment>
        ))}

        {/* Lines from user to NGOs */}
        {ngoXYs.map((xy, i) => {
          const ngo = ngos[i];
          const isActive = i === currentIdx && !accepted;
          const isDeclined = declinedIds.includes(ngo.id);
          const lineColor = isActive ? "#22C55E" : isDeclined ? "#EF444455" : "#1E3A5F44";
          return (
            <Line
              key={`line_${ngo.id}`}
              x1={userXY.x} y1={userXY.y}
              x2={xy.x} y2={xy.y}
              stroke={lineColor}
              strokeWidth={isActive ? 1.5 : 0.8}
              strokeDasharray={isDeclined ? "4,4" : undefined}
            />
          );
        })}

        {/* NGO dots */}
        {ngoXYs.map((xy, i) => {
          const ngo = ngos[i];
          const isActive = i === currentIdx && !accepted;
          const isDeclined = declinedIds.includes(ngo.id);
          const isAccepted = accepted && i === currentIdx;
          const dotColor = isAccepted ? "#22C55E" : isActive ? "#F97316" : isDeclined ? "#EF4444" : "#3B82F6";

          return (
            <React.Fragment key={`dot_${ngo.id}`}>
              <Circle cx={xy.x} cy={xy.y} r={isActive ? 14 : 10} fill={dotColor} fillOpacity={0.15} />
              <Circle cx={xy.x} cy={xy.y} r={isActive || isAccepted ? 8 : 5} fill={dotColor} />
              <SvgText
                x={xy.x}
                y={xy.y + 18}
                textAnchor="middle"
                fill={dotColor}
                fontSize={8}
                fontWeight="bold"
              >
                {isDeclined ? "✗" : isAccepted ? "✓" : `${i + 1}`}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* User location dot */}
        <Circle cx={userXY.x} cy={userXY.y} r={20} fill="#22C55E" fillOpacity={0.1} />
        <Circle cx={userXY.x} cy={userXY.y} r={13} fill="#22C55E" fillOpacity={0.2} />
        <Circle cx={userXY.x} cy={userXY.y} r={7} fill="#22C55E" />
        <Circle cx={userXY.x} cy={userXY.y} r={3} fill="#ffffff" />
        <SvgText x={userXY.x} y={userXY.y - 16} textAnchor="middle" fill="#22C55E" fontSize={9} fontWeight="bold">YOU</SvgText>
      </Svg>

      {/* Animated pulse ring for active NGO */}
      {!accepted && currentIdx < ngoXYs.length && (() => {
        const xy = ngoXYs[currentIdx];
        return (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                left: xy.x - 22,
                top: xy.y - 22,
                borderColor: "#F97316",
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.8, 0] }),
              },
            ]}
          />
        );
      })()}

      {/* Map legend */}
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
          <Text style={styles.legendText}>Notifying</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
          <Text style={styles.legendText}>Accepted</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />
          <Text style={styles.legendText}>Declined</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#3B82F6" }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
      </View>
    </View>
  );
}

export default function MatchingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setCurrentDonation } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [phase, setPhase] = useState<Phase>("locating");
  const [ngos, setNgos] = useState<NearbyNGO[]>([]);
  const [userCoords, setUserCoords] = useState({ lat: 13.0478, lng: 80.2089 });
  const [currentNGOIndex, setCurrentNGOIndex] = useState(0);
  const [acceptedNGO, setAcceptedNGO] = useState<NearbyNGO | null>(null);
  const [declinedIds, setDeclinedIds] = useState<string[]>([]);
  const [countdown, setCountdown] = useState(NOTIFY_TIMEOUT_MS / 1000);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const acceptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useFocusEffect(
    useCallback(() => {
      getLocationAndGenerateNGOs();
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
      };
    }, [])
  );

  const getLocationAndGenerateNGOs = async () => {
    setPhase("locating");
    setNgos([]);
    setDeclinedIds([]);
    setCurrentNGOIndex(0);
    setAcceptedNGO(null);

    let lat = 13.0478, lng = 80.2089;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
    } catch {}

    setUserCoords({ lat, lng });
    const nearby = generateNearbyNGOs(lat, lng);
    setNgos(nearby);
    setPhase("searching");

    setTimeout(() => {
      setPhase("notifying");
      startNotifyingNGO(0, nearby);
    }, 2000);
  };

  const startNotifyingNGO = (index: number, ngoList: NearbyNGO[]) => {
    if (index >= ngoList.length) {
      setPhase("exhausted");
      return;
    }

    setCurrentNGOIndex(index);
    setCountdown(NOTIFY_TIMEOUT_MS / 1000);

    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: NOTIFY_TIMEOUT_MS,
      useNativeDriver: false,
    }).start();

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    // Each NGO has ~45% chance of accepting, with a random delay spread across
    // most of the 15s window so it's genuinely unpredictable which NGO ends up
    // picking the donation (not always the first/nearest).
    const willAccept = Math.random() < 0.45;
    const acceptDelay = 3000 + Math.random() * 10000; // 3–13 s

    if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    if (willAccept) {
      acceptTimerRef.current = setTimeout(() => {
        handleNGOAccept(ngoList[index]);
      }, acceptDelay);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
      setDeclinedIds(prev => [...prev, ngoList[index].id]);
      startNotifyingNGO(index + 1, ngoList);
    }, NOTIFY_TIMEOUT_MS);
  };

  const handleNGOAccept = (ngo: NearbyNGO) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setAcceptedNGO(ngo);
    setPhase("accepted");
    setCurrentDonation({
      selectedNGOId: ngo.id,
      selectedNGOLat: ngo.location.lat,
      selectedNGOLng: ngo.location.lng,
      selectedNGOName: ngo.name,
    } as never);
    setTimeout(() => router.push("/(donor)/delivery"), 2200);
  };

  if (phase === "accepted" && acceptedNGO) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#22C55E22", "#16A34A11"]} style={StyleSheet.absoluteFillObject} />
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.bigIcon}>
            <Feather name="check" size={44} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <Text style={[styles.acceptedTitle, { color: colors.foreground }]}>NGO Confirmed!</Text>
        <Text style={[styles.acceptedNGO, { color: colors.primary }]}>{acceptedNGO.name}</Text>
        <Text style={[styles.acceptedSub, { color: colors.mutedForeground }]}>accepted your donation request</Text>
        <View style={styles.etaRow}>
          <View style={[styles.etaChip, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="clock" size={14} color={colors.primary} />
            <Text style={[styles.etaText, { color: colors.primary }]}>{acceptedNGO.responseTime}</Text>
          </View>
          <View style={[styles.etaChip, { backgroundColor: "#3B82F622" }]}>
            <Feather name="map-pin" size={14} color="#3B82F6" />
            <Text style={[styles.etaText, { color: "#3B82F6" }]}>{acceptedNGO.distanceStr} away</Text>
          </View>
        </View>
        <Text style={[styles.redirectText, { color: colors.mutedForeground }]}>Setting up delivery options...</Text>
      </View>
    );
  }

  const currentNGO = ngos[currentNGOIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(donor)")} hitSlop={10}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>NGO Matching</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.progressWrap, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: "57%" }]} />
      </View>

      {(phase === "locating" || phase === "searching") && (
        <View style={[styles.container, styles.center]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.searchingIcon}>
              <Feather name={phase === "locating" ? "navigation" : "radio"} size={32} color="#fff" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.searchingTitle, { color: colors.foreground }]}>
            {phase === "locating" ? "Getting Your Location..." : "Finding Nearby NGOs..."}
          </Text>
          <Text style={[styles.searchingSub, { color: colors.mutedForeground }]}>
            {phase === "locating"
              ? "Please allow location access for accurate matching"
              : "Scanning 10 nearest NGOs within radius..."}
          </Text>
        </View>
      )}

      {phase === "notifying" && currentNGO && (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Live Map */}
          <NGOMapView
            userLat={userCoords.lat}
            userLng={userCoords.lng}
            ngos={ngos}
            currentIdx={currentNGOIndex}
            declinedIds={declinedIds}
            accepted={false}
          />

          {/* Current notification card */}
          <View style={[styles.notifyCard, { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 }]}>
            <LinearGradient colors={["#22C55E18", "#16A34A08"]} style={StyleSheet.absoluteFillObject} />
            <View style={styles.notifyHeader}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={[styles.notifyIcon, { backgroundColor: "#F97316" }]}>
                  <Feather name="bell" size={20} color="#fff" />
                </View>
              </Animated.View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifyLabel, { color: colors.mutedForeground }]}>
                  Notifying NGO {currentNGOIndex + 1} of {ngos.length} · nearest first
                </Text>
                <Text style={[styles.notifyName, { color: colors.foreground }]}>{currentNGO.name}</Text>
              </View>
              <View style={[styles.countdownCircle, { borderColor: "#F97316" }]}>
                <Text style={[styles.countdownNum, { color: "#F97316" }]}>{countdown}s</Text>
              </View>
            </View>
            <View style={[styles.timerBar, { backgroundColor: colors.border }]}>
              <Animated.View style={[styles.timerProgress, {
                backgroundColor: "#F97316",
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["100%", "0%"] }),
              }]} />
            </View>
            <View style={styles.notifyMeta}>
              <View style={styles.notifyMetaItem}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.notifyMetaText, { color: colors.mutedForeground }]}>{currentNGO.distanceStr}</Text>
              </View>
              <View style={styles.notifyMetaItem}>
                <Feather name="star" size={12} color={colors.warning} />
                <Text style={[styles.notifyMetaText, { color: colors.mutedForeground }]}>{currentNGO.rating}</Text>
              </View>
              <View style={styles.notifyMetaItem}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.notifyMetaText, { color: colors.mutedForeground }]}>{currentNGO.responseTime}</Text>
              </View>
            </View>
            <Text style={[styles.waitingText, { color: colors.mutedForeground }]}>
              Waiting for response... auto-advances if no reply
            </Text>
          </View>

          {/* NGO Queue */}
          <Text style={[styles.queueTitle, { color: colors.foreground }]}>
            {ngos.length} NGOs Found — Sorted by Distance
          </Text>

          {ngos.map((ngo, index) => {
            const isActive = index === currentNGOIndex;
            const isDeclined = declinedIds.includes(ngo.id);
            const isPending = index > currentNGOIndex;
            return (
              <View
                key={ngo.id}
                style={[
                  styles.ngoRow,
                  {
                    backgroundColor: isActive ? colors.card : colors.surfaceElevated,
                    borderColor: isActive ? "#F97316" : isDeclined ? colors.destructive + "33" : colors.border,
                    borderWidth: isActive ? 1.5 : 1,
                    opacity: isDeclined ? 0.5 : 1,
                  },
                ]}
              >
                <View style={[styles.ngoRowNum, {
                  backgroundColor: isActive ? "#F97316" : isDeclined ? colors.destructive + "33" : colors.muted,
                }]}>
                  {isDeclined ? (
                    <Feather name="x" size={12} color={colors.destructive} />
                  ) : isActive ? (
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <Feather name="radio" size={12} color="#fff" />
                    </Animated.View>
                  ) : (
                    <Text style={[styles.ngoRowNumText, { color: isPending ? colors.mutedForeground : "#fff" }]}>{index + 1}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ngoRowName, { color: isDeclined ? colors.mutedForeground : colors.foreground }]}>{ngo.name}</Text>
                  <Text style={[styles.ngoRowMeta, { color: colors.mutedForeground }]}>{ngo.distanceStr} · {ngo.speciality}</Text>
                </View>
                {isDeclined ? (
                  <View style={[styles.statusPill, { backgroundColor: colors.destructive + "22" }]}>
                    <Text style={[styles.statusPillText, { color: colors.destructive }]}>No Response</Text>
                  </View>
                ) : isActive ? (
                  <View style={[styles.statusPill, { backgroundColor: "#F9731622" }]}>
                    <Text style={[styles.statusPillText, { color: "#F97316" }]}>Notifying...</Text>
                  </View>
                ) : isPending ? (
                  <Pressable
                    onPress={() => handleNGOAccept(ngo)}
                    style={[styles.skipBtn, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>Select</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}

      {phase === "exhausted" && (
        <View style={[styles.container, styles.center, { paddingHorizontal: 32 }]}>
          <Feather name="alert-circle" size={48} color={colors.warning} />
          <Text style={[styles.exhaustedTitle, { color: colors.foreground }]}>No NGOs Responded</Text>
          <Text style={[styles.exhaustedSub, { color: colors.mutedForeground }]}>
            All nearby NGOs are currently at capacity. Try again in a few minutes.
          </Text>
          <Pressable onPress={getLocationAndGenerateNGOs} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Feather name="refresh-cw" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Retry Search</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  navHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  progressWrap: { height: 4 },
  progressBar: { height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  mapWrap: { borderRadius: 18, overflow: "hidden", height: MAP_H, width: MAP_W, marginBottom: 16, position: "relative" },
  pulseRing: { position: "absolute", width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  mapLegend: { position: "absolute", bottom: 8, left: 8, flexDirection: "row", gap: 8, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 8, padding: 6 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { fontSize: 8, fontFamily: "Inter_500Medium", color: "#aaa" },
  searchingIcon: { width: 88, height: 88, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  searchingTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  searchingSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, paddingHorizontal: 32 },
  notifyCard: { borderRadius: 18, padding: 16, marginBottom: 20, overflow: "hidden" },
  notifyHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  notifyIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  notifyLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  notifyName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  countdownCircle: { width: 46, height: 46, borderRadius: 23, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  countdownNum: { fontSize: 16, fontFamily: "Inter_700Bold" },
  timerBar: { height: 6, borderRadius: 3, marginBottom: 12, overflow: "hidden" },
  timerProgress: { height: 6, borderRadius: 3 },
  notifyMeta: { flexDirection: "row", gap: 16, marginBottom: 10 },
  notifyMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  notifyMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  waitingText: { fontSize: 12, fontFamily: "Inter_400Regular", fontStyle: "italic" },
  queueTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12 },
  ngoRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  ngoRowNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  ngoRowNumText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  ngoRowName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  ngoRowMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  skipBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  skipBtnText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bigIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  acceptedTitle: { fontSize: 28, fontFamily: "Inter_700Bold" },
  acceptedNGO: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  acceptedSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  etaRow: { flexDirection: "row", gap: 12 },
  etaChip: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  etaText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  redirectText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  exhaustedTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  exhaustedSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 },
  retryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
