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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AllCommunityModule, ColDef, iconSetMaterial, ModuleRegistry, themeQuartz, ValueGetterParams, ValueSetterParams } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { EllipsisVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Observation, Snapshot, updatedObservation } from 'types/database_types';
import { useUser } from '../hooks/useUser';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function SpreadSheetView() {
  const [rowData, setRowData] = useState<Observation[]>();
  const [editingRowId, setEditingRowId] = useState<number|null>(null);
  const [backupRow, setBackupRow] = useState<Observation|null>(null);
  const [isNewObs, setIsNewObs] = useState<number|null>(null);
  const { user } = useUser();
  
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

  // change the editing state
  const startEdit = (row: Observation) => {
    setEditingRowId(row.observationID);
    setBackupRow({...row});
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
        throw new Error("failed to delete observation");
      }

      // Refresh data to show deletion
      fetchData();

    } catch (error) {
      console.error("Error duplicating observation:", error);
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
      
    } catch (error) {
      console.error("Error during snapshot duplication:", error);
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
    } catch (error) {
      console.error("Error duplicating observation to empty snapshot:", error);
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
      return newSnapshotID;
      
    } catch (error) {
      console.error("Error during snapshot duplication:", error);
    }
  }

  async function duplicateSnapshotWithEdited() {
    if (editingRowId === null || !rowData) return;
    // 1) find the row the user just edited
    const editedRow = rowData.find(r => r.observationID === editingRowId);
    if (!editedRow) {
      console.error('No edited row found!');
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
        throw new Error("Failed to get snapshot");
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
        throw new Error("Failed to get snapshot observations");
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
        throw new Error("Failed to create new snapshot");
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

        if (!duplicateObsResponse) {
          throw new Error("Failed to duplicate observation to new snapshot");
        }
      }
  
      // 6) finally, refresh your grid & clear edit mode
      fetchData();
      setEditingRowId(null);
      setBackupRow(null);
  
    } catch (err) {
      console.error('Error duplicating snapshot with edited row:', err);
    }
  }

  async function newSnapshotWithEdited() {
    if (editingRowId === null || !rowData) return;
    // 1) find the row the user just edited
    const editedRow = rowData.find(r => r.observationID === editingRowId);
    if (!editedRow) {
      console.error('No edited row found!');
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
        throw new Error("Failed to duplicate observation");
      }

      fetchData();
      setEditingRowId(null);
      setBackupRow(null);
    } catch (error) {
      console.error("Error duplicating observation to empty snapshot:", error);
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
  //       throw new Error(response.statusText);
  //     }
  //   } catch (error){
  //     console.error("Error:", error);
  //   }
  // }

  const saveEdit = async () => {
    try {
      const updatedRow = rowData ? rowData.find(r => r.observationID === editingRowId)! : null;

      if (!updatedRow){
        console.error("Error: edited row not found");
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
        throw new Error(response.statusText);
      }
      
      setEditingRowId(null);
      setBackupRow(null);
    } catch (error) {
      console.error("Error:", error);
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
  };

  const cancelAdd = () => {
    setIsNewObs(null);
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
      datePlanted:   null,
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
  };

  async function addNewToRecentSnapshot() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      console.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      alert('Please enter the patch ID for the new observation.');
      return;
    }

    if (plantName === 'REQUIRED'){
      alert('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      alert('Please enter plant quantity greater than 0 for the new observation.');
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
        throw new Error(snapshot_response.statusText);
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
        throw new Error(await plant_response.text());
      }
      
      const { plants } = await plant_response.json();
      
      if (!plants || plants.length === 0) {
        alert(`No plant found matching “${plantName}”`);
        return;
      }

      if (plants.length > 1){
        alert(`Please enter a more specific plant name. “${plantName}” is not specific enough.`);
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

      if (!obs_response) {
        throw new Error("Failed to create new observation");
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function duplicateSnapshotWithNew() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      console.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      alert('Please enter the patch ID for the new observation.');
      return;
    }

    if (plantName === 'REQUIRED'){
      alert('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      alert('Please enter plant quantity greater than 0 for the new observation.');
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
        throw new Error(snapshot_response.statusText);
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
        throw new Error(await plant_response.text());
      }
      
      const { plant } = await plant_response.json();
      
      if (!plant) {
        alert(`No plant found matching “${plantName}”`);
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

      if (!obs_response) {
        throw new Error("Failed to create new observation");
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function newSnapshotWithNewObs() {
    if (!isNewObs || !rowData)
      return;

    const newRow = rowData.find(r => r.observationID === -1);
    if (!newRow) {
      console.error('No new row found!');
      return;
    }

    const patchID = newRow.Snapshots?.patchID;
    const plantName = newRow.PlantInfo.plantCommonName;
    const plantQuantity = newRow.plantQuantity;

    if (patchID === 'REQUIRED'){
      alert('Please enter the patch ID for the new observation.');
      return;
    }

    if (plantName === 'REQUIRED'){
      alert('Please enter the plant common name for the new observation.');
      return;
    }

    if (plantQuantity === 0){
      alert('Please enter plant quantity greater than 0 for the new observation.');
      return;
    }

    if (!user) {
      alert('Please log in to access this feature');
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
        throw new Error("Error creating new snapshot.");
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
        throw new Error(await plant_response.text());
      }
      
      const { plant } = await plant_response.json();
      
      if (!plant) {
        alert(`No plant found matching “${plantName}”`);
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

      if (!obs_response) {
        throw new Error("Failed to create new observation");
      }

      setIsNewObs(null);
      fetchData();

    } catch (error) {
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
      field: "Options",
      cellRenderer: (params: ValueGetterParams<Observation>) => 
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className="flex w-full h-full justify-center items-center">
            <EllipsisVertical />
            </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem >
            <Button className="w-full" onClick={() => { if (params.data) { startEdit(params.data); }}}>
              Edit Observation
            </Button>
          </DropdownMenuItem>  

          <SpreadsheetRowActionItem
            actionName="Duplicate Observation"
            prompt="Are you sure you want to DUPLICATE this observation?"
            color=""
            onConfirm={() => {if (params.data) { duplicateObservation(params.data); }}}
          />

          <SpreadsheetRowActionItem
            actionName="Duplicate into new empty snapshot"
            prompt="Are you sure you want to DUPLICATE this observation into an EMPTY SNAPSHOT?"
            color=""
            onConfirm={() => { if (params.data) { duplicateObservationEmptySnapshot(params.data); }}}
          />

          <SpreadsheetRowActionItem
            actionName="Duplicate snapshot"
            prompt="Are you sure you want to DUPLICATE the ENTIRE SNAPSHOT?"
            color=""
            onConfirm={() => { 
              if (params.data?.snapshotID) { 
                duplicateSnapshot(params.data?.snapshotID); 
              }
            }}
          />

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
            actionName="Duplicate snapshot without this observation"
            prompt="Are you sure you want to DUPLICATE the snapshot WITHOUT THIS OBSERVATION?"
            color="red"
            onConfirm={() => {
              const obsID = params.data?.observationID || -1;
              const snapID = params.data?.snapshotID || -1;
              if (obsID === -1 || snapID === -1) { return; }
              duplicateSnapshotAndDeleteObservation(obsID, snapID);
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
      editable: params => (params.data.observationID === isNewObs),
      cellEditor: 'agTextCellEditor',
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
    },
    { 
      field: "Plant Quantity",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.plantQuantity,
      sortable: true,
      filter: true,
      type: 'numericColumn',
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
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
      }
    },
    { 
      field: "Plant Common Name",
      valueGetter: (params: ValueGetterParams<Observation>) => params.data?.PlantInfo?.plantCommonName || '',
      sortable: true,
      filter: true,
      headerClass: 'ag-header-cell-center',
      cellStyle: { textAlign: 'center' },
      editable: params => (params.data.observationID === isNewObs),
      cellEditor: 'agTextCellEditor',
      valueSetter: (params: ValueSetterParams<Observation>) => {
        const oldValue = params.data.PlantInfo.plantCommonName;
        const newValue = params.newValue;
        if (newValue !== oldValue) {
          params.data.PlantInfo.plantCommonName = newValue;
          return true;
        }
        return false;
      },
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
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
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
      editable: params => (params.data.observationID === editingRowId || params.data.observationID === isNewObs),
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
      editable: params => (params.data.observationID === isNewObs),
      cellEditor: 'agLargeTextCellEditor',
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
        {!isNewObs && editingRowId === null && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleAddRow}>
              New Observation
            </Button>
          </div>
        )}
        {editingRowId != null && (
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="lightGreen" onClick={() => saveEdit()}>
              Save
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="lightGreen">
                  Duplicate Snapshot
                </Button>
              </AlertDialogTrigger>  

              <AlertDialogContent>
                <AlertDialogHeader>
                  This action will duplicate the entire snapshot associated with the edited observation and update the single observation!
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction onClick={() => duplicateSnapshotWithEdited()}>
                    Confirm
                  </AlertDialogAction>

                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="lightGreen">
                  New Snapshot
                </Button>
              </AlertDialogTrigger>  

              <AlertDialogContent>
                <AlertDialogHeader>
                  This action will create a new snapshot containing the edited observation!
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction onClick={() => newSnapshotWithEdited()}>
                    Confirm
                  </AlertDialogAction>

                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => cancelEdit()}>
              Cancel
            </Button>
          </div>
        )}
        {isNewObs != null && (
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="lightGreen" onClick={() => addNewToRecentSnapshot()}>
              Add to current snapshot
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="lightGreen">
                  Duplicate Snapshot
                </Button>
              </AlertDialogTrigger>  

              <AlertDialogContent>
                <AlertDialogHeader>
                  This action will duplicate the latest snapshot associated with the specified patch ID and add the new observation!
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction onClick={() => duplicateSnapshotWithNew()}>
                    Confirm
                  </AlertDialogAction>

                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="lightGreen">
                  New Snapshot
                </Button>
              </AlertDialogTrigger>  

              <AlertDialogContent>
                <AlertDialogHeader>
                  This action will create a new snapshot containing the new observation!
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction onClick={() => newSnapshotWithNewObs()}>
                    Confirm
                  </AlertDialogAction>

                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => cancelAdd()}>
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
