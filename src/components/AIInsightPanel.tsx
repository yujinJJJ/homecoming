/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Loader2, ListChecks, Activity, MessageSquare } from 'lucide-react';
import { AIInsightResponse } from '../types';

interface AIInsightPanelProps {
  insights: AIInsightResponse | null;
  loading: boolean;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm mt-8 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Gemini가 데이터를 분석 중입니다...</p>
        <p className="text-slate-400 text-sm mt-1">질의 패턴과 주요 특징을 추출하고 있습니다.</p>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-amber-500" />
        <h4 className="text-xl font-bold text-slate-800">AI 인사이트</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-blue-500" />
            <h5 className="font-bold text-slate-700">핵심 특징</h5>
          </div>
          <ul className="space-y-3">
            {insights.keyFeatures.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full mt-1 shrink-0">
                  {i + 1}
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-500" />
            <h5 className="font-bold text-slate-700">주목할 패턴</h5>
          </div>
          <ul className="space-y-3">
            {insights.notablePatterns.map((pattern, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 shrink-0" />
                {pattern}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h5 className="font-bold text-slate-700">종합 요약</h5>
        </div>
        <p className="text-slate-700 bg-indigo-50 p-4 rounded-lg border border-indigo-100 italic">
          "{insights.oneLineSummary}"
        </p>
      </div>
    </div>
  );
};
