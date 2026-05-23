import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { FOOD_CATEGORIES } from "@/data/mockData";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    // Always start fresh when entering the donate flow
    resetCurrentDonation();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        fetchLocation();
      }
    } catch {}
  };

  const fetchLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [addr] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access to take food photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
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
      imageUri: imageUri ?? undefined,
    });
    router.push("/(donor)/questionnaire");
  };

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
        {/* Image Section */}
        {imageUri ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <Pressable
              onPress={() => setImageUri(null)}
              style={[styles.removeImageBtn, { backgroundColor: colors.destructive }]}
            >
              <Feather name="x" size={14} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.imagePickerSection, { borderColor: colors.border }]}>
            <Text style={[styles.imageLabel, { color: colors.mutedForeground }]}>Add Food Photo</Text>
            <View style={styles.imageButtons}>
              <Pressable
                onPress={takePhoto}
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
            <Text style={[styles.imageHint, { color: colors.mutedForeground }]}>
              Photo helps NGOs assess food quality faster
            </Text>
          </View>
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
  imagePickerSection: { borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", padding: 16, marginBottom: 24, gap: 10 },
  imageLabel: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center" },
  imageButtons: { flexDirection: "row", gap: 10 },
  imageBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  imageBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  imageBtnTextDark: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  imageHint: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
  imagePreviewWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative" },
  imagePreview: { width: "100%", height: 180, resizeMode: "cover" },
  removeImageBtn: { position: "absolute", top: 10, right: 10, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
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
