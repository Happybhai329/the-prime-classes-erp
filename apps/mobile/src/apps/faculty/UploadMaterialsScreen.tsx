import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const UploadMaterialsScreen = ({ navigation }: any) => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // 1. Fetch Batches
  const { data: batchesRes } = useQuery({
    queryKey: ['batchesList'],
    queryFn: () => api.get('/batches').then((res) => res.data),
  });

  // 2. Fetch Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => api.get('/materials/categories').then((res) => res.data),
  });

  const batches = batchesRes?.data || [];
  const categories = categoriesRes || [];

  useEffect(() => {
    if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories]);

  // Upload Material Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: any) =>
      api.post('/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: () => {
      Alert.alert('Success', 'Study material uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['studyMaterials'] });
      navigation.goBack();
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to upload material');
    },
  });

  const handleUpload = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title.');
      return;
    }

    if (!selectedBatchId || !selectedCategoryId) {
      Alert.alert('Required', 'Please select a batch and a category.');
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('batchId', selectedBatchId);
    formData.append('categoryId', selectedCategoryId);
    
    // Simulating file asset attachments
    const simulatedFile = {
      uri: 'file:///simulated/path/notes.pdf',
      name: 'lecture_notes.pdf',
      type: 'application/pdf',
    };
    formData.append('file', simulatedFile as any);

    uploadMutation.mutate(formData);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>UPLOAD STUDY MATERIAL</Text>
        </View>

        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Input
            label="Material Title"
            placeholder="e.g. Physics Wave Mechanics"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Description / Instructions"
            placeholder="Provide a brief summary of the file content"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            inputStyle={styles.descInput}
          />

          {/* Categories select list */}
          <Text style={[styles.label, { color: colors.textMuted }]}>MATERIAL CATEGORY</Text>
          <View style={styles.badgeRow}>
            {categories.map((c: any) => {
              const isSelected = c.id === selectedCategoryId;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCategoryId(c.id)}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isSelected ? colors.background : colors.text,
                        fontWeight: isSelected ? 'bold' : 'medium',
                      },
                    ]}
                  >
                    {c.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Batches list */}
          <Text style={[styles.label, { color: colors.textMuted }]}>TARGET BATCH MODULE</Text>
          <View style={styles.badgeRow}>
            {batches.map((b: any) => {
              const isSelected = b.id === selectedBatchId;
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => setSelectedBatchId(b.id)}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.surfaceElevated,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: isSelected ? colors.primaryText : colors.text }]}>
                    {b.name.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title="TRANSMIT TO SERVER"
            onPress={handleUpload}
            loading={uploadMutation.isPending}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  form: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
  },
  descInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
  submitBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
});
