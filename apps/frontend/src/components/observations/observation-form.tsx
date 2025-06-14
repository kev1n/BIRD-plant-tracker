import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button'; // Ensure you have the Button component
import { DateInput } from '@/components/ui/date-input'; // Import DateInput instead of DateTimePicker
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Ensure you have the RadioGroup component
import { parseDateAsLocal } from '@/lib/date-utils';
import { useEffect } from 'react';
import { Observation } from 'types/database_types'; // Ensure you have the correct type for Observation
import PlantSelector from '../plant-selector/plant-selector';

const PlantInfoSchema = z.object({
  plantID: z.number(),
  plantCommonName: z.string(),
  plantScientificName: z.string().nullable(),
  isNative: z.boolean().nullable(),
  subcategory: z.string().nullable().optional(),
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
  hasBloomed: z.boolean().nullable().optional(),
  deletedOn: z.date().optional(),
});

type FormValues = z.infer<typeof ObservationSchema>;

export default function ObservationForm({
  observation,
  submitCallback,
}: {
  observation?: Observation;
  submitCallback?: (values: Observation) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(ObservationSchema),
    defaultValues: {
      tempKey: 0,
      isNew: true,
      modified: false,
      observationID: 0,
      snapshotID: -1,
      datePlanted: undefined, // Don't default to current date and time
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
        datePlanted: observation.datePlanted ? parseDateAsLocal(observation.datePlanted) : undefined,
        hasBloomed: observation.hasBloomed !== null ? observation.hasBloomed : undefined,
        deletedOn: observation.deletedOn ? new Date(observation.deletedOn) : undefined,
      });
    }
  }, [observation, form]);

  function onObservationSubmit(values: FormValues) {
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
      hasBloomed: values.hasBloomed !== undefined ? values.hasBloomed : null,
      deletedOn: null, // or handle as needed
    };
    if (submitCallback) {
      submitCallback(observationData);
    }
  }
  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onObservationSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="PlantInfo"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base font-bold">
                  Plant Common Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>
                  Search and select a plant from the list or add a new one by clicking "New Plant"
                </FormDescription>
                <FormControl>
                  <PlantSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select plant"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hasBloomed" // Field name in the form
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold">Has Bloomed</FormLabel>
                <FormDescription>Enter whether the plant has bloomed</FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={value =>
                      field.onChange(value === 'Yes' ? true : value === 'No' ? false : null)
                    }
                    value={
                      field.value === true ? 'Yes' : field.value === false ? 'No' : 'Not Applicable'
                    }
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Yes" />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="No" />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="Not Applicable" />
                      </FormControl>
                      <FormLabel className="font-normal">Not Applicable</FormLabel>
                    </FormItem>
                  </RadioGroup>
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
                <FormLabel className="text-base font-bold">Date Planted</FormLabel>
                <FormDescription>Select the date the plant was planted</FormDescription>
                <FormControl>
                  <DateInput
                    date={field.value || null}
                    setDate={(date) => field.onChange(date)}
                    placeholder="MM/DD/YYYY"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-10 flex items-center justify-end space-x-2">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
