import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGrad,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

interface LiveMapProps {
  progress: Animated.Value;
  userLabel?: string;
  ngoLabel?: string;
}

const MAP_H = 270;
const PAD = 16;

export default function LiveMap({ progress, userLabel = "You", ngoLabel = "NGO" }: LiveMapProps) {
  const colors = useColors();
  const W = width - PAD * 2;

  // Donor: bottom-left, NGO: top-right
  const fromX = 64, fromY = MAP_H - 58;
  const toX = W - 64, toY = 58;
  // Bezier control point for curved road
  const cpX = W * 0.52, cpY = MAP_H * 0.38;

  // Animated rider position along bezier curve
  const riderX = useRef(new Animated.Value(fromX)).current;
  const riderY = useRef(new Animated.Value(fromY)).current;
  const riderRotate = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const trailOpacity = useRef(new Animated.Value(0)).current;

  // Compute bezier position at t
  const bezier = (t: number) => {
    const mt = 1 - t;
    const x = mt * mt * fromX + 2 * mt * t * cpX + t * t * toX;
    const y = mt * mt * fromY + 2 * mt * t * cpY + t * t * toY;
    return { x, y };
  };

  useEffect(() => {
    // Listen to progress and update rider position
    const listener = progress.addListener(({ value }) => {
      const t = Math.max(0, Math.min(1, value));
      const pos = bezier(t);
      riderX.setValue(pos.x);
      riderY.setValue(pos.y);

      // Compute angle from derivative of bezier
      const dt = 0.01;
      const t2 = Math.min(1, t + dt);
      const pos2 = bezier(t2);
      const dx = pos2.x - pos.x;
      const dy = pos2.y - pos.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      riderRotate.setValue(angle - 90);

      // Show trail after movement begins
      if (t > 0.05) trailOpacity.setValue(Math.min(1, t * 3));
    });

    // Pulse animation for rider dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.3, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    return () => progress.removeListener(listener);
  }, []);

  return (
    <View style={[styles.mapContainer, { backgroundColor: "#0A1020" }]}>
      {/* SVG static layer */}
      <Svg width={W} height={MAP_H} style={StyleSheet.absoluteFillObject}>
        <Defs>
          <SvgGrad id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F172A" />
            <Stop offset="1" stopColor="#070B14" />
          </SvgGrad>
          <SvgGrad id="route" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#22C55E" stopOpacity="1" />
            <Stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
          </SvgGrad>
          <SvgGrad id="glow" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#22C55E" stopOpacity="0.5" />
            <Stop offset="1" stopColor="#22C55E" stopOpacity="0" />
          </SvgGrad>
        </Defs>

        {/* Background */}
        <Rect x={0} y={0} width={W} height={MAP_H} fill="url(#bg)" />

        {/* City grid lines */}
        {[1, 2, 3, 4].map(i => (
          <Line key={`h${i}`} x1={0} y1={i * (MAP_H / 5)} x2={W} y2={i * (MAP_H / 5)}
            stroke="#1E2D45" strokeWidth={1} />
        ))}
        {[1, 2, 3, 4, 5].map(i => (
          <Line key={`v${i}`} x1={i * (W / 6)} y1={0} x2={i * (W / 6)} y2={MAP_H}
            stroke="#1E2D45" strokeWidth={1} />
        ))}

        {/* Simulated roads */}
        <Path d={`M 0 ${MAP_H * 0.55} Q ${W * 0.5} ${MAP_H * 0.48} ${W} ${MAP_H * 0.4}`}
          stroke="#1A3050" strokeWidth={10} fill="none" />
        <Path d={`M ${W * 0.3} 0 L ${W * 0.32} ${MAP_H}`}
          stroke="#1A3050" strokeWidth={7} fill="none" />
        <Path d={`M ${W * 0.65} 0 L ${W * 0.67} ${MAP_H}`}
          stroke="#1A3050" strokeWidth={7} fill="none" />
        <Path d={`M 0 ${MAP_H * 0.25} L ${W} ${MAP_H * 0.28}`}
          stroke="#1A3050" strokeWidth={5} fill="none" />

        {/* Dashed planned route */}
        <Path
          d={`M ${fromX} ${fromY} Q ${cpX} ${cpY} ${toX} ${toY}`}
          stroke="#22C55E"
          strokeWidth={2.5}
          fill="none"
          strokeDasharray="10,6"
          strokeOpacity={0.35}
        />

        {/* Donor pin pulse rings */}
        <Circle cx={fromX} cy={fromY} r={28} fill="#22C55E" fillOpacity={0.08} />
        <Circle cx={fromX} cy={fromY} r={20} fill="#22C55E" fillOpacity={0.15} />
        <Circle cx={fromX} cy={fromY} r={14} fill="#22C55E" />
        <Circle cx={fromX} cy={fromY} r={7} fill="#ffffff" />

        {/* NGO pin */}
        <Circle cx={toX} cy={toY} r={28} fill="#3B82F6" fillOpacity={0.08} />
        <Circle cx={toX} cy={toY} r={20} fill="#3B82F6" fillOpacity={0.15} />
        <Circle cx={toX} cy={toY} r={14} fill="#3B82F6" />
        <Circle cx={toX} cy={toY} r={7} fill="#ffffff" />

        {/* Labels */}
        <Rect x={fromX - 18} y={fromY + 18} width={36} height={16} rx={5} fill="#22C55E" />
        <SvgText x={fromX} y={fromY + 30} textAnchor="middle" fill="#000"
          fontSize={9} fontWeight="bold">{userLabel}</SvgText>

        <Rect x={toX - 16} y={toY - 34} width={32} height={16} rx={5} fill="#3B82F6" />
        <SvgText x={toX} y={toY - 22} textAnchor="middle" fill="#fff"
          fontSize={9} fontWeight="bold">{ngoLabel}</SvgText>
      </Svg>

      {/* Animated rider */}
      <Animated.View
        style={[
          styles.riderWrap,
          {
            left: riderX as unknown as number,
            top: riderY as unknown as number,
            transform: [
              { translateX: -20 },
              { translateY: -20 },
            ],
          },
        ]}
      >
        {/* Pulse glow behind rider */}
        <Animated.View style={[styles.riderGlow, { transform: [{ scale: pulseScale }] }]} />

        {/* Bike emoji */}
        <View style={styles.riderBike}>
          <Text style={styles.bikeEmoji}>🏍️</Text>
        </View>

        {/* Speed trail */}
        <Animated.View style={[styles.trail, { opacity: trailOpacity }]} />
      </Animated.View>

      {/* Live badge */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    height: MAP_H,
    position: "relative",
    margin: 0,
  },
  riderWrap: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  riderGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F97316",
    opacity: 0.3,
  },
  riderBike: {
    zIndex: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  bikeEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  trail: {
    position: "absolute",
    left: -16,
    top: 12,
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F97316",
    opacity: 0.5,
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
});
