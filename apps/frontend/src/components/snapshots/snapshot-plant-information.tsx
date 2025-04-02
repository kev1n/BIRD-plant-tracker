import { useEffect, useState } from 'react';
import { Observation } from 'types/database_types';
import PlantObservationFormDialog from '../observations/observation-form-dialog';
import ObservationsList from '../observations/observations-list';

export default function SnapshotObservation({
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

  useEffect(() => {
    const filterObservations = (data: Observation[]) => {
      const trees = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'tree');
      const shrubs = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'shrub');
      const grasses = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'grass');
      const others = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'other');
      setTrees(trees);
      setShrubs(shrubs);
      setGrasses(grasses);
      setOthers(others);
    };
    filterObservations(observations)
  }, [observations]);

  return (
    <div>
      <h1>Plants</h1>
      <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
        <ObservationsList observations={trees} listName={'Trees'} editing={editing} />
        <ObservationsList observations={shrubs} listName={'Shrubs'} editing={editing} />
        <ObservationsList observations={grasses} listName={'Grasses'} editing={editing} />
        <ObservationsList observations={others} listName={'Others'} editing={editing} />
      </div>
    </div>
  );
}
