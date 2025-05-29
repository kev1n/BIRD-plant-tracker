import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popoverDialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

export default function DatePicker({ 
  date, 
  setDate,
  pickerName
}: { 
  date: Date | null, 
  setDate: (date: Date | null) => void 
  pickerName?: string
}) {
  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[150px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "PPP") : <span>{pickerName}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date || undefined}
          onSelect={(date) => setDate(date || null)}
        />
      </PopoverContent>
    </Popover>
  );
}
