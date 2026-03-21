import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import { HomeScreen } from '../screens/HomeScreen';
import { ObrasListScreen } from '../screens/obras/ObrasListScreen';
import { ObraFormScreen } from '../screens/obras/ObraFormScreen';
import { InspectionListScreen } from '../screens/inspection/InspectionListScreen';
import { InspectionTypeScreen } from '../screens/inspection/InspectionTypeScreen';
import { InspectionFormScreen } from '../screens/inspection/InspectionFormScreen';
import { EnsaioListScreen } from '../screens/ensaios/EnsaioListScreen';
import { EnsaioFormScreen } from '../screens/ensaios/EnsaioFormScreen';
import { RNCListScreen } from '../screens/rnc/RNCListScreen';
import { RNCFormScreen } from '../screens/rnc/RNCFormScreen';
import { DiaryListScreen } from '../screens/diary/DiaryListScreen';
import { DiaryFormScreen } from '../screens/diary/DiaryFormScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { MoreMenuScreen } from '../screens/more/MoreMenuScreen';

import type {
  BottomTabParamList,
  ObrasStackParamList,
  InspectionStackParamList,
  EnsaiosStackParamList,
  MoreStackParamList,
} from './types';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// --- Obras Stack ---
const ObrasStack = createNativeStackNavigator<ObrasStackParamList>();
function ObrasNavigator() {
  return (
    <ObrasStack.Navigator screenOptions={{ headerShown: false }}>
      <ObrasStack.Screen name="ObrasList" component={ObrasListScreen} />
      <ObrasStack.Screen name="ObraForm" component={ObraFormScreen} />
    </ObrasStack.Navigator>
  );
}

// --- Inspection Stack ---
const InspectionStack = createNativeStackNavigator<InspectionStackParamList>();
function InspectionNavigator() {
  return (
    <InspectionStack.Navigator screenOptions={{ headerShown: false }}>
      <InspectionStack.Screen name="InspectionList" component={InspectionListScreen} />
      <InspectionStack.Screen name="InspectionType" component={InspectionTypeScreen} />
      <InspectionStack.Screen name="InspectionForm" component={InspectionFormScreen} />
    </InspectionStack.Navigator>
  );
}

// --- Ensaios Stack ---
const EnsaiosStack = createNativeStackNavigator<EnsaiosStackParamList>();
function EnsaiosNavigator() {
  return (
    <EnsaiosStack.Navigator screenOptions={{ headerShown: false }}>
      <EnsaiosStack.Screen name="EnsaioList" component={EnsaioListScreen} />
      <EnsaiosStack.Screen name="EnsaioForm" component={EnsaioFormScreen} />
    </EnsaiosStack.Navigator>
  );
}

// --- More Stack (RNC, Diary, Reports) ---
const MoreStack = createNativeStackNavigator<MoreStackParamList>();
function MoreNavigator() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <MoreStack.Screen name="RNCList" component={RNCListScreen} />
      <MoreStack.Screen name="RNCForm" component={RNCFormScreen} />
      <MoreStack.Screen name="DiaryList" component={DiaryListScreen} />
      <MoreStack.Screen name="DiaryForm" component={DiaryFormScreen} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} />
    </MoreStack.Navigator>
  );
}

// --- Bottom Tabs ---
export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ObrasTab"
        component={ObrasNavigator}
        options={{
          tabBarLabel: 'Projetos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="office-building" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="InspectionTab"
        component={InspectionNavigator}
        options={{
          tabBarLabel: 'Inspeção',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="EnsaiosTab"
        component={EnsaiosNavigator}
        options={{
          tabBarLabel: 'Ensaios',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="test-tube" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreNavigator}
        options={{
          tabBarLabel: 'Mais',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-horizontal" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
