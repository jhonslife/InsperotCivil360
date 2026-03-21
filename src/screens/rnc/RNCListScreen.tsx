import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { SeverityBadge } from '../../components/SeverityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { RNC } from '../../models/RNC';
import { getAllRNCs } from '../../database/repositories/rncRepository';
import { formatDate } from '../../utils/formatDate';

const RNC_STATUS_LABELS: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em Andamento',
  fechada: 'Fechada',
};

export function RNCListScreen() {
  const [rncs, setRNCs] = useState<RNC[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadRNCs();
    }, [])
  );

  const loadRNCs = async () => {
    const data = await getAllRNCs();
    setRNCs(data);
  };

  const renderItem = ({ item }: { item: RNC }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RNCForm', { rncId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.rncNumber}>
          <Text style={styles.rncNumberText}>RNC</Text>
          <Text style={styles.rncNumberValue}>#{String(item.numero).padStart(3, '0')}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.descricao}</Text>
          <Text style={styles.cardSubtitle}>{item.obra_nome || 'Obra'}</Text>
        </View>
        <SeverityBadge gravidade={item.gravidade} />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.data)}</Text>
        </View>
        <StatusBadge status={item.status} label={RNC_STATUS_LABELS[item.status] || item.status} />
        {item.responsavel ? (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="account" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.responsavel}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Não Conformidades"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <FlatList
        data={rncs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="alert-circle-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhuma NC registrada</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('RNCForm', {})}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rncNumber: {
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  rncNumberText: {
    fontSize: 10,
    color: COLORS.error,
    fontWeight: '600',
  },
  rncNumberValue: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 14,
  },
  cardSubtitle: {
    ...FONTS.small,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...FONTS.small,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
});
