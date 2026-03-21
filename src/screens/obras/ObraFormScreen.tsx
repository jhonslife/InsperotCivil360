import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { FormNotice } from '../../components/FormNotice';
import { FormSection } from '../../components/FormSection';
import { SelectField } from '../../components/SelectField';
import { DatePickerField } from '../../components/DatePickerField';
import { createObra, getObraById, updateObra } from '../../database/repositories/obraRepository';
import { OBRA_TIPOS, OBRA_STATUS_LABELS, ObraTipo, ObraStatus } from '../../constants/inspectionTypes';
import { todayISO } from '../../utils/formatDate';
import { validateRequired } from '../../utils/validators';

export function ObraFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const obraId = route.params?.obraId;
  const isEditing = !!obraId;

  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [cliente, setCliente] = useState('');
  const [tipo, setTipo] = useState<string>('');
  const [dataInicio, setDataInicio] = useState(todayISO());
  const [responsavel, setResponsavel] = useState('');
  const [status, setStatus] = useState<string>('ativa');
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const loadObra = useCallback(async () => {
    const obra = await getObraById(obraId);
    if (obra) {
      setNome(obra.nome);
      setLocal(obra.local);
      setCliente(obra.cliente);
      setTipo(obra.tipo);
      setDataInicio(obra.data_inicio);
      setResponsavel(obra.responsavel_tecnico);
      setStatus(obra.status);
    }
  }, [obraId]);

  useEffect(() => {
    if (isEditing) {
      loadObra();
    }
  }, [isEditing, loadObra]);

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      nome: validateRequired(nome, 'Nome da obra'),
      local: validateRequired(local, 'Local'),
      cliente: validateRequired(cliente, 'Cliente'),
      tipo: validateRequired(tipo, 'Tipo'),
      responsavel: validateRequired(responsavel, 'Responsável técnico'),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== null);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (isEditing) {
        await updateObra(obraId, {
          nome,
          local,
          cliente,
          tipo: tipo as ObraTipo,
          data_inicio: dataInicio,
          responsavel_tecnico: responsavel,
          status: status as ObraStatus,
        });
        Alert.alert('Sucesso', 'Obra atualizada com sucesso!');
      } else {
        await createObra({
          nome,
          local,
          cliente,
          tipo: tipo as ObraTipo,
          data_inicio: dataInicio,
          responsavel_tecnico: responsavel,
        });
        Alert.alert('Sucesso', 'Obra cadastrada com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      Alert.alert('Erro', 'Erro ao salvar obra. Tente novamente.');
    }
  };

  const tipoOptions = OBRA_TIPOS.map((t) => ({ value: t, label: t }));
  const statusOptions = Object.entries(OBRA_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Editar Obra' : 'Nova Obra'}
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FormNotice
          title={isEditing ? 'Edição em andamento' : 'Cadastro de obra'}
          message={isEditing
            ? 'Revise os dados e salve as alterações para atualizar a obra ativa.'
            : 'Preencha os dados principais da obra para liberar os demais fluxos do aplicativo.'}
        />

        <FormSection title="Dados principais" description="Essas informações identificam e classificam a obra.">
          <FormField
            label="Nome da Obra"
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Ponte Viaduto XP-107"
            error={errors.nome}
          />
          <FormField
            label="Local"
            value={local}
            onChangeText={setLocal}
            placeholder="Ex: Km 35 - SP-280"
            error={errors.local}
          />
          <FormField
            label="Cliente"
            value={cliente}
            onChangeText={setCliente}
            placeholder="Ex: Construtora ABC"
            error={errors.cliente}
          />
          <SelectField
            label="Tipo da Obra"
            value={tipo}
            options={tipoOptions}
            onSelect={setTipo}
            error={errors.tipo}
          />
          <DatePickerField
            label="Data de Início"
            value={dataInicio}
            onChange={setDataInicio}
          />
          <FormField
            label="Responsável Técnico"
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Ex: Eng. José Vital"
            error={errors.responsavel}
          />
        </FormSection>

        {isEditing && (
          <FormSection title="Status" description="Use o status para refletir a situação atual da obra.">
            <SelectField
              label="Status"
              value={status}
              options={statusOptions}
              onSelect={setStatus}
            />
          </FormSection>
        )}

        <FormSection title="Ações" description="Salve para aplicar os dados informados à obra.">
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Salvar alterações' : 'Salvar obra'}
            </Text>
          </TouchableOpacity>
        </FormSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
