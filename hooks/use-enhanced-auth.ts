import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface UseEnhancedAuthProps {
  mounted: boolean;
  authLoading: boolean;
  isAuthenticated: boolean;
  user: any;
}

interface UseEnhancedAuthReturn {
  authChecked: boolean;
  setAuthChecked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useEnhancedAuth = ({
  mounted,
  authLoading,
  isAuthenticated,
  user
}: UseEnhancedAuthProps): UseEnhancedAuthReturn => {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // Handle authentication redirect in useEffect to avoid render-time side effects
  // ENHANCED LOGIC: Multiple safeguards to prevent false redirects
  useEffect(() => {
    // Skip if component not mounted yet
    if (!mounted) return;
    
    // Skip if auth is still loading
    if (authLoading) return;
    
    // Skip if already checked to prevent multiple calls
    if (authChecked) return;
    
    // Additional check: Look for stored session as backup
    const checkStoredSession = async () => {
      try {
        // Check Supabase session directly
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // If we have a valid session but user/isAuthenticated is false, wait longer
        if (session && session.user && (!user || !isAuthenticated)) {
          // Set a flag to check again later
          setTimeout(() => setAuthChecked(false), 1000);
          return;
        }
        
        // Check localStorage for additional confirmation
        const localSession = localStorage.getItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
        if (localSession && (!user || !isAuthenticated)) {
          try {
            const parsedSession = JSON.parse(localSession);
            if (parsedSession.access_token && parsedSession.refresh_token) {
              // Set a flag to check again later
              setTimeout(() => setAuthChecked(false), 1500);
              return;
            }
          } catch (e) {
            // Silent catch for localStorage parsing errors
          }
        }
        
        // Mark as checked to prevent multiple calls
        setAuthChecked(true);
        
        // Only redirect if we're absolutely sure there's no authentication
        if (!session || !session.user) {          
          // Triple check with a delay to be absolutely sure
          setTimeout(async () => {
            const { data: { session: finalCheck } } = await supabase.auth.getSession();
            if (!finalCheck || !finalCheck.user) {
              router.push('/auth/login');
            }
          }, 500); // Increased delay for final check
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Don't redirect on error, retry later
        setTimeout(() => setAuthChecked(false), 2000);
      }
    };
    
    // Add debounce to prevent multiple checks
    const timeoutId = setTimeout(() => {
      checkStoredSession();
    }, 300); // Initial delay
    
    return () => clearTimeout(timeoutId);
  }, [mounted, authLoading, isAuthenticated, user, router, authChecked]);

  return {
    authChecked,
    setAuthChecked
  };
};
