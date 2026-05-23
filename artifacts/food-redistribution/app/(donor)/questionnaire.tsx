import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QUESTIONS = [
  {
    id: "refrigerated",
    question: "Was the food refrigerated or properly stored after preparation?",
    context: "Proper storage is critical for food safety and prevents bacterial growth.",
    positiveLabel: "Yes, properly stored",
    negativeLabel: "No / Not sure",
    icon: "thermometer" as const,
  },
  {
    id: "untouched",
    question: "Is the food untouched / not partially served?",
    context: "Untouched food carries a significantly lower contamination risk.",
    positiveLabel: "Yes, completely untouched",
    negativeLabel: "Partially served",
    icon: "package" as const,
  },
  {
    id: "vegetarian",
    question: "Is the food purely vegetarian?",
    context: "This helps match the right NGO dietary preferences and community requirements.",
    positiveLabel: "Yes, 100% vegetarian",
    negativeLabel: "Contains non-veg",
    icon: "leaf" as const,
  },
  {
    id: "servings",
    question: "Can this food serve more than 50 people?",
    context: "Helps NGOs plan distribution routes and allocate the right number of volunteers.",
    positiveLabel: "Yes, 50+ people",
    negativeLabel: "Less than 50 people",
    icon: "users" as const,
  },
  {
    id: "urgentPickup",
    question: "Is urgent pickup required within 2 hours?",
    context: "Urgent requests are bumped to the top of NGO queues and get priority riders.",
    positiveLabel: "Yes, urgent — within 2h",
    negativeLabel: "Flexible — up to 6h",
    icon: "clock" as const,
  },
  {
    id: "transportNeeded",
    question: "Do you need transport assistance for delivery?",
    context: "We can arrange an NGO volunteer rider or partner delivery service.",
    positiveLabel: "Yes, please arrange pickup",
    negativeLabel: "I can self-deliver",
    icon: "truck" as const,
  },
];

export default function QuestionnaireScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setCurrentDonation } = useApp();
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [attempted, setAttempted] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const allAnswered = QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null);
  const answeredCount = QUESTIONS.filter(q => answers[q.id] !== undefined && answers[q.id] !== null).length;

  const handleAnswer = (questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (!allAnswered) return;
    setCurrentDonation({ questionnaire: answers as Record<string, boolean> });
    router.push("/(donor)/analysis");
  };

  const safetyScore = () => {
    let score = 25;
    if (answers.refrigerated === true) score += 30;
    if (answers.untouched === true) score += 25;
    score += answeredCount * 3;
    return Math.min(score, 100);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.navHeader, { paddingTop: topPad + 8, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(donor)')}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Food Verification</Text>
        <View style={[styles.progressBadge, { backgroundColor: allAnswered ? colors.primary : colors.surfaceElevated }]}>
          <Text style={[styles.progressBadgeText, { color: allAnswered ? "#000" : colors.mutedForeground }]}>
            {answeredCount}/{QUESTIONS.length}
          </Text>
        </View>
      </View>

      <View style={[styles.progressWrap, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.primary, width: `${(answeredCount / QUESTIONS.length) * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Score preview */}
        {answeredCount > 0 && (
          <View style={[styles.scoreCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
            <Feather name="activity" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.scoreText, { color: colors.primary }]}>
                Estimated Safety Score: {safetyScore()}%
              </Text>
              <Text style={[styles.scoreHint, { color: colors.primary + "99" }]}>
                Answer all questions to finalise your score
              </Text>
            </View>
          </View>
        )}

        {attempted && !allAnswered && (
          <View style={[styles.alertCard, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "44" }]}>
            <Feather name="alert-triangle" size={16} color={colors.destructive} />
            <Text style={[styles.alertText, { color: colors.destructive }]}>
              All {QUESTIONS.length} questions are compulsory. Please answer the ones highlighted below.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Answer all {QUESTIONS.length} questions to proceed
        </Text>
        <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
          Tap Yes or No for each question — all are required
        </Text>

        {QUESTIONS.map((q, idx) => {
          const answered = answers[q.id] !== undefined && answers[q.id] !== null;
          const isUnanswered = attempted && !answered;
          return (
            <View
              key={q.id}
              style={[
                styles.questionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isUnanswered ? colors.destructive : answered ? colors.primary + "55" : colors.border,
                  borderWidth: isUnanswered || answered ? 2 : 1,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.qHeader}>
                <View style={[styles.qNum, { backgroundColor: answered ? colors.primary : isUnanswered ? colors.destructive + "22" : colors.surfaceElevated }]}>
                  {answered ? (
                    <Feather name="check" size={13} color="#fff" />
                  ) : (
                    <Text style={[styles.qNumText, { color: isUnanswered ? colors.destructive : colors.mutedForeground }]}>{idx + 1}</Text>
                  )}
                </View>
                <View style={styles.qTitleWrap}>
                  <View style={styles.qIconRow}>
                    <Feather name={q.icon} size={14} color={answered ? colors.primary : colors.mutedForeground} />
                    {isUnanswered && (
                      <View style={[styles.requiredBadge, { backgroundColor: colors.destructive + "22" }]}>
                        <Text style={[styles.requiredText, { color: colors.destructive }]}>Required</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.qText, { color: isUnanswered ? colors.foreground : colors.foreground }]}>
                    {q.question}
                  </Text>
                </View>
              </View>

              {/* Context */}
              <View style={[styles.contextRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Feather name="info" size={12} color={colors.mutedForeground} />
                <Text style={[styles.contextText, { color: colors.mutedForeground }]}>{q.context}</Text>
              </View>

              {/* Buttons */}
              <View style={styles.answerRow}>
                <Pressable
                  onPress={() => handleAnswer(q.id, true)}
                  style={[
                    styles.answerBtn,
                    {
                      backgroundColor: answers[q.id] === true ? colors.primary : colors.surfaceElevated,
                      borderColor: answers[q.id] === true ? colors.primary : colors.border,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather name="check" size={16} color={answers[q.id] === true ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.answerBtnText, { color: answers[q.id] === true ? "#fff" : colors.foreground }]}>
                    {q.positiveLabel}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleAnswer(q.id, false)}
                  style={[
                    styles.answerBtn,
                    {
                      backgroundColor: answers[q.id] === false ? "#EF444422" : colors.surfaceElevated,
                      borderColor: answers[q.id] === false ? "#EF4444" : colors.border,
                      flex: 1,
                    },
                  ]}
                >
                  <Feather name="x" size={16} color={answers[q.id] === false ? "#EF4444" : colors.mutedForeground} />
                  <Text style={[styles.answerBtnText, { color: answers[q.id] === false ? "#EF4444" : colors.foreground }]}>
                    {q.negativeLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Submit bar */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        {!allAnswered && (
          <Text style={[styles.bottomHint, { color: colors.mutedForeground }]}>
            {QUESTIONS.length - answeredCount} question{QUESTIONS.length - answeredCount !== 1 ? "s" : ""} remaining
          </Text>
        )}
        <Pressable onPress={handleSubmit} style={[styles.submitBtn, { opacity: allAnswered ? 1 : 0.65 }]}>
          <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Feather name={allAnswered ? "cpu" : "lock"} size={20} color="#fff" />
            <Text style={styles.submitText}>
              {allAnswered ? "Run AI Freshness Analysis →" : `Answer all ${QUESTIONS.length} questions to continue`}
            </Text>
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
  progressBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  progressBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressWrap: { height: 4 },
  progressBar: { height: 4, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  scoreCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 14 },
  scoreText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  scoreHint: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  alertCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 14 },
  alertText: { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
  questionCard: { borderRadius: 18, padding: 16, marginBottom: 14, overflow: "hidden" },
  qHeader: { flexDirection: "row", gap: 12, marginBottom: 12 },
  qNum: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 2 },
  qNumText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  qTitleWrap: { flex: 1 },
  qIconRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  requiredBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  requiredText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  qText: { fontSize: 15, fontFamily: "Inter_600SemiBold", lineHeight: 22 },
  contextRow: { flexDirection: "row", gap: 8, borderRadius: 10, padding: 10, marginBottom: 12, alignItems: "flex-start", borderWidth: 1 },
  contextText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  answerRow: { flexDirection: "row", gap: 10 },
  answerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 8 },
  answerBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center", flex: 1 },
  bottomBar: { borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  bottomHint: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  submitBtn: { borderRadius: 16, overflow: "hidden" },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18 },
  submitText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
