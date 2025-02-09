'use client';

import { useEffect, useState } from 'react';
import { Output } from '../schema';
import Link from 'next/link';
import { CalendarIcon, TrashIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import { format } from 'date-fns';
import { toasts } from '@/components/Toast';

interface SavedItinerary extends Output {
  id: string;
  savedAt: string;
}

export default function SavedItineraries() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedItineraries');
    if (saved) {
      setItineraries(JSON.parse(saved));
    }
  }, []);

  const handleDelete = (id: string) => {
    const newItineraries = itineraries.filter(item => item.id !== id);
    localStorage.setItem('savedItineraries', JSON.stringify(newItineraries));
    setItineraries(newItineraries);
    
    toasts.add(
      <div className="flex gap-4 items-center">
        <div className="rounded-full bg-green-200 p-2">
          <TrashIcon className="text-green-600 h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <h3>行程已删除</h3>
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col w-full stretch gap-12 p-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl lg:text-5xl font-bold">
          已保存的行程
        </h1>
        <p className="text-gray-600">
          查看和管理您保存的所有行程计划
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itineraries.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">暂无保存的行程</p>
            <Link 
              href="/"
              className="text-indigo-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2 mt-4"
            >
              <CalendarIcon className="h-5 w-5" />
              创建新行程
            </Link>
          </div>
        ) : (
          itineraries.map((itinerary) => (
            <div 
              key={itinerary.id}
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl mb-2">{itinerary.title}</h3>
                  <p className="text-sm text-gray-500">
                    保存于: {format(new Date(itinerary.savedAt), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(itinerary.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  行程天数: {itinerary.days.length} 天
                </p>
                <p className="text-sm text-gray-600">
                  开始日期: {itinerary.days[0].date}
                </p>
              </div>

              <Link
                href={`/saved/${itinerary.id}`}
                className="mt-4 inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                查看详情
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          ))
        )}
      </div>
    </main>
  );
} 