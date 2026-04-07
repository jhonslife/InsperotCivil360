import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
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
            <Text style={styles.appName}>INSPETOR CIVIL 360</Text>
            <Text style={styles.appSubtitle}>by Prof. Jose Vital</Text>
          </View>
          <MaterialCommunityIcons name="bell-outline" size={24} color={COLORS.surface} />
        </View>

        <Text style={styles.greeting}>Bem-vindo, {state.userName}!</Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard value={state.obrasAtivas} label="Obras Ativas" />
          <StatCard value={state.inspecoesHoje} label="Inspeções Hoje" />
          <StatCard value={state.ncAbertas} label="Não Conformidades" />
          <StatCard value={state.fundacoesEmExecucao} label="Fundações em Execução" />
          <StatCard value={state.ensaiosPavNC} label="Ensaios Pav. NC" />
          <StatCard value={state.cpNaoConformes} label="CP com NC" />
        </View>
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
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.surface,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#B0C4DE',
    fontStyle: 'italic',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: SPACING.sm,
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
});
