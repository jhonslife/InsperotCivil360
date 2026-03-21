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
import { Photo } from '../../models/Photo';
import { RNC } from '../../models/RNC';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createRNC, getRNCById, updateRNCStatus } from '../../database/repositories/rncRepository';
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
  const isEditing = !!rncId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [rnc, setRNC] = useState<RNC | null>(null);
  const [obraId, setObraId] = useState('');
  const [data, setData] = useState(todayISO());
  const [descricao, setDescricao] = useState('');
  const [gravidade, setGravidade] = useState<string>('');
  const [responsavel, setResponsavel] = useState('');
  const [prazo, setPrazo] = useState('');
  const [status, setStatus] = useState('aberta');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isEditing) loadRNC();
    }, [])
  );

  const loadObras = async () => {
    const data = await getActiveObras();
    setObras(data);
  };

  const loadRNC = async () => {
    const r = await getRNCById(rncId);
    if (r) {
      setRNC(r);
      setObraId(r.obra_id);
      setData(r.data);
      setDescricao(r.descricao);
      setGravidade(r.gravidade);
      setResponsavel(r.responsavel);
      setPrazo(r.prazo);
      setStatus(r.status);
    }
    const pics = await getPhotosByEntity('rnc', rncId);
    setPhotos(pics);
  };

  const handlePhotosChanged = async () => {
    if (rncId || rnc?.id) {
      const pics = await getPhotosByEntity('rnc', rncId || rnc!.id);
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
      if (isEditing) {
        await updateRNCStatus(rncId, status);
        Alert.alert('Sucesso', 'RNC atualizada!');
      } else {
        const newRNC = await createRNC({
          obra_id: obraId,
          data,
          descricao,
          gravidade: gravidade as Gravidade,
          responsavel,
          prazo,
        });
        setRNC(newRNC);
        Alert.alert('Sucesso', `RNC #${String(newRNC.numero).padStart(3, '0')} registrada!`);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar RNC:', error);
      Alert.alert('Erro', 'Erro ao salvar RNC.');
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
        title={isEditing ? `RNC #${String(rnc?.numero || 0).padStart(3, '0')}` : 'Nova Não Conformidade'}
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

        {isEditing && (
          <SelectField
            label="Status"
            value={status}
            options={RNC_STATUS_OPTIONS}
            onSelect={setStatus}
          />
        )}

        {/* Photos */}
        {(isEditing || rnc?.id) && (
          <PhotoPicker
            photos={photos}
            entityType="rnc"
            entityId={rncId || rnc!.id}
            onPhotosChanged={handlePhotosChanged}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Atualizar RNC' : 'Registrar RNC'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF} activeOpacity={0.8}>
            <Text style={styles.pdfButtonText}>Gerar RNC em PDF</Text>
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
    marginTop: SPACING.sm,
  },
  pdfButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
});
