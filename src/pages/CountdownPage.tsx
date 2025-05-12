import React, { useState } from 'react';
import { BlockContainer } from '../components/BlockContainer';
import { BlockManager } from '../services/blockManager';
import { LifeCountdown } from '../components/LifeCountdown';

export const CountdownPage: React.FC = () => {
    const [_, setRerender] = useState(0);

    const handleAddCustomBlock = () => {
        const blockManager = BlockManager.getInstance();
        blockManager.addBlock('custom');
        setRerender(r => r + 1); // force rerender
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center">
                <div className="w-full max-w-xl mb-4">
                    <LifeCountdown onDelete={() => {}} />
                </div>
                <button
                    aria-label="Add custom countdown"
                    onClick={handleAddCustomBlock}
                    className="mb-6 w-10 h-10 flex items-center justify-center border border-gray-400 rounded-full text-2xl text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                    style={{ background: 'none' }}
                >
                    +
                </button>
                <div className="w-full max-w-xl">
                    <BlockContainer />
                </div>
            </div>
        </div>
    );
}; 