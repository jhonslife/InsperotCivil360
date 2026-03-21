import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { DiaryEntry } from '../../models/DiaryEntry';
import { Obra } from '../../models/Obra';
import { getAllDiaryEntries } from '../../database/repositories/diaryRepository';
import { getObraById } from '../../database/repositories/obraRepository';
import { CLIMA_ICONS } from '../../constants/inspectionTypes';
import { formatDate } from '../../utils/formatDate';

interface DiaryWithObra extends DiaryEntry {
  obraNome?: string;
}

export function DiaryListScreen() {
  const navigation = useNavigation<any>();
  const [entries, setEntries] = useState<DiaryWithObra[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    const all = await getAllDiaryEntries();
    const withObra: DiaryWithObra[] = await Promise.all(
      all.map(async (entry) => {
        const obra = await getObraById(entry.obra_id);
        return { ...entry, obraNome: obra?.nome || 'Obra não encontrada' };
      })
    );
    setEntries(withObra);
  };

  const renderItem = ({ item }: { item: DiaryWithObra }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DiaryForm', { diaryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.climaIcon}>
            {CLIMA_ICONS[item.clima as keyof typeof CLIMA_ICONS] || '☁️'}
          </Text>
          <Text style={styles.dateText}>{formatDate(item.data)}</Text>
        </View>
      </View>
      <Text style={styles.obraName}>{item.obraNome}</Text>
      {item.equipe && (
        <Text style={styles.detailText}>👷 Equipe: {item.equipe}</Text>
      )}
      <Text style={styles.atividadeText} numberOfLines={2}>
        {item.atividades}
      </Text>
      {item.ocorrencias && (
        <View style={styles.ocorrenciaTag}>
          <Text style={styles.ocorrenciaText}>📋 Tem ocorrências</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📓</Text>
      <Text style={styles.emptyText}>Nenhum registro no diário</Text>
      <Text style={styles.emptySubtext}>Adicione o primeiro registro</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Diário de Obra"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={entries.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('DiaryForm')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  climaIcon: {
    fontSize: 20,
    marginRight: SPACING.xs,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  obraName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  atividadeText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ocorrenciaTag: {
    marginTop: SPACING.xs,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  ocorrenciaText: {
    fontSize: 12,
    color: '#92400E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 28,
    color: COLORS.surface,
    fontWeight: '600',
    marginTop: -2,
  },
});
