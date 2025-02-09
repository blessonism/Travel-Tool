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
  weatherCache?: Record<string, WeatherData>;
  onUpdateWeatherCache?: (city: string, data: WeatherData) => void;
};

export default function Form({ 
  onSubmit, 
  disabled, 
  onWeatherChange, 
  initialData,
  weatherCache = {},
  onUpdateWeatherCache
}: FormProps) {
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

  // 添加自动生成描述的函数
  const generateDescription = () => {
    const city = watch('destination');
    const type = watch('travelType');
    const budget = watch('plannedSpending');
    const isFirstTime = watch('firstTimeVisiting');
    const selectedActivities = watch('interests');

    // 旅行类型的中文映射
    const travelTypeMap: Record<string, string> = {
      'solo': '一个人的探索之旅',
      'couple': '浪漫的双人世界',
      'family': '温馨的亲子时光',
      'friends': '欢乐的友情之旅'
    };

    // 预算等级的描述映射
    const budgetMap: Record<string, string> = {
      '0 - 1000': '体验当地特色与文化',
      '1000 - 2500': '寻找舒适与品质',
      '2500+': '追求精致与奢华'
    };

    // 活动类型的中文映射
    const activityMap: Record<string, string> = {
      'Beaches': '海滩度假',
      'City Sightseeing': '城市观光',
      'Outdoor Adventures': '户外探险',
      'Festivals': '节日活动',
      'Food Exploration': '美食探索',
      'Nightlife': '夜生活',
      'Shopping': '购物体验',
      'SPA Wellness': '休闲养生'
    };

    let description = '';
    
    // 根据不同场景生成个性化描述
    if (city) {
      const randomStart = [
        `期待在${city}开启一段${travelTypeMap[type] || '难忘的旅程'}`,
        `想要在${city}创造一段${travelTypeMap[type] || '美好的回忆'}`,
        `计划前往${city}，开启一场${travelTypeMap[type] || '精彩的冒险'}`
      ][Math.floor(Math.random() * 3)];

      description = randomStart;

      // 添加首次访问相关描述
      if (isFirstTime) {
        const firstTimeDesc = [
          '，初次造访这座城市，希望能够深入体验当地文化',
          '，第一次来这里，想要发现城市的独特魅力',
          '，作为第一次到访的旅行者，期待感受这里的一切'
        ][Math.floor(Math.random() * 3)];
        description += firstTimeDesc;
      }
      
      // 添加活动相关描述
      if (selectedActivities && selectedActivities.length > 0) {
        const activities = selectedActivities
          .slice(0, 2)
          .map(act => activityMap[act])
          .filter(Boolean);
        
        if (activities.length > 0) {
          description += `。特别想要${activities.join('和')}`;
        }
      }
      
      // 添加预算相关描述
      if (budget) {
        description += `，打算${budgetMap[budget] || '好好享受这次旅程'}`;
      }
      
      description += '。';
    } else {
      // 当没有选择城市时的默认描述
      description = [
        '想要开启一段说走就走的旅行，感受不一样的人文风景。',
        '期待一次令人期待的旅程，创造独特的旅行记忆。',
        '准备来一场说走就走的旅行，探索未知的精彩。'
      ][Math.floor(Math.random() * 3)];
    }

    setValue('description', description);
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

    // 检查缓存中是否已有该城市的天气数据
    if (weatherCache[trimmedDestination]) {
      onWeatherChange(weatherCache[trimmedDestination], false, undefined);
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
        // 更新缓存
        if (onUpdateWeatherCache) {
          onUpdateWeatherCache(trimmedDestination, data);
        }
        onWeatherChange(data, false, undefined);
        // 如果之前失败过，从失败列表中移除
        failedCities.current.delete(trimmedDestination);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '获取天气信息失败';
        onWeatherChange(null, false, errorMessage);
        console.error('Weather fetch error:', error);
        // 记录请求失败的城市
        failedCities.current.add(trimmedDestination);
      }
    }, 1000);

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [destination, onWeatherChange, weatherCache, onUpdateWeatherCache]);

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
      <div className="relative">
        <textarea
          {...register("description")}
          rows={4}
          className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-base pr-12"
          placeholder="Family trip with lots of nice dinners"
        />
        <button
          type="button"
          onClick={generateDescription}
          className="absolute right-3 top-3 text-gray-400 hover:text-indigo-500 transition-colors"
        >
          <SparklesIcon className="h-5 w-5" />
        </button>
      </div>
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
