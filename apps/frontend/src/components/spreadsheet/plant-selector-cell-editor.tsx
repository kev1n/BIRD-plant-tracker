import { ICellEditorParams } from 'ag-grid-community';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { PlantInfo } from 'types/database_types';
import PlantSelector from '../plant-selector/plant-selector';

export interface PlantSelectorCellEditorRef {
  getValue: () => PlantInfo | string;
  isPopup: () => boolean;
}

interface PlantSelectorCellEditorProps extends Partial<ICellEditorParams> {
  value: string;
  onValueChange?: (value: string) => void;
  charPress?: string;
  cellStartedEdit?: boolean;
}

const PlantSelectorCellEditor = forwardRef<PlantSelectorCellEditorRef, PlantSelectorCellEditorProps>(
  ({ value: initialValue, cellStartedEdit, charPress, ...props }, ref) => {
    const [selectedPlant, setSelectedPlant] = useState<PlantInfo | null>(null);
    const [value, setValue] = useState(initialValue || '');
    
    // Use ref for immediate synchronous access in getValue()
    const selectedPlantRef = useRef<PlantInfo | null>(null);
    const hasSelectedPlant = useRef<boolean>(false);

    useImperativeHandle(ref, () => ({
      // Return the full plant object if selected, otherwise return the string value
      getValue: () => {
        if (hasSelectedPlant.current && selectedPlantRef.current) {
          return selectedPlantRef.current;
        }
        return value;
      },
      isPopup: () => true,
    }));

    // Auto-focus and set initial search term when cell starts editing
    const shouldAutoFocus = cellStartedEdit || false;
    const initialSearchTerm = charPress || '';

    const handlePlantSelect = (plant: PlantInfo | null) => {
      if (plant) {
        setValue(plant.plantCommonName);
        setSelectedPlant(plant);
        // Store in ref immediately for synchronous access
        selectedPlantRef.current = plant;
        hasSelectedPlant.current = true;
        
        // Let the grid handle stopping the edit naturally
        // Don't call stopEditing here - let the user finish their selection
      }
    };

    // Try to find the plant that matches the current value from the data
    useEffect(() => {
      if (initialValue && props.data?.PlantInfo) {
        setSelectedPlant(props.data.PlantInfo);
        selectedPlantRef.current = props.data.PlantInfo;
        setValue(props.data.PlantInfo.plantCommonName);
        hasSelectedPlant.current = false; // This is existing data, not a new selection
      }
    }, [initialValue, props.data]);

    return (
      <div className="w-full h-full flex items-center">
        <PlantSelector
          value={selectedPlant}
          onValueChange={handlePlantSelect}
          placeholder="Select plant..."
          className="w-full h-full border-none bg-transparent hover:bg-accent"
          autoFocus={shouldAutoFocus}
          initialSearchTerm={initialSearchTerm}
        />
      </div>
    );
  }
);

PlantSelectorCellEditor.displayName = 'PlantSelectorCellEditor';

export default PlantSelectorCellEditor; 