export interface CountdownEvent {
    id: string;
    name: string;
    targetDate: Date;
    createdAt: Date;
    type: 'life' | 'custom';
    motto?: string; // For life countdown
    birthDate?: Date; // For life countdown
    expectedLifespan?: number; // For life countdown
}

export interface CountdownState {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    progress: number; // 0 to 1 representing progress towards the target date
}

export interface Block {
    id: string;
    type: 'life' | 'custom';
    position: number;
} 