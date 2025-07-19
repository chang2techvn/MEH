# 🔧 Responsive Testing Automation Script
# File: scripts/responsive-test-automation.js

## **Testing Commands & Scripts**

### **1. Automated Device Testing Script**

```javascript
// Device simulation testing
const testDevices = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro 11"', width: 834, height: 1194 },
  { name: 'Laptop 13"', width: 1280, height: 800 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Ultra-wide', width: 2560, height: 1440 }
];

// Auto-test function for each device
async function testResponsiveLayout() {
  for (const device of testDevices) {
    console.log(`Testing on ${device.name} (${device.width}x${device.height})`);
    
    // Set viewport size
    await page.setViewport({
      width: device.width,
      height: device.height
    });
    
    // Take screenshot
    await page.screenshot({
      path: `screenshots/${device.name.replace(/\s/g, '-').toLowerCase()}.png`,
      fullPage: true
    });
    
    // Test critical elements
    await testCriticalElements(device);
  }
}

// Critical elements testing
async function testCriticalElements(device) {
  const elements = [
    { selector: '[data-testid="main-header"]', name: 'Main Header' },
    { selector: '[data-testid="main-content"]', name: 'Main Content' },
    { selector: '[data-testid="sidebar"]', name: 'Sidebar' },
    { selector: '[data-testid="challenge-tabs"]', name: 'Challenge Tabs' },
    { selector: '[data-testid="ai-chat-button"]', name: 'AI Chat Button' }
  ];
  
  for (const element of elements) {
    const isVisible = await page.isVisible(element.selector);
    const boundingBox = await page.locator(element.selector).boundingBox();
    
    console.log(`${element.name}: ${isVisible ? '✅ Visible' : '❌ Hidden'}`);
    if (boundingBox) {
      console.log(`  Size: ${boundingBox.width}x${boundingBox.height}`);
      console.log(`  Position: (${boundingBox.x}, ${boundingBox.y})`);
    }
  }
}
```

### **2. CSS Breakpoint Validation**

```bash
# Command to validate all breakpoints are properly implemented
npm run test:responsive

# Check for missing responsive classes
grep -r "class.*\(sm:\|md:\|lg:\|xl:\|2xl:\)" components/ app/ | wc -l

# Find components without responsive design
find components/ -name "*.tsx" -exec grep -L "sm:\|md:\|lg:\|xl:" {} \;
```

### **3. Touch Target Size Checker**

```javascript
// Check if all interactive elements meet minimum touch target size
function checkTouchTargets() {
  const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
  const minSize = 44; // iOS recommendation
  
  interactiveElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    if (width < minSize || height < minSize) {
      console.warn(`Touch target too small: ${element.tagName} (${width}x${height}px)`, element);
    }
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkTouchTargets);
```

### **4. Performance Testing Script**

```javascript
// Test performance across different devices
async function testPerformance() {
  const devices = ['mobile', 'tablet', 'desktop'];
  
  for (const device of devices) {
    // Simulate device conditions
    await page.emulateNetworkConditions({
      offline: false,
      downloadThroughput: device === 'mobile' ? 1.5 * 1024 * 1024 / 8 : 10 * 1024 * 1024 / 8,
      uploadThroughput: device === 'mobile' ? 750 * 1024 / 8 : 5 * 1024 * 1024 / 8,
      latency: device === 'mobile' ? 150 : 20
    });
    
    // Measure metrics
    const metrics = await page.metrics();
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    console.log(`${device} Performance:`, {
      loadTime: metrics.DOMContentLoaded,
      firstPaint: metrics.firstPaint,
      layoutDuration: metrics.LayoutDuration
    });
  }
}
```

### **5. Accessibility Testing**

```javascript
// Check accessibility issues
async function checkAccessibility() {
  const axeResults = await page.evaluate(() => {
    return new Promise((resolve) => {
      axe.run((err, results) => {
        if (err) throw err;
        resolve(results);
      });
    });
  });
  
  console.log(`Accessibility violations: ${axeResults.violations.length}`);
  axeResults.violations.forEach(violation => {
    console.log(`- ${violation.id}: ${violation.description}`);
  });
}
```

## **Manual Testing Checklist Commands**

### **Quick Test Commands:**

```bash
# Start development server
npm run dev

# Open in browser with device simulation
# Chrome: F12 -> Device Toolbar
# Firefox: F12 -> Responsive Design Mode

# Test specific breakpoints
# Mobile: 375px, 390px, 430px
# Tablet: 768px, 834px
# Desktop: 1280px, 1920px, 2560px

# Performance testing
npm run build
npm run start
# Lighthouse audit in Chrome DevTools

# Accessibility testing
npm install -g @axe-core/cli
axe http://localhost:3000

# Cross-browser testing
# Chrome, Firefox, Safari, Edge
# iOS Safari, Chrome Mobile, Samsung Internet
```

### **Critical Test Scenarios:**

1. **Navigation Flow:**
   ```
   ✅ Mobile menu opens/closes properly
   ✅ Sidebar collapses on mobile
   ✅ Search expands properly on mobile
   ✅ All buttons are tappable (44px min)
   ```

2. **Content Layout:**
   ```
   ✅ Text remains readable on all sizes
   ✅ Images scale properly
   ✅ Cards arrange correctly (1/2/3/4 columns)
   ✅ No horizontal scrolling on mobile
   ```

3. **Interactive Elements:**
   ```
   ✅ Forms work on mobile keyboards
   ✅ Modals display properly on all sizes
   ✅ Hover states work on desktop only
   ✅ Touch gestures work on mobile
   ```

4. **Performance:**
   ```
   ✅ Page loads < 3s on 3G
   ✅ Smooth animations on all devices
   ✅ No layout shifts during load
   ✅ Lazy loading works properly
   ```

## **Automated Testing Setup**

```bash
# Install testing dependencies
npm install --save-dev playwright @axe-core/playwright

# Create test files
mkdir -p tests/responsive
touch tests/responsive/layout.test.js
touch tests/responsive/performance.test.js
touch tests/responsive/accessibility.test.js

# Run tests
npm run test:responsive
npm run test:performance
npm run test:accessibility
```

## **Continuous Integration**

```yaml
# .github/workflows/responsive-testing.yml
name: Responsive Testing
on: [push, pull_request]
jobs:
  responsive-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test:responsive
      - uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: screenshots/
```

---

*🔧 **Usage**: Run these scripts regularly during development to ensure responsive design quality across all target devices and screen sizes.*
