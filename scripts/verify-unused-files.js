#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that were identified as potentially unused
const suspiciousFiles = [
  "hooks/use-user-progress-old.ts",
  "components/ai-helper/message-item.tsx",
  "components/home/mobile-top-navigation.tsx", 
  "components/optimized/dynamic-components.tsx",
  "components/profile/profile-post.tsx",
  "components/ui/notification-test.tsx",
  "components/ui/video-upload.tsx",
  "contexts/user-activity-context.tsx",
  "lib/performance-testing.ts",
  "lib/seo-utils.ts",
  "lib/storage-utils.ts",
  "lib/api-key-health.ts",
  "app/service-worker.ts",
  "components/service-worker-registration.tsx"
];

const projectRoot = path.resolve(__dirname, '..');

function findFileReferences(filename) {
  const searchName = path.basename(filename, path.extname(filename));
  const references = [];
  
  // Search in all .ts, .tsx, .js, .jsx files
  function searchInDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
          searchInDirectory(filePath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Check for various import patterns
            const patterns = [
              new RegExp(`from\\s*['"].*${searchName}['"]`, 'g'),
              new RegExp(`import.*${searchName}`, 'g'),
              new RegExp(`require\\s*\\(\\s*['"].*${searchName}.*['"]`, 'g'),
              new RegExp(`@/${filename.replace(/\\/g, '/')}`, 'g'),
              new RegExp(`\\./${searchName}`, 'g'),
              new RegExp(`${searchName}`, 'g')
            ];
            
            patterns.forEach(pattern => {
              const matches = content.match(pattern);
              if (matches && matches.length > 0) {
                const relativePath = path.relative(projectRoot, filePath);
                if (relativePath !== filename) { // Don't count self-references
                  references.push({
                    file: relativePath,
                    matches: matches,
                    line: content.split('\n').findIndex(line => pattern.test(line)) + 1
                  });
                }
              }
            });
          } catch (error) {
            // Skip files that can't be read
          }
        }
      });
    } catch (error) {
      // Skip directories that can't be accessed
    }
  }
  
  searchInDirectory(projectRoot);
  return references;
}

function checkFileUsage() {
  console.log('🔍 Đang kiểm tra chi tiết các file nghi ngờ không được sử dụng...\n');
  
  const results = {
    definitelyUnused: [],
    maybeUnused: [],
    actuallyUsed: []
  };
  
  suspiciousFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File không tồn tại: ${file}`);
      return;
    }
    
    // Check file size
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    
    // Find references
    const references = findFileReferences(file);
    
    console.log(`📁 ${file} (${sizeKB}KB)`);
    
    if (stats.size === 0) {
      console.log(`   ✅ File trống - An toàn xóa`);
      results.definitelyUnused.push(file);
    } else if (references.length === 0) {
      console.log(`   ⚠️  Không tìm thấy tham chiếu - Có thể xóa`);
      results.maybeUnused.push(file);
    } else {
      console.log(`   🔗 Tìm thấy ${references.length} tham chiếu:`);
      references.forEach(ref => {
        console.log(`       - ${ref.file}:${ref.line}`);
      });
      results.actuallyUsed.push(file);
    }
    console.log('');
  });
  
  return results;
}

// Manual check for specific patterns
function manualChecks() {
  console.log('🔍 Kiểm tra thủ công các file đặc biệt...\n');
  
  // Check for files with 'old' pattern
  const oldFiles = [];
  function findOldFiles(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.includes('node_modules')) {
          findOldFiles(filePath);
        } else if (file.includes('-old') || file.includes('.old') || file.includes('_old')) {
          const relativePath = path.relative(projectRoot, filePath);
          oldFiles.push(relativePath);
        }
      });
    } catch (error) {
      // Skip
    }
  }
  
  findOldFiles(projectRoot);
  
  if (oldFiles.length > 0) {
    console.log('📂 Files với pattern "old":');
    oldFiles.forEach(file => {
      const filePath = path.join(projectRoot, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`   - ${file} (${sizeKB}KB)`);
    });
  }
  
  return { oldFiles };
}

if (require.main === module) {
  const results = checkFileUsage();
  const manual = manualChecks();
  
  console.log('\n📊 Tổng kết:');
  console.log(`✅ Chắc chắn có thể xóa: ${results.definitelyUnused.length} files`);
  console.log(`⚠️  Có thể xóa (cần kiểm tra): ${results.maybeUnused.length} files`);
  console.log(`🔗 Đang được sử dụng: ${results.actuallyUsed.length} files`);
  console.log(`📂 Files có pattern 'old': ${manual.oldFiles.length} files`);
  
  if (results.definitelyUnused.length > 0) {
    console.log('\n✅ An toàn xóa ngay:');
    results.definitelyUnused.forEach(file => console.log(`   - ${file}`));
  }
  
  if (results.maybeUnused.length > 0) {
    console.log('\n⚠️  Cần kiểm tra kỹ hơn:');
    results.maybeUnused.forEach(file => console.log(`   - ${file}`));
  }
  
  if (manual.oldFiles.length > 0) {
    console.log('\n📂 Files backup cũ (khả năng cao có thể xóa):');
    manual.oldFiles.forEach(file => console.log(`   - ${file}`));
  }
}
