import SpreadsheetRowActionItem from '@/components/spreadsheet/spreadsheet-row-action-item';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AllCommunityModule, ColDef, iconSetMaterial, ModuleRegistry, themeQuartz, ValueGetterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { Observation, Snapshot } from 'types/database_types';

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
      toast.error("Failed to load observations.");
    }
  }

  // fetch initial observations from backend
  useEffect(() => {
    fetchData();
  }, []);


// TODO: eventually need to abstract these functions into another file
// Also: remove fetchData from these function calls and do that manually when the dialog buttons are clicked.

// Delete an observation entirely. This erases it from the associated snapshot, 
// as if this observation was never made.
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
    toast("Observation deleted successfully.");

  } catch (error) {
    console.error("Error deleting observation:", error);
    toast.error("Failed to delete observation.");
  }
}

// Delete an observation from a newly duplicated snapshot. This is for situations where
// an observation *was* accurate for a time, and is not representative anymore. This preserves the
// integrity of all other observations that are still in the snapshot.
async function duplicateSnapshotAndDeleteObservation(obsID: number, snapshotID: number) {
  try {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

    // Step 1: Get all observations from this snapshot
    const getSnapshotObsApiPath = `${baseUrl}/observation/all/${snapshotID}`;
    const snapshotObsResponse = await fetch(getSnapshotObsApiPath, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!snapshotObsResponse.ok) {
      throw new Error("Failed to get snapshot observations");
    }

    const snapshotObsData = await snapshotObsResponse.json();

    console.log("observations: ", snapshotObsData);
    
    // exclude the one we're deleting
    const observations = snapshotObsData.observations.filter((obs: Observation) => obs.observationID !== obsID);

    console.log("filtered obs: ", observations);

    // Step 2: Get actual snapshot
    const getSnapshotPath = `${baseUrl}/snapshot/${snapshotID}`;
    const snapshotResponse = await fetch(getSnapshotPath, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!snapshotResponse.ok) {
      throw new Error("Failed to get snapshot");
    }

    const snapshotData = await snapshotResponse.json();
    console.log(snapshotData);
    const snapshot: Snapshot = snapshotData.data;

    // Step 3: Create a new snapshot (duplicate of the original)
    const createSnapshotApiPath = `${baseUrl}/snapshot`;
    const createSnapshotResponse = await fetch(createSnapshotApiPath, {
      method: "POST",
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateCreated: new Date().toISOString(),
        userID: snapshot.userID,
        patchID: snapshot.patchID,
        notes: snapshot.notes
      })
    });

    if (!createSnapshotResponse.ok) {
      throw new Error("Failed to create new snapshot");
    }

    const newSnapshotData = await createSnapshotResponse.json();
    const newSnapshotID = newSnapshotData.snapshotID.snapshotID;

    // Step 4: Create new observations in the new snapshot for each observation except the excluded one
    for (const obs of observations) {
      await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshotID: newSnapshotID,
          plantQuantity: obs.plantQuantity,
          plantID: obs.plantID,
          hasBloomed: obs.hasBloomed,
          datePlanted: obs.datePlanted
        })
      });
    }

    // Refresh data to show the changes
    fetchData();
    toast("Snapshot duplicated and observation removed successfully.");
    
  } catch (error) {
    console.error("Error during snapshot duplication:", error);
    toast.error("Failed to duplicate snapshot and remove observation.");
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
    toast("Observation duplicated successfully.");
    
  } catch (error) {
    console.error("Error duplicating observation:", error);
    toast.error("Failed to duplicate observation.");
  }
}

// duplicates the observation into a new, mostly blank snapshot.
async function duplicateObservationEmptySnapshot(obsData: Observation) {
  try {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

    // Get snapshot associated with this observation
    const snapshotResponse = await fetch(`${baseUrl}/snapshot/${obsData.snapshotID}`, {
      method: "GET",
      credentials: 'include', 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!snapshotResponse.ok) {
      throw new Error("Failed to get snapshot");
    }

    const snapshotData = await snapshotResponse.json();
    const snapshot = snapshotData.data;

    // create new snapshot. Defaults to same date, user, and patch as original.
    const snapshotDupResponse = await fetch(`${baseUrl}/snapshot`, {
      method: "POST",
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateCreated: new Date().toISOString(),
        userID: snapshot.userID,
        patchID: snapshot.patchID,
      }),
    });

    if (!snapshotDupResponse.ok) {
      throw new Error("Failed to duplicate snapshot");
    }

    const newSnapshotData = await snapshotDupResponse.json();
    const newSnapshotID = newSnapshotData.snapshotID.snapshotID;

    // copy the single observation into the new snapshot
    const copyObservationResponse = await fetch(`${baseUrl}/observation`, {
      method: "POST",
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snapshotID: newSnapshotID,
        plantQuantity: obsData.plantQuantity,
        plantID: obsData.PlantInfo.plantID,
        hasBloomed: obsData.hasBloomed,
        datePlanted: obsData.datePlanted
      })
    });

    if (!copyObservationResponse.ok) {
      throw new Error("Failed to duplicate observation");
    }

    fetchData();
    toast("Observation duplicated into new empty snapshot successfully.");
  } catch (error) {
    console.error("Error duplicating observation to empty snapshot:", error);
    toast.error("Failed to duplicate observation to empty snapshot.");
  }
}

// duplicate entire snapshot, including making duplicates of all observations
async function duplicateSnapshot(snapID: number) {
  try {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

    // Step 1: Get all observations from this snapshot
    const getSnapshotObsApiPath = `${baseUrl}/observation/all/${snapID}`;
    const snapshotObsResponse = await fetch(getSnapshotObsApiPath, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!snapshotObsResponse.ok) {
      throw new Error("Failed to get snapshot observations");
    }

    const snapshotObsData = await snapshotObsResponse.json();
    const observations = snapshotObsData.observations;

    // Step 2: Get actual snapshot
    const getSnapshotPath = `${baseUrl}/snapshot/${snapID}`;
    const snapshotResponse = await fetch(getSnapshotPath, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!snapshotResponse.ok) {
      throw new Error("Failed to get snapshot");
    }

    const snapshotData = await snapshotResponse.json();
    const snapshot: Snapshot = snapshotData.data;

    // Step 3: Create a new snapshot (duplicate of the original, with the current date)
    const createSnapshotApiPath = `${baseUrl}/snapshot`;
    const createSnapshotResponse = await fetch(createSnapshotApiPath, {
      method: "POST",
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // user can edit the date anyways, 
        // can help distinguish the copy from the original
        dateCreated: new Date().toISOString(), 
        userID: snapshot.userID,
        patchID: snapshot.patchID,
        notes: snapshot.notes
      })
    });

    if (!createSnapshotResponse.ok) {
      throw new Error("Failed to create new snapshot");
    }

    const newSnapshotData = await createSnapshotResponse.json();
    const newSnapshotID = newSnapshotData.snapshotID.snapshotID; // I do not know

    // Step 4: Create new observations in the new snapshot for each observation
    for (const obs of observations) {
      const duplicateObsResponse = await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshotID: newSnapshotID,
          plantQuantity: obs.plantQuantity,
          plantID: obs.plantID,
          hasBloomed: obs.hasBloomed,
          datePlanted: obs.datePlanted
        })
      });

      if (!duplicateObsResponse) {
        throw new Error("Failed to duplicate observation to new snapshot");
      }
    }

    // Refresh data to show the changes
    fetchData();
    toast("Entire snapshot duplicated successfully.");
    
  } catch (error) {
    console.error("Error during snapshot duplication:", error);
    toast.error("Failed to duplicate snapshot.");
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
      headerName: "",
      width: 60,
      resizable: false,
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

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Duplicate
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <SpreadsheetRowActionItem
                actionName="Duplicate Observation"
                prompt="Are you sure you want to DUPLICATE this observation?"
                color=""
                onConfirm={() => {if (params.data) { duplicateObservation(params.data); }}}
              />

              <SpreadsheetRowActionItem
                actionName="Duplicate into New Empty Snapshot"
                prompt="Are you sure you want to DUPLICATE this observation into an EMPTY SNAPSHOT?"
                color=""
                onConfirm={() => { if (params.data) { duplicateObservationEmptySnapshot(params.data); }}}
              />

              <SpreadsheetRowActionItem
                actionName="Duplicate Entire Snapshot"
                prompt="Are you sure you want to DUPLICATE the ENTIRE SNAPSHOT?"
                color=""
                onConfirm={() => { 
                  if (params.data?.snapshotID) { 
                    duplicateSnapshot(params.data?.snapshotID); 
                  }
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Delete
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <SpreadsheetRowActionItem
                actionName="Delete Observation"
                prompt="Are you sure you want to DELETE this observation?" 
                color="red"
                onConfirm={() => {
                  const obsID = params.data?.observationID || -1;
                  if (obsID === -1) { return; }
                  deleteObservation(obsID);
                }}
              />

              <SpreadsheetRowActionItem
                actionName="Remove from Snapshot Copy"
                prompt="Are you sure you want to DUPLICATE the snapshot WITHOUT THIS OBSERVATION?"
                color="red"
                onConfirm={() => {
                  const obsID = params.data?.observationID || -1;
                  const snapID = params.data?.snapshotID || -1;
                  if (obsID === -1 || snapID === -1) { return; }
                  duplicateSnapshotAndDeleteObservation(obsID, snapID);
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

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
    <div className="flex flex-col h-full py-4">
      <div className="h-full">
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
