import React from 'react';
import { BlockContainer } from '../components/BlockContainer';
import { BlockManager } from '../services/blockManager';

export const CountdownPage: React.FC = () => {
    const handleAddBlock = (type: 'life' | 'custom') => {
        const blockManager = BlockManager.getInstance();
        blockManager.addBlock(type);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Countdown Blocks</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => handleAddBlock('life')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Add Life Countdown
                    </button>
                    <button
                        onClick={() => handleAddBlock('custom')}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Add Custom Countdown
                    </button>
                </div>
            </div>
            
            <BlockContainer />
        </div>
    );
}; 