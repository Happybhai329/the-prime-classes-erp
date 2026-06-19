import * as fs from 'fs';
import * as path from 'path';

interface Finding {
  file: string;
  line: number;
  model: string;
  method: string;
  code: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  remediation: string;
}

const MODULES_DIR = path.join(__dirname, '../../apps/api/src/modules');
const REPORT_PATH = path.join(__dirname, '../../docs/tenant-security-report.md');

// Models that are inherently global and do not have tenantId scoping
const GLOBAL_MODELS = ['tenant', 'user', 'organization', 'mfaFactor', 'auditLog', 'franchise', 'partnerPortal'];

function walkDir(dir: string, fileList: string[] = []): string[] {
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

function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

function analyzeFile(filePath: string): Finding[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.join(__dirname, '../..'), filePath).replace(/\\/g, '/');
  const findings: Finding[] = [];

  // Match: this.prisma.model.method(  or  tx.model.method(
  const queryRegex = /(?:this\.prisma|tx)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\(/g;
  let match;

  while ((match = queryRegex.exec(content)) !== null) {
    const modelName = match[1];
    const methodName = match[2];
    const startIndex = match.index;

    // Skip methods that aren't data access queries (e.g. $queryRaw, $transaction)
    if (modelName.startsWith('$') || ['onModuleInit', 'constructor'].includes(methodName)) {
      continue;
    }

    // Find the matching closing parenthesis for the query arguments
    let parenCount = 1;
    let endIndex = startIndex + match[0].length;
    while (parenCount > 0 && endIndex < content.length) {
      const char = content[endIndex];
      if (char === '(') parenCount++;
      else if (char === ')') parenCount--;
      endIndex++;
    }

    const argsText = content.substring(startIndex + match[0].length, endIndex - 1);
    const fullQueryText = content.substring(startIndex, endIndex);
    const lineNumber = getLineNumber(content, startIndex);

    // Skip if it's a global model
    if (GLOBAL_MODELS.includes(modelName.toLowerCase())) {
      continue;
    }

    // Tenant Isolation Check logic:
    // We check if "tenantId" is specified directly in the query argument block
    // Or if "where" is passed as a variable (which we assume contains tenant scoping, but flag as LOW/MEDIUM risk for verification)
    const hasTenantId = argsText.includes('tenantId');
    const passesWhereVariable = argsText.replace(/\s/g, '').includes('where,') || 
                               argsText.replace(/\s/g, '').includes('where:') ||
                               argsText.replace(/\s/g, '').endsWith('where}') ||
                               argsText.replace(/\s/g, '') === 'where';

    if (!hasTenantId && !passesWhereVariable) {
      // Determine Risk:
      // findUnique/findFirst are HIGH/MEDIUM risk depending on model
      // findMany/updateMany/deleteMany/count without tenantId are HIGH risk (potential cross-tenant leak/corruption)
      let risk: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
      let remediation = '';

      const isBulk = ['findMany', 'updateMany', 'deleteMany', 'count', 'groupBy', 'aggregate'].includes(methodName);
      if (isBulk) {
        risk = 'HIGH';
        remediation = `Add \`tenantId\` filter directly to the query where clause: \`where: { tenantId, ... }\`.`;
      } else if (methodName === 'create') {
        risk = 'HIGH';
        remediation = `Ensure the created record references the current tenant: \`data: { tenantId, ... }\`.`;
      } else {
        risk = 'MEDIUM';
        remediation = `Verify if the target ID is pre-scraped/validated or add \`tenantId\` to the \`where\` filter.`;
      }

      findings.push({
        file: relativePath,
        line: lineNumber,
        model: modelName,
        method: methodName,
        code: fullQueryText.replace(/\s+/g, ' ').substring(0, 100) + (fullQueryText.length > 100 ? '...' : ''),
        risk,
        remediation,
      });
    } else if (passesWhereVariable) {
      // It passes a variable 'where', let's check if 'tenantId' is defined in the surrounding context of the file.
      // If the file does not mention 'tenantId' or 'TenantId' at all, it's a HIGH risk!
      const lines = content.split('\n');
      const startLineIdx = Math.max(0, lineNumber - 25);
      const endLineIdx = Math.min(lines.length - 1, lineNumber + 5);
      const contextSnippet = lines.slice(startLineIdx, endLineIdx).join('\n');

      if (!contextSnippet.includes('tenantId') && !contextSnippet.includes('TenantId')) {
        findings.push({
          file: relativePath,
          line: lineNumber,
          model: modelName,
          method: methodName,
          code: fullQueryText.replace(/\s+/g, ' ').substring(0, 100) + (fullQueryText.length > 100 ? '...' : ''),
          risk: 'HIGH',
          remediation: `Query uses variable 'where' but 'tenantId' is not found in the surrounding method context. Explicitly add \`tenantId\` parameter and scoping.`,
        });
      }
    }
  }

  return findings;
}

function generateReport(findings: Finding[]) {
  const highRisk = findings.filter(f => f.risk === 'HIGH');
  const mediumRisk = findings.filter(f => f.risk === 'MEDIUM');
  const lowRisk = findings.filter(f => f.risk === 'LOW');

  const md = `# Tenant Isolation Security Audit Report

Generated on: ${new Date().toISOString()}

This report lists Prisma database queries that do not explicitly reference a \`tenantId\` filter, potentially violating the multi-tenant isolation model.

## Executive Summary
- **Total Findings**: ${findings.length}
- **🔴 High Risk (Bulk operations / un-scraped writes)**: ${highRisk.length}
- **🟡 Medium Risk (Single record reads/updates)**: ${mediumRisk.length}
- **🟢 Low Risk**: ${lowRisk.length}

---

## Detailed Findings

${findings.map((f, i) => `
### ${i + 1}. [${f.risk}] ${f.model}.${f.method} in ${f.file}
- **File**: [${path.basename(f.file)}](${f.file}#L${f.line}) (Line ${f.line})
- **Query Code**: \`${f.code}\`
- **Remediation**: ${f.remediation}
`).join('\n')}

---
*End of Report*
`;

  fs.writeFileSync(REPORT_PATH, md);
  console.log(`Report successfully written to: ${REPORT_PATH}`);
}

function runAudit() {
  console.log(`Starting Tenant Isolation Audit inside: ${MODULES_DIR}`);
  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`Modules directory does not exist: ${MODULES_DIR}`);
    return;
  }

  // Ensure docs folder exists
  const docsDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const files = walkDir(MODULES_DIR);
  console.log(`Found ${files.length} service files to analyze.`);

  let allFindings: Finding[] = [];
  for (const file of files) {
    const findings = analyzeFile(file);
    allFindings = allFindings.concat(findings);
  }

  generateReport(allFindings);
}

runAudit();
