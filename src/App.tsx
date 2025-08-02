import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Hero from './components/Home/Hero';
import Stats from './components/Home/Stats';
import Posts from './components/Home/Posts';
import Claims from './components/Home/Claims';
import AuthModal from './components/Auth/AuthModal';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import { useAuth } from './hooks/useAuth';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const { user, profile } = useAuth();

  const handleShowAuth = (mode?: 'signup') => {
    setShowAuthModal(true);
  };
  const handleCloseAuth = () => setShowAuthModal(false);

  const handleShowDashboard = () => {
    setShowUserDashboard(true);
  };

  const handleShowAdminPanel = () => {
    setShowAdminDashboard(true);
  };

  // Listen for admin dashboard trigger
  React.useEffect(() => {
    const handleOpenAdminDashboard = () => {
      setShowAdminDashboard(true);
    };

    const handleOpenAuthModal = () => {
      setShowAuthModal(true);
    };

    window.addEventListener('openAdminDashboard', handleOpenAdminDashboard);
    window.addEventListener('openAuthModal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('openAdminDashboard', handleOpenAdminDashboard);
      window.removeEventListener('openAuthModal', handleOpenAuthModal);
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header
          onShowAuth={handleShowAuth}
          onShowDashboard={handleShowDashboard}
          onShowAdminPanel={handleShowAdminPanel}
        />
        
        <main>
          <Hero onShowAuth={handleShowAuth} />
          <Stats />
          <Posts />
          <Claims />
        </main>

        <Footer />

        <AuthModal isOpen={showAuthModal} onClose={handleCloseAuth} />
        <AdminDashboard 
          isOpen={showAdminDashboard} 
          onClose={() => setShowAdminDashboard(false)} 
        />
        <UserDashboard 
          isOpen={showUserDashboard} 
          onClose={() => setShowUserDashboard(false)}
          userProfile={profile}
        />
      </div>
    </Router>
  );
}

export default App;