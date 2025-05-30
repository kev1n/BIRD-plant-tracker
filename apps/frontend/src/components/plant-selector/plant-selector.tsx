import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popoverDialog';
import { cn } from '@/lib/utils';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PlantInfo } from 'types/database_types';
import { getCategoryIcon } from '../observations/category-icon';
import DeletePlantButton from './delete-plant-button';
import NewPlantFormDialog from './new-plant-form-dialog';

interface PlantSelectorProps {
  value?: PlantInfo | null;
  onValueChange: (plant: PlantInfo | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  initialSearchTerm?: string;
}

export default function PlantSelector({
  value,
  onValueChange,
  placeholder = 'Select plant',
  className,
  disabled = false,
  autoFocus = false,
  initialSearchTerm = '',
}: PlantSelectorProps) {
  const [plants, setPlants] = useState<PlantInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [open, setOpen] = useState(false);

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

  const handlePlantSelect = (plant: PlantInfo) => {
    onValueChange(plant);
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && autoFocus) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            'w-[400px] justify-between',
            !value && 'text-muted-foreground',
            className
          )}
        >
          {value?.plantCommonName || placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Begin typing to search..."
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
            autoFocus={autoFocus}
          />
          
          <CommandList>
            <CommandEmpty>No plants found.</CommandEmpty>
            <CommandGroup>
              {plants.map(plant => (
                <CommandItem
                  value={plant.plantCommonName}
                  key={plant.plantID}
                  onSelect={() => handlePlantSelect(plant)}
                  className="flex items-start justify-between p-3 cursor-pointer hover:bg-accent"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground min-w-32">
                        {plant.plantCommonName}
                      </span>
                      {plant.isNative !== null && (
                        <Badge 
                          variant={plant.isNative ? "native" : "nonnative"}
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
  );
} 