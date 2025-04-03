import { useEffect, useState } from 'react';
import { Observation } from 'types/database_types';
import ObservationFormDialog from './observation-form-dialog';
import ObservationEditorContext from './observations-editor-context';
import ObservationsList from './observations-list';

export default function ObservationsSection({
  observations,
  setObservations,
  editing,
}: {
  observations: Observation[];
  setObservations?: (observations: Observation[]) => void;
  editing: boolean;
}) {
  const [trees, setTrees] = useState<Observation[]>([]);
  const [shrubs, setShrubs] = useState<Observation[]>([]);
  const [grasses, setGrasses] = useState<Observation[]>([]);
  const [others, setOthers] = useState<Observation[]>([]);

  const deleteObservation = (tempKey: number) => {
    const updatedObservations = observations
      .map(obs => {
        if (obs.tempKey === tempKey) {
          if (!obs.isNew) {
            return { ...obs, deletedOn: new Date() };
          } else {
            console.log('Removing new observation with tempKey:', tempKey);
            return null;
          }
        }
        return obs;
      })
      .filter(obs => obs !== null) as Observation[];
    setObservations?.(updatedObservations);
  };

  const updateObservation = (updatedObservation: Observation) => {
    const updatedObservations = observations.map(obs =>
      obs.tempKey === updatedObservation.tempKey ? { ...updatedObservation, modified: true } : obs
    );
    setObservations?.(updatedObservations);
  };

  const addObservation = (newObservation: Observation) => {
    console.log('Adding new observation:', newObservation, observations);
    const lastTempKey =
      observations.length > 0 && observations[observations.length - 1].tempKey !== undefined
        ? observations[observations.length - 1].tempKey
        : -1;
    console.log('Last tempKey found in observations:', lastTempKey);
    const updatedObservations = [
      ...observations,
      { ...newObservation, tempKey: lastTempKey + 1, isNew: true },
    ];
    setObservations?.(updatedObservations);
  };

  useEffect(() => {
    console.log('ObservationsSection useEffect called with observations:', observations);
    const trees = observations.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'tree');
    const shrubs = observations.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'shrub');
    const grasses = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'grass'
    );
    const others = observations.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'other');
    setTrees(trees);
    setShrubs(shrubs);
    setGrasses(grasses);
    setOthers(others);
  }, [observations, editing]);

  return (
    <ObservationEditorContext.Provider
      value={{ deleteObservation, updateObservation, addObservation }}
    >
      <h1>Plants</h1>
      <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
        {editing && <ObservationFormDialog newObservation={true} submitCallback={addObservation} />}
        <ObservationsList observations={trees} listName={'Trees'} editing={editing} />
        <ObservationsList observations={shrubs} listName={'Shrubs'} editing={editing} />
        <ObservationsList observations={grasses} listName={'Grasses'} editing={editing} />
        <ObservationsList observations={others} listName={'Others'} editing={editing} />
      </div>
    </ObservationEditorContext.Provider>
  );
}
