import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { Obra } from '../../models/Obra';
import { PavimentacaoInspecao } from '../../models/PavimentacaoInspecao';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createPavEnsaio, getAllPavInspecoes, getPavEnsaioById, updatePavEnsaio } from '../../database/repositories/pavimentacaoRepository';
import { formatDate, todayISO } from '../../utils/formatDate';
import { CAMADA_LABELS, PAV_ENSAIO_LABELS, PAV_ENSAIO_UNIDADES } from '../../constants/pavimentacaoTypes';
import { verificarNCPavimentacaoEnsaio } from '../../services/ncAutomaticaService';

const ENSAIO_OPTIONS = Object.entries(PAV_ENSAIO_LABELS).map(([value, label]) => ({ value, label }));

function parseDecimalInput(value: string): number {
  return Number(value.replace(',', '.').trim());
}

export function PavEnsaioFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const ensaioId = route.params?.ensaioId;
  const paramObraId = route.params?.obraId;
  const paramInspecaoId = route.params?.inspecaoId;
  const isEditing = !!ensaioId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [inspecoes, setInspecoes] = useState<PavimentacaoInspecao[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [inspecaoId, setInspecaoId] = useState(paramInspecaoId || '');
  const [data, setData] = useState(todayISO());
  const [trecho, setTrecho] = useState('');
  const [tipoEnsaio, setTipoEnsaio] = useState('grau_compactacao');
  const [resultado, setResultado] = useState('');
  const [conforme, setConforme] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    const [obrasData, inspecoesData] = await Promise.all([
      getActiveObras(),
      getAllPavInspecoes(),
    ]);
    setObras(obrasData);
    setInspecoes(inspecoesData);
  }, []);

  const loadEnsaio = useCallback(async () => {
    if (!ensaioId) return;
    const e = await getPavEnsaioById(ensaioId);
    if (!e) return;
    setObraId(e.obra_id); setData(e.data); setTrecho(e.trecho);
    setInspecaoId(e.pavimentacao_inspecao_id ?? '');
    setTipoEnsaio(e.tipo_ensaio);
    setResultado(e.resultado != null ? String(e.resultado) : '');
    setConforme(e.conforme); setObservacoes(e.observacoes);
  }, [ensaioId]);

  useFocusEffect(useCallback(() => { loadOptions(); if (isEditing) loadEnsaio(); }, [isEditing, loadEnsaio, loadOptions]));

  const filteredInspecoes = useMemo(
    () => inspecoes.filter((item) => !obraId || item.obra_id === obraId),
    [inspecoes, obraId]
  );

  const inspecaoOptions = useMemo(
    () => filteredInspecoes.map((item) => ({
      value: item.id,
      label: `${CAMADA_LABELS[item.camada]} • ${item.trecho} • ${formatDate(item.data)}`,
    })),
    [filteredInspecoes]
  );

  useEffect(() => {
    if (inspecaoId && !filteredInspecoes.some((item) => item.id === inspecaoId)) {
      setInspecaoId('');
    }
  }, [filteredInspecoes, inspecaoId]);

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!inspecaoId) { Alert.alert('Erro', 'Selecione a inspeção de pavimentação vinculada ao ensaio.'); return; }
    if (!trecho.trim()) { Alert.alert('Erro', 'Informe o trecho.'); return; }

    const resultadoValue = resultado ? parseDecimalInput(resultado) : null;
    if (resultado && !Number.isFinite(resultadoValue)) {
      Alert.alert('Erro', 'Informe um valor numérico válido para o resultado do ensaio.');
      return;
    }

    setSaving(true);
    try {
      const unidade = PAV_ENSAIO_UNIDADES[tipoEnsaio as keyof typeof PAV_ENSAIO_UNIDADES] || '';
      const input = {
        obra_id: obraId,
        pavimentacao_inspecao_id: inspecaoId,
        data, trecho, tipo_ensaio: tipoEnsaio as any,
        resultado: resultadoValue,
        unidade, conforme, observacoes,
      };
      if (isEditing) { await updatePavEnsaio(ensaioId!, input); }
      else {
        const newId = await createPavEnsaio(input);
        if (conforme === 0) {
          await verificarNCPavimentacaoEnsaio({
            obra_id: obraId,
            ensaio_id: newId,
            responsavel: '',
            trecho,
            tipo_ensaio: PAV_ENSAIO_LABELS[tipoEnsaio as keyof typeof PAV_ENSAIO_LABELS],
            resultado: resultadoValue,
          });
        }
      }
      if (isEditing && conforme === 0) {
        await verificarNCPavimentacaoEnsaio({
          obra_id: obraId,
          ensaio_id: ensaioId!,
          responsavel: '',
          trecho,
          tipo_ensaio: PAV_ENSAIO_LABELS[tipoEnsaio as keyof typeof PAV_ENSAIO_LABELS],
          resultado: resultadoValue,
        });
      }
      Alert.alert('Sucesso', isEditing ? 'Ensaio atualizado.' : 'Ensaio registrado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch { Alert.alert('Erro', 'Não foi possível salvar.'); } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={isEditing ? 'Editar Ensaio Pav.' : 'Novo Ensaio Pav.'} showBack onBack={() => navigation.goBack()} showHome onHome={() => navigation.navigate('HomeTab')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados do Ensaio">
          <SelectField label="Obra" value={obraId} options={obras.map((o) => ({ value: o.id, label: o.nome }))} onSelect={setObraId} />
          <SelectField label="Inspeção vinculada" value={inspecaoId} options={inspecaoOptions} onSelect={setInspecaoId} />
          {inspecaoOptions.length === 0 ? <Text style={styles.helperText}>Cadastre uma inspeção de pavimentação para vincular este ensaio ao relatório consolidado.</Text> : null}
          <SelectField label="Tipo de Ensaio" value={tipoEnsaio} options={ENSAIO_OPTIONS} onSelect={setTipoEnsaio} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Trecho" value={trecho} onChangeText={setTrecho} />
          <FormField label={`Resultado (${PAV_ENSAIO_UNIDADES[tipoEnsaio as keyof typeof PAV_ENSAIO_UNIDADES] || ''})`} value={resultado} onChangeText={setResultado} keyboardType="numeric" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Conforme</Text>
            <Switch value={conforme === 1} onValueChange={(v) => setConforme(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} />
          </View>
        </FormSection>
        <FormSection title="Observações">
          <FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />
        </FormSection>
        <TouchableOpacity style={[styles.submitButton, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
          <Text style={styles.submitButtonText}>{saving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Registrar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  helperText: { ...FONTS.regular, fontSize: 12, color: COLORS.textSecondary, marginBottom: SPACING.md },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  switchLabel: { ...FONTS.regular, fontSize: 14, flex: 1, marginRight: SPACING.sm },
  submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.lg },
  submitButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.surface },
});
