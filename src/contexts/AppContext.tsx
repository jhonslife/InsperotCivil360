import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { runMigrations } from '../database/migrations';
import { countActiveObras } from '../database/repositories/obraRepository';
import { countTodayInspections } from '../database/repositories/inspectionRepository';
import { countOpenRNCs } from '../database/repositories/rncRepository';

interface AppState {
  isReady: boolean;
  userName: string;
  obrasAtivas: number;
  inspecoesHoje: number;
  ncAbertas: number;
}

type AppAction =
  | { type: 'SET_READY' }
  | { type: 'SET_STATS'; obrasAtivas: number; inspecoesHoje: number; ncAbertas: number }
  | { type: 'SET_USER_NAME'; name: string };

const initialState: AppState = {
  isReady: false,
  userName: 'José',
  obrasAtivas: 0,
  inspecoesHoje: 0,
  ncAbertas: 0,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_READY':
      return { ...state, isReady: true };
    case 'SET_STATS':
      return {
        ...state,
        obrasAtivas: action.obrasAtivas,
        inspecoesHoje: action.inspecoesHoje,
        ncAbertas: action.ncAbertas,
      };
    case 'SET_USER_NAME':
      return { ...state, userName: action.name };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  refreshStats: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const refreshStats = async () => {
    try {
      const [obrasAtivas, inspecoesHoje, ncAbertas] = await Promise.all([
        countActiveObras(),
        countTodayInspections(),
        countOpenRNCs(),
      ]);
      dispatch({ type: 'SET_STATS', obrasAtivas, inspecoesHoje, ncAbertas });
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await runMigrations();
        await refreshStats();
        dispatch({ type: 'SET_READY' });
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    init();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, refreshStats }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
