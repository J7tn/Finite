import { Block } from '../types/countdown';

export class BlockManager {
    private static instance: BlockManager;
    private blocks: Block[] = [];

    private constructor() {
        this.loadBlocks();
    }

    public static getInstance(): BlockManager {
        if (!BlockManager.instance) {
            BlockManager.instance = new BlockManager();
        }
        return BlockManager.instance;
    }

    public getBlocks(): Block[] {
        return [...this.blocks].sort((a, b) => a.position - b.position);
    }

    public addBlock(type: 'life' | 'custom'): Block {
        const newBlock: Block = {
            id: crypto.randomUUID(),
            type,
            position: this.blocks.length
        };
        
        this.blocks.push(newBlock);
        this.saveBlocks();
        return newBlock;
    }

    public removeBlock(id: string): void {
        this.blocks = this.blocks.filter(block => block.id !== id);
        this.reorderPositions();
        this.saveBlocks();
    }

    public moveBlock(id: string, newPosition: number): void {
        const block = this.blocks.find(b => b.id === id);
        if (!block) return;

        const oldPosition = block.position;
        if (oldPosition === newPosition) return;

        // Update positions of affected blocks
        this.blocks.forEach(b => {
            if (oldPosition < newPosition) {
                if (b.position > oldPosition && b.position <= newPosition) {
                    b.position--;
                }
            } else {
                if (b.position >= newPosition && b.position < oldPosition) {
                    b.position++;
                }
            }
        });

        block.position = newPosition;
        this.saveBlocks();
    }

    private reorderPositions(): void {
        this.blocks.sort((a, b) => a.position - b.position);
        this.blocks.forEach((block, index) => {
            block.position = index;
        });
    }

    private saveBlocks(): void {
        localStorage.setItem('countdownBlocks', JSON.stringify(this.blocks));
    }

    private loadBlocks(): void {
        const savedBlocks = localStorage.getItem('countdownBlocks');
        if (savedBlocks) {
            this.blocks = JSON.parse(savedBlocks);
        }
    }
} 