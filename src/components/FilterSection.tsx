/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X, Filter, Calendar, Sparkles, Loader2 } from 'lucide-react';
import { DashboardFilters } from '../types';

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const selectAll = () => onChange(options);
  const clearAll = () => onChange([]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 hover:border-blue-400 transition-colors"
      >
        <span className="truncate">
          {selected.length === 0 
            ? '전체 선택됨' 
            : selected.length === options.length 
              ? '전체 선택됨' 
              : `${selected.length}개 선택됨`}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl py-2 min-w-[200px]">
          <div className="px-3 py-2 border-b border-slate-100 flex justify-between gap-2">
            <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">전체 선택</button>
            <button onClick={clearAll} className="text-xs text-slate-500 hover:underline">해제</button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {options.map(option => (
              <label
                key={option}
                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-blue-600 mr-2"
                  checked={selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span className="text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface FilterSectionProps {
  filters: DashboardFilters;
  options: {
    countries: string[];
    systems: string[];
    types: string[];
    departments: string[];
    statuses: string[];
    elReviews: string[];
  };
  onFilterChange: (filters: DashboardFilters) => void;
  onAIAnalyze: () => void;
  isAIAnalyzing: boolean;
}

export const FilterSection: React.FC<FilterSectionProps> = ({ 
  filters, 
  options, 
  onFilterChange,
  onAIAnalyze,
  isAIAnalyzing
}) => {
  const handleChange = (key: keyof DashboardFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 uppercase tracking-tight">상세 필터 설정</h3>
        </div>
        <button
          onClick={onAIAnalyze}
          disabled={isAIAnalyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAIAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isAIAnalyzing ? '분석 중...' : '조건별 AI 비교 분석'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <MultiSelect 
          label="국가" 
          options={options.countries} 
          selected={filters.countries} 
          onChange={(v) => handleChange('countries', v)} 
        />
        <MultiSelect 
          label="대상체계" 
          options={options.systems} 
          selected={filters.systems} 
          onChange={(v) => handleChange('systems', v)} 
        />
        <MultiSelect 
          label="질의유형" 
          options={options.types} 
          selected={filters.types} 
          onChange={(v) => handleChange('types', v)} 
        />
        <MultiSelect 
          label="담당부서" 
          options={options.departments} 
          selected={filters.departments} 
          onChange={(v) => handleChange('departments', v)} 
        />
        <MultiSelect 
          label="처리상태" 
          options={options.statuses} 
          selected={filters.statuses} 
          onChange={(v) => handleChange('statuses', v)} 
        />
        <MultiSelect 
          label="EL검토여부" 
          options={options.elReviews} 
          selected={filters.elReviews} 
          onChange={(v) => handleChange('elReviews', v)} 
        />
      </div>

      <div className="flex flex-col md:flex-row items-end gap-4 pt-4 border-t border-slate-50">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 ml-1 text-xs font-semibold text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>접수일 기간 설정</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-full"
            />
            <span className="text-slate-400">~</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 w-full"
            />
          </div>
        </div>
        <div className="text-right">
          <button 
            onClick={() => onFilterChange({
              countries: options.countries,
              systems: options.systems,
              types: options.types,
              departments: options.departments,
              statuses: options.statuses,
              elReviews: options.elReviews,
              startDate: filters.startDate,
              endDate: filters.endDate
            })}
            className="text-xs text-slate-400 hover:text-blue-500 underline"
          >
            모든 필터 초기화
          </button>
        </div>
      </div>
    </div>
  );
};
