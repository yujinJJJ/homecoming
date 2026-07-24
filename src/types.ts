/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RFIData {
  질의ID: string;
  접수일: Date;
  회신기한: Date;
  고객코드: string;
  국가: string;
  대상체계: string;
  질의유형: string;
  담당부서: string;
  처리상태: string;
  EL검토여부: string;
  보안등급: string;
  소요일수: number;
  수정횟수: number;
}

export interface AIInsightResponse {
  keyFeatures: string[];
  notablePatterns: string[];
  oneLineSummary: string;
}

export interface DashboardFilters {
  countries: string[];
  systems: string[];
  types: string[];
  departments: string[];
  statuses: string[];
  elReviews: string[];
  startDate: string;
  endDate: string;
}
