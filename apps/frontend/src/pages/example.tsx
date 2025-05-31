import PageHead from '@/components/PageHead';
import { Calendar } from "@/components/ui/calendar";
import DatePicker from "@/components/ui/datepicker";
import { useState } from "react";
import { AlertExample } from "../components/ui/examples/AlertExample";
import { ButtonExample } from "../components/ui/examples/ButtonExample";
import { CardExample } from "../components/ui/examples/CardExample";
import { FormExample } from "../components/ui/examples/FormExample";
import { LocationDemo } from "../components/ui/location";

export default function ExamplePage() {
  return (
    <>
      <PageHead 
        title="Example Components" 
        description="Example page showcasing UI components and functionality" 
      />
      <div className="space-y-8 p-4">
        <ButtonExample />
        <CardExample />
        <AlertExample />
        <FormExample />
        <LocationDemo />
        <DatePicker date={new Date()} setDate={() => {}} pickerName="Select Date" />
      </div>
    </>
  );
}


export function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border shadow"
    />
  )
}
