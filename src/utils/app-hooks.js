import { useState, useCallback } from 'react';

export const useAppState = () => {
  const [state, setState] = useState({
    isLoading: true,
    showLanding: false,
    showAccessCodeForm: false,
    isPublicMode: false,
    user: null,
    sessionId: null,
    userFirstName: '',
    activeTab: 'dashboard',
    isDarkMode: false,
    isOnline: navigator.onLine,
    projects: [],
    researchTools: [],
    officers: [],
    donations: [],
    messages: [],
    weather: null,
    bulletinItems: [],
  });

  const [operationLoading, setOperationLoading] = useState({
    auth: false,
    accessCode: false,
    dataFetch: false,
    sampleData: false,
  });

  return { state, setState, operationLoading, setOperationLoading };
};

export const useAppInitialization = (state, setState, setOperationLoading) => {
  const initializeApp = useCallback(async () => {
    try {
      // Simulate initialization
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setState((prev) => ({
        ...prev,
        isLoading: false,
        showLanding: true,
        isDarkMode: localStorage.getItem('11mercado-theme') === 'dark',
      }));
    } catch (error) {
      console.error('App initialization failed:', error);
      setState((prev) => ({ ...prev, isLoading: false, showLanding: true }));
    }
  }, [setState]);

  return { initializeApp };
};

export const useEventHandlers = (
  state,
  setState,
  setOperationLoading,
  appInitialization,
) => {
  const handleGetStarted = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showLanding: false,
      showAccessCodeForm: true,
    }));
  }, [setState]);

  const handleAdminLogin = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showLanding: false,
      showAccessCodeForm: false,
      user: null,
    }));
  }, [setState]);

  const handleAccessGranted = useCallback(
    (sessionData) => {
      setState((prev) => ({
        ...prev,
        showAccessCodeForm: false,
        isPublicMode: true,
        sessionId: sessionData?.sessionId || 'temp-session',
        userFirstName: sessionData?.firstName || 'Guest',
      }));
    },
    [setState],
  );

  const handleBackToAuthFromAccessCode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showAccessCodeForm: false,
      showLanding: true,
    }));
  }, [setState]);

  const handleBackToAuth = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPublicMode: false,
      sessionId: null,
      userFirstName: '',
      showLanding: true,
    }));
  }, [setState]);

  const handleAuthSuccess = useCallback(
    (user) => {
      setState((prev) => ({
        ...prev,
        user,
        showLanding: false,
        showAccessCodeForm: false,
        isPublicMode: false,
      }));
    },
    [setState],
  );

  const handleSignOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      user: null,
      showLanding: true,
      activeTab: 'dashboard',
    }));
  }, [setState]);

  const toggleTheme = useCallback(() => {
    setState((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, [setState]);

  const handleOnline = useCallback(() => {
    setState((prev) => ({ ...prev, isOnline: true }));
  }, [setState]);

  const handleOffline = useCallback(() => {
    setState((prev) => ({ ...prev, isOnline: false }));
  }, [setState]);

  const handleDataUpdate = useCallback(
    (data) => {
      setState((prev) => ({ ...prev, ...data }));
    },
    [setState],
  );

  const navigateToTab = useCallback(
    (tab) => {
      setState((prev) => ({ ...prev, activeTab: tab }));
    },
    [setState],
  );

  const initializeSampleData = useCallback(async () => {
    setOperationLoading((prev) => ({ ...prev, sampleData: true }));

    try {
      // Simulate loading sample data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setState((prev) => ({
        ...prev,
        projects: [
          { id: 1, name: 'Smart Garden Ecosystem', status: 'active' },
          { id: 2, name: 'Environmental Tracking App', status: 'completed' },
          { id: 3, name: 'Renewable Energy Research', status: 'planning' },
          { id: 4, name: 'Interactive Science Exhibit', status: 'active' },
        ],
        researchTools: [
          { id: 1, name: 'Physics Simulator Pro', category: 'analysis' },
          { id: 2, name: 'Data Analytics Platform', category: 'data' },
          { id: 3, name: 'Virtual Chemistry Lab', category: 'simulation' },
          { id: 4, name: 'Math Problem Solver', category: 'analysis' },
        ],
        officers: [
          { id: 1, name: 'Dr. Sarah Johnson', role: 'Science Teacher' },
          { id: 2, name: 'Prof. Michael Chen', role: 'Math Department Head' },
          { id: 3, name: 'Ms. Emily Davis', role: 'Chemistry Instructor' },
          { id: 4, name: 'Mr. Robert Wilson', role: 'Physics Teacher' },
        ],
        bulletinItems: [
          {
            title: 'Science Fair Registration Open',
            content:
              'Registration for the annual science fair is now open! Submit your project proposals by February 28th.',
          },
          {
            title: 'New Research Tools Available',
            content:
              "We've added new virtual laboratory tools and simulation software to help with your projects.",
          },
          {
            title: 'Study Group Sessions',
            content:
              'Weekly study group sessions are available every Tuesday and Thursday after school in the library.',
          },
        ],
      }));
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
    } finally {
      setOperationLoading((prev) => ({ ...prev, sampleData: false }));
    }
  }, [setState, setOperationLoading]);

  return {
    handleGetStarted,
    handleAdminLogin,
    handleAccessGranted,
    handleBackToAuthFromAccessCode,
    handleBackToAuth,
    handleAuthSuccess,
    handleSignOut,
    toggleTheme,
    handleOnline,
    handleOffline,
    handleDataUpdate,
    navigateToTab,
    initializeSampleData,
  };
};
