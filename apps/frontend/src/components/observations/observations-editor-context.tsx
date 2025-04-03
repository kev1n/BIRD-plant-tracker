import { Observation } from 'types/database_types';
import { createContext } from 'react';
interface ObservationsEditorContextType {
  deleteObservation: (tempKey: number) => void;
  updateObservation: (updatedObservation: Observation) => void;
  addObservation: (newObservation: Observation) => void;
}

const ObservationsEditorContext = createContext<ObservationsEditorContextType>({
  deleteObservation: () => {},
  updateObservation: () => {},
  addObservation: () => {},
});
export default ObservationsEditorContext;
