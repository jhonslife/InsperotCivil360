import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { PavimentacaoInspecao } from '../../models/PavimentacaoInspecao';
import { PavimentacaoEnsaio } from '../../models/PavimentacaoEnsaio';
import { getAllPavEnsaios, getAllPavInspecoes } from '../../database/repositories/pavimentacaoRepository';
import { formatDate } from '../../utils/formatDate';
import { CAMADA_LABELS, PAV_ENSAIO_LABELS } from '../../constants/pavimentacaoTypes';

export function PavimentacaoListScreen() {
  const [inspecoes, setInspecoes] = useState<PavimentacaoInspecao[]>([]);
  const [ensaios, setEnsaios] = useState<PavimentacaoEnsaio[]>([]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const obraId = route.params?.obraId;

  const loadData = useCallback(async () => {
    const [pavInspecoes, pavEnsaios] = await Promise.all([
      getAllPavInspecoes(),
      getAllPavEnsaios(),
    ]);
    setInspecoes(pavInspecoes);
    setEnsaios(pavEnsaios);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredInspecoes = useMemo(
    () => (obraId ? inspecoes.filter((item) => item.obra_id === obraId) : inspecoes),
    [inspecoes, obraId]
  );
  const filteredEnsaios = useMemo(
    () => (obraId ? ensaios.filter((item) => item.obra_id === obraId) : ensaios),
    [ensaios, obraId]
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Pavimentação"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('PavimentacaoForm', obraId ? { obraId } : {})}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={18} color={COLORS.surface} />
            <Text style={styles.actionButtonText}>Nova Inspeção</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={() => navigation.navigate('PavEnsaioForm', obraId ? { obraId } : {})}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="flask-outline" size={18} color={COLORS.surface} />
            <Text style={styles.actionButtonText}>Novo Ensaio</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dashboardCard}
          onPress={() => navigation.navigate('MoreTab', { screen: 'PavimentacaoDashboard' })}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chart-line" size={22} color={COLORS.primary} />
          <Text style={styles.dashboardText}>Abrir dashboard de pavimentação</Text>
          <MaterialCommunityIcons name="chevron-right" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Inspeções</Text>
        {filteredInspecoes.length > 0 ? filteredInspecoes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('PavimentacaoForm', { inspecaoId: item.id, obraId: item.obra_id })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons name="road-variant" size={22} color={COLORS.surface} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{CAMADA_LABELS[item.camada]}</Text>
                <Text style={styles.cardSubtitle}>{(item as any).obra_nome || 'Obra'} — {item.trecho}</Text>
              </View>
              <StatusBadge
                status={item.compactacao_ok === 1 ? 'conforme' : 'nao_conforme'}
                label={item.compactacao_ok === 1 ? 'OK' : 'NC'}
              />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>{formatDate(item.data)}</Text>
              {item.km_inicio ? <Text style={styles.detailText}>{item.km_inicio} a {item.km_fim}</Text> : null}
            </View>
          </TouchableOpacity>
        )) : <Text style={styles.emptyText}>Nenhuma inspeção de pavimentação.</Text>}

        <Text style={styles.sectionTitle}>Ensaios de pavimentação</Text>
        {filteredEnsaios.length > 0 ? filteredEnsaios.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('PavEnsaioForm', { ensaioId: item.id, obraId: item.obra_id, inspecaoId: item.pavimentacao_inspecao_id || undefined })}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, styles.secondaryIcon]}>
                <MaterialCommunityIcons name="flask-outline" size={22} color={COLORS.surface} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{PAV_ENSAIO_LABELS[item.tipo_ensaio]}</Text>
                <Text style={styles.cardSubtitle}>{(item as any).obra_nome || 'Obra'} — {item.trecho}</Text>
              </View>
              <StatusBadge
                status={item.conforme === 1 ? 'conforme' : 'nao_conforme'}
                label={item.conforme === 1 ? 'OK' : 'NC'}
              />
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>{formatDate(item.data)}</Text>
              <Text style={styles.detailText}>{item.resultado != null ? `${item.resultado} ${item.unidade}` : 'Sem resultado'}</Text>
            </View>
          </TouchableOpacity>
        )) : <Text style={styles.emptyText}>Nenhum ensaio de pavimentação.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  actionButton: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: SPACING.xs, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.sm, ...SHADOWS.small },
  secondaryAction: { backgroundColor: COLORS.secondary },
  actionButtonText: { ...FONTS.bold, color: COLORS.surface, fontSize: 13 },
  dashboardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.small },
  dashboardText: { ...FONTS.bold, flex: 1, marginLeft: SPACING.sm, color: COLORS.text },
  sectionTitle: { ...FONTS.bold, fontSize: 16, color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.sm },
  card: { backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.small },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  secondaryIcon: { backgroundColor: COLORS.secondary },
  cardInfo: { flex: 1 },
  cardTitle: { ...FONTS.bold, fontSize: 15 },
  cardSubtitle: { ...FONTS.regular, fontSize: 13, color: COLORS.textSecondary },
  cardDetails: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  detailText: { ...FONTS.regular, fontSize: 12, color: COLORS.textSecondary },
  emptyText: { ...FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.sm },
});
