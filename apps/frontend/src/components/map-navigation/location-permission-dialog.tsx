import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LocationPermissionDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

export default function LocationPermissionDialog({ 
  open, 
  onAccept, 
  onDecline,
  onClose
}: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Access Recommended
          </DialogTitle>
          <DialogDescription className="text-left space-y-3">
            <p>
              We recommend enabling location access to provide you with enhanced mapping features:
            </p>
            <div className="space-y-2 ml-2">
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-sm">
                  <strong>Automatically detect your current grid patch</strong> - Know exactly which patch (e.g., A1, B5) you're standing on
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-sm">
                  <strong>Visual location indicator</strong> - See your position marked on the map with a red marker when you're between patches
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-sm">
                  <strong>Patch highlighting</strong> - Your current patch will be highlighted in green for easy identification
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-sm">
                  <strong>Real-time position updates</strong> - Track your movement across different grid patches as you explore
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 pt-2 border-t">
              Privacy: Your location data is only used locally in your browser and is never stored on our servers or shared with third parties.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Skip for Now
          </Button>
          <Button onClick={onAccept} className="w-full sm:w-auto">
            Enable Location Tracking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 