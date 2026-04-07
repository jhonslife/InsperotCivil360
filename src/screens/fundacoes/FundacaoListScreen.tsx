import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Fundacao } from '../../models/Fundacao';
import { getAllFundacoes } from '../../database/repositories/fundacaoRepository';
import { formatDate } from '../../utils/formatDate';
import { FUNDACAO_TIPO_LABELS } from '../../constants/fundacaoTypes';

const STATUS_LABELS: Record<string, string> = {
  em_execucao: 'Em Execução',
  concluida: 'Concluída',
  com_nc: 'Com NC',
};

export function FundacaoListScreen() {
  const [fundacoes, setFundacoes] = useState<Fundacao[]>([]);
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      loadFundacoes();
    }, [])
  );

  const loadFundacoes = async () => {
    const data = await getAllFundacoes();
    setFundacoes(data);
  };

  const renderItem = ({ item }: { item: Fundacao }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FundacaoForm', { fundacaoId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons name="arrow-down-bold" size={22} color={COLORS.surface} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{FUNDACAO_TIPO_LABELS[item.tipo]}</Text>
          <Text style={styles.cardSubtitle}>{(item as any).obra_nome || 'Obra'}</Text>
        </View>
        <StatusBadge status={item.status} label={STATUS_LABELS[item.status] || item.status} />
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="calendar" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.data)}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="ruler" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Ø{item.diametro}mm / {item.profundidade_projeto}m</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Fundações"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <FlatList
        data={fundacoes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="arrow-down-bold" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>Nenhuma fundação registrada</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('FundacaoForm', {})}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={COLORS.surface} />
      </TouchableOpacity>
    </SafeAreaView>
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
  empty: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.xl },
  emptyText: { ...FONTS.medium, color: COLORS.textSecondary, marginTop: SPACING.md },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', ...SHADOWS.medium },
});
