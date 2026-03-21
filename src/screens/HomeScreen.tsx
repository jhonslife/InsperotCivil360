import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { StatCard } from '../components/StatCard';
import { MenuButton } from '../components/MenuButton';
import { useApp } from '../contexts/AppContext';

export function HomeScreen() {
  const { state, refreshStats } = useApp();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      refreshStats();
    }, [refreshStats])
  );

  return (
    <View style={styles.container}>
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
        <View style={styles.statsRow}>
          <StatCard value={state.obrasAtivas} label="Obras Ativas" />
          <StatCard value={state.inspecoesHoje} label="Inspeções Hoje" />
          <StatCard value={state.ncAbertas} label="Não Conformidades" />
        </View>
      </View>

      {/* Menu */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuGrid}>
          <MenuButton
            icon="office-building"
            label="Obras"
            onPress={() => navigation.navigate('ObrasTab')}
          />
          <MenuButton
            icon="clipboard-check"
            label="Nova Inspeção"
            onPress={() => navigation.navigate('InspectionTab')}
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
            onPress={() => navigation.navigate('EnsaiosTab')}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
