import React, { useState, useEffect, useMemo } from 'react';
import type { Quiz, Player, Question, PlayerAnswer } from '../../types';
import { QuestionType, GameState } from '../../types';
import Button from './Button';
import Card from './Card';
import { FiftyFiftyIcon } from '../icons/FiftyFiftyIcon';
import { PointDoublerIcon } from '../icons/PointDoublerIcon';
import { MemoizedPlayerConsole } from './PlayerConsole';

interface PlayerQuestionActiveProps {
    quiz: Quiz;
    player: Player;
    question: Question;
    allPlayers: Player[];
    submitAnswer: (answer: PlayerAnswer['answer']) => void;
    lifelineUsedThisTurn: 'fiftyFifty' | 'pointDoubler' | null;
    eliminatedOptions: number[];
    handleLifelineClick: (type: 'fiftyFifty' | 'pointDoubler') => void;
    isUsingLifeline: boolean;
    canUseFiftyFifty: boolean;
    canUsePointDoubler: boolean;
    fiftyFiftyCost: number;
    confirmingLifeline: 'fiftyFifty' | 'pointDoubler' | null;
    setConfirmingLifeline: React.Dispatch<React.SetStateAction<'fiftyFifty' | 'pointDoubler' | null>>;
    handleUseLifeline: (type: 'fiftyFifty' | 'pointDoubler') => void;
}

export const PlayerQuestionActive: React.FC<PlayerQuestionActiveProps> = ({
    quiz, player, question, allPlayers, submitAnswer, lifelineUsedThisTurn, eliminatedOptions,
    handleLifelineClick, isUsingLifeline, canUseFiftyFifty, canUsePointDoubler, fiftyFiftyCost,
    confirmingLifeline, setConfirmingLifeline, handleUseLifeline
}) => {
    const [selectedMatches, setSelectedMatches] = useState<Array<number | null>>([]);
    const [wordCloudInput, setWordCloudInput] = useState('');
    const [showGoAnimation, setShowGoAnimation] = useState(false);
    
    const [playerStats, setPlayerStats] = useState({ rank: '-', pointsBehind: 0, isLeader: false });

     useEffect(() => {
        if (!allPlayers || !player || !quiz || allPlayers.length === 0) {
            return;
        }
    
        const sortedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);
        const playerIndex = sortedPlayers.findIndex(p => p.id === player.id);
        
        if (playerIndex === -1) return;

        const rank = playerIndex + 1;
        const isLeader = rank === 1;
        const leaderScore = sortedPlayers[0].score;
        const playerScore = sortedPlayers[playerIndex].score;
        const pointsBehind = leaderScore - playerScore;

        setPlayerStats({ rank: rank.toString(), pointsBehind, isLeader });
    }, [allPlayers, player, quiz.gameState]);

    useEffect(() => {
        if (question.type === QuestionType.MATCH) {
            const numPairs = question.matchPairs?.length || 0;
            setSelectedMatches(Array(numPairs).fill(null));
        } else if (question.type === QuestionType.WORD_CLOUD) {
            setWordCloudInput('');
        }
    }, [question]);

    useEffect(() => {
        if (quiz.gameState === GameState.QUESTION_ACTIVE) {
            setShowGoAnimation(true);
            const timer = setTimeout(() => setShowGoAnimation(false), 1500);
            return () => clearTimeout(timer);
        }
    }, [quiz.gameState]);
    
    const optionColors = useMemo(() => [
        'bg-[#ef4444] border-[#b91c1c]', // Red
        'bg-[#3b82f6] border-[#1d4ed8]', // Blue
        'bg-[#facc15] border-[#a16207]', // Yellow
        'bg-[#22c55e] border-[#15803d]', // Green
        'bg-[#a855f7] border-[#7e22ce]', // Purple
        'bg-[#ec4899] border-[#be185d]', // Pink
    ], []);

    const isInteractive = quiz.gameState === GameState.QUESTION_ACTIVE;

    const renderLifelines = () => {
        if (question.type !== QuestionType.MCQ) return null;
        
        return (
            <div className="flex justify-center gap-8 my-2">
                {/* 50:50 Lifeline */}
                <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                        <button
                            onClick={() => handleLifelineClick('fiftyFifty')}
                            disabled={isUsingLifeline || lifelineUsedThisTurn !== null || !canUseFiftyFifty}
                            className={`w-14 h-14 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center transition-all active:scale-95 ${!canUseFiftyFifty || lifelineUsedThisTurn !== null ? 'opacity-40 grayscale' : 'hover:shadow-lg'}`}
                        >
                            <FiftyFiftyIcon className="w-8 h-8" />
                            {lifelineUsedThisTurn === 'fiftyFifty' && (
                                <div className="absolute inset-0 bg-slate-900/20 rounded-xl flex items-center justify-center">
                                    <div className="w-8 h-1 bg-red-500 rotate-45 absolute"></div>
                                    <div className="w-8 h-1 bg-red-500 -rotate-45 absolute"></div>
                                </div>
                            )}
                        </button>
                        <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                            -{fiftyFiftyCost}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">50:50</span>
                </div>

                {/* Point Doubler Lifeline */}
                <div className="flex flex-col items-center gap-1">
                    <div className="relative">
                        <button
                            onClick={() => handleLifelineClick('pointDoubler')}
                            disabled={isUsingLifeline || lifelineUsedThisTurn !== null || !canUsePointDoubler}
                            className={`w-14 h-14 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center transition-all active:scale-95 ${!canUsePointDoubler || lifelineUsedThisTurn !== null ? 'opacity-40 grayscale' : 'hover:shadow-lg'}`}
                        >
                            {player.lifelines.pointDoubler > 0 ? (
                                <PointDoublerIcon className="w-8 h-8 text-indigo-600" />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            )}
                        </button>
                        {player.lifelines.pointDoubler > 0 && (
                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white flex items-center gap-0.5">
                                🔥 {player.lifelines.pointDoubler}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">2X</span>
                </div>
            </div>
        );
    };

    const renderMCQ = () => (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
            {/* Question Card */}
            <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-md z-10 uppercase tracking-widest">
                    Question {quiz.currentQuestionIndex + 1}/{quiz.questions.length}
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-6 pt-8 text-center border border-slate-50">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                        {question.text}
                    </h1>
                </div>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt, i) => {
                    const isEliminated = eliminatedOptions.includes(i);
                    return (
                        <button
                            key={i}
                            onClick={() => submitAnswer(i)}
                            disabled={!isInteractive || isEliminated}
                            className={`relative w-full min-h-[70px] p-4 text-white font-black text-sm sm:text-base rounded-2xl border-b-4 transition-all active:translate-y-1 active:border-b-0 disabled:opacity-30 disabled:cursor-not-allowed ${optionColors[i % optionColors.length]} ${isEliminated ? 'grayscale' : 'hover:brightness-110'}`}
                        >
                            <span className="block w-full break-words">{opt}</span>
                        </button>
                    );
                })}
            </div>

            {renderLifelines()}
        </div>
    );

    const renderQuestionBody = () => {
        switch (question.type) {
            case QuestionType.MCQ:
            case QuestionType.SURVEY:
                return renderMCQ();
            case QuestionType.WORD_CLOUD:
                return (
                    <div className="w-full max-w-md mx-auto space-y-4">
                        <h1 className="text-xl font-black text-center text-slate-800">{question.text}</h1>
                        <input
                            type="text"
                            value={wordCloudInput}
                            onChange={(e) => setWordCloudInput(e.target.value)}
                            disabled={!isInteractive}
                            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 text-lg font-bold focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                            placeholder="Type your answer..."
                        />
                        <Button onClick={() => submitAnswer(wordCloudInput)} disabled={!isInteractive || !wordCloudInput.trim()} className="bg-indigo-600">Submit</Button>
                    </div>
                );
            case QuestionType.MATCH:
                return (
                    <div className="w-full max-w-lg mx-auto space-y-3">
                        <h1 className="text-xl font-black text-center text-slate-800 mb-4">{question.text}</h1>
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {question.matchPairs?.map((pair, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                    <span className="flex-1 font-bold text-slate-700 text-sm">{pair.prompt}</span>
                                    <select
                                        value={selectedMatches[idx] ?? ''}
                                        onChange={(e) => {
                                            const newMatches = [...selectedMatches];
                                            newMatches[idx] = parseInt(e.target.value, 10);
                                            setSelectedMatches(newMatches);
                                        }}
                                        disabled={!isInteractive}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold"
                                    >
                                        <option value="" disabled>Select...</option>
                                        {question.options.map((opt, optIdx) => (
                                            <option key={optIdx} value={optIdx} disabled={selectedMatches.includes(optIdx) && selectedMatches[idx] !== optIdx}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => submitAnswer(selectedMatches)} disabled={!isInteractive || selectedMatches.some(m => m === null)} className="bg-indigo-600 mt-4">Submit Match</Button>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="w-full h-full flex flex-col p-3 sm:p-4 relative">
            {isInteractive && showGoAnimation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pointer-events-none animate-fade-in">
                    <span className="text-8xl font-black text-white animate-pop-in italic tracking-tighter" style={{ textShadow: '4px 4px 0 #4f46e5' }}>
                        GO!
                    </span>
                </div>
            )}
            
            {confirmingLifeline && (
                <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                    <Card className="max-w-xs w-full text-center p-6">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            {confirmingLifeline === 'fiftyFifty' ? <FiftyFiftyIcon className="w-8 h-8" /> : <PointDoublerIcon className="w-8 h-8 text-indigo-600" />}
                        </div>
                        <h2 className="text-xl font-black mb-2 text-slate-800">Use Lifeline?</h2>
                        <p className="text-sm font-bold text-slate-500 mb-6">
                            {confirmingLifeline === 'fiftyFifty' ? `Spend ${fiftyFiftyCost} points to remove two wrong answers?` : `Double your points for this question?`}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmingLifeline(null)} className="flex-1 py-3 font-black text-slate-400 hover:text-slate-600 transition-colors">Cancel</button>
                            <button onClick={() => handleUseLifeline(confirmingLifeline)} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95">Confirm</button>
                        </div>
                    </Card>
                </div>
            )}

            <div className="flex-grow flex items-center justify-center">
                {renderQuestionBody()}
            </div>

            <div className="mt-auto pt-4">
                <MemoizedPlayerConsole player={player} playerStats={playerStats} isDarkTheme={false} />
            </div>
        </div>
    );
};
