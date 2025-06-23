"use client"

import { lazy, ComponentType, LazyExoticComponent } from "react"
import { useIntersectionObserver } from "./use-intersection-observer"

// Enhanced lazy loading with preloading capabilities
interface AdvancedLazyOptions {
  preload?: boolean
  preloadOnHover?: boolean
  preloadDelay?: number
  fallback?: ComponentType
  chunkName?: string
}

// Route-based lazy loading components (only existing routes)
export const LazyRoutes = {
  // Community features
  CommunityPage: lazy(() => 
    import("@/app/community/page").then(module => ({
      default: module.default || module
    }))
  ),
  
  // Profile page
  ProfilePage: lazy(() => 
    import("@/app/profile/page").then(module => ({
      default: module.default || module
    }))
  ),
}

// Feature-based lazy loading (only existing components)
export const LazyFeatures = {
  // Charts and visualizations (existing)
  Charts: {
    AreaChart: lazy(() => 
      import("@/components/ui/chart").then(module => ({
        default: module.AreaChart
      }))
    ),
    BarChart: lazy(() => 
      import("@/components/ui/chart").then(module => ({
        default: module.BarChart
      }))
    ),
    LineChart: lazy(() => 
      import("@/components/ui/chart").then(module => ({
        default: module.LineChart
      }))
    ),
  },
  
  // UI components (existing)
  UI: {
    Calendar: lazy(() => 
      import("@/components/ui/calendar").then(module => ({
        default: module.Calendar
      }))
    ),
    Dialog: lazy(() => 
      import("@/components/ui/dialog").then(module => ({
        default: module.Dialog
      }))
    ),
    Sheet: lazy(() => 
      import("@/components/ui/sheet").then(module => ({
        default: module.Sheet
      }))
    ),
  },
  
  // Community components (existing)
  Community: {
    StoryCard: lazy(() => 
      import("@/components/community/story-card").then(module => ({
        default: module.StoryCard
      }))
    ),
    FeedPost: lazy(() => 
      import("@/components/feed/feed-post").then(module => ({
        default: module.default || module
      }))
    ),
  },
}

// Enhanced lazy wrapper with preloading
export function createAdvancedLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options: AdvancedLazyOptions = {}
): LazyExoticComponent<T> {
  const {
    preload = false,
    preloadOnHover = true,
    preloadDelay = 2000,
  } = options

  // Create the lazy component
  const LazyComponent = lazy(async () => {
    const module = await importFn()
    // Handle both default exports and named exports
    return { default: 'default' in module ? module.default : module }
  })

  // Preload immediately if requested
  if (preload) {
    setTimeout(() => {
      importFn().catch(console.error)
    }, preloadDelay)
  }

  return LazyComponent
}

// Hook for intersection-based lazy loading
export function useIntersectionLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options: AdvancedLazyOptions & {
    rootMargin?: string
    threshold?: number
  } = {}
) {
  const {
    rootMargin = "100px",
    threshold = 0,
    preloadOnHover = true,
  } = options

  const { setElement, shouldLoad } = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: true,
  })

  // Create lazy component only when needed
  const LazyComponent = shouldLoad ? lazy(async () => {
    const module = await importFn()
    return { default: 'default' in module ? module.default : module }
  }) : null

  const PreloadWrapper = ({ children, onMouseEnter, ...props }: any) => {
    const handleMouseEnter = (e: React.MouseEvent) => {
      if (preloadOnHover && !shouldLoad) {
        importFn().catch(console.error)
      }
      onMouseEnter?.(e)
    }

    return (
      <div
        ref={setElement}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </div>
    )
  }

  return {
    LazyComponent,
    PreloadWrapper,
    shouldLoad,
    setElement,
  }
}

// Preload utility for route transitions
export function preloadRoute(routeName: keyof typeof LazyRoutes) {
  // This will be handled by Next.js router prefetching
  // But we can also manually preload the component
  if (LazyRoutes[routeName]) {
    // Trigger preload
    import(`@/app/${routeName.toLowerCase()}/page`).catch(console.error)
  }
}

// Preload on hover utility
export function usePreloadOnHover(
  importFn: () => Promise<any>,
  enabled = true
) {
  const handleMouseEnter = () => {
    if (enabled) {
      importFn().catch(console.error)
    }
  }

  return { onMouseEnter: handleMouseEnter }
}

// Critical vs non-critical component classifier
export const ComponentPriority = {
  // Critical components - load immediately
  Critical: [
    'MainHeader',
    'MainContent', 
    'Navigation',
    'HeroSection',
  ],
  
  // Important but not critical - load on interaction or after critical
  Important: [
    'Sidebar',
    'Footer',
    'SearchModal',
    'UserMenu',
  ],
  
  // Non-critical - lazy load aggressively
  NonCritical: [
    'AdminDashboard',
    'AnalyticsCharts', 
    'VideoEditor',
    'AdvancedFeatures',
    'ThemeCustomizer',
  ],
}

// Utility to determine if component should be lazy loaded
export function shouldLazyLoad(componentName: string): boolean {
  return ComponentPriority.NonCritical.includes(componentName) ||
         (!ComponentPriority.Critical.includes(componentName) && 
          !ComponentPriority.Important.includes(componentName))
}
