import { createContext } from 'react';
interface LatestSnapshotContextType {
  fetchCompleteSnapshot: (patch: string, snapshotID: number | null) => Promise<void>;
}
const LatestSnapshotContext = createContext<LatestSnapshotContextType>(
  {
    fetchCompleteSnapshot: async () => {},
  },
);
export default LatestSnapshotContext;
