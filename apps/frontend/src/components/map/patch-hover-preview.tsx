import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PolygonHoverData } from '../../../types/polygon.types';

interface PatchHoverPreviewProps {
  hoverData: PolygonHoverData;
  position: { x: number; y: number };
}

export default function PatchHoverPreview({ hoverData, position }: PatchHoverPreviewProps) {
  if (!hoverData) return null;

  const { patchId, isLoading, snapshot, observations, error } = hoverData;

  // Get unique plants with their total quantities
  const plantSummary = observations?.reduce((acc, obs) => {
    const plantName = obs.PlantInfo.plantCommonName || obs.PlantInfo.plantScientificName || 'Unknown Plant';
    if (acc[plantName]) {
      acc[plantName] += obs.plantQuantity;
    } else {
      acc[plantName] = obs.plantQuantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalPlants = observations?.reduce((sum, obs) => sum + obs.plantQuantity, 0) || 0;

  return (
    <div 
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 10,
        top: position.y - 10,
        transform: 'translateY(-100%)'
      }}
    >
      <Card className="w-64 bg-white shadow-lg border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Patch {patchId}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Loading data...</span>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}
          
          {!isLoading && !error && snapshot && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                Last updated: {snapshot.dateCreated.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
              
              {plantSummary && Object.keys(plantSummary).length > 0 ? (
                <div className="text-sm">
                  <div className="font-medium mb-1">
                    Plants ({totalPlants} total):
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {Object.entries(plantSummary)
                      .slice(0, 4) // Show max 4 plant types
                      .map(([plantName, quantity]) => (
                        <div key={plantName} className="flex justify-between text-xs">
                          <span className="text-gray-700 truncate mr-2">
                            {plantName}
                          </span>
                          <span className="text-gray-600 flex-shrink-0">
                            {quantity}
                          </span>
                        </div>
                      ))}
                    {Object.keys(plantSummary).length > 4 && (
                      <div className="text-xs text-gray-500 italic">
                        +{Object.keys(plantSummary).length - 4} more species
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No plants recorded
                </div>
              )}
            </div>
          )}
          
          {!isLoading && !error && !snapshot && (
            <div className="text-sm text-gray-500">
              No snapshot data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 