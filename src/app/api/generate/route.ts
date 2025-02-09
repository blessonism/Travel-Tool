import { Configuration, OpenAIApi } from "openai-edge";
import { NextResponse } from "next/server";
import { output, input } from "@/app/schema";
import { OpenAIStream, StreamingTextResponse } from "ai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: process.env.OPENAI_API_BASE,
});
const openai = new OpenAIApi(config);

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // 解析请求体
    const body = await req.json();
    if (!body) {
      throw new Error("Request body is empty");
    }

    // 验证输入数据
    const validatedBody = input.parse(body);
    if (!validatedBody) {
      throw new Error("Invalid input data");
    }

    // 构建 prompt
    const prompt = `请为以下旅行生成行程：
    目的地: ${validatedBody.destination}
    描述: ${validatedBody.description}
    开始日期: ${validatedBody.startDate}
    结束日期: ${validatedBody.endDate}
    首次访问: ${validatedBody.firstTimeVisiting ? "是" : "否"}
    预算: ${validatedBody.plannedSpending}
    旅行类型: ${validatedBody.travelType}
    兴趣: ${validatedBody.interests.join(", ")}`;

    // 调用 API
    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一个专业的旅行规划师。请根据用户提供的信息，生成详细的旅行行程。请确保返回的是有效的 JSON 格式，不要包含任何其他文本。JSON结构如下：
          {
            "title": "行程标题",
            "days": [
              {
                "date": "日期 (YYYY/MM/DD)",
                "activities": [
                  {
                    "time": "时间段",
                    "title": "活动标题",
                    "description": "活动描述（不要包含换行符）"
                  }
                ]
              }
            ]
          }`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      stream: true,
    });

    // 处理流式响应
    let jsonBuffer = '';
    const stream = OpenAIStream(response, {
      onToken: async (token: string) => {
        jsonBuffer += token;
      },
      onCompletion: async (completion: string) => {
        try {
          // 尝试解析完整的 JSON
          const parsed = JSON.parse(completion);
          
          // 清理描述文本中的换行符
          if (parsed.days) {
            parsed.days.forEach((day: any) => {
              if (day.activities) {
                day.activities.forEach((activity: any) => {
                  if (activity.description) {
                    activity.description = activity.description.replace(/[\n\r]+/g, ' ').trim();
                  }
                });
              }
            });
          }

          // 验证数据结构
          output.parse(parsed);
        } catch (error) {
          console.error("JSON processing error:", error);
          console.log("Raw completion:", completion);
        }
      },
    });

    return new StreamingTextResponse(stream);
  } catch (error: unknown) {
    console.error("API Error:", error);
    
    // 构建详细的错误响应
    const errorResponse = {
      message: error instanceof Error ? error.message : "Unknown error occurred",
      type: error instanceof Error ? error.constructor.name : 'Unknown',
      details: error instanceof Error ? error.stack : undefined,
      apiKey: process.env.OPENAI_API_KEY ? `...${process.env.OPENAI_API_KEY.slice(-4)}` : 'undefined',
      apiBase: process.env.OPENAI_API_BASE || 'undefined'
    };

    return NextResponse.json(
      {
        error: errorResponse,
        ok: false,
      },
      { status: 500 }
    );
  }
}
