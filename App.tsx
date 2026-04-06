import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { UserProvider, useUser } from './src/utils/UserContext';
import { ChevronLeftIcon, ChevronRightIcon } from './src/icons/NavigationIcons';

import HomePage from './src/pages/SocratoHomePage';
import QuizumiHomePage from './src/pages/QuizumiHomePage';
import CreateQuizPage from './src/pages/CreateQuizPage';
import JoinQuizPage from './src/pages/JoinQuizPage';
import LobbyPage from './src/pages/LobbyPage';
import PlayerLobby from './src/pages/PlayerLobby';
import QuizHostPage from './src/pages/QuizHostPage';
import QuizPlayerPage from './src/pages/QuizPlayerPage';
import LeaderboardPage from './src/pages/LeaderboardPage';
import PerformanceReportPage from './src/pages/PerformanceReportPage';

const AppContent = () => {
  const location = useLocation();
  const { uuid, roles, exp, isAuthorized, setUserData, logout } = useUser();
  const [tokenReceived, setTokenReceived] = useState(!!uuid);
  const [timerExpired, setTimerExpired] = useState(false);

  useEffect(() => {
    // Start 10s timer if token not already received
    if (!tokenReceived) {
      const timer = setTimeout(() => {
        setTimerExpired(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [tokenReceived]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      const token = data.token || data.value || data.data?.token || (typeof data === 'string' ? data : null);
      
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const platform = decoded.platform || {};
          const extractedUuid = platform['x-muse-uuid'];
          const extractedRolesStr = platform['x-muse-roles'] || '';
          const extractedRoles = extractedRolesStr.split(',').map((r: string) => r.trim());
          const extractedExp = decoded.exp;

          if (extractedUuid) {
            // Verify token with backend
            fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token })
            })
            .then(res => res.json())
            .then(data => {
              if (data.status === 'authorized') {
                setUserData(extractedUuid, extractedRoles, extractedExp);
                setTokenReceived(true);
                setTimerExpired(false);
              } else {
                console.error('Backend authorization failed:', data.error);
              }
            })
            .catch(err => console.error('Error verifying token with backend:', err));
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // 1. Send ONLY 'ready' signal initially
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'ready' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setUserData]);

  // Token refresh logic based on exp
  useEffect(() => {
    if (!exp) return;

    const checkTokenExpiry = () => {
      const currentTime = Math.floor(Date.now() / 1000);
      // If expired or about to expire in 10 seconds
      if (currentTime >= exp - 10) {
        if (window.parent !== window) {
          console.log("Token expired or expiring soon, sending 'token_request'...");
          window.parent.postMessage({ type: 'token_request' }, '*');
        }
      }
    };

    const interval = setInterval(checkTokenExpiry, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [exp]);

  const isPlayerRoute = location.pathname.startsWith('/join') || 
                        location.pathname.startsWith('/quiz/player') || 
                        location.pathname.startsWith('/player-lobby');

  // If it's not a player route and we are in an iframe, wait for token
  const showLoading = !isPlayerRoute && window.parent !== window && !tokenReceived && !timerExpired;

  if (showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8 text-center">
        <div className="max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 italic serif">Authorizing Access...</h2>
          <p className="text-slate-400 text-sm">Please wait while we verify your credentials with GlobalLogic.</p>
        </div>
      </div>
    );
  }

  if (!isPlayerRoute && window.parent !== window && timerExpired && !tokenReceived) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-8 text-center">
        <div className="max-w-md">
          <div className="text-orange-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2 italic serif">Authorization Timeout</h2>
          <p className="text-slate-400 text-sm mb-6">We couldn't verify your session. Please ensure you are logged into the GlobalLogic platform.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-full text-sm font-medium transition-colors"
          >
            Retry Authorization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="background-shapes"></div>
      
      {/* Global Navigation - Only for organizers */}
      {isAuthorized && (
        <div className="fixed top-4 left-4 z-50 flex items-center space-x-2">
          <button 
            onClick={() => window.history.back()}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-gl-orange-500 hover:bg-white transition-all"
            title="Go Back"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => window.history.forward()}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-gl-orange-500 hover:bg-white transition-all"
            title="Go Forward"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      <main className="flex-grow flex flex-col relative">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quizumi" element={<QuizumiHomePage />} />
          <Route path="/create" element={<CreateQuizPage />} />
          <Route path="/join" element={<JoinQuizPage />} />
          <Route path="/join/:quizId" element={<JoinQuizPage />} />
          <Route path="/lobby/:quizId" element={<LobbyPage />} />
          <Route path="/player-lobby/:quizId" element={<PlayerLobby />} />
          <Route path="/quiz/host/:quizId" element={<QuizHostPage />} />
          <Route path="/quiz/player/:quizId/:playerId" element={<QuizPlayerPage />} />
          <Route path="/leaderboard/:quizId" element={<LeaderboardPage />} />
          <Route path="/report/:quizId" element={<PerformanceReportPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </UserProvider>
  );
};

export default App;