import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { FormNotice } from '../../components/FormNotice';
import { Obra } from '../../models/Obra';
import { ConcretoInspecao } from '../../models/ConcretoInspecao';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { getAllConcretoInspecoes } from '../../database/repositories/concretoRepository';
import { createRompimentoCP, getRompimentoCPById, updateRompimentoCP } from '../../database/repositories/rompimentoCPRepository';
import { verificarNCRompimentoCP } from '../../services/ncAutomaticaService';
import { formatDate, todayISO } from '../../utils/formatDate';

const IDADE_OPTIONS = [
  { value: '7', label: '7 dias' },
  { value: '14', label: '14 dias' },
  { value: '28', label: '28 dias' },
];

function parseDecimalInput(value: string): number {
  return Number(value.replace(',', '.').trim());
}

export function RompimentoCPFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const rompimentoId = route.params?.rompimentoId;
  const paramObraId = route.params?.obraId;
  const paramConcretoId = route.params?.concretoInspecaoId;
  const isEditing = !!rompimentoId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [concretagens, setConcretagens] = useState<ConcretoInspecao[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [concretoInspecaoId, setConcretoInspecaoId] = useState(paramConcretoId || '');
  const [data, setData] = useState(todayISO());
  const [idade, setIdade] = useState('28');
  const [resistencia, setResistencia] = useState('');
  const [fckProjeto, setFckProjeto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    const [obrasData, concretagensData] = await Promise.all([
      getActiveObras(),
      getAllConcretoInspecoes(),
    ]);
    setObras(obrasData);
    setConcretagens(concretagensData);
  }, []);

  const loadRompimento = useCallback(async () => {
    if (!rompimentoId) return;
    const r = await getRompimentoCPById(rompimentoId);
    if (!r) return;
    setObraId(r.obra_id); setData(r.data); setIdade(String(r.idade));
    setConcretoInspecaoId(r.concreto_inspecao_id ?? '');
    setResistencia(String(r.resistencia)); setFckProjeto(String(r.fck_projeto));
    setObservacoes(r.observacoes);
  }, [rompimentoId]);

  useFocusEffect(useCallback(() => { loadOptions(); if (isEditing) loadRompimento(); }, [isEditing, loadOptions, loadRompimento]));

  const filteredConcretagens = useMemo(
    () => concretagens.filter((item) => !obraId || item.obra_id === obraId),
    [concretagens, obraId]
  );

  const concretagemOptions = useMemo(
    () => filteredConcretagens.map((item) => ({
      value: item.id,
      label: `${item.elemento} • ${formatDate(item.data)}`,
    })),
    [filteredConcretagens]
  );

  useEffect(() => {
    if (concretoInspecaoId && !filteredConcretagens.some((item) => item.id === concretoInspecaoId)) {
      setConcretoInspecaoId('');
    }
  }, [concretoInspecaoId, filteredConcretagens]);

  const getConformidade = (): { conforme: boolean; msg: string } | null => {
    const r = parseDecimalInput(resistencia);
    const f = parseDecimalInput(fckProjeto);
    if (!resistencia || !fckProjeto || Number.isNaN(r) || Number.isNaN(f)) return null;

    if (Number(idade) !== 28) {
      return {
        conforme: true,
        msg: `Idade de ${idade} dias registrada para acompanhamento. A verificação automática de NC ocorre aos 28 dias.`,
      };
    }

    const min = f * 0.95;
    const conforme = r >= min;
    return { conforme, msg: conforme ? `Conforme: ${r.toFixed(1)} MPa ≥ ${min.toFixed(1)} MPa (95% fck)` : `NÃO CONFORME: ${r.toFixed(1)} MPa < ${min.toFixed(1)} MPa (95% fck)` };
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!concretoInspecaoId) { Alert.alert('Erro', 'Selecione a concretagem vinculada ao rompimento.'); return; }
    if (!resistencia || !fckProjeto) { Alert.alert('Erro', 'Informe resistência e fck de projeto.'); return; }

    const resistenciaValue = parseDecimalInput(resistencia);
    const fckProjetoValue = parseDecimalInput(fckProjeto);

    if (!Number.isFinite(resistenciaValue) || !Number.isFinite(fckProjetoValue)) {
      Alert.alert('Erro', 'Informe valores numéricos válidos para resistência e fck de projeto.');
      return;
    }

    setSaving(true);
    try {
      const input = {
        obra_id: obraId,
        concreto_inspecao_id: concretoInspecaoId,
        data, idade: Number(idade),
        resistencia: resistenciaValue,
        fck_projeto: fckProjetoValue,
        observacoes,
      };

      if (isEditing) {
        await updateRompimentoCP(rompimentoId!, input);
        if (idade === '28') {
          await verificarNCRompimentoCP({
            obra_id: obraId,
            rompimento_id: rompimentoId!,
            responsavel: '',
            idade: Number(idade),
            resistencia: resistenciaValue,
            fck_projeto: fckProjetoValue,
          });
        }
      } else {
        const result = await createRompimentoCP(input);
        // NC automática se não conforme
        if (result.conforme === 0) {
          await verificarNCRompimentoCP({
            obra_id: obraId,
            rompimento_id: result.id,
            responsavel: '',
            idade: Number(idade),
            resistencia: resistenciaValue,
            fck_projeto: fckProjetoValue,
          });
        }
      }

      Alert.alert('Sucesso', isEditing ? 'Rompimento atualizado.' : 'Rompimento registrado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const conformidade = getConformidade();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={isEditing ? 'Editar Rompimento CP' : 'Novo Rompimento CP'} showBack onBack={() => navigation.goBack()} showHome onHome={() => navigation.navigate('HomeTab')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados do Ensaio">
          <SelectField label="Obra" value={obraId} options={obras.map((o) => ({ value: o.id, label: o.nome }))} onSelect={setObraId} />
          <SelectField label="Concretagem vinculada" value={concretoInspecaoId} options={concretagemOptions} onSelect={setConcretoInspecaoId} />
          {concretagemOptions.length === 0 ? <Text style={styles.helperText}>Cadastre uma inspeção de concreto para manter a rastreabilidade deste rompimento no relatório.</Text> : null}
          <FormField label="Data" value={data} onChangeText={setData} />
          <SelectField label="Idade" value={idade} options={IDADE_OPTIONS} onSelect={setIdade} />
          <FormField label="fck Projeto (MPa)" value={fckProjeto} onChangeText={setFckProjeto} keyboardType="numeric" />
          <FormField label="Resistência Obtida (MPa)" value={resistencia} onChangeText={setResistencia} keyboardType="numeric" />
        </FormSection>

        {conformidade && (
          <FormNotice title={conformidade.conforme ? 'Conforme' : 'Não Conforme'} tone={conformidade.conforme ? 'success' : 'warning'} message={conformidade.msg} />
        )}

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
  submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.lg },
  submitButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.surface },
});
