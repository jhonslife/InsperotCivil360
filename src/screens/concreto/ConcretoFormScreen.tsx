import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { FormNotice } from '../../components/FormNotice';
import { PhotoPicker } from '../../components/PhotoPicker';
import { SignatureCapture } from '../../components/SignatureCapture';
import { Obra } from '../../models/Obra';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createConcretoInspecao, getConcretoById, updateConcretoInspecao, updateConcretoSignature } from '../../database/repositories/concretoRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile, replaceSignatureFile } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { verificarNCConcreto } from '../../services/ncAutomaticaService';
import { parseDecimalInput, parseOptionalDecimalInput } from '../../utils/number';
import { buildPersistenceAlertMessage, runPersistenceTasks } from '../../utils/persistence';

const ELEMENTO_OPTIONS = [
  { value: 'pilar', label: 'Pilar' },
  { value: 'viga', label: 'Viga' },
  { value: 'laje', label: 'Laje' },
  { value: 'fundacao', label: 'Fundação' },
];

export function ConcretoFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const concretoId = route.params?.concretoId;
  const paramObraId = route.params?.obraId;
  const isEditing = !!concretoId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [data, setData] = useState(todayISO());
  const [elemento, setElemento] = useState('pilar');
  const [fckProjeto, setFckProjeto] = useState('');
  const [slump, setSlump] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [adensamentoOk, setAdensamentoOk] = useState(0);
  const [curaOk, setCuraOk] = useState(0);
  const [observacoes, setObservacoes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const loadObras = useCallback(async () => {
    setObras(await getActiveObras());
  }, []);

  const loadConcreto = useCallback(async () => {
    if (!concretoId) return;
    const c = await getConcretoById(concretoId);
    if (!c) return;
    setObraId(c.obra_id);
    setData(c.data);
    setElemento(c.elemento);
    setFckProjeto(String(c.fck_projeto));
    setSlump(c.slump != null ? String(c.slump) : '');
    setTemperatura(c.temperatura_concreto != null ? String(c.temperatura_concreto) : '');
    setAdensamentoOk(c.adensamento_ok);
    setCuraOk(c.cura_ok);
    setObservacoes(c.observacoes);
    setSignature(c.assinatura_path ?? null);
    setPhotos(await getPhotosByEntity('concreto', concretoId));
  }, [concretoId]);

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isEditing) loadConcreto();
    }, [isEditing, loadConcreto, loadObras])
  );

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && concretoId) {
      await addPhoto('concreto', concretoId, uri);
      setPhotos(await getPhotosByEntity('concreto', concretoId));
    } else {
      setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'concreto' as PhotoEntityType, uri, legenda: '', created_at: '' }]);
    }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) {
      await deletePhoto(photo.id);
      await deleteStoredFile(photo.uri);
      setPhotos(await getPhotosByEntity('concreto', concretoId!));
    } else {
      await deleteStoredFile(photo.uri);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  };

  const handleSignature = async (base64: string) => {
    const signaturePath = await replaceSignatureFile(
      base64,
      signature,
      isEditing && concretoId ? async (nextPath: string) => updateConcretoSignature(concretoId, nextPath) : undefined
    );
    setSignature(signaturePath);
  };

  const getAlerts = (): string[] => {
    const alerts: string[] = [];
    const slumpValue = parseOptionalDecimalInput(slump);
    const temperaturaValue = parseOptionalDecimalInput(temperatura);

    if (slumpValue != null && (slumpValue < 80 || slumpValue > 120)) alerts.push(`Slump ${slumpValue}mm fora da faixa 80-120mm`);
    if (temperaturaValue != null && temperaturaValue > 35) alerts.push(`Temperatura ${temperaturaValue}°C > 35°C`);
    return alerts;
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!fckProjeto) { Alert.alert('Erro', 'Informe o fck de projeto.'); return; }

    const fckProjetoValue = parseDecimalInput(fckProjeto);
    const slumpValue = parseOptionalDecimalInput(slump);
    const temperaturaValue = parseOptionalDecimalInput(temperatura);

    if (!Number.isFinite(fckProjetoValue)) {
      Alert.alert('Erro', 'Informe um valor numérico válido para o fck de projeto.');
      return;
    }

    if (slump.trim() && slumpValue == null) {
      Alert.alert('Erro', 'Informe um valor numérico válido para o slump.');
      return;
    }

    if (temperatura.trim() && temperaturaValue == null) {
      Alert.alert('Erro', 'Informe um valor numérico válido para a temperatura.');
      return;
    }

    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const input = {
        obra_id: obraId, data, elemento: elemento as any,
        fck_projeto: fckProjetoValue,
        slump: slumpValue,
        temperatura_concreto: temperaturaValue,
        adensamento_ok: adensamentoOk, cura_ok: curaOk,
        observacoes,
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null,
        assinatura_path: signature,
      };

      let warnings: string[] = [];

      if (isEditing) {
        await updateConcretoInspecao(concretoId!, input);
        warnings = await runPersistenceTasks([
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCConcreto({
                obra_id: obraId,
                concreto_id: concretoId!,
                responsavel: '',
                slump: input.slump,
                temperatura: input.temperatura_concreto,
              });
            },
          },
        ]);
      } else {
        const newId = await createConcretoInspecao(input);
        warnings = await runPersistenceTasks([
          {
            label: 'vinculação de fotos',
            run: async () => {
              for (const photo of photos) {
                await addPhoto('concreto', newId, photo.uri);
              }
            },
          },
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCConcreto({
                obra_id: obraId,
                concreto_id: newId,
                responsavel: '',
                slump: input.slump,
                temperatura: input.temperatura_concreto,
              });
            },
          },
        ]);
      }

      const successMessage = isEditing ? 'Concreto atualizado.' : 'Concreto registrado.';
      Alert.alert(warnings.length > 0 ? 'Salvo com avisos' : 'Sucesso', buildPersistenceAlertMessage(successMessage, warnings), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving concreto:', error);
      Alert.alert('Erro', 'Não foi possível salvar a concretagem.');
    } finally {
      setSaving(false);
    }
  };

  const alerts = getAlerts();
  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));

  return (
    <SafeAreaView style={styles.container}>
      <Header title={isEditing ? 'Editar Concreto' : 'Nova Concretagem'} showBack onBack={() => navigation.goBack()} showHome onHome={() => navigation.navigate('HomeTab')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obraOptions} onSelect={setObraId} />
          <SelectField label="Elemento" value={elemento} options={ELEMENTO_OPTIONS} onSelect={setElemento} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="fck Projeto (MPa)" value={fckProjeto} onChangeText={setFckProjeto} keyboardType="numeric" />
        </FormSection>

        <FormSection title="Controle Tecnológico">
          <FormField label="Slump (mm)" value={slump} onChangeText={setSlump} keyboardType="numeric" />
          <FormField label="Temperatura Concreto (°C)" value={temperatura} onChangeText={setTemperatura} keyboardType="numeric" />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Adensamento adequado</Text>
            <Switch value={adensamentoOk === 1} onValueChange={(v) => setAdensamentoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Cura adequada</Text>
            <Switch value={curaOk === 1} onValueChange={(v) => setCuraOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} />
          </View>
        </FormSection>

        {alerts.length > 0 && alerts.map((a, i) => <FormNotice key={i} title="Alerta" tone="warning" message={a} />)}

        <FormSection title="Observações">
          <FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />
        </FormSection>

        <FormSection title="Fotos">
          <PhotoPicker photos={photos} entityType="concreto" entityId={concretoId || ''} onPhotosChanged={() => { if (concretoId) loadConcreto(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} />
        </FormSection>

        <FormSection title="Assinatura">
          <TouchableOpacity onPress={() => setShowSignature(true)}>
            <Text style={{ color: COLORS.primary }}>{signature ? '✓ Assinatura capturada (alterar)' : 'Capturar Assinatura'}</Text>
          </TouchableOpacity>
        </FormSection>
        <SignatureCapture
          visible={showSignature}
          onSave={async (sig) => {
            try {
              await handleSignature(sig);
              setShowSignature(false);
            } catch (error) {
              console.error('Erro ao salvar assinatura da concretagem:', error);
              Alert.alert('Erro', 'Não foi possível salvar a assinatura.');
            }
          }}
          onCancel={() => setShowSignature(false)}
        />

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
