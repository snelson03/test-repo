import { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { showRoomAvailableNotification } from '../utils/notifications';
import { usersAPI, authAPI, buildingsAPI } from '../utils/api';

export function useRoomAvailabilityNotifications() {
  const previousAvailability = useRef<Record<string, boolean>>({});
  const hasInitialized = useRef(false);

  useEffect(() => {
    const checkFavorites = async () => {
      try {
        // Don't poll until the user is logged in
        const isAuthenticated = await authAPI.isAuthenticated();

        if (!isAuthenticated) {
          return;
        }

        const [favorites, buildings] = await Promise.all([
          usersAPI.getFavorites(),
          buildingsAPI.getAll(),
        ]);

        const currentAvailability: Record<string, boolean> = {};

        for (const room of favorites) {
          const roomId = String(room.id);
          const isAvailable = !!room.is_available;
          const wasAvailable = previousAvailability.current[roomId];

          currentAvailability[roomId] = isAvailable;

          // Find the building name from building_id
          const buildingName =
            buildings.find((building) => building.id === room.building_id)?.name ||
            'Building';

          const roomNumber = room.room_number || 'Room';

          // Only notify when it changes from unavailable to available
          const becameAvailable =
            hasInitialized.current &&
            wasAvailable === false &&
            isAvailable === true;

          if (becameAvailable) {
            if (Platform.OS === 'web') {
              window.alert(`Room ${roomNumber} in ${buildingName} is now available`);
            } else {
              Alert.alert(
                'Room available',
                `Room ${roomNumber} in ${buildingName} is now available`
              );
            }

            await showRoomAvailableNotification(roomNumber, buildingName);
          }
        }

        previousAvailability.current = currentAvailability;
        hasInitialized.current = true;
      } catch (error) {
        console.log('Skipping notification check');
      }
    };

    checkFavorites();
    const interval = setInterval(checkFavorites, 5000);

    return () => clearInterval(interval);
  }, []);
}