import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { input, Input } from "../schema";
import DateRangePicker from "@/components/DateRangePicker";
import { getLocalTimeZone, today } from "@internationalized/date";
import React, { useEffect, useState, useCallback, useRef } from "react";
import Button from "@/components/Button";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { WeatherData, getCurrentWeather } from '@/services/weather';

// 添加热门旅游城市
const POPULAR_CITIES = [
  "北京", "上海", "广州", "深圳", "成都", 
  "杭州", "西安", "重庆", "南京", "武汉",
  "厦门", "青岛", "大理", "丽江", "三亚"
];

type FormProps = {
  onSubmit: (value: Input) => void;
  disabled: boolean;
  onWeatherChange?: (weather: WeatherData | null, isLoading: boolean, error?: string) => void;
  initialData?: Input | null;
};

export default function Form({ onSubmit, disabled, onWeatherChange, initialData }: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Input>({
    resolver: zodResolver(input),
    defaultValues: initialData || undefined
  });

  const [travelType, setTravelType] = useState(initialData?.travelType || "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastFetchedCity = useRef<string>("");
  const failedCities = useRef<Set<string>>(new Set());

  const interests = [
    "Beaches",
    "City Sightseeing",
    "Outdoor Adventures",
    "Festivals",
    "Food Exploration",
    "Nightlife",
    "Shopping",
    "SPA Wellness",
  ];

  type BudgetRange = "0 - 1000" | "1000 - 2500" | "2500+";

  const destination = watch('destination');

  const getRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * POPULAR_CITIES.length);
    const city = POPULAR_CITIES[randomIndex];
    setValue('destination', city);
  };

  useEffect(() => {
    if (initialData) {
      setValue("destination", initialData.destination);
      setValue("description", initialData.description);
      setValue("startDate", initialData.startDate);
      setValue("endDate", initialData.endDate);
      setValue("firstTimeVisiting", initialData.firstTimeVisiting);
      setValue("plannedSpending", initialData.plannedSpending);
      setValue("travelType", initialData.travelType);
      setValue("interests", initialData.interests);
      
      setTravelType(initialData.travelType);
      setSelectedInterests(initialData.interests);
      setBudgetRange(initialData.plannedSpending as BudgetRange);
    }
  }, [initialData, setValue]);

  useEffect(() => {
    setValue("interests", selectedInterests);
  }, [selectedInterests, setValue]);

  useEffect(() => {
    // 如果没有回调函数，直接返回
    if (!onWeatherChange) {
      return;
    }

    // 如果没有目的地，清除天气数据
    if (!destination?.trim()) {
      onWeatherChange(null, false, undefined);
      return;
    }

    const trimmedDestination = destination.trim();

    // 如果当前城市已经成功获取过天气，不再重复请求
    if (trimmedDestination === lastFetchedCity.current) {
      return;
    }

    // 如果是之前请求失败的城市，直接返回错误信息
    if (failedCities.current.has(trimmedDestination)) {
      onWeatherChange(null, false, `无法获取"${trimmedDestination}"的天气信息，请尝试使用英文名称或检查城市名称是否正确`);
      return;
    }

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置加载状态
    onWeatherChange(null, true, undefined);

    // 设置新的定时器
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await getCurrentWeather(trimmedDestination);
        onWeatherChange(data, false, undefined);
        // 记录成功获取天气的城市
        lastFetchedCity.current = trimmedDestination;
        // 如果之前失败过，从失败列表中移除
        failedCities.current.delete(trimmedDestination);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '获取天气信息失败';
        onWeatherChange(null, false, errorMessage);
        console.error('Weather fetch error:', error);
        // 记录请求失败的城市
        failedCities.current.add(trimmedDestination);
        // 清除上次成功的城市记录
        lastFetchedCity.current = "";
      }
    }, 1000);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [destination, onWeatherChange]);

  const [budgetRange, setBudgetRange] = useState<BudgetRange | "">(
    (initialData?.plannedSpending as BudgetRange) || ""
  );

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

  const handleSelectBudget = (range: BudgetRange) => {
    setBudgetRange(range);
    setValue("plannedSpending", range);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2 bg-white p-8 shadow-lg rounded-lg"
    >
      <label className="font-semibold text-lg">What city are you going to?</label>
      <div className="relative">
        <input
          {...register("destination")}
          className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-base pr-12"
          placeholder="Barcelona"
        />
        <button
          type="button"
          onClick={getRandomCity}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
        >
          <SparklesIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="text-red-500 text-sm">{errors.destination?.message}</p>

      {/* Hidden input field for travel type */}
      <input type="hidden" {...register("travelType")} value={travelType} />
      <label className="font-semibold mt-4 text-lg">
        Who do you plan on traveling with on your next adventure?
      </label>
      <div className="grid grid-cols-4 gap-4">
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "solo"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-blue-400 to-indigo-300"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16 text-base`}
          onClick={() => handleTravelTypeClick("solo")}
        >
          Solo 独自
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "couple"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-blue-400 to-indigo-300"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16 text-base`}
          onClick={() => handleTravelTypeClick("couple")}
        >
          Couple 情侣
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "family"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-blue-400 to-indigo-300"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16 text-base`}
          onClick={() => handleTravelTypeClick("family")}
        >
          Family 家庭
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
            travelType === "friends"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-blue-400 to-indigo-300"
              : "bg-gray-100 hover:bg-gray-200"
          } w-32 h-16 text-base`}
          onClick={() => handleTravelTypeClick("friends")}
        >
          Friends 朋友
        </button>
      </div>

      <label className="font-semibold mt-4 text-lg">First time visiting?</label>
      <select
        {...register("firstTimeVisiting", {
          setValueAs: (v) => v === "true",
        })}
        className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-base"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <p className="text-red-500">{errors.firstTimeVisiting?.message}</p>

      <label className="font-semibold mt-4 text-lg">
        Which activities are you interested in?
      </label>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {interests.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleActivity(interest)}
            className={`p-2 border rounded transition-all ease-out duration-100 shadow-sm hover:shadow-md ${
              selectedInterests.includes(interest)
                ? "px-4 py-2 text-white rounded bg-gradient-to-br from-blue-300 to-indigo-200"
                : "bg-gray-100 hover:bg-gray-200"
            } w-32 h-16 text-base`}
          >
            {interest}
          </button>
        ))}
      </div>

      <label className="font-semibold mt-4 text-lg">What is Your Budget?</label>
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm text-base ${
            budgetRange === "0 - 1000"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-green-300 to-indigo-300"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
          onClick={() => handleSelectBudget("0 - 1000")}
        >
          Low
          <br />0 - 1000 USD
        </button>
        <button
          type="button"
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm text-base ${
            budgetRange === "1000 - 2500"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-yellow-200 to-indigo-300"
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
          className={`p-2 border rounded transition-all duration-200 ease-in-out shadow-sm text-base ${
            budgetRange === "2500+"
              ? "px-4 py-2 text-white rounded bg-gradient-to-br from-red-300 to-indigo-300"
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

      <label className="font-semibold mt-4 text-lg">
        Describe the intention of your trip
      </label>
      <textarea
        {...register("description")}
        rows={4}
        className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-base"
        placeholder="Family trip with lots of nice dinners"
      />
      <p className="text-red-500">{errors.description?.message}</p>

      <label className="font-semibold mt-4 text-lg">Start and end date of trip</label>
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
        className="bg-indigo-500 text-white rounded p-3 mt-4 flex gap-2 items-center justify-center text-base"
        isDisabled={disabled}
      >
        Submit <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <p className="text-gray-600 text-base">* We support trips of up to 5 days</p>
    </form>
  );
}
