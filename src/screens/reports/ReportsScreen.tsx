import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Inspection } from '../../models/Inspection';
import { RNC } from '../../models/RNC';
import { Ensaio } from '../../models/Ensaio';
import { DiaryEntry } from '../../models/DiaryEntry';
import { Fundacao } from '../../models/Fundacao';
import { ConcretoInspecao } from '../../models/ConcretoInspecao';
import { ArmaduraInspecao } from '../../models/ArmaduraInspecao';
import { FormaInspecao } from '../../models/FormaInspecao';
import { VedacaoInspecao } from '../../models/VedacaoInspecao';
import { PavimentacaoInspecao } from '../../models/PavimentacaoInspecao';
import { RompimentoCP } from '../../models/RompimentoCP';
import { getAllInspections, getInspectionReportData } from '../../database/repositories/inspectionRepository';
import { getAllRNCs } from '../../database/repositories/rncRepository';
import { getAllEnsaios } from '../../database/repositories/ensaioRepository';
import { getAllDiaryEntries } from '../../database/repositories/diaryRepository';
import { getAllFundacoes, getDadosTecnicos, getFundacaoChecklistItems } from '../../database/repositories/fundacaoRepository';
import { getAllConcretoInspecoes } from '../../database/repositories/concretoRepository';
import { getAllArmaduraInspecoes } from '../../database/repositories/armaduraRepository';
import { getAllFormaInspecoes } from '../../database/repositories/formaRepository';
import { getAllVedacaoInspecoes } from '../../database/repositories/vedacaoRepository';
import { getAllPavInspecoes, getPavChecklistItems, getPavEnsaiosByInspecao } from '../../database/repositories/pavimentacaoRepository';
import { getAllRompimentosCP } from '../../database/repositories/rompimentoCPRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import {
  generateInspectionPDF,
  generateRNCPDF,
  generateEnsaioPDF,
  generateDiaryPDF,
  generateFundacaoPDF,
  generateConcretoPDF,
  generateArmaduraPDF,
  generateFormaPDF,
  generateVedacaoPDF,
  generatePavimentacaoPDF,
  generateRompimentoCPPDF,
} from '../../services/pdfService';
import { getPhotoBase64 } from '../../services/photoService';
import { INSPECTION_TYPE_LABELS, ENSAIO_TYPE_LABELS, EnsaioTipo } from '../../constants/inspectionTypes';
import { CAMADA_LABELS } from '../../constants/pavimentacaoTypes';
import { FUNDACAO_TIPO_LABELS } from '../../constants/fundacaoTypes';
import { formatDate } from '../../utils/formatDate';

type ReportTab =
  | 'inspection'
  | 'fundacao'
  | 'concreto'
  | 'armadura'
  | 'forma'
  | 'vedacao'
  | 'pavimentacao'
  | 'rompimento'
  | 'rnc'
  | 'ensaio'
  | 'diary';

interface TabConfig {
  key: ReportTab;
  label: string;
  icon: string;
}

const TABS: TabConfig[] = [
  { key: 'inspection', label: 'Inspeções', icon: 'clipboard-check-outline' },
  { key: 'fundacao', label: 'Fundações', icon: 'home-foundation' },
  { key: 'concreto', label: 'Concreto', icon: 'cube-outline' },
  { key: 'armadura', label: 'Armadura', icon: 'pipe' },
  { key: 'forma', label: 'Formas', icon: 'shape-outline' },
  { key: 'vedacao', label: 'Vedação', icon: 'wall' },
  { key: 'pavimentacao', label: 'Pavimentação', icon: 'road-variant' },
  { key: 'rompimento', label: 'Rompimento CP', icon: 'hammer' },
  { key: 'rnc', label: 'RNCs', icon: 'alert-circle-outline' },
  { key: 'ensaio', label: 'Ensaios', icon: 'test-tube' },
  { key: 'diary', label: 'Diário', icon: 'book-open-page-variant-outline' },
];

export function ReportsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<ReportTab>('inspection');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [fundacoes, setFundacoes] = useState<Fundacao[]>([]);
  const [concretos, setConcretos] = useState<ConcretoInspecao[]>([]);
  const [armaduras, setArmaduras] = useState<ArmaduraInspecao[]>([]);
  const [formas, setFormas] = useState<FormaInspecao[]>([]);
  const [vedacoes, setVedacoes] = useState<VedacaoInspecao[]>([]);
  const [pavimentacoes, setPavimentacoes] = useState<PavimentacaoInspecao[]>([]);
  const [rompimentos, setRompimentos] = useState<RompimentoCP[]>([]);
  const [rncs, setRNCs] = useState<RNC[]>([]);
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [generating, setGenerating] = useState(false);

  const loadData = useCallback(async () => {
    const modules = [
      { name: 'inspecoes', promise: getAllInspections() },
      { name: 'fundacoes', promise: getAllFundacoes() },
      { name: 'concretos', promise: getAllConcretoInspecoes() },
      { name: 'armaduras', promise: getAllArmaduraInspecoes() },
      { name: 'formas', promise: getAllFormaInspecoes() },
      { name: 'vedacoes', promise: getAllVedacaoInspecoes() },
      { name: 'pavimentacao', promise: getAllPavInspecoes() },
      { name: 'rompimentos_cp', promise: getAllRompimentosCP() },
      { name: 'rncs', promise: getAllRNCs() },
      { name: 'ensaios', promise: getAllEnsaios() },
      { name: 'diario', promise: getAllDiaryEntries() },
    ];

    const results = await Promise.allSettled(modules.map((module) => module.promise));

    const getResolvedValue = <T,>(index: number, fallback: T): T => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        return result.value as T;
      }

      console.warn(`Falha ao carregar dados de ${modules[index].name} na central de relatórios.`, result.reason);
      return fallback;
    };

    setInspections(getResolvedValue<Inspection[]>(0, []));
    setFundacoes(getResolvedValue<Fundacao[]>(1, []));
    setConcretos(getResolvedValue<ConcretoInspecao[]>(2, []));
    setArmaduras(getResolvedValue<ArmaduraInspecao[]>(3, []));
    setFormas(getResolvedValue<FormaInspecao[]>(4, []));
    setVedacoes(getResolvedValue<VedacaoInspecao[]>(5, []));
    setPavimentacoes(getResolvedValue<PavimentacaoInspecao[]>(6, []));
    setRompimentos(getResolvedValue<RompimentoCP[]>(7, []));
    setRNCs(getResolvedValue<RNC[]>(8, []));
    setEnsaios(getResolvedValue<Ensaio[]>(9, []));
    setDiaries(getResolvedValue<DiaryEntry[]>(10, []));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const withGenerationGuard = async (callback: () => Promise<void>) => {
    if (generating) return;
    setGenerating(true);
    try {
      await callback();
    } catch {
      Alert.alert('Erro', 'Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateInspectionPDF = async (item: Inspection) => {
    await withGenerationGuard(async () => {
      const reportData = await getInspectionReportData(item.id);
      if (!reportData) {
        Alert.alert('Erro', 'Inspeção não encontrada.');
        return;
      }

      const photos = await getPhotosByEntity('inspection', item.id);
      const signatureBase64 = reportData.inspection.assinatura_path
        ? await getPhotoBase64(reportData.inspection.assinatura_path)
        : null;

      await generateInspectionPDF(reportData.inspection, reportData.checklistItems, photos, signatureBase64);
    });
  };

  const handleGenerateFundacaoPDF = async (item: Fundacao) => {
    await withGenerationGuard(async () => {
      const [dadosTecnicos, checklistItems, photos] = await Promise.all([
        getDadosTecnicos(item.id),
        getFundacaoChecklistItems(item.id),
        getPhotosByEntity('fundacao', item.id),
      ]);
      const signatureBase64 = item.assinatura_path ? await getPhotoBase64(item.assinatura_path) : null;
      await generateFundacaoPDF(item, dadosTecnicos, checklistItems, photos, signatureBase64);
    });
  };

  const handleGenerateConcretoPDF = async (item: ConcretoInspecao) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('concreto', item.id);
      const signatureBase64 = item.assinatura_path ? await getPhotoBase64(item.assinatura_path) : null;
      await generateConcretoPDF(item, photos, signatureBase64);
    });
  };

  const handleGenerateArmaduraPDF = async (item: ArmaduraInspecao) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('armadura', item.id);
      await generateArmaduraPDF(item, photos);
    });
  };

  const handleGenerateFormaPDF = async (item: FormaInspecao) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('formas', item.id);
      await generateFormaPDF(item, photos);
    });
  };

  const handleGenerateVedacaoPDF = async (item: VedacaoInspecao) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('vedacao', item.id);
      const signatureBase64 = item.assinatura_path ? await getPhotoBase64(item.assinatura_path) : null;
      await generateVedacaoPDF(item, photos, signatureBase64);
    });
  };

  const handleGeneratePavimentacaoPDF = async (item: PavimentacaoInspecao) => {
    await withGenerationGuard(async () => {
      const [checklistItems, ensaiosRelacionados, photos] = await Promise.all([
        getPavChecklistItems(item.id),
        getPavEnsaiosByInspecao(item.id),
        getPhotosByEntity('pavimentacao', item.id),
      ]);
      const signatureBase64 = item.assinatura_path ? await getPhotoBase64(item.assinatura_path) : null;
      await generatePavimentacaoPDF(item, ensaiosRelacionados, checklistItems, photos, signatureBase64);
    });
  };

  const handleGenerateRompimentoPDF = async (item: RompimentoCP) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('rompimento_cp', item.id);
      await generateRompimentoCPPDF(item, photos);
    });
  };

  const handleGenerateRNCPDF = async (item: RNC) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('rnc', item.id);
      await generateRNCPDF(item, photos);
    });
  };

  const handleGenerateEnsaioPDF = async (item: Ensaio) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('ensaio', item.id);
      await generateEnsaioPDF(item, photos);
    });
  };

  const handleGenerateDiaryPDF = async (item: DiaryEntry) => {
    await withGenerationGuard(async () => {
      const photos = await getPhotosByEntity('diary', item.id);
      await generateDiaryPDF(item, photos);
    });
  };

  const activeConfig = (() => {
    switch (activeTab) {
      case 'inspection':
        return {
          data: inspections,
          renderTitle: (item: Inspection) => INSPECTION_TYPE_LABELS[item.tipo],
          renderSubtitle: (item: Inspection) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: Inspection) => `Status: ${item.status}`,
          onPress: handleGenerateInspectionPDF,
        };
      case 'fundacao':
        return {
          data: fundacoes,
          renderTitle: (item: Fundacao) => FUNDACAO_TIPO_LABELS[item.tipo],
          renderSubtitle: (item: Fundacao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: Fundacao) => `Ø ${item.diametro} mm • ${item.status}`,
          onPress: handleGenerateFundacaoPDF,
        };
      case 'concreto':
        return {
          data: concretos,
          renderTitle: (item: ConcretoInspecao) => `Concreto • ${item.elemento}`,
          renderSubtitle: (item: ConcretoInspecao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: ConcretoInspecao) => `fck ${item.fck_projeto} MPa`,
          onPress: handleGenerateConcretoPDF,
        };
      case 'armadura':
        return {
          data: armaduras,
          renderTitle: (item: ArmaduraInspecao) => `Armadura • ${item.elemento}`,
          renderSubtitle: (item: ArmaduraInspecao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: ArmaduraInspecao) => item.diametro != null ? `Ø ${item.diametro} mm` : 'Sem diâmetro',
          onPress: handleGenerateArmaduraPDF,
        };
      case 'forma':
        return {
          data: formas,
          renderTitle: (item: FormaInspecao) => `Forma • ${item.elemento}`,
          renderSubtitle: (item: FormaInspecao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: () => 'Pré-concretagem',
          onPress: handleGenerateFormaPDF,
        };
      case 'vedacao':
        return {
          data: vedacoes,
          renderTitle: (item: VedacaoInspecao) => `Vedação • ${item.tipo_vedacao}`,
          renderSubtitle: (item: VedacaoInspecao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: VedacaoInspecao) => item.local_descricao,
          onPress: handleGenerateVedacaoPDF,
        };
      case 'pavimentacao':
        return {
          data: pavimentacoes,
          renderTitle: (item: PavimentacaoInspecao) => `Pavimentação • ${CAMADA_LABELS[item.camada]}`,
          renderSubtitle: (item: PavimentacaoInspecao) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: PavimentacaoInspecao) => item.trecho,
          onPress: handleGeneratePavimentacaoPDF,
        };
      case 'rompimento':
        return {
          data: rompimentos,
          renderTitle: (item: RompimentoCP) => `Rompimento CP • ${item.idade} dias`,
          renderSubtitle: (item: RompimentoCP) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: RompimentoCP) => `${item.resistencia} MPa`,
          onPress: handleGenerateRompimentoPDF,
        };
      case 'rnc':
        return {
          data: rncs,
          renderTitle: (item: RNC) => `RNC #${item.numero}`,
          renderSubtitle: (item: RNC) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: RNC) => item.descricao,
          onPress: handleGenerateRNCPDF,
        };
      case 'ensaio':
        return {
          data: ensaios,
          renderTitle: (item: Ensaio) => ENSAIO_TYPE_LABELS[item.tipo_ensaio as EnsaioTipo],
          renderSubtitle: (item: Ensaio) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: Ensaio) => item.local,
          onPress: handleGenerateEnsaioPDF,
        };
      case 'diary':
        return {
          data: diaries,
          renderTitle: () => 'Diário de Obra',
          renderSubtitle: (item: DiaryEntry) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: DiaryEntry) => item.atividades,
          onPress: handleGenerateDiaryPDF,
        };
      default:
        return {
          data: inspections,
          renderTitle: (item: Inspection) => INSPECTION_TYPE_LABELS[item.tipo],
          renderSubtitle: (item: Inspection) => `${formatDate(item.data)} • ${item.obra_nome || 'Obra'}`,
          renderDetail: (item: Inspection) => item.status,
          onPress: handleGenerateInspectionPDF,
        };
    }
  })();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Relatórios"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={tab.icon as any} size={18} color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={activeConfig.data as any[]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={styles.reportCardContent}>
              <Text style={styles.reportTitle}>{activeConfig.renderTitle(item)}</Text>
              <Text style={styles.reportDate}>{activeConfig.renderSubtitle(item)}</Text>
              <Text style={styles.reportDetail} numberOfLines={2}>{activeConfig.renderDetail(item)}</Text>
            </View>
            <TouchableOpacity style={styles.pdfBtn} onPress={() => activeConfig.onPress(item)} disabled={generating}>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color={COLORS.surface} />
              <Text style={styles.pdfBtnText}>PDF</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum registro encontrado para este módulo</Text>
          </View>
        }
        contentContainerStyle={activeConfig.data.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '12',
  },
  tabLabel: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyList: {
    flex: 1,
    padding: SPACING.md,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  reportCardContent: {
    flex: 1,
  },
  reportTitle: {
    ...FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
  },
  reportDate: {
    ...FONTS.medium,
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  reportDetail: {
    ...FONTS.regular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  pdfBtnText: {
    ...FONTS.bold,
    color: COLORS.surface,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xl,
  },
  emptyText: {
    ...FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
