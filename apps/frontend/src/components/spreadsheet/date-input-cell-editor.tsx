import { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import { Check, X } from 'lucide-react';
import { createRoot, Root } from 'react-dom/client';
import { Button } from '../ui/button';
import { DateInput } from '../ui/date-input';

export default class DateInputCellEditor implements ICellEditorComp {
  private eGui!: HTMLDivElement;
  private reactRoot!: Root;
  private value: Date | null = null;
  private params!: ICellEditorParams;

  init(params: ICellEditorParams): void {
    this.params = params;
    
    // Parse the initial value - it could be a Date object, ISO string, or null
    this.value = this.parseDate(params.value);

    // Create the GUI with higher z-index and better positioning
    this.eGui = document.createElement('div');
    this.eGui.className = 'relative';
    this.eGui.style.zIndex = '9999';
    this.eGui.style.marginTop = '10px';

    // Create React root and render the component
    this.reactRoot = createRoot(this.eGui);
    this.renderComponent();
  }

  private parseDate(value: Date | string | number | null | undefined): Date | null {
    if (!value) return null;
    
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    
    if (typeof value === 'string') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    // Try to handle timestamp numbers
    if (typeof value === 'number') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    
    return null;
  }

  // Force re-render by calling renderComponent again
  private updateComponent(): void {
    this.renderComponent();
  }

  private renderComponent(): void {
    const handleDateChange = (date: Date | null) => {
      this.value = date;
      this.updateComponent();
    };

    const handleConfirm = () => {
      if (this.params.stopEditing) {
        this.params.stopEditing();
      }
    };

    const handleCancel = () => {
      this.value = this.parseDate(this.params.value);
      if (this.params.stopEditing) {
        this.params.stopEditing();
      }
    };

    this.reactRoot.render(
      <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-visible mt-2" style={{ zIndex: 9999 }}>
        <div className="p-4 border-b border-gray-100">
          <DateInput
            date={this.value}
            setDate={handleDateChange}
            placeholder="MM/DD/YYYY"
            className="w-full"
          />
        </div>
        
        <div className="p-3 bg-gray-50 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  getGui(): HTMLElement {
    return this.eGui;
  }

  getValue(): Date | null {
    return this.value;
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
    return 'under';
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  focusIn(): void {
    // Focus is handled by the DateInput component
  }

  focusOut(): void {
    // Focus is handled by the DateInput component
  }

  afterGuiAttached(): void {
    // This is called after the GUI is attached to the DOM
  }
} 