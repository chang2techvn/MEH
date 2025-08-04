#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to scan
const projectRoot = path.resolve(__dirname, '..');
const srcDirs = [
  'app',
  'components', 
  'contexts',
  'hooks',
  'lib',
  'types'
];

// Extensions to analyze
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Files to exclude from unused analysis
const excludeFiles = [
  'next.config.mjs',
  'tailwind.config.ts',
  'postcss.config.js',
  'middleware.ts',
  'page.tsx', // Next.js pages
  'layout.tsx', // Next.js layouts
  'loading.tsx', // Next.js loading
  'route.ts', // Next.js API routes
  'globals.css',
  'tsconfig.json',
  'package.json'
];

const excludePatterns = [
  /\.d\.ts$/, // Type declaration files
  /\.config\./,
  /node_modules/,
  /\.git/,
  /\.next/,
  /public\//,
  /scripts\//,
  /supabase\//
];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (extensions.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function shouldExcludeFile(filePath) {
  const fileName = path.basename(filePath);
  const relativePath = path.relative(projectRoot, filePath);
  
  // Exclude specific files
  if (excludeFiles.includes(fileName)) return true;
  
  // Exclude patterns
  if (excludePatterns.some(pattern => pattern.test(relativePath))) return true;
  
  return false;
}

function extractImports(content) {
  const imports = new Set();
  
  // Match various import patterns
  const importPatterns = [
    // import ... from '...'
    /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g,
    // require('...')
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // dynamic import()
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  
  importPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.add(match[1]);
    }
  });
  
  return imports;
}

function resolveImportPath(importPath, fromFile) {
  // Handle relative imports
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return path.resolve(path.dirname(fromFile), importPath);
  }
  
  // Handle alias imports (@/)
  if (importPath.startsWith('@/')) {
    return path.resolve(projectRoot, importPath.substring(2));
  }
  
  // Skip node_modules and external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }
  
  return path.resolve(projectRoot, importPath);
}

function findActualFile(basePath) {
  if (!basePath) return null;
  
  // Try exact match first
  if (fs.existsSync(basePath)) {
    return basePath;
  }
  
  // Try with extensions
  for (const ext of extensions) {
    const withExt = basePath + ext;
    if (fs.existsSync(withExt)) {
      return withExt;
    }
  }
  
  // Try index files
  for (const ext of extensions) {
    const indexFile = path.join(basePath, 'index' + ext);
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }
  
  return null;
}

function analyzeProject() {
  console.log('🔍 Analyzing project for unused files...\n');
  
  // Get all files in source directories
  const allFiles = [];
  srcDirs.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (fs.existsSync(dirPath)) {
      getAllFiles(dirPath, allFiles);
    }
  });
  
  // Filter out excluded files
  const sourceFiles = allFiles.filter(file => !shouldExcludeFile(file));
  
  console.log(`📁 Found ${sourceFiles.length} source files to analyze`);
  
  // Track which files are imported
  const importedFiles = new Set();
  const importGraph = new Map();
  
  // Analyze each file
  sourceFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = extractImports(content);
      const fileImports = new Set();
      
      imports.forEach(importPath => {
        const resolvedPath = resolveImportPath(importPath, filePath);
        const actualFile = findActualFile(resolvedPath);
        
        if (actualFile && sourceFiles.includes(actualFile)) {
          importedFiles.add(actualFile);
          fileImports.add(actualFile);
        }
      });
      
      importGraph.set(filePath, fileImports);
    } catch (error) {
      console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
    }
  });
  
  // Find unused files
  const unusedFiles = sourceFiles.filter(file => {
    // Always keep entry points
    const relativePath = path.relative(projectRoot, file);
    if (relativePath.includes('page.tsx') || 
        relativePath.includes('layout.tsx') ||
        relativePath.includes('route.ts') ||
        relativePath.includes('middleware.ts')) {
      return false;
    }
    
    return !importedFiles.has(file);
  });
  
  // Display results
  console.log('\n📊 Analysis Results:');
  console.log(`- Total files analyzed: ${sourceFiles.length}`);
  console.log(`- Files with imports: ${importedFiles.size}`);
  console.log(`- Potentially unused files: ${unusedFiles.length}\n`);
  
  if (unusedFiles.length > 0) {
    console.log('🗑️  Potentially unused files:');
    unusedFiles.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      const size = fs.statSync(file).size;
      console.log(`  - ${relativePath} (${(size / 1024).toFixed(1)}KB)`);
    });
  } else {
    console.log('✅ No unused files detected!');
  }
  
  // Show some statistics
  console.log('\n📈 File Usage Statistics:');
  const filesByDirectory = {};
  sourceFiles.forEach(file => {
    const dir = path.dirname(path.relative(projectRoot, file)).split(path.sep)[0];
    filesByDirectory[dir] = (filesByDirectory[dir] || 0) + 1;
  });
  
  Object.entries(filesByDirectory).forEach(([dir, count]) => {
    const unusedInDir = unusedFiles.filter(file => 
      path.relative(projectRoot, file).startsWith(dir)
    ).length;
    console.log(`  ${dir}: ${count} files (${unusedInDir} potentially unused)`);
  });

  // Additional analysis: Find old or duplicate files
  console.log('\n🔍 Additional Analysis:');
  
  // Find files with "-old" or similar patterns
  const oldFiles = sourceFiles.filter(file => {
    const name = path.basename(file);
    return name.includes('-old') || name.includes('.old') || name.includes('_old');
  });
  
  if (oldFiles.length > 0) {
    console.log('\n📂 Files with "old" patterns:');
    oldFiles.forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      console.log(`  - ${relativePath}`);
    });
  }
  
  // Find very large files that might need attention
  const largeFiles = sourceFiles.filter(file => {
    return fs.statSync(file).size > 50 * 1024; // > 50KB
  }).sort((a, b) => fs.statSync(b).size - fs.statSync(a).size);
  
  if (largeFiles.length > 0) {
    console.log('\n📏 Large files (>50KB):');
    largeFiles.slice(0, 10).forEach(file => {
      const relativePath = path.relative(projectRoot, file);
      const size = fs.statSync(file).size;
      console.log(`  - ${relativePath} (${(size / 1024).toFixed(1)}KB)`);
    });
  }

  return {
    totalFiles: sourceFiles.length,
    unusedFiles: unusedFiles,
    oldFiles: oldFiles,
    largeFiles: largeFiles
  };
}

// Run the analysis
if (require.main === module) {
  try {
    analyzeProject();
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeProject };
