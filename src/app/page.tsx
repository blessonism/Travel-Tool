"use client";

import { Input, output, Output } from "./schema";
import React, { useMemo, useCallback } from "react";
import Form from "./components/Form";
import Itinerary from "./components/Itinerary";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import cn from "classnames";
import { toasts } from "@/components/Toast";
import { ExclamationTriangleIcon, BookmarkIcon, PencilSquareIcon, MapIcon } from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";
import Link from "next/link";
import WeatherInfo from "@/components/WeatherInfo";
import { WeatherData } from "@/services/weather";

// 添加一些热门旅游城市
const POPULAR_CITIES = [
  "北京", "上海", "广州", "深圳", "成都", 
  "杭州", "西安", "重庆", "南京", "武汉",
  "厦门", "青岛", "大理", "丽江", "三亚"
];

function addErrorToast(title: string, description: string) {
  toasts.add(
    <div className="flex gap-4 items-center">
      <div className="rounded-full bg-red-200 p-2">
        <ExclamationTriangleIcon className="text-red-400 h-6 w-6" />
      </div>
      <div className="flex flex-col">
        <h3 className="">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [itinerary, setItinerary] = React.useState<Output | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [formData, setFormData] = React.useState<Input | null>(null);
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = React.useState(false);
  const [weatherError, setWeatherError] = React.useState<string>();
  const [showForm, setShowForm] = React.useState(true);
  // 添加天气数据缓存
  const [weatherCache, setWeatherCache] = React.useState<Record<string, WeatherData>>({});

  const { complete } = useCompletion({
    api: "/api/generate",
  });

  // 处理天气数据变化的回调函数
  const handleWeatherChange = useCallback((
    weatherData: WeatherData | null,
    loading: boolean,
    error?: string
  ) => {
    setWeather(weatherData);
    setIsLoadingWeather(loading);
    setWeatherError(error);
  }, []);

  // 更新天气缓存的函数
  const updateWeatherCache = useCallback((city: string, data: WeatherData) => {
    setWeatherCache(prev => ({
      ...prev,
      [city]: data
    }));
  }, []);

  const createItinerary = async (data: Input) => {
    setIsLoading(true);
    setFormData(data);

    // progress bar simulation
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p < 30) {
          return p + 1;
        }
        return 30;
      });
    }, 1000);

    try {
      const completion = await complete("", {
        body: data,
      });

      if (!completion) {
        throw new Error("生成行程失败");
      }

      try {
        const parsedData = JSON.parse(completion);
        // 确保所有描述文本不包含换行符
        parsedData.days.forEach((day: any) => {
          day.activities.forEach((activity: any) => {
            activity.description = activity.description.replace(/\n/g, ' ');
          });
        });
        setItinerary(output.parse(parsedData));
      } catch (parseError) {
        console.error("JSON 解析错误:", parseError);
        throw new Error("行程数据格式错误");
      }
    } catch (error) {
      addErrorToast(
        "生成行程失败",
        error instanceof Error ? error.message : "请稍后重试"
      );
      setShowForm(true);
    }

    setProgress(0);
    setIsLoading(false);
    clearInterval(interval);
  };

  const getRandomCity = () => {
    const randomIndex = Math.floor(Math.random() * POPULAR_CITIES.length);
    return POPULAR_CITIES[randomIndex];
  };

  return (
    <main className="flex flex-col w-full stretch gap-12">
      <section className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl lg:text-5xl font-bold">
            Your Smart Travel{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-500 to-indigo-500">
              Itinerary Generator
            </span>
          </h1>
          <Link
            href="/saved"
            className="flex items-center gap-2 px-4 py-2 text-indigo-500 hover:text-indigo-600 transition-colors"
          >
            <BookmarkIcon className="h-5 w-5" />
            已保存行程
          </Link>
        </div>
        <p>
          Explore with Travel Ai: Your Custom Travel Planner! Personalized
          Itineraries Made Simple.
        </p>
      </section>
      <div className="flex flex-col w-full lg:items-start gap-8">
        {/* 导航栏移到这里，始终显示 */}
        <div className="flex gap-2 p-1 bg-gray-100/80 rounded-full w-fit">
          <button
            onClick={() => setShowForm(true)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
              showForm
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            )}
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span>编辑行程</span>
          </button>
          <button
            onClick={() => setShowForm(false)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
              !showForm
                ? "bg-white shadow-sm text-indigo-600"
                : "text-gray-600 hover:text-indigo-600"
            )}
          >
            <MapIcon className="h-5 w-5" />
            <span>查看行程</span>
          </button>
        </div>

        {/* 编辑行程和表单区域 */}
        {showForm ? (
          <div className="flex flex-col lg:flex-row gap-8 w-full">
            <section
              className={cn(
                "lg:w-3/5 p-8 rounded-lg shadow-md border-indigo-500 mask relative backdrop-blur-2xl after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-500/80 after:via-indigo-500/40 after:to-indigo-500/80 after:p-[3px]"
              )}
            >
              <Form 
                onSubmit={(data) => {
                  setShowForm(false);
                  createItinerary(data);
                }}
                disabled={isLoading}
                onWeatherChange={handleWeatherChange}
                weatherCache={weatherCache}
                onUpdateWeatherCache={updateWeatherCache}
                initialData={formData}
              />
            </section>

            {/* 天气卡片 */}
            <div className="lg:w-2/5">
              {(weather || isLoadingWeather || weatherError) && (
                <section className="p-8 rounded-lg shadow-md bg-white border border-gray-100 transition-all duration-300 ease-in-out">
                  <h2 className="text-xl font-semibold mb-6">
                    {weather ? `${weather.city.name} 未来7天天气` : '获取天气信息中...'}
                  </h2>
                  <WeatherInfo
                    weather={weather}
                    isLoading={isLoadingWeather}
                    error={weatherError}
                  />
                </section>
              )}
              
              {!isLoading && !itinerary && (
                <section className="w-full h-full flex flex-col gap-6 flex-1 items-center">
                  <Image
                    src="/travelers.svg"
                    alt="travelers"
                    width={700}
                    height={700}
                    className="mt-16 w-auto h-auto"
                    priority
                  />
                </section>
              )}
            </div>
          </div>
        ) : (
          /* 查看行程区域 */
          <div className="w-full flex flex-col gap-8">
            {/* 内容区域 */}
            <div className="flex flex-col lg:flex-row gap-8 w-full min-h-[800px]">
              <section className="lg:w-[42%] p-8 rounded-lg shadow-md bg-white border border-gray-100 transition-all duration-300 ease-in-out h-fit">
                <h2 className="text-xl font-semibold mb-6">
                  {weather ? `${weather.city.name} 未来7天天气` : '获取天气信息中...'}
                </h2>
                <WeatherInfo
                  weather={weather}
                  isLoading={isLoadingWeather}
                  error={weatherError}
                />
              </section>
              <section className="lg:w-[58%] bg-white rounded-lg shadow-md border border-gray-100 flex flex-col h-full">
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8">
                    <div className="w-full max-w-md">
                      <div className="flex flex-col gap-6 animate-pulse">
                        {/* 标题加载动画 */}
                        <div className="h-8 bg-gray-200 rounded-md w-3/4" />
                        
                        {/* 日期加载动画 */}
                        <div className="flex gap-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded-md flex-1" />
                          ))}
                        </div>
                        
                        {/* 行程内容加载动画 */}
                        <div className="space-y-4">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                              <div className="w-16 h-4 bg-gray-200 rounded" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* 生成进度 */}
                      <div className="mt-8 flex flex-col items-center gap-4">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(progress * 3.3, 100)}%` }}
                          />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">
                          AI正在为您生成个性化行程...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : itinerary && formData ? (
                  <div className="flex-1 p-8 overflow-auto">
                    <Itinerary
                      itinerary={itinerary}
                      destination={formData.destination}
                      description={formData.description}
                      firstTimeVisiting={formData.firstTimeVisiting}
                      plannedSpending={formData.plannedSpending}
                      travelType={formData.travelType}
                      interests={formData.interests}
                      weather={weather}
                    />
                  </div>
                ) : null}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
