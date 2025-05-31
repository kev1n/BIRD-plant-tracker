import { cn } from '@/lib/utils';
import { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import { format } from "date-fns";
import { CalendarIcon, Check, X } from 'lucide-react';
import { createRoot, Root } from 'react-dom/client';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export default class DateTimePickerCellEditor implements ICellEditorComp {
  private eGui!: HTMLDivElement;
  private reactRoot!: Root;
  private value: Date | null = null;
  private params!: ICellEditorParams;
  private isPopoverOpen: boolean = false;

  init(params: ICellEditorParams): void {
    this.params = params;
    
    // Parse the initial value - it could be a Date object, ISO string, or null
    this.value = this.parseDate(params.value);

    // Create the GUI with higher z-index and better positioning
    this.eGui = document.createElement('div');
    this.eGui.className = 'relative';
    this.eGui.style.zIndex = '9999';
    this.eGui.style.marginTop = '10px';

    // Create React root and render the component
    this.reactRoot = createRoot(this.eGui);
    this.renderComponent();
  }

  private parseDate(value: Date | string | number | null | undefined): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Try to handle timestamp numbers
    if (typeof value === 'number') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  // Force re-render by calling renderComponent again
  private updateComponent(): void {
    this.renderComponent();
  }

  // Custom DateTimePicker component without modal behavior
  private CustomDateTimePicker = ({ date, placeholder, className, displayFormat }: {
    date: Date | null;
    placeholder: string;
    className: string;
    displayFormat: string;
  }) => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    
    const handleDateSelect = (selectedDate: Date | undefined) => {
      if (selectedDate) {
        if (date) {
          const newDate = new Date(selectedDate);
          newDate.setHours(date.getHours());
          newDate.setMinutes(date.getMinutes());
          this.value = newDate;
        } else {
          const now = new Date();
          selectedDate.setHours(now.getHours());
          selectedDate.setMinutes(now.getMinutes());
          this.value = selectedDate;
        }
        this.updateComponent();
      }
    };
   
    const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string) => {
      if (date) {
        const newDate = new Date(date);
        if (type === "hour") {
          const hour12 = parseInt(value);
          const currentHours = newDate.getHours();
          const isPM = currentHours >= 12;
          newDate.setHours(isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12));
        } else if (type === "minute") {
          newDate.setMinutes(parseInt(value));
        } else if (type === "ampm") {
          const currentHours = newDate.getHours();
          if (value === "PM" && currentHours < 12) {
            newDate.setHours(currentHours + 12);
          } else if (value === "AM" && currentHours >= 12) {
            newDate.setHours(currentHours - 12);
          }
        }
        this.value = newDate;
        this.updateComponent();
      }
    };

    const handlePopoverChange = (open: boolean) => {
      this.isPopoverOpen = open;
      this.updateComponent();
    };

    return (
      <Popover open={this.isPopoverOpen} onOpenChange={handlePopoverChange} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, displayFormat)
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" style={{ zIndex: 10001 }}>
          <div className="sm:flex">
            <Calendar
              mode="single"
              selected={date || undefined}
              onSelect={handleDateSelect}
            />
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hours.reverse().map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() % 12 === hour % 12
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        date && date.getMinutes() === minute
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>
              <ScrollArea className="">
                <div className="flex sm:flex-col p-2">
                  {["AM", "PM"].map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        date &&
                        ((ampm === "AM" && date.getHours() < 12) ||
                          (ampm === "PM" && date.getHours() >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange("ampm", ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  private renderComponent(): void {
    const handleConfirm = () => {
      if (this.params.stopEditing) {
        this.params.stopEditing();
      }
    };

    const handleCancel = () => {
      this.value = this.parseDate(this.params.value);
      if (this.params.stopEditing) {
        this.params.stopEditing();
      }
    };

    this.reactRoot.render(
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-visible mt-2" style={{ zIndex: 9999 }}>
        <div className="p-4 border-b border-gray-100">
          <this.CustomDateTimePicker
            date={this.value}
            placeholder="Select date and time..."
            className="w-full"
            displayFormat="MM/dd/yyyy hh:mm aa"
          />
        </div>
        
        <div className="p-3 bg-gray-50 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  getGui(): HTMLElement {
    return this.eGui;
  }

  getValue(): Date | null {
    return this.value;
  }

  destroy(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
  }

  isPopup(): boolean {
    return true;
  }

  getPopupPosition(): "over" | "under" | undefined {
    return 'under';
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  focusIn(): void {
    // Focus is handled by the DateTimePicker component
  }

  focusOut(): void {
    // Focus is handled by the DateTimePicker component
  }

  afterGuiAttached(): void {
    // This is called after the GUI is attached to the DOM
  }
} 