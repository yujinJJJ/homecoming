/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { RFIData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  data: RFIData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ data }) => {
  // 1. 일별 질의 접수 추이
  const dailyCounts = data.reduce((acc, curr) => {
    const dateStr = curr.접수일.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedDates = Object.keys(dailyCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const lineData = {
    labels: sortedDates,
    datasets: [
      {
        label: '접수 건수',
        data: sortedDates.map(date => dailyCounts[date]),
        borderColor: '#3E7CB1',
        backgroundColor: 'rgba(62, 124, 177, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 2. 국가별 질의 비중 (Top 7 + 기타)
  const countryCounts = data.reduce((acc, curr) => {
    acc[curr.국가] = (acc[curr.국가] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countryCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
  const top7 = sortedCountries.slice(0, 7);
  const othersCount = sortedCountries.slice(7).reduce((sum: number, [_, count]) => sum + (count as number), 0);
  
  const donutData = {
    labels: [...top7.map(([name]) => name), ...(othersCount > 0 ? ['기타'] : [])],
    datasets: [
      {
        data: [...top7.map(([_, count]) => count), ...(othersCount > 0 ? [othersCount] : [])],
        backgroundColor: [
          '#15243F', '#3E7CB1', '#64B5F6', '#90CAF9', '#BBDEFB', '#E3F2FD', '#CFD8DC', '#B0BEC5'
        ],
        borderWidth: 0,
      },
    ],
  };

  // 3. 대상체계별 질의 건수
  const systemCounts = data.reduce((acc, curr) => {
    acc[curr.대상체계] = (acc[curr.대상체계] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSystems = Object.entries(systemCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);


  const barData = {
    labels: sortedSystems.map(([name]) => name),
    datasets: [
      {
        label: '건수',
        data: sortedSystems.map(([_, count]) => count),
        backgroundColor: '#3E7CB1',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-slate-800 font-bold mb-4">일별 질의 접수 추이</h4>
        <div className="h-64">
          <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h4 className="text-slate-800 font-bold mb-4">국가별 질의 비중</h4>
        <div className="h-64 flex justify-center">
          <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm lg:col-span-2">
        <h4 className="text-slate-800 font-bold mb-4">대상체계별 질의 건수</h4>
        <div className="h-64">
          <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
};
