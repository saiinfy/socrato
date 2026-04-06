import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useUser } from '../utils/UserContext';
import { UserIcon } from '../icons/UserIcon';
import { EditIcon } from '../icons/EditIcon';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';
import { LogoutIcon } from '../icons/LogoutIcon';

export const ProfileSection = () => {
    const { uuid, name, updateProfile, logout, isAuthorized } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(name || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [stats, setStats] = useState({ quizzes: 0, questions: 0, played: 0 });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (uuid && isAuthorized) {
            const fetchStats = async () => {
                try {
                    const quizzesSnap = await db.collection('quizzes')
                        .where('organizerId', '==', uuid)
                        .get();
                    
                    const questionsSnap = await db.collection('questions')
                        .where('organizerId', '==', uuid)
                        .get();
                    
                    // Collection group query for played quizzes
                    const playedSnap = await db.collectionGroup('players')
                        .where('id', '==', uuid)
                        .get();
                    
                    setStats({
                        quizzes: quizzesSnap.size,
                        questions: questionsSnap.size,
                        played: playedSnap.size
                    });
                } catch (err) {
                    console.error("Error fetching stats:", err);
                }
            };
            fetchStats();
        }
    }, [uuid, isAuthorized]);

    const handleUpdate = async () => {
        if (!newName.trim() || newName === name) {
            setIsEditing(false);
            return;
        }
        setIsUpdating(true);
        try {
            await updateProfile(newName.trim());
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update profile:", err);
        }
        setIsUpdating(false);
    };

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            logout();
            setIsOpen(false);
        }
    };

    if (!uuid) return null;

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center space-x-2 bg-white/90 backdrop-blur-md p-2 pl-3 rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 group"
                >
                    <div className="text-right mr-1">
                        <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                            {name || 'Set Name'}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight">{isAuthorized ? 'Organizer' : 'Player'}</p>
                    </div>
                    <div className="w-8 h-8 bg-gl-orange-500 rounded-full flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                        <UserIcon className="w-5 h-5" />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-slide-in-up origin-top-right">
                        <div className="p-5 bg-slate-50 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Profile</h3>
                                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <XIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="flex-grow bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-gl-orange-500 focus:outline-none"
                                        autoFocus
                                    />
                                    <button 
                                        onClick={handleUpdate}
                                        disabled={isUpdating}
                                        className="p-2 bg-gl-orange-500 text-white rounded-lg hover:bg-gl-orange-600 transition"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between group/name">
                                    <p className="font-bold text-slate-900 text-lg truncate pr-2">{name || 'Anonymous'}</p>
                                    <button 
                                        onClick={() => {
                                            setNewName(name || '');
                                            setIsEditing(true);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-gl-orange-500 hover:bg-gl-orange-50 rounded-md transition"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isAuthorized && (
                            <div className="p-5 grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Played</p>
                                    <p className="text-xl font-black text-gl-orange-600">{stats.played}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Quizzes</p>
                                    <p className="text-xl font-black text-gl-orange-600">{stats.quizzes}</p>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                                    <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter mb-1">Questions</p>
                                    <p className="text-xl font-black text-gl-orange-600">{stats.questions}</p>
                                </div>
                            </div>
                        )}

                        <div className="px-5 pb-5 space-y-2">
                            <div className={`p-3 rounded-xl border flex items-center justify-between ${isAuthorized ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isAuthorized ? 'text-blue-700' : 'text-slate-700'}`}>Status</span>
                                <span className={`${isAuthorized ? 'bg-blue-500' : 'bg-slate-500'} text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase`}>
                                    {isAuthorized ? 'Authorized' : 'Guest'}
                                </span>
                            </div>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-sm"
                            >
                                <LogoutIcon className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
