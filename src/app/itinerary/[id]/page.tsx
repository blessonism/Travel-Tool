import { db } from "@/lib/mongodb";
import { itineraries as itinerarySchema } from "../../schema";
import { ObjectId } from "mongodb";
import Actions from "./components/Actions";
import cn from "classnames";

type ItineraryProps = {
  params: {
    id: string;
  };
};

export default async function Itinerary({ params }: ItineraryProps) {
  const result = await db
    .collection("itinerary")
    .findOne({ _id: new ObjectId(params.id) });

  const itinerary = itinerarySchema.parse({
    ...result,
    id: result?._id.toString(),
  });

  return (
    <main className="flex flex-col gap-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl lg:text-5xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-500">
            Your Travel
          </span>
          Itinerary
        </h1>
        <p>
          You can view your itinerary here anytime and share this link with your travel companions!
        </p>
      </div>
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-2">
        <div className="min-w-[300px]">
          <Actions itinerary={itinerary} />
        </div>
        <div className="flex flex-col gap-4 items-start lg:overflow-auto lg:max-h-[calc(100vh_-_375px)]">
          {itinerary.days?.map((day, index) => (
            <section key={index} className="flex flex-col">
              <h3 className="text-xl font-bold pb-2">
                Day {index + 1}{" "}
                <span className="font-medium text-lg italic text-gray-700">
                  {day.date}
                </span>
              </h3>
              <div className="ml-8 flex flex-col gap-1 border-l border-indigo-500 border-dashed">
                {day.activities?.map((activity, index) => (
                  <div
                    key={index}
                    className={cn("flex flex-col py-2 px-4", {
                      "border-b border-gray-300":
                        index < (day.activities?.length || 0) - 1,
                    })}
                  >
                    <h4 className="font-bold">
                      {activity.title}{" "}
                      <span className="font-medium italic">
                        {activity.time}
                      </span>
                    </h4>
                    <p className="">{activity.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
