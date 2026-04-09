import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { StatCard } from '../components/StatCard';
import { MenuButton } from '../components/MenuButton';
import { useApp } from '../contexts/AppContext';
import { BottomTabParamList } from '../navigation/types';

export function HomeScreen() {
  const { state, refreshStats } = useApp();
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList, 'HomeTab'>>();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appSubtitle}>INSPETOR CIVIL 360</Text>
            <Text style={styles.greeting}>Bem-vindo, {state.userName}!</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.surface} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard value={state.obrasAtivas} label="Obras" icon="office-building" color="#0EA5E9" />
          <StatCard value={state.inspecoesHoje} label="Hoje" icon="clipboard-check" color="#10B981" />
          <StatCard value={state.ncAbertas} label="N.C." icon="alert-circle" color="#EF4444" />
          <StatCard value={state.fundacoesEmExecucao} label="Fundações" icon="home-variant" color="#8B5CF6" />
          <StatCard value={state.ensaiosPavNC} label="Ensaios" icon="test-tube" color="#F59E0B" />
          <StatCard value={state.cpNaoConformes} label="CP NC" icon="flask" color="#EC4899" />
        </View>

        {state.obrasAtivas === 0 && (
          <TouchableOpacity 
            style={styles.noObraLanding}
            onPress={() => navigation.navigate('ObrasTab', { screen: 'ObraForm' })}
            activeOpacity={0.9}
          >
            <View style={styles.noObraIcon}>
              <MaterialCommunityIcons name="plus-circle" size={32} color={COLORS.accent} />
            </View>
            <View style={styles.noObraContent}>
              <Text style={styles.noObraTitle}>Comece agora!</Text>
              <Text style={styles.noObraText}>
                Clique aqui para cadastrar sua primeira obra e liberar todos os recursos.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Menu */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.menuGrid}>
          <MenuButton
            icon="office-building"
            label="Obras"
            onPress={() => navigation.navigate('ObrasTab', { screen: 'ObrasList' })}
          />
          <MenuButton
            icon="clipboard-check"
            label="Nova Inspeção"
            onPress={() => navigation.navigate('InspectionTab', { screen: 'InspectionType' })}
            color={COLORS.accent}
          />
          <MenuButton
            icon="alert-circle"
            label="Não Conformidades"
            onPress={() => navigation.navigate('MoreTab', { screen: 'RNCList' })}
          />
          <MenuButton
            icon="test-tube"
            label="Ensaios"
            onPress={() => navigation.navigate('EnsaiosTab', { screen: 'EnsaioList' })}
          />
          <MenuButton
            icon="book-open-variant"
            label="Diário de Obra"
            onPress={() => navigation.navigate('MoreTab', { screen: 'DiaryList' })}
          />
          <MenuButton
            icon="file-document"
            label="Relatórios"
            onPress={() => navigation.navigate('MoreTab', { screen: 'Reports' })}
          />
        </View>

        <Text style={styles.sectionTitle}>Módulos Especializados</Text>
        <View style={styles.menuGrid}>
          <MenuButton
            icon="home-foundation"
            label="Fundações"
            onPress={() => navigation.navigate('InspectionTab', { screen: 'FundacaoList' })}
          />
          <MenuButton
            icon="pillar"
            label="Concreto"
            onPress={() => navigation.navigate('InspectionTab', { screen: 'ConcretoList' })}
          />
          <MenuButton
            icon="wall"
            label="Vedação"
            onPress={() => navigation.navigate('InspectionTab', { screen: 'VedacaoList' })}
          />
          <MenuButton
            icon="road"
            label="Pavimentação"
            onPress={() => navigation.navigate('InspectionTab', { screen: 'PavimentacaoList' })}
          />
          <MenuButton
            icon="flask"
            label="Rompimento CP"
            onPress={() => navigation.navigate('EnsaiosTab', { screen: 'RompimentoCPForm' })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.surface,
    marginTop: 4,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  noObraLanding: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
    ...SHADOWS.medium,
  },
  noObraIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  noObraContent: {
    flex: 1,
  },
  noObraTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  noObraText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  noObraWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.4)',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noObraWarningText: {
    color: '#FEF3C7',
    fontSize: 12,
    marginLeft: SPACING.xs,
    flex: 1,
    fontWeight: '600',
  },
});
