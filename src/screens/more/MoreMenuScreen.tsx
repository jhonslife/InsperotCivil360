import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { MoreStackParamList } from '../../navigation/types';

const menuItems = [
  { title: 'RNC', subtitle: 'Registros de Não Conformidade', icon: 'alert-circle-outline', screen: 'RNCList' },
  { title: 'Diário de Obra', subtitle: 'Registros diários', icon: 'book-open-page-variant-outline', screen: 'DiaryList' },
  { title: 'Relatórios', subtitle: 'Gerar relatórios PDF', icon: 'file-chart-outline', screen: 'Reports' },
  { title: 'Dashboard Pavimentação', subtitle: 'Indicadores por trecho e camada', icon: 'road-variant', screen: 'PavimentacaoDashboard' },
] as const;

export function MoreMenuScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>>();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mais" />
      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={item.icon} size={28} color={COLORS.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 48,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300',
  },
});
