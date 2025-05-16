import { AllCommunityModule, ColDef, iconSetMaterial, ModuleRegistry, themeQuartz, ValueGetterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import { Observation } from 'types/database_types';
import { EllipsisVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SpreadsheetRowActionItem from '@/components/spreadsheet/spreadsheet-row-action-item';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SpreadSheetView() {
  const [rowData, setRowData] = useState<Observation[]>();
  
  // Function to get all observations on intial rendering, and after editing the spreadsheet
  // Should token and baseUrl be abstracted out of the function?
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

  // fetch initial observations from backend
  useEffect(() => {
    fetchData();
  }, []);

async function deleteObservation(obsID: number) {
  try {
    // call to endpoint
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const apiPath = `${baseUrl}/observation/${obsID}`;
    const response = await fetch(apiPath, {
      method: "DELETE",
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("failed to delete observation");
    }

    // Refresh data to show deletion
    fetchData();

  } catch (error) {
    console.error("Error duplicating observation:", error);
  }
}

// take observationData and duplicate the relevant data in the Observations table
// does not need to duplicate data referenced by foreign keys
async function duplicateObservation(obsData: Observation) {
  try {
    // call to endpoint
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const apiPath = `${baseUrl}/observation`;
    
    const response = await fetch(apiPath, {
      method: "POST",
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snapshotID: obsData.snapshotID,
        plantQuantity: obsData.plantQuantity,
        plantID: obsData.PlantInfo.plantID,
        hasBloomed: obsData.hasBloomed,
        datePlanted: obsData.datePlanted
      })
    });

    if (!response.ok) {
      throw new Error("Failed to duplicate observation");
    }

    // Refresh the data to show new observation
    fetchData();
    
  } catch (error) {
    console.error("Error duplicating observation:", error);
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
      field: "Options",
      cellRenderer: (params: ValueGetterParams<Observation>) => 
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className="flex w-full h-full justify-center items-center">
            <EllipsisVertical />
            </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem>
            Edit
          </DropdownMenuItem>  

          <SpreadsheetRowActionItem
            actionName="Duplicate"
            prompt="Are you sure you want to duplicate this observation?"
            onConfirm={() => {if (params.data) { duplicateObservation(params.data); }}}
          />

          <SpreadsheetRowActionItem 
            actionName="Delete"
            prompt="Are you sure you want to delete this observation?" 
            onConfirm={() => {
              const obsID = params.data?.observationID || -1;
              if (obsID === -1) { return; }
              deleteObservation(obsID);
            }}
          />

        </DropdownMenuContent>  
      </DropdownMenu>,
      headerClass: 'ag-header-cell-center',
      cellStyle: {textAlign: 'center'}
    },
    { 
      field: "Observation Date",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.dateCreated || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center', // Centers the header
      cellStyle: { textAlign: 'center' }, // Centers the cell content
    },
    { 
      field: "Observer Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.users?.username || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
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
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.datePlanted || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
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
        />
      </div>
    </div>
  );
}
