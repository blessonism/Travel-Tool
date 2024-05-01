import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { input, Input } from "../schema";
import DateRangePicker from "@/components/DateRangePicker";
import { getLocalTimeZone, today } from "@internationalized/date";
import React from "react";
import Button from "@/components/Button";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

type FormProps = {
  onSubmit: (value: Input) => void;
  disabled: boolean;
};

export default function Form(props: FormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Input>({
    resolver: zodResolver(input),
  });

  return (
    <form
      onSubmit={handleSubmit(props.onSubmit)}
      className="flex flex-col gap-2 lg:min-w-[400px]"
    >
      <label>What city are you going to?</label>
      <input
        {...register("destination")}
        className="border border-gray-400 p-2 rounded"
        placeholder="Barcelona"
      />
      <p className="text-red-500">{errors.destination?.message}</p>

      <label>How many people are going?</label>
      <input
        {...register("numPeople", { valueAsNumber: true })}
        type="number"
        className="border border-gray-400 p-2 rounded"
        placeholder="2"
        min="1" // This sets the minimum value that can be entered
        step="1" // This restricts input to whole numbers only
      />

      <p className="text-red-500">{errors.numPeople?.message}</p>

      <label>First time visiting?</label>
      <select
        {...register("firstTimeVisiting", {
          setValueAs: (v) => v === "true", // Converts the string 'true' to boolean true
        })}
        className="border border-gray-400 p-2 rounded"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
      <p className="text-red-500">{errors.firstTimeVisiting?.message}</p>

      <label>How much do you plan to spend on this trip? (Optional)</label>
      <input
        {...register("plannedSpending", { valueAsNumber: true })}
        type="number"
        className="border border-gray-400 p-2 rounded"
        placeholder="Amount in your currency"
      />
      <p className="text-red-500">{errors.plannedSpending?.message}</p>

      <label>Describe the intention of your trip</label>
      <textarea
        {...register("description")}
        rows={4}
        className="border border-gray-400 p-2 rounded"
        placeholder="Family trip with lots of nice dinners"
      />
      <p className="text-red-500">{errors.description?.message}</p>

      <DateRangePicker
        label="Start and end date of trip"
        minValue={today(getLocalTimeZone())}
        onChange={(v) => {
          setValue("startDate", v.start.toString());
          setValue("endDate", v.end.toString());
        }}
        errorMessage={errors.startDate?.message || errors.endDate?.message}
      />

      <Button
        type="submit"
        className=" bg-indigo-500 text-white rounded p-2 flex gap-2 items-center justify-center"
        isDisabled={props.disabled}
      >
        Submit <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <p className="text-gray-600">* We support trips of up to 5 days</p>
    </form>
  );
}
