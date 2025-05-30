import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Ensure you have the Button component
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DateTimePicker } from '@/components/ui/date-time-picker'; // Import DateTimePicker instead of Calendar
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popoverDialog'; // Ensure you have the Popover component
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Ensure you have the RadioGroup component
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Observation, PlantInfo } from 'types/database_types'; // Ensure you have the correct type for Observation
import DeletePlantButton from '../plant-selector/delete-plant-button';
import NewPlantFormDialog from '../plant-selector/new-plant-form-dialog';
import { getCategoryIcon } from './category-icon';

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
  const [plants, setPlants] = useState<PlantInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    const fetchPlants = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        // If no search term, get all plants with a limit, otherwise search by name
        const api_path = searchTerm.length > 0 
          ? `${baseUrl}/plants?name=${searchTerm}`
          : `${baseUrl}/plants?limit=20`; // Load first 20 plants by default
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
        toast.error('Error fetching plants: ' + error);
      }
    };
    
    // Always fetch plants (either search results or default list)
    fetchPlants();
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
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-[400px] justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value?.plantCommonName
                          ? plants.find(
                              plant => plant.plantCommonName === field.value.plantCommonName
                            )?.plantCommonName
                          : 'Select plant'}
                        <ChevronsUpDown className="opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput
                        placeholder="Begin typing to search..."
                        className="h-9"
                        onValueChange={value => {
                          setSearchTerm(value);
                        }}
                      />
                      
                      <CommandList>
                        <CommandEmpty>No plants found.</CommandEmpty>
                        <CommandGroup>
                          {plants.map(plant => (
                            <CommandItem
                              value={plant.plantCommonName}
                              key={plant.plantID}
                              onSelect={() => {
                                field.onChange(plant);
                              }}
                              className="flex items-start justify-between p-3 cursor-pointer hover:bg-accent"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground min-w-32">
                                    {plant.plantCommonName}
                                  </span>
                                  {plant.isNative !== null && (
                                    <Badge 
                                      variant={plant.isNative ? "default" : "destructive"}
                                      className="text-xs"
                                    >
                                      {plant.isNative ? 'Native' : 'Non-native'}
                                    </Badge>
                                  )}
                                  {plant.subcategory && getCategoryIcon(plant.subcategory)}
                                </div>
                                {plant.plantScientificName && (
                                  <p className="text-sm text-muted-foreground italic mt-1">
                                    {plant.plantScientificName}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <DeletePlantButton
                                  plantCommonName={plant.plantCommonName}
                                  plantID={plant.plantID.toString()}
                                  callBack={() => {
                                    setSearchTerm('');
                                    setPlants([]);
                                  }}
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                      <NewPlantFormDialog newPlant={true} />
                    </Command>
                  </PopoverContent>
                </Popover>

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
                <FormDescription>Select the date and time the plant was planted</FormDescription>
                <FormControl>
                  <DateTimePicker
                    date={field.value || null}
                    setDate={(date) => field.onChange(date)}
                    placeholder="Select date and time"
                    displayFormat="MM/dd/yyyy hh:mm aa"
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
