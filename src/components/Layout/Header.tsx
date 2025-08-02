import React from 'react';
import { User, Settings, LogOut, UserCheck, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  onShowAuth: () => void;
  onShowDashboard: () => void;
  onShowAdminPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowAuth, onShowDashboard, onShowAdminPanel }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center animate-slide-right">
            <img 
              src="https://i.postimg.cc/nzFw0fRf/5.png" 
              alt="ONG A.A.S" 
              className="h-14 w-auto"
            />
            <div className="ml-4 hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ONG A.A.S
              </h1>
              <p className="text-sm text-gray-600 font-medium">جمعية مدنية لحماية حقوق المؤمنين</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {user && profile ? (
              <div className="flex items-center space-x-6">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {/* User Info */}
                <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                  <img
                    src={profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=3B82F6&color=fff`}
                    alt={profile.full_name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{profile.full_name}</span>
                      {profile.is_verified && (
                        <UserCheck className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {profile.is_admin ? 'مدير النظام' : 'عضو'}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {profile.is_admin ? (
                  <button
                    onClick={onShowAdminPanel}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>لوحة الإدارة</span>
                  </button>
                ) : (
                  <button
                    onClick={onShowDashboard}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <User className="w-5 h-5" />
                    <span>لوحة التحكم</span>
                  </button>
                )}
                
                <button
                  onClick={handleSignOut}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onShowAuth}
                className="btn-primary flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-slide-up">
            {user && profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                  <img
                    src={profile.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=3B82F6&color=fff`}
                    alt={profile.full_name}
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  />
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{profile.full_name}</span>
                      {profile.is_verified && (
                        <UserCheck className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {profile.is_admin ? 'مدير النظام' : 'عضو'}
                    </span>
                  </div>
                </div>
                
                {profile.is_admin ? (
                  <button
                    onClick={() => {
                      onShowAdminPanel();
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-danger flex items-center justify-center space-x-2"
                  >
                    <Settings className="w-5 h-5" />
                    <span>لوحة الإدارة</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onShowDashboard();
                      setIsMenuOpen(false);
                    }}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <User className="w-5 h-5" />
                    <span>لوحة التحكم</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full btn-secondary flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onShowAuth();
                  setIsMenuOpen(false);
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>
        )}
        </div>
    </header>
  );
};

export default Header;