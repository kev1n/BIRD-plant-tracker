import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function DatePicker({ date, setDate }: { date: Date, setDate: (date: Date) => void }) {

  const updateDate = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);  // Update with the selected date
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[150px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "PPP") : <span>Check your date of record</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(date) => updateDate(date)}  // Ensure date is passed correctly
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
