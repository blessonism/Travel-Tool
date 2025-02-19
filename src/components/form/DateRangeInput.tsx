import React from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import { DateValue, today, getLocalTimeZone, parseDate } from '@internationalized/date';
import { DateRangePickerProps as FormDateRangeProps } from './types';
import { RangeValue } from '@react-types/shared';

export function DateRangeInput({
  startDate,
  endDate,
  onChange,
  error,
  disabled
}: FormDateRangeProps) {
  const handleDateChange = (range: RangeValue<DateValue> | null) => {
    onChange(
      range?.start ? new Date(range.start.toDate(getLocalTimeZone())) : null,
      range?.end ? new Date(range.end.toDate(getLocalTimeZone())) : null
    );
  };

  const convertToDateValue = (date: Date | null): DateValue => {
    if (!date) return today(getLocalTimeZone());
    try {
      return parseDate(date.toISOString().split('T')[0]);
    } catch {
      return today(getLocalTimeZone());
    }
  };

  return (
    <div className="space-y-2 w-full">
      <div className="w-full [&>div]:w-full">
        <DateRangePicker
          label="旅行日期"
          value={{
            start: convertToDateValue(startDate),
            end: convertToDateValue(endDate)
          }}
          onChange={handleDateChange}
          isDisabled={disabled}
          errorMessage={error}
          minValue={today(getLocalTimeZone())}
        />
      </div>
    </div>
  );
}