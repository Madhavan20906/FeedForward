import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Feather } from "@expo/vector-icons";
import type { NearbyNGO } from "@/utils/generateNGOs";

interface NGOMapProps {
  userCoords: { latitude: number; longitude: number };
  ngos: NearbyNGO[];
}

export default function NGOMap({ userCoords, ngos }: NGOMapProps) {
  return (
    <MapView
      style={styles.map}
      region={{
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        latitudeDelta: 0.09,
        longitudeDelta: 0.09,
      }}
      showsUserLocation
      showsTraffic={false}
      showsBuildings={true}
      showsPointsOfInterest={false}
    >
      <Marker coordinate={userCoords} title="You" anchor={{ x: 0.5, y: 0.5 }}>
        <View style={styles.userMarker}>
          <Feather name="home" size={13} color="#fff" />
        </View>
      </Marker>

      {ngos.slice(0, 8).map((ngo, i) => (
        <Marker
          key={ngo.id}
          coordinate={{ latitude: ngo.location.lat, longitude: ngo.location.lng }}
          title={ngo.name}
          description={`${ngo.distanceStr} · ${ngo.speciality}`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={[styles.ngoMarker, { backgroundColor: i === 0 ? "#3B82F6" : "#6366F1" }]}>
            <Feather name="heart" size={10} color="#fff" />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
  },
  userMarker: {
    backgroundColor: "#22C55E",
    width: 32,
    height: 32,
    borderRadius: 16,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
