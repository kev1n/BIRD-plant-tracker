import { createContext } from 'react';
interface LatestSnapshotContextType {
  fetchLatestSnapshot: (patch: string, snapshotID: number | null) => Promise<void>;
}
const LatestSnapshotContext = createContext<LatestSnapshotContextType>(
  {
    fetchLatestSnapshot: async () => {},
  },
);
export default LatestSnapshotContext;
