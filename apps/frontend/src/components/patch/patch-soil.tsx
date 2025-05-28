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
      return <Mountain className="w-4 h-4 text-amber-600" />;
    case 'sandy loam':
      return <Waves className="w-4 h-4 text-green-600" />;
    case 'pond':
      return <Droplets className="w-4 h-4 text-blue-600" />;
    default:
      return <Mountain className="w-4 h-4 text-slate-500" />;
  }
};

const getSoilColor = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'sandy loam':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pond':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getSoilIconBackground = (soilType: string) => {
  const type = soilType?.toLowerCase();
  switch (type) {
    case 'sand':
      return 'bg-amber-50';
    case 'sandy loam':
      return 'bg-green-50';
    case 'pond':
      return 'bg-blue-50';
    default:
      return 'bg-slate-50';
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
                  <Button variant="ghost" size="sm" className="hover:bg-slate-50">
                    <Edit className="w-4 h-4 text-slate-600" />
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
