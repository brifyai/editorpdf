import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabaseHelpers } from '../services/supabase';

const AppContext = createContext({});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ACTIVE_SECTION: 'SET_ACTIVE_SECTION',
  SET_SIDEBAR_COLLAPSED: 'SET_SIDEBAR_COLLAPSED',
  SET_USER_CONFIG: 'SET_USER_CONFIG',
  SET_AI_STATUS: 'SET_AI_STATUS',
  SET_ANALYSIS_HISTORY: 'SET_ANALYSIS_HISTORY',
  SET_BATCH_JOBS: 'SET_BATCH_JOBS',
  ADD_ANALYSIS_RESULT: 'ADD_ANALYSIS_RESULT',
  UPDATE_BATCH_JOB: 'UPDATE_BATCH_JOB',
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  activeSection: 'document-analysis',
  sidebarCollapsed: false,
  userConfig: {
    groqApiKey: '',
    chutesApiKey: '',
    useAI: true,
    strategy: 'auto',
    temperature: 0.2,
    maxTokens: 1500,
    ocrConfidence: 75,
    priority: 'balanced',
  },
  aiStatus: {
    groq: false,
    chutes: false,
    loading: false,
  },
  analysisHistory: [],
  batchJobs: [],
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case ACTIONS.SET_ACTIVE_SECTION:
      return { ...state, activeSection: action.payload };

    case ACTIONS.SET_SIDEBAR_COLLAPSED:
      return { ...state, sidebarCollapsed: action.payload };

    case ACTIONS.SET_USER_CONFIG:
      return {
        ...state,
        userConfig: { ...state.userConfig, ...action.payload },
      };

    case ACTIONS.SET_AI_STATUS:
      return { ...state, aiStatus: { ...state.aiStatus, ...action.payload } };

    case ACTIONS.SET_ANALYSIS_HISTORY:
      return { ...state, analysisHistory: action.payload };

    case ACTIONS.SET_BATCH_JOBS:
      return { ...state, batchJobs: action.payload };

    case ACTIONS.ADD_ANALYSIS_RESULT:
      return {
        ...state,
        analysisHistory: [action.payload, ...state.analysisHistory],
      };

    case ACTIONS.UPDATE_BATCH_JOB:
      return {
        ...state,
        batchJobs: state.batchJobs.map(job =>
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
      };

    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load configuration and data on mount
  useEffect(() => {
    loadUserConfiguration();
    loadAnalysisHistory();
    loadBatchJobs();
  }, []);

  const loadUserConfiguration = async () => {
    try {
      // Try to load from database first
      const { data, error } = await supabaseHelpers.getUserConfiguration(1);
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user config:', error);
      }

      if (data) {
        dispatch({ type: ACTIONS.SET_USER_CONFIG, payload: data });
      } else {
        // Load from localStorage as fallback
        const savedConfig = localStorage.getItem('userConfig');
        if (savedConfig) {
          try {
            const config = JSON.parse(savedConfig);
            dispatch({ type: ACTIONS.SET_USER_CONFIG, payload: config });
          } catch (e) {
            console.error('Error parsing saved config:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user configuration:', error);
    }
  };

  const loadAnalysisHistory = async () => {
    try {
      const { data, error } = await supabaseHelpers.getAnalysisHistory(1);
      if (error) {
        console.error('Error loading analysis history:', error);
        return;
      }

      dispatch({ type: ACTIONS.SET_ANALYSIS_HISTORY, payload: data || [] });
    } catch (error) {
      console.error('Error loading analysis history:', error);
    }
  };

  const loadBatchJobs = async () => {
    try {
      const { data, error } = await supabaseHelpers.getBatchJobs(1);
      if (error) {
        console.error('Error loading batch jobs:', error);
        return;
      }

      dispatch({ type: ACTIONS.SET_BATCH_JOBS, payload: data || [] });
    } catch (error) {
      console.error('Error loading batch jobs:', error);
    }
  };

  // Action creators
  const setLoading = loading => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = error => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: ACTIONS.CLEAR_ERROR });
  };

  const setActiveSection = section => {
    dispatch({ type: ACTIONS.SET_ACTIVE_SECTION, payload: section });
  };

  const toggleSidebar = () => {
    dispatch({
      type: ACTIONS.SET_SIDEBAR_COLLAPSED,
      payload: !state.sidebarCollapsed,
    });
  };

  const updateUserConfig = async config => {
    try {
      dispatch({ type: ACTIONS.SET_USER_CONFIG, payload: config });

      // Save to localStorage
      localStorage.setItem('userConfig', JSON.stringify(config));

      // Try to save to database
      try {
        const { error } = await supabaseHelpers.saveUserConfiguration(1, config);
        if (error) {
          console.error('Error saving user config to database:', error);
        }
      } catch (dbError) {
        console.error('Database save failed, using localStorage only:', dbError);
      }
    } catch (error) {
      console.error('Error updating user config:', error);
    }
  };

  const updateAIStatus = status => {
    dispatch({ type: ACTIONS.SET_AI_STATUS, payload: status });
  };

  const addAnalysisResult = result => {
    dispatch({ type: ACTIONS.ADD_ANALYSIS_RESULT, payload: result });
  };

  const updateBatchJob = job => {
    dispatch({ type: ACTIONS.UPDATE_BATCH_JOB, payload: job });
  };

  const value = {
    ...state,
    setLoading,
    setError,
    clearError,
    setActiveSection,
    toggleSidebar,
    updateUserConfig,
    updateAIStatus,
    addAnalysisResult,
    updateBatchJob,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
