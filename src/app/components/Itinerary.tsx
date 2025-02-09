import { Output } from "../schema";
import cn from "classnames";

type ItineraryProps = {
  itinerary: Output;
};

export default function Itinerary(props: ItineraryProps) {
  return (
    <section className="flex flex-col gap-4 items-start flex-1 w-full max-w-none h-auto">
      <div
        style={{ width: "30vw" }}
        className="flex flex-col gap-4 items-start lg:overflow-auto lg:max-h-[calc(125vh)] pr-6"
      >
        {props.itinerary.days.map((day, index) => (
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
