import { Button } from '@/components/ui/button';
import SnapshotView from './snapshot-view';
export default function SnapshotRecord({
  snapshotID,
  snapshotDate,
  patchID,
}: {
  snapshotID: string;
  snapshotDate: Date;
  patchID: string;
}) {
  return (
    <div className="flex flex-row justify-between">
      <div className="flex-1 text-left">{snapshotDate.toLocaleDateString()}</div>
      <div className="flex-1 text-right">
        <div className="flex flex-row justify-end space-x-2">
          <SnapshotView
            patch={patchID}
            historicalSnapshotID={snapshotID}
          />
          <Button variant="outline">Edit</Button>
          <Button variant="outline">Duplicate</Button>
          <Button variant="outline">Delete</Button>
        </div>
      </div>
    </div>
  );
}
