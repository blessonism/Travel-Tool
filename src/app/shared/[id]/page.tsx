'use client';

import { useEffect, useState } from 'react';
import { Output } from '../../schema';
import Link from 'next/link';
import { ArrowLeftIcon, BookmarkIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';
import { toasts } from '@/components/Toast';
import { cn } from '@/lib/utils';

interface SavedItinerary extends Output {
  id: string;
  savedAt: string;
  destination?: string;
  description?: string;
  firstTimeVisiting?: boolean;
  plannedSpending?: string;
  travelType?: string;
  interests?: string[];
}

export default function SharedItinerary({
  params,
}: {
  params: { id: string };
}) {
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);

  useEffect(() => {
    const savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    const found = savedItineraries.find((item: SavedItinerary) => item.id === params.id);
    if (found) {
      setItinerary(found);
    }
  }, [params.id]);

  const handleSave = async () => {
    if (!itinerary) return;

    try {
      const savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      
      // 检查是否已经保存过
      if (savedItineraries.some((item: SavedItinerary) => item.id === itinerary.id)) {
        toasts.add(
          <div className="flex gap-4 items-center">
            <div className="rounded-full bg-yellow-200 p-2">
              <BookmarkIcon className="text-yellow-600 h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h3>行程已存在</h3>
              <p className="text-gray-500">该行程已在您的保存列表中</p>
            </div>
          </div>
        );
        return;
      }

      // 保存新行程
      savedItineraries.push(itinerary);
      localStorage.setItem('savedItineraries', JSON.stringify(savedItineraries));
      
      toasts.add(
        <div className="flex gap-4 items-center">
          <div className="rounded-full bg-green-200 p-2">
            <BookmarkIcon className="text-green-600 h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3>行程已保存</h3>
            <p className="text-gray-500">您可以在已保存行程中查看</p>
          </div>
        </div>
      );
    } catch (error) {
      console.error('保存失败:', error);
      toasts.add(
        <div className="flex gap-4 items-center">
          <div className="rounded-full bg-red-200 p-2">
            <BookmarkIcon className="text-red-600 h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3>保存失败</h3>
            <p className="text-gray-500">请稍后重试</p>
          </div>
        </div>
      );
    }
  };

  if (!itinerary) {
    return (
      <main className="flex flex-col w-full stretch gap-12 p-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          返回首页
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">未找到行程信息</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col w-full stretch gap-12 p-8">
      <div className="flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">返回首页</span>
        </Link>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
            "bg-white border border-gray-200 shadow-sm hover:shadow-md",
            "hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          )}
        >
          <BookmarkIcon className="h-4 w-4" />
          <span>保存到我的行程</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* 行程基本信息 */}
        <section className="space-y-4">
          <h1 className="text-4xl font-bold">{itinerary.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itinerary.destination && (
              <div className="space-y-2">
                <p className="text-gray-500">目的地</p>
                <p className="font-medium">{itinerary.destination}</p>
              </div>
            )}
            {itinerary.travelType && (
              <div className="space-y-2">
                <p className="text-gray-500">旅行类型</p>
                <p className="font-medium">{itinerary.travelType}</p>
              </div>
            )}
            {itinerary.plannedSpending && (
              <div className="space-y-2">
                <p className="text-gray-500">预算</p>
                <p className="font-medium">{itinerary.plannedSpending}</p>
              </div>
            )}
            {typeof itinerary.firstTimeVisiting !== 'undefined' && (
              <div className="space-y-2">
                <p className="text-gray-500">是否首次访问</p>
                <p className="font-medium">{itinerary.firstTimeVisiting ? '是' : '否'}</p>
              </div>
            )}
            {itinerary.interests && itinerary.interests.length > 0 && (
              <div className="space-y-2">
                <p className="text-gray-500">兴趣</p>
                <div className="flex flex-wrap gap-2">
                  {itinerary.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 行程详情 */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold">行程安排</h2>
          {itinerary.days.map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-4">
              <h3 className="text-xl font-bold">
                第 {dayIndex + 1} 天
                <span className="ml-2 text-gray-500 font-normal">
                  {day.date}
                </span>
              </h3>
              <div className="ml-8 space-y-6 border-l-2 border-indigo-200">
                {day.activities.map((activity, activityIndex) => (
                  <div
                    key={activityIndex}
                    className="relative pl-8 pb-6"
                  >
                    <div className="absolute -left-2.5 top-0">
                      <div className="w-5 h-5 rounded-full bg-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-500">{activity.time}</p>
                      <h4 className="font-bold text-lg">{activity.title}</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
} 