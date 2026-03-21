import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { DatePickerField } from '../../components/DatePickerField';
import { PhotoPicker } from '../../components/PhotoPicker';
import { Obra } from '../../models/Obra';
import { DiaryEntry } from '../../models/DiaryEntry';
import { Photo } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createDiaryEntry, getDiaryById } from '../../database/repositories/diaryRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { generateDiaryPDF } from '../../services/pdfService';
import { CLIMA_ICONS, ClimaType } from '../../constants/inspectionTypes';
import { todayISO } from '../../utils/formatDate';
import { validateRequired } from '../../utils/validators';

export function DiaryFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const diaryId = route.params?.diaryId;
  const isViewing = !!diaryId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState(todayISO());
  const [equipe, setEquipe] = useState('');
  const [clima, setClima] = useState<string>('ensolarado');
  const [atividades, setAtividades] = useState('');
  const [ocorrencias, setOcorrencias] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isViewing) loadEntry();
    }, [])
  );

  const loadObras = async () => {
    const data = await getActiveObras();
    setObras(data);
  };

  const loadEntry = async () => {
    const e = await getDiaryById(diaryId);
    if (e) {
      setEntry(e);
      setObraId(e.obra_id);
      setData(e.data);
      setEquipe(e.equipe);
      setClima(e.clima);
      setAtividades(e.atividades);
      setOcorrencias(e.ocorrencias || '');
    }
    const pics = await getPhotosByEntity('diary', diaryId);
    setPhotos(pics);
  };

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
      await createDiaryEntry({
        obra_id: obraId,
        data,
        equipe,
        clima: clima as ClimaType,
        atividades,
        ocorrencias: ocorrencias || '',
      });
      Alert.alert('Sucesso', 'Registro do diário salvo!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar diário:', error);
      Alert.alert('Erro', 'Erro ao salvar registro.');
    }
  };

  const handlePhotosChanged = async () => {
    if (diaryId || entry?.id) {
      const pics = await getPhotosByEntity('diary', diaryId || entry!.id);
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
        title={isViewing ? 'Diário de Obra' : 'Novo Registro'}
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

        {isViewing && entry && (
          <PhotoPicker
            photos={photos}
            entityType="diary"
            entityId={diaryId || entry.id}
            onPhotosChanged={handlePhotosChanged}
          />
        )}

        {!isViewing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Salvar Registro</Text>
          </TouchableOpacity>
        )}

        {isViewing && (
          <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF} activeOpacity={0.8}>
            <Text style={styles.pdfButtonText}>Gerar Relatório PDF</Text>
          </TouchableOpacity>
        )}
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
