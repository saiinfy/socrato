import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { ReleaseNotesModal, RELEASE_NOTES_KEY } from '../components/ReleaseNotesModal';
import { WandIcon } from '../icons/WandIcon';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { useUser } from '../utils/UserContext';
import { ProfileSection } from '../components/ProfileSection';
import { db } from '../../firebase';
import { motion, useSpring, useTransform, useInView } from 'motion/react';

const Counter = ({ value, label }: { value: number, label: string }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(0, { mass: 1, stiffness: 100, damping: 30 });
    const displayValue = useTransform(spring, (current) => Math.round(current).toLocaleString());

    React.useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return (
        <div ref={ref} className="flex flex-col items-center">
            <motion.span className="text-2xl font-black text-gl-orange-600">
                {displayValue}
            </motion.span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
};

const SocratoHomePage = () => {
    const { uuid, name, updateProfile } = useUser();
    const navigate = useNavigate();
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isSettingName, setIsSettingName] = useState(false);
    const [globalStats, setGlobalStats] = useState({ quizzes: 0, organizers: 0, questions: 0 });

    useEffect(() => {
        const fetchGlobalStats = async () => {
            try {
                const [quizzesSnap, organizersSnap, questionsSnap] = await Promise.all([
                    db.collection('quizzes').get(),
                    db.collection('organizers').get(),
                    db.collection('questionBank').get()
                ]);
                setGlobalStats({
                    quizzes: quizzesSnap.size,
                    organizers: organizersSnap.size,
                    questions: questionsSnap.size
                });
            } catch (err) {
                console.error("Error fetching global stats:", err);
            }
        };
        fetchGlobalStats();
    }, []);

    useEffect(() => {
        const hasSeenNotes = localStorage.getItem(RELEASE_NOTES_KEY);
        if (!hasSeenNotes) {
            setShowReleaseNotes(true);
        }
    }, []);

    const handleSetName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tempName.trim()) return;
        setIsSettingName(true);
        try {
            await updateProfile(tempName.trim());
        } catch (err) {
            console.error("Error setting name:", err);
        }
        setIsSettingName(false);
    };

    const handleCloseReleaseNotes = () => {
        setShowReleaseNotes(false);
        localStorage.setItem(RELEASE_NOTES_KEY, 'true');
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-start pt-12 sm:pt-20 p-4 animate-fade-in relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gl-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />

            {showReleaseNotes && <ReleaseNotesModal onClose={handleCloseReleaseNotes} />}
            
            <ProfileSection />
            
            <div className="w-full max-w-4xl flex flex-col items-center text-center mb-12">
                <div className="mb-6 inline-flex items-center justify-center p-1 rounded-2xl bg-white/50 backdrop-blur-sm border border-white shadow-sm">
                    <div className="w-12 h-12 bg-gl-orange-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white text-xl font-black">S</span>
                    </div>
                    <span className="px-4 text-slate-800 font-bold tracking-tight uppercase">Socrato</span>
                </div>

                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 mb-4 leading-tight">
                    {name ? (
                        <>Hello, <span className="text-gl-orange-600">{name}</span>!</>
                    ) : (
                        <>Welcome to <span className="text-gl-orange-600">Socrato</span></>
                    )}
                </h1>
                
                <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
                    The ultimate ecosystem for real-time collaboration and trivia. Choose your destination below.
                </p>
            </div>

            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                {/* Name Setting Flow - Only for organizers (users with token/uuid) */}
                {!name && uuid && (
                    <Card className="md:col-span-2 bg-gradient-to-br from-gl-orange-500 to-gl-orange-600 border-none text-white p-8 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-3xl font-black mb-2">Wait, we haven't met!</h2>
                                <p className="text-gl-orange-50 opacity-90 text-lg">Set your display name to start your journey across Socrato.</p>
                            </div>
                            <form onSubmit={handleSetName} className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                                <input 
                                    type="text" 
                                    placeholder="Enter your name..."
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value)}
                                    className="px-6 py-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg font-bold min-w-[240px]"
                                    required
                                />
                                <button 
                                    type="submit"
                                    disabled={isSettingName}
                                    className="px-8 py-4 bg-white text-gl-orange-600 rounded-xl font-black text-lg hover:bg-gl-orange-50 transition-colors shadow-lg disabled:opacity-50"
                                >
                                    {isSettingName ? 'Setting...' : 'Let\'s Go!'}
                                </button>
                            </form>
                        </div>
                    </Card>
                )}

                {/* Destination: Quizumi */}
                <Card className="group hover:shadow-2xl transition-all duration-500 border-slate-100 flex flex-col h-full bg-white/80 backdrop-blur-sm">
                    <div className="mb-6 w-16 h-16 bg-gl-orange-100 text-gl-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gl-orange-200">
                        <span className="text-2xl font-black">Q</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">Quizumi</h2>
                    <p className="text-slate-500 mb-6 flex-grow text-lg">The ultimate real-time trivia challenge. Create, compete, and conquer with friends or colleagues.</p>
                    
                    {/* Global Stats Counters */}
                    <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Counter value={globalStats.quizzes} label="Quizzes" />
                        <Counter value={globalStats.organizers} label="Organizers" />
                        <Counter value={globalStats.questions} label="Questions" />
                    </div>

                    <Link to="/quizumi" className="w-full">
                        <button className="w-full py-5 bg-gl-orange-600 text-white rounded-2xl font-black text-xl hover:bg-gl-orange-700 transition-all shadow-lg flex items-center justify-center gap-2 group-hover:translate-y-[-4px] active:translate-y-0">
                            Enter Quizumi
                        </button>
                    </Link>
                </Card>

                {/* Destination: AI Discussion Rooms */}
                <Card className="group hover:shadow-2xl transition-all duration-500 border-slate-100 flex flex-col h-full relative overflow-hidden bg-white/80 backdrop-blur-sm">
                    <div className="absolute top-6 right-6">
                        <span className="bg-purple-100 text-purple-600 text-xs font-black uppercase px-3 py-1 rounded-full border border-purple-200 shadow-sm">Upcoming</span>
                    </div>
                    <div className="mb-6 w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-purple-200">
                        <MessageSquareIcon className="w-9 h-9" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">AI Discussion Rooms</h2>
                    <p className="text-slate-500 mb-8 flex-grow text-lg">Collaborate and discuss topics with AI-powered moderation and insights. A new way to brainstorm.</p>
                    
                    {/* Upcoming Features Filler */}
                    <div className="mb-8 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Expected Release</span>
                            <span className="text-sm font-black text-purple-600">May 2026</span>
                        </div>
                        <div className="h-px bg-purple-100 w-full" />
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-[9px] font-black uppercase px-2 py-1 bg-white text-purple-500 rounded-md border border-purple-100 shadow-sm">AI Moderation</span>
                            <span className="text-[9px] font-black uppercase px-2 py-1 bg-white text-purple-500 rounded-md border border-purple-100 shadow-sm">Real-time Insights</span>
                            <span className="text-[9px] font-black uppercase px-2 py-1 bg-white text-purple-500 rounded-md border border-purple-100 shadow-sm">Smart Summaries</span>
                        </div>
                    </div>

                    <button disabled className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xl cursor-not-allowed border border-slate-200">
                        Coming Soon
                    </button>
                </Card>
            </div>
            
            <div className="mt-16 text-slate-400 text-sm font-medium flex items-center gap-4">
                <span>© 2026 Socrato Labs</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <button onClick={() => setShowReleaseNotes(true)} className="hover:text-gl-orange-500 transition-colors">Release Notes</button>
            </div>
        </div>
    );
};

export default SocratoHomePage;
