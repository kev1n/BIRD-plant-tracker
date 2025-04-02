import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Observation } from 'types/database_types';
import ObservationForm from './observation-form';

export default function ObservationFormDialog({
  newPlant,
  observation,
  submitCallback,
}: {
  observation?: Observation;
  newPlant: boolean;
  submitCallback: (observation: Observation) => void;
}) {
  const [open, setopen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogTrigger asChild>
        <Button variant="outline">{newPlant ? 'New Plant' : 'Editing Plant'}</Button>
      </DialogTrigger>

      <DialogContent className="overflow-y-scroll max-h-[80vh]">
        <DialogHeader>
          {newPlant ? (
            <DialogTitle>New Plant</DialogTitle>
          ) : (
            <DialogTitle>Editing Plant</DialogTitle>
          )}
        </DialogHeader>

        <ObservationForm />
      </DialogContent>
    </Dialog>
  );
}
