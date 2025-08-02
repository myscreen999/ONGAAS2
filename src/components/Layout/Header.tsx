import React from 'react';
import { User, Settings, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onShowAuth: () => void;
  onShowDashboard: () => void;
  onShowAdminPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAuth, onShowDashboard, onShowAdminPanel }) => {
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://i.postimg.cc/nzFw0fRf/5.png" 
              alt="ONG A.A.S" 
              className="h-12 w-auto"
            />
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">ONG A.A.S</h1>
              <p className="text-sm text-gray-600">جمعية مدنية لحماية حقوق المؤمنين</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user && profile ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=3B82F6&color=fff`}
                    alt={profile.full_name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{profile.full_name}</span>
                  {profile.is_verified && (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  )}
                </div>
                
                {profile.is_admin ? (
                  <button
                    onClick={onShowAdminPanel}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>لوحة الإدارة</span>
                  </button>
                ) : (
                  <button
                    onClick={onShowDashboard}
                    className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>لوحة التحكم</span>
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;