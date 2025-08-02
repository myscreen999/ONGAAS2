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
  const { user, profile, loading, connectionError } = useAuth();

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

  // Show connection error if exists
  if (connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">خطأ في الاتصال</h1>
          <p className="text-gray-600 mb-6">{connectionError}</p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة المحاولة
            </button>
            <p className="text-sm text-gray-500">
              تأكد من اتصال الإنترنت وإعدادات قاعدة البيانات
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center" style={{minHeight: '100vh'}}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6" style={{animationDuration: '1s'}}></div>
            <div className="absolute inset-0 rounded-full bg-blue-100 opacity-20 animate-pulse"></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
            <img 
              src="https://i.postimg.cc/nzFw0fRf/5.png" 
              alt="ONG A.A.S" 
              className="h-12 w-auto mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className="text-xl font-bold text-gray-800 mb-2">ONG A.A.S</h2>
            <p className="text-gray-600">جارٍ تحميل النظام...</p>
            <div className="mt-4">
              <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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