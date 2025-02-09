'use client';

import { useEffect, useState } from 'react';
import { Output } from '../../schema';
import Link from 'next/link';
import { ArrowLeftIcon, ShareIcon, CheckIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';
import cn from 'classnames';
import { toasts } from '@/components/Toast';
import WeatherInfo from '@/components/WeatherInfo';
import { WeatherData } from '@/services/weather';

interface SavedItinerary extends Output {
  id: string;
  savedAt: string;
  destination?: string;
  description?: string;
  firstTimeVisiting?: boolean;
  plannedSpending?: string;
  travelType?: string;
  interests?: string[];
  weather?: WeatherData | null;
}

export default function ItineraryDetail({
  params,
}: {
  params: { id: string };
}) {
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
    const found = savedItineraries.find((item: SavedItinerary) => item.id === params.id);
    if (found) {
      setItinerary(found);
    }
  }, [params.id]);

  const handleShare = async () => {
    if (!itinerary) return;

    const shareUrl = `${window.location.origin}/shared/${params.id}`;
    
    try {
      if (navigator.share) {
        // 如果浏览器支持原生分享
        await navigator.share({
          title: itinerary.title,
          text: `查看我的旅行行程：${itinerary.title}`,
          url: shareUrl,
        });
      } else {
        // 否则复制链接到剪贴板
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        toasts.add(
          <div className="flex gap-4 items-center">
            <div className="rounded-full bg-green-200 p-2">
              <CheckIcon className="text-green-600 h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <h3>链接已复制</h3>
              <p className="text-gray-500">您可以将链接分享给他人</p>
            </div>
          </div>
        );
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      console.error('分享失败:', error);
      toasts.add(
        <div className="flex gap-4 items-center">
          <div className="rounded-full bg-red-200 p-2">
            <ShareIcon className="text-red-600 h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h3>分享失败</h3>
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
          href="/saved"
          className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          返回已保存行程
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
          href="/saved"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="text-sm font-medium">返回已保存行程</span>
        </Link>
        <button
          onClick={handleShare}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
            "bg-white border border-gray-200 shadow-sm hover:shadow-md",
            "hover:border-indigo-100 hover:bg-indigo-50",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
            {
              "text-indigo-600": !isCopied,
              "text-green-600": isCopied,
            }
          )}
        >
          {isCopied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              <span>已复制链接</span>
            </>
          ) : (
            <>
              <ShareIcon className="h-4 w-4" />
              <span>分享行程</span>
            </>
          )}
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
            <div className="space-y-2">
              <p className="text-gray-500">保存时间</p>
              <p className="font-medium">
                {format(new Date(itinerary.savedAt), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
          </div>
        </section>

        {/* 添加天气信息部分 */}
        {itinerary.weather && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">天气信息</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-semibold mb-6">
                {itinerary.weather.city.name} 天气预报
                <span className="text-sm text-gray-500 ml-2">
                  (保存于 {format(new Date(itinerary.savedAt), 'yyyy-MM-dd HH:mm')})
                </span>
              </h3>
              <WeatherInfo
                weather={itinerary.weather}
                isLoading={false}
                error={undefined}
              />
            </div>
          </section>
        )}

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