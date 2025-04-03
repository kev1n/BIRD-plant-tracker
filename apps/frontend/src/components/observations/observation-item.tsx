import { Observation } from 'types/database_types';
import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import ObservationEditorContext from './observations-editor-context';
import ObservationFormDialog from './observation-form-dialog';

export default function ObservationItem({
  observation,
  editing,
}: {
  observation: Observation;
  editing?: boolean;
}) {
  const { deleteObservation, updateObservation } = useContext(ObservationEditorContext);
  return (
    <div className="flex flex-row">
      <div>
        {editing && (
          <div className="flex flex-col gap-2">
            <Button onClick={() => deleteObservation(observation.tempKey)}>Delete</Button>
            <ObservationFormDialog
              newObservation={false}
              observation={observation}
              submitCallback={updatedObservation => {
                updateObservation(updatedObservation);
              }}
            />
          </div>
        )}
      </div>
      <div>
        <div className="flex flex-row items-center gap-2 pl-2">
          <h3>{observation.PlantInfo.plantCommonName}</h3>
          {observation.PlantInfo.plantScientificName && (
            <h3>({observation.PlantInfo.plantScientificName})</h3>
          )}
        </div>
        <div className="flex flex-col pl-5">
          {observation.PlantInfo.isNative && (
            <span className="text-green-500 text-sm">Native Plant</span>
          )}
          <p className="text-sm">Quantity: {observation.plantQuantity}</p>
          {observation.datePlanted && (
            <p className="text-sm">
              Date Planted: {new Date(observation.datePlanted).toLocaleDateString()}
            </p>
          )}
          {observation.hasBloomed !== null && (
            <p className="text-sm">Has Bloomed: {observation.hasBloomed ? 'Yes' : 'No'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
