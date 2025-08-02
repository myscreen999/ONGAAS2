import React, { useState } from 'react';
import { X, User, Shield, Car, Phone, Calendar, Upload } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithCarNumber, signInAdmin, signUp } = useAuth();

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setIsAdminLogin(false);
      setError('');
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [loginData, setLoginData] = useState({
    carNumber: '',
    password: '',
    adminEmail: '',
    adminPassword: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    carNumber: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    insuranceStartDate: '',
    insuranceEndDate: ''
  });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isAdminLogin) {
        if (loginData.adminEmail !== 'myscreen999@gmail.com' || loginData.adminPassword !== 'myscreen999') {
          throw new Error('بيانات الإدارة غير صحيحة');
        }
        result = await signInAdmin(loginData.adminEmail, loginData.adminPassword);
      } else {
        result = await signInWithCarNumber(loginData.carNumber, loginData.password);
      }
      onClose();
      
      // Trigger admin dashboard if admin login
      if (result?.isAdmin) {
        // Use a small delay to ensure modal closes first
        setTimeout(() => {
          const event = new CustomEvent('openAdminDashboard');
          window.dispatchEvent(event);
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    try {
      await signUp({
        fullName: signupData.fullName,
        carNumber: signupData.carNumber,
        phoneNumber: signupData.phoneNumber,
        email: signupData.email,
        password: signupData.password,
        insuranceStartDate: signupData.insuranceStartDate,
        insuranceEndDate: signupData.insuranceEndDate
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSignUp ? 'إنشاء حساب جديد' : (isAdminLogin ? 'دخول الإدارة' : 'تسجيل الدخول')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isSignUp ? (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم السيارة
                </label>
                <div className="relative">
                  <Car className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 1234ABC"
                    value={signupData.carNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, carNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+222 12 34 56 78"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    بداية التأمين
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={signupData.insuranceStartDate}
                      onChange={(e) => setSignupData(prev => ({ ...prev, insuranceStartDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نهاية التأمين
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      required
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={signupData.insuranceEndDate}
                      onChange={(e) => setSignupData(prev => ({ ...prev, insuranceEndDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل كلمة المرور"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تأكيد كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أعد إدخال كلمة المرور"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء حساب'}
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              {isAdminLogin ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="البريد الإلكتروني للإدارة"
                      value={loginData.adminEmail}
                      onChange={(e) => setLoginData(prev => ({ ...prev, adminEmail: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="كلمة مرور الإدارة"
                      value={loginData.adminPassword}
                      onChange={(e) => setLoginData(prev => ({ ...prev, adminPassword: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم السيارة
                    </label>
                    <div className="relative">
                      <Car className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="أدخل رقم سيارتك"
                        value={loginData.carNumber}
                        onChange={(e) => setLoginData(prev => ({ ...prev, carNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="أدخل كلمة المرور"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          )}

          {/* Switch between forms */}
          <div className="mt-6 text-center space-y-2">
            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <Shield className="w-4 h-4 ml-1" />
                  {isAdminLogin ? 'دخول المستخدمين' : 'دخول الإدارة'}
                </button>
              </div>
            )}
            
            <div className="pt-4 border-t">
              {isSignUp ? (
                <p className="text-sm text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    إنشاء حساب جديد
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;