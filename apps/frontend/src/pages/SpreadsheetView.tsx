import { AllCommunityModule, ColDef, iconSetMaterial, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import { Observation } from 'types/database_types';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

type ObservationRow = {
  "Observation Date": string;
  Observer: string;
  "Patch ID": string;
  "Plant Quantity": number;
  "Common Name": string;
  "Scientific Name": string | null;
  "Date Planted": string | null;
  "Native?": boolean | null;
  "Has Bloomed": boolean | null;
  Subcategory: "tree" | "shrub" | "grass" | "other" | null;
  Notes: string | null;
};

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
      valueGetter: (params: any) => params.data?.Snapshots?.dateCreated || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center', // Centers the header
      cellStyle: { textAlign: 'center' }, // Centers the cell content
    },
    { 
      field: "Observer Name",
      valueGetter: (params: any) => params.data?.Snapshots?.users?.username || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Patch ID",
      valueGetter: (params: any) => params.data?.Snapshots?.patchID || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Plant Quantity",
      valueGetter: (params: any) => params.data?.plantQuantity,
      sortable: true,
      filter: true,
      type: 'numericColumn',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Plant Common Name",
      valueGetter: (params: any) => params.data?.PlantInfo?.plantCommonName || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Plant Scientific Name",
      valueGetter: (params: any) => params.data?.PlantInfo?.plantScientificName || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Date Planted",
      valueGetter: (params: any) => params.data?.datePlanted || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "isNative",
      valueGetter: (params: any) => params.data?.PlantInfo?.isNative,
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Has Bloomed",
      valueGetter: (params: any) => params.data?.hasBloomed,
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Subcategory",
      valueGetter: (params: any) => params.data?.PlantInfo?.subcategory || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
    },
    { 
      field: "Additional Notes",
      valueGetter: (params: any) => params.data?.Snapshots?.notes || '',
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
