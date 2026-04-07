import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Bottom Tab (5 tabs only)
export type BottomTabParamList = {
  HomeTab: undefined;
  ObrasTab: NavigatorScreenParams<ObrasStackParamList>;
  InspectionTab: NavigatorScreenParams<InspectionStackParamList>;
  EnsaiosTab: NavigatorScreenParams<EnsaiosStackParamList>;
  MoreTab: NavigatorScreenParams<MoreStackParamList>;
};

// Obras Stack
export type ObrasStackParamList = {
  ObrasList: undefined;
  ObraForm: { obraId?: string } | undefined;
};

// Inspection Stack (includes all specialized modules)
export type InspectionStackParamList = {
  InspectionList: undefined;
  InspectionType: undefined;
  InspectionForm: { inspectionId?: string; obraId?: string; tipo?: string };
  // Fundações
  FundacaoList: { obraId?: string } | undefined;
  FundacaoForm: { fundacaoId?: string; obraId?: string; tipo?: string } | undefined;
  // Concreto & Estrutura
  ConcretoList: { obraId?: string } | undefined;
  ConcretoForm: { concretoId?: string; obraId?: string } | undefined;
  ArmaduraForm: { armaduraId?: string; obraId?: string } | undefined;
  FormaForm: { formaId?: string; obraId?: string } | undefined;
  RompimentoCPForm: { rompimentoId?: string; obraId?: string; concretoInspecaoId?: string } | undefined;
  // Vedação
  VedacaoList: { obraId?: string } | undefined;
  VedacaoForm: { vedacaoId?: string; obraId?: string } | undefined;
  // Pavimentação
  PavimentacaoList: { obraId?: string } | undefined;
  PavimentacaoForm: { inspecaoId?: string; obraId?: string } | undefined;
  PavEnsaioForm: { ensaioId?: string; obraId?: string; inspecaoId?: string } | undefined;
};

// Ensaios Stack
export type EnsaiosStackParamList = {
  EnsaioList: undefined;
  EnsaioForm: { ensaioId?: string } | undefined;
  RompimentoCPForm: { rompimentoId?: string; obraId?: string; concretoInspecaoId?: string } | undefined;
};

// More Stack (RNC, Diary, Reports)
export type MoreStackParamList = {
  MoreMenu: undefined;
  RNCList: undefined;
  RNCForm: { rncId?: string } | undefined;
  DiaryList: undefined;
  DiaryForm: { diaryId?: string } | undefined;
  Reports: undefined;
  PavimentacaoDashboard: undefined;
};
