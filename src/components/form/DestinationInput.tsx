import React from 'react';
import { DestinationInputProps } from './types';
import { SparklesIcon } from '@heroicons/react/20/solid';

export function DestinationInput({
  value,
  onChange,
  onRandomCity,
  error,
  disabled
}: DestinationInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor="destination"
        className="block text-sm font-medium text-gray-700"
      >
        目的地
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            id="destination"
            name="destination"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="block w-full py-2 px-4 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="输入城市名称"
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRandomCity}
          disabled={disabled}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <SparklesIcon className="h-5 w-5 text-indigo-500" />
          随机城市
        </button>
      </div>
    </div>
  );
}
