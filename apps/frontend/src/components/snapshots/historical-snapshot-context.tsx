import {createContext} from 'react';
interface HistoricalSnapshotContextType {
  fetchHistoricalSnapshotMetadata: (patch: string) => Promise<void>;
}
const HistoricalSnapshotContext = createContext<HistoricalSnapshotContextType| null>(null);
export default HistoricalSnapshotContext; 