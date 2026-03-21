import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Inspection } from '../../models/Inspection';
import { getAllInspections } from '../../database/repositories/inspectionRepository';
import { formatDate } from '../../utils/formatDate';
import { INSPECTION_TYPE_LABELS } from '../../constants/inspectionTypes';

const STATUS_LABELS: Record<string, string> = {
  conforme: 'Conforme',
  nao_conforme: 'Não Conforme',
  pendente: 'Pendente',
};

export function InspectionListScreen() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadInspections();
    }, [])
  );

  const loadInspections = async () => {
    const data = await getAllInspections();
    setInspections(data);
  };

  const renderItem = ({ item }: { item: Inspection }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InspectionForm', { inspectionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: COLORS.accent }]}>
          <MaterialCommunityIcons name="clipboard-check" size={22} color={COLORS.surface} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>
            {INSPECTION_TYPE_LABELS[item.tipo]}
          </Text>
          <Text style={styles.cardSubtitle}>{item.obra_nome || 'Obra'}</Text>
        </View>
        <StatusBadge status={item.status} label={STATUS_LABELS[item.status] || item.status} />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.data)}</Text>
        </View>
        {item.local_descricao ? (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.local_descricao}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Inspeções" />
      <FlatList
        data={inspections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhuma inspeção realizada</Text>
            <Text style={styles.emptySubtext}>Toque no + para iniciar</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('InspectionType')}
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
