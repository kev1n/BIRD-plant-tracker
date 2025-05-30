import { getCategoryIcon } from '@/components/observations/category-icon';
import PlantSelectorCellEditor from '@/components/spreadsheet/plant-selector-cell-editor';
import SpreadsheetRowActionItem from '@/components/spreadsheet/spreadsheet-row-action-item';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PermissionRestrictedDialog from '@/components/utils/PermissionRestrictedDialog';
import {
  AllCommunityModule,
  ColDef,
  GridOptions,
  iconSetMaterial,
  ModuleRegistry,
  RowClassParams,
  themeQuartz,
  ValueGetterParams,
  ValueSetterParams
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Download, EllipsisVertical, Plus, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from "sonner";
import { Observation, PlantInfo, Snapshot, updatedObservation } from 'types/database_types';
import { useUser } from '../hooks/useUser';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SpreadSheetView() {
  const [rowData, setRowData] = useState<Observation[]>();
  const [editingRowId, setEditingRowId] = useState<number|null>(null);
  const [backupRow, setBackupRow] = useState<Observation|null>(null);
  const [isNewObs, setIsNewObs] = useState<number|null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { user } = useUser();
  const gridRef = useRef<AgGridReact>(null);
  
  // Unsaved changes warning effect
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

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
        toast.error(await response.text());
        return;
      }

      const data = await response.json();
      const real = data["data"];

      setRowData(real);

    } catch (error) {
      toast.error(error as string);
    }
  }

  // fetch initial observations from backend
  useEffect(() => {
    fetchData();
  }, []);

  // change the editing state
  const startEdit = (row: Observation) => {
    setEditingRowId(row.observationID);
    setBackupRow({...row});
    setHasUnsavedChanges(true);
  }

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
        toast.error(await response.text());
        return;
      }

      // Refresh data to show deletion
      fetchData();
      toast("Observation deleted successfully.");

    } catch (error) {
      toast.error(error as string);
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
        toast.error(await snapshotObsResponse.text());
        return;
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
        toast.error(await snapshotResponse.text());
        return;
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
        toast.error(await createSnapshotResponse.text());
        return;
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

      // if there was only one observation, then tell the user that they've just created an empty snapshot
      if (observations.length === 0) {
        toast("Observation deleted and duplicated into new snapshot successfully. This snapshot is now empty because it only had the deleted observation prior to deletion.");
      } else {
        toast("Observation deleted and duplicated into new snapshot successfully.");
      }

      // Refresh data to show the changes
      fetchData();
      
    } catch (error) {
      toast.error(error as string);
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
        toast.error(await response.text());
        return;
      }

      // Refresh the data to show new observation
      fetchData();
      
    } catch (error) {
      toast.error(error as string);
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
        toast.error(await snapshotResponse.text());
        return;
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
        toast.error(await snapshotDupResponse.text());
        return;
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
        toast.error(await copyObservationResponse.text());
        return;
      }

      fetchData();
    } catch (error) {
      toast.error(error as string);
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
        toast.error(await snapshotObsResponse.text());
        return;
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
        toast.error(await snapshotResponse.text());
        return;
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
        toast.error(await createSnapshotResponse.text());
        return;
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

        if (!duplicateObsResponse.ok) {
          toast.error(await duplicateObsResponse.text());
          return;
        }
      }

      // Refresh data to show the changes
      fetchData();
      return newSnapshotID;
      toast("Snapshot duplicated and observation removed successfully.");
      
    } catch (error) {
      toast.error(error as string);
    }
  }

  async function duplicateSnapshotWithEdited() {
    if (editingRowId === null || !rowData) return;
    // 1) find the row the user just edited
    const editedRow = rowData.find(r => r.observationID === editingRowId);
    if (!editedRow) {
      toast.error('No edited row found!');
      return;
    }
  
    const token   = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const snapID  = editedRow.snapshotID;
  
    try {
      // 2) get original snapshot metadata
      const getSnapshotPath = `${baseUrl}/snapshot/${snapID}`;
      const snapshotResponse = await fetch(getSnapshotPath, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!snapshotResponse.ok) {
        toast.error(await snapshotResponse.text());
        return;
      }

      const snapshotData = await snapshotResponse.json();
      const snapshot: Snapshot = snapshotData.data;
  
      // 3) get all observations from that snapshot
      const getSnapshotObsApiPath = `${baseUrl}/observation/all/${snapID}`;
      const snapshotObsResponse = await fetch(getSnapshotObsApiPath, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!snapshotObsResponse.ok) {
        toast.error(await snapshotObsResponse.text());
        return;
      }

      const snapshotObsData = await snapshotObsResponse.json();
      const observations = snapshotObsData.observations;
  
      // 4) create the new snapshot
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
        toast.error(await createSnapshotResponse.text());
        return;
      }

      const newSnapshotData = await createSnapshotResponse.json();
      const newSnapshotID = newSnapshotData.snapshotID.snapshotID; // Me neither bro
  
      // 5) re-post every observation, swapping in editedRow for that one ID
      for (const obs of observations) {
        const flag = (obs.observationID === editingRowId);

        const duplicateObsResponse = await fetch(`${baseUrl}/observation`, {
          method: "POST",
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snapshotID: newSnapshotID,
            plantQuantity: flag ? editedRow.plantQuantity : obs.plantQuantity,
            plantID: obs.plantID,
            hasBloomed: flag ? editedRow.hasBloomed : obs.hasBloomed,
            datePlanted: flag ? editedRow.datePlanted : obs.datePlanted
          })
        });

        if (!duplicateObsResponse.ok) {
          toast.error(await duplicateObsResponse.text());
          return;
        }
      }
  
      // 6) finally, refresh your grid & clear edit mode
      fetchData();
      setEditingRowId(null);
      setBackupRow(null);
  
    } catch (err) {
      toast.error(err as string);
    }
  }

  async function newSnapshotWithEdited() {
    if (editingRowId === null || !rowData) return;
    // 1) find the row the user just edited
    const editedRow = rowData.find(r => r.observationID === editingRowId);
    if (!editedRow) {
      toast.error('No edited row found!');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';

      // Get snapshot associated with this observation
      const snapshotResponse = await fetch(`${baseUrl}/snapshot/${editedRow.snapshotID}`, {
        method: "GET",
        credentials: 'include', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!snapshotResponse.ok) {
        toast.error(await snapshotResponse.text());
        return;
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
        toast.error(await snapshotDupResponse.text());
        return;
      }

      const newSnapshotData = await snapshotDupResponse.json();
      const newSnapshotID = newSnapshotData.snapshotID.snapshotID;

      // copy the edited observation into the new snapshot
      const editObservationResponse = await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshotID: newSnapshotID,
          plantQuantity: editedRow.plantQuantity,
          plantID: editedRow.PlantInfo.plantID,
          hasBloomed: editedRow.hasBloomed,
          datePlanted: editedRow.datePlanted
        })
      });

      if (!editObservationResponse.ok) {
        toast.error(await editObservationResponse.text());
        return;
      }

      fetchData();
      setEditingRowId(null);
      setBackupRow(null);
    } catch (error) {
      toast.error(error as string);
    }
  }

  // const commitUpdate = async (e: CellValueChangedEvent) => {
  //   try {
  //     const updatedRow: Observation = e.data;

  //     const obsID = updatedRow.observationID;

  //     const updates: updatedObservation = {
  //       plantQuantity: updatedRow.plantQuantity,
  //       hasBloomed: updatedRow.hasBloomed,
  //       datePlanted: updatedRow.datePlanted
  //     };

  //     const token = localStorage.getItem('authToken');
  //     const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  //     const apiPath = `${baseUrl}/observation/${obsID}`;
  //     const response = await fetch(apiPath, {
  //       method: 'PUT',
  //       credentials: 'include',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(updates),
  //     });

  //     if (!response.ok) {
  //       toast.error(await response.text());
  //       return;
  //     }
  //   } catch (error){
  //     console.error("Error:", error);
  //   }
  // }

  const saveEdit = async () => {
    try {
      const updatedRow = rowData ? rowData.find(r => r.observationID === editingRowId)! : null;

      if (!updatedRow){
        toast.error("Error: edited row not found");
        return;
      }

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
        toast.error(await response.text());
        return;
      }
      
      setEditingRowId(null);
      setBackupRow(null);
      setHasUnsavedChanges(false);
      toast.success("Changes saved successfully!");
    } catch (error) {
      toast.error(error as string);
    }
  };

  const cancelEdit = () => {
    if (backupRow) {
      setRowData(rs => rs ?
        rs.map(r =>
          r.observationID === backupRow.observationID ? backupRow : r
        )
      : rowData);
    }
    setEditingRowId(null);
    setBackupRow(null);
    setHasUnsavedChanges(false);
  };

  const cancelAdd = () => {
    setIsNewObs(null);
    setHasUnsavedChanges(false);
    fetchData();
  };

  const handleAddRow = () => {
    const blank: Observation = {
      tempKey: -1,
      isNew: true,
      modified: false,
      observationID: -1,
      snapshotID:    0,
      PlantInfo: {
        plantID:             0,
        plantCommonName:     'REQUIRED',
        plantScientificName: '',
        isNative:            null,
        subcategory:         '',
      },
      plantQuantity: 0,
      hasBloomed:    null,
      datePlanted:   new Date(),
      Snapshots: {
        dateCreated: new Date().toISOString(),
        patchID:     'REQUIRED',
        notes:       '',
        users:      { username : user ? user.username : '' }
      },
      deletedOn: null
    };
    // append and immediately enter edit mode on it
    setRowData(rds => [blank, ...(rds||[])]);
    setIsNewObs(blank.observationID);
    setHasUnsavedChanges(true);
  };

  async function addNewToRecentSnapshot() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      toast.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      toast.error('Please enter the patch ID for the new observation.');  
      return;
    }

    if (plantName === 'REQUIRED'){
      toast.error('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      toast.error('Please enter plant quantity greater than 0 for the new observation.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const snapshot_response = await fetch(`${baseUrl}/snapshot/patch/${patchID}/latest`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!snapshot_response.ok) {
        toast.error(await snapshot_response.text());
        return;
      }

      const { data: snapshot } = await snapshot_response.json();
      const snapshotID = snapshot.snapshotID;

      const plantUrl = new URL(`${baseUrl}/plants`);
      plantUrl.searchParams.append('name', plantName);
      const plant_response = await fetch(plantUrl.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!plant_response.ok) {
        toast.error(await plant_response.text());
        return;
      }
      
      const { plants } = await plant_response.json();
      
      if (!plants || plants.length === 0) {
        toast.error(`No plant found matching "${plantName}"`);
        return;
      }

      if (plants.length > 1){
        toast.error(`Please enter a more specific plant name. "${plantName}" is not specific enough.`);
        return;
      }

      const plantID = plants[0].plantID;

      const obs_response = await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          snapshotID: snapshotID,
          plantQuantity: newRow.plantQuantity,
          plantID: plantID,
          hasBloomed: newRow.hasBloomed,
          datePlanted: newRow.datePlanted, 
        })
      });

      if (!obs_response.ok) {
        toast.error(await obs_response.text());
        return;
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
      toast.error(error as string);
    }
  }

  async function duplicateSnapshotWithNew() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      toast.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      toast.error('Please enter the patch ID for the new observation.');
      return;
    }

    if (plantName === 'REQUIRED'){
      toast.error('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      toast.error('Please enter plant quantity greater than 0 for the new observation.');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const snapshot_response = await fetch(`${baseUrl}/snapshot/patch/${patchID}/latest`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!snapshot_response.ok) {
        toast.error(await snapshot_response.text());
        return;
      }

      const { data: snapshot } = await snapshot_response.json();
      const snapshotID = snapshot.snapshotID;

      const plant_response = await fetch(`${baseUrl}/plants/name/${plantName}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!plant_response.ok) {
        toast.error(await plant_response.text());
        return;
      }
      
      const { plant } = await plant_response.json();
      
      if (!plant) {
        toast.error(`No plant found matching "${plantName}"`);
        return;
      }
      const plantID = plant.plantID;

      const newSnapshotID = await duplicateSnapshot(snapshotID);

      const obs_response = await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          snapshotID: newSnapshotID,
          plantQuantity: newRow.plantQuantity,
          plantID: plantID,
          hasBloomed: newRow.hasBloomed,
          datePlanted: newRow.datePlanted, 
        })
      });

      if (!obs_response.ok) {
        toast.error(await obs_response.text());
        return;
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
      toast.error(error as string);
    }
  }

  async function newSnapshotWithNewObs() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      toast.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      toast.error('Please enter the patch ID for the new observation.');
      return;
    }

    if (plantName === 'REQUIRED'){
      toast.error('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      toast.error('Please enter plant quantity greater than 0 for the new observation.');
      return;
    }

    if (!user) {
      toast.error('Please log in to access this feature');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const snapshot_response = await fetch(`${baseUrl}/snapshot`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateCreated: new Date().toISOString(), 
          userID: user.id,
          patchID: patchID,
          notes: newRow.Snapshots ? newRow.Snapshots.notes : null
        })
      });

      if (!snapshot_response.ok){
        toast.error(await snapshot_response.text());
        return;
      }

      const snapshotData = await snapshot_response.json();
      const snapshotID = snapshotData.snapshotID.snapshotID;

      const plant_response = await fetch(`${baseUrl}/plants/name/${plantName}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!plant_response.ok) {
        toast.error(await plant_response.text());
        return;
      }
      
      const { plant } = await plant_response.json();
      
      if (!plant) {
        toast.error(`No plant found matching "${plantName}"`);
        return;
      }
      const plantID = plant.plantID;

      const obs_response = await fetch(`${baseUrl}/observation`, {
        method: "POST",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snapshotID: snapshotID,
          plantQuantity: newRow.plantQuantity,
          plantID: plantID,
          hasBloomed: newRow.hasBloomed,
          datePlanted: newRow.datePlanted, 
        })
      });

      if (!obs_response.ok) {
        toast.error(await obs_response.text());
        return;
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
      toast.error(error as string);
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
      pinned: 'left',
      cellRenderer: (params: ValueGetterParams<Observation>) => 
      <DropdownMenu>
        <PermissionRestrictedDialog actionName="open actions menu">
          <DropdownMenuTrigger asChild>
              <div className="flex w-full h-full justify-center items-center">
              <EllipsisVertical />
              </div>
          </DropdownMenuTrigger>
        </PermissionRestrictedDialog>

        <DropdownMenuContent>
          <DropdownMenuItem >
            <p className="w-full" onClick={() => { if (params.data) { startEdit(params.data); }}}>
              Edit Observation
            </p>
          </DropdownMenuItem>  

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              Duplicate
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <SpreadsheetRowActionItem
                actionName="Duplicate Observation"
                title="Duplicate Observation"
                prompt="This will create a copy of the observation in the same snapshot as the original observation."
                color=""
                onConfirm={() => {if (params.data) { duplicateObservation(params.data); }}}
              />

              <SpreadsheetRowActionItem
                actionName="Duplicate into New Empty Snapshot"
                title="Duplicate Observation into Empty Snapshot"
                prompt="This will create a snapshot containing only this observation. The snapshot can then be edited. Use this when most observations in a snapshot have changed, and you want to capture the new state of the patch."
                color=""
                onConfirm={() => { if (params.data) { duplicateObservationEmptySnapshot(params.data); }}}
              />

              <SpreadsheetRowActionItem
                actionName="Duplicate Entire Snapshot"
                title="Duplicate Entire Snapshot"
                prompt="This will create a copy of the snapshot and all of the observations associated with it. By default, the new snapshot will be set to today's date. The original snapshot remains unchanged. "
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
                title="Delete Observation from Snapshot"
                prompt="This will delete the observation from its snapshot, and cannot be recovered. Only use this when you need to change an observation that was incorrectly recorded. Do not use this if the observation was accurate at some point, but is no longer." 
                color="red"
                onConfirm={() => {
                  const obsID = params.data?.observationID || -1;
                  if (obsID === -1) { return; }
                  deleteObservation(obsID);
                }}
              />

              <SpreadsheetRowActionItem
                actionName="Remove from Snapshot Copy"
                title="Copy snapshot and Delete Observation"
                prompt="This will copy the snapshot containing this observation, without this observation. Use this when a particular observation is no longer accurate, but other observations in the snapshot are still accurate."
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
      cellStyle: {textAlign: 'center'},
      sortable: false,
      filter: false
    },
    { 
      field: "Observation Date",
      headerName: "Observation Date",
      valueGetter: (params: ValueGetterParams<Observation>) => {
        const dateStr = params.data?.Snapshots?.dateCreated;
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      },
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      minWidth: 180,
      flex: 1,
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Observer Name",
      headerName: "Observer",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.users?.username || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      minWidth: 120,
      flex: 1,
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Patch ID",
      headerName: "Patch",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.patchID || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === isNewObs),
      cellEditor: 'agTextCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === isNewObs;
        return {
          textAlign: 'center',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
        };
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        if (!params.data.Snapshots){
          return false;
        }
        const oldValue = params.data.Snapshots?.patchID;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.Snapshots.patchID = newValue;
          return true;
        }
        return false;
      },
      minWidth: 100,
      flex: 0.8,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Plant Quantity",
      headerName: "Quantity",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.plantQuantity,
      sortable: true,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
      cellEditor: 'agNumberCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === editingRowId || params.data.observationID === isNewObs;
        return {
          textAlign: 'center',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
        };
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.plantQuantity;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.plantQuantity = newValue;
          return true;
        }
        return false;
      },
      minWidth: 100,
      flex: 0.8,
      filterParams: {
        filterOptions: ['equals', 'lessThan', 'greaterThan', 'inRange'],
        defaultOption: 'equals'
      }
    },
    { 
      field: "Plant Common Name",
      headerName: "Common Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.plantCommonName || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
      cellEditor: 'plantSelectorCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === editingRowId || params.data.observationID === isNewObs;
        return {
          textAlign: 'center',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
        };
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.PlantInfo.plantCommonName;
        const newValue = params.newValue;
        
        // Check if newValue is a PlantInfo object (from plant selector) or just a string
        if (typeof newValue === 'object' && newValue !== null && 'plantID' in newValue) {
          // Full plant object selected - update all plant fields
          const plantInfo = newValue as PlantInfo;
          params.data.PlantInfo = {
            plantID: plantInfo.plantID,
            plantCommonName: plantInfo.plantCommonName,
            plantScientificName: plantInfo.plantScientificName,
            isNative: plantInfo.isNative,
            subcategory: plantInfo.subcategory,
          };
          
          // Immediately refresh the row to show updated plant-related columns
          if (gridRef.current?.api && params.node) {
            gridRef.current.api.refreshCells({
              rowNodes: [params.node],
              force: true
            });
          }
          return true;
        } else if (typeof newValue === 'string' && newValue !== oldValue) {
          // Just the common name changed
          params.data.PlantInfo.plantCommonName = newValue;
          return true;
        }
        return false;
      },
      minWidth: 150,
      flex: 1.2,
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Plant Scientific Name",
      headerName: "Scientific Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.plantScientificName || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      minWidth: 150,
      flex: 1.2,
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Date Planted",
      headerName: "Date Planted",
      valueGetter: (params: ValueGetterParams<Observation>) => {
        const dateStr = params.data?.datePlanted;
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      },
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
      cellEditor: 'agDateStringCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === editingRowId || params.data.observationID === isNewObs;
        return {
          textAlign: 'center',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
        };
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.datePlanted;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.datePlanted = newValue;
          return true;
        }
        return false;
      },
      minWidth: 120,
      flex: 1,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "isNative",
      headerName: "Native",
      valueGetter: (params: ValueGetterParams<Observation>) => {
        const isNative = params.data?.PlantInfo?.isNative;
        if (isNative === null || isNative === undefined) return 'Unknown';
        return isNative ? 'Yes' : 'No';
      },
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      minWidth: 80,
      flex: 0.6,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Has Bloomed",
      headerName: "Bloomed",
      valueGetter: (params: ValueGetterParams<Observation>) => {
        const hasBloomed = params.data?.hasBloomed;
        if (hasBloomed === null || hasBloomed === undefined) return 'Unknown';
        return hasBloomed ? 'Yes' : 'No';
      },
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
      cellEditor: 'agSelectCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === editingRowId || params.data.observationID === isNewObs;
        return {
          textAlign: 'center',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
        };
      },
      cellEditorParams: {
        values: ['true', 'false']
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.hasBloomed;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.hasBloomed = newValue;
          return true;
        }
        return false;
      },
      minWidth: 90,
      flex: 0.7,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        defaultOption: 'contains'
      }
    },
    { 
      field: "Subcategory",
      headerName: "Category",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.subcategory || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      minWidth: 120,
      flex: 1,
      filterParams: {
        filterOptions: ['contains', 'equals'],
        defaultOption: 'contains'
      },
      cellRenderer: (params: ValueGetterParams<Observation>) => {
        const subcategory = params.data?.PlantInfo?.subcategory;
        if (!subcategory) return '';
        const icon = getCategoryIcon(subcategory);
        return <div className="flex items-center gap-2">
          {icon}{subcategory}
        </div>;
      }
    },
    { 
      field: "Additional Notes",
      headerName: "Notes",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.Snapshots?.notes || '',
      sortable: true,
      filter: 'agTextColumnFilter',
      headerClass: 'ag-header-cell-center',
      editable: params => (params.data.observationID === isNewObs),
      cellEditor: 'agLargeTextCellEditor',
      cellStyle: params => {
        const isEditable = params.data.observationID === isNewObs;
        return {
          textAlign: 'left',
          backgroundColor: isEditable ? '#f0f9ff' : 'transparent',
          ...(isEditable && { border: '2px solid #3b82f6' }),
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          lineHeight: '1.4'
        };
      },
      cellEditorParams: {
        maxLength: 256
      },
      valueSetter: (params: ValueSetterParams<Observation>) => {
        if (!params.data.Snapshots){
          return false;
        }
        const oldValue = params.data.Snapshots.notes;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.Snapshots.notes = newValue;
          return true;
        }
        return false;
      },
      minWidth: 200,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      filterParams: {
        filterOptions: ['contains'],
        defaultOption: 'contains'
      }
    }
  ];  

  // Grid Options for enhanced functionality
  const gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: false,
    },
    components: {
      plantSelectorCellEditor: PlantSelectorCellEditor,
    },
    rowSelection: 'multiple',
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    animateRows: true,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    suppressContextMenu: false,
    allowContextMenuWithControlKey: true,
    autoSizeStrategy: {
      type: 'fitCellContents'
    },
    getRowClass: (params: RowClassParams<Observation>) => {
      if (params.data?.observationID === editingRowId) {
        return 'editing-row';
      }
      if (params.data?.observationID === isNewObs) {
        return 'new-row';
      }
      return '';
    }
  };

  // AG Grid Theme
  const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams({
      accentColor: "#374F31",
      backgroundColor: "#FFFFFF",
      borderColor: "#000000",
      browserColorScheme: "light",
      chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor"
      },
      columnBorder: true,
      foregroundColor: "#000000",
      headerBackgroundColor: "#799A1888",
      headerFontFamily: "inherit",
      headerFontSize: 14,
      rowBorder: true,
      wrapperBorder: true,
      wrapperBorderRadius: "8px",
      cellHorizontalPaddingScale: 0.5,
      rowVerticalPaddingScale: 0.5
    });

  // CSV Export function
  const exportToCsv = () => {
    if (gridRef.current && gridRef.current.api) {
      const params = {
        fileName: `plant-observations-${new Date().toISOString().split('T')[0]}.csv`,
        columnSeparator: ',',
        suppressQuotes: false,
        skipColumnHeaders: false,
        skipColumnGroupHeaders: false,
        skipRowGroups: false,
        skipPinnedTop: false,
        skipPinnedBottom: false,
        allColumns: false,
        onlySelected: false,
        onlySelectedAllPages: false
      };
      gridRef.current.api.exportDataAsCsv(params);
      toast.success("Data exported to CSV successfully!");
    } else {
      toast.error("Export failed: Grid not ready");
    }
  };

  return (
    <div className="flex flex-col h-full py-4">
      {/* Custom CSS for row styling */}
      <style>{`
        .editing-row {
          background-color: #dbeafe !important;
          border: 2px solid #3b82f6 !important;
        }
        .new-row {
          background-color: #dcfce7 !important;
          border: 2px solid #16a34a !important;
        }
        .ag-floating-filter-input {
          font-size: 12px;
        }
        .ag-header-cell-menu-button {
          opacity: 0.7;
        }
        .ag-header-cell-menu-button:hover {
          opacity: 1;
        }
      `}</style>

      {/* Unsaved Changes Alert & Save Actions Bar */}
      

      {/* Save Actions for Editing */}
      {editingRowId != null && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">Editing Observation</h3>
              <span className="text-sm text-blue-700">Choose how to save your changes:</span>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => saveEdit()}>
                <Save className="h-4 w-4 mr-1" />
                Save to Current Snapshot
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Save with Snapshot Copy
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <h2 className="text-lg font-semibold">Duplicate Snapshot & Save</h2>
                    <p className="text-sm text-gray-600">
                      This will create a copy of the entire snapshot with your changes. 
                      The original snapshot remains unchanged, preserving historical data.
                    </p>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => duplicateSnapshotWithEdited()}>
                      Create Copy & Save
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Save to New Snapshot
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <h2 className="text-lg font-semibold">Create New Snapshot</h2>
                    <p className="text-sm text-gray-600">
                      This will create a completely new snapshot containing only your edited observation.
                      Use this when the change represents a new state, not a correction.
                    </p>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => newSnapshotWithEdited()}>
                      Create New Snapshot
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" onClick={() => cancelEdit()}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Actions for New Observation */}
      {isNewObs != null && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-medium text-green-800">Adding New Observation</h3>
              <span className="text-sm text-green-700">Choose where to save this observation:</span>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => addNewToRecentSnapshot()}>
                <Save className="h-4 w-4 mr-1" />
                Add to Recent Snapshot
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Add to Snapshot Copy
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <h2 className="text-lg font-semibold">Duplicate Snapshot & Add</h2>
                    <p className="text-sm text-gray-600">
                      This will copy the latest snapshot for this patch and add your new observation.
                      The original snapshot remains unchanged.
                    </p>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => duplicateSnapshotWithNew()}>
                      Create Copy & Add
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    Create New Snapshot
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <h2 className="text-lg font-semibold">Create New Snapshot</h2>
                    <p className="text-sm text-gray-600">
                      This will create a completely new snapshot containing only your new observation.
                      Use this when starting a fresh observation session.
                    </p>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => newSnapshotWithNewObs()}>
                      Create New Snapshot
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button variant="outline" size="sm" onClick={() => cancelAdd()}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Observation Button and Export */}
      {!isNewObs && editingRowId === null && (
        <div className="mb-4 flex justify-end gap-2">
          <Button onClick={exportToCsv} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <PermissionRestrictedDialog actionName="add new observations">
            <Button onClick={handleAddRow} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              New Observation
            </Button>
          </PermissionRestrictedDialog>
        </div>
      )}

      {/* Data Grid */}
      <div className="flex-1">
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          {...gridOptions}
          theme={myTheme}
          ref={gridRef}
          pagination={true}
          paginationAutoPageSize={true}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          suppressRowHoverHighlight={false}
          suppressColumnMoveAnimation={false}
          suppressAnimationFrame={false}
          enableBrowserTooltips={true}
          tooltipShowDelay={500}
          tooltipHideDelay={2000}
        />
      </div>
    </div>
  );
}
