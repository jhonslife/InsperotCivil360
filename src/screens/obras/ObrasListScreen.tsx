import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Obra } from '../../models/Obra';
import { getAllObras } from '../../database/repositories/obraRepository';
import { formatDate } from '../../utils/formatDate';
import { OBRA_STATUS_LABELS } from '../../constants/inspectionTypes';

export function ObrasListScreen() {
  const [obras, setObras] = useState<Obra[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadObras();
    }, [])
  );

  const loadObras = async () => {
    const data = await getAllObras();
    setObras(data);
  };

  const renderItem = ({ item }: { item: Obra }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ObraForm', { obraId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="office-building" size={24} color={COLORS.surface} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardSubtitle}>{item.local}</Text>
        </View>
        <StatusBadge status={item.status} label={OBRA_STATUS_LABELS[item.status]} />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="account" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.cliente}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="tag" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.tipo}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.data_inicio)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Obras" />
      <FlatList
        data={obras}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="office-building-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhuma obra cadastrada</Text>
            <Text style={styles.emptySubtext}>Toque no + para adicionar</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ObraForm', {})}
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
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...FONTS.bold,
    fontSize: 15,
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
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    ...FONTS.small,
    fontSize: 12,
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
  emptySubtext: {
    ...FONTS.small,
    marginTop: SPACING.xs,
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
