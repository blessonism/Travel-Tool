import { Output } from "../schema";
import cn from "classnames";
import { BookmarkIcon } from "@heroicons/react/20/solid";
import { useCallback } from "react";
import { toasts } from "@/components/Toast";

type ItineraryProps = {
  itinerary: Output;
  destination?: string;
  description?: string;
  firstTimeVisiting?: boolean;
  plannedSpending?: string;
  travelType?: string;
  interests?: string[];
};

export default function Itinerary({
  itinerary,
  destination = "",
  description = "",
  firstTimeVisiting = false,
  plannedSpending = "",
  travelType = "",
  interests = [],
}: ItineraryProps) {
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
        interests
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
  }, [itinerary, destination, description, firstTimeVisiting, plannedSpending, travelType, interests]);

  return (
    <section className="flex flex-col gap-4 items-start flex-1 w-full max-w-none h-auto">
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200 bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <BookmarkIcon className="h-4 w-4" />
        保存行程
      </button>
      <div
        style={{ width: "30vw" }}
        className="flex flex-col gap-4 items-start lg:overflow-auto lg:max-h-[calc(125vh)] pr-6"
      >
        {itinerary.days.map((day, index) => (
          <section key={index} className="flex flex-col">
            <h3 className="text-xl font-bold pb-2">
              Day {index + 1}{" "}
              <span className="font-medium text-lg italic text-gray-700">
                {day.date}
              </span>
            </h3>
            <div className="ml-8 flex flex-col gap-1 border-l border-indigo-500 border-dashed">
              {day.activities.map((activity, index) => (
                <div
                  key={index}
                  className={cn("flex flex-col py-2 px-4", {
                    "border-b border-gray-300":
                      index < day.activities.length - 1,
                  })}
                >
                  <h4 className="font-bold">
                    {activity.title}{" "}
                    <span className="font-medium italic">{activity.time}</span>
                  </h4>
                  <p className="">{activity.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
