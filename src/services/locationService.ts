import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coords: LocationCoords | null;
  message: string | null;
}

export async function getCurrentLocation(): Promise<LocationResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        coords: null,
        message: 'Permissão de localização negada. A inspeção será salva sem coordenadas GPS.',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      message: null,
    };
  } catch {
    return {
      coords: null,
      message: 'Não foi possível obter a localização atual. A inspeção será salva sem coordenadas GPS.',
    };
  }
}
