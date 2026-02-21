import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Vaccination } from '../utils/vaccinationSchedule';
import { differenceInDays, parseISO } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    alert('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push notification permissions!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vaccination-reminders', {
      name: 'Vaccination Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
}

export async function scheduleVaccinationNotifications(vaccination: Vaccination) {
  try {
    const dueDate = parseISO(vaccination.due_date);
    const now = new Date();
    const daysUntilDue = differenceInDays(dueDate, now);

    // Cancel any existing notifications for this vaccination
    await cancelNotificationForVaccination(vaccination.id);

    // Only schedule if the vaccination is in the future
    if (daysUntilDue > 0 && !vaccination.completed) {
      // Schedule 1 week before notification
      if (daysUntilDue >= 7) {
        const oneWeekBefore = new Date(dueDate);
        oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
        oneWeekBefore.setHours(9, 0, 0, 0); // 9 AM

        await Notifications.scheduleNotificationAsync({
          identifier: `vac_${vaccination.id}_week`,
          content: {
            title: '📅 Vaccination Reminder',
            body: `${vaccination.name} is due in 1 week. Don't forget to schedule an appointment!`,
            data: { vaccinationId: vaccination.id, type: 'week_before' },
            sound: true,
          },
          trigger: {
            date: oneWeekBefore,
            channelId: 'vaccination-reminders',
          },
        });
      }

      // Schedule 1 day before notification
      if (daysUntilDue >= 1) {
        const oneDayBefore = new Date(dueDate);
        oneDayBefore.setDate(oneDayBefore.getDate() - 1);
        oneDayBefore.setHours(9, 0, 0, 0); // 9 AM

        await Notifications.scheduleNotificationAsync({
          identifier: `vac_${vaccination.id}_day`,
          content: {
            title: '⚠️ Vaccination Tomorrow!',
            body: `${vaccination.name} is due tomorrow. Make sure you're ready!`,
            data: { vaccinationId: vaccination.id, type: 'day_before' },
            sound: true,
          },
          trigger: {
            date: oneDayBefore,
            channelId: 'vaccination-reminders',
          },
        });
      }
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

export async function cancelNotificationForVaccination(vaccinationId: string) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    const notificationsToCancel = scheduledNotifications.filter(
      notif => 
        notif.identifier === `vac_${vaccinationId}_week` || 
        notif.identifier === `vac_${vaccinationId}_day`
    );

    for (const notif of notificationsToCancel) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

export async function scheduleAllVaccinationNotifications(vaccinations: Vaccination[]) {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return;
  }

  // Cancel all existing notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule new notifications for all upcoming vaccinations
  for (const vaccination of vaccinations) {
    if (!vaccination.completed) {
      await scheduleVaccinationNotifications(vaccination);
    }
  }
}

export async function getScheduledNotificationsCount(): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return 0;
  }
}
