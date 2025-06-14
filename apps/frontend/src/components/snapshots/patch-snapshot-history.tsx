import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { parseDateAsLocal } from '@/lib/date-utils';
import { Calendar, History } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import HistoricalSnapshotContext from './historical-snapshot-context';
import SnapshotRecord from './snapshot-record';

interface DateIDPair {
  snapshotID: number;
  dateCreated: Date;
}

export default function PatchSnapshotHistory({ 
  patch, 
  trigger 
}: { 
  patch: string;
  trigger?: ReactNode;
}) {
  const [historicalSnapshots, setHistoricalSnapshots] = useState<DateIDPair[]>([]);
  const [open, setOpen] = useState(false);

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
            dateCreated: parseDateAsLocal(entry.dateCreated), 
          })
        );
        setHistoricalSnapshots(convertedData);
      } else if (response.status === 404) {
        setHistoricalSnapshots([]);
      } else {
        setHistoricalSnapshots([]);
      }
    } catch (error) { 
      toast.error('Error fetching historical snapshots: ' + error);
    }
  };

  useEffect(() => {
    if (!open) return; 
    fetchHistoricalSnapshotMetadata(patch);
  }, [patch, open]);

  return (
    <HistoricalSnapshotContext.Provider
      value={{
        fetchHistoricalSnapshotMetadata,
      }}
    >
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button variant="outline">History</Button>}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <History className="w-5 h-5" />
              Snapshot History
            </DialogTitle>
            <p className="text-muted-foreground">Patch {patch}</p>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Historical Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicalSnapshots.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {historicalSnapshots.map((snapshot, index) => (
                    <SnapshotRecord
                      key={index}
                      snapshotID={snapshot.snapshotID}
                      snapshotDate={snapshot.dateCreated}
                      patchID={patch}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-muted-foreground mb-1">No History Available</h3>
                  <p className="text-sm text-muted-foreground">
                    No historical snapshots are available for this patch.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </HistoricalSnapshotContext.Provider>
  );
}
