import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Inspection } from '../../models/Inspection';
import { RNC } from '../../models/RNC';
import { Ensaio } from '../../models/Ensaio';
import { DiaryEntry } from '../../models/DiaryEntry';
import { getAllInspections } from '../../database/repositories/inspectionRepository';
import { getAllRNCs } from '../../database/repositories/rncRepository';
import { getAllEnsaios } from '../../database/repositories/ensaioRepository';
import { getAllDiaryEntries } from '../../database/repositories/diaryRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { generateInspectionPDF, generateRNCPDF, generateEnsaioPDF, generateDiaryPDF } from '../../services/pdfService';
import { INSPECTION_TYPE_LABELS, ENSAIO_TYPE_LABELS, EnsaioTipo } from '../../constants/inspectionTypes';
import { formatDate } from '../../utils/formatDate';

type TabType = 'inspection' | 'rnc' | 'ensaio' | 'diary';

export function ReportsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabType>('inspection');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [rncs, setRNCs] = useState<RNC[]>([]);
  const [ensaios, setEnsaios] = useState<Ensaio[]>([]);
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [generating, setGenerating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [ins, rn, en, di] = await Promise.all([
      getAllInspections(),
      getAllRNCs(),
      getAllEnsaios(),
      getAllDiaryEntries(),
    ]);
    setInspections(ins);
    setRNCs(rn);
    setEnsaios(en);
    setDiaries(di);
  };

  const handleGenerateInspectionPDF = async (item: Inspection) => {
    if (generating) return;
    setGenerating(true);
    try {
      const photos = await getPhotosByEntity('inspection', item.id);
      await generateInspectionPDF(item, [], photos, null);
    } catch {
      Alert.alert('Erro', 'Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateRNCPDF = async (item: RNC) => {
    if (generating) return;
    setGenerating(true);
    try {
      const photos = await getPhotosByEntity('rnc', item.id);
      await generateRNCPDF(item, photos);
    } catch {
      Alert.alert('Erro', 'Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateEnsaioPDF = async (item: Ensaio) => {
    if (generating) return;
    setGenerating(true);
    try {
      const photos = await getPhotosByEntity('ensaio', item.id);
      await generateEnsaioPDF(item, photos);
    } catch {
      Alert.alert('Erro', 'Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateDiaryPDF = async (item: DiaryEntry) => {
    if (generating) return;
    setGenerating(true);
    try {
      const photos = await getPhotosByEntity('diary', item.id);
      await generateDiaryPDF(item, photos);
    } catch {
      Alert.alert('Erro', 'Erro ao gerar PDF.');
    } finally {
      setGenerating(false);
    }
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'inspection', label: 'Inspeções', icon: '📋' },
    { key: 'rnc', label: 'RNCs', icon: '⚠️' },
    { key: 'ensaio', label: 'Ensaios', icon: '🧪' },
    { key: 'diary', label: 'Diário', icon: '📓' },
  ];

  const renderInspectionItem = ({ item }: { item: Inspection }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportCardContent}>
        <Text style={styles.reportTitle}>
          {INSPECTION_TYPE_LABELS[item.tipo as keyof typeof INSPECTION_TYPE_LABELS]}
        </Text>
        <Text style={styles.reportDate}>{formatDate(item.data)}</Text>
        <Text style={styles.reportDetail}>
          Status: {item.status === 'conforme' ? 'Conforme' : item.status === 'nao_conforme' ? 'Não Conforme' : 'Pendente'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={() => handleGenerateInspectionPDF(item)}
        disabled={generating}
      >
        <Text style={styles.pdfBtnText}>📄 PDF</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRNCItem = ({ item }: { item: RNC }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportCardContent}>
        <Text style={styles.reportTitle}>RNC #{item.numero}</Text>
        <Text style={styles.reportDate}>{formatDate(item.data)}</Text>
        <Text style={styles.reportDetail}>{item.descricao?.substring(0, 50)}...</Text>
      </View>
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={() => handleGenerateRNCPDF(item)}
        disabled={generating}
      >
        <Text style={styles.pdfBtnText}>📄 PDF</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEnsaioItem = ({ item }: { item: Ensaio }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportCardContent}>
        <Text style={styles.reportTitle}>
          {ENSAIO_TYPE_LABELS[item.tipo_ensaio as EnsaioTipo]}
        </Text>
        <Text style={styles.reportDate}>{formatDate(item.data)}</Text>
        <Text style={styles.reportDetail}>{item.local}</Text>
      </View>
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={() => handleGenerateEnsaioPDF(item)}
        disabled={generating}
      >
        <Text style={styles.pdfBtnText}>📄 PDF</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDiaryItem = ({ item }: { item: DiaryEntry }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportCardContent}>
        <Text style={styles.reportTitle}>Diário de Obra</Text>
        <Text style={styles.reportDate}>{formatDate(item.data)}</Text>
        <Text style={styles.reportDetail} numberOfLines={1}>{item.atividades}</Text>
      </View>
      <TouchableOpacity
        style={styles.pdfBtn}
        onPress={() => handleGenerateDiaryPDF(item)}
        disabled={generating}
      >
        <Text style={styles.pdfBtnText}>📄 PDF</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
    </View>
  );

  const getActiveData = () => {
    switch (activeTab) {
      case 'inspection': return { data: inspections, renderItem: renderInspectionItem };
      case 'rnc': return { data: rncs, renderItem: renderRNCItem };
      case 'ensaio': return { data: ensaios, renderItem: renderEnsaioItem };
      case 'diary': return { data: diaries, renderItem: renderDiaryItem };
    }
  };

  const active = getActiveData();

  return (
    <View style={styles.container}>
      <Header
        title="Relatórios"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={active.data as any[]}
        keyExtractor={(item) => item.id}
        renderItem={active.renderItem as any}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={active.data.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '15',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reportCardContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  reportDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pdfBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
  },
  pdfBtnText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
