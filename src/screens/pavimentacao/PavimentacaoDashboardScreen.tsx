import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { getPavDashboardStats } from '../../database/repositories/pavimentacaoRepository';
import { MoreStackParamList } from '../../navigation/types';

interface PavimentacaoDashboardState {
  percentualCompactacaoConforme: number;
  totalEnsaiosRealizados: number;
  ncPorTrecho: { trecho: string; count: number }[];
}

const initialState: PavimentacaoDashboardState = {
  percentualCompactacaoConforme: 0,
  totalEnsaiosRealizados: 0,
  ncPorTrecho: [],
};

export function PavimentacaoDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList, 'PavimentacaoDashboard'>>();
  const [stats, setStats] = useState<PavimentacaoDashboardState>(initialState);

  const loadStats = useCallback(async () => {
    const data = await getPavDashboardStats();
    setStats(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Dashboard Pavimentação"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('MoreMenu')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <StatCard value={stats.percentualCompactacaoConforme} label="Compactação Conforme (%)" />
          <StatCard value={stats.totalEnsaiosRealizados} label="Ensaios Realizados" />
          <StatCard value={stats.ncPorTrecho.length} label="Trechos com NC" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Não conformidades por trecho</Text>
          {stats.ncPorTrecho.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="check-circle-outline" size={48} color={COLORS.success} />
              <Text style={styles.emptyText}>Nenhum trecho com NC de compactação no momento</Text>
            </View>
          ) : (
            stats.ncPorTrecho.map((item) => (
              <View key={item.trecho} style={styles.card}>
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons name="road-variant" size={22} color={COLORS.surface} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.trecho || 'Trecho não informado'}</Text>
                  <Text style={styles.cardSubtitle}>{item.count} ocorrência(s) registrada(s)</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  emptyText: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  cardSubtitle: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
