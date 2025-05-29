import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Leaf, Trash2 } from 'lucide-react';
import { useContext } from 'react';
import { Observation } from 'types/database_types';
import ObservationFormDialog from './observation-form-dialog';
import ObservationEditorContext from './observations-editor-context';

export default function ObservationItem({
  observation,
  editing,
}: {
  observation: Observation;
  editing?: boolean;
}) {
  const { deleteObservation, updateObservation } = useContext(ObservationEditorContext);
  
  return (
    <Card className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Plant Name and Scientific Name */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  {observation.PlantInfo.plantCommonName}
                </h3>
                {observation.PlantInfo.plantScientificName && (
                  <p className="text-sm italic text-muted-foreground">
                    {observation.PlantInfo.plantScientificName}
                  </p>
                )}
              </div>
            </div>

            {/* Native Status Badge */}
            {observation.PlantInfo.isNative != null && (
              <div className="mb-3">
                <Badge 
                  variant={observation.PlantInfo.isNative ? "default" : "secondary"}
                  className={observation.PlantInfo.isNative 
                    ? "bg-green-100 text-green-800 hover:bg-green-200" 
                    : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                  }
                >
                  {observation.PlantInfo.isNative ? 'Native' : 'Non-native'}
                </Badge>
              </div>
            )}

            <div className="border-t border-border my-3" />

            {/* Plant Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground min-w-16">Quantity:</span>
                <span className="font-medium">{observation.plantQuantity}</span>
              </div>

              {observation.datePlanted && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-16">Planted:</span>
                  <span className="font-medium">
                    {new Date(observation.datePlanted).toLocaleDateString()}
                  </span>
                </div>
              )}

              {observation.hasBloomed !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-16">Bloomed:</span>
                  <Badge 
                    variant={observation.hasBloomed ? "default" : "outline"} 
                    className={"text-xs"}
                  >
                    {observation.hasBloomed ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex gap-1 ml-4">
              <ObservationFormDialog
                newObservation={false}
                observation={observation}
                submitCallback={updatedObservation => {
                  updateObservation(updatedObservation);
                }}
                trigger={
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span className="sr-only">Edit observation</span>
                  </Button>
                }
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover:bg-red-50"
                onClick={() => deleteObservation(observation.tempKey)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span className="sr-only">Delete observation</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
