import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertCircle, Calendar, Camera, FileText, History, User } from 'lucide-react';
import { JSX, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Observation, Snapshot } from 'types/database_types';
import ObservationsSection from '../observations/observations-section';
import PatchSoil from '../patch/patch-soil';
import PermissionRestrictedDialog from '../utils/PermissionRestrictedDialog';
import LatestSnapshotContext from './latest-snapshot-context';
import PatchSnapshotHistory from './patch-snapshot-history';
import SnapshotForm from './snapshot-form-dialog';

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
  autoOpen = false,
}: {
  patch: string;
  historicalSnapshotID?: number;
  triggerTitle: string;
  autoOpen?: boolean;
}) {
  const [patch_found, setPatchFound] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current_snapshot, setCurrentSnapshot] = useState<Snapshot>({
    snapshotID: -1,
    dateCreated: new Date(),
    patchID: patch,
    notes: 'No notes available for this patch.',
    userID: '',
  });
  const [observations, setObservations] = useState<Observation[]>([]);
  const [author, setAuthor] = useState<string>('Not available');

  // Auto-open effect - only opens, never closes
  useEffect(() => {
    if (autoOpen) {
      setDialogOpen(true);
    }
  }, [autoOpen, patch]); // Also trigger when patch changes

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
        });
        setObservations([]);
        return;
      } else if (!snapshot_response.ok) {
        throw new Error('Failed to fetch latest snapshot for patch');
      }

      const snapshot_data = await snapshot_response.json();
      setCurrentSnapshot({
        snapshotID: snapshot_data.data.snapshotID,
        dateCreated: new Date(snapshot_data.data.dateCreated + 'T00:00:00'),
        patchID: snapshot_data.data.patchID,
        notes: snapshot_data.data.notes || 'No notes available for this patch.',
        userID: snapshot_data.data.userID,
      });
      console.log('Snapshot data:', snapshot_data); // For debugging purposes
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
      toast.error('Error fetching complete snapshot: ' + err);
      setPatchFound(false);
      setCurrentSnapshot({
        snapshotID: -1,
        dateCreated: new Date(),
        patchID: patch,
        notes: 'No notes available for this patch.',
        userID: '',
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
        <LatestSnapshotContext.Provider value={{ fetchLatestSnapshot: fetchCompleteSnapshot }}>
          {children}
        </LatestSnapshotContext.Provider>
      )}
    >
      <>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              {triggerTitle}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <DialogHeader className="pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl">
                      Patch {patch}
                    </DialogTitle>
                    <p className="text-muted-foreground">
                      {historicalSnapshotID ? 'Historical Snapshot' : 'Current Status'}
                    </p>
                  </div>
                </div>
                
                {patch_found && (
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4"/>
                      <span>
                        {current_snapshot.dateCreated.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>By: {author}</span>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            {/* Error State */}
            {!patch_found && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  There are no snapshots for Patch {patch}. Create one by clicking "New Snapshot" below.
                </AlertDescription>
              </Alert>
            )}

            {patch_found && (
              <div className="space-y-6">
                {/* Plant Observations Section */}
                <ObservationsSection observations={observations} editing={false} />

                {/* Soil Composition Section - Only show for current snapshots */}
                {historicalSnapshotID === undefined && (
                  <PatchSoil patchID={patch} />
                )}

                {/* Notes Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground leading-relaxed">
                      {current_snapshot.notes || 'No notes available for this patch.'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Action Buttons - Show for current snapshots regardless of patch_found status */}
            {historicalSnapshotID === undefined && (
              <div className="flex items-center justify-between pt-4 border-t">
                <PermissionRestrictedDialog actionName="create new snapshots">
                  <SnapshotForm
                    newSnapshot={true}
                    patchID={patch}
                    snapshotTemplate={current_snapshot}
                    observationsTemplate={observations}
                    trigger={
                      <Button>
                        <Camera className="w-4 h-4 mr-2" />
                        New Snapshot
                      </Button>
                    }
                  />
                </PermissionRestrictedDialog>
                
                {patch_found && (
                  <PatchSnapshotHistory 
                    patch={patch}
                    trigger={
                      <Button variant="outline">
                        <History className="w-4 h-4 mr-2 text-slate-600" />
                        View History
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Button for Historical Snapshots */}
        {historicalSnapshotID !== undefined && (
          <PermissionRestrictedDialog actionName="edit snapshots">
            <SnapshotForm
              newSnapshot={false}
              patchID={patch}
              snapshotTemplate={current_snapshot}
              observationsTemplate={observations}
            />
          </PermissionRestrictedDialog>
        )}
      </>
    </ConditionalWrapper>
  );
}
