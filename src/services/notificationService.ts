import { ReminderSettings } from '@/types';
import { calculateRemainingTime, formatRemainingTime } from '@/utils/timeCalculations';
import { LocalNotifications } from '@capacitor/local-notifications';

interface NotificationStrings {
  title: string;
  bodyPrefix: string;
  personalMessageLabel: string;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async scheduleReminder(
    settings: ReminderSettings,
    birthDate: Date,
    expectedLifespan: number,
    strings: NotificationStrings
  ) {
    await LocalNotifications.cancel({ notifications: [] });

    if (!settings.enabled) return;

    const intervalMap = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year'
    } as const;

    const remainingTime = calculateRemainingTime(birthDate, expectedLifespan);
    const formattedTime = formatRemainingTime(remainingTime);
    const body = `${strings.bodyPrefix.replace('{time}', formattedTime)}\n\n${strings.personalMessageLabel.replace('{message}', settings.message)}`;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 1,
          title: strings.title,
          body,
          schedule: {
            on: { hour: 9, minute: 0 },
            every: intervalMap[settings.frequency]
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: null,
        }],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  startReminders(
    settings: ReminderSettings,
    birthDate: Date,
    expectedLifespan: number,
    strings: NotificationStrings
  ) {
    this.requestPermission().then(granted => {
      if (granted) {
        this.scheduleReminder(settings, birthDate, expectedLifespan, strings);
      }
    });
  }

  stopReminders() {
    LocalNotifications.cancel({ notifications: [] });
  }

  async sendEventArrivedNotification(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title,
          body,
          schedule: undefined,
        }],
      });
    } catch (error) {
      console.error('Error sending event arrived notification:', error);
    }
  }

  async testNotification() {
    try {
      const granted = await this.requestPermission();
      if (granted) {
        await LocalNotifications.schedule({
          notifications: [{
            id: 9998,
            title: 'Test Notification',
            body: 'Notifications are working!',
            schedule: undefined,
          }],
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error testing notification:', error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();
