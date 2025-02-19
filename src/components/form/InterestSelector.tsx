import React from 'react';
import { InterestSelectorProps } from './types';
import cn from 'classnames';

const INTERESTS = [
  { id: 'Beaches', label: '海滩', icon: '🏖️' },
  { id: 'City Sightseeing', label: '城市观光', icon: '🏛️' },
  { id: 'Outdoor Adventures', label: '户外探险', icon: '🏃' },
  { id: 'Festivals', label: '节日活动', icon: '🎉' },
  { id: 'Food Exploration', label: '美食探索', icon: '🍜' },
  { id: 'Nightlife', label: '夜生活', icon: '🌃' },
  { id: 'Shopping', label: '购物', icon: '🛍️' },
  { id: 'SPA Wellness', label: '休闲养生', icon: '💆' },
];

export function InterestSelector({ selectedInterests, onChange, disabled }: InterestSelectorProps) {
  const toggleInterest = (interest: string) => {
    const newInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((i) => i !== interest)
      : [...selectedInterests, interest];
    onChange(newInterests);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        兴趣偏好 (可多选)
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            type="button"
            disabled={disabled}
            onClick={() => toggleInterest(interest.id)}
            className={cn(
              'flex items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
              {
                'border-indigo-500 bg-indigo-50': selectedInterests.includes(interest.id),
                'border-gray-200 hover:border-indigo-200': !selectedInterests.includes(interest.id),
                'opacity-50 cursor-not-allowed': disabled,
              }
            )}
          >
            <span className="text-2xl">{interest.icon}</span>
            <span className="text-sm font-medium">{interest.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
