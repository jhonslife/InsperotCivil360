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
import { createFormaInspecao, getFormaById, updateFormaInspecao } from '../../database/repositories/formaRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { verificarNCForma } from '../../services/ncAutomaticaService';
import { buildPersistenceAlertMessage, runPersistenceTasks } from '../../utils/persistence';

export function FormaFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const formaId = route.params?.formaId;
  const paramObraId = route.params?.obraId;
  const isEditing = !!formaId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [data, setData] = useState(todayISO());
  const [elemento, setElemento] = useState('');
  const [alinhamentoOk, setAlinhamentoOk] = useState(0);
  const [nivelamentoOk, setNivelamentoOk] = useState(0);
  const [estanqueidadeOk, setEstanqueidadeOk] = useState(0);
  const [limpezaOk, setLimpezaOk] = useState(0);
  const [desmoldanteAplicado, setDesmoldanteAplicado] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saving, setSaving] = useState(false);

  const loadObras = useCallback(async () => {
    setObras(await getActiveObras());
  }, []);

  const loadForma = useCallback(async () => {
    if (!formaId) return;
    const f = await getFormaById(formaId);
    if (!f) return;
    setObraId(f.obra_id); setData(f.data); setElemento(f.elemento);
    setAlinhamentoOk(f.alinhamento_ok); setNivelamentoOk(f.nivelamento_ok);
    setEstanqueidadeOk(f.estanqueidade_ok); setLimpezaOk(f.limpeza_ok);
    setDesmoldanteAplicado(f.desmoldante_aplicado); setObservacoes(f.observacoes);
    setPhotos(await getPhotosByEntity('formas', formaId));
  }, [formaId]);

  useFocusEffect(useCallback(() => { loadObras(); if (isEditing) loadForma(); }, [isEditing, loadForma, loadObras]));

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && formaId) { await addPhoto('formas', formaId, uri); setPhotos(await getPhotosByEntity('formas', formaId)); }
    else { setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'formas' as PhotoEntityType, uri, legenda: '', created_at: '' }]); }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) { await deletePhoto(photo.id); await deleteStoredFile(photo.uri); setPhotos(await getPhotosByEntity('formas', formaId!)); }
    else { await deleteStoredFile(photo.uri); setPhotos((prev) => prev.filter((p) => p.id !== photo.id)); }
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!elemento.trim()) { Alert.alert('Erro', 'Informe o elemento.'); return; }
    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const input = {
        obra_id: obraId, data, elemento,
        alinhamento_ok: alinhamentoOk, nivelamento_ok: nivelamentoOk,
        estanqueidade_ok: estanqueidadeOk, limpeza_ok: limpezaOk,
        desmoldante_aplicado: desmoldanteAplicado, observacoes,
        latitude: location.coords?.latitude ?? null, longitude: location.coords?.longitude ?? null,
      };

      let warnings: string[] = [];

      if (isEditing) {
        await updateFormaInspecao(formaId!, input);
        warnings = await runPersistenceTasks([
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCForma({
                obra_id: obraId,
                forma_id: formaId!,
                responsavel: '',
                alinhamento_ok: alinhamentoOk === 1,
                nivelamento_ok: nivelamentoOk === 1,
                estanqueidade_ok: estanqueidadeOk === 1,
              });
            },
          },
        ]);
      } else {
        const newId = await createFormaInspecao(input);
        warnings = await runPersistenceTasks([
          {
            label: 'vinculação de fotos',
            run: async () => {
              for (const photo of photos) {
                await addPhoto('formas', newId, photo.uri);
              }
            },
          },
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCForma({
                obra_id: obraId,
                forma_id: newId,
                responsavel: '',
                alinhamento_ok: alinhamentoOk === 1,
                nivelamento_ok: nivelamentoOk === 1,
                estanqueidade_ok: estanqueidadeOk === 1,
              });
            },
          },
        ]);
      }

      const successMessage = isEditing ? 'Forma atualizada.' : 'Forma registrada.';
      Alert.alert(warnings.length > 0 ? 'Salvo com avisos' : 'Sucesso', buildPersistenceAlertMessage(successMessage, warnings), [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      console.error('Erro ao salvar forma:', error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={isEditing ? 'Editar Forma' : 'Nova Forma'} showBack onBack={() => navigation.goBack()} showHome onHome={() => navigation.navigate('HomeTab')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obras.map((o) => ({ value: o.id, label: o.nome }))} onSelect={setObraId} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Elemento / Local" value={elemento} onChangeText={setElemento} />
        </FormSection>
        <FormSection title="Verificações">
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Alinhamento OK</Text><Switch value={alinhamentoOk === 1} onValueChange={(v) => setAlinhamentoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Nivelamento OK</Text><Switch value={nivelamentoOk === 1} onValueChange={(v) => setNivelamentoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Estanqueidade OK</Text><Switch value={estanqueidadeOk === 1} onValueChange={(v) => setEstanqueidadeOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Limpeza OK</Text><Switch value={limpezaOk === 1} onValueChange={(v) => setLimpezaOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
          <View style={styles.switchRow}><Text style={styles.switchLabel}>Desmoldante aplicado</Text><Switch value={desmoldanteAplicado === 1} onValueChange={(v) => setDesmoldanteAplicado(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} /></View>
        </FormSection>
        <FormSection title="Observações"><FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline /></FormSection>
        <FormSection title="Fotos"><PhotoPicker photos={photos} entityType="formas" entityId={formaId || ''} onPhotosChanged={() => { if (formaId) loadForma(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} /></FormSection>
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
