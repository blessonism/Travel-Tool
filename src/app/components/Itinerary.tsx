import { Output } from "../schema";
import cn from "classnames";
import { BookmarkIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { useCallback, useState } from "react";
import { toasts } from "@/components/Toast";
import { WeatherData } from '@/services/weather';

type ItineraryProps = {
  itinerary: Output;
  destination?: string;
  description?: string;
  firstTimeVisiting?: boolean;
  plannedSpending?: string;
  travelType?: string;
  interests?: string[];
  weather?: WeatherData | null;
  onEdit?: () => void;
};

export default function Itinerary({
  itinerary,
  destination = "",
  description = "",
  firstTimeVisiting = false,
  plannedSpending = "",
  travelType = "",
  interests = [],
  weather = null,
  onEdit,
}: ItineraryProps) {
  const [selectedDay, setSelectedDay] = useState(0);

  const handleSave = useCallback(() => {
    try {
      const savedItineraries = JSON.parse(localStorage.getItem('savedItineraries') || '[]');
      const itineraryToSave = {
        ...itinerary,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        destination,
        description,
        firstTimeVisiting,
        plannedSpending,
        travelType,
        interests,
        weather
      };
      savedItineraries.push(itineraryToSave);
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
  }, [itinerary, destination, description, firstTimeVisiting, plannedSpending, travelType, interests, weather]);

  return (
    <section className="flex flex-col gap-6 items-start flex-1 w-full max-w-none h-auto p-6">
      {/* 行程概览 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-gray-900">行程概览</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">目的地:</span>
              <span>{destination}</span>
            </div>
            {travelType && (
              <div className="flex items-center gap-2">
                <span className="font-medium">旅行类型:</span>
                <span>{travelType}</span>
              </div>
            )}
            {plannedSpending && (
              <div className="flex items-center gap-2">
                <span className="font-medium">预算范围:</span>
                <span>{plannedSpending}</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-gray-600 text-sm italic border-l-4 border-indigo-200 pl-3">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* 日期导航栏 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">日程安排</h3>
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  编辑行程
                </button>
              )}
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <BookmarkIcon className="h-4 w-4" />
                保存行程
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {itinerary.days.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={cn(
                  "flex-none px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 min-w-[100px]",
                  selectedDay === index
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                第 {index + 1} 天
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 当日行程内容 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div
          className={cn(
            "flex flex-col gap-6",
            "pr-6 w-full",
            "[&::-webkit-scrollbar]:w-1.5",
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
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">
              第 {selectedDay + 1} 天
            </h3>
            <span className="text-lg text-gray-500">
              {itinerary.days[selectedDay].date}
            </span>
          </div>
          
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-indigo-200 ml-3" />
            {itinerary.days[selectedDay].activities.map((activity, index) => (
              <div
                key={index}
                className="relative mb-8 last:mb-0"
              >
                <div className="absolute -left-8 top-2 w-6 h-6 rounded-full bg-indigo-500 shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {activity.title}
                    </h4>
                    <span className="text-sm text-gray-500 italic">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
