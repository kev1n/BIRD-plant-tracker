import { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import { createRoot, Root } from 'react-dom/client';
import { PlantInfo } from 'types/database_types';
import PlantSelector from '../plant-selector/plant-selector';

export default class PlantSelectorCellEditor implements ICellEditorComp {
  private eGui!: HTMLDivElement;
  private reactRoot!: Root;
  private value: PlantInfo | string = '';
  private selectedPlant: PlantInfo | null = null;
  private hasSelectedNewPlant: boolean = false;
  private params!: ICellEditorParams;

  init(params: ICellEditorParams): void {
    this.params = params;
    this.value = params.value || '';

    // Create the GUI
    this.eGui = document.createElement('div');
    this.eGui.className = 'w-full h-full flex items-center';
    this.eGui.style.height = '100%';
    this.eGui.style.width = '100%';

    // Initialize with existing plant data if available
    if (params.data?.PlantInfo) {
      this.selectedPlant = params.data.PlantInfo;
      this.value = params.data.PlantInfo.plantCommonName;
      this.hasSelectedNewPlant = false;
    }

    // Create React root and render the PlantSelector
    this.reactRoot = createRoot(this.eGui);
    this.renderComponent();
  }

  private renderComponent(): void {
    const handlePlantSelect = (plant: PlantInfo | null) => {
      if (plant) {
        this.selectedPlant = plant;
        this.value = plant; // Store the full PlantInfo object
        this.hasSelectedNewPlant = true;
        
        // Stop editing after selection
        setTimeout(() => {
          if (this.params.stopEditing) {
            this.params.stopEditing();
          }
        }, 100);
      }
    };

    const shouldAutoFocus = this.params.cellStartedEdit || false;
    const initialSearchTerm = this.params.eventKey || '';

    this.reactRoot.render(
      <PlantSelector
        value={this.selectedPlant}
        onValueChange={handlePlantSelect}
        placeholder="Select plant..."
        className="w-full h-full border-none bg-transparent hover:bg-accent"
        autoFocus={shouldAutoFocus}
        initialSearchTerm={initialSearchTerm}
      />
    );
  }

  getGui(): HTMLElement {
    return this.eGui;
  }

  getValue(): PlantInfo | string {
    // Return the full plant object if user selected a new plant, otherwise return the string value
    if (this.hasSelectedNewPlant && this.selectedPlant) {
      return this.selectedPlant;
    }
    return typeof this.value === 'string' ? this.value : (this.selectedPlant?.plantCommonName || '');
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
    return 'over';
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  focusIn(): void {
    // Focus is handled by the PlantSelector component
  }

  focusOut(): void {
    // Focus is handled by the PlantSelector component
  }

  afterGuiAttached(): void {
    // This is called after the GUI is attached to the DOM
    // Focus is already handled by the PlantSelector autoFocus prop
  }
} 