import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { getAllConcretoInspecoes } from '../../database/repositories/concretoRepository';
import { getAllArmaduraInspecoes } from '../../database/repositories/armaduraRepository';
import { getAllFormaInspecoes } from '../../database/repositories/formaRepository';
import { getAllRompimentosCP } from '../../database/repositories/rompimentoCPRepository';
import { ConcretoInspecao } from '../../models/ConcretoInspecao';
import { ArmaduraInspecao } from '../../models/ArmaduraInspecao';
import { FormaInspecao } from '../../models/FormaInspecao';
import { RompimentoCP } from '../../models/RompimentoCP';
import { formatDate } from '../../utils/formatDate';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  screen: 'ConcretoForm' | 'ArmaduraForm' | 'FormaForm' | 'RompimentoCPForm';
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: 'concreto', label: 'Concreto', icon: 'cube-outline', screen: 'ConcretoForm', description: 'Inspeção de concretagem' },
  { key: 'armadura', label: 'Armadura', icon: 'pipe', screen: 'ArmaduraForm', description: 'Inspeção de armadura' },
  { key: 'forma', label: 'Formas', icon: 'shape-outline', screen: 'FormaForm', description: 'Inspeção de formas e escoramentos' },
  { key: 'rompimento', label: 'Rompimento CP', icon: 'hammer', screen: 'RompimentoCPForm', description: 'Rompimento de corpos de prova' },
];

export function ConcretoListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const obraId = route.params?.obraId;
  const [concretoItems, setConcretoItems] = useState<ConcretoInspecao[]>([]);
  const [armaduraItems, setArmaduraItems] = useState<ArmaduraInspecao[]>([]);
  const [formaItems, setFormaItems] = useState<FormaInspecao[]>([]);
  const [rompimentoItems, setRompimentoItems] = useState<RompimentoCP[]>([]);

  const loadData = useCallback(async () => {
    const [concreto, armadura, formas, rompimentos] = await Promise.all([
      getAllConcretoInspecoes(),
      getAllArmaduraInspecoes(),
      getAllFormaInspecoes(),
      getAllRompimentosCP(),
    ]);

    setConcretoItems(concreto);
    setArmaduraItems(armadura);
    setFormaItems(formas);
    setRompimentoItems(rompimentos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredConcretoItems = useMemo(
    () => (obraId ? concretoItems.filter((item) => item.obra_id === obraId) : concretoItems),
    [concretoItems, obraId]
  );
  const filteredArmaduraItems = useMemo(
    () => (obraId ? armaduraItems.filter((item) => item.obra_id === obraId) : armaduraItems),
    [armaduraItems, obraId]
  );
  const filteredFormaItems = useMemo(
    () => (obraId ? formaItems.filter((item) => item.obra_id === obraId) : formaItems),
    [formaItems, obraId]
  );
  const filteredRompimentoItems = useMemo(
    () => (obraId ? rompimentoItems.filter((item) => item.obra_id === obraId) : rompimentoItems),
    [rompimentoItems, obraId]
  );

  const renderMenuCard = (item: MenuItem) => (
    <TouchableOpacity
      key={item.key}
      style={styles.menuCard}
      onPress={() => navigation.navigate(item.screen, obraId ? { obraId } : {})}
      activeOpacity={0.7}
    >
      <View style={styles.menuIcon}>
        <MaterialCommunityIcons name={item.icon as any} size={28} color={COLORS.surface} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuLabel}>{item.label}</Text>
        <Text style={styles.menuDesc}>{item.description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderHistoryCard = (
    key: string,
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void
  ) => (
    <TouchableOpacity key={key} style={styles.historyCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.historyIcon}>
        <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.surface} />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{title}</Text>
        <Text style={styles.historySubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="pencil-outline" size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );

  const renderSection = (title: string, emptyText: string, content: React.ReactNode[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {content.length > 0 ? content : <Text style={styles.emptySection}>{emptyText}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Concreto e Estrutura"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Novo registro</Text>
        {MENU_ITEMS.map(renderMenuCard)}

        {renderSection(
          'Histórico de concretagem',
          'Nenhum registro de concreto disponível.',
          filteredConcretoItems.map((item) =>
            renderHistoryCard(
              item.id,
              'cube-outline',
              item.obra_nome || 'Concretagem',
              `${formatDate(item.data)} • ${item.elemento}`,
              () => navigation.navigate('ConcretoForm', { concretoId: item.id, obraId: item.obra_id })
            )
          )
        )}

        {renderSection(
          'Histórico de armadura',
          'Nenhum registro de armadura disponível.',
          filteredArmaduraItems.map((item) =>
            renderHistoryCard(
              item.id,
              'pipe',
              item.obra_nome || 'Armadura',
              `${formatDate(item.data)} • ${item.elemento}`,
              () => navigation.navigate('ArmaduraForm', { armaduraId: item.id, obraId: item.obra_id })
            )
          )
        )}

        {renderSection(
          'Histórico de formas',
          'Nenhum registro de formas disponível.',
          filteredFormaItems.map((item) =>
            renderHistoryCard(
              item.id,
              'shape-outline',
              item.obra_nome || 'Forma',
              `${formatDate(item.data)} • ${item.elemento}`,
              () => navigation.navigate('FormaForm', { formaId: item.id, obraId: item.obra_id })
            )
          )
        )}

        {renderSection(
          'Rompimentos de CP',
          'Nenhum rompimento de corpo de prova disponível.',
          filteredRompimentoItems.map((item) =>
            renderHistoryCard(
              item.id,
              'hammer',
              item.obra_nome || 'Rompimento CP',
              `${formatDate(item.data)} • ${item.idade} dias • ${item.resistencia} MPa`,
              () => navigation.navigate('RompimentoCPForm', { rompimentoId: item.id, obraId: item.obra_id })
            )
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingBottom: SPACING.xl },
  section: { marginTop: SPACING.md },
  sectionTitle: { ...FONTS.bold, fontSize: 16, marginBottom: SPACING.md, color: COLORS.text },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.small },
  menuIcon: { width: 48, height: 48, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuInfo: { flex: 1 },
  menuLabel: { ...FONTS.bold, fontSize: 15 },
  menuDesc: { ...FONTS.regular, fontSize: 13, color: COLORS.textSecondary },
  historyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.sm, ...SHADOWS.small },
  historyIcon: { width: 40, height: 40, borderRadius: BORDER_RADIUS.md, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  historyInfo: { flex: 1 },
  historyTitle: { ...FONTS.bold, fontSize: 14, color: COLORS.text },
  historySubtitle: { ...FONTS.regular, fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  emptySection: { ...FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.sm },
});
