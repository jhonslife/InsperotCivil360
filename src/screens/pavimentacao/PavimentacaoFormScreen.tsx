import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { FormNotice } from '../../components/FormNotice';
import { ChecklistItemRow } from '../../components/ChecklistItemRow';
import { PhotoPicker } from '../../components/PhotoPicker';
import { SignatureCapture } from '../../components/SignatureCapture';
import { Obra } from '../../models/Obra';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { ChecklistItem } from '../../models/ChecklistItem';
import { getActiveObras } from '../../database/repositories/obraRepository';
import {
  createPavInspecao,
  getPavInspecaoById,
  getPavChecklistItems,
  updatePavChecklistItem,
  updatePavInspecao,
  updatePavSignature,
} from '../../database/repositories/pavimentacaoRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile, replaceSignatureFile } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { CAMADA_LABELS, CamadaPavimentacao, PAVIMENTACAO_CHECKLISTS } from '../../constants/pavimentacaoTypes';
import { verificarNCPavimentacao } from '../../services/ncAutomaticaService';
import { parseOptionalDecimalInput } from '../../utils/number';
import { buildPersistenceAlertMessage, runPersistenceTasks } from '../../utils/persistence';

const CAMADA_OPTIONS = Object.entries(CAMADA_LABELS).map(([value, label]) => ({ value, label }));
const KM_PATTERN = /^KM\s\d{2}\+\d{3}$/i;

function buildChecklistTemplate(camada: CamadaPavimentacao): ChecklistItem[] {
  return PAVIMENTACAO_CHECKLISTS[camada].map((item, index) => ({
    id: `temp_check_${camada}_${index}`,
    inspection_id: '',
    descricao: item.descricao,
    conforme: 0,
    observacao: '',
    ordem: item.ordem,
  }));
}

export function PavimentacaoFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const inspecaoId = route.params?.inspecaoId;
  const paramObraId = route.params?.obraId;
  const isEditing = !!inspecaoId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [data, setData] = useState(todayISO());
  const [trecho, setTrecho] = useState('');
  const [camada, setCamada] = useState<CamadaPavimentacao>('subleito');
  const [espessura, setEspessura] = useState('');
  const [compactacaoOk, setCompactacaoOk] = useState(0);
  const [umidadeOk, setUmidadeOk] = useState(0);
  const [temperatura, setTemperatura] = useState('');
  const [kmInicio, setKmInicio] = useState('');
  const [kmFim, setKmFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const loadObras = useCallback(async () => {
    setObras(await getActiveObras());
  }, []);

  const loadInspecao = useCallback(async () => {
    if (!inspecaoId) return;
    const p = await getPavInspecaoById(inspecaoId);
    if (!p) return;
    setObraId(p.obra_id);
    setData(p.data);
    setTrecho(p.trecho);
    setCamada(p.camada);
    setEspessura(p.espessura != null ? String(p.espessura) : '');
    setCompactacaoOk(p.compactacao_ok);
    setUmidadeOk(p.umidade_ok);
    setTemperatura(p.temperatura != null ? String(p.temperatura) : '');
    setKmInicio(p.km_inicio);
    setKmFim(p.km_fim);
    setObservacoes(p.observacoes);
    setSignature(p.assinatura_path ?? null);

    const items = await getPavChecklistItems(inspecaoId);
    setChecklist(items);

    setPhotos(await getPhotosByEntity('pavimentacao', inspecaoId));
  }, [inspecaoId]);

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isEditing) loadInspecao();
      if (!isEditing) setChecklist(buildChecklistTemplate(camada));
    }, [camada, isEditing, loadInspecao, loadObras])
  );

  useEffect(() => {
    if (!isEditing) {
      setChecklist(buildChecklistTemplate(camada));
    }
  }, [camada, isEditing]);

  const handleToggleChecklist = async (itemId: string) => {
    const item = checklist.find((checklistItem) => checklistItem.id === itemId);
    if (!item) return;

    const nextStatus = item.conforme === 0 ? 1 : item.conforme === 1 ? 2 : 0;

    setChecklist((prev) =>
      prev.map((checklistItem) =>
        checklistItem.id === itemId ? { ...checklistItem, conforme: nextStatus } : checklistItem
      )
    );

    if (isEditing) {
      await updatePavChecklistItem(itemId, nextStatus, item.observacao);
    }
  };

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && inspecaoId) {
      await addPhoto('pavimentacao', inspecaoId, uri);
      setPhotos(await getPhotosByEntity('pavimentacao', inspecaoId));
    } else {
      setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'pavimentacao' as PhotoEntityType, uri, legenda: '', created_at: '' }]);
    }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) {
      await deletePhoto(photo.id);
      await deleteStoredFile(photo.uri);
      setPhotos(await getPhotosByEntity('pavimentacao', inspecaoId!));
    } else {
      await deleteStoredFile(photo.uri);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  };

  const handleSignature = async (base64: string) => {
    const signaturePath = await replaceSignatureFile(
      base64,
      signature,
      isEditing && inspecaoId ? async (nextPath: string) => updatePavSignature(inspecaoId, nextPath) : undefined
    );
    setSignature(signaturePath);
  };

  const getAlerts = (): string[] => {
    const alerts: string[] = [];
    const temperaturaValue = parseOptionalDecimalInput(temperatura);
    if (temperaturaValue != null && camada === 'cbuq' && (temperaturaValue < 107 || temperaturaValue > 177)) {
      alerts.push(`Temperatura CBUQ ${temperaturaValue}°C fora da faixa 107-177°C`);
    }
    return alerts;
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!trecho.trim()) { Alert.alert('Erro', 'Informe o trecho.'); return; }
    if (kmInicio && !KM_PATTERN.test(kmInicio)) { Alert.alert('Erro', 'KM Início deve seguir o formato KM 00+000.'); return; }
    if (kmFim && !KM_PATTERN.test(kmFim)) { Alert.alert('Erro', 'KM Fim deve seguir o formato KM 00+000.'); return; }

    const espessuraValue = parseOptionalDecimalInput(espessura);
    const temperaturaValue = parseOptionalDecimalInput(temperatura);

    if (espessura.trim() && espessuraValue == null) {
      Alert.alert('Erro', 'Informe um valor numérico válido para a espessura.');
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
        obra_id: obraId,
        data,
        trecho,
        camada,
        espessura: espessuraValue,
        compactacao_ok: compactacaoOk,
        umidade_ok: umidadeOk,
        temperatura: temperaturaValue,
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null,
        km_inicio: kmInicio.toUpperCase(),
        km_fim: kmFim.toUpperCase(),
        observacoes,
        assinatura_path: signature,
      };

      let warnings: string[] = [];

      if (isEditing) {
        await updatePavInspecao(inspecaoId!, input);
        for (const item of checklist) {
          await updatePavChecklistItem(item.id, item.conforme, item.observacao);
        }
        warnings = await runPersistenceTasks([
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCPavimentacao({
                obra_id: obraId,
                inspecao_id: inspecaoId!,
                responsavel: '',
                trecho,
                compactacao_ok: compactacaoOk === 1,
                temperatura: temperaturaValue,
              });
            },
          },
        ]);
      } else {
        const newId = await createPavInspecao(
          input,
          checklist.map((item) => ({
            descricao: item.descricao,
            conforme: item.conforme,
            observacao: item.observacao,
            ordem: item.ordem,
          }))
        );

        warnings = await runPersistenceTasks([
          {
            label: 'vinculação de fotos',
            run: async () => {
              for (const photo of photos) {
                await addPhoto('pavimentacao', newId, photo.uri);
              }
            },
          },
          {
            label: 'NC automática',
            run: async () => {
              await verificarNCPavimentacao({
                obra_id: obraId,
                inspecao_id: newId,
                responsavel: '',
                trecho,
                compactacao_ok: compactacaoOk === 1,
                temperatura: temperaturaValue,
              });
            },
          },
        ]);
      }

      const successMessage = isEditing ? 'Pavimentação atualizada.' : 'Pavimentação registrada.';
      Alert.alert(warnings.length > 0 ? 'Salvo com avisos' : 'Sucesso', buildPersistenceAlertMessage(successMessage, warnings), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Erro ao salvar inspeção de pavimentação:', error);
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const alerts = getAlerts();
  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditing ? 'Editar Pavimentação' : 'Nova Pavimentação'}
        showBack onBack={() => navigation.goBack()}
        showHome onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obraOptions} onSelect={setObraId} />
          <SelectField label="Camada" value={camada} options={CAMADA_OPTIONS} onSelect={(value) => setCamada(value as CamadaPavimentacao)} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Trecho" value={trecho} onChangeText={setTrecho} />
          <FormField label="KM Início" value={kmInicio} onChangeText={setKmInicio} />
          <FormField label="KM Fim" value={kmFim} onChangeText={setKmFim} />
          <FormField label="Espessura (cm)" value={espessura} onChangeText={setEspessura} keyboardType="numeric" />
          {camada === 'cbuq' && (
            <FormField label="Temperatura (°C)" value={temperatura} onChangeText={setTemperatura} keyboardType="numeric" />
          )}
        </FormSection>

        <FormSection title="Verificações">
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Compactação conforme</Text>
            <Switch value={compactacaoOk === 1} onValueChange={(v) => setCompactacaoOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Umidade adequada</Text>
            <Switch value={umidadeOk === 1} onValueChange={(v) => setUmidadeOk(v ? 1 : 0)} trackColor={{ false: COLORS.border, true: COLORS.success }} thumbColor={COLORS.surface} />
          </View>
        </FormSection>

        {alerts.length > 0 && alerts.map((a, i) => <FormNotice key={i} title="Alerta" tone="warning" message={a} />)}

        {checklist.length > 0 && (
          <FormSection title="Checklist">
            {checklist.map((item) => (
              <ChecklistItemRow key={item.id} descricao={item.descricao} conforme={item.conforme} observacao={item.observacao || ''} onToggle={() => handleToggleChecklist(item.id)} onPress={() => {}} />
            ))}
          </FormSection>
        )}

        <FormSection title="Observações">
          <FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />
        </FormSection>

        <FormSection title="Fotos">
          <PhotoPicker photos={photos} entityType="pavimentacao" entityId={inspecaoId || ''} onPhotosChanged={() => { if (inspecaoId) loadInspecao(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} />
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
              console.error('Erro ao salvar assinatura da pavimentação:', error);
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
