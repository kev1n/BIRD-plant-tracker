import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import randomColor from 'randomcolor';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Check, X, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PlantInfo } from 'types/database_types';
import { toast } from 'sonner';
import DatePicker from '@/components/ui/datepicker';

export default function FiltersList({
  filtersOn,
  setFiltersOn,
  plantToColor,
  setPlantToColor,
  patchesToColors,
  setPatchesToColors,
}: {
  filtersOn: boolean;
  setFiltersOn: (value: boolean) => void;
  plantToColor: Map<number, string>;
  setPlantToColor: (value: Map<number, string>) => void;
  patchesToColors: Map<string, string[]>;
  setPatchesToColors: (value: Map<string, string[]>) => void;
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [possiblePlants, setPossiblePlants] = useState<PlantInfo[]>([]);
  const [beginDate, setBeginDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedPlants, setSelectedPlants] = useState<PlantInfo[]>([]);
  const [latest, setLatest] = useState(true);
  const [soilList, setSoilList] = useState<string[]>(['Sand', 'Pond', 'Sandy Loam']);

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
      } catch {
        toast.error('Error: Unable to search for plants');
        setPossiblePlants([]);
      }
    };
    if (searchTerm.length > 0) {
      fetchPlants();
    } else {
      setPossiblePlants([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchHighlightedPatches = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const encodedPlantIDs = encodeURI(
          JSON.stringify(selectedPlants.map(plant => plant.plantID))
        );
        const encodedSoilList = encodeURI(JSON.stringify(soilList));

        const url = `${baseUrl}/filter/highlighted-patches?plants=${encodedPlantIDs}&soilTypes=${encodedSoilList}&latest=${latest}&beginDate=${beginDate ? beginDate.toISOString() : ''}&endDate=${endDate ? endDate.toISOString() : ''}`;

        const response = await fetch(url, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // const newPlantToColor = new Map<number, string>();
          // plantToColor.forEach((color, plantID) => {
          //   newPlantToColor.set(plantID, color);
          // });
          const newPlantToFilteredPatches = new Map<number, string[]>();
          const otherMatchPatches = new Set<string>();
          data.data.forEach((pair: { plantid: number; patchid: string }) => {
            if (!selectedPlants.some(plant => plant.plantID === pair.plantid)) {
              otherMatchPatches.add(pair.patchid);
              return;
            }

            if (!plantToColor.has(pair.plantid)) {
              const color = randomColor({
                luminosity: 'bright',
                hue: 'random',
              });
              plantToColor.set(pair.plantid, color);
            }
            if (!newPlantToFilteredPatches.has(pair.plantid)) {
              newPlantToFilteredPatches.set(pair.plantid, []);
            }
            newPlantToFilteredPatches.get(pair.plantid)?.push(pair.patchid);
          });

          const newPatchesToColors = new Map<string, string[]>();
          newPlantToFilteredPatches.forEach((patches, plantID) => {
            const color = plantToColor.get(plantID);
            if (color) {
              patches.forEach(patch => {
                if (!newPatchesToColors.has(patch)) {
                  newPatchesToColors.set(patch, []);
                }
                newPatchesToColors.get(patch)?.push(color);
              });
            }
          });
          const grayColor = '#FFFF00';
          otherMatchPatches.forEach(patch => {
            if (!newPatchesToColors.has(patch)) {
              newPatchesToColors.set(patch, []);
              newPatchesToColors.get(patch)?.push(grayColor);
            }
          });
          setPatchesToColors(newPatchesToColors);
        } else {
          toast.error('Error: Unable to filter patches');
          setPatchesToColors(new Map<string, string[]>());
          setPlantToColor(new Map<number, string>());
          setSelectedPlants([]);
          return;
        }
      } catch {
        toast.error('Error: Unable to filter patches');
        setPatchesToColors(new Map<string, string[]>());
        setPlantToColor(new Map<number, string>());
        setSelectedPlants([]);
        return;
      }
    };

    fetchHighlightedPatches();
  }, [
    selectedPlants,
    beginDate,
    endDate,
    latest,
    soilList,
    plantToColor,
    setPlantToColor,
    setPatchesToColors,
  ]);

  const clearFilters = () => {
    setBeginDate(null);
    setEndDate(null);
    setSelectedPlants([]);
    setLatest(true);
    setSearchTerm('');
    setSoilList(['Sand', 'Pond', 'Sandy Loam']);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md z-12 overflow-y-auto">
      <h2 className="text-lg font-semibold">Filter Patches for Snapshots</h2>

      <Button onClick={() => setFiltersOn(!filtersOn)} className="w-full mt-3">
        {filtersOn ? 'Disable Filtering' : 'Enable Filtering'}
      </Button>

      {filtersOn && (
        <div>
          <div className="flex items-center justify-between mt-4 mb-2">
            <h3>Patches Found: {patchesToColors.size}</h3>

            <Button onClick={clearFilters} variant="outline" className="p-2">
              Clear Filters
            </Button>
          </div>
          {selectedPlants.length === 0 && (
            <div className="flex items-center justify-between border-b border-t border-gray-300 py-2 mb-4">
              <div>Non-plant Matching Patches</div>
              <div
                className="h-4 w-4"
                style={{
                  backgroundColor: 'yellow',
                }}
              ></div>
            </div>
          )}

          <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
            <h3 className="text-left mb-3"> Dates Filtering</h3>

            <RadioGroup value={String(latest)} onValueChange={value => setLatest(value === 'true')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="r1" />
                <Label className="font-primary text-primary-dark-grey" htmlFor="r1">
                  Find on latest patch state
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="r2" />
                <Label className="font-primary text-primary-dark-grey" htmlFor="r2">
                  Find from date range
                </Label>
              </div>
            </RadioGroup>
            {!latest && (
              <div className="mt-3">
                <DatePicker
                  date={beginDate}
                  setDate={setBeginDate}
                  pickerName="From"
                  className="p-2 w-[100px] h-[28px]"
                  displayFormat="MM/dd/yyyy"
                />
                -
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  pickerName="To"
                  className="p-2 w-[100px] h-[28px]"
                  displayFormat="MM/dd/yyyy"
                />
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
                    <div
                      className="h-4 w-4"
                      style={{
                        backgroundColor: plantToColor.get(plant.plantID) || 'white',
                      }}
                    ></div>
                    <div>{plant.plantCommonName}</div>
                    
                    <div>
                      <button
                      onClick={() => {
                        const newColor = randomColor({
                          luminosity: 'bright',
                          hue: 'random',
                        });
                        setPlantToColor(new Map(plantToColor.set(plant.plantID, newColor)));
                      }}
                    >
                      <RefreshCw className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedPlants(selectedPlants.filter(p => p.plantID !== plant.plantID))
                      }
                    >
                      <X className="h-4 w-4 ml-1 text-red-500 hover:text-red-700" />
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[300px] border border-gray-300 rounded-lg p-4 bg-white mt-4">
            <h3 className="text-left mb-3">Soil Types</h3>

            <div className="flex flex-col space-y-2">
              {['Sand', 'Pond', 'Sandy Loam'].map(soil => (
                <label key={soil} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={soil}
                    checked={soilList.includes(soil)}
                    onChange={e => {
                      const value = e.target.value;
                      if (e.target.checked) {
                        setSoilList([...soilList, value]);
                      } else {
                        setSoilList(soilList.filter(s => s !== value));
                      }
                    }}
                  />
                  <span>{soil}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
