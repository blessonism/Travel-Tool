import React, { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { input, Input } from '@/app/schema';
import { FormProps, BudgetRange } from './types';
import { TravelTypeSelector } from './TravelTypeSelector';
import { InterestSelector } from './InterestSelector';
import { BudgetSelector } from './BudgetSelector';
import { DestinationInput } from './DestinationInput';
import { DateRangeInput } from './DateRangeInput';
import Button from '@/components/Button';
import { ArrowRightIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { DateValue, parseDate, today } from '@internationalized/date';
import { getCurrentWeather } from '@/services/weather';
import { toasts } from '@/components/Toast';

// 添加热门旅游城市
const POPULAR_CITIES = [
  // 一线城市
  "北京", "上海", "广州", "深圳",
  // 热门旅游城市
  "成都", "杭州", "西安", "重庆", "厦门",
  // 南方热门
  "三亚", "大理", "丽江", "桂林", "昆明",
  // 北方热门
  "青岛", "哈尔滨", "大连", "天津"
];

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: string[];
}

function ErrorModal({ isOpen, onClose, errors }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm flex items-center justify-center z-50">
      <div 
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl transform transition-all animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              请完善以下信息
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-gray-100 transition-colors duration-200"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="mt-4 bg-red-50 rounded-lg p-4">
          <ul className="space-y-2.5">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2 text-red-700">
                <span className="select-none">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg 
                     hover:bg-indigo-700 transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormContainer({
  onSubmit,
  disabled,
  initialData,
  onWeatherChange,
  weatherCache = {},
  onUpdateWeatherCache,
}: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<Input>({
    resolver: zodResolver(input),
    defaultValues: initialData || undefined,
    mode: 'onSubmit',
  });

  const [travelType, setTravelType] = useState(initialData?.travelType || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    initialData?.interests || []
  );
  const [budgetRange, setBudgetRange] = useState<BudgetRange | ''>(
    (initialData?.plannedSpending as BudgetRange) || ''
  );

  const destination = watch('destination');

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastFetchedCity = useRef<string>("");
  const failedCities = useRef<Set<string>>(new Set());

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setValue('destination', initialData.destination);
      setValue('description', initialData.description);
      setValue('startDate', initialData.startDate);
      setValue('endDate', initialData.endDate);
      setValue('firstTimeVisiting', initialData.firstTimeVisiting);
      setValue('plannedSpending', initialData.plannedSpending);
      setValue('travelType', initialData.travelType);
      setValue('interests', initialData.interests);
    }
  }, [initialData, setValue]);

  useEffect(() => {
    setValue('interests', selectedInterests);
  }, [selectedInterests, setValue]);

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
    
    if (city) {
      const randomStart = [
        `期待在${city}开启一段${travelTypeMap[type] || '难忘的旅程'}`,
        `想要在${city}创造一段${travelTypeMap[type] || '美好的回忆'}`,
        `计划前往${city}，开启一场${travelTypeMap[type] || '精彩的冒险'}`
      ][Math.floor(Math.random() * 3)];

      description = randomStart;

      if (isFirstTime) {
        const firstTimeDesc = [
          '，初次造访这座城市，希望能够深入体验当地文化',
          '，第一次来这里，想要发现城市的独特魅力',
          '，作为第一次到访的旅行者，期待感受这里的一切'
        ][Math.floor(Math.random() * 3)];
        description += firstTimeDesc;
      }
      
      if (selectedActivities && selectedActivities.length > 0) {
        const activities = selectedActivities
          .slice(0, 2)
          .map(act => activityMap[act])
          .filter(Boolean);
        
        if (activities.length > 0) {
          description += `。特别想要${activities.join('和')}`;
        }
      }
      
      if (budget) {
        description += `，打算${budgetMap[budget] || '好好享受这次旅程'}`;
      }
      
      description += '。';
    } else {
      description = [
        '想要开启一段说走就走的旅行，感受不一样的人文风景。',
        '期待一次令人期待的旅程，创造独特的旅行记忆。',
        '准备来一场说走就走的旅行，探索未知的精彩。'
      ][Math.floor(Math.random() * 3)];
    }

    setValue('description', description);
  };

  // 监听目的地变化，获取天气信息
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

  // 获取所有错误信息
  const getErrorMessages = () => {
    const messages = [];
    if (errors.destination) messages.push('请填写目的地');
    if (errors.travelType) messages.push('请选择旅行类型');
    if (errors.plannedSpending) messages.push('请选择预算范围');
    if (errors.startDate || errors.endDate) messages.push('请选择正确的旅行日期');
    if (errors.description) messages.push('请填写旅行愿望');
    return messages;
  };

  // 处理表单提交
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 立即检查表单数据
    const formData = {
      destination: watch('destination'),
      travelType: watch('travelType'),
      plannedSpending: watch('plannedSpending'),
      startDate: watch('startDate'),
      endDate: watch('endDate'),
      description: watch('description'),
      firstTimeVisiting: watch('firstTimeVisiting'),
      interests: selectedInterests
    };

    // 检查必填字段并收集错误信息
    const currentErrors: string[] = [];
    if (!formData.destination?.trim()) currentErrors.push('请填写目的地');
    if (!formData.travelType) currentErrors.push('请选择旅行类型');
    if (!formData.plannedSpending) currentErrors.push('请选择预算范围');
    if (!formData.startDate || !formData.endDate) currentErrors.push('请选择旅行日期');
    if (!formData.description?.trim()) currentErrors.push('请填写旅行愿望');

    // 如果有错误，显示弹窗
    if (currentErrors.length > 0) {
      // 直接传递当前收集到的错误信息给弹窗
      setIsErrorModalOpen(true);
      // 更新表单状态中的错误信息
      currentErrors.forEach(error => {
        if (error.includes('目的地')) setValue('destination', '', { shouldValidate: true });
        if (error.includes('旅行类型')) setValue('travelType', '', { shouldValidate: true });
        if (error.includes('预算范围')) setValue('plannedSpending', '', { shouldValidate: true });
        if (error.includes('旅行日期')) {
          setValue('startDate', '', { shouldValidate: true });
          setValue('endDate', '', { shouldValidate: true });
        }
        if (error.includes('旅行愿望')) setValue('description', '', { shouldValidate: true });
      });
      return;
    }

    // 如果验证通过，提交表单
    onSubmit(formData);
  };

  // 获取当前错误信息
  const getCurrentErrors = () => {
    const formData = {
      destination: watch('destination'),
      travelType: watch('travelType'),
      plannedSpending: watch('plannedSpending'),
      startDate: watch('startDate'),
      endDate: watch('endDate'),
      description: watch('description')
    };

    const currentErrors: string[] = [];
    if (!formData.destination?.trim()) currentErrors.push('请填写目的地');
    if (!formData.travelType) currentErrors.push('请选择旅行类型');
    if (!formData.plannedSpending) currentErrors.push('请选择预算范围');
    if (!formData.startDate || !formData.endDate) currentErrors.push('请选择旅行日期');
    if (!formData.description?.trim()) currentErrors.push('请填写旅行愿望');

    return currentErrors;
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-8">
        <DestinationInput
          value={destination || ''}
          onChange={(value) => setValue('destination', value)}
          onRandomCity={getRandomCity}
          error={errors.destination?.message}
          disabled={disabled}
        />

        <TravelTypeSelector
          value={travelType}
          onChange={(type) => {
            setTravelType(type);
            setValue('travelType', type);
          }}
          disabled={disabled}
        />

        <InterestSelector
          selectedInterests={selectedInterests}
          onChange={setSelectedInterests}
          disabled={disabled}
        />

        <BudgetSelector
          value={budgetRange}
          onChange={(budget) => {
            setBudgetRange(budget);
            setValue('plannedSpending', budget);
          }}
          disabled={disabled}
        />

        <DateRangeInput
          startDate={new Date(watch('startDate') || '')}
          endDate={new Date(watch('endDate') || '')}
          onChange={(start, end) => {
            setValue('startDate', start?.toISOString() || '');
            setValue('endDate', end?.toISOString() || '');
          }}
          error={errors.startDate?.message || errors.endDate?.message}
          disabled={disabled}
        />

        <label
          htmlFor="firstTimeVisiting"
          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors duration-200 group cursor-pointer bg-white hover:bg-gray-50"
        >
          <input
            type="checkbox"
            id="firstTimeVisiting"
            {...register('firstTimeVisiting')}
            disabled={disabled}
            className="w-5 h-5 rounded-md border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 disabled:bg-gray-100 transition-colors duration-200 cursor-pointer group-hover:border-indigo-300"
          />
          <span className="flex-1 text-base text-gray-700 group-hover:text-gray-900 transition-colors duration-200 select-none">
            这是我第一次访问这个城市
          </span>
        </label>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              旅行愿望
            </label>
            <button
              type="button"
              onClick={generateDescription}
              disabled={disabled}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              自动生成
            </button>
          </div>
          <textarea
            id="description"
            {...register('description')}
            disabled={disabled}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
            rows={4}
            placeholder="描述一下你的旅行愿望..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            isDisabled={disabled}
            className="inline-flex items-center gap-2"
          >
            生成行程
            <ArrowRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </form>
      
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errors={getCurrentErrors()}
      />
    </>
  );
}