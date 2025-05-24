import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';

export default function DeletePlantButton({
  plantCommonName,
  plantID,
  callBack,
}: {
  plantCommonName: string;
  plantID: string;
  callBack: () => void;
}) {
  async function deletePlant() {
    const token = localStorage.getItem('authToken');
    const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
    const api_path = `${baseUrl}/plants/${plantID}`;
    const response = await fetch(api_path, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error('Error deleting plant:', response.statusText);
      alert('Failed to delete plant. Please try again.');
      return;
    }
    callBack();
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <img src="/icons/trash-can.svg" alt="Delete" className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Deleting {plantCommonName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p>Are you sure you want to delete this plant?</p>
          <p>
            This action cannot be undone. All data associated with this plant will be permanently
            deleted.
          </p>

          <Button
            variant="destructive"
            onClick={() => {
              deletePlant();
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
