import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { ChecklistItemRow } from '../../components/ChecklistItemRow';
import { PhotoPicker } from '../../components/PhotoPicker';
import { SignatureCapture } from '../../components/SignatureCapture';
import { FormField } from '../../components/FormField';
import { Inspection } from '../../models/Inspection';
import { ChecklistItem, ChecklistStatus } from '../../models/ChecklistItem';
import { Photo } from '../../models/Photo';
import {
  createInspection,
  getInspectionById,
  getChecklistItems,
  updateChecklistItem,
  updateInspectionStatus,
  updateInspectionSignature,
  updateInspectionObservacoes,
} from '../../database/repositories/inspectionRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { InspectionType, INSPECTION_TYPE_LABELS } from '../../constants/inspectionTypes';
import { getCurrentLocation } from '../../services/locationService';
import { saveSignature, getPhotoBase64 } from '../../services/photoService';
import { generateInspectionPDF } from '../../services/pdfService';
import { todayISO } from '../../utils/formatDate';

export function InspectionFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tipo, obraId, inspectionId } = route.params || {};

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(inspectionId || null);
  const [showSignature, setShowSignature] = useState(false);
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [itemObservacao, setItemObservacao] = useState('');

  useEffect(() => {
    initInspection();
  }, []);

  const initInspection = async () => {
    try {
      if (inspectionId) {
        await loadExistingInspection(inspectionId);
      } else if (tipo && obraId) {
        const location = await getCurrentLocation();
        const id = await createInspection({
          obra_id: obraId,
          tipo: tipo as InspectionType,
          data: todayISO(),
          local_descricao: '',
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          observacoes: '',
        });
        setCurrentInspectionId(id);
        await loadExistingInspection(id);
      }
    } catch (error) {
      console.error('Error initializing inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingInspection = async (id: string) => {
    const insp = await getInspectionById(id);
    if (insp) {
      setInspection(insp);
      setObservacoes(insp.observacoes || '');
      setSignaturePath(insp.assinatura_path);
    }
    const items = await getChecklistItems(id);
    setChecklistItems(items);
    const pics = await getPhotosByEntity('inspection', id);
    setPhotos(pics);
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const nextStatus: ChecklistStatus = item.conforme === 0 ? 1 : item.conforme === 1 ? 2 : 0;
    await updateChecklistItem(item.id, nextStatus, item.observacao);
    setChecklistItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, conforme: nextStatus } : i))
    );
  };

  const handleItemPress = (item: ChecklistItem) => {
    setSelectedItem(item);
    setItemObservacao(item.observacao || '');
    setShowItemModal(true);
  };

  const handleSaveItemObservacao = async () => {
    if (selectedItem) {
      await updateChecklistItem(selectedItem.id, selectedItem.conforme, itemObservacao);
      setChecklistItems((prev) =>
        prev.map((i) => (i.id === selectedItem.id ? { ...i, observacao: itemObservacao } : i))
      );
      setShowItemModal(false);
      setSelectedItem(null);
    }
  };

  const handlePhotosChanged = async () => {
    if (currentInspectionId) {
      const pics = await getPhotosByEntity('inspection', currentInspectionId);
      setPhotos(pics);
    }
  };

  const handleSaveObservacoes = async () => {
    if (currentInspectionId) {
      await updateInspectionObservacoes(currentInspectionId, observacoes);
    }
  };

  const handleSignatureSave = async (signatureData: string) => {
    if (currentInspectionId) {
      const path = await saveSignature(signatureData);
      await updateInspectionSignature(currentInspectionId, path);
      setSignaturePath(path);
      setShowSignature(false);
    }
  };

  const determineStatus = (): string => {
    const hasNonConform = checklistItems.some((i) => i.conforme === 2);
    const allChecked = checklistItems.every((i) => i.conforme !== 0);
    if (!allChecked) return 'pendente';
    return hasNonConform ? 'nao_conforme' : 'conforme';
  };

  const handleSave = async () => {
    if (!currentInspectionId) return;

    await handleSaveObservacoes();
    const status = determineStatus();
    await updateInspectionStatus(currentInspectionId, status);

    Alert.alert('Sucesso', 'Inspeção salva com sucesso!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleGenerateReport = async () => {
    if (!currentInspectionId || !inspection) return;

    await handleSaveObservacoes();
    const status = determineStatus();
    await updateInspectionStatus(currentInspectionId, status);

    const updatedInspection = await getInspectionById(currentInspectionId);
    if (!updatedInspection) return;

    let sigBase64: string | null = null;
    if (signaturePath) {
      sigBase64 = await getPhotoBase64(signaturePath);
    }

    await generateInspectionPDF(updatedInspection, checklistItems, photos, sigBase64);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Carregando..." showBack onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparando inspeção...</Text>
        </View>
      </View>
    );
  }

  const title = inspection
    ? `Inspeção de ${INSPECTION_TYPE_LABELS[inspection.tipo]}`
    : 'Nova Inspeção';

  return (
    <View style={styles.container}>
      <Header
        title={title}
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
        {inspection?.obra_nome && (
          <View style={styles.obraInfo}>
            <Text style={styles.obraName}>
              Inspeção de {INSPECTION_TYPE_LABELS[inspection.tipo]} - {inspection.obra_nome}
            </Text>
            {inspection.latitude && (
              <Text style={styles.coords}>
                {inspection.data} | GPS: {inspection.latitude.toFixed(4)}, {inspection.longitude?.toFixed(4)}
              </Text>
            )}
          </View>
        )}

        {/* Checklist */}
        <View style={styles.checklist}>
          {checklistItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              descricao={item.descricao}
              conforme={item.conforme}
              observacao={item.observacao}
              onToggle={() => handleToggleItem(item)}
              onPress={() => handleItemPress(item)}
            />
          ))}
        </View>

        {/* Photos */}
        {currentInspectionId && (
          <PhotoPicker
            photos={photos}
            entityType="inspection"
            entityId={currentInspectionId}
            onPhotosChanged={handlePhotosChanged}
          />
        )}

        {/* Observações */}
        <TouchableOpacity style={styles.obsButton}>
          <MaterialCommunityIcons name="note-text" size={20} color={COLORS.surface} />
          <Text style={styles.obsButtonText}>Observações</Text>
        </TouchableOpacity>
        <FormField
          label=""
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Adicionar observações..."
          multiline
        />

        {/* Assinatura */}
        <TouchableOpacity
          style={styles.signatureButton}
          onPress={() => setShowSignature(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="draw" size={20} color={COLORS.surface} />
          <Text style={styles.signatureButtonText}>
            {signaturePath ? 'Assinatura Capturada ✓' : 'Assinatura Digital'}
          </Text>
        </TouchableOpacity>

        {/* Actions */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={handleGenerateReport} activeOpacity={0.8}>
          <MaterialCommunityIcons name="file-pdf-box" size={20} color={COLORS.surface} />
          <Text style={styles.reportButtonText}>Gerar Relatório</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Signature Modal */}
      <SignatureCapture
        visible={showSignature}
        onSave={handleSignatureSave}
        onCancel={() => setShowSignature(false)}
      />

      {/* Item observation modal */}
      <Modal visible={showItemModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowItemModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItem?.descricao}</Text>
            <TextInput
              style={styles.modalInput}
              value={itemObservacao}
              onChangeText={setItemObservacao}
              placeholder="Observação do item..."
              multiline
              placeholderTextColor={COLORS.disabled}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowItemModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveItemObservacao}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },
  obraInfo: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  obraName: {
    ...FONTS.bold,
    fontSize: 15,
  },
  coords: {
    ...FONTS.small,
    marginTop: 4,
  },
  checklist: {
    backgroundColor: COLORS.surface,
  },
  obsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  obsButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  signatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  signatureButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  reportButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  reportButtonText: {
    color: COLORS.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.large,
  },
  modalTitle: {
    ...FONTS.bold,
    marginBottom: SPACING.md,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  modalCancel: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalSave: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  modalSaveText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
