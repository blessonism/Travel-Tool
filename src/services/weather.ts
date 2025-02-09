const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 验证环境变量
if (!WEATHER_API_KEY) {
  console.error('OpenWeatherMap API Key is not configured:', {
    key: WEATHER_API_KEY,
    envValue: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
    allEnv: process.env
  });
  throw new Error('API Key 无效，请检查配置');
}

// 城市名称映射表
const CITY_MAP: Record<string, string> = {
  '北京': 'Beijing,CN',
  '上海': 'Shanghai,CN',
  '广州': 'Guangzhou,CN',
  '深圳': 'Shenzhen,CN',
  '南昌': 'Nanchang,CN',
  '杭州': 'Hangzhou,CN',
  '成都': 'Chengdu,CN',
  '重庆': 'Chongqing,CN',
  '武汉': 'Wuhan,CN',
  '西安': 'Xian,CN'
};

export interface WeatherData {
  city: {
    name: string;
    country: string;
  };
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    dt_txt: string;
  }>;
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  // 再次验证 API Key，确保运行时可用
  if (!WEATHER_API_KEY || WEATHER_API_KEY.trim() === '') {
    console.error('Weather API Key validation failed:', {
      key: WEATHER_API_KEY,
      length: WEATHER_API_KEY?.length
    });
    throw new Error('API Key 无效，请检查配置');
  }

  try {
    // 转换城市名称
    const mappedCity = CITY_MAP[city] || city;
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(mappedCity)}&appid=${WEATHER_API_KEY}&units=metric&lang=zh_cn&cnt=7`;
    
    console.log('Fetching weather data:', {
      url: url.replace(WEATHER_API_KEY, '***'),
      city: mappedCity,
      originalCity: city,
      hasApiKey: !!WEATHER_API_KEY
    });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Weather API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        city: mappedCity,
        url: url.replace(WEATHER_API_KEY, '***')
      });
      
      if (response.status === 401) {
        throw new Error('API Key 无效，请检查配置');
      } else if (response.status === 404) {
        throw new Error(`未找到城市"${city}"的天气信息，请尝试使用英文名称`);
      } else if (response.status === 429) {
        throw new Error('API 调用次数超限，请稍后重试');
      }
      
      throw new Error(`获取天气信息失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Weather data received:', data);
    return data;
  } catch (error) {
    console.error('Weather service error:', error);
    throw error instanceof Error ? error : new Error('获取天气信息失败');
  }
}

export function getWeatherIcon(code: string): string {
  return `https://openweathermap.org/img/wn/${code}@2x.png`;
}

interface WeatherSuggestion {
  overview: string;
  clothing: string;
  activities: string;
  precautions: string;
}

export function getWeatherSuggestion(weatherList: WeatherData['list'][0][]): WeatherSuggestion {
  if (!weatherList.length) return {
    overview: '暂无天气数据',
    clothing: '',
    activities: '',
    precautions: ''
  };

  // 分析天气趋势
  const weatherTrends = weatherList.map(day => ({
    temp: day.main.temp,
    weather: day.weather[0].main.toLowerCase(),
    windSpeed: day.wind.speed,
    date: new Date(day.dt * 1000)
  }));

  // 计算平均温度
  const avgTemp = weatherTrends.reduce((sum, day) => sum + day.temp, 0) / weatherTrends.length;
  
  // 统计天气类型
  const weatherTypes = new Set(weatherTrends.map(day => day.weather));
  const hasRain = weatherTrends.some(day => day.weather.includes('rain'));
  const hasSnow = weatherTrends.some(day => day.weather.includes('snow'));
  const hasClear = weatherTrends.some(day => day.weather.includes('clear'));
  const hasStrongWind = weatherTrends.some(day => day.windSpeed > 10);

  // 生成结构化建议
  const suggestion: WeatherSuggestion = {
    overview: '',
    clothing: '',
    activities: '',
    precautions: ''
  };
  
  // 概览
  suggestion.overview = `未来7天平均气温${Math.round(avgTemp)}°C，${
    avgTemp < 10 ? '气温偏冷' :
    avgTemp > 30 ? '气温炎热' :
    '温度适宜'
  }。${
    weatherTypes.size === 1 && hasClear ? '天气晴朗为主' :
    hasRain && hasSnow ? '天气变化较大' :
    hasRain ? '有降雨天气' :
    hasSnow ? '有降雪天气' :
    '天气较为稳定'
  }。`;

  // 着装建议
  suggestion.clothing = avgTemp < 10 
    ? '建议穿着厚实的保暖衣物，可以准备帽子、围巾等御寒装备。注意早晚温差，建议采用分层穿搭方式。'
    : avgTemp > 30
    ? '建议穿着轻薄、透气的衣物，选择防晒面料。准备防晒霜、太阳镜和遮阳帽等防晒装备。'
    : '建议穿着舒适、透气的衣物，可以准备一件外套应对温差变化。';

  // 活动建议
  suggestion.activities = weatherTypes.size === 1 && hasClear
    ? '天气适合各类户外活动，建议安排城市观光、户外摄影等活动。'
    : hasRain || hasSnow
    ? '建议优先安排室内景点参观，重要的户外活动请避开降水天气。可以体验当地美食、博物馆、艺术馆等室内项目。'
    : '大部分时间适合户外活动，建议提前查看每日天气，灵活调整行程安排。';

  // 注意事项
  const precautions = [];
  if (hasRain) precautions.push('携带雨具');
  if (hasSnow) precautions.push('注意路面湿滑');
  if (hasStrongWind) precautions.push('注意防风');
  if (avgTemp > 30) precautions.push('防暑降温');
  if (avgTemp < 10) precautions.push('防寒保暖');
  
  suggestion.precautions = precautions.length
    ? `请特别注意：${precautions.join('、')}。`
    : '天气较为适宜，注意适时补充水分。';

  return suggestion;
} 