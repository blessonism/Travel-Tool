import { Output } from "../schema";
import cn from "classnames";
import { BookmarkIcon } from "@heroicons/react/20/solid";
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
    <section className="flex flex-col gap-4 items-start flex-1 w-full max-w-none h-auto">
      {/* Day Navigation Bar with Save Button */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 flex-1">
            {itinerary.days.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={cn(
                  "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  selectedDay === index
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                Day {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <BookmarkIcon className="h-4 w-4" />
            保存行程
          </button>
        </div>
      </div>

      {/* Selected Day Content */}
      <div
        className={cn(
          "flex flex-col gap-4 items-start lg:overflow-auto lg:max-h-[calc(125vh)]",
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
        <section className="flex flex-col w-full">
          <h3 className="text-xl font-bold pb-2">
            Day {selectedDay + 1}{" "}
            <span className="font-medium text-lg italic text-gray-700">
              {itinerary.days[selectedDay].date}
            </span>
          </h3>
          <div className="ml-8 flex flex-col gap-1 border-l border-indigo-500 border-dashed">
            {itinerary.days[selectedDay].activities.map((activity, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col py-2 px-4 relative",
                  {
                    "border-b border-gray-300":
                      index < itinerary.days[selectedDay].activities.length - 1,
                  }
                )}
              >
                <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500" />
                <h4 className="font-bold">
                  {activity.title}{" "}
                  <span className="font-medium italic text-gray-600">{activity.time}</span>
                </h4>
                <p className="text-gray-700 mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
