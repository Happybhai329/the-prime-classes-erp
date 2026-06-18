import api from '@/lib/api';
import type { FranchiseReportSummary, ApiResponse } from '@prime/shared-types';

export const franchiseService = {
  getFranchiseReport: async (): Promise<FranchiseReportSummary> => {
    const res = await api.get<ApiResponse<FranchiseReportSummary>>('/franchise/report');
    return res.data.data;
  },
};
export default franchiseService;
