import { useState, useEffect } from 'react';

interface UseSidebarManagerReturn {
  isSidebarOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  isStatsDesktopCollapsed: boolean;
  leftHoverTimer: NodeJS.Timeout | null;
  rightHoverTimer: NodeJS.Timeout | null;
  isHoveringLeftArea: boolean;
  isHoveringRightArea: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setIsDesktopSidebarCollapsed: (collapsed: boolean) => void;
  setIsStatsDesktopCollapsed: (collapsed: boolean) => void;
  handleLeftSidebarHoverEnter: () => void;
  handleLeftSidebarHoverLeave: () => void;
  handleRightSidebarHoverEnter: () => void;
  handleRightSidebarHoverLeave: () => void;
}

export function useSidebarManager(): UseSidebarManagerReturn {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile: đóng mặc định
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false); // desktop: thu nhỏ sidebar
  const [isStatsDesktopCollapsed, setIsStatsDesktopCollapsed] = useState(false); // desktop: thu nhỏ stats sidebar
  const [leftHoverTimer, setLeftHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [rightHoverTimer, setRightHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const [isHoveringLeftArea, setIsHoveringLeftArea] = useState(false);
  const [isHoveringRightArea, setIsHoveringRightArea] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebars on desktop
  useEffect(() => {
    if (windowWidth >= 1024) { // lg breakpoint
      setIsSidebarOpen(false);
    }
  }, [windowWidth]);

  // Tự động thu hẹp both sidebars sau 5 giây khi load trang
  useEffect(() => {
    const leftTimer = setTimeout(() => {
      setIsDesktopSidebarCollapsed(true);
    }, 5000);
    
    const rightTimer = setTimeout(() => {
      setIsStatsDesktopCollapsed(true);
    }, 5000);

    return () => {
      clearTimeout(leftTimer);
      clearTimeout(rightTimer);
    };
  }, []);

  // Handle left sidebar hover auto-expand/collapse
  const handleLeftSidebarHoverEnter = () => {
    if (isDesktopSidebarCollapsed) {
      setIsHoveringLeftArea(true);
      setIsDesktopSidebarCollapsed(false);
    }
    // Clear any existing timer
    if (leftHoverTimer) {
      clearTimeout(leftHoverTimer);
      setLeftHoverTimer(null);
    }
  };

  const handleLeftSidebarHoverLeave = () => {
    setIsHoveringLeftArea(false);
    // Start timer to auto-collapse after 3 seconds
    const timer = setTimeout(() => {
      if (!isHoveringLeftArea) {
        setIsDesktopSidebarCollapsed(true);
      }
    }, 3000);
    setLeftHoverTimer(timer);
  };

  // Handle right sidebar hover auto-expand/collapse
  const handleRightSidebarHoverEnter = () => {
    if (isStatsDesktopCollapsed) {
      setIsHoveringRightArea(true);
      setIsStatsDesktopCollapsed(false);
    }
    // Clear any existing timer
    if (rightHoverTimer) {
      clearTimeout(rightHoverTimer);
      setRightHoverTimer(null);
    }
  };

  const handleRightSidebarHoverLeave = () => {
    setIsHoveringRightArea(false);
    // Start timer to auto-collapse after 3 seconds
    const timer = setTimeout(() => {
      if (!isHoveringRightArea) {
        setIsStatsDesktopCollapsed(true);
      }
    }, 3000);
    setRightHoverTimer(timer);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (leftHoverTimer) {
        clearTimeout(leftHoverTimer);
      }
      if (rightHoverTimer) {
        clearTimeout(rightHoverTimer);
      }
    };
  }, [leftHoverTimer, rightHoverTimer]);

  return {
    isSidebarOpen,
    isDesktopSidebarCollapsed,
    isStatsDesktopCollapsed,
    leftHoverTimer,
    rightHoverTimer,
    isHoveringLeftArea,
    isHoveringRightArea,
    setIsSidebarOpen,
    setIsDesktopSidebarCollapsed,
    setIsStatsDesktopCollapsed,
    handleLeftSidebarHoverEnter,
    handleLeftSidebarHoverLeave,
    handleRightSidebarHoverEnter,
    handleRightSidebarHoverLeave
  };
}
