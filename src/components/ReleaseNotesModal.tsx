import React from 'react';
import Card from './Card';
import Button from './Button';
import { CheckIcon } from '../icons/CheckIcon';

export const APP_VERSION = '2.0.0';
export const RELEASE_NOTES_KEY = `release-notes-seen-v${APP_VERSION}`;

export const ReleaseNotesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const updates = [
        {
            "title": "Welcome to Socrato",
            "description": "We've rebranded to Socrato! Quizumi is now a core feature of our new ecosystem."
        },
        {
            "title": "Upcoming: AI Discussion Rooms",
            "description": "Get ready for a new way to collaborate! AI-powered discussion rooms are coming soon to Socrato."
        },
        {
            "title": "Enhanced Navigation",
            "description": "Added a new navigation bar at the top to help you move easily between features and history."
        },
        {
            "title": "Unified Profile Management",
            "description": "Manage your name and roles across all Socrato features from a single, always-accessible profile menu."
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="release-notes-title">
            <Card className="w-full max-w-lg animate-pop-in" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 id="release-notes-title" className="text-2xl font-bold text-slate-800">What's New in Socrato</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl font-bold leading-none">&times;</button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
                    {updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mt-1">
                                <CheckIcon className="h-4 w-4"/>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">{update.title}</h3>
                                <p className="text-slate-500 text-sm">{update.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose} className="bg-gl-orange-600 hover:bg-gl-orange-700 w-auto px-6">
                        Got it!
                    </Button>
                </div>
            </Card>
        </div>
    );
};
