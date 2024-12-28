// src/context/AppStateContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, AppAction } from '../types';

interface AppStateContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const initialState: AppState = {
  githubInputs: '',
  filePatterns: '',
  fileFilterMode: 'Include matching files',
  linePatterns: '',
  lineFilterMode: 'Include matching lines',
  stitchedContent: '',
  loading: false,
  error: null
};

// Create context with undefined as initial value
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_GITHUB_INPUTS':
      return { ...state, githubInputs: action.payload };
    case 'SET_FILE_PATTERNS':
      return { ...state, filePatterns: action.payload };
    case 'SET_FILE_FILTER_MODE':
      return { ...state, fileFilterMode: action.payload };
    case 'SET_LINE_PATTERNS':
      return { ...state, linePatterns: action.payload };
    case 'SET_LINE_FILTER_MODE':
      return { ...state, lineFilterMode: action.payload };
    case 'SET_STITCHED_CONTENT':
      return { ...state, stitchedContent: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextType {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}