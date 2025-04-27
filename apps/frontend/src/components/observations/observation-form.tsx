import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon , Check, ChevronsUpDown} from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button'; // Ensure you have the Button component
import { Calendar } from '@/components/ui/calendar'; // Ensure you have the Calendar component
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Ensure you have the RadioGroup component
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Ensure you have the Popover component
import { Input } from '@/components/ui/input';
import { Observation } from 'types/database_types'; // Ensure you have the correct type for Observation
import { useEffect } from 'react';
import { PlantInfo } from 'types/database_types'; // Ensure you have the correct type for PlantInfo
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
  hasBloomed: z.boolean().optional(), // Allow null for backward compatibility, but can be boolean
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
  const [plants, setPlants] = useState<PlantInfo[]>([]); // Assuming you have a Plant type
  const [searchTerm, setSearchTerm] = useState('');
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
      hasBloomed: undefined,
      deletedOn: undefined,
    },
  });

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const api_path = `${baseUrl}/plants?name=${searchTerm}`;
        const response = await fetch(api_path, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlants(data.plants);
        } else {
          setPlants([]);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };
    if (searchTerm.length>0){
    fetchPlants();
    }
  }, [searchTerm]);
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
        hasBloomed: observation.hasBloomed !== null ? observation.hasBloomed : undefined,
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
      hasBloomed: values.hasBloomed !== undefined ? values.hasBloomed : null,
      deletedOn: null, // or handle as needed
    };
    console.log('Submitting observation data:', observationData);
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
          name="PlantInfo"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Plant Common Name</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value.plantCommonName
                        ? plants.find(
                            (plant) => plant.plantCommonName === field.value.plantCommonName
                          )?.plantCommonName
                        : "Select plant"}
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search framework..."
                      className="h-9"
                      onValueChange={(value) => {
                        setSearchTerm(value);
                      }}
                    />
                    <Button>Add a new plant</Button>
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {plants.map((plant) => (
                          <CommandItem
                            value={plant.plantCommonName}
                            key={plant.plantID}
                            onSelect={() => {
                              console.log("Selected plant:", plant);
                              field.onChange(plant)
                            }}
                          >
                            {plant.plantCommonName}
                            <Check
                              className={cn(
                                "ml-auto",
                                field?.value.plantCommonName === plant.plantCommonName
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription>
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
                <FormLabel className="text-base font-bold">
                  Has Bloomed <span className="text-red-500">*</span>
                </FormLabel>
                <FormDescription>Enter whether the flower has bloomed</FormDescription>
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

          {/* make a radio group*/}
          <div className="mt-10 flex items-center justify-end space-x-2">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}