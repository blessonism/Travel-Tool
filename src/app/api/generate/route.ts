import { Configuration, OpenAIApi } from "openai-edge";
import { NextResponse } from "next/server";
import { output, input, createItineraries } from "@/app/schema";
import { OpenAIStream, StreamingTextResponse } from "ai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_API_BASE,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      description,
      destination,
      endDate,
      startDate,
      firstTimeVisiting,
      plannedSpending,
      travelType,
      interests,
    } = input.parse(body);

    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-2024-04-09",
      stream: true,
      messages: [
        {
          content: `You are a travel planner that will generate itineraries.
      
          For each itinerary, provide a succinct title and a comprehensive description that fully explores the unique aspects of the activities suggested. Descriptions must be at least 100 words, covering a wide range of experiences including cultural visits, outdoor adventures, dining, and leisure activities. Ensure all activities for mornings, afternoons, and evenings are unique and no activities are repeated across days.
      
          Respond in the following JSON format, using Chinese. Each day should include activities for morning, afternoon, and evening with detailed descriptions. The title should be brief and descriptive.
      
          {
            "title": "",
            "days": [
              {
                "date": "",
                "activities": [
                  {
                    "time": "morning",
                    "description": "",
                    "title": ""
                  },
                  {
                    "time": "afternoon",
                    "description": "",
                    "title": ""
                  },
                  {
                    "time": "evening",
                    "description": "",
                    "title": ""
                  }
                ]
              }
            ]
          }
          `,
          role: "system",
        },
        {
          content: `Please create a detailed itinerary from ${startDate} to ${endDate} (in the format "YYYY/MM/DD") for a trip to ${destination}. This is ${
            firstTimeVisiting ? "the first visit" : "a return visit"
          } for the traveler. The purpose of the trip is to explore ${description}, with interests in ${interests.join(
            ", "
          )}. The budget is approximately ${plannedSpending}. The travel type is ${travelType}, aiming to include diverse activities that leverage the unique aspects of ${destination}. Ensure that the title is brief and each activity description is comprehensive and at least 100 words long.`,
          role: "user",
        },
      ],
    });

    const stream = OpenAIStream(response, {
      async onCompletion(completion: string) {
        try {
          const parsedCompletion = output.parse(JSON.parse(completion));

          const createInput = createItineraries.parse({
            title: parsedCompletion.title,
            days: parsedCompletion.days,
            startDate,
            endDate,
            description,
            destination,
            firstTimeVisiting,
            plannedSpending,
            travelType,
            interests,
            activated: false,
          });

          fetch(`${process.env.URL}/api/itinerary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(createInput),
          });
        } catch (parseError) {
          console.error("Failed to parse JSON:", parseError);
          // 此处处理 JSON 解析错误
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error) {
    // 获取 API 密钥的后四位
    const apiKeySuffix = process.env.OPENAI_API_KEY?.slice(-4);

    console.error(
      `Error calling OpenAI API with key ending in ${apiKeySuffix}:`,
      error
    );

    // 返回错误响应
    return NextResponse.json(
      {
        message:
          "something went wrong, Error calling OpenAI API with key ending in ${apiKeySuffix}",
        ok: false,
      },
      { status: 500 }
    );
  }
}
