const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../../apps/api/src/modules');

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.service.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '../..'), filePath).replace(/\\/g, '/');
  const issues = [];

  const queryRegex = /(?:this\.prisma|tx)\.([a-zA-Z0-9_]+)\.(findMany|findFirst|findUnique|update|updateMany)\(/g;
  let match;

  while ((match = queryRegex.exec(content)) !== null) {
    const model = match[1];
    const method = match[2];
    const startIndex = match.index;

    // Skip helper calls
    if (model.startsWith('$')) continue;

    // Count parentheses to extract arguments block
    let parenCount = 1;
    let endIndex = startIndex + match[0].length;
    while (parenCount > 0 && endIndex < content.length) {
      const char = content[endIndex];
      if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      endIndex++;
    }

    const argsText = content.substring(startIndex + match[0].length, endIndex - 1);
    const lineNumber = getLineNumber(content, startIndex);

    // 1. Check for missing limit/take in findMany queries
    if (method === 'findMany') {
      const hasTake = argsText.includes('take') || argsText.includes('limit');
      const hasWhere = argsText.includes('where');
      
      // If no take limit is specified in findMany, warn about potential out-of-memory or database load
      if (!hasTake) {
        issues.push({
          file: relativePath,
          line: lineNumber,
          type: 'MISSING_LIMIT',
          message: `findMany query on model '${model}' does not specify a 'take' or 'limit' clause. Potential performance bottleneck.`,
          code: content.substring(startIndex, endIndex).replace(/\s+/g, ' ').substring(0, 120),
        });
      }
    }

    // 2. Check for deeply nested includes (N+1 query risk)
    const includeCount = (argsText.match(/include\s*:/g) || []).length;
    if (includeCount > 1) {
      issues.push({
        file: relativePath,
        line: lineNumber,
        type: 'NESTED_INCLUDES',
        message: `Query on model '${model}' contains ${includeCount} nested 'include' blocks. Consider using 'select' or separate queries to optimize load.`,
        code: content.substring(startIndex, endIndex).replace(/\s+/g, ' ').substring(0, 120),
      });
    }
  }

  return issues;
}

function runAudit() {
  console.log(`Starting Prisma query audit inside: ${MODULES_DIR}`);
  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`Directory not found: ${MODULES_DIR}`);
    return;
  }

  const files = walkDir(MODULES_DIR);
  let allIssues = [];
  for (const file of files) {
    allIssues = allIssues.concat(analyzeFile(file));
  }

  console.log(`\n=== PRISMA QUERY PERFORMANCE AUDIT RESULTS ===`);
  console.log(`Total query issues found: ${allIssues.length}`);
  
  const limitIssues = allIssues.filter(i => i.type === 'MISSING_LIMIT');
  const includeIssues = allIssues.filter(i => i.type === 'NESTED_INCLUDES');

  console.log(`- Missing limit (take) clauses: ${limitIssues.length}`);
  console.log(`- Deeply nested include clauses: ${includeIssues.length}\n`);

  limitIssues.slice(0, 10).forEach((issue, idx) => {
    console.log(`[Limit Warning ${idx+1}] ${issue.file}:${issue.line}\n  Code: ${issue.code}\n`);
  });

  includeIssues.slice(0, 10).forEach((issue, idx) => {
    console.log(`[Include Warning ${idx+1}] ${issue.file}:${issue.line}\n  Code: ${issue.code}\n`);
  });
}

runAudit();
