import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { FOOD_CATEGORIES } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PREP_TIMES = ["Just now", "30 min ago", "1 hour ago", "2 hours ago", "3 hours ago"];
const EXPIRY_OPTS = ["2 hours", "4 hours", "6 hours", "8 hours", "12 hours", "24 hours"];
const UNITS = ["servings", "kg", "litres", "pieces", "boxes", "packets"];

const FOOD_DETECTIONS = [
  "Packaged food detected ✓",
  "Prepared dish detected ✓",
  "Food container detected ✓",
  "Open food tray detected ✓",
  "Sealed package detected ✓",
  "Food items detected ✓",
];

type ScanState = "scanning" | "detected" | "no_food" | null;

export default function DonateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setCurrentDonation, resetCurrentDonation } = useApp();
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("veg");
  const [quantity, setQuantity] = useState("10");
  const [unit, setUnit] = useState("servings");
  const [prepTime, setPrepTime] = useState("1 hour ago");
  const [expiry, setExpiry] = useState("6 hours");
  const [servings, setServings] = useState("20");
  const [location, setLocation] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

  const [imageUris, setImageUris] = useState<string[]>([]);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const [scanState, setScanState] = useState<ScanState>(null);
  const [detectedLabel, setDetectedLabel] = useState("");

  const scanAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    resetCurrentDonation();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (scanState === "scanning") {
      Animated.loop(
        Animated.timing(scanAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
    if (scanState === "detected") {
      Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, tension: 120, friction: 7 }).start();
    } else {
      checkAnim.setValue(0);
    }
  }, [scanState]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") fetchLocation();
    } catch {}
  };

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [addr] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (addr) {
        const parts = [addr.street, addr.district, addr.city].filter(Boolean);
        setLocation(parts.join(", "));
      }
    } catch {
      setLocation("Location unavailable");
    } finally {
      setLocationLoading(false);
    }
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access to take food photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPendingUri(uri);
      setScanState("scanning");
      const label = FOOD_DETECTIONS[Math.floor(Math.random() * FOOD_DETECTIONS.length)];
      setTimeout(() => {
        setDetectedLabel(label);
        setScanState("detected");
      }, 1800);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.85,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPendingUri(uri);
      setScanState("scanning");
      const label = FOOD_DETECTIONS[Math.floor(Math.random() * FOOD_DETECTIONS.length)];
      setTimeout(() => {
        setDetectedLabel(label);
        setScanState("detected");
      }, 1800);
    }
  };

  const confirmPhoto = () => {
    if (pendingUri) {
      setImageUris((prev) => [...prev, pendingUri]);
      setPendingUri(null);
      setScanState(null);
      setDetectedLabel("");
    }
  };

  const discardPending = () => {
    setPendingUri(null);
    setScanState(null);
    setDetectedLabel("");
  };

  const removePhoto = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!foodName.trim()) return;
    setCurrentDonation({
      foodName,
      category: category as never,
      quantity: Number(quantity),
      unit,
      preparedAt: prepTime,
      expiryEstimate: expiry,
      servingCapacity: Number(servings),
      location: location || "Current Location",
      imageUri: imageUris[0] ?? undefined,
    });
    router.push("/(donor)/questionnaire");
  };

  const spinInterpolate = scanAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(donor)")} hitSlop={10}>
          <Feather name="x" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Donate Food</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={[styles.progressWrap, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: "14%" }]} />
      </View>
      <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>Step 1 of 7 — Food Details</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Photo Review Overlay ── */}
        {pendingUri ? (
          <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.reviewTitle, { color: colors.foreground }]}>Review Photo</Text>

            {/* Photo */}
            <View style={styles.reviewImgWrap}>
              <Image source={{ uri: pendingUri }} style={styles.reviewImg} resizeMode="cover" />

              {/* Scan overlay */}
              {scanState === "scanning" && (
                <View style={styles.scanOverlay}>
                  <Animated.View style={[styles.scanLine, { transform: [{ rotate: spinInterpolate }] }]}>
                    <View style={styles.scanLineInner} />
                  </Animated.View>
                  <View style={styles.scanLabelWrap}>
                    <ActivityIndicator size="small" color="#22C55E" />
                    <Text style={styles.scanLabel}>Detecting food…</Text>
                  </View>
                </View>
              )}

              {/* Result badge */}
              {scanState === "detected" && (
                <Animated.View style={[styles.detectedBadge, { transform: [{ scale: checkAnim }] }]}>
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.detectedText}>{detectedLabel}</Text>
                </Animated.View>
              )}
              {scanState === "no_food" && (
                <View style={[styles.detectedBadge, { backgroundColor: "#EF4444" }]}>
                  <Feather name="alert-circle" size={16} color="#fff" />
                  <Text style={styles.detectedText}>No food detected — retake</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            <View style={styles.reviewActions}>
              <Pressable
                onPress={discardPending}
                style={[styles.reviewBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }]}
              >
                <Feather name="x" size={16} color={colors.foreground} />
                <Text style={[styles.reviewBtnText, { color: colors.foreground }]}>Discard</Text>
              </Pressable>

              <Pressable
                onPress={launchCamera}
                style={[styles.reviewBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1 }]}
              >
                <Feather name="refresh-ccw" size={16} color={colors.foreground} />
                <Text style={[styles.reviewBtnText, { color: colors.foreground }]}>Retake</Text>
              </Pressable>

              <Pressable
                onPress={confirmPhoto}
                disabled={scanState === "scanning"}
                style={[styles.reviewConfirmBtn, { opacity: scanState === "scanning" ? 0.5 : 1 }]}
              >
                <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.reviewConfirmGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Feather name="check" size={16} color="#fff" />
                  <Text style={styles.reviewConfirmText}>Use Photo</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            {/* ── Confirmed Photos Strip ── */}
            {imageUris.length > 0 && (
              <View style={styles.photosSection}>
                <View style={styles.photosSectionHeader}>
                  <Feather name="camera" size={14} color={colors.primary} />
                  <Text style={[styles.photosSectionTitle, { color: colors.foreground }]}>
                    {imageUris.length} photo{imageUris.length > 1 ? "s" : ""} added
                  </Text>
                  <Pressable onPress={launchCamera} style={[styles.addMoreBtn, { borderColor: colors.primary + "66" }]}>
                    <Feather name="plus" size={13} color={colors.primary} />
                    <Text style={[styles.addMoreText, { color: colors.primary }]}>Add angle</Text>
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                  {imageUris.map((uri, i) => (
                    <View key={i} style={styles.photoThumbWrap}>
                      <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                      <Pressable
                        onPress={() => removePhoto(i)}
                        style={[styles.removeThumbBtn, { backgroundColor: colors.destructive }]}
                      >
                        <Feather name="x" size={10} color="#fff" />
                      </Pressable>
                      {i === 0 && (
                        <View style={[styles.primaryBadge, { backgroundColor: colors.primary }]}>
                          <Text style={styles.primaryBadgeText}>Main</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {/* Add more tile */}
                  <Pressable onPress={launchCamera} style={[styles.addTile, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                    <Feather name="camera" size={22} color={colors.mutedForeground} />
                    <Text style={[styles.addTileText, { color: colors.mutedForeground }]}>Add{"\n"}angle</Text>
                  </Pressable>
                </ScrollView>
              </View>
            )}

            {/* ── Take Photo / Gallery ── */}
            {imageUris.length === 0 && (
              <View style={[styles.imagePickerSection, { borderColor: colors.border }]}>
                <View style={styles.cameraIconWrap}>
                  <Feather name="camera" size={32} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.imageLabel, { color: colors.foreground }]}>Add Food Photos</Text>
                <Text style={[styles.imageHint, { color: colors.mutedForeground }]}>
                  Captures open &amp; closed packages · Food only · No faces
                </Text>
                <View style={styles.imageButtons}>
                  <Pressable
                    onPress={launchCamera}
                    style={[styles.imageBtn, { backgroundColor: colors.primary, flex: 1 }]}
                  >
                    <Feather name="camera" size={18} color="#fff" />
                    <Text style={styles.imageBtnText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                    onPress={pickImage}
                    style={[styles.imageBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderWidth: 1, flex: 1 }]}
                  >
                    <Feather name="image" size={18} color={colors.foreground} />
                    <Text style={[styles.imageBtnTextDark, { color: colors.foreground }]}>Gallery</Text>
                  </Pressable>
                </View>
                <Text style={[styles.detectionNote, { color: colors.mutedForeground }]}>
                  AI scans for food items — packages, dishes, containers
                </Text>
              </View>
            )}
          </>
        )}

        {/* Food Name */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Food Name *</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: foodName.trim() ? colors.primary + "44" : colors.border }]}>
            <Feather name="edit-3" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. Veg Biryani, Dal Tadka, Sandwiches..."
              placeholderTextColor={colors.mutedForeground}
              value={foodName}
              onChangeText={setFoodName}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Food Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {FOOD_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={[styles.chip, { backgroundColor: category === cat.id ? colors.primary : colors.surfaceElevated, borderColor: category === cat.id ? colors.primary : colors.border, marginRight: 10 }]}
              >
                <Text style={[styles.chipText, { color: category === cat.id ? "#000" : colors.foreground }]}>{cat.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Quantity + Unit */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Quantity</Text>
          <View style={styles.quantityRow}>
            <View style={[styles.inputWrap, { width: 90, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground, textAlign: "center" }]}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {UNITS.map((u) => (
                <Pressable
                  key={u}
                  onPress={() => setUnit(u)}
                  style={[styles.chip, { backgroundColor: unit === u ? colors.primary : colors.surfaceElevated, borderColor: unit === u ? colors.primary : colors.border, marginRight: 8 }]}
                >
                  <Text style={[styles.chipText, { color: unit === u ? "#000" : colors.foreground }]}>{u}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Servings */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Estimated Servings</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="users" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              keyboardType="numeric"
              placeholder="How many people can this feed?"
              placeholderTextColor={colors.mutedForeground}
              value={servings}
              onChangeText={setServings}
            />
            <Text style={[styles.inputSuffix, { color: colors.mutedForeground }]}>people</Text>
          </View>
        </View>

        {/* Prep Time */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>When was food prepared?</Text>
          <View style={styles.chipRow}>
            {PREP_TIMES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setPrepTime(t)}
                style={[styles.chip, { backgroundColor: prepTime === t ? colors.primary : colors.surfaceElevated, borderColor: prepTime === t ? colors.primary : colors.border }]}
              >
                <Text style={[styles.chipText, { color: prepTime === t ? "#000" : colors.foreground }]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Expiry */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Safe consumption window</Text>
          <View style={styles.chipRow}>
            {EXPIRY_OPTS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setExpiry(e)}
                style={[styles.chip, { backgroundColor: expiry === e ? colors.primary : colors.surfaceElevated, borderColor: expiry === e ? colors.primary : colors.border }]}
              >
                <Text style={[styles.chipText, { color: expiry === e ? "#000" : colors.foreground }]}>{e}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pickup Location */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Pickup Location</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="map-pin" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder={locationLoading ? "Detecting location..." : "Enter address or use GPS"}
              placeholderTextColor={colors.mutedForeground}
              value={location}
              onChangeText={setLocation}
            />
            <Pressable onPress={fetchLocation}>
              {locationLoading
                ? <Feather name="loader" size={18} color={colors.primary} />
                : <Feather name="navigation" size={18} color={colors.primary} />
              }
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={handleNext} style={[styles.nextBtn, { opacity: foodName.trim() ? 1 : 0.5 }]}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>Next: Verification Questions</Text>
            <Feather name="arrow-right" size={20} color="#fff" />
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
  progressWrap: { height: 3 },
  progressBar: { height: 3, borderRadius: 2 },
  stepLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  reviewCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 24, gap: 14 },
  reviewTitle: { fontSize: 15, fontFamily: "Inter_700Bold", textAlign: "center" },
  reviewImgWrap: { borderRadius: 14, overflow: "hidden", width: "100%", height: 220, position: "relative", backgroundColor: "#111" },
  reviewImg: { width: "100%", height: "100%" },
  scanOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", gap: 14 },
  scanLine: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#22C55E", borderTopColor: "transparent", alignItems: "center", justifyContent: "center" },
  scanLineInner: { width: 80, height: 80, borderRadius: 40, borderWidth: 1.5, borderColor: "#22C55E55", borderTopColor: "transparent" },
  scanLabelWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  scanLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  detectedBadge: { position: "absolute", bottom: 12, left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#22C55E", borderRadius: 12, paddingVertical: 10 },
  detectedText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  reviewActions: { flexDirection: "row", gap: 8 },
  reviewBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 13 },
  reviewBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reviewConfirmBtn: { flex: 1.4, borderRadius: 12, overflow: "hidden" },
  reviewConfirmGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13 },
  reviewConfirmText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  photosSection: { marginBottom: 20 },
  photosSectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  photosSectionTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  addMoreBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  addMoreText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  photosScroll: { flexDirection: "row" },
  photoThumbWrap: { width: 110, height: 110, borderRadius: 14, overflow: "hidden", marginRight: 10, position: "relative" },
  photoThumb: { width: "100%", height: "100%" },
  removeThumbBtn: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  primaryBadge: { position: "absolute", bottom: 6, left: 6, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  primaryBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  addTile: { width: 110, height: 110, borderRadius: 14, borderWidth: 1.5, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  addTileText: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },

  imagePickerSection: { borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", padding: 20, marginBottom: 24, alignItems: "center", gap: 10 },
  cameraIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(34,197,94,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  imageLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  imageHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  imageButtons: { flexDirection: "row", gap: 10, width: "100%" },
  imageBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  imageBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  imageBtnTextDark: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  detectionNote: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },

  fieldGroup: { marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  inputSuffix: { fontSize: 14, fontFamily: "Inter_400Regular" },
  quantityRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12 },
  nextBtn: { borderRadius: 16, overflow: "hidden" },
  nextBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  nextBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
});
