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
      <div className="min-w-[30px]">
        {editing && (
          <div>
            <Button variant="ghost" onClick={() => deleteObservation(observation.tempKey)}>
              <img src="/icons/trash-can.svg" className="w-4 h-4" alt="Delete" />
            </Button>
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
            <h3>
              ({observation.PlantInfo.plantScientificName}){' '}
              {observation.PlantInfo.isNative != null &&
                (observation.PlantInfo.isNative === true ? (
                  <span className="text-green-500">[Native]</span>
                ) : (
                  <span className="text-red-500">[Non-native]</span>
                ))}
            </h3>
          )}
        </div>
        <div className="flex flex-col pl-5">
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
