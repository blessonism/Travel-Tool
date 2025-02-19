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
  '成都': 'Chengdu,CN',
  '杭州': 'Hangzhou,CN',
  '西安': 'Xian,CN',
  '重庆': 'Chongqing,CN',
  '南京': 'Nanjing,CN',
  '武汉': 'Wuhan,CN',
  '厦门': 'Xiamen,CN',
  '青岛': 'Qingdao,CN',
  '大理': 'Dali,CN',
  '丽江': 'Lijiang,CN',
  '三亚': 'Sanya,CN',
  '长沙': 'Changsha,CN',
  '昆明': 'Kunming,CN',
  '贵阳': 'Guiyang,CN',
  '桂林': 'Guilin,CN',
  '南宁': 'Nanning,CN',
  '海口': 'Haikou,CN',
  '天津': 'Tianjin,CN',
  '沈阳': 'Shenyang,CN',
  '大连': 'Dalian,CN',
  '哈尔滨': 'Harbin,CN',
  '长春': 'Changchun,CN',
  '太原': 'Taiyuan,CN',
  '济南': 'Jinan,CN',
  '郑州': 'Zhengzhou,CN',
  '合肥': 'Hefei,CN',
  '南昌': 'Nanchang,CN',
  '福州': 'Fuzhou,CN',
  '兰州': 'Lanzhou,CN',
  '西宁': 'Xining,CN',
  '银川': 'Yinchuan,CN',
  '乌鲁木齐': 'Urumqi,CN',
  '拉萨': 'Lhasa,CN'
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

// 添加工具函数来处理天气数据
function processDailyWeather(data: WeatherData): WeatherData {
  // 按日期分组
  const dailyData = data.list.reduce((acc, item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof data.list>);

  // 处理每天的数据
  const processedList = Object.entries(dailyData).map(([date, items]) => {
    // 计算平均温度和体感温度
    const avgTemp = items.reduce((sum, item) => sum + item.main.temp, 0) / items.length;
    const avgFeelsLike = items.reduce((sum, item) => sum + item.main.feels_like, 0) / items.length;
    const avgHumidity = items.reduce((sum, item) => sum + item.main.humidity, 0) / items.length;
    const avgWindSpeed = items.reduce((sum, item) => sum + item.wind.speed, 0) / items.length;

    // 选择天气状况（优先选择白天的天气）
    const dayWeather = items.find(item => {
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);
      return hour >= 9 && hour <= 18;
    }) || items[0];

    return {
      dt: dayWeather.dt,
      main: {
        temp: Math.round(avgTemp * 10) / 10,
        feels_like: Math.round(avgFeelsLike * 10) / 10,
        humidity: Math.round(avgHumidity)
      },
      weather: dayWeather.weather,
      wind: {
        speed: Math.round(avgWindSpeed * 10) / 10
      },
      dt_txt: date + ' 12:00:00' // 统一设置为中午12点
    };
  });

  // 只保留未来7天的数据
  const sevenDaysList = processedList.slice(0, 7);

  return {
    ...data,
    list: sevenDaysList
  };
}

export async function getCurrentWeather(city: string): Promise<WeatherData> {
  console.log('Weather service initialization:', {
    city
  });

  try {
    // 转换城市名称
    const mappedCity = CITY_MAP[city] || (city.includes(',') ? city : `${city},CN`);
    const url = `/api/weather?city=${encodeURIComponent(mappedCity)}`;
    
    console.log('Weather API request:', {
      originalCity: city,
      mappedCity,
      url
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超时
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-cache',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('Weather API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details,
          city: mappedCity,
          originalCity: city
        });
        
        throw new Error(data.error || `获取天气信息失败: ${response.status} ${response.statusText}`);
      }

      if (!data.city || !data.list) {
        console.error('Invalid weather data format:', {
          hasCity: !!data.city,
          hasList: !!data.list,
          data
        });
        throw new Error('天气数据格式无效');
      }

      // 处理天气数据，合并同一天的数据
      const processedData = processDailyWeather(data);

      console.log('Weather data received:', {
        city: processedData.city.name,
        country: processedData.city.country,
        dataPoints: processedData.list.length
      });
      
      return processedData;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Weather service error:', {
      error,
      message: error instanceof Error ? error.message : '未知错误',
      name: error instanceof Error ? error.name : undefined,
      city,
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查网络设置');
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }

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