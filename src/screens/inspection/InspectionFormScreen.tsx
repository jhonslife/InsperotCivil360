import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { ChecklistItemRow } from '../../components/ChecklistItemRow';
import { PhotoPicker } from '../../components/PhotoPicker';
import { SignatureCapture } from '../../components/SignatureCapture';
import { FormField } from '../../components/FormField';
import { Inspection, InspectionStatus } from '../../models/Inspection';
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
import { addPhoto, getPhotosByEntity } from '../../database/repositories/photoRepository';
import { InspectionType, INSPECTION_TYPE_LABELS, INSPECTION_CHECKLISTS } from '../../constants/inspectionTypes';
import { getCurrentLocation } from '../../services/locationService';
import { replaceSignatureFile, getPhotoBase64, deleteStoredFile } from '../../services/photoService';
import { generateInspectionPDF } from '../../services/pdfService';
import { todayISO } from '../../utils/formatDate';
import { generateId } from '../../utils/generateId';
import { buildPersistenceAlertMessage, runPersistenceTasks } from '../../utils/persistence';

function createDraftChecklist(tipo: InspectionType): ChecklistItem[] {
  return INSPECTION_CHECKLISTS[tipo].map((item) => ({
    id: generateId(),
    inspection_id: '',
    descricao: item.descricao,
    conforme: 0,
    observacao: '',
    ordem: item.ordem,
  }));
}

function createDraftPhoto(uri: string): Photo {
  return {
    id: generateId(),
    entity_type: 'inspection',
    entity_id: '',
    uri,
    legenda: '',
    created_at: new Date().toISOString(),
  };
}

export function InspectionFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tipo, obraId, inspectionId } = route.params || {};
  const isEditing = !!inspectionId;

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [draftPhotos, setDraftPhotos] = useState<Photo[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [currentInspectionId, setCurrentInspectionId] = useState<string | null>(inspectionId || null);
  const [showSignature, setShowSignature] = useState(false);
  const [signaturePath, setSignaturePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [itemObservacao, setItemObservacao] = useState('');

  const initInspection = useCallback(async () => {
    try {
      if (inspectionId) {
        await loadExistingInspection(inspectionId);
      } else if (tipo && obraId) {
        setInspection(null);
        setChecklistItems(createDraftChecklist(tipo as InspectionType));
        setPhotos([]);
        setDraftPhotos([]);
        setObservacoes('');
        setSignaturePath(null);
        setCurrentInspectionId(null);
      }
    } catch (error) {
      console.error('Error initializing inspection:', error);
    } finally {
      setLoading(false);
    }
  }, [inspectionId, obraId, tipo]);

  useEffect(() => {
    initInspection();
  }, [initInspection]);

  const loadExistingInspection = async (id: string) => {
    setCurrentInspectionId(id);
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
    setDraftPhotos([]);
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const nextStatus: ChecklistStatus = item.conforme === 0 ? 1 : item.conforme === 1 ? 2 : 0;

    if (currentInspectionId) {
      await updateChecklistItem(item.id, nextStatus, item.observacao);
    }

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
      if (currentInspectionId) {
        await updateChecklistItem(selectedItem.id, selectedItem.conforme, itemObservacao);
      }

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

  const handleAddDraftPhoto = async (uri: string) => {
    setDraftPhotos((prev) => [...prev, createDraftPhoto(uri)]);
  };

  const handleDeleteDraftPhoto = async (photo: Photo) => {
    await deleteStoredFile(photo.uri);
    setDraftPhotos((prev) => prev.filter((item) => item.id !== photo.id));
  };

  const syncDraftPhotos = async (inspectionEntityId: string): Promise<Photo[]> => {
    if (draftPhotos.length === 0) {
      return currentInspectionId ? photos : [];
    }

    for (const photo of draftPhotos) {
      await addPhoto('inspection', inspectionEntityId, photo.uri, photo.legenda);
    }

    const persistedPhotos = await getPhotosByEntity('inspection', inspectionEntityId);
    setPhotos(persistedPhotos);
    setDraftPhotos([]);
    return persistedPhotos;
  };

  const handleSaveObservacoes = async () => {
    if (currentInspectionId) {
      await updateInspectionObservacoes(currentInspectionId, observacoes);
    }
  };

  const handleSignatureSave = async (signatureData: string) => {
    const path = await replaceSignatureFile(
      signatureData,
      signaturePath,
      currentInspectionId ? async (nextPath: string) => updateInspectionSignature(currentInspectionId, nextPath) : undefined
    );
    setSignaturePath(path);
  };

  const determineStatus = (): InspectionStatus => {
    const hasNonConform = checklistItems.some((i) => i.conforme === 2);
    const allChecked = checklistItems.every((i) => i.conforme !== 0);
    if (!allChecked) return 'pendente';
    return hasNonConform ? 'nao_conforme' : 'conforme';
  };

  const persistInspection = async (): Promise<{ id: string; inspection: Inspection; warnings: string[] } | null> => {
    const status = determineStatus();

    if (currentInspectionId) {
      await handleSaveObservacoes();
      await updateInspectionStatus(currentInspectionId, status);
      const warnings = await runPersistenceTasks([
        {
          label: 'vinculação de fotos',
          run: async () => {
            await syncDraftPhotos(currentInspectionId);
          },
        },
      ]);
      const updatedInspection = await getInspectionById(currentInspectionId);

      if (!updatedInspection) {
        return null;
      }

      setInspection(updatedInspection);
      return { id: currentInspectionId, inspection: updatedInspection, warnings };
    }

    if (!tipo || !obraId) {
      Alert.alert('Erro', 'Dados da inspeção incompletos.');
      return null;
    }

    const locationResult = await getCurrentLocation();
    if (locationResult.message) {
      Alert.alert('Localização', locationResult.message);
    }

    const id = await createInspection({
      obra_id: obraId,
      tipo: tipo as InspectionType,
      data: todayISO(),
      local_descricao: '',
      latitude: locationResult.coords?.latitude ?? null,
      longitude: locationResult.coords?.longitude ?? null,
      observacoes,
      status,
      assinatura_path: signaturePath,
      checklistItems: checklistItems.map((item) => ({
        descricao: item.descricao,
        ordem: item.ordem,
        conforme: item.conforme,
        observacao: item.observacao,
      })),
    });

    const createdInspection = await getInspectionById(id);
    if (!createdInspection) {
      return null;
    }

    setCurrentInspectionId(id);
    setInspection(createdInspection);
    const warnings = await runPersistenceTasks([
      {
        label: 'vinculação de fotos',
        run: async () => {
          await syncDraftPhotos(id);
        },
      },
    ]);
    return { id, inspection: createdInspection, warnings };
  };

  const handleSave = async () => {
    try {
      const persisted = await persistInspection();
      if (!persisted) return;

      Alert.alert(
        persisted.warnings.length > 0 ? 'Salvo com avisos' : 'Sucesso',
        buildPersistenceAlertMessage('Inspeção salva com sucesso!', persisted.warnings),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Erro ao salvar inspeção:', error);
      Alert.alert('Erro', 'Não foi possível salvar a inspeção.');
    }
  };

  const handleGenerateReport = async () => {
    try {
      const persisted = await persistInspection();
      if (!persisted) return;

      const reportPhotos = currentInspectionId || draftPhotos.length === 0
        ? photos.length > 0
          ? photos
          : await getPhotosByEntity('inspection', persisted.id)
        : await getPhotosByEntity('inspection', persisted.id);

      let sigBase64: string | null = null;
      if (signaturePath) {
        sigBase64 = await getPhotoBase64(signaturePath);
      }

      await generateInspectionPDF(persisted.inspection, checklistItems, reportPhotos, sigBase64);
    } catch (error) {
      console.error('Erro ao gerar relatório da inspeção:', error);
      Alert.alert('Erro', 'Não foi possível salvar a inspeção antes de gerar o relatório.');
    }
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
    : tipo
      ? `Nova Inspeção de ${INSPECTION_TYPE_LABELS[tipo as InspectionType]}`
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
        {currentInspectionId ? (
          <PhotoPicker
            photos={photos}
            entityType="inspection"
            entityId={currentInspectionId}
            onPhotosChanged={handlePhotosChanged}
          />
        ) : (
          <>
            <View style={styles.pendingCard}>
              <MaterialCommunityIcons name="image-multiple-outline" size={20} color={COLORS.primary} />
              <View style={styles.pendingContent}>
                <Text style={styles.pendingTitle}>Fotos em rascunho</Text>
                <Text style={styles.pendingText}>
                  Você já pode anexar fotos. Elas serão vinculadas automaticamente quando a inspeção for salva.
                </Text>
              </View>
            </View>
            <PhotoPicker
              photos={draftPhotos}
              entityType="inspection"
              onPhotosChanged={() => undefined}
              onAddPhoto={handleAddDraftPhoto}
              onDeletePhoto={handleDeleteDraftPhoto}
            />
          </>
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
          <Text style={styles.saveButtonText}>{isEditing ? 'Atualizar' : 'Salvar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.reportButton} onPress={handleGenerateReport} activeOpacity={0.8}>
          <MaterialCommunityIcons name="file-pdf-box" size={20} color={COLORS.surface} />
          <Text style={styles.reportButtonText}>Gerar Relatório</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Signature Modal */}
      <SignatureCapture
        visible={showSignature}
        onSave={async (signatureData) => {
          try {
            await handleSignatureSave(signatureData);
            setShowSignature(false);
          } catch (error) {
            console.error('Erro ao salvar assinatura da inspeção:', error);
            Alert.alert('Erro', 'Não foi possível salvar a assinatura.');
          }
        }}
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
  pendingCard: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pendingContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  pendingTitle: {
    ...FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  pendingText: {
    ...FONTS.small,
    color: COLORS.textSecondary,
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
