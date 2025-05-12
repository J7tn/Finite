import { CountdownEvent } from '../types/countdown';

export class EventDataService {
    private static instance: EventDataService;
    private storageKey = 'countdownEventData';
    private data: Record<string, CountdownEvent> = {};

    private constructor() {
        this.load();
    }

    public static getInstance(): EventDataService {
        if (!EventDataService.instance) {
            EventDataService.instance = new EventDataService();
        }
        return EventDataService.instance;
    }

    public get(blockId: string): CountdownEvent | undefined {
        return this.data[blockId];
    }

    public set(blockId: string, event: CountdownEvent): void {
        this.data[blockId] = event;
        this.save();
    }

    public update(blockId: string, updates: Partial<CountdownEvent>): void {
        if (!this.data[blockId]) return;
        this.data[blockId] = { ...this.data[blockId], ...updates };
        this.save();
    }

    public delete(blockId: string): void {
        delete this.data[blockId];
        this.save();
    }

    public getAll(): Record<string, CountdownEvent> {
        return { ...this.data };
    }

    private save(): void {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    private load(): void {
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Convert date strings back to Date objects
            Object.keys(parsed).forEach(key => {
                if (parsed[key].targetDate) parsed[key].targetDate = new Date(parsed[key].targetDate);
                if (parsed[key].createdAt) parsed[key].createdAt = new Date(parsed[key].createdAt);
            });
            this.data = parsed;
        }
    }
} 