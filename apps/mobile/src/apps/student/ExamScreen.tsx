import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const ExamScreen = ({ route, navigation }: any) => {
  const { testId } = route.params;
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState<number>(0); // Seconds
  const [loading, setLoading] = useState(true);

  // Device Info for tracking/security
  const deviceFingerprint = `${Device.brand}-${Device.modelName}-${Device.osName}-${Device.osVersion}`;

  // 1. Initialize or Resume Test Attempt
  useEffect(() => {
    const startAttempt = async () => {
      try {
        const startRes = await api.post(`/online-tests/${testId}/start`, {
          deviceTrackingId: deviceFingerprint,
        });

        const attempt = startRes.data.attempt;
        const testDetails = startRes.data.test;

        setAttemptId(attempt.id);
        setQuestions(testDetails.questions || []);
        
        // Restore answers from savedState if any
        if (attempt.savedState && typeof attempt.savedState === 'object') {
          setAnswers(attempt.savedState.answers || {});
        }

        // Calculate time remaining
        const examDuration = testDetails.durationMinutes || 60;
        const startTime = new Date(attempt.startedAt).getTime();
        const endTime = startTime + examDuration * 60 * 1000;
        const remainingSecs = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        
        setTimeLeft(remainingSecs);
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        Alert.alert('Initialization Error', err.response?.data?.message || 'Failed to initialize exam session.', [
          { text: 'GO BACK', onPress: () => navigation.goBack() }
        ]);
      }
    };

    startAttempt();
  }, [testId]);

  // Countdown timer effect
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, timeLeft]);

  // 2. Autosave Answers State Mutation
  const saveStateMutation = useMutation({
    mutationFn: (currentAnswers: Record<string, string>) =>
      api.post(`/online-tests/attempts/${attemptId}/state`, {
        savedState: { answers: currentAnswers, lastQuestionIndex: currentIdx },
        deviceTrackingId: deviceFingerprint,
      }),
  });

  const handleSelectOption = (questionId: string, option: string) => {
    const updatedAnswers = { ...answers, [questionId]: option };
    setAnswers(updatedAnswers);
    // Trigger async background autosave to the backend
    saveStateMutation.mutate(updatedAnswers);
  };

  // 3. Final Submission Mutation
  const submitMutation = useMutation({
    mutationFn: () =>
      api.post(`/online-tests/attempts/${attemptId}/submit`, {
        answers,
        deviceTrackingId: deviceFingerprint,
      }),
    onSuccess: (res) => {
      Alert.alert(
        'Exam Completed',
        `Your exam paper has been submitted successfully.\nScore: ${res.data.marksObtained} / ${res.data.totalMarks}`,
        [{ text: 'RETURN TO DASHBOARD', onPress: () => navigation.navigate('Dashboard') }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Submission Error', err.response?.data?.message || 'Failed to submit exam sheet.');
    },
  });

  const handleConfirmSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;

    Alert.alert(
      'Commit Paper',
      `Are you sure you want to finalize your exam submission?\nAnswered: ${answeredCount}\nUnanswered: ${unansweredCount}`,
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'SUBMIT NOW', onPress: () => submitMutation.mutate() }
      ]
    );
  };

  const handleAutoSubmit = () => {
    Alert.alert('TIME EXPIRED', 'Your time has run out. Committing test answers automatically.', [
      { text: 'OK', onPress: () => submitMutation.mutate() }
    ]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>SECURE CONSOLE INITIALIZING...</Text>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>NO QUESTIONS IN TEST PAPER.</Text>
        <Button title="GO BACK" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIdx];
  const selectedOption = answers[currentQuestion.id] || null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Tactical Status Bar */}
      <View style={[styles.statusBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.testName, { color: colors.text }]}>EXAM SYSTEM CONSOLE</Text>
          <Text style={[styles.deviceText, { color: colors.textMuted }]}>TRACKING ID: {deviceFingerprint.slice(0, 25)}...</Text>
        </View>
        <View style={[styles.timerBox, { borderColor: timeLeft < 300 ? colors.error : colors.accent }]}>
          <Text style={[styles.timerText, { color: timeLeft < 300 ? colors.error : colors.accent }]}>
            ⏱️ {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Counter */}
        <View style={styles.counterRow}>
          <Text style={[styles.counterText, { color: colors.textMuted }]}>
            QUESTION {currentIdx + 1} OF {questions.length}
          </Text>
          <Text style={[styles.marksText, { color: colors.accent }]}>
            +{currentQuestion.marks || 1} MARKS
          </Text>
        </View>

        {/* Question Box */}
        <View style={[styles.questionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {currentQuestion.text}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {['A', 'B', 'C', 'D'].map((optKey) => {
            const optValue = currentQuestion[`option${optKey}`];
            if (!optValue) return null;
            const isSelected = selectedOption === optKey;

            return (
              <TouchableOpacity
                key={optKey}
                onPress={() => handleSelectOption(currentQuestion.id, optKey)}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <View style={[styles.radioCircle, { borderColor: isSelected ? colors.accent : colors.border }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.accent }]} />}
                </View>
                <Text style={[styles.optionText, { color: isSelected ? colors.primaryText : colors.text }]}>
                  ({optKey}) {optValue}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation Buttons */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button
          title="PREV"
          variant="secondary"
          onPress={() => setCurrentIdx((p) => Math.max(0, p - 1))}
          disabled={currentIdx === 0}
          style={styles.navButton}
        />
        {currentIdx === questions.length - 1 ? (
          <Button
            title="SUBMIT EXAM"
            variant="accent"
            onPress={handleConfirmSubmit}
            loading={submitMutation.isPending}
            style={styles.navButton}
          />
        ) : (
          <Button
            title="NEXT"
            onPress={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
            style={styles.navButton}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    marginTop: spacing.md,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  errorText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1.5,
  },
  testName: {
    fontWeight: typography.weights.heavy,
    fontSize: typography.sizes.sm,
    letterSpacing: 0.5,
  },
  deviceText: {
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  timerBox: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  timerText: {
    fontWeight: typography.weights.heavy,
    fontSize: typography.sizes.md,
  },
  scrollContent: {
    padding: spacing.md,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  counterText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  marksText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  questionBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 120,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    fontWeight: typography.weights.medium,
  },
  optionsContainer: {
    marginBottom: spacing.xl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: 1.5,
  },
  navButton: {
    width: '48%',
  },
});
