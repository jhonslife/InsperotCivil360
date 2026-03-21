import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { FormNotice } from '../../components/FormNotice';
import { FormSection } from '../../components/FormSection';
import { SelectField } from '../../components/SelectField';
import { DatePickerField } from '../../components/DatePickerField';
import { PhotoPicker } from '../../components/PhotoPicker';
import { Obra } from '../../models/Obra';
import { Photo } from '../../models/Photo';
import { RNC } from '../../models/RNC';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createRNC, getRNCById, updateRNC } from '../../database/repositories/rncRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { generateRNCPDF } from '../../services/pdfService';
import { GRAVIDADE_LABELS, Gravidade } from '../../constants/inspectionTypes';
import { todayISO } from '../../utils/formatDate';
import { validateRequired } from '../../utils/validators';

const RNC_STATUS_OPTIONS = [
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'fechada', label: 'Fechada' },
];

export function RNCFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const rncId = route.params?.rncId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [rnc, setRNC] = useState<RNC | null>(null);
  const [currentRNCId, setCurrentRNCId] = useState<string | null>(rncId || null);
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState('');
  const [gravidade, setGravidade] = useState<string>('');
  const [responsavel, setResponsavel] = useState('');
  const [prazo, setPrazo] = useState('');
  const [status, setStatus] = useState('aberta');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const loadObras = useCallback(async () => {
    const data = await getActiveObras();
    setObras(data);
  }, []);

  const loadRNC = useCallback(async (id: string) => {
    const r = await getRNCById(id);
    if (r) {
      setRNC(r);
      setCurrentRNCId(r.id);
      setObraId(r.obra_id);
      setData(r.data);
      setDescricao(r.descricao);
      setGravidade(r.gravidade);
      setResponsavel(r.responsavel);
      setPrazo(r.prazo);
      setStatus(r.status);
    }
    const pics = await getPhotosByEntity('rnc', id);
    setPhotos(pics);
  }, []);

  const hasPersistedRNC = !!currentRNCId;

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (currentRNCId) {
        loadRNC(currentRNCId);
      }
    }, [currentRNCId, loadObras, loadRNC])
  );

  const handlePhotosChanged = async () => {
    if (currentRNCId) {
      const pics = await getPhotosByEntity('rnc', currentRNCId);
      setPhotos(pics);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      obraId: validateRequired(obraId, 'Obra'),
      descricao: validateRequired(descricao, 'Descrição'),
      gravidade: validateRequired(gravidade, 'Gravidade'),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== null);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (currentRNCId) {
        await updateRNC(currentRNCId, {
          obra_id: obraId,
          data,
          descricao,
          gravidade: gravidade as Gravidade,
          responsavel,
          prazo,
          status: status as RNC['status'],
        });
        await loadRNC(currentRNCId);
        Alert.alert('Sucesso', 'Alterações salvas com sucesso.');
      } else {
        const newRNC = await createRNC({
          obra_id: obraId,
          data,
          descricao,
          gravidade: gravidade as Gravidade,
          responsavel,
          prazo,
        });
        setCurrentRNCId(newRNC.id);
        await loadRNC(newRNC.id);
        Alert.alert('Sucesso', `RNC #${String(newRNC.numero).padStart(3, '0')} salva com sucesso. Fotos e PDF já estão disponíveis.`);
      }
    } catch (error) {
      console.error('Erro ao salvar RNC:', error);
      Alert.alert('Erro', 'Não foi possível salvar a RNC. Tente novamente.');
    }
  };

  const handleGeneratePDF = async () => {
    if (!rnc) return;
    await generateRNCPDF(rnc, photos);
  };

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));
  const gravidadeOptions = Object.entries(GRAVIDADE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <View style={styles.container}>
      <Header
        title={hasPersistedRNC ? `RNC #${String(rnc?.numero || 0).padStart(3, '0')}` : 'Nova Não Conformidade'}
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
          title={hasPersistedRNC ? 'Registro salvo' : 'RNC em preenchimento'}
          message={hasPersistedRNC
            ? 'Você pode ajustar dados, atualizar o status e anexar evidências antes de gerar o PDF.'
            : 'Salve a RNC para liberar anexos e geração do documento final no mesmo fluxo.'}
          tone={hasPersistedRNC ? 'success' : 'info'}
        />

        <FormSection title="Dados da ocorrência" description="Preencha a identificação da obra, descrição e criticidade da não conformidade.">
          <SelectField
            label="Obra"
            value={obraId}
            options={obraOptions}
            onSelect={setObraId}
            error={errors.obraId}
          />
          <DatePickerField
            label="Data"
            value={data}
            onChange={setData}
          />
          <FormField
            label="Descrição da Não Conformidade"
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descreva a não conformidade encontrada..."
            multiline
            error={errors.descricao}
          />
          <SelectField
            label="Gravidade"
            value={gravidade}
            options={gravidadeOptions}
            onSelect={setGravidade}
            error={errors.gravidade}
          />
          <FormField
            label="Responsável"
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Responsável pela correção"
          />
          <DatePickerField
            label="Prazo"
            value={prazo}
            onChange={setPrazo}
          />
        </FormSection>

        {hasPersistedRNC && (
          <FormSection title="Status" description="Atualize o andamento da tratativa conforme a correção evolui.">
            <SelectField
              label="Status"
              value={status}
              options={RNC_STATUS_OPTIONS}
              onSelect={setStatus}
            />
          </FormSection>
        )}

        <FormSection title="Anexos" description="Use fotos para registrar evidências e apoiar o documento final.">
          {hasPersistedRNC ? (
            <PhotoPicker
              photos={photos}
              entityType="rnc"
              entityId={currentRNCId!}
              onPhotosChanged={handlePhotosChanged}
            />
          ) : (
            <FormNotice
              title="Anexos liberados após o primeiro save"
              message="Assim que a RNC for salva, você poderá adicionar fotos e gerar o PDF sem sair desta tela."
            />
          )}
        </FormSection>

        <FormSection title="Ações" description="Salve para manter o registro atualizado e liberar a emissão do PDF.">
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>
              {hasPersistedRNC ? 'Salvar alterações' : 'Salvar RNC'}
            </Text>
          </TouchableOpacity>

          {hasPersistedRNC && (
            <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF} activeOpacity={0.8}>
              <Text style={styles.pdfButtonText}>Gerar PDF da RNC</Text>
            </TouchableOpacity>
          )}
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
  pdfButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  pdfButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
