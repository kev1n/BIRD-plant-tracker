import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "../button";
import { Calendar } from "../calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "../form";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select";

// Create a schema for form validation
const formSchema = z.object({
  date: z.date().optional(),
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }).optional(),
  select: z.string().min(1, { message: "Please select an option" }),
  text: z.string().min(1, { message: "Text is required" }),
  time: z.string().optional(),
  number: z.string()
    .refine((val) => !isNaN(Number(val)), { message: "Must be a valid number" })
    .refine((val) => Number(val) >= 1, { message: "Number must be at least 1" }),
  textarea: z.string().min(1, { message: "Text area content is required" }),
  // Example fields without validation
  example1: z.any().optional(),
  example2: z.any().optional(),
  example3: z.any().optional(),
  example4: z.any().optional(),
  example5: z.any().optional()
});

// Define the form type
type FormValues = z.infer<typeof formSchema>;

export function FormExample() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: undefined,
      dateRange: { from: undefined, to: undefined },
      select: "",
      text: "",
      time: "",
      number: "",
      textarea: "",
      // Default values for example fields
      example1: "",
      example2: "",
      example3: "",
      example4: "",
      example5: ""
    }
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-4xl">FORMS (dropdown select, datepicker, raw text, etc)</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Date Range Picker Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">DateRangePicker</h3>
              
              <div className="space-y-6">
                {/* Single Date Picker */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Single Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Select a single date from the calendar
                      </FormDescription>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range Picker */}
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Date Range <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Select a start and end date for a date range
                      </FormDescription>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value?.from && "text-muted-foreground"
                              )}
                            >
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "LLL dd, y")} - {format(field.value.to, "LLL dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "LLL dd, y")
                                )
                              ) : (
                                <span>Select date range</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={{
                              from: field.value?.from,
                              to: field.value?.to
                            }}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* MultiSelect Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">MultiSelect</h3>
              
              <div className="space-y-6">
                {/* Example 1: Empty Select */}
                <FormField
                  control={form.control}
                  name="select"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Dropdown Select <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Choose an option from the dropdown menu
                      </FormDescription>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl className="w-full">
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="hover">Hover</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                          <SelectItem value="option4">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Example with error state */}
                <FormField
                  control={form.control}
                  name="example1"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Error State Example <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        This dropdown shows an error state
                      </FormDescription>
                      <Select>
                        <FormControl className="w-full border-red-500">
                          <SelectTrigger className="border-red-500">
                            <SelectValue placeholder="Invalid selection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="hover">Hover</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-red-500 text-sm mt-1">Error message</p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* TextInput Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">TextInput</h3>
              
              <div className="space-y-6">
                {/* Example 1: Empty Text Input */}
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Text Input <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Enter text in the field below
                      </FormDescription>
                      <FormControl>
                        <Input placeholder="Type your text here" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Example with typing state */}
                <FormField
                  control={form.control}
                  name="example2"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Typing State <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Shows what the input looks like while typing
                      </FormDescription>
                      <FormControl>
                        <Input defaultValue="User is typing" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Example with error state */}
                <FormField
                  control={form.control}
                  name="example3"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Error State <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Shows what the input looks like with an error
                      </FormDescription>
                      <FormControl>
                        <Input className="border-red-500" defaultValue="Invalid input" />
                      </FormControl>
                      <p className="text-red-500 text-sm mt-1">You did something wrong!</p>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* TimeInput Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">TimeInput</h3>
              
              <div className="space-y-6">
                {/* Example 1: Empty Time Input */}
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Time Input <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Select a time in 24-hour format
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input type="time" className="w-full" {...field} />
                        </FormControl>
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Example with default value */}
                <FormField
                  control={form.control}
                  name="example4"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Time with Default <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Time input with a default value set
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input type="time" className="w-full" defaultValue="12:30" />
                        </FormControl>
                        <Clock className="absolute right-3 top-2.5 h-4 w-4 opacity-50" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* NumberInput Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">NumberInput</h3>
              
              <div className="space-y-6">
                {/* Example 1: Empty Number Input */}
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Number Input <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Enter a numeric value (numbers only)
                      </FormDescription>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Example with value */}
                <FormField
                  control={form.control}
                  name="example5"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Number with Value <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormDescription>
                        Number input with a value already entered
                      </FormDescription>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          defaultValue="1234" 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* TextArea Section */}
            <div>
              <h3 className="text-blue-500 font-medium mb-4">TextArea</h3>
              
              <div className="space-y-6">
                {/* Example 1: Empty TextArea */}
                <FormField
                  control={form.control}
                  name="textarea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">
                        Text Area
                      </FormLabel>
                      <FormDescription>
                        Enter multiple lines of text
                      </FormDescription>
                      <FormControl>
                        <textarea 
                          className="w-full min-h-[100px] px-3 py-2 text-base rounded-md border border-input bg-transparent outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                          placeholder="Type your multi-line text here"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Example with content */}
                <div className="space-y-2">
                  <h4 className="text-base font-bold">Text Area with Content</h4>
                  <p className="text-sm text-gray-500">Text area with content already entered</p>
                  <textarea 
                    className="w-full min-h-[100px] px-3 py-2 text-base border border-input bg-transparent outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    defaultValue="This is an example of a textarea with multiple lines of content that has already been entered by the user."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 