import { ReminderSettings } from '@/components/ReminderSettings';
import { calculateRemainingTime, formatRemainingTime } from '@/utils/timeCalculations';
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  private static instance: NotificationService;
  private reminderInterval: number | null = null;

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

  private async scheduleReminder(settings: ReminderSettings, birthDate: Date, expectedLifespan: number) {
    // Cancel all previous notifications
    await LocalNotifications.cancel({ notifications: [] });

    if (!settings.enabled) {
      return;
    }

    const intervalMap = {
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
      yearly: 'year'
    } as const;

    const remainingTime = calculateRemainingTime(birthDate, expectedLifespan);
    const formattedTime = formatRemainingTime(remainingTime);
    const now = Date.now();
    const notificationBody = `You have ${formattedTime} left.\n\nPersonal message: ${settings.message}`;

    // Schedule recurring notification
    const notifications = [
      {
        id: 1,
        title: 'Life Progress Reminder',
        body: notificationBody,
        schedule: {
          on: {
            hour: 9,
            minute: 0
          },
          every: intervalMap[settings.frequency]
        },
        sound: null,
        attachments: null,
        actionTypeId: '',
        extra: null,
      },
    ];

    try {
      await LocalNotifications.schedule({ notifications });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  startReminders(settings: ReminderSettings, birthDate: Date, expectedLifespan: number) {
    this.requestPermission().then(permissionGranted => {
      if (permissionGranted) {
        this.scheduleReminder(settings, birthDate, expectedLifespan);
      }
    });
  }

  stopReminders() {
    LocalNotifications.cancel({ notifications: [] });
  }

  async sendEventArrivedNotification(eventName: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 9999,
            title: 'Event Arrived',
            body: `Your event "${eventName}" has arrived!`,
            schedule: null, // null means show immediately
          },
        ],
      });
    } catch (error) {
      console.error('Error sending event arrived notification:', error);
    }
  }

  async testNotification() {
    try {
      const permissionGranted = await this.requestPermission();

      if (permissionGranted) {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9998,
              title: 'Test Notification',
              body: 'This is a test notification to verify that notifications are working!',
              schedule: null, // Show immediately
            },
          ],
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      return false;
    }
  }
}

// Make testNotification available globally for testing
declare global {
  interface Window {
    testNotifications: () => Promise<void>;
  }
}

window.testNotifications = async () => {
  try {
    // Test permission
    const hasPermission = await NotificationService.getInstance().requestPermission();

    if (hasPermission) {
      // Test immediate notification
      await NotificationService.getInstance().sendEventArrivedNotification('Test Event');

      // Test recurring notification
      NotificationService.getInstance().startReminders({
        frequency: 'daily',
        message: 'Test daily reminder',
        enabled: true
      }, new Date('1990-01-01'), 80);
    }
  } catch (error) {
    console.error('❌ Notification test failed:', error);
  }
};

// Notification testing available via window.testNotifications()

export const notificationService = NotificationService.getInstance(); 