import { NextResponse } from 'next/server';

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      console.log(`Retrying request, ${retries} attempts remaining. Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');

    console.log('Weather API proxy request:', {
      city,
      hasApiKey: !!WEATHER_API_KEY,
      apiKeyLength: WEATHER_API_KEY?.length
    });

    if (!city) {
      console.error('Missing city parameter');
      return NextResponse.json(
        { error: '城市参数不能为空' },
        { status: 400 }
      );
    }

    if (!WEATHER_API_KEY) {
      console.error('Missing API key');
      return NextResponse.json(
        { error: 'API Key 未配置' },
        { status: 500 }
      );
    }

    const weatherUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn`;
    
    console.log('Fetching weather data from:', weatherUrl.replace(WEATHER_API_KEY, '***'));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 增加超时时间到15秒

    try {
      const response = await fetchWithRetry(weatherUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Travel-Tool/1.0'
        },
        next: { revalidate: 3600 },
        signal: controller.signal,
        keepalive: true // 保持连接活跃
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('Weather API error:', {
          status: response.status,
          statusText: response.statusText,
          message: data.message,
          city
        });

        if (response.status === 401) {
          return NextResponse.json(
            { error: 'API Key 无效或已过期' },
            { status: 401 }
          );
        }

        if (response.status === 404) {
          return NextResponse.json(
            { error: `未找到城市"${city}"的天气信息` },
            { status: 404 }
          );
        }

        if (response.status === 429) {
          return NextResponse.json(
            { error: 'API 调用次数超限，请稍后重试' },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: data.message || '获取天气信息失败' },
          { status: response.status }
        );
      }

      if (!data.city || !data.list) {
        console.error('Invalid weather data format:', {
          hasCity: !!data.city,
          hasList: !!data.list,
          data
        });
        return NextResponse.json(
          { error: '天气数据格式无效' },
          { status: 500 }
        );
      }

      console.log('Weather data received:', {
        city: data.city.name,
        country: data.city.country,
        dataPoints: data.list.length
      });

      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Weather proxy error:', {
      error,
      message: error instanceof Error ? error.message : '未知错误',
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof TypeError) {
      if (error.message === 'Failed to fetch') {
        return NextResponse.json(
          { error: '网络连接失败，请检查网络设置' },
          { status: 503 }
        );
      }
      // 处理 TLS 相关错误
      if (error.message.includes('TLS') || error.message.includes('SSL')) {
        return NextResponse.json(
          { error: '安全连接失败，请稍后重试' },
          { status: 503 }
        );
      }
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: '请求超时，请稍后重试' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { 
        error: '获取天气信息失败，请稍后重试',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : '未知错误',
          name: error instanceof Error ? error.name : undefined
        } : undefined
      },
      { status: 500 }
    );
  }
} 