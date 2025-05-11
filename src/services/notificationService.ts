import { ReminderSettings } from '@/components/ReminderSettings';
import { calculateRemainingTime, formatRemainingTime } from '@/utils/timeCalculations';

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
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  private scheduleReminder(settings: ReminderSettings, birthDate: Date, expectedLifespan: number) {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }

    if (!settings.enabled) return;

    const intervalMap = {
      daily: 24 * 60 * 60 * 1000,    // 24 hours
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 days
      monthly: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    const showNotification = () => {
      const remainingTime = calculateRemainingTime(birthDate, expectedLifespan);
      const formattedTime = formatRemainingTime(remainingTime);

      const notificationOptions = {
        body: `You have ${formattedTime} left.\n\nPersonal message: ${settings.message}`,
        icon: '/logo.svg', // Updated to use SVG logo
        badge: '/logo.svg', // Added badge for better notification appearance
        image: '/logo.svg'  // Added image for rich notifications
      } as NotificationOptions & { image?: string };

      new Notification('Life Progress Reminder', notificationOptions);
    };

    // Show notification immediately
    showNotification();

    // Schedule future notifications
    this.reminderInterval = window.setInterval(showNotification, intervalMap[settings.frequency]);
  }

  startReminders(settings: ReminderSettings, birthDate: Date, expectedLifespan: number) {
    this.requestPermission().then(permissionGranted => {
      if (permissionGranted) {
        this.scheduleReminder(settings, birthDate, expectedLifespan);
      }
    });
  }

  stopReminders() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }
}

export const notificationService = NotificationService.getInstance(); 