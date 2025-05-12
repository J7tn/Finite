import React, { useState, useEffect } from 'react';
import { Block } from '../types/countdown';
import { BlockManager } from '../services/blockManager';
import { CountdownTimer } from './CountdownTimer';

export const BlockContainer: React.FC = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

    useEffect(() => {
        loadBlocks();
    }, []);

    const loadBlocks = () => {
        const blockManager = BlockManager.getInstance();
        // Only show custom blocks
        setBlocks(blockManager.getBlocks().filter(b => b.type === 'custom'));
    };

    const handleDragStart = (blockId: string) => {
        setDraggedBlock(blockId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetBlockId: string) => {
        if (!draggedBlock || draggedBlock === targetBlockId) return;

        const blockManager = BlockManager.getInstance();
        const targetBlock = blocks.find(b => b.id === targetBlockId);
        if (targetBlock) {
            blockManager.moveBlock(draggedBlock, targetBlock.position);
            loadBlocks();
        }
    };

    const handleDeleteBlock = (blockId: string) => {
        const blockManager = BlockManager.getInstance();
        blockManager.removeBlock(blockId);
        loadBlocks();
    };

    const renderBlock = (block: Block) => {
        const commonProps = {
            key: block.id,
            draggable: true,
            onDragStart: () => handleDragStart(block.id),
            onDragOver: handleDragOver,
            onDrop: () => handleDrop(block.id),
            className: "mb-4 transition-transform duration-200 hover:scale-[1.02] bg-white border border-gray-300 rounded-lg shadow-sm"
        };

        return (
            <div {...commonProps}>
                <CountdownTimer
                    event={{
                        id: block.id,
                        name: "Custom Event",
                        targetDate: new Date(),
                        createdAt: new Date(),
                        type: 'custom'
                    }}
                    onDelete={() => handleDeleteBlock(block.id)}
                />
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {blocks.map(renderBlock)}
        </div>
    );
}; 