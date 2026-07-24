/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { FileUploader } from './components/FileUploader';
import { MetricCard } from './components/MetricCard';
import { DashboardCharts } from './components/DashboardCharts';
import { AIInsightPanel } from './components/AIInsightPanel';
import { WeeklyReport } from './components/WeeklyReport';
import { FilterSection } from './components/FilterSection';
import { RFIData, AIInsightResponse, DashboardFilters } from './types';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  Globe2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [rawData, setRawData] = useState<RFIData[]>([]);
  const [filteredData, setFilteredData] = useState<RFIData[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({
    countries: [],
    systems: [],
    types: [],
    departments: [],
    statuses: [],
    elReviews: [],
    startDate: '',
    endDate: ''
  });
  const [insights, setInsights] = useState<AIInsightResponse | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Filter options derived from data
  const filterOptions = useMemo(() => {
    if (rawData.length === 0) return null;
    return {
      countries: Array.from(new Set(rawData.map(d => d.국가))).sort(),
      systems: Array.from(new Set(rawData.map(d => d.대상체계))).sort(),
      types: Array.from(new Set(rawData.map(d => d.질의유형))).sort(),
      departments: Array.from(new Set(rawData.map(d => d.담당부서))).sort(),
      statuses: Array.from(new Set(rawData.map(d => d.처리상태))).sort(),
      elReviews: Array.from(new Set(rawData.map(d => d.EL검토여부))).sort(),
    };
  }, [rawData]);

  // Initial data load
  const handleDataLoaded = (newData: RFIData[]) => {
    setRawData(newData);
    
    // Set default filter values
    const options = {
      countries: Array.from(new Set(newData.map(d => d.국가))),
      systems: Array.from(new Set(newData.map(d => d.대상체계))),
      types: Array.from(new Set(newData.map(d => d.질의유형))),
      departments: Array.from(new Set(newData.map(d => d.담당부서))),
      statuses: Array.from(new Set(newData.map(d => d.처리상태))),
      elReviews: Array.from(new Set(newData.map(d => d.EL검토여부))),
    };

    const dates = newData.map(d => d.접수일.getTime());
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

    setFilters({
      ...options,
      startDate: minDate,
      endDate: maxDate
    });
    
    setFilteredData(newData);
    triggerAIAnalysis(newData, "최초 데이터 로드 - 전체 현황");
    setReportMarkdown(null); // Reset report on new data
  };

  // Debounced Filter Effect
  useEffect(() => {
    if (rawData.length === 0) return;

    const timer = setTimeout(() => {
      const filtered = rawData.filter(d => {
        const matchesCountry = filters.countries.length === 0 || filters.countries.includes(d.국가);
        const matchesSystem = filters.systems.length === 0 || filters.systems.includes(d.대상체계);
        const matchesType = filters.types.length === 0 || filters.types.includes(d.질의유형);
        const matchesDept = filters.departments.length === 0 || filters.departments.includes(d.담당부서);
        const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(d.처리상태);
        const matchesEL = filters.elReviews.length === 0 || filters.elReviews.includes(d.EL검토여부);
        
        const date = d.접수일.toISOString().split('T')[0];
        const matchesDate = (!filters.startDate || date >= filters.startDate) && 
                            (!filters.endDate || date <= filters.endDate);

        return matchesCountry && matchesSystem && matchesType && matchesDept && matchesStatus && matchesEL && matchesDate;
      });
      setFilteredData(filtered);
    }, 150);

    return () => clearTimeout(timer);
  }, [filters, rawData]);

  const triggerAIAnalysis = async (dataSubset: RFIData[], context?: string) => {
    if (dataSubset.length === 0) return;
    setLoadingAI(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: dataSubset,
          filterContext: context || getFilterContextString()
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setInsights(result);
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleGenerateReport = async () => {
    if (filteredData.length === 0) return;
    setLoadingReport(true);
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: filteredData,
          filterContext: getFilterContextString()
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setReportMarkdown(result.report);
      }
    } catch (error) {
      console.error('Report Generation failed:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  const getFilterContextString = () => {
    const parts = [];
    if (filters.countries.length < (filterOptions?.countries.length || 0)) parts.push(`국가: ${filters.countries.join(', ')}`);
    if (filters.systems.length < (filterOptions?.systems.length || 0)) parts.push(`체계: ${filters.systems.join(', ')}`);
    if (filters.types.length < (filterOptions?.types.length || 0)) parts.push(`유형: ${filters.types.join(', ')}`);
    if (filters.statuses.length < (filterOptions?.statuses.length || 0)) parts.push(`상태: ${filters.statuses.join(', ')}`);
    return parts.length > 0 ? parts.join(' | ') : "전체 조건";
  };

  // Metrics Calculation
  const totalCount = filteredData.length;
  const completedCount = filteredData.filter(d => d.처리상태 === '회신완료').length;
  const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;
  
  const avgLeadTime = totalCount > 0 
    ? (filteredData.reduce((sum, d) => sum + d.소요일수, 0) / totalCount).toFixed(1)
    : 0;

  const today = new Date();
  const urgentCount = filteredData.filter(d => {
    if (d.처리상태 === '회신완료') return false;
    const diffDays = Math.ceil((d.회신기한.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  const elReviewCount = filteredData.filter(d => d.EL검토여부 === 'Y').length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="dashboard-header text-white py-8 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Globe2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">해외 기술질의(RFI) 대응 현황</h1>
              <p className="text-blue-100 text-sm">해외사업관리팀 주간 보고 대시보드</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-blue-100 text-xs">기준일: {new Date().toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 -mt-6">
        {/* Upload Section */}
        <div className="mb-8">
          <FileUploader onDataLoaded={handleDataLoaded} />
        </div>

        {rawData.length > 0 && filterOptions && (
          <div className="mb-8">
            <FilterSection 
              filters={filters} 
              options={filterOptions} 
              onFilterChange={setFilters}
              onAIAnalyze={() => triggerAIAnalysis(filteredData)}
              isAIAnalyzing={loadingAI}
            />
          </div>
        )}

        {filteredData.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                현황 분석 지표
                <span className="text-sm font-normal text-slate-500 ml-2">
                  (필터 결과: {totalCount}건 / 전체: {rawData.length}건)
                </span>
              </h2>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard 
                label="총 질의 건수" 
                value={`${totalCount}건`} 
                icon={BarChart3} 
                colorClass="bg-blue-50 text-blue-600" 
              />
              <MetricCard 
                label="회신완료율" 
                value={`${completionRate}%`} 
                icon={CheckCircle2} 
                colorClass="bg-green-50 text-green-600" 
                subtext={`완료: ${completedCount}건`}
              />
              <MetricCard 
                label="평균 소요일수" 
                value={`${avgLeadTime}일`} 
                icon={Clock} 
                colorClass="bg-slate-50 text-slate-600" 
              />
              <MetricCard 
                label="기한임박 (D-3)" 
                value={`${urgentCount}건`} 
                icon={AlertCircle} 
                colorClass="bg-rose-50 text-rose-600" 
              />
              <MetricCard 
                label="EL검토 대상" 
                value={`${elReviewCount}건`} 
                icon={ShieldCheck} 
                colorClass="bg-amber-50 text-amber-600" 
              />
            </div>

            {/* Charts Section */}
            <DashboardCharts data={filteredData} />

            {/* Weekly Report Section */}
            <WeeklyReport 
              reportMarkdown={reportMarkdown} 
              loading={loadingReport} 
              onGenerate={handleGenerateReport}
              startDate={filters.startDate}
              endDate={filters.endDate}
            />

            {/* AI Insights Section */}
            <AnimatePresence>
              {(loadingAI || insights) && (
                <AIInsightPanel insights={insights} loading={loadingAI} />
              )}
            </AnimatePresence>
          </motion.div>
        ) : rawData.length > 0 ? (
          <div className="bg-white border border-slate-100 rounded-xl p-12 text-center">
             <p className="text-slate-500">필터 조건에 맞는 데이터가 없습니다. 필터를 조정해주세요.</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-xl p-12 flex flex-col items-center justify-center text-center opacity-60">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <BarChart3 className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-bold text-xl">대시보드 데이터 없음</h3>
            <p className="text-slate-500 max-w-md mt-2">
              상단의 업로드 영역에 RFI 현황 엑셀 파일을 업로드하면 
              자동으로 시각화 및 AI 분석이 시작됩니다.
            </p>
          </div>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-6 lg:px-12 py-12 text-center">
        <p className="text-slate-400 text-xs italic">
          &copy; 2024 해외 RFI 기술질의 대응 현황 대시보드 | AI Powered Insights
        </p>
      </footer>
    </div>
  );
}

