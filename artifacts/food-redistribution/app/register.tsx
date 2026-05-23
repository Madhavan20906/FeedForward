import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ROLES = [
  { id: "individual_donor", label: "Individual Donor", desc: "Home / personal food", icon: "home" },
  { id: "business_donor", label: "Business Donor", desc: "Restaurant / hotel / catering", icon: "briefcase" },
  { id: "ngo", label: "NGO / Shelter", desc: "Receive and distribute", icon: "heart" },
  { id: "sponsor", label: "CSR Sponsor", desc: "Fund & track ESG impact", icon: "award" },
] as const;

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register, activeRole } = useApp();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [role, setRole] = useState<typeof activeRole>(activeRole);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = "Username is required";
    else if (username.trim().length < 3) e.username = "Minimum 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) e.username = "Only letters, numbers, and underscores";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    if (!confirmPwd) e.confirmPwd = "Please confirm your password";
    else if (confirmPwd !== password) e.confirmPwd = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await register(username.trim(), name.trim() || username.trim(), email.trim(), password, role);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Sign Up Failed", result.error ?? "Please try again.");
      return;
    }
    if (role === "ngo") router.replace("/(ngo)");
    else if (role === "admin") router.replace("/(admin)");
    else if (role === "sponsor") router.replace("/(sponsor)");
    else router.replace("/(donor)");
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? (
      <View style={styles.errorRow}>
        <Feather name="alert-circle" size={12} color={colors.destructive} />
        <Text style={[styles.errorText, { color: colors.destructive }]}>{errors[field]}</Text>
      </View>
    ) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 12, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/login')} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.logoIcon}>
            <Feather name="zap" size={22} color="#000" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Join FeedForward — your username appears on your dashboard
          </Text>
        </View>

        {/* Username */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Username <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.username ? colors.destructive : username.trim().length >= 3 ? colors.primary + "66" : colors.border,
          }]}>
            <Text style={[styles.atSign, { color: colors.primary }]}>@</Text>
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="e.g. john_doe"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={v => { setUsername(v); if (errors.username) setErrors(e => ({ ...e, username: "" })); }}
            />
            {username.trim().length >= 3 && !errors.username && (
              <Feather name="check-circle" size={18} color={colors.primary} />
            )}
          </View>
          <FieldError field="username" />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            This is how you'll appear on the platform. Used for login too.
          </Text>
        </View>

        {/* Display Name (optional) */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Full Name <Text style={[styles.optional, { color: colors.mutedForeground }]}>(optional)</Text>
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Feather name="user" size={18} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Your full name (defaults to username)"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Email <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.email ? colors.destructive : colors.border,
          }]}>
            <Feather name="mail" size={18} color={errors.email ? colors.destructive : colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="you@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={v => { setEmail(v); if (errors.email) setErrors(e => ({ ...e, email: "" })); }}
            />
          </View>
          <FieldError field="email" />
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Password <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.password ? colors.destructive : colors.border,
          }]}>
            <Feather name="lock" size={18} color={errors.password ? colors.destructive : colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={v => { setPassword(v); if (errors.password) setErrors(e => ({ ...e, password: "" })); }}
            />
            <Pressable onPress={() => setShowPwd(p => !p)}>
              <Feather name={showPwd ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <FieldError field="password" />
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Confirm Password <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.confirmPwd ? colors.destructive : (confirmPwd && confirmPwd === password) ? colors.primary + "66" : colors.border,
          }]}>
            <Feather name="shield" size={18} color={errors.confirmPwd ? colors.destructive : colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Re-enter password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPwd}
              value={confirmPwd}
              onChangeText={v => { setConfirmPwd(v); if (errors.confirmPwd) setErrors(e => ({ ...e, confirmPwd: "" })); }}
            />
            {confirmPwd && confirmPwd === password && (
              <Feather name="check-circle" size={18} color={colors.primary} />
            )}
          </View>
          <FieldError field="confirmPwd" />
        </View>

        {/* Role */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            I am a <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={styles.roleGrid}>
            {ROLES.map(r => (
              <Pressable
                key={r.id}
                onPress={() => setRole(r.id as typeof role)}
                style={[styles.roleCard, {
                  backgroundColor: role === r.id ? colors.primary + "18" : colors.surfaceElevated,
                  borderColor: role === r.id ? colors.primary : colors.border,
                  borderWidth: role === r.id ? 2 : 1,
                }]}
              >
                <Feather name={r.icon as "home"} size={18} color={role === r.id ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.roleLabel, { color: role === r.id ? colors.primary : colors.foreground }]}>{r.label}</Text>
                <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{r.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit */}
        <Pressable onPress={handleRegister} disabled={loading} style={styles.submitBtn}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Feather name="user-plus" size={20} color="#fff" />
                <Text style={styles.submitText}>Create My Account</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/login")}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 20 },
  header: { alignItems: "center", marginBottom: 28 },
  logoIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  optional: { fontFamily: "Inter_400Regular", fontSize: 12 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 15, borderWidth: 1.5 },
  atSign: { fontSize: 18, fontFamily: "Inter_700Bold" },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5, paddingHorizontal: 2 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  hint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 5, paddingHorizontal: 2 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  roleCard: { width: "47%", borderRadius: 14, padding: 14, gap: 6 },
  roleLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  roleDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
  submitBtn: { borderRadius: 16, overflow: "hidden", marginTop: 4, marginBottom: 20 },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  submitText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  loginRow: { flexDirection: "row", justifyContent: "center", marginBottom: 8 },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
