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
import { SignatureCapture } from '../../components/SignatureCapture';
import { Obra } from '../../models/Obra';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createVedacaoInspecao, getVedacaoById, updateVedacaoInspecao, updateVedacaoSignature } from '../../database/repositories/vedacaoRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile, saveSignature } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { verificarNCVedacao } from '../../services/ncAutomaticaService';

const TIPO_OPTIONS = [
  { value: 'alvenaria', label: 'Alvenaria' },
  { value: 'drywall', label: 'Drywall' },
];

interface CheckToggle {
  key: string;
  label: string;
  value: number;
}

export function VedacaoFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const vedacaoId = route.params?.vedacaoId;
  const paramObraId = route.params?.obraId;
  const isEditing = !!vedacaoId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [data, setData] = useState(todayISO());
  const [tipoVedacao, setTipoVedacao] = useState('alvenaria');
  const [localDesc, setLocalDesc] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const [checks, setChecks] = useState<CheckToggle[]>([
    { key: 'material_conforme', label: 'Material conforme especificação', value: 0 },
    { key: 'base_nivelada', label: 'Base nivelada e limpa', value: 0 },
    { key: 'prumo_alinhamento_ok', label: 'Prumo e alinhamento OK', value: 0 },
    { key: 'junta_adequada', label: 'Juntas adequadas', value: 0 },
    { key: 'amarracao_ok', label: 'Amarração OK', value: 0 },
    { key: 'vergas_contravergas_ok', label: 'Vergas e contravergas OK', value: 0 },
    { key: 'fixacao_adequada', label: 'Fixação adequada', value: 0 },
    { key: 'ausencia_trincas', label: 'Ausência de trincas', value: 0 },
    { key: 'limpeza_ok', label: 'Limpeza OK', value: 0 },
  ]);

  const loadObras = useCallback(async () => {
    const data = await getActiveObras();
    setObras(data);
  }, []);

  const loadVedacao = useCallback(async () => {
    if (!vedacaoId) return;
    const v = await getVedacaoById(vedacaoId);
    if (!v) return;
    setObraId(v.obra_id);
    setData(v.data);
    setTipoVedacao(v.tipo_vedacao);
    setLocalDesc(v.local_descricao);
    setObservacoes(v.observacoes);
    setSignature(v.assinatura_path ?? null);
    setChecks((prev) =>
      prev.map((c) => ({ ...c, value: (v as any)[c.key] ?? 0 }))
    );
    const p = await getPhotosByEntity('vedacao', vedacaoId);
    setPhotos(p);
  }, [vedacaoId]);

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isEditing) loadVedacao();
    }, [isEditing, loadObras, loadVedacao])
  );

  const toggleCheck = (key: string) => {
    setChecks((prev) => prev.map((c) => (c.key === key ? { ...c, value: c.value === 1 ? 0 : 1 } : c)));
  };

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && vedacaoId) {
      await addPhoto('vedacao', vedacaoId, uri);
      const p = await getPhotosByEntity('vedacao', vedacaoId);
      setPhotos(p);
    } else {
      setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'vedacao' as PhotoEntityType, uri, legenda: '', created_at: '' }]);
    }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) {
      await deletePhoto(photo.id);
      await deleteStoredFile(photo.uri);
      const p = await getPhotosByEntity('vedacao', vedacaoId!);
      setPhotos(p);
    } else {
      await deleteStoredFile(photo.uri);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  };

  const handleSignature = async (path: string) => {
    if (signature) {
      await deleteStoredFile(signature);
    }

    const signaturePath = await saveSignature(path);
    setSignature(signaturePath);
    if (isEditing && vedacaoId) {
      await updateVedacaoSignature(vedacaoId, signaturePath);
    }
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!localDesc.trim()) { Alert.alert('Erro', 'Informe a localização.'); return; }

    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const checksObj: Record<string, number> = {};
      checks.forEach((c) => { checksObj[c.key] = c.value; });
      const fixacaoAdequada = tipoVedacao === 'drywall' ? checksObj.fixacao_adequada : 1;
      const itensNaoConformes = checks
        .filter((check) => tipoVedacao === 'drywall' || check.key !== 'fixacao_adequada')
        .filter((check) => check.value === 0)
        .map((check) => check.label);

      const input = {
        obra_id: obraId,
        data,
        tipo_vedacao: tipoVedacao as any,
        local_descricao: localDesc,
        material_conforme: checksObj.material_conforme,
        base_nivelada: checksObj.base_nivelada,
        prumo_alinhamento_ok: checksObj.prumo_alinhamento_ok,
        junta_adequada: checksObj.junta_adequada,
        amarracao_ok: checksObj.amarracao_ok,
        vergas_contravergas_ok: checksObj.vergas_contravergas_ok,
        fixacao_adequada: fixacaoAdequada,
        ausencia_trincas: checksObj.ausencia_trincas,
        limpeza_ok: checksObj.limpeza_ok,
        observacoes,
        latitude: location.coords?.latitude ?? null,
        longitude: location.coords?.longitude ?? null,
      };

      if (isEditing) {
        await updateVedacaoInspecao(vedacaoId!, input);
        if (signature) await updateVedacaoSignature(vedacaoId!, signature);
        await verificarNCVedacao({
          obra_id: obraId,
          inspecao_id: vedacaoId!,
          responsavel: '',
          tipo_vedacao: tipoVedacao as 'alvenaria' | 'drywall',
          itensNaoConformes,
        });
      } else {
        const newId = await createVedacaoInspecao(input);
        for (const photo of photos) {
          await addPhoto('vedacao', newId, photo.uri);
        }
        if (signature) await updateVedacaoSignature(newId, signature);

        // NC automática
        await verificarNCVedacao({
          obra_id: obraId,
          inspecao_id: newId,
          responsavel: '',
          tipo_vedacao: tipoVedacao as 'alvenaria' | 'drywall',
          itensNaoConformes,
        });
      }

      Alert.alert('Sucesso', isEditing ? 'Vedação atualizada.' : 'Vedação registrada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));
  const visibleChecks = checks.filter((check) => tipoVedacao === 'drywall' || check.key !== 'fixacao_adequada');

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditing ? 'Editar Vedação' : 'Nova Vedação'}
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obraOptions} onSelect={setObraId} />
          <SelectField label="Tipo de Vedação" value={tipoVedacao} options={TIPO_OPTIONS} onSelect={setTipoVedacao} />
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Localização / Descrição" value={localDesc} onChangeText={setLocalDesc} />
        </FormSection>

        <FormSection title="Verificações">
          {visibleChecks.map((c) => (
            <View key={c.key} style={styles.checkRow}>
              <Text style={styles.checkLabel}>{c.label}</Text>
              <Switch
                value={c.value === 1}
                onValueChange={() => toggleCheck(c.key)}
                trackColor={{ false: COLORS.border, true: COLORS.success }}
                thumbColor={COLORS.surface}
              />
            </View>
          ))}
        </FormSection>

        <FormSection title="Observações">
          <FormField label="Observações" value={observacoes} onChangeText={setObservacoes} multiline />
        </FormSection>

        <FormSection title="Fotos">
          <PhotoPicker photos={photos} entityType="vedacao" entityId={vedacaoId || ''} onPhotosChanged={() => { if (vedacaoId) loadVedacao(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} />
        </FormSection>

        <FormSection title="Assinatura">
          <TouchableOpacity onPress={() => setShowSignature(true)}>
            <Text style={{ color: COLORS.primary }}>{signature ? '✓ Assinatura capturada (alterar)' : 'Capturar Assinatura'}</Text>
          </TouchableOpacity>
        </FormSection>
        <SignatureCapture visible={showSignature} onSave={(sig) => { handleSignature(sig); setShowSignature(false); }} onCancel={() => setShowSignature(false)} />

        <TouchableOpacity
          style={[styles.submitButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>{saving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Registrar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SPACING.md, paddingBottom: 40 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkLabel: { ...FONTS.regular, fontSize: 14, flex: 1, marginRight: SPACING.sm },
  submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.lg },
  submitButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.surface },
});
