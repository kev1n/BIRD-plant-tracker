import { Button } from '@/components/ui/button';
import { formatDateForDisplay } from '@/lib/date-utils';
import { CalendarIcon } from 'lucide-react';
import { useContext } from 'react';
import { toast } from 'sonner';
import PermissionRestrictedDialog from '../utils/PermissionRestrictedDialog';
import HistoricalSnapshotContext from './historical-snapshot-context';
import SnapshotView from './snapshot-view';

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
        toast.error('Failed to delete snapshot');
      }
    } catch (error) {
      toast.error('Error deleting snapshot: ' + error);
    }
  };

  return (
    <div className="flex flex-row justify-between my-1">
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {formatDateForDisplay(snapshotDate)}
          </span>
        </div>
      </div>
      <div className="flex-1 text-right">
        <div className="flex flex-row justify-end space-x-2">
          <SnapshotView patch={patchID} historicalSnapshotID={snapshotID} triggerTitle={'View'} />
          <PermissionRestrictedDialog actionName="delete snapshots">
            <Button variant="outline" onClick={() => deleteSnapshot(snapshotID)}>
              Delete
            </Button>
          </PermissionRestrictedDialog>
        </div>
      </div>
    </div>
  );
}
