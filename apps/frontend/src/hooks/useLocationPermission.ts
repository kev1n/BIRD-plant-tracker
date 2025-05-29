import { useEffect, useState } from 'react';
import { useGeolocated } from 'react-geolocated';

export type LocationPermissionStatus = 'pending' | 'granted' | 'denied';

interface UseLocationPermissionReturn {
  coords: GeolocationCoordinates | null;
  locationPermissionStatus: LocationPermissionStatus;
  showLocationDialog: boolean;
  hasCheckedPermissions: boolean;
  handleLocationAccept: () => void;
  handleLocationDecline: () => void;
  isGeolocationEnabled: boolean;
}

export function useLocationPermission(): UseLocationPermissionReturn {
  // Location permission management
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<LocationPermissionStatus>('pending');
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  // Use useGeolocated with suppressLocationOnMount to prevent immediate location request
  const { coords, getPosition, isGeolocationEnabled, isGeolocationAvailable } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
    suppressLocationOnMount: true, // Prevent automatic location request on mount
  });

  // Check for existing location permissions on mount
  useEffect(() => {
    // Don't check permissions again if user has already interacted with the dialog
    if (userHasInteracted) return;

    const checkExistingPermissions = async () => {
      if (!isGeolocationAvailable) {
        setLocationPermissionStatus('denied');
        setShowLocationDialog(false);
        setHasCheckedPermissions(true);
        return;
      }

      try {
        // Only use the Permissions API to check existing permissions
        // Don't call any geolocation methods to avoid triggering browser prompts
        if ('permissions' in navigator && navigator.permissions) {
          try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            
            if (permission.state === 'granted') {
              setLocationPermissionStatus('granted');
              setShowLocationDialog(false);
              setHasCheckedPermissions(true);
              // Auto-start location tracking if already granted
              getPosition();
              return;
            } else if (permission.state === 'denied') {
              setLocationPermissionStatus('denied');
              setShowLocationDialog(false);
              setHasCheckedPermissions(true);
              return;
            } else {
              // Permission state is 'prompt' - show our dialog
              setLocationPermissionStatus('pending');
              setShowLocationDialog(true);
              setHasCheckedPermissions(true);
              return;
            }
          } catch {
            // Permissions API failed, fall back to showing the dialog
            setLocationPermissionStatus('pending');
            setShowLocationDialog(true);
            setHasCheckedPermissions(true);
            return;
          }
        }

        // If Permissions API is not available, always show our dialog first
        // This ensures we never trigger browser prompts without user consent
        setLocationPermissionStatus('pending');
        setShowLocationDialog(true);
        setHasCheckedPermissions(true);
      } catch {
        // If anything fails, show the dialog as fallback
        setLocationPermissionStatus('pending');
        setShowLocationDialog(true);
        setHasCheckedPermissions(true);
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timeoutId = setTimeout(checkExistingPermissions, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isGeolocationAvailable, userHasInteracted, getPosition]);

  // Update location permission status based on actual geolocation status
  useEffect(() => {
    if (locationPermissionStatus === 'granted' && isGeolocationEnabled === false) {
      setLocationPermissionStatus('denied');
    }
  }, [isGeolocationEnabled, locationPermissionStatus]);

  // Handle location permission acceptance
  const handleLocationAccept = () => {
    setUserHasInteracted(true); // Mark that user has interacted
    setShowLocationDialog(false);
    setLocationPermissionStatus('granted');
    // Manually trigger location request after user consent
    getPosition();
  };

  // Handle location permission decline
  const handleLocationDecline = () => {
    setUserHasInteracted(true); // Mark that user has interacted
    setShowLocationDialog(false);
    setLocationPermissionStatus('denied');
  };

  return {
    coords: coords || null,
    locationPermissionStatus,
    showLocationDialog,
    hasCheckedPermissions,
    handleLocationAccept,
    handleLocationDecline,
    isGeolocationEnabled,
  };
} 