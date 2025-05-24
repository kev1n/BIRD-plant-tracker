import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import PlantForm from './new-plant-form';
export default function NewPlantFormDialog({ newPlant }: { newPlant: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newPlant ? 'New Plant' : 'Edit Plant'}</Button>
      </DialogTrigger>

      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          {newPlant ? <DialogTitle>New Plant</DialogTitle> : <DialogTitle>Edit Plant</DialogTitle>}
        </DialogHeader>
        <PlantForm setDialogOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
