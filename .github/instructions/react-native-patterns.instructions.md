---
applyTo: '**/*.tsx'
---

# React Native Component Patterns — Inspetor Civil 360

## Regras Core

- Componentes funcionais com arrow functions APENAS
- Props interface definida e exportada
- Hooks no topo do componente
- Early returns para loading/error states
- StyleSheet.create no final do arquivo (NUNCA inline styles)
- NUNCA TailwindCSS, NativeWind ou CSS-in-JS
- SEMPRE usar COLORS de src/constants/theme.ts
- SEMPRE SafeAreaView como container de tela

## Template de Tela

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { Header } from '../components/Header';

interface NomeTelaScreenProps {
  // navigation e route props via React Navigation
}

export const NomeTelaScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TipoEntidade[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await repository.getAll();
      setData(result);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Título" />
        <View style={styles.centered}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Título" />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* conteúdo do card */}
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
```

## Estado Global

```tsx
// ✅ Context + useReducer (OBRIGATÓRIO)
import { useApp } from '../contexts/AppContext';
const { state, dispatch } = useApp();

// ❌ PROIBIDO: Redux, Zustand, MobX
```

## Formulários

```tsx
// ✅ Usar componentes reutilizáveis existentes
import { FormField } from '../components/FormField';
import { SelectField } from '../components/SelectField';
import { DatePickerField } from '../components/DatePickerField';
import { PhotoPicker } from '../components/PhotoPicker';
import { SignatureCapture } from '../components/SignatureCapture';
import { ChecklistItemRow } from '../components/ChecklistItemRow';

// Validação inline com state
const [errors, setErrors] = useState<Record<string, string>>({});
```

## Navegação

```tsx
// ✅ React Navigation v7
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ❌ PROIBIDO: expo-router, useRouter
```
