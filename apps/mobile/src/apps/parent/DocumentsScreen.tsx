import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Card } from '../../components/Card';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const DocumentsScreen = ({ route }: any) => {
  const { studentId } = route.params;
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  // Fetch student profile to read their files JSON
  const { data: student, isLoading } = useQuery({
    queryKey: ['parentStudentDetails', studentId],
    queryFn: () => api.get(`/students/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  const handleOpenDoc = (url: string | null) => {
    if (!url) {
      Alert.alert('Missing File', 'This compliance document has not been uploaded to the registry.');
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open file link.');
    });
  };

  // Extract documents structure (e.g. { aadhar: url, birth_cert: url, etc. })
  const docs = student?.documents || {};
  const docList = [
    { label: 'AADHAR IDENTITY VERIFICATION', key: 'aadhar', url: docs.aadhar || null },
    { label: 'DATE OF BIRTH CERTIFICATE', key: 'birth_cert', url: docs.birth_cert || null },
    { label: 'PASSPORT PHOTO REGISTRATION', key: 'photo', url: docs.photo || student?.photoUrl || null },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>COMPLIANCE REGISTRY</Text>
      </View>

      <View style={styles.content}>
        {docList.map((doc) => (
          <View key={doc.key} style={[styles.docRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.docLabel, { color: colors.text }]}>{doc.label}</Text>
              <Text style={[styles.docStatus, { color: doc.url ? colors.success : colors.error }]}>
                {doc.url ? '✔️ VERIFIED ARCHIVED' : '❌ PENDING FILE UPLOAD'}
              </Text>
            </View>
            {doc.url && (
              <TouchableOpacity
                onPress={() => handleOpenDoc(doc.url)}
                style={[styles.previewBtn, { borderColor: colors.accent }]}
              >
                <Text style={[styles.previewText, { color: colors.accent }]}>PREVIEW</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  content: {
    padding: spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  docLabel: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.xs,
    letterSpacing: 0.5,
  },
  docStatus: {
    fontSize: 9,
    marginTop: 4,
    fontWeight: typography.weights.medium,
  },
  previewBtn: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  previewText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
});
