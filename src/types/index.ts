export interface ReminderSettings {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  message: string;
  enabled: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: Date;
  motto: string;
  notificationFrequency: string;
  type: string;
  lifeExpectancy?: number;
  createdAt?: Date;
}

export const DEFAULT_LIFE_EXPECTANCY = 80;
