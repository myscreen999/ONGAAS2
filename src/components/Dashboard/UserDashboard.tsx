import React, { useState, useEffect } from 'react';
import { X, FileText, Plus, Calendar, Car, Upload, Eye } from 'lucide-react';
import { useAuth, type Claim } from '../../hooks/useAuth';

interface UserDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: any;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ isOpen, onClose, userProfile }) => {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimForm, setClaimForm] = useState({
    accidentDate: '',
    description: '',
    accidentPhoto1: null as File | null,
    accidentPhoto2: null as File | null,
    insuranceReceipt: null as File | null,
    policeReport: null as File | null
  });

  const { getUserClaims, createClaim } = useAuth();

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-blue-600 text-white">
          <h2 className="text-2xl font-bold">لوحة التحكم الشخصية</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* User Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-blue-900">معلومات الحساب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">الاسم الكامل</p>
                <p className="font-semibold text-gray-900">{userProfile?.full_name}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">رقم السيارة</p>
                <p className="font-semibold text-gray-900">{userProfile?.car_number}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                <p className="font-semibold text-gray-900">{userProfile?.phone_number}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">حالة التحقق</p>
                <p className={`font-semibold ${userProfile?.is_verified ? 'text-green-600' : 'text-red-600'}`}>
                  {userProfile?.is_verified ? '✓ محقق' : '✗ غير محقق'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">فترة التأمين</p>
                <p className="font-semibold text-gray-900">
                  {userProfile?.insurance_start_date && userProfile?.insurance_end_date
                    ? `${new Date(userProfile.insurance_start_date).toLocaleDateString('ar-EG')} - ${new Date(userProfile.insurance_end_date).toLocaleDateString('ar-EG')}`
                    : 'غير محدد'
                  }
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 mb-1">تاريخ التسجيل</p>
                <p className="font-semibold text-gray-900">
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                </p>
              </div>
            </div>
          </div>

          {/* Claims Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">مطالباتي ({claims.length})</h3>
              <button
                onClick={() => setShowClaimForm(true)}
                disabled={!userProfile?.is_verified}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4" />
                تقديم مطالبة جديدة
              </button>
            </div>

            {!userProfile?.is_verified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800">
                  <strong>تنبيه:</strong> يجب التحقق من حسابك من قبل الإدارة لتتمكن من تقديم المطالبات.
                  يرجى التواصل مع الإدارة على الرقم: +222 34 14 14 97
                </p>
              </div>
            )}

            {/* Claim Form */}
            {showClaimForm && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
                <h4 className="font-semibold mb-4 text-lg">تقديم مطالبة جديدة</h4>
                <form onSubmit={handleSubmitClaim} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم السيارة
                      </label>
                      <div className="relative">
                        <Car className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={userProfile?.car_number || ''}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        تاريخ الحادث *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          required
                          value={claimForm.accidentDate}
                          onChange={(e) => setClaimForm(prev => ({ ...prev, accidentDate: e.target.value }))}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وصف الحادث *
                    </label>
                    <textarea
                      required
                      value={claimForm.description}
                      onChange={(e) => setClaimForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="اكتب وصفاً مفصلاً للحادث، مكان وقوعه، والأضرار التي لحقت بالسيارة"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        صورة الحادث الأولى (اختياري)
                      </label>
                      <div className="relative">
                        <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('accidentPhoto1', e.target.files?.[0] || null)}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        صورة الحادث الثانية (اختياري)
                      </label>
                      <div className="relative">
                        <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange('accidentPhoto2', e.target.files?.[0] || null)}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        صورة إيصال التأمين *
                      </label>
                      <div className="relative">
                        <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => handleFileChange('insuranceReceipt', e.target.files?.[0] || null)}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        صورة محضر الشرطة *
                      </label>
                      <div className="relative">
                        <Upload className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={(e) => handleFileChange('policeReport', e.target.files?.[0] || null)}
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submittingClaim}
                      className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      {submittingClaim ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          جارٍ التقديم...
                        </>
                      ) : (
                        'تقديم المطالبة'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Claims List */}
            <div className="space-y-4">
              {claims.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">لا توجد مطالبات حالياً</p>
                  {userProfile?.is_verified && (
                    <p className="text-sm text-gray-400 mt-2">يمكنك تقديم مطالبة جديدة باستخدام الزر أعلاه</p>
                  )}
                </div>
              ) : (
                claims.map((claim) => (
                  <div key={claim.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 bg-blue-100 rounded-full p-1 ml-3" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{claim.claim_number}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 ml-1" />
                            تاريخ الحادث: {new Date(claim.accident_date).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="text-sm text-gray-500">
                            تاريخ التقديم: {new Date(claim.created_at).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}>
                          {getStatusText(claim.status)}
                        </span>
                        <div className="flex items-center text-sm text-gray-600">
                          <Eye className="w-4 h-4 ml-1" />
                          {claim.progress}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">وصف الحادث:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded border">{claim.description}</p>
                    </div>

                    {/* Claim Images */}
                    {(claim.accident_photo_1_url || claim.accident_photo_2_url) && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">صور الحادث:</p>
                        <div className="flex gap-2">
                          {claim.accident_photo_1_url && (
                            <img src={claim.accident_photo_1_url} alt="صورة الحادث 1" className="w-24 h-16 object-cover rounded border" />
                          )}
                          {claim.accident_photo_2_url && (
                            <img src={claim.accident_photo_2_url} alt="صورة الحادث 2" className="w-24 h-16 object-cover rounded border" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">تقدم المعالجة</span>
                        <span className="text-sm text-gray-600 font-semibold">{claim.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${claim.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className={claim.progress >= 0 ? 'text-blue-600 font-medium' : ''}>مُقدمة</span>
                      <span className={claim.progress >= 50 ? 'text-blue-600 font-medium' : ''}>قيد المراجعة</span>
                      <span className={claim.progress >= 75 ? 'text-blue-600 font-medium' : ''}>قيد المعالجة</span>
                      <span className={claim.progress >= 100 ? 'text-green-600 font-medium' : ''}>مكتملة</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;