"use client";

import { Input, output, Output } from "./schema";
import React, { useMemo } from "react";
import Form from "./components/Form";
import Itinerary from "./components/Itinerary";
import Image from "next/image";
import ProgressBar from "@/components/ProgressBar";
import cn from "classnames";
import { toasts } from "@/components/Toast";
import { ExclamationTriangleIcon, BookmarkIcon } from "@heroicons/react/20/solid";
import { useCompletion } from "ai/react";
import Link from "next/link";

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

  const { complete } = useCompletion({
    api: "/api/generate",
  });

  const createItinerary = async (data: Input) => {
    setItinerary(null);
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
    }

    setProgress(0);
    setIsLoading(false);
    clearInterval(interval);
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
      <div className="flex flex-col gap-16 lg:flex-row w-full lg:items-start">
        <section
          className={cn(
            "p-6 rounded-lg shadow-md border-indigo-500 mask relative backdrop-blur-2xl after:absolute after:inset-0 after:rounded-lg after:bg-gradient-to-br after:from-indigo-500/80 after:via-indigo-500/40 after:to-indigo-500/80 after:p-[3px]",
            {
              "hidden md:block": isLoading || !!itinerary,
            }
          )}
        >
          <Form onSubmit={createItinerary} disabled={isLoading} />
        </section>

        <section
          className={cn(
            "w-full h-full flex flex-col gap-6 flex-1 items-center",
            {
              hidden: itinerary,
            }
          )}
        >
          <Image
            src="/travelers.svg"
            alt="travelers"
            width={700}
            height={700}
            className="mt-16 w-auto h-auto"
            priority
          />
          {isLoading && (
            <div className="flex flex-col gap-2">
              <div className="">
                <ProgressBar value={progress} maxValue={31} />
              </div>
              <p className="mx-auto lg:mx-0 font-medium">
                Preparing Your Perfect Trip, This may take a moment...
              </p>
            </div>
          )}
        </section>
        {itinerary && formData && (
          <Itinerary
            itinerary={itinerary}
            destination={formData.destination}
            description={formData.description}
            firstTimeVisiting={formData.firstTimeVisiting}
            plannedSpending={formData.plannedSpending}
            travelType={formData.travelType}
            interests={formData.interests}
          />
        )}
      </div>
    </main>
  );
}
