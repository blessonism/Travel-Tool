import Button from "@/components/Button";
import { Output } from "../schema";
import cn from "classnames";
import { ModalTrigger } from "@/components/ModalTrigger";
import Dialog from "@/components/Dialog";
import { BookmarkIcon } from "@heroicons/react/20/solid";

type ItineraryProps = {
  itinerary: Output;
  onSubmit: () => void;
};

export default function Itinerary(props: ItineraryProps) {
  return (
    <section className="flex flex-col gap-4 items-start flex-1 w-full max-w-none h-auto">
      <ModalTrigger
        label="What's next?"
        className="px-4 py-2 text-white rounded bg-gradient-to-br from-blue-400 to-indigo-500"
      >
        {(close) => (
          <Dialog>
            <div className="flex flex-row gap-6 items-start p-6">
              <div className="p-4 bg-green-300 rounded-full">
                <BookmarkIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <h3 className="font-bold text-xl">Save Your Itinerary!</h3>
                  </div>
                  <p>
                    Congratulations on creating your perfect itinerary! To keep
                    it safe and accessible anytime, simply save it to our
                    platform for just $1.
                  </p>
                  <p className="font-bold">Benefits:</p>
                  <ul className="list-disc list-inside">
                    <li>Accessible from any device</li>
                    <li>Seamless calendar integration</li>
                    <li>Share easily with travel buddies</li>
                  </ul>
                  <p className="font-medium">
                    Secure your itinerary now and make the most of your travels!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 bg-gray-50 p-4 rounded-b-md">
              <Button
                className="px-4 py-2 border rounded border-gray-300 shadow-sm bg-white"
                onPress={close}
              >
                Cancel
              </Button>
              <Button
                className="px-4 py-2 bg-indigo-500 text-white rounded shadow-sm"
                isDisabled={true} // functionality not working, disabled for now.
                onPress={props.onSubmit}
              >
                Save Now!
              </Button>
            </div>
          </Dialog>
        )}
      </ModalTrigger>
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
