import * as Notifications from 'expo-notifications';

// Controls how notifications show while the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Shows a local notification when a favorite room opens up
export async function showRoomAvailableNotification(
  roomNumber: string,
  buildingName: string
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Study room available',
      body: `Room ${roomNumber} in ${buildingName} is now available.`,
    },
    trigger: null,
  });
}