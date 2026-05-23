import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
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
import { useColors } from "@/hooks/useColors";
import type { NearbyNGO } from "@/utils/generateNGOs";

const { width } = Dimensions.get("window");
const MAP_H = 220;
const PAD = 16;
const SCALE = 1400;

interface NGOMapProps {
  userCoords: { latitude: number; longitude: number };
  ngos: NearbyNGO[];
}

const NGO_COLORS = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F97316", "#EAB308", "#14B8A6", "#06B6D4"];

export default function NGOMap({ userCoords, ngos }: NGOMapProps) {
  const colors = useColors();
  const W = width - PAD * 2;
  const cx = W / 2;
  const cy = MAP_H / 2;
  const pulseAnims = useRef(ngos.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    pulseAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, { toValue: 1.4, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const toSvg = (lat: number, lng: number) => {
    const dx = (lng - userCoords.longitude) * SCALE;
    const dy = -(lat - userCoords.latitude) * SCALE;
    return { x: cx + dx, y: cy + dy };
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0A1020" }]}>
      <Svg width={W} height={MAP_H} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGrad id="ngoBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F172A" />
            <Stop offset="1" stopColor="#07101F" />
          </SvgGrad>
        </Defs>
        <Rect x={0} y={0} width={W} height={MAP_H} fill="url(#ngoBg)" />

        {/* Grid */}
        {[1, 2, 3, 4].map(i => (
          <Line key={`h${i}`} x1={0} y1={i * (MAP_H / 5)} x2={W} y2={i * (MAP_H / 5)} stroke="#1E2D45" strokeWidth={1} />
        ))}
        {[1, 2, 3, 4, 5].map(i => (
          <Line key={`v${i}`} x1={i * (W / 6)} y1={0} x2={i * (W / 6)} y2={MAP_H} stroke="#1E2D45" strokeWidth={1} />
        ))}

        {/* Roads */}
        <Path d={`M 0 ${MAP_H * 0.55} Q ${W * 0.5} ${MAP_H * 0.48} ${W} ${MAP_H * 0.4}`}
          stroke="#1A3050" strokeWidth={9} fill="none" />
        <Path d={`M ${W * 0.32} 0 L ${W * 0.34} ${MAP_H}`} stroke="#1A3050" strokeWidth={6} fill="none" />
        <Path d={`M ${W * 0.66} 0 L ${W * 0.68} ${MAP_H}`} stroke="#1A3050" strokeWidth={6} fill="none" />
        <Path d={`M 0 ${MAP_H * 0.28} L ${W} ${MAP_H * 0.3}`} stroke="#1A3050" strokeWidth={4} fill="none" />

        {/* Range circle */}
        <Circle cx={cx} cy={cy} r={Math.min(cx, cy) * 0.85} stroke="#22C55E" strokeWidth={1}
          fill="none" strokeDasharray="6,8" strokeOpacity={0.2} />
        <Circle cx={cx} cy={cy} r={Math.min(cx, cy) * 0.5} stroke="#3B82F6" strokeWidth={0.8}
          fill="none" strokeDasharray="4,8" strokeOpacity={0.15} />

        {/* Lines from user to each NGO */}
        {ngos.slice(0, 8).map((ngo, i) => {
          const { x, y } = toSvg(ngo.location.lat, ngo.location.lng);
          const clampedX = Math.max(24, Math.min(W - 24, x));
          const clampedY = Math.max(24, Math.min(MAP_H - 24, y));
          return (
            <Line key={`line_${i}`} x1={cx} y1={cy} x2={clampedX} y2={clampedY}
              stroke={NGO_COLORS[i % NGO_COLORS.length]} strokeWidth={0.8}
              strokeDasharray="4,6" strokeOpacity={0.35} />
          );
        })}

        {/* NGO markers */}
        {ngos.slice(0, 8).map((ngo, i) => {
          const { x, y } = toSvg(ngo.location.lat, ngo.location.lng);
          const clampedX = Math.max(28, Math.min(W - 28, x));
          const clampedY = Math.max(28, Math.min(MAP_H - 28, y));
          const col = NGO_COLORS[i % NGO_COLORS.length];
          const shortName = ngo.name.split(" ").slice(0, 2).join(" ");
          return (
            <React.Fragment key={ngo.id}>
              <Circle cx={clampedX} cy={clampedY} r={18} fill={col} fillOpacity={0.15} />
              <Circle cx={clampedX} cy={clampedY} r={11} fill={col} />
              <Circle cx={clampedX} cy={clampedY} r={5} fill="#ffffff" />
              <Rect x={clampedX - 28} y={clampedY + 14} width={56} height={14} rx={4} fill={col} fillOpacity={0.85} />
              <SvgText x={clampedX} y={clampedY + 24} textAnchor="middle"
                fill="#fff" fontSize={7} fontWeight="bold">{shortName}</SvgText>
            </React.Fragment>
          );
        })}

        {/* User position */}
        <Circle cx={cx} cy={cy} r={26} fill="#22C55E" fillOpacity={0.12} />
        <Circle cx={cx} cy={cy} r={18} fill="#22C55E" fillOpacity={0.2} />
        <Circle cx={cx} cy={cy} r={12} fill="#22C55E" />
        <Circle cx={cx} cy={cy} r={5.5} fill="#fff" />
        <Rect x={cx - 14} y={cy + 14} width={28} height={13} rx={4} fill="#22C55E" />
        <SvgText x={cx} y={cy + 24} textAnchor="middle" fill="#000" fontSize={8} fontWeight="bold">YOU</SvgText>
      </Svg>

      {/* Live badge */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>

      {/* NGO count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{Math.min(ngos.length, 8)} NGOs nearby</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
    height: MAP_H,
    position: "relative",
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#EF444466",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#EF4444",
    letterSpacing: 1.5,
  },
  countBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(59,130,246,0.85)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  countText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
