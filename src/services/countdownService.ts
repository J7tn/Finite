import { CountdownEvent, CountdownState } from '../types/countdown';

export class CountdownService {
    private static instance: CountdownService;
    private events: CountdownEvent[] = [];

    private constructor() {
        // Load events from localStorage on initialization
        this.loadEvents();
    }

    public static getInstance(): CountdownService {
        if (!CountdownService.instance) {
            CountdownService.instance = new CountdownService();
        }
        return CountdownService.instance;
    }

    public createEvent(name: string, targetDate: Date): CountdownEvent {
        const event: CountdownEvent = {
            id: crypto.randomUUID(),
            name,
            targetDate,
            createdAt: new Date()
        };
        
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    public deleteEvent(id: string): void {
        this.events = this.events.filter(event => event.id !== id);
        this.saveEvents();
    }

    public getEvents(): CountdownEvent[] {
        return [...this.events];
    }

    public calculateCountdownState(event: CountdownEvent): CountdownState {
        const now = new Date();
        const totalDuration = event.targetDate.getTime() - event.createdAt.getTime();
        const elapsed = now.getTime() - event.createdAt.getTime();
        const remaining = event.targetDate.getTime() - now.getTime();

        const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        return {
            days,
            hours,
            minutes,
            seconds,
            progress
        };
    }

    private saveEvents(): void {
        localStorage.setItem('countdownEvents', JSON.stringify(this.events));
    }

    private loadEvents(): void {
        const savedEvents = localStorage.getItem('countdownEvents');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents).map((event: any) => ({
                ...event,
                targetDate: new Date(event.targetDate),
                createdAt: new Date(event.createdAt)
            }));
        }
    }
} 