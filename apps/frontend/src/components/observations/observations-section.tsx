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
  const [forbs, setForbs] = useState<Observation[]>([]);
  const [uncategorized, setUncategorized] = useState<Observation[]>([]);

  const deleteObservation = (tempKey: number) => {
    const updatedObservations = observations
      .map(obs => {
        if (obs.tempKey === tempKey) {
          if (!obs.isNew) {
            return { ...obs, deletedOn: new Date() };
          } else {
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
    const lastTempKey =
      observations.length > 0 && observations[observations.length - 1].tempKey !== undefined
        ? observations[observations.length - 1].tempKey
        : -1;
    const updatedObservations = [
      ...observations,
      { ...newObservation, tempKey: lastTempKey + 1, isNew: true },
    ];
    setObservations?.(updatedObservations);
  };

  useEffect(() => {
    const trees = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'tree' && !obs.deletedOn
    );
    const shrubs = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'shrub' && !obs.deletedOn
    );
    const grasses = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'grass' && !obs.deletedOn
    );
    const others = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'other' && !obs.deletedOn
    );
    const forbs = observations.filter(
      obs => obs.PlantInfo.subcategory?.toLowerCase() === 'forb' && !obs.deletedOn
    );
    const uncategorized = observations.filter(obs => obs.PlantInfo.subcategory === null);
    setTrees(trees);
    setShrubs(shrubs);
    setGrasses(grasses);
    setForbs(forbs);
    setOthers(others);
    setUncategorized(uncategorized);
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
        <ObservationsList observations={forbs} listName={'Forbs'} editing={editing} />
        <ObservationsList observations={others} listName={'Others'} editing={editing} />
        <ObservationsList
          observations={uncategorized}
          listName={'Uncategorized'}
          editing={editing}
        />
      </div>
    </ObservationEditorContext.Provider>
  );
}
