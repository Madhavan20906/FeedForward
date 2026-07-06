import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGrad,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import type { NearbyNGO } from "@/utils/generateNGOs";

const { width } = Dimensions.get("window");
const MAP_W = width - 32;
const MAP_H = 220;

interface NGOMapProps {
  userCoords: { latitude: number; longitude: number };
  ngos: NearbyNGO[];
}

function toXY(
  lat: number, lng: number,
  userLat: number, userLng: number,
  allNGOs: NearbyNGO[],
) {
  const allLats = [userLat, ...allNGOs.map(n => n.location.lat)];
  const allLngs = [userLng, ...allNGOs.map(n => n.location.lng)];
  const minLat = Math.min(...allLats), maxLat = Math.max(...allLats);
  const minLng = Math.min(...allLngs), maxLng = Math.max(...allLngs);
  const pad = 36;
  const rangeX = Math.max(maxLng - minLng, 0.005);
  const rangeY = Math.max(maxLat - minLat, 0.005);
  const x = pad + ((lng - minLng) / rangeX) * (MAP_W - pad * 2);
  const y = MAP_H - pad - ((lat - minLat) / rangeY) * (MAP_H - pad * 2);
  return {
    x: Math.max(pad, Math.min(MAP_W - pad, x)),
    y: Math.max(pad, Math.min(MAP_H - pad, y)),
  };
}

export default function NGOMap({ userCoords, ngos }: NGOMapProps) {
  const uLat = userCoords.latitude, uLng = userCoords.longitude;
  const visibleNGOs = ngos.slice(0, 8);
  const userXY = toXY(uLat, uLng, uLat, uLng, visibleNGOs);

  return (
    <View style={styles.container}>
      <Svg width={MAP_W} height={MAP_H}>
        <Defs>
          <SvgGrad id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0D1829" />
            <Stop offset="1" stopColor="#050A12" />
          </SvgGrad>
        </Defs>

        {/* Background */}
        <Rect x={0} y={0} width={MAP_W} height={MAP_H} fill="url(#bg)" />

        {/* Grid */}
        {[1, 2, 3].map(i => (
          <React.Fragment key={`g${i}`}>
            <Line x1={0} y1={i * (MAP_H / 4)} x2={MAP_W} y2={i * (MAP_H / 4)} stroke="#152035" strokeWidth={1} />
            <Line x1={i * (MAP_W / 4)} y1={0} x2={i * (MAP_W / 4)} y2={MAP_H} stroke="#152035" strokeWidth={1} />
          </React.Fragment>
        ))}

        {/* Dashed lines from user to each NGO */}
        {visibleNGOs.map((ngo, i) => {
          const xy = toXY(ngo.location.lat, ngo.location.lng, uLat, uLng, visibleNGOs);
          return (
            <Line
              key={`line_${ngo.id}`}
              x1={userXY.x} y1={userXY.y}
              x2={xy.x} y2={xy.y}
              stroke={i === 0 ? "#3B82F688" : "#3B82F633"}
              strokeWidth={i === 0 ? 1.5 : 1}
              strokeDasharray="5,4"
            />
          );
        })}

        {/* NGO markers */}
        {visibleNGOs.map((ngo, i) => {
          const xy = toXY(ngo.location.lat, ngo.location.lng, uLat, uLng, visibleNGOs);
          const color = i === 0 ? "#3B82F6" : "#6366F1";
          return (
            <React.Fragment key={`ngo_${ngo.id}`}>
              <Circle cx={xy.x} cy={xy.y} r={16} fill={color} fillOpacity={0.2} />
              <Circle cx={xy.x} cy={xy.y} r={9} fill={color} />
              <SvgText x={xy.x} y={xy.y + 4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="bold">
                {i + 1}
              </SvgText>
              <SvgText x={xy.x} y={xy.y + 22} textAnchor="middle" fill={color} fontSize={8}>
                {ngo.name.split(" ").slice(0, 2).join(" ")}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* User marker */}
        <Circle cx={userXY.x} cy={userXY.y} r={24} fill="#22C55E" fillOpacity={0.15} />
        <Circle cx={userXY.x} cy={userXY.y} r={15} fill="#22C55E" fillOpacity={0.3} />
        <Circle cx={userXY.x} cy={userXY.y} r={8} fill="#22C55E" />
        <Circle cx={userXY.x} cy={userXY.y} r={3} fill="#fff" />
        <SvgText x={userXY.x} y={userXY.y - 20} textAnchor="middle" fill="#22C55E" fontSize={10} fontWeight="bold">
          YOU
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: MAP_W,
    height: MAP_H,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#050A12",
  },
});