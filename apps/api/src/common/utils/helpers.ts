/**
 * Builds a pagination meta object for API responses.
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Generates a unique receipt/invoice number.
 * Format: PREFIX-YYYYMMDD-NNNNN
 */
export function generateInvoiceNumber(
  prefix: string,
  sequence: number,
): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = sequence.toString().padStart(5, '0');
  return `${prefix}-${dateStr}-${seqStr}`;
}

/**
 * Calculates grade from percentage.
 */
export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

/**
 * Generates a roll number.
 * Format: BATCH_CODE/YEAR/SEQUENCE
 */
export function generateRollNumber(
  batchCode: string,
  year: number,
  sequence: number,
): string {
  return `${batchCode}/${year}/${sequence.toString().padStart(3, '0')}`;
}
