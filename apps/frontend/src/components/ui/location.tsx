import { useGeolocated } from "react-geolocated";

export const LocationDemo = () => {
    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: true,
            },
            userDecisionTimeout: 5000,
            watchPosition: true,
        });

    return !isGeolocationAvailable ? (
        <div>Your browser does not support Geolocation</div>
    ) : !isGeolocationEnabled ? (
        <div>Geolocation is not enabled</div>
    ) : coords ? (
      <div>
        <h1>latitude:</h1>
        <h2>{coords.latitude}</h2>
        <h1>longitutde:</h1>
        <h2>{coords.longitude}</h2>
      </div>
    ) : (
        <div>Getting the location data&hellip; </div>
    );
};