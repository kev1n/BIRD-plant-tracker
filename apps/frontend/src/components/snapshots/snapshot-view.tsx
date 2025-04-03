import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { JSX, useEffect, useState } from 'react';
import { Observation, Snapshot } from 'types/database_types';
import LatestSnapshotContext from './latest-snapshot-context';
import PatchSnapshotHistory from './patch-snapshot-history';
import SnapshotFormDialog from './snapshot-form-dialog';
import ObservationsSection from '../observations/observations-section';

const ConditionalWrapper = ({
  condition,
  wrapper,
  children,
}: {
  condition: boolean;
  wrapper: (children: JSX.Element) => JSX.Element;
  children: JSX.Element;
}) => (condition ? wrapper(children) : children);

export default function SnapshotView({
  patch,
  historicalSnapshotID,
  triggerTitle,
}: {
  patch: string;
  historicalSnapshotID?: number;
  triggerTitle: string;
}) {
  const [patch_found, setPatchFound] = useState(false);
  const [current_snapshot, setCurrentSnapshot] = useState<Snapshot>({
    snapshotID: -1,
    dateCreated: new Date(),
    patchID: patch,
    notes: 'No notes available for this patch.',
    userID: '',
    soilType: null,
  });
  const [observations, setObservations] = useState<Observation[]>([]);
  const [author, setAuthor] = useState<string>('Not available');

  const fetchCompleteSnapshot = async (patch: string, snapshotID: number | null) => {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
      const api_path =
        baseUrl + (snapshotID ? '/snapshot/' + snapshotID : '/snapshot/patch/' + patch + '/latest');
      const snapshot_response = await fetch(`${api_path}`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (snapshot_response.status === 404) {
        setPatchFound(false);
        setAuthor('Not available');
        setCurrentSnapshot({
          snapshotID: -1,
          dateCreated: new Date(),
          patchID: patch,
          notes: 'No notes available for this patch.',
          userID: '',
          soilType: null, 
        });
        setObservations([]);
        return;
      } else if (!snapshot_response.ok) {
        throw new Error('Failed to fetch latest snapshot for patch');
      }

      const snapshot_data = await snapshot_response.json();
      setCurrentSnapshot({
        snapshotID: snapshot_data.data.snapshotID,
        dateCreated: new Date(snapshot_data.data.dateCreated),
        patchID: snapshot_data.data.patchID,
        notes: snapshot_data.data.notes || 'No notes available for this patch.',
        userID: snapshot_data.data.userID,
        soilType: snapshot_data.data.soilType || null, 
      });
      setAuthor(snapshot_data.data.users.username || 'Not available');
      setPatchFound(snapshot_data);

      const snapshotID_toUse = snapshotID || snapshot_data.data.snapshotID;
      const observations_response = await fetch(
        `${baseUrl}/observation/detailed-all/${snapshotID_toUse}`,
        {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!observations_response.ok) {
        throw new Error('Failed to fetch observations for snapshot');
      }
      const observations_data = await observations_response.json();
      const observations_with_tempKey = observations_data.observations.map(
        (obs: Observation, index: number) => ({
          ...obs,
          tempKey: index,
          isNew: false,
          modified: false,
        })
      );
      setObservations(observations_with_tempKey);
    } catch (err) {
      console.error('Error fetching complete snapshot:', err);
      setPatchFound(false);
      setCurrentSnapshot({
        snapshotID: -1,
        dateCreated: new Date(),
        patchID: patch,
        notes: 'No notes available for this patch.',
        userID: '',
        soilType: null, 
      });
      setObservations([]);
      setAuthor('Not available');
    }
  };

  useEffect(() => {
    fetchCompleteSnapshot(patch, historicalSnapshotID || null);
  }, [patch, historicalSnapshotID]);

  return (
    <ConditionalWrapper
      condition={historicalSnapshotID === undefined}
      wrapper={(children: JSX.Element) => (
        <LatestSnapshotContext.Provider value={{ fetchLatestSnapshot:fetchCompleteSnapshot }}>
          {children}
        </LatestSnapshotContext.Provider>
      )}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button>{triggerTitle}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          {!patch_found && (
            <div className="text-red-500">
              <h1>
                There are no snapshots for Patch {patch}. Create one by clicking New Snapshot{' '}
              </h1>
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
                    {current_snapshot.dateCreated.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </h1>
                  <h1>By: {author}</h1>
                </div>
              </div>
            </div>
          </DialogHeader>
          <ObservationsSection observations={observations} editing={false} />

        <div>
          <h1 className="inline-block">Soil Type: </h1>
          {current_snapshot.soilType ? (
            <span className="ml-2 inline-block rounded-full bg-gray-200 px-2 py-1 text-sm text-gray-700">
              {current_snapshot.soilType}
            </span>
          ) : (
            <span className="ml-2 inline-block rounded-full bg-red-200 px-2 py-1 text-sm text-red-700">
              Unknown
            </span>
          )}
          
        </div>
          <div>
            <h1>Notes</h1>
            <div className="border border-gray-300 rounded-lg p-4">
              <p>{current_snapshot.notes || 'No notes available for this patch.'}</p>
            </div>
          </div>

          {historicalSnapshotID === undefined && (
            <div className="flex flex-row justify-between">
              <div className="flex-1 text-left">
                <SnapshotFormDialog newSnapshot={true} patchID={patch} snapshotTemplate={current_snapshot} observationsTemplate={observations} />
              </div>
              <div>
                <PatchSnapshotHistory patch={patch} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ConditionalWrapper>
  );
}
