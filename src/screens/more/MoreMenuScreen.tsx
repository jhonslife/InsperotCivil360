import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/Header';

const menuItems = [
  { title: 'RNC', subtitle: 'Registros de Não Conformidade', icon: '⚠️', screen: 'RNCList' },
  { title: 'Diário de Obra', subtitle: 'Registros diários', icon: '📓', screen: 'DiaryList' },
  { title: 'Relatórios', subtitle: 'Gerar relatórios PDF', icon: '📊', screen: 'Reports' },
];

export function MoreMenuScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Header title="Mais" />
      <ScrollView contentContainerStyle={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  icon: {
    fontSize: 28,
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
