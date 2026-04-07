import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { SelectField } from '../../components/SelectField';
import { InspectionType, INSPECTION_TYPE_LABELS, INSPECTION_TYPE_ICONS } from '../../constants/inspectionTypes';
import { Obra } from '../../models/Obra';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { BottomTabParamList, InspectionStackParamList } from '../../navigation/types';

type InspectionTypeNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<InspectionStackParamList, 'InspectionType'>,
  BottomTabNavigationProp<BottomTabParamList>
>;

export function InspectionTypeScreen() {
  const navigation = useNavigation<InspectionTypeNavigationProp>();
  const [selectedObra, setSelectedObra] = useState('');
  const [obras, setObras] = useState<Obra[]>([]);

  const loadObras = useCallback(async () => {
    const data = await getActiveObras();
    setObras(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadObras();
    }, [loadObras])
  );

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));

  const types: InspectionType[] = ['fundacao_rasa', 'fundacao_profunda', 'bloco_coroamento', 'estrutura', 'oae', 'pavimentacao', 'vedacao'];

  const handleSelect = (tipo: InspectionType) => {
    if (!selectedObra) {
      return;
    }

    switch (tipo) {
      case 'fundacao_profunda':
        navigation.navigate('FundacaoForm', { obraId: selectedObra });
        return;
      case 'estrutura':
        navigation.navigate('ConcretoList', { obraId: selectedObra });
        return;
      case 'pavimentacao':
        navigation.navigate('PavimentacaoForm', { obraId: selectedObra });
        return;
      case 'vedacao':
        navigation.navigate('VedacaoForm', { obraId: selectedObra });
        return;
      default:
        navigation.navigate('InspectionForm', {
          tipo,
          obraId: selectedObra,
        });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Nova Inspeção"
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <View style={styles.content}>
        <SelectField
          label="Selecione a Obra"
          value={selectedObra}
          options={obraOptions}
          onSelect={setSelectedObra}
          error={!selectedObra && obras.length > 0 ? 'Selecione uma obra para continuar' : null}
        />

        {obras.length === 0 && (
          <View style={styles.noObras}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={COLORS.warning} />
            <Text style={styles.noObrasText}>Nenhuma obra ativa cadastrada</Text>
            <TouchableOpacity
              style={styles.createObraButton}
              onPress={() => navigation.navigate('ObrasTab', { screen: 'ObraForm' })}
            >
              <Text style={styles.createObraText}>Cadastrar Obra</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedObra !== '' && (
          <>
            <Text style={styles.sectionTitle}>Tipo de Inspeção</Text>
            {types.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={styles.typeCard}
                onPress={() => handleSelect(tipo)}
                activeOpacity={0.7}
              >
                <View style={styles.typeIcon}>
                  <MaterialCommunityIcons
                    name={INSPECTION_TYPE_ICONS[tipo] as any}
                    size={28}
                    color={COLORS.surface}
                  />
                </View>
                <Text style={styles.typeLabel}>{INSPECTION_TYPE_LABELS[tipo]}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
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
  sectionTitle: {
    ...FONTS.bold,
    fontSize: 16,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  typeLabel: {
    ...FONTS.medium,
    flex: 1,
    fontSize: 15,
  },
  noObras: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noObrasText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  createObraButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  createObraText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
