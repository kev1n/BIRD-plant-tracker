import {createContext} from 'react';
interface LatestSnapshotContextType {
  fetchCompleteSnapshot: (patch: string, snapshotID: string | null) => Promise<void>;
}
const LatestSnapshotContext = createContext<LatestSnapshotContextType| null>(null);
export default LatestSnapshotContext;