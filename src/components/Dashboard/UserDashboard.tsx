import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Plus, Calendar, Car, Upload, Eye, User, Phone, Mail, 
  Shield, CheckCircle, AlertCircle, Clock, TrendingUp, Edit, Save, 
  Camera, Download, Bell, Settings, Star, Award, Target, Activity,
  BarChart3, PieChart, LineChart, Zap, Heart, MessageSquare
} from 'lucide-react';
import { useAuth, type Claim } from '../../hooks/useAuth';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose, userProfile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'claims' | 'notifications' | 'settings'>('overview');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'تم قبول مطالبتك',
      message: 'تم قبول مطالبة CLM-2025-001 وهي قيد المعالجة الآن',
      type: 'success',
      time: '2 ساعات',
      read: false
    },
    {
      id: 2,
      title: 'تحديث في النظام',
      message: 'تم إضافة ميزات جديدة لتحسين تجربة المستخدم',
      type: 'info',
      time: '1 يوم',
      read: false
    },
    {
      id: 3,
      title: 'تذكير بانتهاء التأمين',
      message: 'ينتهي تأمين سيارتك خلال 30 يوماً',
      type: 'warning',
      time: '3 أيام',
      read: true
    }
  ]);

  const [profileForm, setProfileForm] = useState({
    fullName: userProfile?.full_name || '',
    phoneNumber: userProfile?.phone_number || '',
    email: userProfile?.email || '',
    insuranceStartDate: userProfile?.insurance_start_date || '',
    insuranceEndDate: userProfile?.insurance_end_date || ''
  });

  const [claimForm, setClaimForm] = useState({
    accidentDate: '',
    description: '',
    accidentPhoto1: null as File | null,
    accidentPhoto2: null as File | null,
    insuranceReceipt: null as File | null,
    policeReport: null as File | null
  });

  const { getUserClaims, createClaim, updateProfile } = useAuth();

  useEffect(() => {
    if (isOpen && userProfile) {
      const userClaims = getUserClaims();
      setClaims(userClaims);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingClaim(true);
    
    if (!userProfile?.is_verified) {
      alert('يجب التحقق من حسابك أولاً لتقديم مطالبة');
      setSubmittingClaim(false);
      return;
    }

    if (!claimForm.accidentDate || !claimForm.description.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      setSubmittingClaim(false);
      return;
    }

    if (!claimForm.insuranceReceipt || !claimForm.policeReport) {
      alert('يرجى رفع صورة إيصال التأمين ومحضر الشرطة');
      setSubmittingClaim(false);
      return;
    }

    try {
      const newClaim = await createClaim({
        accident_date: claimForm.accidentDate,
        description: claimForm.description,
        accident_photo_1: claimForm.accidentPhoto1,
        accident_photo_2: claimForm.accidentPhoto2,
        insurance_receipt: claimForm.insuranceReceipt,
        police_report: claimForm.policeReport
      });

      setClaims(prev => [newClaim, ...prev]);
      
      alert('تم تقديم المطالبة بنجاح! سيتم مراجعتها من قبل الإدارة.');
      setShowClaimForm(false);
      setClaimForm({
        accidentDate: '',
        description: '',
        accidentPhoto1: null,
        accidentPhoto2: null,
        insuranceReceipt: null,
        policeReport: null
      });
    } catch (error) {
      console.error('Error submitting claim:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ في تقديم المطالبة');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleFileChange = (field: string, file: File | null) => {
    setClaimForm(prev => ({ ...prev, [field]: file }));
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        full_name: profileForm.fullName,
        phone_number: profileForm.phoneNumber,
        insurance_start_date: profileForm.insuranceStartDate,
        insurance_end_date: profileForm.insuranceEndDate
      });
      setEditingProfile(false);
      alert('تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      alert('حدث خطأ في تحديث الملف الشخصي');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'submitted': 'مُقدمة',
      'under_review': 'قيد المراجعة',
      'processing': 'قيد المعالجة',
      'completed': 'مكتملة',
      'rejected': 'مرفوضة'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'submitted': 'text-blue-600 bg-blue-100',
      'under_review': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ml-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">لوحة التحكم الشخصية</h2>
                <p className="text-blue-100">مرحباً بك، {userProfile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
              { id: 'profile', label: 'الملف الشخصي', icon: User },
              { id: 'claims', label: 'المطالبات', icon: FileText },
              { id: 'notifications', label: 'الإشعارات', icon: Bell },
              { id: 'settings', label: 'الإعدادات', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600 bg-white'
                    : 'text-gray-600 border-transparent hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">إجمالي المطالبات</p>
                      <p className="text-3xl font-bold">{claims.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">المطالبات المكتملة</p>
                      <p className="text-3xl font-bold">{claims.filter(c => c.status === 'completed').length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm">قيد المعالجة</p>
                      <p className="text-3xl font-bold">{claims.filter(c => c.status === 'processing').length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">معدل النجاح</p>
                      <p className="text-3xl font-bold">96%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Shield className="w-6 h-6 ml-2 text-blue-600" />
                  حالة الحساب
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    {userProfile?.is_verified ? (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
                    )}
                    <span className={userProfile?.is_verified ? 'text-green-700' : 'text-red-700'}>
                      {userProfile?.is_verified ? 'حساب محقق' : 'حساب غير محقق'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-blue-500 ml-2" />
                    <span className="text-gray-700">نشط منذ {new Date(userProfile?.created_at).getFullYear()}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 ml-2" />
                    <span className="text-gray-700">عضو مميز</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Activity className="w-6 h-6 ml-2 text-purple-600" />
                  النشاط الأخير
                </h3>
                <div className="space-y-4">
                  {claims.slice(0, 3).map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-600 ml-3" />
                        <div>
                          <p className="font-medium">{claim.claim_number}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(claim.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">الملف الشخصي</h3>
                  <button
                    onClick={() => setEditingProfile(!editingProfile)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {editingProfile ? 'إلغاء' : 'تعديل'}
                  </button>
                </div>

                {editingProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={profileForm.phoneNumber}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">بداية التأمين</label>
                      <input
                        type="date"
                        value={profileForm.insuranceStartDate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, insuranceStartDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">نهاية التأمين</label>
                      <input
                        type="date"
                        value={profileForm.insuranceEndDate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, insuranceEndDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={handleUpdateProfile}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <User className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">الاسم الكامل</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">{userProfile?.full_name}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Car className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">رقم السيارة</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">{userProfile?.car_number}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Phone className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">رقم الهاتف</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">{userProfile?.phone_number}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Shield className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">حالة التحقق</p>
                      </div>
                      <p className={`font-semibold text-lg ${userProfile?.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                        {userProfile?.is_verified ? '✓ محقق' : '✗ غير محقق'}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">فترة التأمين</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {userProfile?.insurance_start_date && userProfile?.insurance_end_date
                          ? `${new Date(userProfile.insurance_start_date).toLocaleDateString('ar-EG')} - ${new Date(userProfile.insurance_end_date).toLocaleDateString('ar-EG')}`
                          : 'غير محدد'
                        }
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="flex items-center mb-3">
                        <Calendar className="w-5 h-5 text-blue-600 ml-2" />
                        <p className="text-sm text-gray-600">تاريخ التسجيل</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">
                        {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold flex items-center">
                  <FileText className="w-7 h-7 ml-2 text-blue-600" />
                  مطالباتي ({claims.length})
                </h3>
                <button
                  onClick={() => setShowClaimForm(true)}
                  disabled={!userProfile?.is_verified}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  تقديم مطالبة جديدة
                </button>
              </div>

              {!userProfile?.is_verified && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-6 h-6 text-yellow-600 ml-3" />
                    <div>
                      <p className="text-yellow-800 font-medium">
                        <strong>تنبيه:</strong> يجب التحقق من حسابك من قبل الإدارة لتتمكن من تقديم المطالبات.
                      </p>
                      <p className="text-yellow-700 mt-1">
                        يرجى التواصل مع الإدارة على الرقم: +222 34 14 14 97
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Claim Form */}
              {showClaimForm && (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200">
                  <h4 className="font-bold mb-6 text-2xl text-gray-900 flex items-center">
                    <Plus className="w-6 h-6 ml-2 text-blue-600" />
                    تقديم مطالبة جديدة
                  </h4>
                  <form onSubmit={handleSubmitClaim} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رقم السيارة
                        </label>
                        <div className="relative">
                          <Car className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={userProfile?.car_number || ''}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                            readOnly
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تاريخ الحادث *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="date"
                            required
                            value={claimForm.accidentDate}
                            onChange={(e) => setClaimForm(prev => ({ ...prev, accidentDate: e.target.value }))}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الحادث *
                      </label>
                      <textarea
                        required
                        value={claimForm.description}
                        onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="اكتب وصفاً مفصلاً للحادث، مكان وقوعه، والأضرار التي لحقت بالسيارة"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صورة الحادث الأولى (اختياري)
                        </label>
                        <div className="relative">
                          <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('accidentPhoto1', e.target.files?.[0] || null)}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صورة الحادث الثانية (اختياري)
                        </label>
                        <div className="relative">
                          <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('accidentPhoto2', e.target.files?.[0] || null)}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صورة إيصال التأمين *
                        </label>
                        <div className="relative">
                          <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => handleFileChange('insuranceReceipt', e.target.files?.[0] || null)}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          صورة محضر الشرطة *
                        </label>
                        <div className="relative">
                          <Upload className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={(e) => handleFileChange('policeReport', e.target.files?.[0] || null)}
                            className="w-full pr-10 pl-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        type="submit"
                        disabled={submittingClaim}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
                      >
                        <FileText className="w-5 h-5" />
                        {submittingClaim ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            جارٍ التقديم...
                          </>
                        ) : (
                          'تقديم المطالبة'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClaimForm(false)}
                        className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Claims List */}
              <div className="space-y-6">
                {claims.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                    <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">لا توجد مطالبات حالياً</h3>
                    <p className="text-gray-500 text-lg mb-6">لم تقم بتقديم أي مطالبات بعد</p>
                    {userProfile?.is_verified && (
                      <button
                        onClick={() => setShowClaimForm(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        تقديم مطالبة جديدة
                      </button>
                    )}
                  </div>
                ) : (
                  claims.map((claim) => (
                    <div key={claim.id} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ml-4">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-xl mb-1">{claim.claim_number}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                تاريخ الحادث: {new Date(claim.accident_date).toLocaleDateString('ar-EG')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                تاريخ التقديم: {new Date(claim.created_at).toLocaleDateString('ar-EG')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                            {getStatusText(claim.status)}
                          </span>
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                            <div className="flex items-center text-sm font-bold text-blue-800">
                              <TrendingUp className="w-4 h-4 ml-1" />
                              {claim.progress}%
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <p className="text-lg font-bold text-gray-700 mb-3">وصف الحادث:</p>
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <p className="text-gray-700 leading-relaxed">{claim.description}</p>
                        </div>
                      </div>

                      {/* Claim Images */}
                      {(claim.accident_photo_1_url || claim.accident_photo_2_url) && (
                        <div className="mb-6">
                          <p className="text-lg font-bold text-gray-700 mb-3">صور الحادث:</p>
                          <div className="flex gap-4">
                            {claim.accident_photo_1_url && (
                              <img src={claim.accident_photo_1_url} alt="صورة الحادث 1" className="w-32 h-24 object-cover rounded-lg border shadow-sm" />
                            )}
                            {claim.accident_photo_2_url && (
                              <img src={claim.accident_photo_2_url} alt="صورة الحادث 2" className="w-32 h-24 object-cover rounded-lg border shadow-sm" />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-gray-700">تقدم المعالجة</span>
                          <span className="text-lg font-bold text-blue-600">{claim.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${claim.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Steps */}
                      <div className="grid grid-cols-4 gap-4">
                        <div className={`text-center p-4 rounded-lg transition-all duration-300 ${claim.progress >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                          <Clock className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">مُقدمة</span>
                        </div>
                        <div className={`text-center p-4 rounded-lg transition-all duration-300 ${claim.progress >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                          <Eye className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">قيد المراجعة</span>
                        </div>
                        <div className={`text-center p-4 rounded-lg transition-all duration-300 ${claim.progress >= 75 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'}`}>
                          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">قيد المعالجة</span>
                        </div>
                        <div className={`text-center p-4 rounded-lg transition-all duration-300 ${claim.progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                          <span className="text-sm font-medium">مكتملة</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold flex items-center">
                <Bell className="w-7 h-7 ml-2 text-purple-600" />
                الإشعارات ({notifications.length})
              </h3>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-blue-50 border-blue-200 shadow-md'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full ml-4 ${
                          notification.type === 'success' ? 'bg-green-100 text-green-600' :
                          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                           notification.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                           <Bell className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{notification.title}</h4>
                          <p className="text-gray-700 mb-2">{notification.message}</p>
                          <p className="text-sm text-gray-500">منذ {notification.time}</p>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center">
                <Settings className="w-7 h-7 ml-2 text-gray-600" />
                الإعدادات
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Bell className="w-5 h-5 ml-2 text-blue-600" />
                    إعدادات الإشعارات
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">إشعارات البريد الإلكتروني</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">إشعارات الرسائل النصية</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">إشعارات تحديث المطالبات</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </label>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Shield className="w-5 h-5 ml-2 text-green-600" />
                    الأمان والخصوصية
                  </h4>
                  <div className="space-y-4">
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تغيير كلمة المرور
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تفعيل المصادقة الثنائية
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تنزيل بياناتي
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Download className="w-5 h-5 ml-2 text-purple-600" />
                    التقارير والملفات
                  </h4>
                  <div className="space-y-4">
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تنزيل تقرير المطالبات
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تنزيل الملف الشخصي
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تنزيل سجل النشاط
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  <h4 className="text-xl font-bold mb-4 flex items-center">
                    <Heart className="w-5 h-5 ml-2 text-red-600" />
                    الدعم والمساعدة
                  </h4>
                  <div className="space-y-4">
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      مركز المساعدة
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      التواصل مع الدعم
                    </button>
                    <button className="w-full text-right p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      تقييم التطبيق
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;