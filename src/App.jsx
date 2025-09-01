import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import AssetPage from './pages/AssetPage';
import PortfolioPage from './pages/PortfolioPage';
import HistoryPage from './pages/HistoryPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import Modal from './pages/Modal';
import { listenUserDoc, setWelcomed, ensureUserDoc, airdropIfDue } from './store/storage';
import AboutPage from './pages/AboutPage';
import UserProfile from './pages/UserProfile';
import LeaderboardPage from "./pages/LeaderboardPage";

function AuthControls() {
  const { user } = useAuth();
  if (user) {
    return <button className="btn btn-outline-light" onClick={() => signOut(auth)}>Sign out</button>;
  }
  return (
    <>
      <Link className="btn btn-outline-light me-2" to="/login">Login</Link>
      <Link className="btn btn-outline-light" to="/register">Register</Link>
    </>
  );
}

function WelcomeWatcher() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAirdropModal, setShowAirdropModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    let unsub = () => {};

    (async () => {
      await ensureUserDoc(user.uid);

      unsub = listenUserDoc(user.uid, (data) => {
        if (data?.welcomed === false) setShowWelcome(true);
      });

      const res = await airdropIfDue(user.uid);
      if (res?.amount) setShowAirdropModal({ amount: res.amount });
    })();

    return () => unsub();
  }, [user]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    await setWelcomed(auth.currentUser.uid);
  };

  const handleCloseAirdrop = () => setShowAirdropModal(null);

  return (
    <>
      {showWelcome && (
        <Modal
          title="Welcome!"
          onClose={handleCloseWelcome}
          okText="Start"
          onOk={handleCloseWelcome}
        >
          You received $10,000 as a starting balance. Good luck with your trading!
        </Modal>
      )}
      {showAirdropModal && (
        <Modal
          title="Начисление средств"
          onClose={handleCloseAirdrop}
          okText="Ок"
          onOk={handleCloseAirdrop}
        >
          На ваш баланс зачислено +${showAirdropModal.amount}. Успешного трейдинга!
        </Modal>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WelcomeWatcher />
      <div className="app">
        <div className="min-vh-100 d-flex flex-column">
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
            <div className="container">
              <Link className="navbar-brand fw-bold brand" to="/">💹 <span>Trading Simulator 0.1</span></Link>
              <div className="collapse navbar-collapse" id="nav">
                <ul className="navbar-nav me-auto">
                  <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/portfolio">Portfolio</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/history">History</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/leaderboard">Leaderboard</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                  <li className="nav-item"><Link className="nav-link" to="/user-profile">User Profile</Link></li>
                </ul>
                <AuthControls />
              </div>
            </div>
          </nav>

          <main className="container flex-grow-1 py-3">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginRoute><LoginPage /></LoginRoute>} />
              <Route path="/register" element={<LoginRoute><RegisterPage /></LoginRoute>} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />

              {/* Protected routes */}
              <Route path="/asset/:id" element={<RequireAuth><AssetPage /></RequireAuth>} />
              <Route path="/portfolio" element={<RequireAuth><PortfolioPage /></RequireAuth>} />
              <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
              <Route path="/user-profile" element={<RequireAuth><UserProfile /></RequireAuth>} />
              <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />

              {/* Redirect for unknown routes */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>

          <footer>© {new Date().getFullYear()} Trading Simulator 0.1</footer>
        </div>
      </div>
    </AuthProvider>
  );
}

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="container py-5 text-center">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function LoginRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="container py-5 text-center">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}


