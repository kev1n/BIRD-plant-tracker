import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import SnapshotRecord from './snapshot-record';
import HistoricalSnapshotContext from './historical-snapshot-context';

interface DateIDPair {
  snapshotID: number;
  dateCreated: Date;
}

export default function PatchSnapshotHistory({ patch }: { patch: string }) {
  const [historicalSnapshots, setHistoricalSnapshots] = useState<DateIDPair[]>([]);

  const fetchHistoricalSnapshotMetadata = async (patch: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const api_path = `${baseUrl}/snapshot/patch/${patch}/dates`;
      const response = await fetch(api_path, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const convertedData: DateIDPair[] = data.data.map(
          (entry: { snapshotID: number; dateCreated: string }) => ({
            snapshotID: entry.snapshotID,
            dateCreated: new Date(entry.dateCreated+"T00:00:00"), 
          })
        );
        setHistoricalSnapshots(convertedData);
      } else if (response.status === 404) {
        setHistoricalSnapshots([]);
      } else {
        setHistoricalSnapshots([]);
      }
    } catch (error) {
      console.error('Error fetching historical snapshots:', error);
    }
  };

  useEffect(() => {
    console.log(`Fetching historical snapshots for patch: ${patch}`);
    fetchHistoricalSnapshotMetadata(patch);
  }, [patch]);

  return (
    <HistoricalSnapshotContext.Provider
      value={{
        fetchHistoricalSnapshotMetadata,
      }}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">History</Button>
        </DialogTrigger>
        <DialogContent className="overflow-y-scroll max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Patch Snapshot History for {patch}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-scroll max-h-[80vh]">
            {historicalSnapshots.length > 0 ? (
            historicalSnapshots.map((snapshot, index) => (
              <SnapshotRecord
                key={index}
                snapshotID={snapshot.snapshotID}
                snapshotDate={snapshot.dateCreated} // Pass the date for display
                patchID={patch}
              />
            ))
          ) : (
            <p>No historical snapshots available for this patch.</p>
          )}
          </div>
          
        </DialogContent>
      </Dialog>
    </HistoricalSnapshotContext.Provider>
  );
}
