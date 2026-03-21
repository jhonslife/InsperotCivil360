import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../../constants/theme';
import { Header } from '../../components/Header';
import { FormField } from '../../components/FormField';
import { SelectField } from '../../components/SelectField';
import { DatePickerField } from '../../components/DatePickerField';
import { PhotoPicker } from '../../components/PhotoPicker';
import { Obra } from '../../models/Obra';
import { Ensaio } from '../../models/Ensaio';
import { Photo } from '../../models/Photo';
import { getActiveObras } from '../../database/repositories/obraRepository';
import { createEnsaio, getEnsaioById } from '../../database/repositories/ensaioRepository';
import { getPhotosByEntity } from '../../database/repositories/photoRepository';
import { generateEnsaioPDF } from '../../services/pdfService';
import { ENSAIO_TYPE_LABELS, EnsaioTipo, ENSAIO_LIMITS } from '../../constants/inspectionTypes';
import { todayISO } from '../../utils/formatDate';
import { validateRequired } from '../../utils/validators';

export function EnsaioFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const ensaioId = route.params?.ensaioId;
  const isViewing = !!ensaioId;

  const [obras, setObras] = useState<Obra[]>([]);
  const [ensaio, setEnsaio] = useState<Ensaio | null>(null);
  const [obraId, setObraId] = useState('');
  const [tipoEnsaio, setTipoEnsaio] = useState<string>('');
  const [data, setData] = useState(todayISO());
  const [local, setLocal] = useState('');
  const [situacao, setSituacao] = useState<string>('conforme');
  const [resultado, setResultado] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Concreto
  const [slump, setSlump] = useState('');
  const [temperatura, setTemperatura] = useState('');
  const [corpoProva, setCorpoProva] = useState('');

  // Graute
  const [fluidez, setFluidez] = useState('');
  const [resistencia, setResistencia] = useState('');

  // Pavimentação
  const [compactacao, setCompactacao] = useState('');
  const [deflexao, setDeflexao] = useState('');

  const [alertMessages, setAlertMessages] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadObras();
      if (isViewing) loadEnsaio();
    }, [])
  );

  const loadObras = async () => {
    const data = await getActiveObras();
    setObras(data);
  };

  const loadEnsaio = async () => {
    const e = await getEnsaioById(ensaioId);
    if (e) {
      setEnsaio(e);
      setObraId(e.obra_id);
      setTipoEnsaio(e.tipo_ensaio);
      setData(e.data);
      setLocal(e.local);
      setSituacao(e.situacao);
      setResultado(e.resultado);
      if (e.slump != null) setSlump(String(e.slump));
      if (e.temperatura != null) setTemperatura(String(e.temperatura));
      if (e.corpo_prova) setCorpoProva(e.corpo_prova);
      if (e.fluidez != null) setFluidez(String(e.fluidez));
      if (e.resistencia != null) setResistencia(String(e.resistencia));
      if (e.compactacao != null) setCompactacao(String(e.compactacao));
      if (e.deflexao != null) setDeflexao(String(e.deflexao));
      if (e.alerta) setAlertMessages(e.alerta.split('; '));
    }
    const pics = await getPhotosByEntity('ensaio', ensaioId);
    setPhotos(pics);
  };

  const checkAlerts = () => {
    const alerts: string[] = [];
    const tipo = tipoEnsaio as EnsaioTipo;

    if (tipo === 'concreto') {
      const limits = ENSAIO_LIMITS.concreto;
      const s = parseFloat(slump);
      const t = parseFloat(temperatura);
      if (!isNaN(s) && (s < limits.slump.min || s > limits.slump.max)) {
        alerts.push(`Valor fora do padrão recomendado: Slump ${s}mm (${limits.slump.min}-${limits.slump.max}mm)`);
      }
      if (!isNaN(t) && (t < limits.temperatura.min || t > limits.temperatura.max)) {
        alerts.push(`Valor fora do padrão recomendado: Temperatura ${t}°C (${limits.temperatura.min}-${limits.temperatura.max}°C)`);
      }
    } else if (tipo === 'graute') {
      const limits = ENSAIO_LIMITS.graute;
      const f = parseFloat(fluidez);
      if (!isNaN(f) && (f < limits.fluidez.min || f > limits.fluidez.max)) {
        alerts.push(`Valor fora do padrão recomendado: Fluidez ${f}s (${limits.fluidez.min}-${limits.fluidez.max}s)`);
      }
    } else if (tipo === 'pavimentacao') {
      const limits = ENSAIO_LIMITS.pavimentacao;
      const c = parseFloat(compactacao);
      const d = parseFloat(deflexao);
      if (!isNaN(c) && (c < limits.compactacao.min || c > limits.compactacao.max)) {
        alerts.push(`Valor fora do padrão recomendado: Compactação ${c}% (mín ${limits.compactacao.min}%)`);
      }
      if (!isNaN(d) && (d < limits.deflexao.min || d > limits.deflexao.max)) {
        alerts.push(`Valor fora do padrão recomendado: Deflexão ${d} (máx ${limits.deflexao.max} x 0.01mm)`);
      }
    }

    setAlertMessages(alerts);
    return alerts;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string | null> = {
      obraId: validateRequired(obraId, 'Obra'),
      tipoEnsaio: validateRequired(tipoEnsaio, 'Tipo de ensaio'),
      local: validateRequired(local, 'Local'),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e !== null);
  };

  const handleSave = async () => {
    if (!validate()) return;
    const alerts = checkAlerts();

    try {
      const newEnsaio = await createEnsaio({
        obra_id: obraId,
        tipo_ensaio: tipoEnsaio as EnsaioTipo,
        data,
        local,
        slump: slump ? parseFloat(slump) : null,
        temperatura: temperatura ? parseFloat(temperatura) : null,
        corpo_prova: corpoProva,
        fluidez: fluidez ? parseFloat(fluidez) : null,
        resistencia: resistencia ? parseFloat(resistencia) : null,
        compactacao: compactacao ? parseFloat(compactacao) : null,
        deflexao: deflexao ? parseFloat(deflexao) : null,
        resultado,
        situacao: situacao as 'conforme' | 'nao_conforme',
      });

      if (alerts.length > 0) {
        Alert.alert('⚠️ Atenção', alerts.join('\n\n'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Sucesso', 'Ensaio registrado com sucesso!');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao salvar ensaio:', error);
      Alert.alert('Erro', 'Erro ao salvar ensaio.');
    }
  };

  const handlePhotosChanged = async () => {
    if (ensaioId || ensaio?.id) {
      const pics = await getPhotosByEntity('ensaio', ensaioId || ensaio!.id);
      setPhotos(pics);
    }
  };

  const handleGeneratePDF = async () => {
    if (!ensaio) return;
    await generateEnsaioPDF(ensaio, photos);
  };

  const obraOptions = obras.map((o) => ({ value: o.id, label: o.nome }));
  const tipoOptions = Object.entries(ENSAIO_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
  const situacaoOptions = [
    { value: 'conforme', label: 'Conforme' },
    { value: 'nao_conforme', label: 'Não Conforme' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title={isViewing ? ENSAIO_TYPE_LABELS[(ensaio?.tipo_ensaio as EnsaioTipo) || 'concreto'] : 'Novo Ensaio'}
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
        <SelectField
          label="Tipo de Ensaio"
          value={tipoEnsaio}
          options={tipoOptions}
          onSelect={(v) => { setTipoEnsaio(v); setAlertMessages([]); }}
          error={errors.tipoEnsaio}
        />
        <DatePickerField label="Data" value={data} onChange={setData} />
        <FormField
          label="Local"
          value={local}
          onChangeText={setLocal}
          placeholder="Local do ensaio"
          error={errors.local}
        />

        {/* Dynamic fields based on type */}
        {tipoEnsaio === 'concreto' && (
          <>
            <FormField
              label="Slump - Abatimento (mm)"
              value={slump}
              onChangeText={(v) => { setSlump(v); }}
              placeholder="Ex: 100"
              keyboardType="decimal-pad"
            />
            <FormField
              label="Temperatura (°C)"
              value={temperatura}
              onChangeText={setTemperatura}
              placeholder="Ex: 28"
              keyboardType="decimal-pad"
            />
            <FormField
              label="Corpo de Prova"
              value={corpoProva}
              onChangeText={setCorpoProva}
              placeholder="Identificação do CP"
            />
          </>
        )}

        {tipoEnsaio === 'graute' && (
          <>
            <FormField
              label="Fluidez (s)"
              value={fluidez}
              onChangeText={setFluidez}
              placeholder="Ex: 25"
              keyboardType="decimal-pad"
            />
            <FormField
              label="Resistência (MPa)"
              value={resistencia}
              onChangeText={setResistencia}
              placeholder="Ex: 30"
              keyboardType="decimal-pad"
            />
          </>
        )}

        {tipoEnsaio === 'pavimentacao' && (
          <>
            <FormField
              label="Compactação (%)"
              value={compactacao}
              onChangeText={setCompactacao}
              placeholder="Ex: 98"
              keyboardType="decimal-pad"
            />
            <FormField
              label="Deflexão - Viga Benkelman (x 0.01mm)"
              value={deflexao}
              onChangeText={setDeflexao}
              placeholder="Ex: 75"
              keyboardType="decimal-pad"
            />
          </>
        )}

        <FormField
          label="Resultado"
          value={resultado}
          onChangeText={setResultado}
          placeholder="Resultado geral do ensaio"
          multiline
        />

        <SelectField
          label="Situação"
          value={situacao}
          options={situacaoOptions}
          onSelect={setSituacao}
        />

        {/* Alerts */}
        {alertMessages.length > 0 && (
          <View style={styles.alertContainer}>
            {alertMessages.map((msg, idx) => (
              <View key={idx} style={styles.alertBox}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{msg}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Photos */}
        {(isViewing && ensaio) && (
          <PhotoPicker
            photos={photos}
            entityType="ensaio"
            entityId={ensaioId || ensaio.id}
            onPhotosChanged={handlePhotosChanged}
          />
        )}

        {!isViewing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Registrar Ensaio</Text>
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
  alertContainer: {
    marginVertical: SPACING.sm,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
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
