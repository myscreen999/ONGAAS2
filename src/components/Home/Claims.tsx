import React, { useEffect, useState } from 'react';
import { FileText, Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Claim } from '../../hooks/useAuth';

const Claims: React.FC = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const { getAllClaims } = useAuth();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const claimsData = getAllClaims();
      // Show only the latest 5 claims for homepage
      setClaims(claimsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
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
      'submitted': 'status-submitted',
      'under_review': 'status-review',
      'processing': 'status-processing',
      'completed': 'status-completed',
      'rejected': 'status-rejected'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'submitted': <Clock className="w-4 h-4" />,
      'under_review': <Eye className="w-4 h-4" />,
      'processing': <TrendingUp className="w-4 h-4" />,
      'completed': <CheckCircle className="w-4 h-4" />,
      'rejected': <XCircle className="w-4 h-4" />
    };
    return iconMap[status] || <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="spinner-modern h-16 w-16 mx-auto mb-4"></div>
            <p className="text-xl text-gray-600">جارٍ تحميل المطالبات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-24 h-24 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            نظام المطالبات
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">تتبع المطالبات</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">آخر المطالبات المقدمة وحالة تقدمها مع نظام تتبع متطور</p>
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-16">
            <div className="card-modern p-12">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">لا توجد مطالبات حالياً</h3>
              <p className="text-gray-500 text-lg">سيتم عرض المطالبات المقدمة هنا مع إمكانية تتبع حالتها</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {claims.map((claim, index) => (
              <div key={claim.id} className="card-modern p-8 animate-slide-up" style={{animationDelay: `${index * 0.2}s`}}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ml-4">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-xl mb-1">{claim.claim_number}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          تاريخ التقديم: {new Date(claim.created_at).toLocaleDateString('ar-EG')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(claim.created_at).toLocaleTimeString('ar-EG', {hour: '2-digit', minute: '2-digit'})}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`status-badge ${getStatusColor(claim.status)}`}>
                      {getStatusIcon(claim.status)}
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

                {/* Claim Description */}
                <div className="mb-6">
                  <p className="text-lg font-bold text-gray-700 mb-3">وصف الحادث:</p>
                  <div className="card-glass p-6">
                    <p className="text-gray-700 leading-relaxed text-lg">{claim.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-gray-700">تقدم المعالجة</span>
                    <span className="text-lg font-bold text-blue-600">{claim.progress}%</span>
                  </div>
                  <div className="progress-bar-modern">
                    <div
                      className="progress-fill-modern"
                      style={{ width: `${claim.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-4">
                  <div className={`text-center p-3 rounded-lg transition-all duration-300 ${claim.progress >= 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">مُقدمة</span>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-all duration-300 ${claim.progress >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-500'}`}>
                    <Eye className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">قيد المراجعة</span>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-all duration-300 ${claim.progress >= 75 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'}`}>
                    <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">قيد المعالجة</span>
                  </div>
                  <div className={`text-center p-3 rounded-lg transition-all duration-300 ${claim.progress >= 100 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">مكتملة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Call to action */}
        {claims.length > 0 && (
          <div className="text-center mt-12 animate-slide-up" style={{animationDelay: '1s'}}>
            <div className="card-glass p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">هل تحتاج لتقديم مطالبة جديدة؟</h3>
              <p className="text-gray-600 mb-6">يمكنك تقديم مطالبة جديدة من خلال لوحة التحكم الشخصية</p>
              <button 
                onClick={() => {
                  const event = new CustomEvent('openAuthModal');
                  window.dispatchEvent(event);
                }}
                className="btn-primary"
              >
                <FileText className="w-5 h-5 inline ml-2" />
                تقديم مطالبة جديدة
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Claims;