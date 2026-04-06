import React from 'react';
import type { Player } from '../../types';

const PlayerConsole: React.FC<{ player: Player | null; playerStats: { rank: string; pointsBehind: number; isLeader: boolean; }; isDarkTheme: boolean }> = ({ player, playerStats, isDarkTheme }) => {
    if (!player) return null;
    
    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-2 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-between animate-slide-in-up">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <img src={player.avatar} alt="Your avatar" className="w-10 h-10 rounded-full border-2 border-white shadow-sm"/>
                    <div className="absolute -top-1 -left-1 bg-yellow-400 text-[10px] font-bold px-1 rounded-full border border-white">
                        #{playerStats.rank}
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-800 leading-none">{player.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {playerStats.isLeader ? "YOU ARE IN THE LEAD!" : `${playerStats.pointsBehind} PTS BEHIND 1ST`}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Streak</span>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                        <span className="text-xs">🔥</span>
                        <span className="text-xs font-bold text-orange-600">{player.correctStreak || 0}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Score</span>
                    <span className="text-sm font-black text-indigo-700 leading-none">
                        {player.score.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
export const MemoizedPlayerConsole = React.memo(PlayerConsole);