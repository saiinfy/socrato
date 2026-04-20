import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import Card from '../components/Card';
import { ReleaseNotesModal, RELEASE_NOTES_KEY } from '../components/ReleaseNotesModal';
import { GiftIcon } from '../icons/GiftIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { WandIcon } from '../icons/WandIcon';
import { MessageSquareIcon } from '../icons/MessageSquareIcon';
import { useUser } from '../utils/UserContext';
import { ProfileSection } from '../components/ProfileSection';


const QuizumiHomePage = () => {
    const { uuid, isAuthorized, name, updateProfile } = useUser();
    const navigate = useNavigate();
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [tempName, setTempName] = useState('');
    const [isSettingName, setIsSettingName] = useState(false);

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
                        <span className="text-white text-xl font-black">Q</span>
                    </div>
                    <span className="px-4 text-slate-800 font-bold tracking-tight uppercase">Quizumi</span>
                </div>

                <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 mb-4 leading-tight">
                    {name ? (
                        <>Ready to play, <span className="text-gl-orange-600">{name}</span>?</>
                    ) : (
                        <>Welcome to <span className="text-gl-orange-600">Quizumi</span></>
                    )}
                </h1>
                
                <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
                    The ultimate real-time trivia experience. Join a room or host your own.
                </p>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 z-10">
                {/* Name Setting Flow - Only for organizers (users with token/uuid) */}
                {!name && uuid && (
                    <Card className="md:col-span-2 bg-gradient-to-br from-gl-orange-500 to-gl-orange-600 border-none text-white p-8 shadow-2xl transform hover:scale-[1.01] transition-all duration-300">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-grow text-center md:text-left">
                                <h2 className="text-3xl font-black mb-2">Wait, we haven't met!</h2>
                                <p className="text-gl-orange-50 opacity-90 text-lg">Set your display name to start your journey and track your progress.</p>
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

                {/* Main Actions */}
                <Card className="group hover:shadow-2xl transition-all duration-500 border-slate-100 flex flex-col h-full">
                    <div className="mb-6 w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Join a Quiz</h2>
                    <p className="text-slate-500 mb-8 flex-grow">Enter a room code and compete against others in real-time. Show them what you've got!</p>
                    <Link to="/join" className="w-full">
                        <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-lg hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 group-hover:translate-y-[-2px]">
                            Join Now
                        </button>
                    </Link>
                </Card>

                <Card className="group hover:shadow-2xl transition-all duration-500 border-slate-100 flex flex-col h-full">
                    <div className="mb-6 w-14 h-14 bg-gl-orange-100 text-gl-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <WandIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Host a Quiz</h2>
                    <p className="text-slate-500 mb-8 flex-grow">Create your own quiz or use AI to generate questions. Perfect for parties, classrooms, or teams.</p>
                    {isAuthorized ? (
                        <Link to="/create" className="w-full">
                            <button className="w-full py-4 bg-gl-orange-600 text-white rounded-xl font-black text-lg hover:bg-gl-orange-700 transition-all shadow-lg flex items-center justify-center gap-2 group-hover:translate-y-[-2px]">
                                Create Quiz
                            </button>
                        </Link>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Organizer Access Required</p>
                        </div>
                    )}
                </Card>
            </div>
            
            <div className="mt-16 text-slate-400 text-sm font-medium flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <span>© 2026 Socrato Labs</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <button onClick={() => setShowReleaseNotes(true)} className="hover:text-gl-orange-500 transition-colors">Release Notes</button>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${!isAuthorized ? 'bg-gl-orange-50 border border-gl-orange-100 animate-pulse' : ''}`}>
                    {!isAuthorized && <span className="text-gl-orange-500 text-[10px] font-black uppercase tracking-wider">New</span>}
                    <a 
                        href="https://globallogic.atlassian.net/servicedesk/customer/portal/30/group/344/create/1533" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`font-bold transition-colors ${!isAuthorized ? 'text-gl-orange-600 hover:text-gl-orange-700' : 'hover:text-gl-orange-500'}`}
                    >
                        Request Organizer Access
                    </a>
                </div>
            </div>
        </div>
    );
};

export default QuizumiHomePage;