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
import { DiaryEntry } from '../../models/DiaryEntry';
import { Photo } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createDiaryEntry, getDiaryById, updateDiaryEntry } from '../../database/repositories/diaryRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { generateDiaryPDF } from '../../services/pdfService';
import { CLIMA_ICONS, ClimaType } from '../../constants/inspectionTypes';
import { todayISO } from '../../utils/formatDate';
import { validateRequired } from '../../utils/validators';

export function DiaryFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const diaryId = route.params?.diaryId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [currentDiaryId, setCurrentDiaryId] = useState<string | null>(diaryId || null);
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState(todayISO());
  const [equipe, setEquipe] = useState('');
  const [clima, setClima] = useState<string>('ensolarado');
  const [atividades, setAtividades] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const loadObras = useCallback(async () => {
    const data = await getActiveObras();
    setObras(data);
  }, []);

  const loadEntry = useCallback(async (id: string) => {
    const e = await getDiaryById(id);
    if (e) {
      setEntry(e);
      setCurrentDiaryId(e.id);
      setObraId(e.obra_id);
      setData(e.data);
      setEquipe(e.equipe);
      setClima(e.clima);
      setAtividades(e.atividades);
      setOcorrencias(e.ocorrencias || '');
    }
    const pics = await getPhotosByEntity('diary', id);
    setPhotos(pics);
  }, []);

  const hasPersistedDiary = !!currentDiaryId;

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (currentDiaryId) {
        loadEntry(currentDiaryId);
      }
    }, [currentDiaryId, loadEntry, loadObras])
  );

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      obraId: validateRequired(obraId, 'Obra'),
      equipe: validateRequired(equipe, 'Equipe'),
      atividades: validateRequired(atividades, 'Atividades'),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== null);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      const payload = {
        obra_id: obraId,
        data,
        equipe,
        clima: clima as ClimaType,
        atividades,
        ocorrencias: ocorrencias || '',
      };

      if (currentDiaryId) {
        await updateDiaryEntry(currentDiaryId, payload);
        await loadEntry(currentDiaryId);
        Alert.alert('Sucesso', 'Alterações salvas com sucesso.');
      } else {
        const createdEntry = await createDiaryEntry(payload);
        setCurrentDiaryId(createdEntry.id);
        await loadEntry(createdEntry.id);
        Alert.alert('Sucesso', 'Registro salvo com sucesso. Fotos e PDF já estão disponíveis.');
      }
    } catch (error) {
      console.error('Erro ao salvar diário:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro. Tente novamente.');
    }
  };

  const handlePhotosChanged = async () => {
    if (currentDiaryId) {
      const pics = await getPhotosByEntity('diary', currentDiaryId);
      setPhotos(pics);
    }
  };

  const handleGeneratePDF = async () => {
    if (!entry) return;
    await generateDiaryPDF(entry, photos);
  };

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));
  const climaOptions: { value: ClimaType; label: string }[] = [
    { value: 'ensolarado', label: `${CLIMA_ICONS.ensolarado} Ensolarado` },
    { value: 'nublado', label: `${CLIMA_ICONS.nublado} Nublado` },
    { value: 'chuvoso', label: `${CLIMA_ICONS.chuvoso} Chuvoso` },
    { value: 'parcialmente_nublado', label: `${CLIMA_ICONS.parcialmente_nublado} Parcialmente Nublado` },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={hasPersistedDiary ? 'Diário de Obra' : 'Novo Registro'}
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
          title={hasPersistedDiary ? 'Registro salvo' : 'Diário em preenchimento'}
          message={hasPersistedDiary
            ? 'Você pode complementar informações do dia, anexar fotos e gerar o PDF deste registro.'
            : 'Salve o registro para liberar anexos e o relatório em PDF sem sair desta tela.'}
          tone={hasPersistedDiary ? 'success' : 'info'}
        />

        <FormSection title="Dados do dia" description="Informe obra, data e condições gerais antes de detalhar a execução.">
          <SelectField
            label="Obra"
            value={obraId}
            options={obraOptions}
            onSelect={setObraId}
            error={errors.obraId}
          />
          <DatePickerField label="Data" value={data} onChange={setData} />

          <SelectField
            label="Clima"
            value={clima}
            options={climaOptions}
            onSelect={setClima}
          />
        </FormSection>

        <FormSection title="Atividades e ocorrências" description="Descreva a equipe em campo, o que foi executado e qualquer intercorrência relevante.">
          <FormField
            label="Equipe em Campo"
            value={equipe}
            onChangeText={setEquipe}
            placeholder="Ex: 3 pedreiros, 2 serventes, 1 encarregado"
            multiline
            error={errors.equipe}
          />

          <FormField
            label="Atividades Realizadas"
            value={atividades}
            onChangeText={setAtividades}
            placeholder="Descreva as atividades desenvolvidas no dia"
            multiline
            error={errors.atividades}
          />

          <FormField
            label="Ocorrências (opcional)"
            value={ocorrencias}
            onChangeText={setOcorrencias}
            placeholder="Registre ocorrências, paralisações, acidentes, etc."
            multiline
          />
        </FormSection>

        <FormSection title="Anexos" description="Inclua fotos do dia para compor o histórico da obra e o relatório final.">
          {hasPersistedDiary ? (
            <PhotoPicker
              photos={photos}
              entityType="diary"
              entityId={currentDiaryId!}
              onPhotosChanged={handlePhotosChanged}
            />
          ) : (
            <FormNotice
              title="Anexos liberados após o primeiro save"
              message="Assim que o diário for salvo, você poderá adicionar fotos e gerar o PDF sem sair desta tela."
            />
          )}
        </FormSection>

        <FormSection title="Ações" description="Salve para manter o histórico do dia atualizado e liberar seus anexos e relatório.">
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>{hasPersistedDiary ? 'Salvar alterações' : 'Salvar registro'}</Text>
          </TouchableOpacity>

          {hasPersistedDiary && (
            <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF} activeOpacity={0.8}>
              <Text style={styles.pdfButtonText}>Gerar PDF do diário</Text>
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
    marginTop: SPACING.md,
  },
  pdfButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
