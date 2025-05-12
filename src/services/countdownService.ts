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

    public createEvent(
        name: string, 
        targetDate: Date, 
        motto?: string, 
        description?: string
    ): CountdownEvent {
        const event: CountdownEvent = {
            id: crypto.randomUUID(),
            name,
            targetDate,
            createdAt: new Date(),
            motto,
            description
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
        const targetDate = new Date(event.targetDate);
        const timeRemaining = targetDate.getTime() - now.getTime();

        if (timeRemaining <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                progress: 1
            };
        }

        const totalDuration = targetDate.getTime() - new Date(event.createdAt).getTime();
        const progress = 1 - (timeRemaining / totalDuration);

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

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