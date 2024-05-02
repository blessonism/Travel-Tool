import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { input, Input } from "../schema";
import DateRangePicker from "@/components/DateRangePicker";
import { getLocalTimeZone, today } from "@internationalized/date";
import React, { useEffect, useState } from "react";
import Button from "@/components/Button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

type FormProps = {
  onSubmit: (value: Input) => void;
  disabled: boolean;
};

export default function Form(props: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Input>({
    resolver: zodResolver(input),
  });

  const [travelType, setTravelType] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const interests = [
    "Beaches",
    "City sightseeing",
    "Outdoor adventures",
    "Festivals",
    "Food exploration",
    "Nightlife",
    "Shopping",
    "Spa wellness",
  ];

  type BudgetRange = "0 - 1000" | "1000 - 2500" | "2500+";

  useEffect(() => {
    setValue("interests", selectedInterests);
  }, [selectedInterests, setValue]);

  const [budgetRange, setBudgetRange] = useState<BudgetRange | "">("");

  const handleTravelTypeClick = (type: string) => {
    setTravelType(type);
    setValue("travelType", type);
  };

  const toggleActivity = (activity: string) => {
    setSelectedInterests((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  // 正确定义 handleSelectBudget 函数
  const handleSelectBudget = (range: BudgetRange) => {
    // 明确参数类型
    setBudgetRange(range);
    setValue("plannedSpending", range);
  };
  return (
    <form
      onSubmit={handleSubmit(props.onSubmit)}
      //className="flex flex-col gap-2 lg:min-w-[400px]"
      className="flex flex-col gap-2 lg:min-w-[400px] bg-white p-4 shadow-lg rounded-lg"
      //className="flex flex-col gap-2 lg:min-w-[400px] bg-white p-4 shadow-lg rounded-lg"
    >
      <label className="font-semibold">What city are you going to?</label>
      <input
        {...register("destination")}
        className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-indigo-500 transition"
        placeholder="Barcelona"
      />
      <p className="text-red-500 text-sm">{errors.destination?.message}</p>

      {/* Hidden input field for travel type */}
      <input type="hidden" {...register("travelType")} value={travelType} />
      <label className="font-semibold mt-4">
        Who do you plan on traveling with on your next adventure?
      </label>
      <div className="grid grid-cols-4 gap-4">
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "solo"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16`}
          onClick={() => handleTravelTypeClick("solo")}
        >
          Solo 独自
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "couple"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16`}
          onClick={() => handleTravelTypeClick("couple")}
        >
          Couple 情侣
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "family"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16`}
          onClick={() => handleTravelTypeClick("family")}
        >
          Family 家庭
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "friends"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16`}
          onClick={() => handleTravelTypeClick("friends")}
        >
          Friends 朋友
        </button>
      </div>

      <label className="font-semibold mt-4">First time visiting?</label>
      <select
        {...register("firstTimeVisiting", {
          setValueAs: (v) => v === "true", // Converts the string 'true' to boolean true
        })}
        className="border border-gray-400 p-2 rounded"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <p className="text-red-500">{errors.firstTimeVisiting?.message}</p>

      <label className="font-semibold mt-4">
        Which activities are you interested in?
      </label>
      {/* Activity selection buttons */}
      <div className="grid grid-cols-4 gap-4 mt-4">
        {interests.map((interests) => (
          <button
            key={interests}
            type="button"
            onClick={() => toggleActivity(interests)}
            className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
              selectedInterests.includes(interests)
                ? "bg-blue-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            } w-32 h-16`} // 控制最大宽度，以保持按钮不会过宽
          >
            {interests}
          </button>
        ))}
      </div>

      <label className="font-semibold mt-4">What is Your Budget?</label>
      {/* <p>
        The budget is exclusively allocated for activities and dining purposes.
      </p> */}
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm ${
            budgetRange === "0 - 1000"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => handleSelectBudget("0 - 1000")}
        >
          Low
          <br />0 - 1000 USD
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm ${
            budgetRange === "1000 - 2500"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => handleSelectBudget("1000 - 2500")}
        >
          Medium
          <br />
          1000 - 2500 USD
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm ${
            budgetRange === "2500+"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => handleSelectBudget("2500+")}
        >
          High
          <br />
          2500+ USD
        </button>
      </div>
      <p className="text-red-500">{errors.plannedSpending?.message}</p>

      <label className="font-semibold mt-4">
        Describe the intention of your trip
      </label>
      <textarea
        {...register("description")}
        rows={4}
        className="border border-gray-400 p-2 rounded"
        placeholder="Family trip with lots of nice dinners"
      />
      <p className="text-red-500">{errors.description?.message}</p>

      <label className="font-semibold mt-4">Start and end date of trip</label>
      <DateRangePicker
        minValue={today(getLocalTimeZone())}
        onChange={(v) => {
          setValue("startDate", v.start.toString());
          setValue("endDate", v.end.toString());
        }}
        errorMessage={errors.startDate?.message || errors.endDate?.message}
      />

      <Button
        type="submit"
        className=" bg-indigo-500 text-white rounded p-2 flex gap-2 items-center justify-center"
        isDisabled={props.disabled}
      >
        Submit <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <p className="text-gray-600">* We support trips of up to 5 days</p>
    </form>
  );
}
function setSelectedActivities(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}
