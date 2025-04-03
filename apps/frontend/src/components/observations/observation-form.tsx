import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button'; // Ensure you have the Button component
import { Calendar } from '@/components/ui/calendar'; // Ensure you have the Calendar component
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Ensure you have the Popover component
import { Input } from '@/components/ui/input';
import { Observation } from 'types/database_types'; // Ensure you have the correct type for Observation
import { useEffect } from 'react';

const PlantInfoSchema = z.object({
  plantID: z.number(),
  plantCommonName: z.string(),
  plantScientificName: z.string().nullable(),
  isNative: z.boolean().nullable(),
  subcategory: z.string(),
});

const ObservationSchema = z.object({
  tempKey: z.number(),
  isNew: z.boolean(),
  modified: z.boolean(),
  observationID: z.number(),
  snapshotID: z.number(),
  PlantInfo: PlantInfoSchema,
  plantQuantity: z.number(),
  datePlanted: z.date().optional(),
  dateBloomed: z.date().optional(),
  deletedOn: z.date().optional(),
});

type FormValues = z.infer<typeof ObservationSchema>;

export default function ObservationForm({
  observation, // Optional: if you want to edit an existing observation
  submitCallback, // Optional: callback function to handle form submission
}: {
  observation?: Observation;
  submitCallback?: (values: Observation) => void; // Optional callback for submission
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(ObservationSchema),
    defaultValues: {
      tempKey: 0,
      isNew: true,
      modified: false,
      observationID: 0,
      snapshotID: -1,
      PlantInfo: {
        plantID: 1,
        plantCommonName: 'test plant',
        plantScientificName: null,
        isNative: null,
        subcategory: 'Shrub',
      },
      plantQuantity: 1,
      datePlanted: undefined,
      dateBloomed: undefined,
      deletedOn: undefined,
    },
  });
  useEffect(() => {
    if (observation) {
      form.reset({
        tempKey: observation.tempKey,
        isNew: observation.isNew,
        modified: observation.modified,
        observationID: observation.observationID,
        snapshotID: observation.snapshotID,
        PlantInfo: {
          plantID: observation.PlantInfo.plantID,
          plantCommonName: observation.PlantInfo.plantCommonName,
          plantScientificName: observation.PlantInfo.plantScientificName,
          isNative: observation.PlantInfo.isNative,
          subcategory: observation.PlantInfo.subcategory,
        },
        plantQuantity: observation.plantQuantity,
        datePlanted: observation.datePlanted ? new Date(observation.datePlanted) : undefined,
        dateBloomed: observation.dateBloomed ? new Date(observation.dateBloomed) : undefined,
        deletedOn: observation.deletedOn ? new Date(observation.deletedOn) : undefined,
      });
    }
  }, [observation, form]);
  function onSubmit(values: FormValues) {
    const observationData: Observation = {
      tempKey: values.tempKey,
      isNew: values.isNew,
      modified: values.modified,
      observationID: values.observationID,
      snapshotID: values.snapshotID,
      PlantInfo: {
        plantID: values.PlantInfo.plantID,
        plantCommonName: values.PlantInfo.plantCommonName,
        plantScientificName: values.PlantInfo.plantScientificName,
        isNative: values.PlantInfo.isNative,
        subcategory: values.PlantInfo.subcategory,
      },
      plantQuantity: values.plantQuantity,
      datePlanted: values.datePlanted || null,
      dateBloomed: values.dateBloomed || null,
      deletedOn: null, // or handle as needed
    };
    if (submitCallback) {
      submitCallback(observationData);
    }
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="plantQuantity" // Field name in the form
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Plant Quantity <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Enter the quantity of the plant (numbers only)</FormDescription>
                <FormControl>
                  <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="datePlanted"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Date Planted <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Select the date the plant was planted</FormDescription>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Select a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateBloomed"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">
                  Bloom Date <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Select the date the plant bloomed</FormDescription>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Select a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-10 flex items-center justify-end space-x-2">
            <Button
              type="submit"
            >
              Submit
            </Button>
        </div>
        </form>
        
      </Form>
    </div>
  );
}
