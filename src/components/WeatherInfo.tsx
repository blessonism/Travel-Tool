import React, { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { WeatherData, getWeatherIcon, getWeatherSuggestion } from '@/services/weather';
import { CloudIcon } from '@heroicons/react/20/solid';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface WeatherInfoProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error?: string;
}

export default function WeatherInfo({ weather, isLoading, error }: WeatherInfoProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 0.8;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-8 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-6 bg-gray-200 rounded" />
        </div>
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">
        {error}
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  const suggestion = getWeatherSuggestion(weather.list);

  return (
    <div className="space-y-6 transition-all duration-300 ease-in-out">
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        className={cn(
          "flex overflow-x-auto gap-4 pb-4 -mx-2 px-2",
          "cursor-grab active:cursor-grabbing",
          "[&::-webkit-scrollbar]:h-1.5",
          "[&::-webkit-scrollbar-track]:bg-transparent",
          "[&::-webkit-scrollbar-thumb]:bg-gray-200",
          "[&::-webkit-scrollbar-thumb]:hover:bg-gray-300",
          "[&::-webkit-scrollbar-thumb]:rounded-full",
          "select-none"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#E5E7EB transparent'
        }}
      >
        {weather.list.map((day, index) => (
          <div 
            key={day.dt} 
            className={cn(
              "flex-none w-[200px] p-4 border rounded-lg",
              "bg-white hover:shadow-lg transition-all duration-300",
              "border-gray-100 hover:border-indigo-100",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <div className="text-sm text-gray-500 mb-2">
              {format(new Date(day.dt * 1000), 'M月d日 EEEE', { locale: zhCN })}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-[40px] h-[40px]">
                <Image
                  src={getWeatherIcon(day.weather[0].icon)}
                  alt={day.weather[0].description}
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <div className="font-bold">{Math.round(day.main.temp)}°C</div>
                <div className="text-sm text-gray-600">{day.weather[0].description}</div>
              </div>
            </div>
            <div className="mt-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">体感温度</span>
                <span>{Math.round(day.main.feels_like)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">湿度</span>
                <span>{day.main.humidity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">风速</span>
                <span>{day.wind.speed}m/s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm bg-indigo-50/60 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-indigo-100/80 border-b border-indigo-100">
          <h3 className="font-medium text-indigo-900/80">旅行建议</h3>
        </div>
        <div className="divide-y divide-indigo-100/50">
          <div className="p-4">
            <p className="text-gray-900">{suggestion.overview}</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-2">
              <span className="flex-none text-indigo-600 font-medium">着装建议：</span>
              <span className="text-gray-700">{suggestion.clothing}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-none text-indigo-600 font-medium">活动建议：</span>
              <span className="text-gray-700">{suggestion.activities}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-none text-indigo-600 font-medium">注意事项：</span>
              <span className="text-gray-700">{suggestion.precautions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 