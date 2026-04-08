import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface SignatureCaptureProps {
  visible: boolean;
  onSave: (signature: string) => void | Promise<void>;
  onCancel: () => void;
}

export function SignatureCapture({ visible, onSave, onCancel }: SignatureCaptureProps) {
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleSave = async (signature: string) => {
    await onSave(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Assinatura Digital</Text>
        <Text style={styles.subtitle}>Assine no espaço abaixo</Text>

        <View style={styles.signatureContainer}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSave}
            onEmpty={() => {}}
            webStyle={`.m-signature-pad--footer { display: none; } .m-signature-pad { box-shadow: none; border: none; } body, html { width: 100%; height: 100%; }`}
            backgroundColor="white"
            penColor="#1A1A2E"
            dotSize={2}
            minWidth={1.5}
            maxWidth={3}
          />
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleConfirm}>
            <Text style={styles.saveText}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: SPACING.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  signatureContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  clearButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  clearText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});
