/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, colorClass, subtext }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-slate-400 text-xs mt-1">{subtext}</p>}
      </div>
      <div className={`${colorClass} p-2 rounded-lg`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};
