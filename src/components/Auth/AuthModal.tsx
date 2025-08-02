import React, { useState } from 'react';
import { X, User, Shield, Car, Phone, Calendar, Upload, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
    password: '',
    confirmPassword: '',
    insuranceStartDate: '',
    insuranceEndDate: '',
    profilePicture: null as File | null,
    driversLicense: null as File | null
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
        password: signupData.password,
        insuranceStartDate: signupData.insuranceStartDate,
        insuranceEndDate: signupData.insuranceEndDate,
        profilePicture: signupData.profilePicture,
        driversLicense: signupData.driversLicense
      });
      
      // Show success message
      alert('تم إنشاء الحساب بنجاح! مرحباً بك في ONG A.A.S');
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ في إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field: 'profilePicture' | 'driversLicense', file: File | null) => {
    setSignupData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-modern max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-scale">
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'إنشاء حساب جديد' : (isAdminLogin ? 'دخول الإدارة' : 'تسجيل الدخول')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="notification-error mb-6 animate-slide-up">
              <X className="w-5 h-5" />
              {error}
            </div>
          )}

          {isSignUp ? (
            /* Sign Up Form */
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <div className="relative">
                  <User className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="form-input-modern pr-12"
                    placeholder="أدخل اسمك الكامل"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم السيارة
                </label>
                <div className="relative">
                  <Car className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="form-input-modern pr-12"
                    placeholder="مثال: 1234ABC"
                    value={signupData.carNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, carNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <Phone className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    className="form-input-modern pr-12"
                    placeholder="+222 12 34 56 78"
                    value={signupData.phoneNumber}
                    onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  الصورة الشخصية *
                </label>
                <div className="relative">
                  <Upload className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="form-input-modern pr-12"
                    onChange={(e) => handleFileChange('profilePicture', e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">صورة واضحة للوجه (مطلوبة)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  صورة رخصة السياقة *
                </label>
                <div className="relative">
                  <Upload className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="form-input-modern pr-12"
                    onChange={(e) => handleFileChange('driversLicense', e.target.files?.[0] || null)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">صورة واضحة لرخصة السياقة (مطلوبة)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    بداية التأمين
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      className="form-input-modern pr-12"
                      value={signupData.insuranceStartDate}
                      onChange={(e) => setSignupData(prev => ({ ...prev, insuranceStartDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    نهاية التأمين
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      className="form-input-modern pr-12"
                      value={signupData.insuranceEndDate}
                      onChange={(e) => setSignupData(prev => ({ ...prev, insuranceEndDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input-modern pr-12 pl-12"
                    placeholder="أدخل كلمة المرور"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="form-input-modern pr-12 pl-12"
                    placeholder="أعد إدخال كلمة المرور"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner-modern h-5 w-5"></div>
                    جارٍ إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    إنشاء حساب
                  </>
                )}
              </button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 rounded-full p-1 ml-3 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">ملاحظة مهمة:</p>
                    <p className="text-sm text-blue-700">
                      سيتم مراجعة حسابك من قبل الإدارة قبل تفعيله. تأكد من رفع صور واضحة وصحيحة.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-6">
              {isAdminLogin ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        className="form-input-modern pr-12"
                        placeholder="myscreen999@gmail.com"
                        value={loginData.adminEmail}
                        onChange={(e) => setLoginData(prev => ({ ...prev, adminEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="form-input-modern pr-12 pl-12"
                        placeholder="myscreen999"
                        value={loginData.adminPassword}
                        onChange={(e) => setLoginData(prev => ({ ...prev, adminPassword: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      رقم السيارة
                    </label>
                    <div className="relative">
                      <Car className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        className="form-input-modern pr-12"
                        placeholder="أدخل رقم سيارتك"
                        value={loginData.carNumber}
                        onChange={(e) => setLoginData(prev => ({ ...prev, carNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="form-input-modern pr-12 pl-12"
                        placeholder="أدخل كلمة المرور"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="spinner-modern h-5 w-5"></div>
                    جارٍ تسجيل الدخول...
                  </>
                ) : (
                  <>
                    {isAdminLogin ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    تسجيل الدخول
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch between forms */}
          <div className="mt-8 text-center space-y-4">
            {!isSignUp && (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {isAdminLogin ? 'دخول المستخدمين' : 'دخول الإدارة'}
                </button>
              </div>
            )}
            
            <div className="pt-6 border-t border-gray-200">
              {isSignUp ? (
                <p className="text-gray-600">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-600 hover:text-blue-700 font-bold underline"
                  >
                    تسجيل الدخول
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  ليس لديك حساب؟{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-600 hover:text-blue-700 font-bold underline"
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