import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { PhotoPicker } from '../../components/PhotoPicker';
import { Obra } from '../../models/Obra';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createArmaduraInspecao, getArmaduraById, updateArmaduraInspecao } from '../../database/repositories/armaduraRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { verificarNCArmadura } from '../../services/ncAutomaticaService';
import { parseOptionalDecimalInput } from '../../utils/number';
import { buildPersistenceAlertMessage, runPersistenceTasks } from '../../utils/persistence';

const ELEMENTO_OPTIONS = [
  { value: 'pilar', label: 'Pilar' },
  { value: 'viga', label: 'Viga' },
  { value: 'laje', label: 'Laje' },
  { value: 'fundacao', label: 'Fundação' },
  { value: 'bloco', label: 'Bloco' },
];

export function ArmaduraFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const armaduraId = route.params?.armaduraId;
  const paramObraId = route.params?.obraId;
  const isEditing = !!armaduraId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [data, setData] = useState(todayISO());
  const [elemento, setElemento] = useState('pilar');
  const [diametro, setDiametro] = useState('');
  const [espacamento, setEspacamento] = useState('');
  const [cobrimentoOk, setCobrimentoOk] = useState(0);
  const [amarracaoOk, setAmarracaoOk] = useState(0);
  const [conformeProjeto, setConformeProjeto] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);

  const loadObras = useCallback(async () => {
    setObras(await getActiveObras());
  }, []);

  const loadArmadura = useCallback(async () => {
    if (!armaduraId) return;
    const a = await getArmaduraById(armaduraId);
    if (!a) return;
    setObraId(a.obra_id); setData(a.data); setElemento(a.elemento);
    setDiametro(a.diametro != null ? String(a.diametro) : '');
    setEspacamento(a.espacamento != null ? String(a.espacamento) : '');
    setCobrimentoOk(a.cobrimento_ok); setAmarracaoOk(a.amarracao_ok);
    setConformeProjeto(a.conforme_projeto); setObservacoes(a.observacoes);
    setPhotos(await getPhotosByEntity('armadura', armaduraId));
  }, [armaduraId]);

  useFocusEffect(useCallback(() => { loadObras(); if (isEditing) loadArmadura(); }, [isEditing, loadArmadura, loadObras]));

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && armaduraId) { await addPhoto('armadura', armaduraId, uri); setPhotos(await getPhotosByEntity('armadura', armaduraId)); }
    else { setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'armadura' as PhotoEntityType, uri, legenda: '', created_at: '' }]); }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) { await deletePhoto(photo.id); await deleteStoredFile(photo.uri); setPhotos(await getPhotosByEntity('armadura', armaduraId!)); }
    else { await deleteStoredFile(photo.uri); setPhotos((prev) => prev.filter((p) => p.id !== photo.id)); }
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }

    const diametroValue = parseOptionalDecimalInput(diametro);
    const espacamentoValue = parseOptionalDecimalInput(espacamento);

    if (diametro.trim() && diametroValue == null) {
      Alert.alert('Erro', 'Informe um valor numérico válido para o diâmetro.');
      return;
    }

    if (espacamento.trim() && espacamentoValue == null) {
      Alert.alert('Erro', 'Informe um valor numérico válido para o espaçamento.');
      return;
    }

    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const input = {
        obra_id: obraId, data, elemento,
        diametro: diametroValue,
        espacamento: espacamentoValue,
        cobrimento_ok: cobrimentoOk, amarracao_ok: amarracaoOk,
        conforme_projeto: conformeProjeto, observacoes,
        latitude: location.coords?.latitude ?? null, longitude: location.coords?.longitude ?? null,
      };

      let warnings: string[] = [];

      if (isEditing) {
        await updateArmaduraInspecao(armaduraId!, input);
        warnings = await runPersistenceTasks([
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCArmadura({
                obra_id: obraId,
                armadura_id: armaduraId!,
                responsavel: '',
                conforme_projeto: conformeProjeto === 1,
              });
            },
          },
        ]);
      } else {
        const newId = await createArmaduraInspecao(input);
        warnings = await runPersistenceTasks([
          {
            label: 'vinculação de fotos',
            run: async () => {
              for (const photo of photos) {
                await addPhoto('armadura', newId, photo.uri);
              }
            },
          },
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCArmadura({
                obra_id: obraId,
                armadura_id: newId,
                responsavel: '',
                conforme_projeto: conformeProjeto === 1,
              });
            },
          },
        ]);
      }

      const successMessage = isEditing ? 'Armadura atualizada.' : 'Armadura registrada.';
      Alert.alert(warnings.length > 0 ? 'Salvo com avisos' : 'Sucesso', buildPersistenceAlertMessage(successMessage, warnings), [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Erro ao salvar armadura:', error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={isEditing ? 'Editar Armadura' : 'Nova Armadura'} showBack onBack={() => navigation.goBack()} showHome onHome={() => navigation.navigate('HomeTab')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obras.map((o) => ({ value: o.id, label: o.nome }))} onSelect={setObraId} />
          <SelectField label="Elemento" value={elemento} options={ELEMENTO_OPTIONS} onSelect={setElemento} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Diâmetro (mm)" value={diametro} onChangeText={setDiametro} keyboardType="numeric" />
          <FormField label="Espaçamento (cm)" value={espacamento} onChangeText={setEspacamento} keyboardType="numeric" />
        </FormSection>
        <FormSection title="Verificações">
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Cobrimento conforme</Text><Switch value={cobrimentoOk === 1} onValueChange={(v) => setCobrimentoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Amarração adequada</Text><Switch value={amarracaoOk === 1} onValueChange={(v) => setAmarracaoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Conforme projeto</Text><Switch value={conformeProjeto === 1} onValueChange={(v) => setConformeProjeto(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
        </FormSection>
        <FormSection title="Observações"><FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline /></FormSection>
        <FormSection title="Fotos"><PhotoPicker photos={photos} entityType="armadura" entityId={armaduraId || ''} onPhotosChanged={() => { if (armaduraId) loadArmadura(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} /></FormSection>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  switchLabel: { ...FONTS.regular, fontSize: 14, flex: 1, marginRight: SPACING.sm },
  submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.lg },
  submitButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.surface },
});
