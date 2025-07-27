import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AutoInteractionConfig {
  baseTimeoutSeconds: number; // 30 seconds initially (was minutes)
  minRandomDelaySeconds: number; // 10 seconds minimum (was minutes)
  maxRandomDelaySeconds: number; // 20 seconds maximum (was minutes)
  timeoutIncrementSeconds: number; // 10 seconds increment when user doesn't respond (was minutes)
  maxTimeoutSeconds: number; // Maximum timeout limit (was minutes)
}

interface AutoInteractionState {
  isEnabled: boolean;
  isActive: boolean;
  currentTimeoutSeconds: number;
  lastUserActivity: Date | null;
  lastAutoInteraction: Date | null;
  userHasStartedChat: boolean;
  pendingTimeoutId: NodeJS.Timeout | null;
}

const DEFAULT_CONFIG: AutoInteractionConfig = {
  baseTimeoutSeconds: 10, // 10 seconds for testing (was 30)
  minRandomDelaySeconds: 2, // 2 seconds instead of 10 seconds  
  maxRandomDelaySeconds: 5, // 5 seconds instead of 20 seconds
  timeoutIncrementSeconds: 5, // 5 seconds instead of 10 seconds
  maxTimeoutSeconds: 30 // 30 seconds max instead of 120 seconds
};

export function useAutoInteraction(
  sessionId: string | null,
  selectedAIIds: string[],
  onAutoInteraction: (type: 'ai_to_ai' | 'ai_to_user') => Promise<void>,
  config: Partial<AutoInteractionConfig> = {}
) {
  const router = useRouter();
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [state, setState] = useState<AutoInteractionState>({
    isEnabled: false,
    isActive: false,
    currentTimeoutSeconds: fullConfig.baseTimeoutSeconds,
    lastUserActivity: null,
    lastAutoInteraction: null,
    userHasStartedChat: false,
    pendingTimeoutId: null
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Check if we're on the resources route
  const [isOnResourcesRoute, setIsOnResourcesRoute] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      const isResources = window.location.pathname === '/resources';
      setIsOnResourcesRoute(isResources);
      
      if (!isResources && state.isActive) {
        // Disable auto-interaction when leaving resources route
        console.log('🚫 Auto-interaction disabled - Left resources route');
        setState(prev => ({ 
          ...prev, 
          isActive: false,
          pendingTimeoutId: prev.pendingTimeoutId ? (clearTimeout(prev.pendingTimeoutId), null) : null
        }));
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    
    return () => {
      window.removeEventListener('popstate', checkRoute);
    };
  }, [state.isActive]);

  // Generate random delay between interactions
  const generateRandomDelay = useCallback(() => {
    const min = fullConfig.minRandomDelaySeconds * 1000; // Convert to milliseconds
    const max = fullConfig.maxRandomDelaySeconds * 1000;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, [fullConfig]);

  // Schedule next auto-interaction
  const scheduleAutoInteraction = useCallback(() => {
    console.log('📍 scheduleAutoInteraction called with state:', {
      isActive: stateRef.current.isActive,
      isOnResourcesRoute,
      sessionId: !!sessionId
    });

    if (!stateRef.current.isActive || !isOnResourcesRoute || !sessionId) {
      console.log('❌ scheduleAutoInteraction aborted - conditions not met');
      return;
    }

    // Clear any existing timeout
    if (stateRef.current.pendingTimeoutId) {
      console.log('🗑️ Clearing existing timeout');
      clearTimeout(stateRef.current.pendingTimeoutId);
    }

    const baseDelay = stateRef.current.currentTimeoutSeconds * 1000; // Convert to ms
    const randomDelay = generateRandomDelay();
    const totalDelay = baseDelay + randomDelay;

    console.log(`⏰ Scheduling auto-interaction in ${(totalDelay / 1000).toFixed(1)} seconds (base: ${stateRef.current.currentTimeoutSeconds}s + random: ${(randomDelay/1000).toFixed(1)}s)`);

    const timeoutId = setTimeout(async () => {
      console.log('🔔 Auto-interaction timeout triggered!');
      
      if (!stateRef.current.isActive || !isOnResourcesRoute) {
        console.log('❌ Auto-interaction cancelled - state changed');
        return;
      }

      try {
        // Randomly choose interaction type
        const interactionType = Math.random() < 0.6 ? 'ai_to_ai' : 'ai_to_user';
        console.log(`🤖 Triggering auto-interaction: ${interactionType}`);

        await onAutoInteraction(interactionType);

        setState(prev => ({
          ...prev,
          lastAutoInteraction: new Date(),
          pendingTimeoutId: null
        }));

        // Schedule next interaction
        console.log('🔄 Scheduling next auto-interaction...');
        scheduleAutoInteraction();

      } catch (error) {
        console.error('❌ Auto-interaction failed:', error);
        
        // Retry after a shorter delay on error
        setState(prev => ({ ...prev, pendingTimeoutId: null }));
        setTimeout(scheduleAutoInteraction, 5000); // Retry in 5 seconds
      }
    }, totalDelay);

    console.log(`✅ Timeout scheduled with ID: ${timeoutId}`);
    setState(prev => ({ ...prev, pendingTimeoutId: timeoutId }));
  }, [sessionId, isOnResourcesRoute, generateRandomDelay, onAutoInteraction]);

  // Record user activity and reset timeout if needed
  const recordUserActivity = useCallback(() => {
    console.log('👤 User activity recorded');
    const now = new Date();
    
    setState(prev => {
      const shouldResetTimeout = prev.currentTimeoutSeconds > fullConfig.baseTimeoutSeconds;
      
      console.log('📊 recordUserActivity state update:', {
        shouldResetTimeout,
        currentTimeout: prev.currentTimeoutSeconds,
        baseTimeout: fullConfig.baseTimeoutSeconds,
        userHasStartedChat: true
      });
      
      return {
        ...prev,
        lastUserActivity: now,
        userHasStartedChat: true,
        currentTimeoutSeconds: shouldResetTimeout ? fullConfig.baseTimeoutSeconds : prev.currentTimeoutSeconds
      };
    });

    // Reschedule next auto-interaction
    if (state.isActive) {
      console.log('🔄 Rescheduling auto-interaction due to user activity');
      setTimeout(() => scheduleAutoInteraction(), 100);
    }

    if (state.currentTimeoutSeconds > fullConfig.baseTimeoutSeconds) {
      console.log(`🔄 User responded! Timeout reset to ${fullConfig.baseTimeoutSeconds} seconds`);
    }
  }, [fullConfig.baseTimeoutSeconds, state.isActive, state.currentTimeoutSeconds, scheduleAutoInteraction]);

  // Handle when auto-interaction doesn't get user response
  const handleNoUserResponse = useCallback(() => {
    setState(prev => {
      const newTimeout = Math.min(
        prev.currentTimeoutSeconds + fullConfig.timeoutIncrementSeconds,
        fullConfig.maxTimeoutSeconds
      );
      
      console.log(`⏰ No user response - Increasing timeout to ${newTimeout} seconds`);
      
      return {
        ...prev,
        currentTimeoutSeconds: newTimeout
      };
    });
  }, [fullConfig]);

  // Start auto-interaction system
  const startAutoInteraction = useCallback(() => {
    if (!sessionId || !selectedAIIds.length || !isOnResourcesRoute) {
      console.log('❌ Cannot start auto-interaction: Missing requirements', {
        sessionId: !!sessionId,
        selectedAIIds: selectedAIIds.length,
        isOnResourcesRoute
      });
      return;
    }

    if (!state.userHasStartedChat) {
      console.log('❌ Cannot start auto-interaction: User hasn\'t started chatting');
      return;
    }

    console.log('✅ Starting auto-interaction system');
    
    setState(prev => ({
      ...prev,
      isEnabled: true,
      isActive: true,
      lastUserActivity: new Date()
    }));

    // Add delay to ensure state is updated
    setTimeout(() => {
      scheduleAutoInteraction();
    }, 100);
  }, [sessionId, selectedAIIds, isOnResourcesRoute, state.userHasStartedChat, scheduleAutoInteraction]);

  // Stop auto-interaction system
  const stopAutoInteraction = useCallback(() => {
    console.log('🛑 Stopping auto-interaction system');
    
    setState(prev => {
      if (prev.pendingTimeoutId) {
        clearTimeout(prev.pendingTimeoutId);
      }
      
      return {
        ...prev,
        isActive: false,
        pendingTimeoutId: null
      };
    });
  }, []);

  // Toggle auto-interaction system
  const toggleAutoInteraction = useCallback(() => {
    if (state.isActive) {
      stopAutoInteraction();
    } else {
      startAutoInteraction();
    }
  }, [state.isActive, startAutoInteraction, stopAutoInteraction]);

  // Reset auto-interaction state
  const resetAutoInteraction = useCallback(() => {
    console.log('🔄 Resetting auto-interaction state');
    
    setState(prev => {
      if (prev.pendingTimeoutId) {
        clearTimeout(prev.pendingTimeoutId);
      }
      
      return {
        isEnabled: false,
        isActive: false,
        currentTimeoutSeconds: fullConfig.baseTimeoutSeconds,
        lastUserActivity: null,
        lastAutoInteraction: null,
        userHasStartedChat: false,
        pendingTimeoutId: null
      };
    });
  }, [fullConfig.baseTimeoutSeconds]);

  // Auto-start when conditions are met
  useEffect(() => {
    if (
      isOnResourcesRoute && 
      sessionId && 
      selectedAIIds.length > 0 && 
      state.userHasStartedChat && 
      !state.isActive &&
      state.isEnabled
    ) {
      startAutoInteraction();
    }
  }, [isOnResourcesRoute, sessionId, selectedAIIds, state.userHasStartedChat, state.isActive, state.isEnabled, startAutoInteraction]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.pendingTimeoutId) {
        clearTimeout(state.pendingTimeoutId);
      }
    };
  }, [state.pendingTimeoutId]);

  return {
    // State
    isEnabled: state.isEnabled,
    isActive: state.isActive,
    currentTimeoutSeconds: state.currentTimeoutSeconds,
    lastUserActivity: state.lastUserActivity,
    lastAutoInteraction: state.lastAutoInteraction,
    userHasStartedChat: state.userHasStartedChat,
    isOnResourcesRoute,
    
    // Actions
    recordUserActivity,
    handleNoUserResponse,
    startAutoInteraction,
    stopAutoInteraction,
    toggleAutoInteraction,
    resetAutoInteraction,
    
    // Config
    config: fullConfig
  };
}
