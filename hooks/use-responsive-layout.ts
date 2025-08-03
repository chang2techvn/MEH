import { useState, useEffect } from 'react';

interface UseResponsiveLayoutProps {
  isDesktopSidebarCollapsed: boolean;
  isStatsDesktopCollapsed: boolean;
}

interface UseResponsiveLayoutReturn {
  windowWidth: number;
  mounted: boolean;
  isSmallMobile: boolean;
  isTablet: boolean;
  getDynamicPadding: () => string;
  getScrollAreaPadding: () => string;
  getDynamicMaxWidth: () => string;
}

export function useResponsiveLayout({
  isDesktopSidebarCollapsed,
  isStatsDesktopCollapsed
}: UseResponsiveLayoutProps): UseResponsiveLayoutReturn {
  const [mounted, setMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hydration logic
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect small mobile devices
  const isSmallMobile = windowWidth < 640; // sm breakpoint
  const isTablet = windowWidth >= 640 && windowWidth < 1024; // between sm and lg

  // Dynamic padding based on sidebar states for responsive design
  const getDynamicPadding = (): string => {
    // Base padding classes for mobile/tablet (not affected by sidebar states)
    const baseMobile = "px-2 sm:px-6 md:px-8"; // Reduced mobile padding for better space utilization
    
    // Desktop padding that adapts to sidebar states
    if (windowWidth >= 1024) { // lg breakpoint and above
      const leftCollapsed = isDesktopSidebarCollapsed;
      const rightCollapsed = isStatsDesktopCollapsed;
      
      if (leftCollapsed && rightCollapsed) {
        // Both sidebars collapsed - use minimal padding for maximum width utilization
        return `${baseMobile} lg:px-2 xl:px-3 2xl:px-4`;
      } else if (leftCollapsed || rightCollapsed) {
        // One sidebar collapsed - use moderate padding
        return `${baseMobile} lg:px-3 xl:px-4 2xl:px-6`;
      } else {
        // Both sidebars open - use standard padding
        return `${baseMobile} lg:px-4 xl:px-6 2xl:px-8`;
      }
    }
    
    // Mobile/tablet default
    return baseMobile;
  };

  // Dynamic padding for ScrollArea container (slightly less padding)
  const getScrollAreaPadding = (): string => {
    // Base padding for mobile/tablet
    const baseMobile = "px-3 sm:px-4 md:px-6";
    
    // Desktop padding that adapts to sidebar states
    if (windowWidth >= 1024) { // lg breakpoint and above
      const leftCollapsed = isDesktopSidebarCollapsed;
      const rightCollapsed = isStatsDesktopCollapsed;
      
      if (leftCollapsed && rightCollapsed) {
        // Both sidebars collapsed - use very minimal padding
        return `${baseMobile} lg:px-1 xl:px-2 2xl:px-3`;
      } else if (leftCollapsed || rightCollapsed) {
        // One sidebar collapsed - use moderate padding
        return `${baseMobile} lg:px-2 xl:px-3 2xl:px-4`;
      } else {
        // Both sidebars open - use standard padding
        return `${baseMobile} lg:px-3 xl:px-4 2xl:px-6`;
      }
    }
    
    // Mobile/tablet default
    return baseMobile;
  };

  // Dynamic max-width based on sidebar states
  const getDynamicMaxWidth = (): string => {
    // Mobile/tablet - always use full width
    if (windowWidth < 1024) {
      return "w-full h-full transition-all duration-300";
    }
    
    // Desktop - adjust max-width based on sidebar states
    const leftCollapsed = isDesktopSidebarCollapsed;
    const rightCollapsed = isStatsDesktopCollapsed;
    
    if (leftCollapsed && rightCollapsed) {
      // Both sidebars collapsed - use maximum width
      return "w-full h-full max-w-none transition-all duration-300";
    } else if (leftCollapsed || rightCollapsed) {
      // One sidebar collapsed - use larger max-width
      return "w-full h-full max-w-6xl mx-auto transition-all duration-300";
    } else {
      // Both sidebars open - use standard max-width
      return "w-full h-full max-w-4xl mx-auto transition-all duration-300";
    }
  };

  return {
    windowWidth,
    mounted,
    isSmallMobile,
    isTablet,
    getDynamicPadding,
    getScrollAreaPadding,
    getDynamicMaxWidth
  };
}
