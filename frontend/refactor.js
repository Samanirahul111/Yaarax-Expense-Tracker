const fs = require('fs');
const path = require('path');

function processDirectory(dir, basePath) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, basePath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      if (fullPath.includes('api.js') || fullPath.includes('refactor.js')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://127.0.0.1:8000')) {
        // Calculate relative path to api.js
        const relativeToSrc = path.relative(path.dirname(fullPath), path.join(basePath, 'src'));
        let importPath = relativeToSrc === '' ? './api' : `${relativeToSrc}/api`;
        // Normalize for Windows
        importPath = importPath.replace(/\\/g, '/');
        
        const importStatement = `import { API_BASE_URL } from '${importPath}';\n`;
        
        // Add import at the top if not present
        if (!content.includes('import { API_BASE_URL }')) {
            // Find the last import statement to insert after it, or just insert at top
            const lines = content.split('\n');
            let lastImportIdx = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('import ')) {
                    lastImportIdx = i;
                }
            }
            if (lastImportIdx !== -1) {
                lines.splice(lastImportIdx + 1, 0, importStatement);
            } else {
                lines.unshift(importStatement);
            }
            content = lines.join('\n');
        }

        // Replace literal strings like 'http://127.0.0.1:8000/api/...'
        content = content.replace(/'http:\/\/127\.0\.0\.1:8000([^']+)'/g, '`${API_BASE_URL}$1`');
        
        // Replace inside template literals like `http://127.0.0.1:8000${profilePictureUrl}`
        content = content.replace(/http:\/\/127\.0\.0\.1:8000/g, '${API_BASE_URL}');
        
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const srcDir = path.join(__dirname, 'src');
processDirectory(srcDir, __dirname);
