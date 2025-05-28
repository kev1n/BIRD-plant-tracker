import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PermissionRestrictedDialog from '../utils/PermissionRestrictedDialog';
import PatchSoilEditor from './patch-soil-editor';
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
    <div>
      <h3>Soil Type: {soilType} 
        <span>
          <PermissionRestrictedDialog actionName="edit soil type">
            <PatchSoilEditor patchID={patchID} updateCallback={setSoilType} />
          </PermissionRestrictedDialog>
        </span>
      </h3>
    </div>
  );
}
