"use client";

import React from "react";
import {
  AriaCalendarCellProps,
  AriaCalendarGridProps,
  AriaDateFieldProps,
  AriaDateRangePickerProps,
  DateValue,
  RangeCalendarProps,
  useDateField,
  useDateRangePicker,
  useDateSegment,
  useLocale,
} from "react-aria";
import {
  DateFieldState,
  type DateSegment,
  RangeCalendarState,
  useDateFieldState,
  useDateRangePickerState,
} from "react-stately";
import Popover from "./Popover";
import Dialog from "./Dialog";
import cn from "classnames";

import { useCalendarCell, useCalendarGrid, useRangeCalendar } from "react-aria";
import { useRangeCalendarState } from "react-stately";
import {
  createCalendar,
  getDayOfWeek,
  getWeeksInMonth,
  isSameDay,
} from "@internationalized/date";

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/20/solid";
import Button from "./Button";
import { DAY_IN_MS } from "@/app/schema";

function RangeCalendar(props: RangeCalendarProps<DateValue>) {
  let { locale } = useLocale();
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar,
  });

  let ref = React.useRef<HTMLDivElement>(null);
  let { calendarProps, prevButtonProps, nextButtonProps, title } =
    useRangeCalendar(props, state, ref);

  return (
    <div {...calendarProps} ref={ref} className="inline-block p-8">
      <div className="flex items-center pb-4">
        <h2 className="flex-1 font-bold text-xl ml-2">{title}</h2>
        <Button {...prevButtonProps}>
          <ChevronLeftIcon className="w-6 h-6 p-0.5" />
        </Button>
        <Button {...nextButtonProps}>
          <ChevronRightIcon className="w-6 h-6 p-0.5" />
        </Button>
      </div>
      <CalendarGrid state={state} />
    </div>
  );
}

type CalendarGridProps = {
  state: RangeCalendarState;
} & AriaCalendarGridProps;

function CalendarGrid({ state, ...props }: CalendarGridProps) {
  let { locale } = useLocale();
  let { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  let weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  return (
    <table {...gridProps} className="flex-1" cellPadding="0">
      <thead {...headerProps} className="text-center">
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell key={i} state={state} date={date} />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type CalendarCellProps = {
  state: RangeCalendarState;
} & AriaCalendarCellProps;

function CalendarCell({ state, date }: CalendarCellProps) {
  let ref = React.useRef<HTMLDivElement>(null);

  let {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    isUnavailable,
    formattedDate,
  } = useCalendarCell({ date }, state, ref);

  let isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  let isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  let { locale } = useLocale();
  let dayOfWeek = getDayOfWeek(date, locale);
  let isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  let isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

  return (
    <td {...cellProps} className="py-0.5 relative">
      <div
        {...buttonProps}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn("p-3 outline-none text-center", {
          "bg-indigo-500 text-white": isSelectionStart || isSelectionEnd,
          "bg-indigo-400 text-white":
            isSelected && !(isSelectionStart || isSelectionEnd),
          "text-gray-400": isDisabled || isUnavailable,
          "rounded-r": isRoundedRight,
          "rounded-l": isRoundedLeft,
        })}
      >
        {formattedDate}
      </div>
    </td>
  );
}

type DateSegmentProps = {
  segment: DateSegment;
  state: DateFieldState;
};

function DateSegment(props: DateSegmentProps) {
  const ref = React.useRef(null);
  const { segmentProps } = useDateSegment(props.segment, props.state, ref);

  return (
    <div
      {...segmentProps}
      ref={ref}
      className={cn({
        "text-black": props.segment.isEditable || !props.segment.isPlaceholder,
        "text-gray-400":
          props.segment.isPlaceholder || !props.segment.isEditable,
      })}
    >
      {props.segment.text}
    </div>
  );
}

function DateField(props: AriaDateFieldProps<DateValue>) {
  const { locale } = useLocale();
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  });

  const ref = React.useRef(null);
  const { labelProps, fieldProps } = useDateField(props, state, ref);

  return (
    <div>
      <span {...labelProps}>{props.label}</span>
      <div {...fieldProps} ref={ref} className="flex gap-0.5">
        {state.segments.map((segment, i) => (
          <DateSegment key={i} segment={segment} state={state} />
        ))}
      </div>
    </div>
  );
}

export default function DateRangePicker(
  props: AriaDateRangePickerProps<DateValue>
) {
  const state = useDateRangePickerState({ ...props });
  const ref = React.useRef<HTMLDivElement>(null);
  const {
    buttonProps,
    calendarProps,
    descriptionProps,
    dialogProps,
    endFieldProps,
    errorMessageProps,
    groupProps,
    labelProps,
    startFieldProps,
  } = useDateRangePicker(props, state, ref);

  return (
    <div className="relative inline-flex flex-col text-left gap-2 ">
      <span {...labelProps} id="label">
        {props.label}
      </span>
      <div {...groupProps} id="group" ref={ref} className="flex group">
        <div className="flex gap-2 border border-gray-400 transition-colors rounded-l p-2 relative w-full bg-white">
          <DateField {...startFieldProps} />
          <span>-</span>
          <DateField {...endFieldProps} />
        </div>
        <Button
          {...buttonProps}
          type="button"
          className="p-2 border border-l-0 rounded-r border-gray-400 bg-white"
        >
          <CalendarIcon className="w-6 h-6" />
        </Button>
      </div>    
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement="bottom start">
          <Dialog {...dialogProps}>
            <RangeCalendar {...calendarProps} />
          </Dialog>
        </Popover>
      )}
    </div>
  );
}
