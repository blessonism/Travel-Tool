import React from 'react';
import { BudgetSelectorProps, BudgetRange } from './types';
import cn from 'classnames';

const BUDGET_OPTIONS: Array<{
  value: BudgetRange;
  label: string;
  description: string;
}> = [
  {
    value: '0 - 1000',
    label: '经济型',
    description: '每天0-1000元',
  },
  {
    value: '1000 - 2500',
    label: '舒适型',
    description: '每天1000-2500元',
  },
  {
    value: '2500+',
    label: '豪华型',
    description: '每天2500元以上',
  },
];

export function BudgetSelector({ value, onChange, disabled }: BudgetSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        预算范围
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BUDGET_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200',
              {
                'border-indigo-500 bg-indigo-50': value === option.value,
                'border-gray-200 hover:border-indigo-200': value !== option.value,
                'opacity-50 cursor-not-allowed': disabled,
              }
            )}
          >
            <span className="text-lg font-medium">{option.label}</span>
            <span className="text-sm text-gray-500">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
