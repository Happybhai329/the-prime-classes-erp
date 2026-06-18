import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const NoticesScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const { data: noticesRes, isLoading } = useQuery({
    queryKey: ['noticesList'],
    queryFn: () => api.get('/notices').then((res) => res.data),
  });

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { color: colors.error, borderColor: colors.error };
      case 'HIGH':
        return { color: colors.warning, borderColor: colors.warning };
      case 'MEDIUM':
        return { color: colors.accent, borderColor: colors.accent };
      case 'LOW':
      default:
        return { color: colors.textMuted, borderColor: colors.border };
    }
  };

  const notices = noticesRes || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>SYSTEM bulletins</Text>
      </View>

      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              NO CENTRAL BULLETINS LOGGED IN CONTROLLING UNIT.
            </Text>
          ) : null
        }
        renderItem={({ item }: any) => {
          const priorityStyle = getPriorityStyle(item.priority);

          return (
            <View style={[styles.noticeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.noticeTitle, { color: colors.text }]}>
                  {item.title.toUpperCase()}
                </Text>
                <Text style={[styles.badge, priorityStyle]}>
                  {item.priority}
                </Text>
              </View>

              <Text style={[styles.bodyText, { color: colors.text }]}>
                {item.description}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  ISSUED BY: {item.createdByName || 'ERP Core'}
                </Text>
                <Text style={[styles.footerText, { color: colors.accent }]}>
                  {new Date(item.publishDate).toLocaleDateString()}
                </Text>
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
  listContent: {
    padding: spacing.md,
  },
  noticeCard: {
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
    marginBottom: spacing.sm,
  },
  noticeTitle: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
    flex: 0.75,
  },
  badge: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    borderWidth: 1.5,
    paddingVertical: 1,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bodyText: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
