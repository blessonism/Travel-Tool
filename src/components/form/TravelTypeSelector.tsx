import React from 'react';
import { TravelTypeSelectorProps } from './types';
import cn from 'classnames';

const TRAVEL_TYPES = [
  { id: 'solo', label: '个人', description: '独自探索' },
  { id: 'couple', label: '情侣', description: '浪漫之旅' },
  { id: 'family', label: '家庭', description: '亲子时光' },
  { id: 'friends', label: '朋友', description: '友情之旅' },
];

export function TravelTypeSelector({ value, onChange, disabled }: TravelTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        旅行类型
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TRAVEL_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type.id)}
            className={cn(
              'flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200',
              {
                'border-indigo-500 bg-indigo-50': value === type.id,
                'border-gray-200 hover:border-indigo-200': value !== type.id,
                'opacity-50 cursor-not-allowed': disabled,
              }
            )}
          >
            <span className="text-lg font-medium">{type.label}</span>
            <span className="text-sm text-gray-500">{type.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
