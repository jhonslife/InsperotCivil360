import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { VedacaoInspecao } from '../../models/VedacaoInspecao';
import { getAllVedacaoInspecoes } from '../../database/repositories/vedacaoRepository';
import { formatDate } from '../../utils/formatDate';

const VEDACAO_LABELS: Record<string, string> = {
  alvenaria: 'Alvenaria',
  drywall: 'Drywall',
};

export function VedacaoListScreen() {
  const [itens, setItens] = useState<VedacaoInspecao[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadItens();
    }, [])
  );

  const loadItens = async () => {
    const data = await getAllVedacaoInspecoes();
    setItens(data);
  };

  const countConformes = (item: VedacaoInspecao): number => {
    const checks = [
      item.material_conforme, item.base_nivelada, item.prumo_alinhamento_ok,
      item.junta_adequada, item.amarracao_ok, item.vergas_contravergas_ok,
      item.fixacao_adequada, item.ausencia_trincas, item.limpeza_ok,
    ];
    return checks.filter((c) => c === 1).length;
  };

  const renderItem = ({ item }: { item: VedacaoInspecao }) => {
    const conformes = countConformes(item);
    const total = 9;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('VedacaoForm', { vedacaoId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="wall" size={22} color={COLORS.surface} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{VEDACAO_LABELS[item.tipo_vedacao] || item.tipo_vedacao}</Text>
            <Text style={styles.cardSubtitle}>{(item as any).obra_nome || 'Obra'}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: conformes === total ? COLORS.success : COLORS.warning }]}>
            <Text style={styles.badgeText}>{conformes}/{total}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{formatDate(item.data)}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText} numberOfLines={1}>{item.local_descricao}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Vedação"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <FlatList
        data={itens}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="wall" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhuma inspeção de vedação</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('VedacaoForm', {})}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.surface} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: 100 },
  card: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  cardTitle: { ...FONTS.bold, fontSize: 15 },
  cardSubtitle: { ...FONTS.regular, fontSize: 13, color: COLORS.textSecondary },
  cardDetails: { flexDirection: 'row', marginTop: SPACING.sm, gap: SPACING.md },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { ...FONTS.regular, fontSize: 12, color: COLORS.textSecondary },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  badgeText: { ...FONTS.bold, fontSize: 12, color: COLORS.surface },
  empty: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.xl },
  emptyText: { ...FONTS.medium, color: COLORS.textSecondary, marginTop: SPACING.md },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
});
