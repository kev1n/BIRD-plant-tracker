import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from '@radix-ui/react-dialog';
import { Button } from '../ui/button';

interface RoleConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onConfirm: () => void;
}

export default function RoleConfirmationDialog({
  open,
  onOpenChange,
  message,
  onConfirm,
}: RoleConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        {/* full-screen semi-transparent backdrop */}
        <DialogOverlay
          className="fixed inset-0 bg-black/50 z-[1000]"
        />

        {/* centered content box */}
        <DialogContent
          className="
            fixed
            top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-lg shadow-xl
            p-6
            z-[1001]
          "
        >
          <DialogTitle className="mb-4 text-lg font-semibold">
            {message}
          </DialogTitle>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              Confirm
            </Button>
          </div>

          {/* optional "X" in corner */}
          <DialogClose asChild>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >&times;</button>
          </DialogClose>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
