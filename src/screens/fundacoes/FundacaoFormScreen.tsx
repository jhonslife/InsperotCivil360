import React, { useState, useCallback, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { FormSection } from '../../components/FormSection';
import { ChecklistItemRow } from '../../components/ChecklistItemRow';
import { PhotoPicker } from '../../components/PhotoPicker';
import { SignatureCapture } from '../../components/SignatureCapture';
import { FundacaoTipo, FUNDACAO_TIPO_LABELS, FUNDACAO_DADOS_TECNICOS, FUNDACAO_PROFUNDA_CHECKLISTS } from '../../constants/fundacaoTypes';
import { Obra } from '../../models/Obra';
import { Photo, PhotoEntityType } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import {
  createFundacao,
  getFundacaoById,
  getFundacaoChecklistItems,
  updateFundacaoChecklistItem,
  getDadosTecnicos,
  saveDadosTecnicos,
  updateFundacao,
  updateFundacaoSignature,
} from '../../database/repositories/fundacaoRepository';
import { getPhotosByEntity, addPhoto, deletePhoto } from '../../database/repositories/photoRepository';
import { deleteStoredFile, saveSignature } from '../../services/photoService';
import { getCurrentLocation } from '../../services/locationService';
import { todayISO } from '../../utils/formatDate';
import { ChecklistItem } from '../../models/ChecklistItem';
import { FundacaoStatus } from '../../models/Fundacao';
import { verificarNCFundacao } from '../../services/ncAutomaticaService';

const TIPO_OPTIONS = Object.entries(FUNDACAO_TIPO_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = [
  { value: 'em_execucao', label: 'Em Execução' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'com_nc', label: 'Com NC' },
];

function buildChecklistTemplate(tipo: FundacaoTipo): ChecklistItem[] {
  return FUNDACAO_PROFUNDA_CHECKLISTS[tipo].map((item, index) => ({
    id: `temp_check_${tipo}_${index}`,
    inspection_id: '',
    descricao: item.descricao,
    conforme: 0,
    observacao: '',
    ordem: item.ordem,
  }));
}

export function FundacaoFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const fundacaoId = route.params?.fundacaoId;
  const paramObraId = route.params?.obraId;
  const paramTipo = route.params?.tipo;
  const isEditing = !!fundacaoId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [obraId, setObraId] = useState(paramObraId || '');
  const [tipo, setTipo] = useState<FundacaoTipo>((paramTipo as FundacaoTipo) || 'estaca_cravada');
  const [diametro, setDiametro] = useState('');
  const [profundidadeProjeto, setProfundidadeProjeto] = useState('');
  const [profundidadeAtingida, setProfundidadeAtingida] = useState('');
  const [data, setData] = useState(todayISO());
  const [localizacao, setLocalizacao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<FundacaoStatus>('em_execucao');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [signature, setSignature] = useState<string | null>(null);
  const [dadosTecnicos, setDadosTecnicos] = useState<{ campo: string; valor: string; unidade: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  const loadObras = useCallback(async () => {
    const data = await getActiveObras();
    setObras(data);
  }, []);

  const loadFundacao = useCallback(async () => {
    if (!fundacaoId) return;
    const f = await getFundacaoById(fundacaoId);
    if (!f) return;
    setObraId(f.obra_id);
    setTipo(f.tipo);
    setDiametro(String(f.diametro));
    setProfundidadeProjeto(String(f.profundidade_projeto));
    setProfundidadeAtingida(f.profundidade_atingida != null ? String(f.profundidade_atingida) : '');
    setData(f.data);
    setLocalizacao(f.localizacao_desc);
    setObservacoes(f.observacoes);
    setStatus(f.status);
    setSignature(f.assinatura_path ?? null);

    const items = await getFundacaoChecklistItems(fundacaoId);
    setChecklist(items);

    const p = await getPhotosByEntity('fundacao', fundacaoId);
    setPhotos(p);

    const dt = await getDadosTecnicos(fundacaoId);
    setDadosTecnicos(dt.map((d) => ({ campo: d.campo, valor: d.valor_numerico != null ? String(d.valor_numerico) : d.valor_texto || '', unidade: d.unidade })));
  }, [fundacaoId]);

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isEditing) loadFundacao();
    }, [isEditing, loadFundacao, loadObras])
  );

  useEffect(() => {
    if (!isEditing) {
      const template = FUNDACAO_DADOS_TECNICOS[tipo as FundacaoTipo] || [];
      setDadosTecnicos(template.map((t) => ({ campo: t.campo, valor: '', unidade: t.unidade })));
      setChecklist(buildChecklistTemplate(tipo as FundacaoTipo));
    }
  }, [isEditing, tipo]);

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
      await updateFundacaoChecklistItem(itemId, nextStatus, item.observacao);
    }
  };

  const handleAddPhoto = async (uri: string) => {
    if (isEditing && fundacaoId) {
      await addPhoto('fundacao', fundacaoId, uri);
      const p = await getPhotosByEntity('fundacao', fundacaoId);
      setPhotos(p);
    } else {
      setPhotos((prev) => [...prev, { id: `temp_${Date.now()}`, entity_id: '', entity_type: 'fundacao' as PhotoEntityType, uri, legenda: '', created_at: '' }]);
    }
  };

  const handleRemovePhoto = async (photo: Photo) => {
    if (isEditing) {
      await deletePhoto(photo.id);
      await deleteStoredFile(photo.uri);
      const p = await getPhotosByEntity('fundacao', fundacaoId!);
      setPhotos(p);
    } else {
      await deleteStoredFile(photo.uri);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    }
  };

  const handleSignature = async (base64: string) => {
    if (signature) {
      await deleteStoredFile(signature);
    }

    const signaturePath = await saveSignature(base64);
    setSignature(signaturePath);
    if (isEditing && fundacaoId) {
      await updateFundacaoSignature(fundacaoId, signaturePath);
    }
  };

  const updateDadoTecnico = (index: number, valor: string) => {
    setDadosTecnicos((prev) => prev.map((d, i) => (i === index ? { ...d, valor } : d)));
  };

  const handleSave = async () => {
    if (!obraId) { Alert.alert('Erro', 'Selecione uma obra.'); return; }
    if (!diametro || !profundidadeProjeto) { Alert.alert('Erro', 'Preencha diâmetro e profundidade.'); return; }

    setSaving(true);
    try {
      const location = await getCurrentLocation();
      const itensNaoConformes = checklist
        .filter((item) => item.conforme === 2)
        .map((item) => ({ descricao: item.descricao }));
      const statusFinal: FundacaoStatus = itensNaoConformes.length > 0 ? 'com_nc' : status;

      const dadosTecnicosPayload = dadosTecnicos.map((d) => ({
        campo: d.campo,
        valor_numerico: d.valor !== '' && !isNaN(Number(d.valor)) ? Number(d.valor) : null,
        valor_texto: isNaN(Number(d.valor)) ? d.valor : '',
        unidade: d.unidade,
      }));

      if (isEditing) {
        await updateFundacao(fundacaoId!, {
          obra_id: obraId,
          tipo,
          diametro: Number(diametro),
          profundidade_projeto: Number(profundidadeProjeto),
          profundidade_atingida: profundidadeAtingida ? Number(profundidadeAtingida) : null,
          latitude: location.coords?.latitude ?? null,
          longitude: location.coords?.longitude ?? null,
          localizacao_desc: localizacao,
          data,
          observacoes,
          status: statusFinal,
          assinatura_path: signature,
        });
        await saveDadosTecnicos(fundacaoId!, dadosTecnicosPayload);
        for (const item of checklist) {
          await updateFundacaoChecklistItem(item.id, item.conforme, item.observacao);
        }
        await verificarNCFundacao({
          obra_id: obraId,
          fundacao_id: fundacaoId!,
          responsavel: '',
          itensNaoConformes,
        });
      } else {
        const newId = await createFundacao({
          obra_id: obraId,
          tipo,
          diametro: Number(diametro),
          profundidade_projeto: Number(profundidadeProjeto),
          profundidade_atingida: profundidadeAtingida ? Number(profundidadeAtingida) : null,
          latitude: location.coords?.latitude ?? null,
          longitude: location.coords?.longitude ?? null,
          localizacao_desc: localizacao,
          data,
          observacoes,
          status: statusFinal,
          assinatura_path: signature,
        }, checklist.map((item) => ({
          descricao: item.descricao,
          conforme: item.conforme,
          observacao: item.observacao,
          ordem: item.ordem,
        })), dadosTecnicosPayload);

        for (const photo of photos) {
          await addPhoto('fundacao', newId, photo.uri);
        }
        
        try {
          await verificarNCFundacao({
            obra_id: obraId,
            fundacao_id: newId,
            responsavel: '',
            itensNaoConformes,
          });
        } catch (ncError) {
          console.warn('Non-critical error: Could not verify NCs after save.', ncError);
        }
      }
      Alert.alert('Sucesso', isEditing ? 'Fundação atualizada.' : 'Fundação registrada.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving fundacao:', error);
      Alert.alert('Erro', 'Não foi possível salvar a fundação.');
    } finally {
      setSaving(false);
    }
  };

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));
  const dadoTecnicoTemplates = FUNDACAO_DADOS_TECNICOS[tipo] || [];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={isEditing ? 'Editar Fundação' : 'Nova Fundação'}
        showBack
        onBack={() => navigation.goBack()}
        showHome
        onHome={() => navigation.navigate('HomeTab')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FormSection title="Dados Gerais">
          <SelectField label="Obra" value={obraId} options={obraOptions} onSelect={setObraId} />
          <SelectField label="Tipo de Fundação" value={tipo} options={TIPO_OPTIONS} onSelect={(value) => setTipo(value as FundacaoTipo)} />
          {isEditing && <SelectField label="Status" value={status} options={STATUS_OPTIONS} onSelect={(value) => setStatus(value as FundacaoStatus)} />}
          <FormField label="Data" value={data} onChangeText={setData} />
          <FormField label="Localização / Descrição" value={localizacao} onChangeText={setLocalizacao} />
          <FormField label="Diâmetro (mm)" value={diametro} onChangeText={setDiametro} keyboardType="numeric" />
          <FormField label="Profundidade Projeto (m)" value={profundidadeProjeto} onChangeText={setProfundidadeProjeto} keyboardType="numeric" />
          <FormField label="Profundidade Atingida (m)" value={profundidadeAtingida} onChangeText={setProfundidadeAtingida} keyboardType="numeric" />
        </FormSection>

        {dadosTecnicos.length > 0 && (
          <FormSection title="Dados Técnicos">
            {dadosTecnicos.map((d, i) => (
              <FormField
                key={d.campo}
                label={`${dadoTecnicoTemplates[i]?.label || d.campo}${d.unidade ? ` (${d.unidade})` : ''}`}
                value={d.valor}
                onChangeText={(v: string) => updateDadoTecnico(i, v)}
                keyboardType={dadoTecnicoTemplates[i]?.tipo === 'numerico' ? 'numeric' : 'default'}
              />
            ))}
          </FormSection>
        )}

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
          <PhotoPicker photos={photos} entityType="fundacao" entityId={fundacaoId || ''} onPhotosChanged={() => { if (fundacaoId) loadFundacao(); }} onAddPhoto={handleAddPhoto} onDeletePhoto={handleRemovePhoto} />
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
  submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.lg },
  submitButtonText: { ...FONTS.bold, fontSize: 16, color: COLORS.surface },
});
