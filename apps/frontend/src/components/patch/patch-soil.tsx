import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Droplets, Edit, Mountain, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PermissionRestrictedDialog from '../utils/PermissionRestrictedDialog';
import PatchSoilEditor from './patch-soil-editor';

const getSoilIcon = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return <Mountain className="w-4 h-4 text-primary-light-grey" />;
    case 'sandy loam':
      return <Waves className="w-4 h-4 text-secondary-green" />;
    case 'pond':
      return <Droplets className="w-4 h-4 text-primary-green" />;
    default:
      return <Mountain className="w-4 h-4 text-secondary-light-grey" />;
  }
};

const getSoilColor = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return 'bg-primary-light-grey/20 text-primary-light-grey border-primary-light-grey/30';
    case 'sandy loam':
      return 'bg-secondary-green/20 text-secondary-green border-secondary-green/30';
    case 'pond':
      return 'bg-primary-green/20 text-primary-green border-primary-green/30';
    default:
      return 'bg-secondary-light-grey/20 text-secondary-light-grey border-secondary-light-grey/30';
  }
};

const getSoilIconBackground = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return 'bg-primary-light-grey/10';
    case 'sandy loam':
      return 'bg-secondary-green/10';
    case 'pond':
      return 'bg-primary-green/10';
    default:
      return 'bg-secondary-light-grey/10';
  }
};

const getSoilDescription = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return 'Well-draining, loose particles';
    case 'sandy loam':
      return 'Balanced drainage and nutrients';
    case 'pond':
      return 'Water-based environment';
    default:
      return 'Soil type not specified';
  }
};

export default function PatchSoil({ patchID }: { patchID: string }) {
  const [soilType, setSoilType] = useState<string>('');

  useEffect(() => {
    async function fetchPatchSoilData(patchID: string) {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      const api_path = `${baseUrl}/patch/${patchID}`;
      const response = await fetch(api_path, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        toast.error('Failed to fetch patch soil data. Please try again.');
        return;
      }
      const data = await response.json();
      setSoilType(data.data.soilType);
    }
    if (patchID) {
      fetchPatchSoilData(patchID);
    }
  }, [patchID]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${getSoilIconBackground(soilType)} rounded-full flex items-center justify-center`}>
              {getSoilIcon(soilType)}
            </div>
            <div>
              <h3 className="font-semibold">Soil Composition</h3>
              <p className="text-sm text-muted-foreground">{getSoilDescription(soilType)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getSoilColor(soilType)}>
              {soilType || 'Unknown'}
            </Badge>
            
            <PermissionRestrictedDialog actionName="edit soil type">
              <PatchSoilEditor 
                patchID={patchID} 
                updateCallback={setSoilType}
                trigger={
                  <Button variant="ghost" size="sm" className="hover:bg-secondary-light-grey/10">
                    <Edit className="w-4 h-4 text-primary-light-grey" />
                    <span className="sr-only">Edit soil type</span>
                  </Button>
                }
              />
            </PermissionRestrictedDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
