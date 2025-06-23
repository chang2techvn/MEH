# SmartImage Component Usage Guide

## Overview
`SmartImage` is an advanced image component that provides:
- **Automatic AVIF/WebP format selection**
- **SVG-based LQIP (Low Quality Image Placeholder)**
- **Smart quality optimization** based on image type
- **Responsive sizing** with optimal breakpoints
- **Loading states** with smooth transitions
- **Error handling** with fallback UI

## Basic Usage

```tsx
import { SmartImage, HeroImage, ThumbnailImage, AvatarImage } from "@/components/optimized/smart-image"

// Basic usage
<SmartImage
  src="/my-image.jpg"
  alt="Description"
  width={400}
  height={300}
/>

// Hero image (high quality, priority loading)
<HeroImage
  src="/hero-banner.jpg"
  alt="Hero banner"
  fill
  className="object-cover"
/>

// Thumbnail (lower quality for performance)
<ThumbnailImage
  src="/thumbnail.jpg"
  alt="Thumbnail"
  width={200}
  height={150}
/>

// Avatar (optimized for profile pictures)
<AvatarImage
  src="/avatar.jpg"
  alt="User avatar"
  width={64}
  height={64}
  className="rounded-full"
/>
```

## Image Types & Automatic Optimization

| Type | Quality | Responsive Sizes | Use Case |
|------|---------|------------------|----------|
| `hero` | 85% | `100vw → 80vw → 1200px` | Hero banners, main images |
| `thumbnail` | 60% | `150px → 200px` | Image lists, galleries |
| `avatar` | 70% | `40px → 60px` | Profile pictures |
| `regular` | 75% | `100vw → 50vw → 600px` | General content images |

## Advanced Features

### Custom Quality & Sizes
```tsx
<SmartImage
  src="/image.jpg"
  alt="Custom image"
  width={800}
  height={600}
  quality={90}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### Custom Placeholder
```tsx
<SmartImage
  src="/image.jpg"
  alt="With custom placeholder"
  width={400}
  height={300}
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Event Handling
```tsx
<SmartImage
  src="/image.jpg"
  alt="With events"
  width={400}
  height={300}
  onLoad={() => console.log('Image loaded')}
  onError={() => console.log('Image failed to load')}
/>
```

## LazyImage for Performance

For images below the fold, use `LazyImage` for intersection observer loading:

```tsx
import { LazyImage, LazyThumbnailImage } from "@/components/optimized/lazy-image"

<LazyImage
  src="/lazy-image.jpg"
  alt="Lazy loaded image"
  width={400}
  height={300}
  rootMargin="100px" // Start loading 100px before entering viewport
/>
```

## Performance Benefits

1. **Format Optimization**: Automatically serves AVIF → WebP → JPEG
2. **Quality Optimization**: Smart quality based on image purpose
3. **LQIP**: SVG-based placeholders prevent layout shift
4. **Responsive**: Optimal sizes for different screen sizes
5. **Lazy Loading**: Intersection observer for below-fold images
6. **Error Handling**: Graceful fallbacks for broken images

## Best Practices

1. **Use appropriate type**: `HeroImage` for heroes, `ThumbnailImage` for lists
2. **Set dimensions**: Always provide `width` and `height` or use `fill`
3. **Optimize alt text**: Descriptive alt text for accessibility
4. **Use LazyImage**: For images below the fold
5. **Consider priority**: Set `priority={true}` for above-fold images

## Technical Details

- **Format Support**: AVIF, WebP, JPEG (automatic fallback)
- **LQIP Generation**: SVG-based for better quality and smaller size
- **Loading Strategy**: Intersection observer with configurable margins
- **Error Handling**: Automatic fallback to placeholder UI
- **Performance**: Hardware-accelerated transitions, will-change optimization
