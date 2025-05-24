import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarIcon, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PlantInfo } from 'types/database_types';

export default function FiltersList({
  beginDate,
  setBeginDate,
  endDate,
  setEndDate,
  selectedPlants,
  setSelectedPlants,
  latest,
  setLatest,
}: {
  beginDate: Date | undefined;
  setBeginDate: (date: Date | undefined) => void;
  endDate: Date | undefined;
  setEndDate: (date: Date | undefined) => void;
  selectedPlants: PlantInfo[];
  setSelectedPlants: (plants: PlantInfo[]) => void;
  latest: boolean;
  setLatest: (latest: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [possiblePlants, setPossiblePlants] = useState<PlantInfo[]>([]);

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
          setPossiblePlants(data.plants);
        } else {
          setPossiblePlants([]);
        }
      } catch (error) {
        console.error('Error fetching plants:', error);
      }
    };
    if (searchTerm.length > 0) {
      fetchPlants();
    } else {
      setPossiblePlants([]);
    }
  }, [searchTerm]);

  const clearFilters = () => {
    setBeginDate(undefined);
    setEndDate(undefined);
    setSelectedPlants([]);
    setLatest(false);
    setSearchTerm('');
  };

  return (
    <div className="p-4 bg-secondary rounded shadow-md z-12 overflow-y-auto">
      <h2 className="text-lg font-semibold">Filter Patches for Snapshots</h2>
      <Button onClick={clearFilters} variant="outline">
        Clear filters
      </Button>

      <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
        <h3 className="text-left mb-3"> Dates Filtering</h3>

        <RadioGroup value={String(latest)} onValueChange={value => setLatest(value === 'true')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="r1" />
            <Label className="font-secondary text-primary-dark-grey" htmlFor="r1">
              Find on latest patch state
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="r2" />
            <Label className="font-secondary text-primary-dark-grey" htmlFor="r2">
              Find from date range
            </Label>
          </div>
        </RadioGroup>
        {!latest && (
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('pl-3 text-left font-normal', beginDate && 'text-muted-foreground')}
                >
                  {beginDate ? format(beginDate, 'MM/dd/yyyy') : <span>From</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  required={false}
                  selected={beginDate ? beginDate : undefined}
                  onSelect={setBeginDate}
                />
              </PopoverContent>
            </Popover>
            -
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('pl-3 text-left font-normal', endDate && 'text-muted-foreground')}
                >
                  {endDate ? format(endDate, 'MM/dd/yyyy') : <span>To</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  required={false}
                  selected={endDate ? endDate : undefined}
                  onSelect={setEndDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="max-h-[300px] border border-gray-300 rounded-lg p-4 bg-white">
        <h3 className="text-left bg-white">Plants Selected</h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-start text-left font-normal mb-2"
            >
              Add a plant to the filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command>
              <CommandInput
                placeholder="Begin typing to search..."
                className="h-9"
                onValueChange={value => {
                  setSearchTerm(value);
                }}
              />
              <CommandList>
                <CommandEmpty>No plants found...</CommandEmpty>
                <CommandGroup>
                  {possiblePlants.map(plant => (
                    <CommandItem
                      value={plant.plantCommonName}
                      key={plant.plantID}
                      onSelect={() => {
                        if (selectedPlants.some(p => p.plantID === plant.plantID)) {
                          setSelectedPlants(
                            selectedPlants.filter(p => p.plantID !== plant.plantID)
                          );
                        } else {
                          setSelectedPlants([...selectedPlants, plant]);
                        }
                      }}
                    >
                      {plant.plantCommonName}{' '}
                      {plant.plantScientificName && `(${plant.plantScientificName})`}{' '}
                      {plant.isNative != null && plant.isNative ? (
                        <span className="text-green-500">[Native]</span>
                      ) : (
                        <span className="text-red-500">[Non-native]</span>
                      )}
                      {plant.subcategory && (
                        <span className="text-gray-500">[{plant.subcategory}]</span>
                      )}
                      <Check
                        className={cn(
                          'ml-auto',
                          selectedPlants.some(p => p.plantID === plant.plantID)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {selectedPlants.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white">
            {selectedPlants.map(plant => (
              <div
                className="flex items-center justify-between border-b border-gray-300 py-2"
                key={plant.plantID}
              >
                <div>{plant.plantCommonName}</div>
                <button
                  onClick={() =>
                    setSelectedPlants(selectedPlants.filter(p => p.plantID !== plant.plantID))
                  }
                >
                  <X className="h-4 w-4 text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
