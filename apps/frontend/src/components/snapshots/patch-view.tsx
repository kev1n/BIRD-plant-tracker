import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Snapshot } from '../../../types/database_types';
import PatchSnapshotHistory from './patch-snapshot-history';
import SnapshotFormDialog from './snapshot-form-dialog';
import SnapshotObservation from './snapshot-plant-information';

export default function PatchView({ patch }: { patch: string }) {
  const [patch_found, setPatchFound] = useState(false);
  const [latest_snapshot, setLatestSnapshot] = useState<Snapshot>({
    snapshotID: '',
    dateCreated: new Date(),
    patchID: patch,
    notes: 'No notes available for this patch.',
    userID: '',
  });
  const [latest_author, setAuthor] = useState<string>('Not available');

  useEffect(() => {
    const fetchLatestSnapshot = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const response = await fetch(`${baseUrl}/snapshot/patch/` + patch, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 404) {
          setPatchFound(false);
          setAuthor('Not available');
          setLatestSnapshot({
            snapshotID: '',
            dateCreated: new Date(),
            patchID: patch,
            notes: 'No notes available for this patch.',
            userID: '',
          });
          return;
        } else if (!response.ok) {
          throw new Error('Failed to fetch latest snapshot for patch');
        }
        const data = await response.json();
        setLatestSnapshot({
          snapshotID: data.latest_snapshot.snapshotID,
          dateCreated: new Date(data.latest_snapshot.dateCreated),
          patchID: data.latest_snapshot.patchID,
          notes: data.latest_snapshot.notes || 'No notes available for this patch.',
          userID: data.latest_snapshot.userID,
        });
        setAuthor(data.latest_snapshot.users.username || 'Not available');
        setPatchFound(true);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchLatestSnapshot();
  }, [patch]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Click here for more information</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        {!patch_found && (
          <div className="text-red-500">
            <h1>There are no snapshots for Patch {patch}. Create one by clicking New Snapshot </h1>
          </div>
        )}

        <DialogHeader>
          <div className="flex flex-row justify-between">
            <div className="flex-1 text-left">
              <DialogTitle>Patch {patch}</DialogTitle>
            </div>
            <div className="flex-1 text-right">
              <div className="mr-5">
                <h1>
                  Accurate as of:
                  {latest_snapshot.dateCreated.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </h1>
                <h1>By: {latest_author}</h1>
              </div>
            </div>
          </div>
        </DialogHeader>

        <SnapshotObservation
          snapshotID={patch_found ? latest_snapshot.snapshotID : null}
          editing={false}
        />

        <div>
          <h1>Notes</h1>
          <div className="border border-gray-300 rounded-lg p-4">
            <p>{latest_snapshot.notes || 'No notes available for this patch.'}</p>
          </div>
        </div>

        <div className="flex flex-row justify-between">
          <div className="flex-1 text-left">
            <SnapshotFormDialog newSnapshot={true} patchLabel={patch} />
          </div>
          <div>
            <PatchSnapshotHistory patchLabel={patch} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
