import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sprout } from 'lucide-react';
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

  const totalObservations = trees.length + shrubs.length + grasses.length + forbs.length + others.length + uncategorized.length;

  return (
    <ObservationEditorContext.Provider
      value={{ deleteObservation, updateObservation, addObservation }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sprout className="w-5 h-5 text-secondary-green" />
              <div>
                <CardTitle>Plant Observations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {totalObservations === 0 ? 'No plants recorded' : `${totalObservations} plant${totalObservations === 1 ? '' : 's'} recorded`}
                </p>
              </div>
            </div>
            
            {totalObservations > 0 && (
              <Badge variant="outline">
                {totalObservations}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {editing && (
            <div className="mb-6">
              <ObservationFormDialog 
                newObservation={true} 
                submitCallback={addObservation}
                trigger={
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Plant Observation
                  </Button>
                }
              />
            </div>
          )}

          {totalObservations === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-secondary-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-secondary-green" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No plants recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                {editing ? 'Start by adding your first plant observation.' : 'No plant observations have been recorded for this snapshot.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <ObservationsList observations={trees} listName={'Trees'} subCategory={'tree'} editing={editing} />
              <ObservationsList observations={shrubs} listName={'Shrubs'} subCategory={'shrub'} editing={editing} />
              <ObservationsList observations={grasses} listName={'Grasses'} subCategory={'grass'} editing={editing} />
              <ObservationsList observations={forbs} listName={'Forbs'} subCategory={'forb'} editing={editing} />
              <ObservationsList observations={others} listName={'Others'} subCategory={'other'} editing={editing} />
              <ObservationsList
                observations={uncategorized}
                listName={'Uncategorized'}
                subCategory={'uncategorized'}
                editing={editing}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </ObservationEditorContext.Provider>
  );
}
