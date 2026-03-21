import type { NavigatorScreenParams } from '@react-navigation/native';

// Root Bottom Tab
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

// Inspection Stack
export type InspectionStackParamList = {
  InspectionList: undefined;
  InspectionType: undefined;
  InspectionForm: { inspectionId?: string; obraId?: string; tipo?: string };
};

// Ensaios Stack
export type EnsaiosStackParamList = {
  EnsaioList: undefined;
  EnsaioForm: { ensaioId?: string } | undefined;
};

// More Stack (RNC, Diary, Reports)
export type MoreStackParamList = {
  MoreMenu: undefined;
  RNCList: undefined;
  RNCForm: { rncId?: string } | undefined;
  DiaryList: undefined;
  DiaryForm: { diaryId?: string } | undefined;
  Reports: undefined;
};
