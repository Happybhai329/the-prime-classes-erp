import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../state/useAuthStore';
import { api } from '../../api/client';
import { theme, spacing, typography } from '../../theme/colors';

export const LeaderboardScreen = () => {
  const { themeMode } = useAuthStore();
  const colors = theme[themeMode];

  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  // 1. Fetch published tests list
  const { data: testsRes } = useQuery({
    queryKey: ['publishedTests'],
    queryFn: () => api.get('/tests', { params: { status: 'PUBLISHED' } }).then((res) => res.data),
  });

  const testsList = testsRes?.data || [];

  // Set first test as default
  React.useEffect(() => {
    if (testsList.length > 0 && !selectedTestId) {
      setSelectedTestId(testsList[0].id);
    }
  }, [testsList]);

  // 2. Fetch Merit List for selected test
  const { data: meritListRes, isLoading: loadingMerit } = useQuery({
    queryKey: ['meritList', selectedTestId],
    queryFn: () => api.get(`/tests/${selectedTestId}/merit-list`).then((res) => res.data),
    enabled: !!selectedTestId,
  });

  const meritItems = meritListRes?.items || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>LEADERBOARD</Text>
      </View>

      {/* Test Selector Tabs */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          data={testsList}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedTestId;
            return (
              <TouchableOpacity
                onPress={() => setSelectedTestId(item.id)}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
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

      {/* Ranks List */}
      {loadingMerit ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={meritItems}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {selectedTestId ? 'NO RANKINGS COMPUTED FOR THIS TEST.' : 'SELECT A TEST RECORD.'}
            </Text>
          }
          renderItem={({ item }: any) => {
            const isTop3 = item.rank <= 3;
            const getRankBadgeStyle = () => {
              if (item.rank === 1) return { color: '#D4AF37', borderColor: '#D4AF37' }; // Gold
              if (item.rank === 2) return { color: '#C0C0C0', borderColor: '#C0C0C0' }; // Silver
              if (item.rank === 3) return { color: '#CD7F32', borderColor: '#CD7F32' }; // Bronze
              return { color: colors.text, borderColor: colors.border };
            };

            return (
              <View style={[styles.rankRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.leftCol}>
                  <View style={[styles.rankCircle, getRankBadgeStyle()]}>
                    <Text style={[styles.rankNum, { color: getRankBadgeStyle().color }]}>
                      {item.rank}
                    </Text>
                  </View>
                  <View style={styles.details}>
                    <Text style={[styles.studentName, { color: colors.text }]}>
                      {item.studentName.toUpperCase()}
                    </Text>
                    <Text style={[styles.rollNum, { color: colors.textMuted }]}>
                      ROLL: {item.rollNumber} | {item.batchName}
                    </Text>
                  </View>
                </View>
                <View style={styles.rightCol}>
                  <Text style={[styles.scoreText, { color: colors.accent }]}>
                    {item.marksObtained}
                  </Text>
                  <Text style={[styles.pctText, { color: colors.textMuted }]}>
                    {Math.round(item.percentage)}%
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
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
  tabContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    height: 48,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: spacing.sm,
    justifyContent: 'center',
    height: 36,
  },
  tabText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  listContent: {
    padding: spacing.md,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1.5,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.75,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rankNum: {
    fontWeight: typography.weights.heavy,
    fontSize: typography.sizes.sm,
  },
  details: {
    flex: 1,
  },
  studentName: {
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.sm,
    letterSpacing: 0.5,
  },
  rollNum: {
    fontSize: 9,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    flex: 0.25,
  },
  scoreText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.heavy,
  },
  pctText: {
    fontSize: 9,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
