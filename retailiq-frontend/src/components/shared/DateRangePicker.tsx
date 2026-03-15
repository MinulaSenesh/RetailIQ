import * as React from "react"
import { addDays, format, subDays, startOfYear, startOfMonth } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerWithRangeProps {
  className?: string
  date: DateRange | undefined
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
}: DatePickerWithRangeProps) {
  
  const handlePresetSelect = (value: string) => {
    const today = new Date()
    switch (value) {
      case "last_7":
        setDate({ from: subDays(today, 7), to: today })
        break
      case "last_30":
        setDate({ from: subDays(today, 30), to: today })
        break
      case "last_90":
        setDate({ from: subDays(today, 90), to: today })
        break
      case "this_month":
        setDate({ from: startOfMonth(today), to: today })
        break
      case "this_year":
        setDate({ from: startOfYear(today), to: today })
        break
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x overflow-hidden">
             {/* Presets Sidebar */}
             <div className="flex flex-col gap-1 p-3 bg-muted/20 min-w-[150px]">
               <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-2">Filters</p>
               {[
                 { label: "Last 7 Days", value: "last_7" },
                 { label: "Last 30 Days", value: "last_30" },
                 { label: "Last 90 Days", value: "last_90" },
                 { label: "This Month", value: "this_month" },
                 { label: "This Year", value: "this_year" },
               ].map((preset) => (
                 <Button
                   key={preset.value}
                   variant="ghost"
                   size="sm"
                   className="justify-start font-normal text-xs h-8 px-2"
                   onClick={() => handlePresetSelect(preset.value)}
                 >
                   {preset.label}
                 </Button>
               ))}
             </div>
             
             {/* Calendar Section */}
             <div className="p-1">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  className="p-3"
                />
             </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
