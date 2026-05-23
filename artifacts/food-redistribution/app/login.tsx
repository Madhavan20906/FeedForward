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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, activeRole, savedUsername } = useApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [autofillUsed, setAutofillUsed] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const showAutofill = !!savedUsername && !identifier.trim() && !autofillUsed;

  const validate = () => {
    const e: typeof errors = {};
    if (!identifier.trim()) e.identifier = "Username or email is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(identifier.trim(), password, activeRole);
    setLoading(false);
    if (!result.success) {
      Alert.alert("Login Failed", result.error ?? "Invalid credentials.");
      return;
    }
    if (activeRole === "ngo") router.replace("/(ngo)");
    else if (activeRole === "admin") router.replace("/(admin)");
    else if (activeRole === "sponsor") router.replace("/(sponsor)");
    else router.replace("/(donor)");
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/onboarding");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 20, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={goBack} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.logoIcon}>
            <Feather name="zap" size={22} color="#000" />
          </LinearGradient>
          <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in with your username or email
          </Text>
        </View>

        {/* Username / Email */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Username or Email</Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.identifier ? colors.destructive : colors.border,
          }]}>
            <Feather name="user" size={18} color={errors.identifier ? colors.destructive : colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="@username or email"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              value={identifier}
              onChangeText={v => {
                setIdentifier(v);
                if (errors.identifier) setErrors(e => ({ ...e, identifier: undefined }));
              }}
            />
          </View>
          {errors.identifier && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.identifier}</Text>
            </View>
          )}

          {/* Autofill suggestion */}
          {showAutofill && (
            <Pressable
              onPress={() => { setIdentifier(savedUsername!); setAutofillUsed(true); }}
              style={[styles.autofillRow, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}
            >
              <Feather name="user-check" size={14} color={colors.primary} />
              <Text style={[styles.autofillText, { color: colors.primary }]}>
                Sign in as <Text style={{ fontFamily: "Inter_700Bold" }}>@{savedUsername}</Text>
              </Text>
              <Pressable onPress={() => setAutofillUsed(true)} hitSlop={8}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            </Pressable>
          )}
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.surfaceElevated,
            borderColor: errors.password ? colors.destructive : colors.border,
          }]}>
            <Feather name="lock" size={18} color={errors.password ? colors.destructive : colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Your password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPwd}
              value={password}
              onChangeText={v => {
                setPassword(v);
                if (errors.password) setErrors(e => ({ ...e, password: undefined }));
              }}
            />
            <Pressable onPress={() => setShowPwd(p => !p)} hitSlop={8}>
              <Feather name={showPwd ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>
          {errors.password && (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.password}</Text>
            </View>
          )}
        </View>

        <Pressable onPress={handleLogin} disabled={loading} style={styles.loginBtn}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.loginGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Text style={styles.loginText}>Sign In</Text>
                <Feather name="arrow-right" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </Pressable>

        <View style={[styles.infoBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Only signed-up users can log in. New here? Create an account first.
          </Text>
        </View>

        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>Don't have an account? </Text>
          <Pressable onPress={() => router.replace("/register")}>
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
          </Pressable>
        </View>

        <Pressable onPress={goBack} style={styles.changeRoleBtn}>
          <Text style={[styles.changeRoleText, { color: colors.mutedForeground }]}>← Back to role selection</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 24 },
  header: { alignItems: "center", marginBottom: 36 },
  logoIcon: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  fieldGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16, borderWidth: 1.5 },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_400Regular" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  errorText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  autofillRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 8 },
  autofillText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  loginBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8 },
  loginGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  loginText: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  infoBox: { flexDirection: "row", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 20, marginBottom: 20, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  signupText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  signupLink: { fontSize: 14, fontFamily: "Inter_700Bold" },
  changeRoleBtn: { alignItems: "center" },
  changeRoleText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
