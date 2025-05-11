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
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  }

  private async scheduleReminder(settings: ReminderSettings, birthDate: Date, expectedLifespan: number) {
    // Cancel all previous notifications
    await LocalNotifications.cancel({ notifications: [] });

    if (!settings.enabled) return;

    const intervalMap = {
      daily: 24 * 60 * 60 * 1000,    // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    const remainingTime = calculateRemainingTime(birthDate, expectedLifespan);
    const formattedTime = formatRemainingTime(remainingTime);
    const now = Date.now();
    const notificationBody = `You have ${formattedTime} left.\n\nPersonal message: ${settings.message}`;

    // Schedule the first notification for now + interval
    const interval = intervalMap[settings.frequency];
    const notifications = [
      {
        id: 1,
        title: 'Life Progress Reminder',
        body: notificationBody,
        schedule: { at: new Date(now + interval) },
        sound: null,
        attachments: null,
        actionTypeId: '',
        extra: null,
      },
    ];
    await LocalNotifications.schedule({ notifications });
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
}

export const notificationService = NotificationService.getInstance(); 