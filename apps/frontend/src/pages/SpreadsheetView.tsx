import { AllCommunityModule, CellValueChangedEvent, ColDef, iconSetMaterial, ModuleRegistry, themeQuartz, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import { Observation, updatedObservation } from 'types/database_types';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SpreadSheetView() {
  const [rowData, setRowData] = useState<Observation[]>();

  // fetch initial observations from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // call to endpoint
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const apiPath = `${baseUrl}/get-observation`;
        const response = await fetch(apiPath, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch observations');
        }

        const data = await response.json();
        const real = data["data"];

        setRowData(real);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  const commitUpdate = async (e: CellValueChangedEvent) => {
    try {
      const updatedRow: Observation = e.data;

      const obsID = updatedRow.observationID;

      const updates: updatedObservation = {
        plantQuantity: updatedRow.plantQuantity,
        hasBloomed: updatedRow.hasBloomed,
        datePlanted: updatedRow.datePlanted
      };

      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const apiPath = `${baseUrl}/observation/${obsID}`;
      const response = await fetch(apiPath, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }
    } catch (error){
      console.error("Error:", error);
    }
  }

  
  // const handleAddRow = () => {
  //   const newRow = {
  //     Observer: "",
  //     "Obs Date": "",
  //     Patch: "",
  //     "Common Name": "",
  //     "Native?": "",
  //     "Bloom Date": "",
  //     isEditable: true // custom flag
  //   };
  
  //   setRowData(prev => [
  //     ...prev.slice(0, -1),
  //     newRow,
  //     prev[prev.length - 1] // "+ADD" row
  //   ]);
  // };
  
  const colDefs: ColDef[] = [
    { 
      field: "Observation Date",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.dateCreated || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center', // Centers the header
      cellStyle: { textAlign: 'center' }, // Centers the cell content
      editable: true,
      cellEditor: 'agDateCellEditor',
    },
    { 
      field: "Observer Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.users?.username || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: true,
      cellEditor: 'agTextCellEditor',
    },
    { 
      field: "Patch ID",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.patchID || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Plant Quantity",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.plantQuantity,
      sortable: true,
      filter: true,
      type: 'numericColumn',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: true,
      cellEditor: 'agNumberCellEditor',
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.plantQuantity;
        const newValue = params.newValue;
        // only do anything if it actually changed:
        if (newValue !== oldValue) {
          params.data.plantQuantity = newValue;
          return true;    // tells AG-Grid “I applied the change”
        }
        return false;     // “nothing changed, revert to oldValue”
      },
    },
    { 
      field: "Plant Common Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.plantCommonName || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Plant Scientific Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.plantScientificName || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Date Planted",
      cellDataType: 'dateString',
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.datePlanted || null,
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: true,
      cellEditor: 'agDateStringCellEditor',
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.datePlanted;
        const newValue = params.newValue;
        // only do anything if it actually changed:
        if (newValue !== oldValue) {
          params.data.datePlanted = newValue;
          return true;    // tells AG-Grid “I applied the change”
        }
        return false;     // “nothing changed, revert to oldValue”
      },
    },
    { 
      field: "isNative",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.isNative,
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Has Bloomed",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.hasBloomed,
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['true', 'false']
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.hasBloomed;
        const newValue = params.newValue;
        // only do anything if it actually changed:
        if (newValue !== oldValue) {
          params.data.hasBloomed = newValue;
          return true;    // tells AG-Grid “I applied the change”
        }
        return false;     // “nothing changed, revert to oldValue”
      },
    },
    { 
      field: "Subcategory",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.subcategory || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Additional Notes",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.notes || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    }
  ];  

  
  
  // AG Grid Theme
  const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams({
      accentColor: "#374F31",
      backgroundColor: "#FFFFFF",
      borderColor: "#000000",
      browserColorScheme: "dark",
      chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor"
      },
      columnBorder: true,
      foregroundColor: "#000000",
      headerBackgroundColor: "#799A1888",
      headerFontFamily: "inherit",
      headerFontSize: 14
    });

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="h-[40%]">
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          pagination={true}
          paginationAutoPageSize={true}
          theme={myTheme}
          onCellValueChanged={commitUpdate}
        />
      </div>
    </div>
  );
}
