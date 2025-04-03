import { Button } from '@/components/ui/button';
import SnapshotView from './snapshot-view';
import { useContext } from 'react';
import HistoricalSnapshotContext from './historical-snapshot-context';
export default function SnapshotRecord({
  snapshotID,
  snapshotDate,
  patchID,
}: {
  snapshotID: number;
  snapshotDate: Date;
  patchID: string;
}) {
  const { fetchHistoricalSnapshotMetadata } = useContext(HistoricalSnapshotContext);

  const deleteSnapshot = async (snapshotID: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const api_path = `${baseUrl}/snapshot/${snapshotID}`;
      const response = await fetch(api_path, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchHistoricalSnapshotMetadata(patchID);
      } else {
        console.error('Failed to delete snapshot:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting snapshot:', error);
    }
  };

  return (
    <div className="flex flex-row justify-between my-1">
      <div className="flex-1 text-left">
        {snapshotDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </div>
      <div className="flex-1 text-right">
        <div className="flex flex-row justify-end space-x-2">
          <SnapshotView patch={patchID} historicalSnapshotID={snapshotID} triggerTitle={'View'} />
          <Button variant="outline" onClick={() => deleteSnapshot(snapshotID)}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
