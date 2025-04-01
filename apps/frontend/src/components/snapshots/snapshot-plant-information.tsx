import { useEffect, useState } from 'react';
import { Observation } from 'types/database_types';
import PlantObservationFormDialog from '../observations/observation-form-dialog';
import ObservationsList from '../observations/observations-list';

export default function SnapshotObservation({
  snapshotID,
  editing,
}: {
  snapshotID: string | null;
  editing: boolean;
}) {
  const [trees, setTrees] = useState<Observation[]>([]);
  const [shrubs, setShrubs] = useState<Observation[]>([]);
  const [grasses, setGrasses] = useState<Observation[]>([]);
  const [others, setOthers] = useState<Observation[]>([]);

  useEffect(() => {
    if (!snapshotID) {
      setTrees([]);
      setShrubs([]);
      setGrasses([]);
      setOthers([]);
      return;
    }

    const filterObservations = (data: Observation[]) => {
      console.log('Filtering observations for snapshot ID:', snapshotID);
      const trees = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'tree');
      const shrubs = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'shrub');
      const grasses = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'grass');
      const others = data.filter(obs => obs.PlantInfo.subcategory?.toLowerCase() === 'other');
      setTrees(trees);
      setShrubs(shrubs);
      setGrasses(grasses);
      setOthers(others);
    };

    const fetchObservations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
        const response = await fetch(`${baseUrl}/observation/detailed-all/${snapshotID}`, {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch observations for snapshot');
        }
        const data = await response.json();
        const observations = data.observations as Observation[];
        filterObservations(observations);
      } catch (error) {
        console.error('Error fetching observations:', error);
        setTrees([]);
        setShrubs([]);
        setGrasses([]);
        setOthers([]);
      }
    };

    fetchObservations();
  }, [snapshotID]);

  return (
    <div>
      <h1>Plants</h1>
      <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
        {editing && <PlantObservationFormDialog newPlant={true} />}
        <ObservationsList observations={trees} listName={'Trees'} editing={editing} />
        <ObservationsList observations={shrubs} listName={'Shrubs'} editing={editing} />
        <ObservationsList observations={grasses} listName={'Grasses'} editing={editing} />
        <ObservationsList observations={others} listName={'Others'} editing={editing} />
      </div>
    </div>
  );
}
