import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Feather } from "@expo/vector-icons";

interface LiveMapProps {
  progress: Animated.Value;
  userCoords: { latitude: number; longitude: number };
  ngoCoords: { latitude: number; longitude: number };
  riderCoords: { latitude: number; longitude: number };
  route: { latitude: number; longitude: number }[];
  riderRouteIndex?: number;
  userLabel?: string;
  ngoLabel?: string;
}

export default function LiveMap({
  userCoords,
  ngoCoords,
  riderCoords,
  route,
  riderRouteIndex = 0,
}: LiveMapProps) {
  const midLat = (userCoords.latitude + ngoCoords.latitude) / 2;
  const midLng = (userCoords.longitude + ngoCoords.longitude) / 2;
  const latDelta = Math.max(Math.abs(userCoords.latitude - ngoCoords.latitude) * 2.5, 0.02);
  const lngDelta = Math.max(Math.abs(userCoords.longitude - ngoCoords.longitude) * 2.5, 0.02);

  const traveledRoute = route.slice(0, Math.max(2, riderRouteIndex + 1));

  return (
    <MapView
      style={styles.map}
      region={{
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }}
      showsTraffic={false}
      showsBuildings={true}
      showsPointsOfInterest={false}
    >
      {/* Full route (faded dashed) */}
      <Polyline
        coordinates={route}
        strokeColor="#22C55E55"
        strokeWidth={4}
        lineDashPattern={[8, 5]}
      />
      {/* Traveled portion */}
      {traveledRoute.length >= 2 && (
        <Polyline
          coordinates={traveledRoute}
          strokeColor="#22C55E"
          strokeWidth={5}
        />
      )}

      {/* Donor / Pickup */}
      <Marker coordinate={userCoords} title="Pickup" anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.donorMarker}>
          <Feather name="home" size={13} color="#fff" />
        </View>
      </Marker>

      {/* NGO destination */}
      <Marker coordinate={ngoCoords} title="NGO" anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.ngoMarker}>
          <Feather name="heart" size={13} color="#fff" />
        </View>
      </Marker>

      {/* Rider (animated) */}
      <Marker coordinate={riderCoords} anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.riderMarkerWrap}>
          <Text style={{ fontSize: 24 }}>🏍️</Text>
          <View style={styles.riderShadow} />
        </View>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
  },
  donorMarker: {
    backgroundColor: "#22C55E",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ngoMarker: {
    backgroundColor: "#3B82F6",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  riderMarkerWrap: {
    alignItems: "center",
  },
  riderShadow: {
    width: 28,
    height: 8,
    borderRadius: 14,
    backgroundColor: "rgba(249,115,22,0.35)",
    marginTop: -4,
  },
});
