import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Linking, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const MaterialsScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 1. Fetch Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['materialCategories'],
    queryFn: () => api.get('/materials/categories').then((res) => res.data),
  });

  // 2. Fetch Study Materials
  const { data: materialsRes, isLoading } = useQuery({
    queryKey: ['studyMaterials', selectedCategory],
    queryFn: () =>
      api
        .get('/materials', {
          params: selectedCategory ? { categoryId: selectedCategory } : {},
        })
        .then((res) => res.data),
  });

  // Favorite Mutation
  const favoriteMutation = useMutation({
    mutationFn: (materialId: string) => api.post(`/materials/${materialId}/favorite`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyMaterials'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to toggle favorite');
    },
  });

  const handleOpenMaterial = async (id: string, mode: 'preview' | 'download') => {
    try {
      const response = await api.get(`/materials/${id}/${mode}`);
      const { url } = response.data;
      if (url) {
        Linking.openURL(url);
      } else {
        Alert.alert('Unavailable', 'Preview link could not be generated.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Access denied');
    }
  };

  const materials = materialsRes?.data || [];
  const categories = categoriesRes || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>DIGITAL LIBRARY</Text>
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'ALL' }, ...categories]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedCategory;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? colors.primaryText : colors.text,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {item.name.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Materials List */}
      <FlatList
        data={materials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO STUDY MATERIALS DEPLOYED FOR YOUR BATCH yet.
            </Text>
          ) : null
        }
        renderItem={({ item }: any) => {
          const isFav = item.favorites?.length > 0; // Check if favorited by current student

          return (
            <View style={[styles.materialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.titleCol}>
                  <Text style={[styles.materialTitle, { color: colors.text }]}>
                    {item.title.toUpperCase()}
                  </Text>
                  <Text style={[styles.materialSub, { color: colors.textMuted }]}>
                    {item.subject?.name} | {item.category?.name || 'Notes'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => favoriteMutation.mutate(item.id)}>
                  <Text style={{ fontSize: 18, color: colors.accent }}>
                    {isFav ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.description, { color: colors.text }]}>
                {item.description || 'No summary description available for this asset.'}
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={() => handleOpenMaterial(item.id, 'preview')}
                  style={[styles.actionBtn, { borderColor: colors.accent }]}
                >
                  <Text style={[styles.actionText, { color: colors.accent }]}>PREVIEW</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleOpenMaterial(item.id, 'download')}
                  style={[styles.actionBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.actionText, { color: colors.text }]}>DOWNLOAD</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
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
  filterContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    height: 48,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
    height: 36,
  },
  filterText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  listContent: {
    padding: spacing.md,
  },
  materialCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#3E4640',
    paddingBottom: spacing.xs,
  },
  titleCol: {
    flex: 0.9,
  },
  materialTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
  },
  materialSub: {
    fontSize: 9,
    marginTop: 2,
  },
  description: {
    fontSize: typography.sizes.xs,
    marginVertical: spacing.md,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
  },
  actionText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
