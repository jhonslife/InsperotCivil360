import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Ensaio } from '../../models/Ensaio';
import { getAllEnsaios } from '../../database/repositories/ensaioRepository';
import { formatDate } from '../../utils/formatDate';
import { ENSAIO_TYPE_LABELS } from '../../constants/inspectionTypes';

export function EnsaioListScreen() {
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadEnsaios();
    }, [])
  );

  const loadEnsaios = async () => {
    const data = await getAllEnsaios();
    setEnsaios(data);
  };

  const renderItem = ({ item }: { item: Ensaio }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EnsaioForm', { ensaioId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="test-tube" size={22} color={COLORS.surface} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{ENSAIO_TYPE_LABELS[item.tipo_ensaio]}</Text>
          <Text style={styles.cardSubtitle}>{item.obra_nome || 'Obra'}</Text>
        </View>
        <StatusBadge
          status={item.situacao}
          label={item.situacao === 'conforme' ? 'Conforme' : 'Não Conforme'}
        />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.data)}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{item.local}</Text>
        </View>
      </View>
      {item.alerta ? (
        <View style={styles.alertBox}>
          <MaterialCommunityIcons name="alert" size={16} color={COLORS.warning} />
          <Text style={styles.alertText}>{item.alerta}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Ensaios" />
      <FlatList
        data={ensaios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="test-tube-off" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhum ensaio registrado</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('EnsaioForm', {})}
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
    backgroundColor: '#7C3AED',
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
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  alertText: {
    fontSize: 11,
    color: '#92400E',
    flex: 1,
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
