import { WeatherData } from '@/services/weather';
import { Input } from '@/app/schema';

export type TravelType = 'solo' | 'couple' | 'family' | 'friends';
export type BudgetRange = '0 - 1000' | '1000 - 2500' | '2500+';

export interface FormProps {
  onSubmit: (value: Input) => void;
  disabled: boolean;
  onWeatherChange?: (weather: WeatherData | null, isLoading: boolean, error?: string) => void;
  initialData?: Input | null;
  weatherCache?: Record<string, WeatherData>;
  onUpdateWeatherCache?: (city: string, data: WeatherData) => void;
}

export interface TravelTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

export interface InterestSelectorProps {
  selectedInterests: string[];
  onChange: (interests: string[]) => void;
  disabled?: boolean;
}

export interface BudgetSelectorProps {
  value: BudgetRange | '';
  onChange: (budget: BudgetRange) => void;
  disabled?: boolean;
}

export interface DestinationInputProps {
  value: string;
  onChange: (destination: string) => void;
  onRandomCity: () => void;
  error?: string;
  disabled?: boolean;
}

export interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  error?: string;
  disabled?: boolean;
}